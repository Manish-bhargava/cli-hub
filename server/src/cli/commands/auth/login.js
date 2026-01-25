import { cancel, confirm, intro, isCancel, outro } from "@clack/prompts";
import { createAuthClient } from "better-auth/client";
import { deviceAuthorizationClient } from "better-auth/client/plugins";
import chalk from "chalk";
import { Command } from "commander";
import fs from "fs/promises";
import open from "open";
import os from "os";
import path from "path";
import yoctoSpinner from "yocto-spinner";
import dotenv from "dotenv";
import { getStoredToken, isTokenExpired, storeToken, clearStoredToken } from "../../../lib/token.js";
import prisma from "../../../lib/db.js";

dotenv.config();

// Configuration
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3005";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CONFIG_DIR = path.join(os.homedir(), ".better-auth");
export const TOKEN_FILE = path.join(CONFIG_DIR, "token.json");

export async function loginAction(opts) {
    const serverUrl = opts.serverUrl || BACKEND_URL;
    const clientId = opts.clientId || CLIENT_ID;
    
    intro(chalk.bold.cyan(" Orbitals CLI Auth "));
    
    // 1. Check existing session
    const existingToken = await getStoredToken();
    const expired = await isTokenExpired();
    
    if (existingToken && !expired) {
        const shouldReAuth = await confirm({
            message: "You are already logged in. Do you want to login again?",
            initialValue: false
        });
        
        if (isCancel(shouldReAuth) || !shouldReAuth) {
            cancel("Login aborted.");
            process.exit(0);
        }
    }
    
    // 2. Initialize Auth Client
    const authClient = createAuthClient({
        baseURL: serverUrl,
        plugins: [deviceAuthorizationClient()]
    });
    
    const spinner = yoctoSpinner({ text: "Connecting to auth server..." });
    spinner.start();
    
    try {
        const { data, error } = await authClient.device.code({
            client_id: clientId,
            scope: "openid email profile"
        });
        
        spinner.stop();
        
        if (error || !data) {
            console.error(chalk.red(`\nAuth Error: ${error?.message || 'Check your BACKEND_URL and CLIENT_ID'}`));
            process.exit(1);
        }
        
        const { device_code, user_code, verification_uri, expires_in, interval = 5 } = data;
        
        // Use the backend redirect route we created in index.js
        const approvalLink = `${serverUrl}/approve?user_code=${user_code}`;

        console.log(`\n${chalk.cyan("Device Authorization Required")}`);
        console.log(`Step 1: Open: ${chalk.underline.blue(approvalLink)}`);
        console.log(`Step 2: Verify code matches: ${chalk.bold.green(user_code)}\n`);
        
        const shouldOpen = await confirm({
            message: "Would you like to open the browser automatically?",
            initialValue: true
        });
        
        if (!isCancel(shouldOpen) && shouldOpen) {
            await open(approvalLink);
        }
        
        console.log(chalk.gray(`Waiting for authorization (expires in ${Math.floor(expires_in / 60)}m)...`));
        
        // 3. Start Polling
        const tokenData = await pollForToken(authClient, device_code, clientId, interval);
        
        if (tokenData?.access_token) {
            // Save the token - ensure storeToken handles the structure correctly
            const saved = await storeToken(tokenData);
            
            if (!saved) {
                console.log(chalk.yellow("\nWarning: Could not save token to disk."));
            }
            
            outro(chalk.green("Login successful!"));
            console.log(chalk.dim(`Session stored in: ${TOKEN_FILE}\n`));
        }
    } catch (err) {
        spinner.stop();
        console.error(chalk.red(`\nError: ${err.message}`));
        process.exit(1);
    }
}

async function pollForToken(authClient, deviceCode, clientId, initialInterval) {
    let pollingInterval = initialInterval;
    const spinner = yoctoSpinner({ text: "" });
    let dots = 0;
    
    return new Promise((resolve, reject) => {
        const poll = async () => {
            dots = (dots + 1) % 4;
            spinner.text = chalk.gray(`Polling for approval${".".repeat(dots + 1)}`);
            if (!spinner.isSpinning) spinner.start();
            
            try {
                const { data, error } = await authClient.device.token({
                    grant_type: "urn:ietf:params:oauth:grant-type:device_code",
                    device_code: deviceCode,
                    client_id: clientId
                });
                
                if (data && data.access_token) {
                    spinner.stop();
                    resolve(data);
                    return;
                }
                
                if (error) {
                    if (error.error === "authorization_pending") {
                        // Keep polling
                    } else if (error.error === "slow_down") {
                        pollingInterval += 5;
                    } else {
                        spinner.stop();
                        reject(new Error(error.error_description || error.error));
                        return;
                    }
                }
            } catch (e) {
                spinner.stop();
                reject(e);
                return;
            }
            setTimeout(poll, pollingInterval * 1000);
        };
        setTimeout(poll, pollingInterval * 1000);
    });
}

export async function whoamiAction() {
    try {
        const token = await getStoredToken();
        
        // Note: Check for either access_token or accessToken based on your storeToken implementation
        const activeToken = token?.access_token || token?.accessToken;

        if (!activeToken || await isTokenExpired()) {
            console.log(chalk.red("Active session not found. Please run: orbitals login"));
            process.exit(1);
        }
        
        const user = await prisma.user.findFirst({
            where: {
                sessions: { some: { token: activeToken } }
            },
            select: { name: true, email: true, id: true }
        });
        
        if (!user) {
            console.log(chalk.red("Session valid but user not found in database."));
            process.exit(1);
        }
        
        console.log(chalk.cyan(`\nLogged in as:`));
        console.log(`${chalk.bold("Name:")}  ${user.name}`);
        console.log(`${chalk.bold("Email:")} ${user.email}`);
        console.log(`${chalk.bold("ID:")}    ${user.id}\n`);
    } catch (error) {
        console.error(chalk.red("Error:"), error.message);
    }
}

export const login = new Command("login")
    .description("Login to Orbitals via GitHub")
    .option("--server-url <url>", "Auth server URL", BACKEND_URL)
    .action(loginAction);

export const whoami = new Command("whoami")
    .description("Check current user status")
    .action(whoamiAction);

export const logout = new Command("logout")
    .description("Clear local session")
    .action(async () => {
        await clearStoredToken();
        console.log(chalk.green("Logged out successfully."));
    });
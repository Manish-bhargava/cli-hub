import {cancel, confirm, intro, isCancel, outro} from "@clack/prompts";
import {createAuthClient} from "better-auth/client";
import { deviceAuthorizationClient } from "better-auth/client/plugins";
import chalk from "chalk";
import { Command } from "commander";
import fs from "fs/promises";
import open from "open";
import os from "os";
import path from "path";
import yoctoSpinner from "yocto-spinner";
import * as z from "zod";
import dotenv from "dotenv";
import { clearStoredToken, getStoredToken, isTokenExpired, requireAuth, storeToken } from "../../../lib/token.js";
import prisma from "../../../lib/db.js";

dotenv.config();

const URL = "http://localhost:3005"; // Backend Better Auth server
const FRONTEND_URL = "http://localhost:3000"; // Your frontend
const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CONFIG_DIR = path.join(os.homedir(), ".better-auth");
export const TOKEN_FILE = path.join(CONFIG_DIR, "token.json");

export async function loginAction(opts) {
    const serverUrl = opts.serverUrl || URL;
    const clientId = opts.clientId || CLIENT_ID;
    
    intro(chalk.bold(" Auth Cli Login"));
    
    const existingToken = await getStoredToken();
    const expired = await isTokenExpired();
    
    if(existingToken && !expired){
        const shouldReAuth = await confirm({
            message: "You are already loggedIn. Do You want to login Again",
            initialValue: false
        });
        
        if(isCancel(shouldReAuth) || !shouldReAuth){
            cancel("Login Cancelled");
            process.exit(0);
        }
    }
    
    const authClient = createAuthClient({
        baseURL: serverUrl,
        plugins: [deviceAuthorizationClient()]
    });
    
    const spinner = yoctoSpinner({text: "Requesting device Authorization...."});
    spinner.start();
    
    try {
        const {data, error} = await authClient.device.code({
            client_id: clientId,
            scope: "openid email profile"
        });
        
        spinner.stop();
        
        if(error || !data){
            console.error(chalk.red(`Failed to request device authorization: ${error?.error_description || 'Unknown error'}`));
            process.exit(1);
        }
        
        const {
            device_code,
            user_code,
            verification_uri,
            verification_uri_complete,
            expires_in,
            interval = 5,
        } = data;
        
        console.log(chalk.cyan("Device Authorization Required"));
        console.log(`Please visit: ${chalk.underline.blue(verification_uri || verification_uri_complete)}`);
        console.log(`Enter Code: ${chalk.bold.green(user_code)}`);
        
        const shouldOpen = await confirm({
            message: "Open browser automatically",
            initialValue: true
        });
        
        if(!isCancel(shouldOpen) && shouldOpen){
            const urlToOpen = verification_uri_complete || verification_uri;
            if(urlToOpen){
                // Modify the URL to point to your frontend on port 3000
                const frontendUrl = urlToOpen.replace('localhost:3005', 'localhost:3000');
                console.log(chalk.gray(`Opening browser to: ${frontendUrl}`));
                await open(frontendUrl);
            }
        }
        
        console.log(
            chalk.gray(
                `Waiting for authorization (expires in ${Math.floor(expires_in/60)} minutes)....`
            )
        );
        
        const tokenData = await pollForToken(
            authClient,
            device_code,
            clientId,
            interval
        );

        console.log(chalk.gray("DEBUG - tokenData from pollForToken:"), JSON.stringify(tokenData, null, 2));
        
        if(tokenData?.access_token){
            console.log(chalk.gray("DEBUG - Storing token data..."));
            
            // Pass the entire tokenData object, not just access_token
            const saved = await storeToken(tokenData);
            if(!saved){
                console.log(
                    chalk.yellow("\nWarning: Could not save authentication token")
                );
                console.log(
                    chalk.yellow("You may need to login again for next use")
                );
            }
            
            outro(chalk.green("Login successful"));
            console.log(chalk.gray(`\nToken saved to: ${TOKEN_FILE}`));
            console.log(
                chalk.gray("You can now use AI Commands without logging in again.\n")
            );
        } else {
            console.log(chalk.red("ERROR: No access_token found in tokenData"));
            console.log(chalk.red("Available properties:"), tokenData ? Object.keys(tokenData).join(", ") : "tokenData is null");
            process.exit(1);
        }
    }
    catch(error) {
        spinner.stop();
        console.error(chalk.red(`Error occurred: ${error.message || error}`));
        process.exit(1);
    }
}

async function pollForToken(authClient, deviceCode, clientId, initialInterval){
    let pollingInterval = initialInterval;
    const spinner = yoctoSpinner({text: "", color: "cyan"});
    let dots = 0;
    
    return new Promise((resolve, reject) => {
        const poll = async() => {
            dots = (dots + 1) % 4;
            spinner.text = chalk.gray(
                `Polling for authorization${".".repeat(dots + 1)}`
            );
            
            if(!spinner.isSpinning) spinner.start();
            
            try {
                const {data, error} = await authClient.device.token({
                    grant_type: "urn:ietf:params:oauth:grant-type:device_code",
                    device_code: deviceCode,
                    client_id: clientId,
                    fetchOptions: {
                        headers: {
                            "user-agent": `My CLI`,
                        },
                    },
                });
                
                if(data){
                    spinner.stop();
                    console.log(chalk.gray("DEBUG - Full data received from authClient.device.token:"), JSON.stringify(data, null, 2));
                    
                    // Check for access_token in various possible locations
                    if(data.access_token || data.accessToken || data.token || data.session_token){
                        resolve(data);
                        return;
                    } else {
                        console.log(chalk.yellow("WARNING: Token data doesn't contain access_token property"));
                        console.log(chalk.yellow("Available properties:"), Object.keys(data).join(", "));
                        resolve(data); // Still resolve so we can see what we got
                        return;
                    }
                }
                else if(error){
                    console.log(chalk.gray("DEBUG - Error from authClient.device.token:"), JSON.stringify(error, null, 2));
                    switch (error.error) {
                        case "authorization_pending":
                            // Continue polling
                            break;
                        case "slow_down":
                            pollingInterval += 5;
                            break;
                        case "access_denied":
                            spinner.stop();
                            console.error(chalk.red("Access was denied by the user"));
                            reject(new Error("Access denied"));
                            return;
                        case "expired_token":
                            spinner.stop();
                            console.error(chalk.red("The device code has expired. Please try again."));
                            reject(new Error("Token expired"));
                            return;
                        default:
                            spinner.stop();
                            console.error(chalk.red(`Error: ${error.error_description || error.error}`));
                            reject(new Error(error.error_description || error.error));
                            return;
                    }
                }
            }
            catch(e) {
                spinner.stop();
                console.error(chalk.red(`Network Error: ${e.message}`));
                reject(e);
                return;
            }
            setTimeout(poll, pollingInterval * 1000);
        };
        
        setTimeout(poll, pollingInterval * 1000);
    });
}

export const login = new Command("login")
    .description("Login to Better Auth")
    .option("--server-url <url>", "The Better auth server url", URL)
    .option("--client-id <id>", "The OAuth client ID", CLIENT_ID)
    .action(loginAction);

export async function logoutAction() {
    intro(chalk.bold(" Auth Cli Logout"));
    
    const token = await getStoredToken();
    
    if(!token){
        console.log(chalk.yellow("You are not logged in"));
        process.exit(0);
    }
    
    const shouldLogout = await confirm({
        message: "Are you sure you want to logout?",
        initialValue: false
    });
    
    if(isCancel(shouldLogout) || !shouldLogout){
        cancel("Logout Cancelled");
        process.exit(0);
    }
    
    const cleared = await clearStoredToken();
    if(cleared){
        outro(chalk.green("Logout successful"));
    }
    else{
        outro(chalk.red("Logout failed"));
    }
}

export async function whoamiAction(opts) {
    try {
        const token = await getStoredToken();
        
        // Check for accessToken (not access_token) because that's what storeToken() saves
        if(!token?.accessToken){
            console.log(chalk.red("No access token found, please login again"));
            process.exit(1);
        }
        
        // Check if token is expired
        const expired = await isTokenExpired();
        if (expired) {
            console.log(chalk.red("Your session has expired. Please login again"));
            console.log(chalk.yellow("Run: orbitals login"));
            process.exit(1);
        }
        
        // Use accessToken (not access_token) in the query
        const user = await prisma.user.findFirst({
            where: {
                sessions: {
                    some: {
                        token: token.accessToken
                    }
                }
            },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
            }
        });
        
        if (!user) {
            console.log(chalk.red("User not found"));
            process.exit(1);
        }
        
        console.log(chalk.bold.greenBright(`\n User: ${user.name}
 Email: ${user.email}
 Id: ${user.id}`));
    } catch (error) {
        console.log(chalk.red("Error fetching user info:"), error.message);
        process.exit(1);
    }
}

export const logout = new Command("logout")
    .description("Logout and clear stored credentials")
    .action(logoutAction);

export const whoami = new Command("whoami")
    .description("Show current authenticated user")
    .option("--server-url <url>", "The Better auth server url", URL)
    .action(whoamiAction);
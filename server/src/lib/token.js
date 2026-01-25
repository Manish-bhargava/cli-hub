import fs from "fs/promises";
import path from "path";
import os from "os";
import chalk from "chalk";

/** * CONFIGURATION DIRECTORY SETUP
 * We must define the directory FIRST before using it to define files.
 */
const CONFIG_DIR = path.join(os.homedir(), ".better-auth");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");
export const TOKEN_FILE = path.join(CONFIG_DIR, "token.json");

/**
 * Retrieves the local configuration (like user API keys)
 */
export async function getLocalConfig() {
    try {
        const data = await fs.readFile(CONFIG_FILE, "utf-8");
        return JSON.parse(data);
    } catch (error) {
        return null;
    }
}

/**
 * Retrieves the stored authentication token
 */
export async function getStoredToken() {
    try {
        const data = await fs.readFile(TOKEN_FILE, "utf-8");
        const token = JSON.parse(data);
        return token;
    } catch (error) {
        return null;
    }
}

/**
 * Stores the authentication token to the local file system
 * @param {Object} token - The token data received from the auth server
 */
export async function storeToken(token) {
    try {
        await fs.mkdir(CONFIG_DIR, { recursive: true });
        
        const tokenData = {
            accessToken: token.access_token,
            refreshToken: token.refresh_token,
            token_type: token.token_type || "Bearer",
            scope: token.scope,
            expires_at: token.expires_in
                ? new Date(Date.now() + token.expires_in * 1000).toISOString()
                : null,
            created_at: new Date().toISOString(),
        };
        
        await fs.writeFile(TOKEN_FILE, JSON.stringify(tokenData, null, 2), "utf-8");
        
        // Optional verification check
        await fs.readFile(TOKEN_FILE, "utf-8");
        
        return true;
    } catch (error) {
        console.error(chalk.red("Failed to store token:", error.message));
        return false;
    }
}

/**
 * Deletes the stored token (Logout)
 */
export async function clearStoredToken() {
    try {
        await fs.unlink(TOKEN_FILE);
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Checks if the current token is expired or close to expiring
 */
export async function isTokenExpired() {
    const token = await getStoredToken();
    if (!token || !token.expires_at) {
        return true;
    }
    const expiresAt = new Date(token.expires_at);
    const now = new Date();
    // Consider it expired if it has less than 5 minutes left
    return expiresAt.getTime() - now.getTime() < 5 * 60 * 1000;
}

/**
 * Guard function to ensure a user is authenticated before running a command
 */
export async function requireAuth() {
    const token = await getStoredToken();
    if (!token) {
        console.log(
            chalk.red("You are not logged in. Please login first")
        );
        process.exit(1);
    }
    if (await isTokenExpired()) {
        console.log(
            chalk.yellow("Your session has expired. Please login again")
        );
        console.log(chalk.gray(" Run: orbitals login\n"));
        process.exit(1);
    }
    return token;
}
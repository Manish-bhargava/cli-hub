// import fs from "fs/promises";
// import path from "path";
// import os from "os";
// import chalk from "chalk";

// // Define TOKEN_FILE here instead of importing it
// const CONFIG_DIR = path.join(os.homedir(), ".better-auth");
// export const TOKEN_FILE = path.join(CONFIG_DIR, "token.json");

// export async function getStoredToken() {
//     try {
//         const data = await fs.readFile(TOKEN_FILE, "utf-8");
//         return JSON.parse(data);
//     } catch (error) {
//         return null;
//     }
// }

// export async function storeToken(token) {
//     try {
//         await fs.mkdir(CONFIG_DIR, { recursive: true });
//         const tokenData = {
//             accessToken: token.access_token,
//             refreshToken: token.refresh_token,
//             token_type: token.token_type || "Bearer",
//             scope: token.scope,
//             expires_at: token.expires_in
//                 ? new Date(Date.now() + token.expires_in * 1000).toISOString()
//                 : null,
//             created_at: new Date().toISOString(),
//         };
//         await fs.writeFile(TOKEN_FILE, JSON.stringify(tokenData, null, 2), "utf-8");
//         return true;
//     } catch (error) {
//         console.error(chalk.red("Failed to store token:", error.message));
//         return false;
//     }
// }

// export async function clearStoredToken() {
//     try {
//         await fs.unlink(TOKEN_FILE);
//         return true;
//     } catch (error) {
//         return false;
//     }
// }

// export async function isTokenExpired() {
//     const token = await getStoredToken();
//     if (!token || !token.expires_at) {
//         return true;
//     }
//     const expiresAt = new Date(token.expires_at);
//     const now = new Date();
//     return expiresAt.getTime() - now.getTime() < 5 * 60 * 1000;
// }

// export async function requireAuth() {
//     const token = await getStoredToken();
//     if (!token) {
//         console.log(
//             chalk.red("You are not logged in. Please login first")
//         );
//         process.exit(1);
//     }
//     if (await isTokenExpired()) {
//         console.log(
//             chalk.yellow("Your session has expired. Please login again")
//         );
//         console.log(chalk.gray(" Run: your-cli login\n"));
//         process.exit(1);
//     }
//     return token;
// }
import fs from "fs/promises";
import path from "path";
import os from "os";
import chalk from "chalk";

// Define TOKEN_FILE here instead of importing it
const CONFIG_DIR = path.join(os.homedir(), ".better-auth");
export const TOKEN_FILE = path.join(CONFIG_DIR, "token.json");

export async function getStoredToken() {
    try {
        console.log(chalk.gray(`Reading token from: ${TOKEN_FILE}`)); // Debug
        const data = await fs.readFile(TOKEN_FILE, "utf-8");
        const token = JSON.parse(data);
        console.log(chalk.gray(`Token retrieved: ${JSON.stringify(token, null, 2)}`)); // Debug
        return token;
    } catch (error) {
        console.log(chalk.gray(`Error reading token: ${error.message}`)); // Debug
        return null;
    }
}

export async function storeToken(token) {
    try {
        console.log(chalk.gray(`Storing token to: ${TOKEN_FILE}`)); // Debug
        console.log(chalk.gray(`Token data received: ${JSON.stringify(token, null, 2)}`)); // Debug
        
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
        
        console.log(chalk.gray(`Token data to save: ${JSON.stringify(tokenData, null, 2)}`)); // Debug
        
        await fs.writeFile(TOKEN_FILE, JSON.stringify(tokenData, null, 2), "utf-8");
        
        // Verify the file was written
        const verify = await fs.readFile(TOKEN_FILE, "utf-8");
        console.log(chalk.gray(`File content after save: ${verify}`)); // Debug
        
        return true;
    } catch (error) {
        console.error(chalk.red("Failed to store token:", error.message));
        return false;
    }
}

export async function clearStoredToken() {
    try {
        await fs.unlink(TOKEN_FILE);
        return true;
    } catch (error) {
        return false;
    }
}

export async function isTokenExpired() {
    const token = await getStoredToken();
    if (!token || !token.expires_at) {
        return true;
    }
    const expiresAt = new Date(token.expires_at);
    const now = new Date();
    return expiresAt.getTime() - now.getTime() < 5 * 60 * 1000;
}

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
        console.log(chalk.gray(" Run: your-cli login\n"));
        process.exit(1);
    }
    return token;
}
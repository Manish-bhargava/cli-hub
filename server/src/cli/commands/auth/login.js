import {cancel, confirm, intro, isCancel, outro} from "@clack/prompts";
// Remove logger import if not used
// import {logger} from "better-auth";
import {createAuthClient} from "better-auth/client";
// Try this import instead:
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
import { plugin } from "mongoose";
// import { auth } from "../../../lib/auth.js";
// Remove or fix this import if db file doesn't exist
// import prisma from "../../../lib/db";

dotenv.config();

const URL = "http://localhost:3005";
const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CONFIG_DIR = path.join(os.homedir(), ".better-auth");
const TOKEN_FILE = path.join(CONFIG_DIR, "token.json");

export async function loginAction(opts) {
    const options = z.object({
        serverUrl: z.string().optional(),
        clientId: z.string().optional()
    });
    
    const serverUrl = opts.serverUrl || URL;
    const clientId = opts.clientId || CLIENT_ID;
    
    intro(chalk.bold(" Auth Cli Login"));
    
    const existingToken = false;
    const expired = false;
    
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
    const authClient=createAuthClient({
            baseURL:serverUrl,
            plugins:[deviceAuthorizationClient()]
    })
    const spinner=yoctoSpinner({text:"Requesting device Authorization...."});
    spinner.start();
    try{
      const {data,error}=await authClient.device.code({
        client_id:clientId,
        scope:"openid email profile"
      })
      spinner.stop();
      if(error || !data){   
     logger.error(`Failed to request device authorization: ${error.error_description}`);
     process.exit(1);
       }
       const {
        device_code,
        user_code,
        verification_uri,
         verification_uri_complete,
        expires_in,
        interval=5,
       
       
       }=data;
       console.log(chalk.cyan("device Authorization Required"));
       console.log(`please visit" ${chalk.underline.blue(verification_uri || verification_uri_complete)}`);
       console.log(`Enter Code: ${chalk.bold.green(user_code)}`)
       const shouldOpen=await confirm({
        message:"Open browser automatically",
        initialValue:true
       })
       if(isCancel(shouldOpen) && shouldOpen){
        const urlToOpen=verification_uri || verification_uri_complete;
        if(urlToOpen){
            await open(urlToOpen);
        }
       
       }
       console.log(
        chalk.gray(
            `Waiting for authorization (expires_in ${Math.floor(expires_in/60)} minutes)....`
        )
       )
    }
    catch(error){

    }
    
    // TODO: Add actual login logic here
    console.log(chalk.green(`Logging in to ${serverUrl}...`));
}

export const login = new Command("login")
    .description("Login to Better Auth")
    .option("--server-url <url>", "The Better auth server url", URL)
    .option("--client-id <id>", "The OAuth client ID", CLIENT_ID)
    .action(loginAction);
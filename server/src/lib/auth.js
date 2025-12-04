import { betterAuth } from "better-auth";
import {prismaAdapter} from "better-auth/adapters/prisma"
import {deviceAuthorization} from "better-auth/plugins";

import prisma from "./db.js";
export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),
    basePath:"/api/auth",
   trustedOrigins: [
        "http://localhost:3000", // Frontend (allow this!)
        "http://localhost:3005"  // Backend (optional, but good to keep)
    ],
    plugins:[deviceAuthorization({
        expiresIn:"30m",
        interval:"5s"
    }
    )],
    
    socialProviders:{
        github:{
            clientId:process.env.GITHUB_CLIENT_ID,
            clientSecret:process.env.GITHUB_CLIENT_SECRET
        }
    }
});
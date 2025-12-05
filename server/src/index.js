import express from "express";
import dotenv from "dotenv";
import { toNodeHandler } from "better-auth/node";
import {auth} from "./lib/auth.js";
import cors from "cors"
dotenv.config();
const app=express();
app.use(cors({
    origin: "http://localhost:3000",   // your frontend URL
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true
}));

// app.all('/api/auth/{*any}', toNodeHandler(auth));
app.all('/api/auth/*splat', toNodeHandler(auth));
app.use(express.json());
app.get("/api/me",async(req,res)=>{
    const session =await auth.api.getSession({
        headers:fromNodeHeaders(req.headers),
    })
})
app.get("/device",async(req,res)=>{
    const {user_code}=req.query();
    res.redirect(`http://localhost:3000/device?user_code=${user_code}`);
})
app.get('/health',(req,res)=>{
res.send("good health ")
})
app.listen(process.env.PORT,()=>{
    console.log("applicaiton is fine and ruuning ",process.env.PORT);
})
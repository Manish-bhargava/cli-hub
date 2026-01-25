import express from "express";
import dotenv from "dotenv";
import { toNodeHandler, fromNodeHeaders } from "better-auth/node";
import {auth} from "./lib/auth.js";
import cors from "cors"
dotenv.config({ quiet: true });
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
app.get("/device", async (req, res) => {
    // Better-auth often sends it as user_code or user-code depending on version
    const user_code = req.query.user_code || req.query['user-code']; 
    res.redirect(`http://localhost:3000/device?user_code=${user_code}`);
});
app.get("/api/me", async (req, res) => {
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        });
        // You MUST return the session object so the CLI can see it
        return res.json(session); 
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
});
// Add this route near your other routes
app.get("/approve", (req, res) => {
    const userCode = req.query['user-code']; // Note the hyphen: user-code
    // Redirect to your frontend verification page
    res.redirect(`http://localhost:3000/device?user_code=${userCode}`);
});
app.get('/health',(req,res)=>{
res.send("good health ")
})
app.listen(process.env.PORT,()=>{
    console.log("applicaiton is fine and ruuning ",process.env.PORT);
})
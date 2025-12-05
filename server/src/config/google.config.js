import dotenv from "dotenv"
dotenv.config();
export const config={
    googleApiKey:process.env.GOOGLE_API_KEY || "",
    model:process.env.ORBITAL_MODEL || "gpt-3.5-turbo",
    
 
}
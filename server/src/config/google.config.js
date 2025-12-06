import dotenv from "dotenv"
dotenv.config();

export const config = {
    // AI SDK Configuration (for Gemini)
    googleApiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || "",
    model: process.env.ORBITAL_MODEL || "gemini-2.0-flash",
    
    // Google Search API Configuration
    googleSearchApiKey: process.env.GOOGLE_SEARCH_API_KEY || "",
    googleSearchEngineId: process.env.GOOGLE_SEARCH_ENGINE_ID || ""
};
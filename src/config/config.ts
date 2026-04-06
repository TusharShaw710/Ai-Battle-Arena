import dotenv from "dotenv";

dotenv.config();


type CONFIG = {
    geminiApiKey: string;
    mistralApiKey: string;
    cohereApiKey: string;
}

const config: CONFIG = {
    geminiApiKey: process.env.GEMINI_API_KEY || "",
    mistralApiKey: process.env.MISTRAL_API_KEY || "",
    cohereApiKey: process.env.COHERE_API_KEY || "",
}

export default config;  


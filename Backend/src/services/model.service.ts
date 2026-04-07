import config from "../config/config.js";
import { ChatCohere } from "@langchain/cohere";
import { ChatGoogle } from "@langchain/google";
import { ChatMistralAI } from "@langchain/mistralai";

export const cohereModel=new ChatCohere({
    model:"command-a-03-2025",
    apiKey:config.cohereApiKey
});

export const geminiModel=new ChatGoogle({
    model:"gemini-2.5-flash",
    apiKey:config.geminiApiKey
});

export const mistralModel=new ChatMistralAI({
    model:"mistral-medium-latest",
    apiKey:config.mistralApiKey
})
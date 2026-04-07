import express from "express";
import runGraph from "./services/graph.service.js";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// go up from src → Backend → public
app.use(express.static(path.join(__dirname, "../public")));

app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173",
}));


app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.post("/get-graph",async (req,res)=>{
    const {prompt}=req.body;  
    const response=await runGraph(prompt);
    res.status(200).json({
      message: "Graph generated successfully",
      success:true,
      result:response
    });
});

export default app;
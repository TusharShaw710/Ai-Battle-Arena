import express from "express";
import runGraph from "./services/graph.service.js";

const app = express();

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.post("/get-graph",async (req,res)=>{
    const response=await runGraph("How can we reduce traffic congestion in urban areas?");
    res.status(200).json(response);
});

export default app;
import { geminiModel, mistralModel, cohereModel } from "./model.service.js";
import { StateGraph, StateSchema, START, END, Graph } from "@langchain/langgraph";
import { z } from "zod";
import { createAgent, providerStrategy, HumanMessage } from "langchain";
const state = new StateSchema({
    problem: z.string().default(""),
    solution_1: z.string().default(""),
    solution_2: z.string().default(""),
    judge: z.object({
        solution_1_score: z.number().min(0).max(10).default(0),
        solution_2_score: z.number().min(0).max(10).default(0),
        solution_1_reasoning: z.string().default(""),
        solution_2_reasoning: z.string().default(""),
    })
});
const solutionNode = async (state) => {
    const problem = state.problem;
    const [solution1, solution2] = await Promise.all([
        mistralModel.invoke(problem),
        cohereModel.invoke(problem)
    ]);
    return {
        solution_1: solution1.text,
        solution_2: solution2.text
    };
};
const judgeNode = async (state) => {
    const { problem, solution_1, solution_2 } = state;
    const judge = createAgent({
        model: geminiModel,
        tools: [],
        responseFormat: providerStrategy(z.object({
            solution_1_score: z.number().min(0).max(10).default(0),
            solution_2_score: z.number().min(0).max(10).default(0),
            solution_1_reasoning: z.string().default(""),
            solution_2_reasoning: z.string().default(""),
        })),
        systemPrompt: "You are a judge that evaluates two solutions to a problem. You will be given a problem and two solutions. You need to evaluate each solution based on its correctness, creativity, and feasibility. Provide a score between 0 and 10 for each solution, along with your reasoning."
    });
    const response = await judge.invoke({
        messages: [
            new HumanMessage(`Problem: ${problem}\nSolution 1: ${solution_1}\nSolution 2: ${solution_2}\nEvaluate the two solutions and provide scores and reasoning.`)
        ]
    });
    const result = response.structuredResponse;
    return {
        judge: {
            solution_1_score: result.solution_1_score,
            solution_2_score: result.solution_2_score,
            solution_1_reasoning: result.solution_1_reasoning,
            solution_2_reasoning: result.solution_2_reasoning,
        }
    };
};
const graph = new StateGraph(state)
    .addNode("solution", solutionNode)
    .addNode("judge_node", judgeNode)
    .addEdge(START, "solution")
    .addEdge("solution", "judge_node")
    .addEdge("judge_node", END)
    .compile();
export default async function (problem) {
    const response = await graph.invoke({
        problem: problem
    });
    return response;
}
//# sourceMappingURL=graph.service.js.map
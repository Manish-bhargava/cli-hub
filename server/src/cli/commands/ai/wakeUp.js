
import chalk from "chalk";
import { Command } from "commander";
import yoctoSpinner from "yocto-spinner";
import { getStoredToken } from "../../../lib/token.js";
import prisma from "../../../lib/db.js";
import { select } from "@clack/prompts";
import { startChat } from "../chat/chat-with-ai.js";
import { startToolChat } from "../chat/chat-with-ai-tool.js";
import { startAgentChat } from "../chat/chat-with-ai-agent.js";

const wakeUpAction = async (options) => {
    const token = await getStoredToken();
    
    // Check for accessToken (not access_token)
    if(!token?.accessToken){
        console.log(chalk.red("Not Authenticated. Please login"));
        return;
    }

    const spinner = yoctoSpinner({ text: "Fetching user Information..." });
    spinner.start();
    
    // Use accessToken (not access_token) in the query
    const prismaUser = await prisma.user.findFirst({
        where: {
            sessions: {
                some: {
                    token: token.accessToken
                }
            }
        },
        select: {
            id: true,
            name: true,
            email: true,
            image: true,
        }
    });
    spinner.stop();

    if (!prismaUser) {
        console.log(chalk.red("User not found"));
        return;
    }

    console.log(chalk.green(`Welcome back ${prismaUser.name}!\n`));
    const choice = await select({
        message: "What would you like to do?",
        options: [
            { value: "chat", label: "Chat", hint: "Simple chat with ai" },
            { value: "tool", label: "Tool Calling", hint: "Chat with tools (Google Search, Code Execution)" },
            { value: "agent", label: "Agentic mode", hint: "Advanced Ai Agent (coming soon)" },
        ]
    });

    // You need to define or import these functions
    switch (choice) {
        case "chat":
            // await chatAction();
           await startChat("chat")
            break;
        case "tool":
            // await toolAction();
             await startToolChat();
            break;
        case "agent":
            // await agentAction();
        await startAgentChat();
            break;
    }
}

export const wakeUp = new Command("wakeUp")
    .description("Wake up the AI")
    .action(wakeUpAction);
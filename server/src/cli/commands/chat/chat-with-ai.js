import chalk from "chalk";
import { Command } from "commander";
import boxen from "boxen";
import { text, isCancel, intro, outro } from "@clack/prompts";
import yoctoSpinner from "yocto-spinner";
import { marked } from "marked";
import { markedTerminal } from "marked-terminal";
import { AIService } from "../../ai/googel-service.js";
import { ChatService } from "../../../service/chat-service.js";
import { getStoredToken, getLocalConfig } from "../../../lib/token.js";
import prisma from "../../../lib/db.js";

// Configure marked for terminal output with colors
marked.use(
    markedTerminal({
        code: chalk.cyan,
        blockquote: chalk.gray.italic,
        heading: chalk.green.bold,
        firstHeading: chalk.magenta.underline.bold,
        hr: chalk.reset,
        strong: chalk.bold,
        em: chalk.italic,
        codespan: chalk.yellow.bgBlack,
        link: chalk.blue.underline,
    })
);

const chatService = new ChatService();

/**
 * Retrieves the authenticated user from the local session token
 */
async function getUserFromToken() {
    const token = await getStoredToken();
    if (!token?.accessToken) {
        throw new Error("Not authenticated. Please run 'orbitals login' first");
    }
    
    const spinner = yoctoSpinner({ text: "Authenticating..." }).start();
    
    const user = await prisma.user.findFirst({
        where: {
            sessions: { some: { token: token.accessToken } }
        }
    });
    
    if (!user) {
        spinner.error("User not found");
        throw new Error("Session invalid. Please login again.");
    }
    
    spinner.success(`Welcome back, ${user.name}`);
    return user;
}

/**
 * Loads or creates a conversation for the user
 */
async function initConversation(userId, conversationId = null, mode = "chat") {
    const spinner = yoctoSpinner({ text: "Loading conversation..." }).start();
    const conversation = await chatService.getOrConversation(userId, conversationId, mode);
    
    if (!conversation) {
        spinner.error("Failed to load conversation");
        throw new Error("Database error: Could not retrieve conversation.");
    }
    
    spinner.success("Conversation ready");

    const conversationInfo = boxen(
        `${chalk.bold("Title:")} ${conversation.title || "New Chat"}\n` +
        `${chalk.dim("ID:")}    ${conversation.id}\n` +
        `${chalk.dim("Mode:")}  ${conversation.mode}`, 
        {
            padding: 1,
            margin: 1,
            borderColor: "cyan",
            borderStyle: "round",
            title: "Chat Session",
        }
    );
    
    console.log(conversationInfo);
    
    if (conversation.messages?.length > 0) {
        displayHistory(conversation.messages);
    }
    
    return conversation;
}

/**
 * Renders previous chat messages in the terminal
 */
function displayHistory(messages) {
    messages.forEach((msg) => {
        if (msg.role === "user") {
            console.log(chalk.blue.bold("You: ") + chalk.white(msg.content));
        } else {
            console.log(chalk.green.bold("AI:  ") + marked.parse(msg.content));
        }
    });
}

/**
 * Handles the AI interaction using the user's local API Key
 */
async function getAIResponse(conversationId, aiService) {
    const spinner = yoctoSpinner({ text: "AI is thinking...", color: "cyan" }).start();
    
    const dbMessages = await chatService.getMessages(conversationId);
    const aiMessages = chatService.formatMessagesForAi(dbMessages);
    let fullResponse = "";
    let isFirstChunk = true;
    
    try {
        const result = await aiService.sendMessage(aiMessages, (chunk) => {
            if (isFirstChunk) {
                spinner.stop();
                console.log(chalk.green.bold("\nAssistant"));
                console.log(chalk.gray("-".repeat(40)));
                isFirstChunk = false;
            }
            process.stdout.write(chunk); // Stream output directly
            fullResponse += chunk;
        });
        
        console.log(`\n${chalk.gray("-".repeat(40))}\n`);
        return result.content;
    } catch (e) {
        spinner.error("AI Error");
        throw e;
    }
}

/**
 * Main chat interaction loop
 */
async function chatLoop(conversation, aiService) {
    console.log(chalk.dim("Commands: 'exit' to quit, 'Ctrl+C' to force stop.\n"));
    
    while (true) {
        const userInput = await text({
            message: chalk.blue("Message"),
            placeholder: "How can I help you?",
        });
        
        if (isCancel(userInput) || userInput.toLowerCase() === "exit") {
            outro(chalk.yellow("Chat ended."));
            break;
        }

        const trimmedInput = userInput.trim();
        if (!trimmedInput) continue;
        
        // 1. Save User Message
        await chatService.addMessage(conversation.id, "user", trimmedInput);
        
        // 2. Get and Display AI Response
        try {
            const aiResponse = await getAIResponse(conversation.id, aiService);
            
            // 3. Save AI Message
            await chatService.addMessage(conversation.id, "assistant", aiResponse);
            
            // 4. Update Title if it's the first message
            const count = await prisma.message.count({ where: { conversationId: conversation.id } });
            if (count <= 2) {
                const newTitle = trimmedInput.slice(0, 30) + "...";
                await chatService.updateConversationTitle(conversation.id, newTitle);
            }
        } catch (err) {
            console.error(chalk.red(`\n[!] Error: ${err.message}`));
        }
    }
}

/**
 * Entry point for the chat command
 */
export async function startChat(mode = "chat", conversationId = null) {
    try {
        // Option 1 Logic: Get user API key from local config
        const config = await getLocalConfig();
        if (!config?.googleApiKey) {
            console.log(chalk.red("\n[!] Google API Key not found."));
            console.log(chalk.yellow("Please run: orbitals config\n"));
            return;
        }

        intro(chalk.bold.cyan(" Orbitals AI Chat "));
        
        // Initialize AI Service with user's key
        const aiService = new AIService(config.googleApiKey);
        const user = await getUserFromToken();
        const conversation = await initConversation(user.id, conversationId, mode);
        
        await chatLoop(conversation, aiService);
        
    } catch (e) {
        console.error(boxen(chalk.red(e.message), { padding: 1, borderColor: "red" }));
    }
}
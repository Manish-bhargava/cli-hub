// import chalk from "chalk";
// import { Command } from "commander";
// import boxen from "boxen";
// import figlet from "figlet";
// import {text, isCancel, cancel, intro, outro} from "@clack/prompts";
// import yoctoSpinner from "yocto-spinner";
// import {marked} from "marked";
// import {markedTerminal} from "marked-terminal";
// import { AIService } from "../../ai/googel-service.js";
// import { ChatService } from "../../../service/chat-service.js";
// import { getStoredToken } from "../../../lib/token.js"; // Fixed import name
// import prisma from "../../../lib/db.js";

// marked.use(
//     markedTerminal({
//         code: chalk.cyan,
//         blockquote: chalk.gray.italic,
//         heading: chalk.green.bold,
//         firstHeading: chalk.magenta.underline.bold,
//         hr: chalk.reset,
//         listitem: chalk.reset,
//         list: chalk.reset,
//         table: chalk.reset,
//         paragraph: chalk.reset,
//         strong: chalk.bold,
//         em: chalk.italic,
//         codespan: chalk.yellow.bgBlack,
//         del: chalk.dim.gray.strikethrough,
//         link: chalk.blue.underline,
//         href: chalk.blue.underline
//     })
// );

// const aiService = new AIService();
// const chatService = new ChatService();

// async function getUserFromToken() { // Removed unused params
//     const token = await getStoredToken(); // Fixed function name
//     if(!token?.accessToken){ // Fixed property name
//         throw new Error("Not authenticated. Please run orbitals login first");
//     }
    
//     const spinner = yoctoSpinner({
//         text: "Authenticating..."
//     }).start();
    
//     const user = await prisma.user.findFirst({
//         where: {
//             sessions: {
//                 some: {
//                     token: token.accessToken
//                 }
//             }
//         }
//     });
    
//     if(!user){
//         spinner.error("User not found");
//         throw new Error("User not found. Please login again");
//     }
    
//     spinner.success(`Welcome back, ${user.name}`);
//     return user;
// }

// async function initConversation(userId, conversationId = null, mode = "chat"){
//     const spinner = yoctoSpinner({text: "Loading conversation..."}).start();
//     const conversation = await chatService.getOrConversation(userId, conversationId, mode);
//     spinner.success("Conversation loaded");

//     const conversationInfo = boxen(
//         `${chalk.bold("Conversation")}: ${conversation.title}\n${chalk.gray("ID: " + conversation.id)}\n${chalk.gray("Mode: " + conversation.mode)}`, {
//             padding: 1,
//             margin: 1,
//             borderColor: "cyan",
//             borderStyle: "round",
//             title: "Chat Session",
//             titleAlignment: "center"
//         }
//     );
    
//     console.log(conversationInfo);
    
//     if(conversation.messages?.length > 0){
//         console.log(chalk.yellow("Previous Messages:"));
//         displayMessages(conversation.messages); // Fixed function name
//     }
    
//     return conversation;
// }

// function displayMessages(messages){ // Renamed from displayMessage to displayMessages for clarity
//     messages.forEach((msg) => {
//         if(msg.role === "user"){
//             const userBox = boxen(chalk.white(msg.content), { // Fixed bracket
//                 padding: 1,
//                 margin: {
//                     left: 2,
//                     bottom: 1
//                 },
//                 borderStyle: "round",
//                 borderColor: "blue",
//                 title: "You",
//                 titleAlignment: "left"
//             });
//             console.log(userBox);
//         } else {
//             const renderedContent = marked.parse(msg.content);
//             const assistantBox = boxen(chalk.white(renderedContent), { // Fixed bracket
//                 padding: 1,
//                 margin: {
//                     left: 2,
//                     bottom: 1
//                 },
//                 borderStyle: "round",
//                 borderColor: "green",
//                 title: "Assistant",
//                 titleAlignment: "left"
//             });
//             console.log(assistantBox);
//         }
//     });
// }

// async function saveMessage(conversationId, role, content) {
//     return await chatService.addMessage(conversationId, role, content);
// }

// async function getAIResponse(conversationId){
//     const spinner = yoctoSpinner({
//         text: "AI is thinking",
//         color: "cyan"
//     }).start();
    
//     const dbMessages = await chatService.getMessages(conversationId);
//     const aiMessages = chatService.formatMessagesForAi(dbMessages);
//     let fullResponse = "";
//     let isFirstChunk = true;
    
//     try {
//         const result = await aiService.sendMessage(aiMessages, (chunk) => {
//             if(isFirstChunk){
//                 spinner.stop();
//                 console.log("\n");
//                 const header = chalk.green.bold("Assistant");
//                 console.log(header);
//                 console.log(chalk.gray("-".repeat(60)));
//                 isFirstChunk = false;
//             }
//             fullResponse += chunk;
//         });
        
//         console.log("\n");
//         const renderedMarkdown = marked.parse(fullResponse);
//         console.log(renderedMarkdown);
//         console.log(chalk.gray("-".repeat(60)));
//         console.log("\n");
//         return result.content;
//     }
//     catch(e){
//         spinner.error("Failed to get AI response");
//         throw e;
//     }
// }

// async function updateConversationTitle(conversationId, userInput, messageCount) {
//     if(messageCount === 1){
//         const title = userInput.slice(0, 50) + (userInput.length > 50 ? "..." : "");
//         await chatService.updateConversationTitle(conversationId, title);
//     }
// }

// async function chatLoop(conversation){
//     const helpBox = boxen(
//         `${chalk.gray('. Type your message and press Enter')}\n${chalk.gray('. Markdown formatting is supported in response')}\n${chalk.gray('. Type exit to end conversation')}\n${chalk.gray('. Press Ctrl+C to quit anytime')}`, { // Fixed closing bracket
//             padding: 1,
//             margin: 1,
//             borderColor: "gray",
//             borderStyle: "round",
//             dimBorder: true
//         }
//     );
    
//     console.log(helpBox);
    
//     while(true){
//         const userInput = await text({
//             message: chalk.blue("Your message"),
//             placeholder: "Type your message",
//             validate(value){
//                 if(!value || value.trim().length === 0){
//                     return "Message cannot be empty";
//                 }
//                 return true;
//             }
//         });
        
//         if(isCancel(userInput)){ // Fixed variable name
//             const exitBox = boxen(chalk.yellow("Chat session ended, goodbye"), {
//                 padding: 1,
//                 margin: 1,
//                 borderColor: "yellow",
//                 borderStyle: "round"
//             });
//             console.log(exitBox);
//             process.exit(0);
//         }
        
//         if(userInput.toLowerCase() === "exit"){ // Fixed variable name
//             const exitBox = boxen(chalk.yellow("Chat session ended, goodbye"), {
//                 padding: 1,
//                 margin: 1,
//                 borderColor: "yellow",
//                 borderStyle: "round"
//             });
//             console.log(exitBox);
//             break;
//         }
        
//         await saveMessage(conversation.id, "user", userInput);
//         const messages = await chatService.getMessages(conversation.id);
//         const aiResponse = await getAIResponse(conversation.id);
//         await saveMessage(conversation.id, "assistant", aiResponse);
//         await updateConversationTitle(conversation.id, userInput, messages.length);
//     }
// }

// export async function startChat(mode = "chat", conversationId = null) {
//     try {
//         intro(
//             boxen(
//                 chalk.bold.cyan("CLI_HUB CHAT"), {
//                     padding: 1,
//                     margin: 1,
//                     borderStyle: "double",
//                     borderColor: "cyan"
//                 }
//             )
//         );
        
//         const user = await getUserFromToken();
//         const conversation = await initConversation(user.id, conversationId, mode);
//         await chatLoop(conversation);
//         outro(chalk.green('Thanks for Chatting'));
//     }
//     catch(e){
//         const errorBox = boxen(chalk.red(e.message), {
//             padding: 1,
//             margin: 1,
//             borderColor: "red",
//             borderStyle: "round"
//         });
//         console.log(errorBox);
//     }
// }

import chalk from "chalk";
import { Command } from "commander";
import boxen from "boxen";
import figlet from "figlet";
import {text, isCancel, cancel, intro, outro} from "@clack/prompts";
import yoctoSpinner from "yocto-spinner";
import {marked} from "marked";
import {markedTerminal} from "marked-terminal";
import { AIService } from "../../ai/googel-service.js";
import { ChatService } from "../../../service/chat-service.js";
import { getStoredToken } from "../../../lib/token.js";
import prisma from "../../../lib/db.js";

marked.use(
    markedTerminal({
        code: chalk.cyan,
        blockquote: chalk.gray.italic,
        heading: chalk.green.bold,
        firstHeading: chalk.magenta.underline.bold,
        hr: chalk.reset,
        listitem: chalk.reset,
        list: chalk.reset,
        table: chalk.reset,
        paragraph: chalk.reset,
        strong: chalk.bold,
        em: chalk.italic,
        codespan: chalk.yellow.bgBlack,
        del: chalk.dim.gray.strikethrough,
        link: chalk.blue.underline,
        href: chalk.blue.underline
    })
);

const aiService = new AIService();
const chatService = new ChatService();

async function getUserFromToken() {
    const token = await getStoredToken();
    if(!token?.accessToken){
        throw new Error("Not authenticated. Please run orbitals login first");
    }
    
    const spinner = yoctoSpinner({
        text: "Authenticating..."
    }).start();
    
    const user = await prisma.user.findFirst({
        where: {
            sessions: {
                some: {
                    token: token.accessToken
                }
            }
        }
    });
    
    if(!user){
        spinner.error("User not found");
        throw new Error("User not found. Please login again");
    }
    
    spinner.success(`Welcome back, ${user.name}`);
    return user;
}

async function initConversation(userId, conversationId = null, mode = "chat"){
    const spinner = yoctoSpinner({text: "Loading conversation..."}).start();
    const conversation = await chatService.getOrConversation(userId, conversationId, mode);
    
    if (!conversation) {
        spinner.error("Failed to create conversation");
        throw new Error("Could not create or load conversation");
    }
    
    // Ensure conversation has a title
    const conversationTitle = conversation.title || "Untitled Conversation";
    
    spinner.success("Conversation loaded");

    const conversationInfo = boxen(
        `${chalk.bold("Conversation")}: ${conversationTitle}\n${chalk.gray("ID: " + conversation.id)}\n${chalk.gray("Mode: " + conversation.mode)}`, {
            padding: 1,
            margin: 1,
            borderColor: "cyan",
            borderStyle: "round",
            title: "Chat Session",
            titleAlignment: "center"
        }
    );
    
    console.log(conversationInfo);
    
    if(conversation.messages?.length > 0){
        console.log(chalk.yellow("Previous Messages:"));
        displayMessages(conversation.messages);
    }
    
    return conversation;
}

function displayMessages(messages){
    messages.forEach((msg) => {
        if(msg.role === "user"){
            const userBox = boxen(chalk.white(msg.content), {
                padding: 1,
                margin: {
                    left: 2,
                    bottom: 1
                },
                borderStyle: "round",
                borderColor: "blue",
                title: "You",
                titleAlignment: "left"
            });
            console.log(userBox);
        } else {
            const renderedContent = marked.parse(msg.content);
            const assistantBox = boxen(chalk.white(renderedContent), {
                padding: 1,
                margin: {
                    left: 2,
                    bottom: 1
                },
                borderStyle: "round",
                borderColor: "green",
                title: "Assistant",
                titleAlignment: "left"
            });
            console.log(assistantBox);
        }
    });
}

async function saveMessage(conversationId, role, content) {
    return await chatService.addMessage(conversationId, role, content);
}

async function getAIResponse(conversationId){
    const spinner = yoctoSpinner({
        text: "AI is thinking",
        color: "cyan"
    }).start();
    
    const dbMessages = await chatService.getMessages(conversationId);
    const aiMessages = chatService.formatMessagesForAi(dbMessages);
    let fullResponse = "";
    let isFirstChunk = true;
    
    try {
        const result = await aiService.sendMessage(aiMessages, (chunk) => {
            if(isFirstChunk){
                spinner.stop();
                console.log("\n");
                const header = chalk.green.bold("Assistant");
                console.log(header);
                console.log(chalk.gray("-".repeat(60)));
                isFirstChunk = false;
            }
            fullResponse += chunk;
        });
        
        console.log("\n");
        const renderedMarkdown = marked.parse(fullResponse);
        console.log(renderedMarkdown);
        console.log(chalk.gray("-".repeat(60)));
        console.log("\n");
        return result.content;
    }
    catch(e){
        spinner.error("Failed to get AI response");
        throw e;
    }
}

async function updateConversationTitle(conversationId, userInput, messageCount) {
    if(messageCount === 1){
        const title = userInput.slice(0, 50) + (userInput.length > 50 ? "..." : "");
        await chatService.updateConversationTitle(conversationId, title);
    }
}
async function chatLoop(conversation){
    const helpBox = boxen(
        `${chalk.gray('. Type your message and press Enter')}\n${chalk.gray('. Markdown formatting is supported in response')}\n${chalk.gray('. Type exit to end conversation')}\n${chalk.gray('. Press Ctrl+C to quit anytime')}`, {
            padding: 1,
            margin: 1,
            borderColor: "gray",
            borderStyle: "round",
            dimBorder: true
        }
    );
    
    console.log(helpBox);
    
    while(true){
        const userInput = await text({
            message: chalk.blue("Your message"),
            placeholder: "Type your message"
            // Remove the validate function for now
        });
        
        if(isCancel(userInput)){
            const exitBox = boxen(chalk.yellow("Chat session ended, goodbye"), {
                padding: 1,
                margin: 1,
                borderColor: "yellow",
                borderStyle: "round"
            });
            console.log(exitBox);
            process.exit(0);
        }
        
        // Add proper validation here
        if (!userInput || typeof userInput !== 'string') {
            console.log(chalk.yellow("Invalid input. Please try again."));
            continue;
        }
        
        const trimmedInput = userInput.trim();
        if(trimmedInput.length === 0){
            console.log(chalk.yellow("Message cannot be empty. Please try again."));
            continue;
        }
        
        if(trimmedInput.toLowerCase() === "exit"){
            const exitBox = boxen(chalk.yellow("Chat session ended, goodbye"), {
                padding: 1,
                margin: 1,
                borderColor: "yellow",
                borderStyle: "round"
            });
            console.log(exitBox);
            break;
        }
        
        await saveMessage(conversation.id, "user", trimmedInput);
        const messages = await chatService.getMessages(conversation.id);
        const aiResponse = await getAIResponse(conversation.id);
        await saveMessage(conversation.id, "assistant", aiResponse);
        await updateConversationTitle(conversation.id, trimmedInput, messages.length);
    }
}

export async function startChat(mode = "chat", conversationId = null) {
    try {
        intro(
            boxen(
                chalk.bold.cyan("CLI_HUB CHAT"), {
                    padding: 1,
                    margin: 1,
                    borderStyle: "double",
                    borderColor: "cyan"
                }
            )
        );
        
        const user = await getUserFromToken();
        const conversation = await initConversation(user.id, conversationId, mode);
        await chatLoop(conversation);
        outro(chalk.green('Thanks for Chatting'));
    }
    catch(e){
        const errorBox = boxen(chalk.red(e.message), {
            padding: 1,
            margin: 1,
            borderColor: "red",
            borderStyle: "round"
        });
        console.log(errorBox);
    }
}
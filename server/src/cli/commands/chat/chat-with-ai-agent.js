
// import chalk from "chalk";
// import boxen from "boxen";
// import {text, isCancel, cancel, intro, outro, multiselect} from "@clack/prompts";
// import yoctoSpinner from "yocto-spinner";
// import {marked} from "marked";
// import {markedTerminal} from "marked-terminal";
// import {AIService} from "../../ai/googel-service.js";
// import {ChatService} from "../../../service/chat-service.js";
// import {getStoredToken} from "../../../lib/token.js";
// import prisma from "../../../lib/db.js";
// import {
//     availableTools, 
//     enabledTools, 
//     getEnabledToolNames, 
//     getEnabledTools,
//     resetTools
// } from "../../../config/tool.config.js";
// import { generateApplication } from "../../../config/agent.config.js";
// import { title } from "process";
// import { error } from "console";


// const aiService = new AIService();
// const chatService = new ChatService();

// async function getUserFromToken() {
//     const token = await getStoredToken();
//     if(!token?.accessToken){
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

// async function initConversation(userId, conversationId = null, mode = "tool") {
//     const spinner = yoctoSpinner({text: "Loading conversation..."}).start();
//     const conversation = await chatService.getOrConversation(
//         userId,
//         conversationId,
//         mode
//     );
//     spinner.success("Conversation loaded");
    
//     const enabledToolNames = getEnabledToolNames();
//     const toolsDisplay = enabledToolNames.length > 0
//         ? `\n ${chalk.gray("Active Tools: ")}${enabledToolNames.join(", ")}`
//         : `\n${chalk.gray("No tools Enabled")}`;

//     const conversationInfo = boxen(
//         `${chalk.bold("Conversation")}: ${conversation.title}\n${chalk.gray("ID: " + conversation.id)}\n${chalk.gray("Mode: " + conversation.mode)}${toolsDisplay}`, {
//             padding: 1,
//             margin: 1,
//             borderColor: "cyan",
//             borderStyle: "round",
//             title: "Tool Calling Session",
//             titleAlignment: "center"
//         }
//     );
//     console.log(conversationInfo);
    
//     if(conversation.messages?.length > 0){
//         console.log(chalk.yellow("Previous messages:\n"));
//         displayMessages(conversation.messages);
//     }
//     return conversation;
// }

// async function saveMessage(conversationId, role, content) {
//     return await chatService.addMessage(conversationId, role, content);
// }

// async function  agentLoop(conversation) {

//     const helpBox=boxen(
//         `${chalk.cyan.bold("what can the agent do?")}\n\n`,
//         `${chalk.cyan('. Generate complete Application from descripton')}\n`,
//         {
//             padding:1,
//             margin:{bottom:1},
//             borderStyle:"round",
//             borderColor:"cyan",
//             title:"Agent instruction"
//         }
//     )
//     console.log(helpBox);
//     while(true){
//         const userInput=await text({
//             message:chalk.magenta("what would you like to build"),
//             placeholder:"describe your Application...",
//             validate(value){
//                 if(!value || value.trim().length===0){
//                     return "Description your application";
//                 }

//                 if(value.trim().length<10){
//                     return "Please provide more details(at least 10 character)";
//                 }
//             }
//         })
//         if(isCancel(userInput)){
//             console.log(chalk.yellow("\n Agent session cancelled\n"));
//             process.exit(0);
//         }
//         if(userInput.toLowerCase()==="exit"){
//             console.log(chalk.yellow("\n.  Agent session ended"));
//             break;
//         }

//         const userBox=boxen(chalk.white(userInput),{
//             padding:1,
//             margin:{top:1,bottom:1},
//             borderStyle:"round",
//             borderColor:"blue",
//             title:"Your request",
//             titleAlignment:"left"
//         });
//         console.log(userBox);

//         await saveMessage(conversation.id,"user",userInput);
//         try{
//  const result=await generateApplication(
//     userInput,
//     aiService,
//     process.cwd()
//  );
//  if(result && result.success){
//     const respondMessage=`Generated Application ${result.folderName}\n`+
//     `files created: ${result.files.length}\n`+
//     `Location: ${result.appDir}`+
//     `Set Up Commands:\n ${result.commands.join('\n')}`

//      await saveMessage(conversation.id,"assistant",respondMessage);
//      const continuePrompt=await confirm({
//     message:chalk.cyan("Wpuld you like to genrate the another applicaiotn "),
//     initialValue:false
//  })
//  if(cancel(continuePrompt) || !continuePrompt){
//     console.log(chalk.yellow("\n Great! Check Your new Application.\n"));
//     break;
//  }
//  }
// else{
//     throw new Error("Genreation Returned To no result");
// }



 
//         }
       
//         catch(e){
//         console.log(chalk.red(`\n. Error:  ${e.message}\n`));
//         await saveMessage(conversation.id,"assistant",`Error:${error.message}`);
//         const retry=await confirm({
//             message:chalk.cyan("Would you like to try again"),
//             initialValue:true
//         });

//         if(isCancel(retry) || !retry){
//             break;
//         }
//     }
//     }
    
    
// }

// export async function startAgentChat(conversationId=null){
//     try{
//         intro(
//             boxen(
//                 chalk.bold.magenta(" CLI-HUB - Agent Mode \n\n")+
//                 chalk.gray("Autonomous Application Generator"),
//                 {
//                     padding:1,
//                     borderStyle:"double",
//                     borderColor:"magenta"
//                 }
//             )
//         )
//         const user=await getUserFromToken();
//         const shouldContinue=await confirm({
//             message: chalk.yellow(". The agent will create files and folder int the current directory. Continue?"),
//             initialValue:true,
//         })

//         if(isCancel(shouldContinue) || !shouldContinue){
//             cancel(chalk.yellow("Agent mode cancelled"));
//             process.exit(0);
//         }
//         const conversation=initConversation(userId,conversationId);
//         await agentLoop(conversation);
//         outro(chalk.green.bold("\n. Thanks for using Agent Model"));

//     }
//     catch(e){
//        const errorBox=boxen(chalk.red(`Error: ${e.message}`),{
//         padding:1,
//         margin:1,
//         borderStyle:"round",
//         borderColor:"red"
//        });
//        console.log(errorBox);
//        process.exit(1);
//     }
// }





import chalk from "chalk";
import boxen from "boxen";
import {text, isCancel, cancel, intro, outro, multiselect, confirm} from "@clack/prompts"; // ADDED: confirm import
import yoctoSpinner from "yocto-spinner";
import {marked} from "marked";
import {markedTerminal} from "marked-terminal";
import {AIService} from "../../ai/googel-service.js";
import {ChatService} from "../../../service/chat-service.js";
import {getStoredToken} from "../../../lib/token.js";
import prisma from "../../../lib/db.js";
import {
    availableTools, 
    enabledTools, 
    getEnabledToolNames, 
    getEnabledTools,
    resetTools
} from "../../../config/tool.config.js";
import { generateApplication } from "../../../config/agent.config.js";


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

async function initConversation(userId, conversationId = null, mode = "tool") {
    const spinner = yoctoSpinner({text: "Loading conversation..."}).start();
    const conversation = await chatService.getOrConversation(
        userId,
        conversationId,
        mode
    );
    spinner.success("Conversation loaded");
    
    const enabledToolNames = getEnabledToolNames();
    const toolsDisplay = enabledToolNames.length > 0
        ? `\n ${chalk.gray("Active Tools: ")}${enabledToolNames.join(", ")}`
        : `\n${chalk.gray("No tools Enabled")}`;

    const conversationInfo = boxen(
        `${chalk.bold("Conversation")}: ${conversation.title}\n${chalk.gray("ID: " + conversation.id)}\n${chalk.gray("Mode: " + conversation.mode)}${toolsDisplay}`, {
            padding: 1,
            margin: 1,
            borderColor: "cyan",
            borderStyle: "round",
            title: "Tool Calling Session",
            titleAlignment: "center"
        }
    );
    console.log(conversationInfo);
    
    if(conversation.messages?.length > 0){
        console.log(chalk.yellow("Previous messages:\n"));
        displayMessages(conversation.messages);
    }
    return conversation;
}

function displayMessages(messages){
    messages.forEach((msg) => {
        if(msg.role === "user"){
            const userBox = boxen(chalk.white(msg.content), {
                padding: 1,
                margin: {left: 2, bottom: 1},
                borderStyle: "round",
                borderColor: "blue",
                title: "You",
                titleAlignment: "left"
            });
            console.log(userBox);
        }
        else if(msg.role === "assistant"){
            const renderedContent = marked.parse(msg.content);
            const assistantBox = boxen(renderedContent.trim(), {
                padding: 1,
                margin: {left: 2, bottom: 1},
                borderColor: "green",
                borderStyle: "round",
                title: "Assistant (with tools)",
                titleAlignment: "left",
            });
            console.log(assistantBox);
        }
    });
}

async function saveMessage(conversationId, role, content) {
    return await chatService.addMessage(conversationId, role, content);
}

async function  agentLoop(conversation) {

    const helpBox=boxen(
        `${chalk.cyan.bold("what can the agent do?")}\n\n` +  // FIXED: concatenation
        `${chalk.cyan('. Generate complete Application from descripton')}\n`,
        {
            padding:1,
            margin:{bottom:1},
            borderStyle:"round",
            borderColor:"cyan",
            title:"Agent instruction"
        }
    )
    console.log(helpBox);
    while(true){
        const userInput=await text({
            message:chalk.magenta("what would you like to build"),
            placeholder:"describe your Application...",
            validate(value){
                if(!value || value.trim().length===0){
                    return "Description your application";
                }

                if(value.trim().length<10){
                    return "Please provide more details(at least 10 character)";
                }
                return undefined; // ADDED: return undefined when validation passes
            }
        })
        if(isCancel(userInput)){
            console.log(chalk.yellow("\n Agent session cancelled\n"));
            process.exit(0);
        }
        if(userInput.toLowerCase()==="exit"){
            console.log(chalk.yellow("\n.  Agent session ended"));
            break;
        }

        const userBox=boxen(chalk.white(userInput),{
            padding:1,
            margin:{top:1,bottom:1},
            borderStyle:"round",
            borderColor:"blue",
            title:"Your request",
            titleAlignment:"left"
        });
        console.log(userBox);

        await saveMessage(conversation.id,"user",userInput);
        try{
 const result=await generateApplication(
    userInput,
    aiService,
    process.cwd()
 );
 if(result && result.success){
    const respondMessage=`Generated Application ${result.folderName}\n`+
    `files created: ${result.files.length}\n`+
    `Location: ${result.appDir}`+
    `Set Up Commands:\n ${result.commands.join('\n')}`

     await saveMessage(conversation.id,"assistant",respondMessage);
     const continuePrompt=await confirm({
    message:chalk.cyan("Would you like to generate another application?"), // FIXED: spelling
    initialValue:false
 })
 if(isCancel(continuePrompt) || !continuePrompt){ // FIXED: cancel to isCancel
    console.log(chalk.yellow("\n Great! Check Your new Application.\n"));
    break;
 }
 }
else{
    throw new Error("Generation Returned no result"); // FIXED: spelling
}



 
        }
       
        catch(e){
        console.log(chalk.red(`\n. Error:  ${e.message}\n`));
        await saveMessage(conversation.id,"assistant",`Error:${e.message}`); // FIXED: error to e
        const retry=await confirm({
            message:chalk.cyan("Would you like to try again"),
            initialValue:true
        });

        if(isCancel(retry) || !retry){
            break;
        }
    }
    }
    
    
}

export async function startAgentChat(conversationId=null){
    try{
        intro(
            boxen(
                chalk.bold.magenta(" CLI-HUB - Agent Mode \n\n")+
                chalk.gray("Autonomous Application Generator"),
                {
                    padding:1,
                    borderStyle:"double",
                    borderColor:"magenta"
                }
            )
        )
        const user=await getUserFromToken();
        const shouldContinue=await confirm({
            message: chalk.yellow(". The agent will create files and folder in the current directory. Continue?"), // FIXED: int to in
            initialValue:true,
        })

        if(isCancel(shouldContinue) || !shouldContinue){
            cancel(chalk.yellow("Agent mode cancelled"));
            process.exit(0);
        }
        const conversation=await initConversation(user.id,conversationId); // FIXED: userId to user.id, added await
        await agentLoop(conversation);
        outro(chalk.green.bold("\n. Thanks for using Agent Mode")); // FIXED: Model to Mode

    }
    catch(e){
       const errorBox=boxen(chalk.red(`Error: ${e.message}`),{
        padding:1,
        margin:1,
        borderStyle:"round",
        borderColor:"red"
       });
       console.log(errorBox);
       process.exit(1);
    }
}



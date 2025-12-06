// // 

// import {google} from "@ai-sdk/google"
// import {streamText} from "ai";
// import {config} from "../../config/google.config.js";
// import chalk from "chalk"

// export class AIService {
//     constructor() {
//         if(!config.googleApiKey) {
//             throw new Error("GOOGLE_API_KEY is not set in env");
//         }
//         this.model = google(config.model, {
//             apiKey: config.googleApiKey,
//         })
//     }

//     // @param {Array} Message
//     // @param {Function} onChunk
//     async sendMessage(messages, onChunk, tools = undefined, onToolCall = null) {
//         try {
//             console.log(chalk.gray('[Debug] === AIService.sendMessage() called ==='));
//             console.log(chalk.gray(`[Debug] Number of messages: ${messages.length}`));
            
//             let toolsArray = [];
            
//             // Convert tools object to array if needed
//             if(tools) {
//                 if(Array.isArray(tools)) {
//                     toolsArray = tools;
//                     console.log(chalk.gray(`[Debug] Tools received as array: ${toolsArray.length} tools`));
//                 } else if(typeof tools === 'object' && tools !== null) {
//                     // Convert object {key: tool} to array [tool]
//                     toolsArray = Object.values(tools);
//                     console.log(chalk.gray(`[Debug] Tools converted from object to array: ${toolsArray.length} tools`));
//                 }
                
//                 // Validate tool names
//                 if(toolsArray.length > 0) {
//                     console.log(chalk.gray('[Debug] Tool names validation:'));
//                     for(const tool of toolsArray) {
//                         console.log(chalk.gray(`[Debug]   Tool name: "${tool.name}", type: "${tool.type}"`));
                        
//                         // Check if tool name is valid for Google API
//                         if(tool.name && !/^[a-zA-Z_][a-zA-Z0-9_.:-]*$/.test(tool.name)) {
//                             console.error(chalk.red(`[ERROR] Invalid tool name format: "${tool.name}"`));
//                             console.error(chalk.red(`[ERROR] Must start with letter/underscore, only alphanumeric, _, ., :, - allowed`));
//                         }
//                     }
//                 }
//             }

//             const streamConfig = {
//                 model: this.model,
//                 messages: messages,
//             }
            
//             if(toolsArray.length > 0) {
//                 streamConfig.tools = toolsArray;
//                 streamConfig.maxSteps = 5;

//                 console.log(
//                     chalk.gray(`[Debug] Tools enabled: ${toolsArray.map(t => t.name).join(", ")}`)
//                 )
//             } else {
//                 console.log(chalk.gray(`[Debug] No tools enabled`));
//             }
            
//             console.log(chalk.gray(`[Debug] Starting stream with config:`, JSON.stringify({
//                 hasTools: toolsArray.length > 0,
//                 toolCount: toolsArray.length,
//                 model: config.model
//             }, null, 2)));
            
//             const result = streamText(streamConfig);
//             let fullResponse = "";
            
//             for await (const chunk of result.textStream) {
//                 fullResponse += chunk;
//                 if (onChunk) {
//                     onChunk(chunk);
//                 }
//             }
            
//             const toolCalls=[];
//             const toolResults=[];

//             if(result.steps && Array.isArray(result.steps) ) {
//                 for(const step of result.steps){
//                     if(step.toolCalls && step.toolCalls.length > 0){
//                         for(const toolCall of step.toolCalls){
//                             toolCalls.push(toolCall);

//                             if(onToolCall){
//                                 onToolCall(toolCall);
//                             }
//                         }
//                     }
//                     if(step.toolResults && step.toolResults.length > 0){
//                          toolResults.push(...step.toolResults)
//                     }
//                 }
//             }

//             console.log(chalk.gray(`[Debug] Stream completed successfully`));
//             console.log(chalk.gray(`[Debug] Response length: ${fullResponse.length}`));
//             console.log(chalk.gray(`[Debug] Tool calls made: ${toolCalls.length}`));

//             return {
//                 content: fullResponse,
//                 finishResponse: result.finishReason,
//                 usage: result.usage,
//                 toolCalls,
//                 toolResults,
//                 steps: result.steps
//             }
//         }
//         catch(error) {
//             console.log(chalk.red("[ERROR] AI service error:"));
//             console.log(chalk.red(`[ERROR] Message: ${error.message}`));
//             console.log(chalk.red(`[ERROR] Status code: ${error.statusCode || 'N/A'}`));
            
//             if(error.responseBody) {
//                 console.log(chalk.red(`[ERROR] Response body: ${error.responseBody}`));
//             }
            
//             if(error.requestBodyValues) {
//                 console.log(chalk.red(`[ERROR] Request body: ${JSON.stringify(error.requestBodyValues, null, 2)}`));
//             }
            
//             throw error;
//         }
//     }

//     async getMessage(messages, tools = undefined) {
//         let fullResponse = "";
//       const result = await this.sendMessage(messages, (chunk) => {
//             fullResponse += chunk;
//         }, tools);
//         return result.content;
//     }
// }

// google-service-direct-only.js









import { google } from "@ai-sdk/google"
import { streamText, generateText, generateObject } from "ai";
import { config } from "../../config/google.config.js";
import chalk from "chalk"

export class AIService {
    constructor() {
        if(!config.googleApiKey) {
            throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is not set in env");
        }
        
        console.log(chalk.gray('[AIService] Initializing with Google AI SDK'));
        console.log(chalk.gray(`[AIService] Model: ${config.model}`));
        
        this.model = google(config.model, {
            apiKey: config.googleApiKey,
        });
    }

    async sendMessage(messages, onChunk, tools = undefined, onToolCall = null) {
        try {
            console.log(chalk.gray('\n[AIService] sendMessage() called'));
            console.log(chalk.gray(`[AIService] Last message: "${messages[messages.length - 1]?.content}"`));
            
            // Configure stream
            const streamConfig = {
                model: this.model,
                messages: messages,
                maxSteps: 5,
            };
            
            // Check if we should add Google Search tool
            if (tools && Array.isArray(tools) && tools.length > 0) {
                console.log(chalk.gray(`[AIService] Processing ${tools.length} tools`));
                
                // Look for google_search tool
                const hasGoogleSearch = tools.some(tool => 
                    tool.name === "google_search" || 
                    (tool._def?.name && tool._def.name === "google_search")
                );
                
                if (hasGoogleSearch) {
                    console.log(chalk.gray('[AIService] Adding Google built-in search tool'));
                    
                    // Use Google's built-in search tool
                    streamConfig.tools = {
                        google_search: google.tools.googleSearch({
                            // Optional: add search options
                            apiKey: config.googleApiKey, // Same API key
                        })
                    };
                    
                    console.log(chalk.gray('[AIService] Google Search tool configured'));
                }
            } else {
                console.log(chalk.gray(`[AIService] No tools configured`));
            }
            
            console.log(chalk.gray(`[AIService] Starting stream...`));
            
            const result = streamText(streamConfig);
            let fullResponse = "";
            let toolCalls = [];
            
            // Stream the response
            for await (const chunk of result.textStream) {
                fullResponse += chunk;
                if (onChunk) {
                    onChunk(chunk);
                }
            }
            
            // Collect tool calls if any
            if (result.toolCalls) {
                toolCalls = result.toolCalls;
                console.log(chalk.gray(`[AIService] Tool calls made: ${toolCalls.length}`));
                
                // Notify about tool calls
                if (onToolCall && toolCalls.length > 0) {
                    toolCalls.forEach(tc => {
                        onToolCall({
                            toolName: tc.toolName,
                            args: tc.args
                        });
                    });
                }
            }
            
            console.log(chalk.gray(`[AIService] Stream completed`));
            console.log(chalk.gray(`[AIService] Response length: ${fullResponse.length} chars`));
            
            return {
                content: fullResponse,
                finishResponse: result.finishReason,
                usage: result.usage,
                toolCalls: toolCalls,
                toolResults: result.toolResults || [],
                providerMetadata: result.providerMetadata
            };
        }
        catch(error) {
            console.error(chalk.red("[AIService] Error:"));
            console.error(chalk.red(`[AIService] Message: ${error.message}`));
            
            if (error.responseBody) {
                try {
                    const errorBody = JSON.parse(error.responseBody);
                    console.error(chalk.red(`[AIService] Error details:`, JSON.stringify(errorBody.error, null, 2)));
                } catch (e) {
                    console.error(chalk.red(`[AIService] Response body: ${error.responseBody}`));
                }
            }
            
            throw error;
        }
    }

    async getMessage(messages, tools = undefined) {
        let fullResponse = "";
        const result = await this.sendMessage(messages, (chunk) => {
            fullResponse += chunk;
        }, tools);
        return result.content;
    }



    async generateStructured(schema,prompt){
        try{
            const result=await generateObject({
                model:this.model,
                schema:schema,
                prompt:prompt
            })
            return result.object;
        }
        catch(e){
            console.log(chalk.red("AI Structured Generation Error:"), e.message);
            throw error;
        }
    }
}



// import { google } from "@ai-sdk/google";
// import chalk from "chalk";

// export const availableTools = [
//     {
//         id: "google_search",
//         name: "Google Search",
//         description: "Search the web using Google",
//         getTool: () => {
//             console.log(chalk.gray('[Debug] Creating google_search tool'));
//             return {
//                 type: "function",
//                 name: "google_search",
//                 description: "Search the web using Google",
//                 parameters: {
//                     type: "object",
//                     properties: {
//                         query: {
//                             type: "string",
//                             description: "Search query"
//                         }
//                     },
//                     required: ["query"]
//                 }
//             };
//         },
//         enabled: false
//     },
//     {
//         id: 'code_execution',
//         name: 'Code Execution',
//         description: "Execute Python code",
//         getTool: () => {
//             console.log(chalk.gray('[Debug] Creating code_execution tool'));
//             return {
//                 type: "function",
//                 name: "code_execution",
//                 description: "Execute Python code",
//                 parameters: {
//                     type: "object",
//                     properties: {
//                         code: {
//                             type: "string",
//                             description: "Python code to execute"
//                         }
//                     },
//                     required: ["code"]
//                 }
//             };
//         },
//         enabled: false
//     },
//     {
//         id: 'url_context',
//         name: 'URL Context',
//         description: "Analyze content from a URL",
//         getTool: () => {
//             console.log(chalk.gray('[Debug] Creating url_context tool'));
//             return {
//                 type: "function",
//                 name: "url_context",
//                 description: "Analyze content from a URL",
//                 parameters: {
//                     type: "object",
//                     properties: {
//                         url: {
//                             type: "string",
//                             description: "URL to analyze"
//                         }
//                     },
//                     required: ["url"]
//                 }
//             };
//         },
//         enabled: false
//     }
// ];

// export function getEnabledTools() {
//     console.log(chalk.gray('[Debug] === getEnabledTools() called ==='));
//     const tools = {};
//     try {
//         console.log(chalk.gray('[Debug] Checking availableTools:'));
//         let foundEnabled = false;
        
//         for (const toolConfig of availableTools) {
//             console.log(chalk.gray(`[Debug] Tool ${toolConfig.id}: enabled=${toolConfig.enabled}`));
//             if (toolConfig.enabled) {
//                 foundEnabled = true;
//                 console.log(chalk.gray(`[Debug] Tool ${toolConfig.id} is enabled, creating tool...`));
//                 const tool = toolConfig.getTool();
//                 console.log(chalk.gray(`[Debug] Tool created:`, JSON.stringify({
//                     name: tool.name,
//                     type: tool.type
//                 }, null, 2)));
//                 tools[toolConfig.id] = tool;
//             }
//         }
        
//         console.log(chalk.gray(`[Debug] Found any enabled tools: ${foundEnabled}`));
//         console.log(chalk.gray(`[Debug] Final tools object keys: ${Object.keys(tools).join(", ")}`));
//         console.log(chalk.gray(`[Debug] Number of tools: ${Object.keys(tools).length}`));
        
//         if (Object.keys(tools).length > 0) {
//             console.log(chalk.gray(`[Debug] Tools enabled: ${Object.keys(tools).join(", ")}`));
//             return tools; // Return the tools object
//         } else {
//             console.log(chalk.yellow(`[Debug] No tools enabled, returning undefined`));
//             return undefined;
//         }
//     } catch (e) {
//         console.error(chalk.red('[Error] Failed to initialize tools: ', e.message));
//         console.error(chalk.yellow('Make sure you have @ai-sdk/google@latest version 2+ installed'));
//         console.error(chalk.yellow('Run: npm install @ai-sdk/google@latest'));
//         return undefined;
//     }
// }

// export function toggleTool(toolId) {
//     console.log(chalk.gray(`[DEBUG] toggleTool called for: ${toolId}`));
//     const tool = availableTools.find((t) => t.id === toolId);
//     if (tool) {
//         console.log(chalk.gray(`[DEBUG] Found tool ${tool.id}, current enabled=${tool.enabled}`));
//         tool.enabled = !tool.enabled;
//         console.log(
//             chalk.gray(`[DEBUG] Tool ${tool.id} enabled: ${tool.enabled}`)
//         );
//         return tool.enabled;
//     }
//     console.log(chalk.red(`[ERROR] Tool ${toolId} not found`));
//     return false;
// }

// export function enabledTools(toolIds) {
//     console.log(chalk.gray('[DEBUG] enabledTools called with: ', toolIds));
//     console.log(chalk.gray('[DEBUG] Current tool states before:'));
//     availableTools.forEach(tool => {
//         console.log(chalk.gray(`[DEBUG]   ${tool.id}: enabled=${tool.enabled}`));
//     });
    
//     availableTools.forEach((tool) => {
//         const wasEnabled = tool.enabled;
//         tool.enabled = toolIds.includes(tool.id);
//         if (tool.enabled !== wasEnabled) {
//             console.log(chalk.gray(`[DEBUG] Tool ${tool.id} enabled: ${tool.enabled}`));
//         }
//     });

//     console.log(chalk.gray('[DEBUG] Current tool states after:'));
//     availableTools.forEach(tool => {
//         console.log(chalk.gray(`[DEBUG]   ${tool.id}: enabled=${tool.enabled}`));
//     });
    
//     const enabledCount = availableTools.filter((t) => t.enabled).length;
//     console.log(chalk.gray('[DEBUG] Total tools enabled: ', enabledCount));
// }

// export function getEnabledToolNames() {
//     const names = availableTools.filter((t) => t.enabled).map((t) => t.name);
//     console.log(chalk.gray('[DEBUG] getEnabledToolNames called, returning: ', names));
//     console.log(chalk.gray('[DEBUG] Available tools status:'));
//     availableTools.forEach(tool => {
//         console.log(chalk.gray(`[DEBUG]   ${tool.id}: enabled=${tool.enabled}, name=${tool.name}`));
//     });
//     return names;
// }

// export function resetTools() {
//     console.log(chalk.gray('[DEBUG] resetTools called'));
//     availableTools.forEach((tool) => {
//         tool.enabled = false;
//     });
//     console.log(chalk.gray('[DEBUG] All Tools have been reset (disabled)'));
// }











import { google } from "@ai-sdk/google";
import chalk from "chalk";

export const availableTools = [
   {
        id: "google_search",
        name: "Google Search",
        description: "Search the web using Google's built-in search",
        getTool: () => {
            console.log(chalk.gray('[Debug] Creating google_search tool'));
            return {
                type: "function",
                name: "google_search",
                description: "Search the web using Google's built-in search",
                parameters: {
                    type: "object",
                    properties: {
                        query: {
                            type: "string",
                            description: "Search query"
                        }
                    },
                    required: ["query"]
                }
            };
        },
        enabled: false
    },
    {
        id: 'code_execution',
        name: 'Code Execution',
        description: "Execute Python code",
        getTool: () => {
            console.log(chalk.gray('[Debug] Creating code_execution tool'));
            return {
                type: "function",
                name: "code_execution",
                description: "Execute Python code",
                parameters: {
                    type: "object",
                    properties: {
                        code: {
                            type: "string",
                            description: "Python code to execute"
                        }
                    },
                    required: ["code"]
                }
            };
        },
        enabled: false
    },
    {
        id: 'url_context',
        name: 'URL Context',
        description: "Analyze content from a URL",
        getTool: () => {
            console.log(chalk.gray('[Debug] Creating url_context tool'));
            return {
                type: "function",
                name: "url_context",
                description: "Analyze content from a URL",
                parameters: {
                    type: "object",
                    properties: {
                        url: {
                            type: "string",
                            description: "URL to analyze"
                        }
                    },
                    required: ["url"]
                }
            };
        },
        enabled: false
    }
];

export function getEnabledTools() {
    console.log(chalk.gray('[Debug] === getEnabledTools() called ==='));
    const tools = [];
    try {
        console.log(chalk.gray('[Debug] Checking availableTools:'));
        
        for (const toolConfig of availableTools) {
            console.log(chalk.gray(`[Debug] Tool ${toolConfig.id}: enabled=${toolConfig.enabled}`));
            if (toolConfig.enabled) {
                console.log(chalk.gray(`[Debug] Tool ${toolConfig.id} is enabled, creating tool...`));
                const tool = toolConfig.getTool();
                
                // Ensure the tool has proper structure
                const validatedTool = {
                    type: tool.type || 'function',
                    name: tool.name,
                    description: tool.description || '',
                    parameters: tool.parameters || {
                        type: 'object',
                        properties: {},
                        required: []
                    }
                };
                
                console.log(chalk.gray(`[Debug] Tool created:`, JSON.stringify({
                    name: validatedTool.name,
                    type: validatedTool.type,
                    parameters: validatedTool.parameters.type
                }, null, 2)));
                
                tools.push(validatedTool);
            }
        }
        
        console.log(chalk.gray(`[Debug] Final tools array: ${tools.length} tools`));
        
        if (tools.length > 0) {
            console.log(chalk.gray(`[Debug] Tools enabled: ${tools.map(t => t.name).join(", ")}`));
            return tools;
        } else {
            console.log(chalk.yellow(`[Debug] No tools enabled, returning undefined`));
            return undefined;
        }
    } catch (e) {
        console.error(chalk.red('[Error] Failed to initialize tools: ', e.message));
        console.error(chalk.yellow('Make sure you have @ai-sdk/google@latest version 2+ installed'));
        console.error(chalk.yellow('Run: npm install @ai-sdk/google@latest'));
        return undefined;
    }
}

export function toggleTool(toolId) {
    console.log(chalk.gray(`[DEBUG] toggleTool called for: ${toolId}`));
    const tool = availableTools.find((t) => t.id === toolId);
    if (tool) {
        console.log(chalk.gray(`[DEBUG] Found tool ${tool.id}, current enabled=${tool.enabled}`));
        tool.enabled = !tool.enabled;
        console.log(
            chalk.gray(`[DEBUG] Tool ${tool.id} enabled: ${tool.enabled}`)
        );
        return tool.enabled;
    }
    console.log(chalk.red(`[ERROR] Tool ${toolId} not found`));
    return false;
}

export function enabledTools(toolIds) {
    console.log(chalk.gray('[DEBUG] enabledTools called with: ', toolIds));
    console.log(chalk.gray('[DEBUG] Current tool states before:'));
    availableTools.forEach(tool => {
        console.log(chalk.gray(`[DEBUG]   ${tool.id}: enabled=${tool.enabled}`));
    });
    
    availableTools.forEach((tool) => {
        const wasEnabled = tool.enabled;
        tool.enabled = toolIds.includes(tool.id);
        if (tool.enabled !== wasEnabled) {
            console.log(chalk.gray(`[DEBUG] Tool ${tool.id} enabled: ${tool.enabled}`));
        }
    });

    console.log(chalk.gray('[DEBUG] Current tool states after:'));
    availableTools.forEach(tool => {
        console.log(chalk.gray(`[DEBUG]   ${tool.id}: enabled=${tool.enabled}`));
    });
    
    const enabledCount = availableTools.filter((t) => t.enabled).length;
    console.log(chalk.gray('[DEBUG] Total tools enabled: ', enabledCount));
}

export function getEnabledToolNames() {
    const names = availableTools.filter((t) => t.enabled).map((t) => t.name);
    console.log(chalk.gray('[DEBUG] getEnabledToolNames called, returning: ', names));
    console.log(chalk.gray('[DEBUG] Available tools status:'));
    availableTools.forEach(tool => {
        console.log(chalk.gray(`[DEBUG]   ${tool.id}: enabled=${tool.enabled}, name=${tool.name}`));
    });
    return names;
}

export function resetTools() {
    console.log(chalk.gray('[DEBUG] resetTools called'));
    availableTools.forEach((tool) => {
        tool.enabled = false;
    });
    console.log(chalk.gray('[DEBUG] All Tools have been reset (disabled)'));
}
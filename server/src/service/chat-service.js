// import prisma from "../lib/db.js";
// export class ChatService{
//     async createConversation(userId,mode="chat",title=null){
//         const conversation=await prisma.conversation.create({
//             data:{
//                 userId,
//                 mode,
//                 title:title || `new ${mode} conversation`
            
//             }
//         })
//     }
//     async getOrConversation(userId,conversationId=null,mode="chat"){
//         if(conversationId){
//             const conversation=await prisma.conversation.findFirst({
//                 where:{
//                     id:conversationId,
//                     userId
//                 },
//                 include:{
//                 messages:{
//                     orderBy:{
//                         createdAt:"asc"
//                     }
//                 }
//             }
//             })
//             if(conversation) return conversation
            
           
//         }
//         return this.createConversation(userId,mode);
    
//     }
//     async addMessage(conversationId,role,content){
// const contentStr=typeof content ==="string" ? content : JSON.stringify(content)
//         return await prisma.message.create({
//             data:{
//                 conversationId,
//                 role,
//                 content:contentStr
//             }
//         })
    
//     }
//     async getMessages(conversationId){
//         const messages= await prisma.message.findMany({
//             where:{
//                 conversationId
//             },
//             orderBy:{
//                 createdAt:"asc"
//             }
//         })
//         return messages.map((msg)=>({
//             ...msg,
//             content:this.parseContent(msg.content)
//         }))
//     }
//     async deleteConversation(conversationId){
//         return await prisma.conversation.deleteMany({
//             where:{
//                 id:conversationId,
//                 userId
//             }
//         })
//     }
//     async getUserConversations(userId){
//         return await prisma.conversation.findMany({
//             where:{
//                 userId
//             },
//             orderBy:{
//                 updatedAt:"desc"
//             },
//             include:{
//                 messages:{
//                     orderBy:{
//                         createdAt:"desc"
//                     },
//                     take:1
//                 }
//             }
        
//         })
//     }

//   parseContent(content){
//     try{
//         return JSON.parse(content)
//     }
//     catch(e){
//         return content
//     }
//   }
//      formatMessagesForAi(messages){
//         return messages.map((msg)=>({
//             role:msg.role,
//             content:typeof msg.content ==="string" ? msg.content : JSON.stringify(msg.content)
//         }))
     
//      }

// }
import prisma from "../lib/db.js"; // Fixed import path - removed one directory level
export class ChatService{
    async createConversation(userId, mode = "chat", title = null){
        const conversation = await prisma.conversation.create({
            data: {
                userId,
                mode,
                title: title || `New ${mode} conversation`
            }
        });
        return conversation; // Added return statement
    }
    
    async getOrConversation(userId, conversationId = null, mode = "chat"){
        if(conversationId){
            const conversation = await prisma.conversation.findFirst({
                where: {
                    id: conversationId,
                    userId
                },
                include: {
                    messages: {
                        orderBy: {
                            createdAt: "asc"
                        }
                    }
                }
            });
            if(conversation) return conversation;
        }
        return await this.createConversation(userId, mode); // Added await
    }
    
    async addMessage(conversationId, role, content){
        const contentStr = typeof content === "string" ? content : JSON.stringify(content);
        return await prisma.message.create({
            data: {
                conversationId,
                role,
                content: contentStr
            }
        });
    }
    
    async getMessages(conversationId){
        const messages = await prisma.message.findMany({
            where: {
                conversationId
            },
            orderBy: {
                createdAt: "asc"
            }
        });
        return messages.map((msg) => ({
            ...msg,
            content: this.parseContent(msg.content)
        }));
    }
    
    async deleteConversation(conversationId, userId){ // Added userId parameter
        return await prisma.conversation.deleteMany({
            where: {
                id: conversationId,
                userId // Now uses the parameter
            }
        });
    }
    
    async getUserConversations(userId){
        return await prisma.conversation.findMany({
            where: {
                userId
            },
            orderBy: {
                updatedAt: "desc"
            },
            include: {
                messages: {
                    orderBy: {
                        createdAt: "desc"
                    },
                    take: 1
                }
            }
        });
    }

    async updateConversationTitle(conversationId, title){ // Added missing method
        return await prisma.conversation.update({
            where: {
                id: conversationId
            },
            data: {
                title
            }
        });
    }

    parseContent(content){
        try {
            return JSON.parse(content);
        }
        catch(e) {
            return content;
        }
    }
    
    formatMessagesForAi(messages){
        return messages.map((msg) => ({
            role: msg.role,
            content: typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content)
        }));
    }
}
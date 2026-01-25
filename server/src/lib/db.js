import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;
const prisma=new PrismaClient();
if(process.env.NODE_ENV!="production") globalForPrisma.prisma=prisma;
export default prisma
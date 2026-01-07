import type { PrismaClient } from '@prisma/client/edge';

// Type declaration for the Prisma client with accelerate extension
// The actual implementation uses a Proxy for lazy initialization
declare const prisma: PrismaClient;
export default prisma;

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: any
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    accelerateUrl: process.env.PRISMA_DATABASE_URL,
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

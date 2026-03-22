import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  trustedOrigins: [process.env.CORS_ORIGIN || 'http://localhost:5173'],
  secret: process.env.AUTH_SECRET || 'fallback-secret-32-chars-long-xyz',
  baseURL: process.env.AUTH_URL || 'http://localhost:3001',
})

export type Auth = typeof auth

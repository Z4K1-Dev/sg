import { PrismaAdapter } from '@auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import { compare } from 'bcryptjs';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Github from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import { z } from 'zod';

const prisma = new PrismaClient();

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env['GOOGLE_CLIENT_ID']!,
      clientSecret: process.env['GOOGLE_CLIENT_SECRET']!,
    }),
    Github({
      clientId: process.env['GITHUB_CLIENT_ID']!,
      clientSecret: process.env['GITHUB_CLIENT_SECRET']!,
    }),
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse({
            email: credentials.email,
            password: credentials.password
          });

        if (!parsedCredentials.success) {
          return null;
        }

        const { email, password } = parsedCredentials.data;

        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.password) return null;

        // Compare password
        const passwordsMatch = await compare(password, user.password);

        if (passwordsMatch) {
          // Create activity log for successful login
          await prisma.activityLog.create({
            data: {
              type: 'LOGIN',
              action: 'user_login',
              description: `User ${user.email} logged in`,
              userId: user.id,
              entityId: user.id,
              entityType: 'User',
              ipAddress: '', // Would get from request in actual implementation
              userAgent: '', // Would get from request in actual implementation
            },
          });
          
          return user;
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async session({ session, user }: { session: any; user: any }) {
      if (session.user && user) {
        session.user.id = user.id;
        session.user.role = user.role;
      }
      return session;
    },
    
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env['NEXTAUTH_SECRET']!,
  session: {
    strategy: 'jwt' as const, // Use JWT strategy to avoid database session lookups that may cause the error
  },
};

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth(authOptions);
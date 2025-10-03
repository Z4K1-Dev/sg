import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Github from 'next-auth/providers/github';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import { compare } from 'bcryptjs';
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
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          
          // Find user by email
          const user = await prisma.user.findUnique({
            where: { email: email },
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
                ipAddress: '', // Would get from request in actual step in actual implementation
                userAgent: '', // Would get from request in actual implementation
              },
            });
            
            return user;
          }
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async session({ session, user }: { session: any; user: any }) {
      if (session.user && user) {
        session.user.id = user.id;
        session.user.role = user.role || user.userRole; // Fallback to different property name
      }
      return session;
    },
    
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token['id'] = user.id;
        token['role'] = user.role;
      }
      return token;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env['NEXTAUTH_SECRET']!,
};

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth(authOptions);
import { appRouter } from '@/lib/trpc/root';
import { createTRPCContext } from '@/lib/trpc/server';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { auth } from '@/lib/auth';

const handler = async (req: Request) => {
  const session = await auth();
  
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: (opts) => createTRPCContext({ 
      req: opts.req as any,
      session 
    }),
  });
};

export { handler as GET, handler as POST };

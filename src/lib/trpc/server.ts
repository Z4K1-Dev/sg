import { db } from '@/lib/db';
import { initTRPC } from '@trpc/server';
import superjson from 'superjson';
import { ZodError } from 'zod';

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 */

interface CreateContextOptions {
  req?: any;
  session?: any;
}

/**
 * This helper generates the "internals" for a tRPC context. If you need to use it, you can export it from
 * here.
 *
 * Examples of things you may need it for:
 * - testing, so we don't have to mock Next.js' req/res
 * - tRPC's `createSSGHelpers`, where we don't have req/res
 *
 * @see https://create.t3.gg/en/usage/trpc#-serverapirelts
 */
const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    db,
    req: opts.req,
    session: opts.session,
  };
};

/**
 * This is the actual context you will use in your router. It will be used to process every request
 * that goes through your tRPC endpoint.
 *
 * @see https://trpc.io/docs/context
 */
export const createTRPCContext = (opts: any) => {
  const { req } = opts;

  return createInnerTRPCContext({
    req,
    session: opts.session,
  });
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * 3. ROUTER & PROCEDURES
 *
 * These are the pieces you use to build your tRPC API. You can import these a lot in the
 * "/src/server/api/routers" directory, hence the export.
 */


/**
 * Create a router
 */
export const router = t.router;
export const publicProcedure = t.procedure;

/**
 * Protected (authenticated) procedure
 */
const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new Error("You must be logged in to perform this action");
  }
  return next({
    ctx: {
      ...ctx,
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);
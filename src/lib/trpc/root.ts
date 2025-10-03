import { categoriesRouter } from './routers/categories';
import { notificationsRouter } from './routers/notifications';
import { postsRouter } from './routers/posts';
import { reportsRouter } from './routers/reports';
import { statusesRouter } from './routers/statuses';
import { tagsRouter } from './routers/tags';
import { router } from './server';

/**
 * This is the main router for your tRPC API.
 * It aggregates all the routers in your application.
 */
export const appRouter = router({
  posts: postsRouter,
  categories: categoriesRouter,
  tags: tagsRouter,
  reports: reportsRouter,
  statuses: statusesRouter,
  notifications: notificationsRouter,
});

export type AppRouter = typeof appRouter;
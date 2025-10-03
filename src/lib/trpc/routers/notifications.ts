import { z } from 'zod';
import { publicProcedure, router } from '../server';

/**
 * Notifications router with CRUD operations
 */
export const notificationsRouter = router({
  // Get all notifications with pagination and filtering
  getAll: publicProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(10),
      userId: z.string().optional(),
      type: z.enum(['INFO', 'WARNING', 'ERROR', 'SUCCESS']).optional(),
      isRead: z.boolean().optional(),
    }))
    .query(async ({ input, ctx }) => {
      const { page, limit, userId, type, isRead } = input;
      const skip = (page - 1) * limit;

      const where = {
        ...(userId && { userId }),
        ...(type && { type }),
        ...(isRead !== undefined && { isRead }),
      };

      const [notifications, total] = await Promise.all([
        ctx.db.notification.findMany({
          where,
          orderBy: {
            createdAt: 'desc',
          },
          skip,
          take: limit,
        }),
        ctx.db.notification.count({ where }),
      ]);

      return {
        notifications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    }),

  // Get single notification by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const notification = await ctx.db.notification.findFirst({
        where: {
          id: input.id,
        },
      });

      if (!notification) {
        throw new Error('Notification not found');
      }

      return notification;
    }),

  // Create new notification
  create: publicProcedure
    .input(z.object({
      title: z.string().min(1),
      message: z.string().min(1),
      type: z.enum(['INFO', 'WARNING', 'ERROR', 'SUCCESS']).default('INFO'),
      userId: z.string().optional(),
      data: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { title, message, type, userId, data } = input;

      const createData: any = {
        title,
        message,
        type,
      };

      if (userId !== undefined) {
        createData.userId = userId;
      }

      if (data !== undefined) {
        createData.data = data;
      }

      const notification = await ctx.db.notification.create({
        data: createData,
      });

      return notification;
    }),

  // Mark notification as read
  markAsRead: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const notification = await ctx.db.notification.findFirst({
        where: {
          id: input.id,
        },
      });

      if (!notification) {
        throw new Error('Notification not found');
      }

      const updatedNotification = await ctx.db.notification.update({
        where: { id: input.id },
        data: {
          isRead: true,
        },
      });

      return updatedNotification;
    }),

  // Mark all notifications as read for a user
  markAllAsRead: publicProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { userId } = input;

      const result = await ctx.db.notification.updateMany({
        where: {
          userId,
          isRead: false,
        },
        data: {
          isRead: true,
        },
      });

      return {
        success: true,
        count: result.count,
      };
    }),

  // Delete notification
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const notification = await ctx.db.notification.findFirst({
        where: {
          id: input.id,
        },
      });

      if (!notification) {
        throw new Error('Notification not found');
      }

      await ctx.db.notification.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Get unread count for a user
  getUnreadCount: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input, ctx }) => {
      const { userId } = input;

      const count = await ctx.db.notification.count({
        where: {
          userId,
          isRead: false,
        },
      });

      return { count };
    }),

  // Create bulk notifications
  createBulk: publicProcedure
    .input(z.object({
      notifications: z.array(z.object({
        title: z.string().min(1),
        message: z.string().min(1),
        type: z.enum(['INFO', 'WARNING', 'ERROR', 'SUCCESS']).default('INFO'),
        userId: z.string().optional(),
        data: z.string().optional(),
      })),
    }))
    .mutation(async ({ input, ctx }) => {
      const { notifications } = input;

      const processedNotifications = notifications.map(notification => {
        const processed: any = {
          title: notification.title,
          message: notification.message,
          type: notification.type,
        };

        if (notification.userId !== undefined) {
          processed.userId = notification.userId;
        }

        if (notification.data !== undefined) {
          processed.data = notification.data;
        }

        return processed;
      });

      const createdNotifications = await ctx.db.notification.createMany({
        data: processedNotifications,
      });

      return {
        success: true,
        count: createdNotifications.count,
      };
    }),
});
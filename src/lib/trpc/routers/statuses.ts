import { z } from 'zod';
import { protectedProcedure, router } from '../server';

// Helper function to log activity
async function logActivity(
  ctx: any,
  type: 'CREATE' | 'UPDATE' | 'DELETE',
  action: string,
  description: string,
  entityId?: string,
  entityType?: string,
  oldData?: any,
  newData?: any
) {
  try {
    await ctx.db.activityLog.create({
      data: {
        type,
        action,
        description,
        userId: ctx.session.user.id,
        entityId,
        entityType,
        metadata: JSON.stringify({
          oldData,
          newData,
          timestamp: new Date().toISOString(),
        }),
        ipAddress: ctx.req?.headers?.['x-forwarded-for'] || ctx.req?.socket?.remoteAddress,
        userAgent: ctx.req?.headers['user-agent'],
      },
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}

/**
 * Statuses router with CRUD operations
 */
export const statusesRouter = router({
  // Get all statuses
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      const statuses = await ctx.db.status.findMany({
        orderBy: {
          order: 'asc',
        },
      });

      return statuses;
    }),

  // Get single status by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const status = await ctx.db.status.findFirst({
        where: {
          id: input.id,
        },
      });

      if (!status) {
        throw new Error('Status not found');
      }

      return status;
    }),

  // Create new status
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      color: z.string().default('#6c757d'),
      order: z.number().default(0),
    }))
    .mutation(async ({ input, ctx }) => {
      const { name, description, color, order } = input;

      // Check if status name already exists
      const existingStatus = await ctx.db.status.findFirst({
        where: {
          name,
        },
      });

      if (existingStatus) {
        throw new Error('Status with this name already exists');
      }

      const createData: any = {
        name,
        color,
        order,
      };

      if (description !== undefined) {
        createData.description = description;
      }

      const status = await ctx.db.status.create({
        data: createData,
      });

      // Log activity
      await logActivity(
        ctx,
        'CREATE',
        'status_created',
        `Status "${status.name}" created`,
        status.id,
        'Status',
        null,
        status
      );

      return status;
    }),

  // Update existing status
  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(1),
      description: z.string().optional(),
      color: z.string(),
      order: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, name, description, color, order } = input;

      // Check if status exists
      const existingStatus = await ctx.db.status.findFirst({
        where: {
          id,
        },
      });

      if (!existingStatus) {
        throw new Error('Status not found');
      }

      // Store old data for logging
      const oldStatus = { ...existingStatus };

      // Check if name already exists (excluding current status)
      const duplicateStatus = await ctx.db.status.findFirst({
        where: {
          name,
          id: { not: id },
        },
      });

      if (duplicateStatus) {
        throw new Error('Status with this name already exists');
      }

      const updateData: any = {
        name,
        color,
        order,
      };

      if (description !== undefined) {
        updateData.description = description;
      }

      const status = await ctx.db.status.update({
        where: { id },
        data: updateData,
      });

      // Log activity
      await logActivity(
        ctx,
        'UPDATE',
        'status_updated',
        `Status "${status.name}" updated`,
        status.id,
        'Status',
        oldStatus,
        status
      );

      return status;
    }),

  // Delete status
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const status = await ctx.db.status.findFirst({
        where: {
          id: input.id,
        },
        include: {
          _count: {
            select: {
              reports: true,
            },
          },
        },
      });

      if (!status) {
        throw new Error('Status not found');
      }

      if (status._count.reports > 0) {
        throw new Error('Cannot delete status with existing reports');
      }

      // Store status data for logging
      const statusData = { ...status };

      await ctx.db.status.delete({
        where: { id: input.id },
      });

      // Log activity
      await logActivity(
        ctx,
        'DELETE',
        'status_deleted',
        `Status "${status.name}" deleted`,
        status.id,
        'Status',
        statusData,
        null
      );

      return { success: true };
    }),

  // Reorder statuses
  reorder: protectedProcedure
    .input(z.object({
      statusOrders: z.array(z.object({
        id: z.string(),
        order: z.number(),
      })),
    }))
    .mutation(async ({ input, ctx }) => {
      const { statusOrders } = input;

      // Update all statuses in a transaction
      await ctx.db.$transaction(async (tx) => {
        for (const statusOrder of statusOrders) {
          await tx.status.update({
            where: { id: statusOrder.id },
            data: { order: statusOrder.order },
          });
        }
      });

      return { success: true };
    }),
});
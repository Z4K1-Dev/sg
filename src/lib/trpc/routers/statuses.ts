import { z } from 'zod';
import { publicProcedure, router } from '../server';

/**
 * Statuses router with CRUD operations
 */
export const statusesRouter = router({
  // Get all statuses
  getAll: publicProcedure
    .query(async ({ ctx }) => {
      const statuses = await ctx.db.status.findMany({
        orderBy: {
          order: 'asc',
        },
      });

      return statuses;
    }),

  // Get single status by ID
  getById: publicProcedure
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
  create: publicProcedure
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

      return status;
    }),

  // Update existing status
  update: publicProcedure
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

      return status;
    }),

  // Delete status
  delete: publicProcedure
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

      await ctx.db.status.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Reorder statuses
  reorder: publicProcedure
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
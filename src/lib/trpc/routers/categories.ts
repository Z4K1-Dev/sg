import { z } from 'zod';
import { protectedProcedure, router } from '../server';

// Helper function to generate slug
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

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
 * Categories router with CRUD operations
 */
export const categoriesRouter = router({
  // Get all categories with filtering
  getAll: protectedProcedure
    .input(z.object({
      type: z.enum(['POST', 'PAGE']).optional(),
      search: z.string().optional(),
    }))
    .query(async ({ input, ctx }) => {
      const { type, search } = input;

      const where = {
        deletedAt: null,
        ...(type && { type }),
        ...(search && {
          OR: [
            { name: { contains: search } },
            { description: { contains: search } },
          ],
        }),
      };

      const categories = await ctx.db.category.findMany({
        where,
        include: {
          _count: {
            select: {
              posts: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      });

      return categories;
    }),

  // Get single category by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const category = await ctx.db.category.findFirst({
        where: {
          id: input.id,
          deletedAt: null,
        },
        include: {
          _count: {
            select: {
              posts: true,
            },
          },
        },
      });

      if (!category) {
        throw new Error('Category not found');
      }

      return category;
    }),

  // Create new category
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      type: z.enum(['POST', 'PAGE']).default('POST'),
    }))
    .mutation(async ({ input, ctx }) => {
      const { name, description, type } = input;

      // Generate slug from name
      const slug = generateSlug(name);

      // Check if slug already exists
      const existingCategory = await ctx.db.category.findFirst({
        where: {
          slug,
          deletedAt: null,
        },
      });

      if (existingCategory) {
        throw new Error('Category with this name already exists');
      }

      const createData: any = {
        name,
        slug,
        type,
      };

      if (description !== undefined) {
        createData.description = description;
      }

      const category = await ctx.db.category.create({
        data: createData,
      });

      // Log activity
      await logActivity(
        ctx,
        'CREATE',
        'category_created',
        `Category "${category.name}" created`,
        category.id,
        'Category',
        null,
        category
      );

      return category;
    }),

  // Update existing category
  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(1),
      description: z.string().optional(),
      type: z.enum(['POST', 'PAGE']),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, name, description, type } = input;

      // Check if category exists
      const existingCategory = await ctx.db.category.findFirst({
        where: {
          id,
          deletedAt: null,
        },
      });

      if (!existingCategory) {
        throw new Error('Category not found');
      }

      // Store old data for logging
      const oldCategory = { ...existingCategory };

      // Generate new slug if name changed
      const slug = generateSlug(name);

      // Check if slug already exists (excluding current category)
      const duplicateCategory = await ctx.db.category.findFirst({
        where: {
          slug,
          deletedAt: null,
          id: { not: id },
        },
      });

      if (duplicateCategory) {
        throw new Error('Category with this name already exists');
      }

      const updateData: any = {
        name,
        slug,
        type,
      };

      if (description !== undefined) {
        updateData.description = description;
      }

      const category = await ctx.db.category.update({
        where: { id },
        data: updateData,
      });

      // Log activity
      await logActivity(
        ctx,
        'UPDATE',
        'category_updated',
        `Category "${category.name}" updated`,
        category.id,
        'Category',
        oldCategory,
        category
      );

      return category;
    }),

  // Soft delete category
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const category = await ctx.db.category.findFirst({
        where: {
          id: input.id,
          deletedAt: null,
        },
        include: {
          _count: {
            select: {
              posts: true,
            },
          },
        },
      });

      if (!category) {
        throw new Error('Category not found');
      }

      if (category._count.posts > 0) {
        throw new Error('Cannot delete category with existing posts');
      }

      // Store category data for logging
      const categoryData = { ...category };

      await ctx.db.category.update({
        where: { id: input.id },
        data: {
          deletedAt: new Date(),
        },
      });

      // Log activity
      await logActivity(
        ctx,
        'DELETE',
        'category_deleted',
        `Category "${category.name}" deleted`,
        category.id,
        'Category',
        categoryData,
        null
      );

      return { success: true };
    }),
});
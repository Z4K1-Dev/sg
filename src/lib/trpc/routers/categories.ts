import { z } from 'zod';
import { publicProcedure, router } from '../server';

/**
 * Categories router with CRUD operations
 */
export const categoriesRouter = router({
  // Get all categories with filtering
  getAll: publicProcedure
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
  getById: publicProcedure
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
  create: publicProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      type: z.enum(['POST', 'PAGE']).default('POST'),
    }))
    .mutation(async ({ input, ctx }) => {
      const { name, description, type } = input;

      // Generate slug from name
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

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

      return category;
    }),

  // Update existing category
  update: publicProcedure
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

      // Generate new slug if name changed
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

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

      return category;
    }),

  // Soft delete category
  delete: publicProcedure
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

      await ctx.db.category.update({
        where: { id: input.id },
        data: {
          deletedAt: new Date(),
        },
      });

      return { success: true };
    }),
});
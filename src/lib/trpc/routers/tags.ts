import { z } from 'zod';
import { publicProcedure, router } from '../server';

/**
 * Tags router with CRUD operations
 */
export const tagsRouter = router({
  // Get all tags with search
  getAll: publicProcedure
    .input(z.object({
      search: z.string().optional(),
    }))
    .query(async ({ input, ctx }) => {
      const { search } = input;

      const where = {
        deletedAt: null,
        ...(search && {
          OR: [
            { name: { contains: search } },
          ],
        }),
      };

      const tags = await ctx.db.tag.findMany({
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

      return tags;
    }),

  // Get single tag by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const tag = await ctx.db.tag.findFirst({
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

      if (!tag) {
        throw new Error('Tag not found');
      }

      return tag;
    }),

  // Create new tag
  create: publicProcedure
    .input(z.object({
      name: z.string().min(1),
    }))
    .mutation(async ({ input, ctx }) => {
      const { name } = input;

      // Generate slug from name
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      // Check if slug already exists
      const existingTag = await ctx.db.tag.findFirst({
        where: {
          slug,
          deletedAt: null,
        },
      });

      if (existingTag) {
        throw new Error('Tag with this name already exists');
      }

      const tag = await ctx.db.tag.create({
        data: {
          name,
          slug,
        },
      });

      return tag;
    }),

  // Update existing tag
  update: publicProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(1),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, name } = input;

      // Check if tag exists
      const existingTag = await ctx.db.tag.findFirst({
        where: {
          id,
          deletedAt: null,
        },
      });

      if (!existingTag) {
        throw new Error('Tag not found');
      }

      // Generate new slug
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      // Check if slug already exists (excluding current tag)
      const duplicateTag = await ctx.db.tag.findFirst({
        where: {
          slug,
          deletedAt: null,
          id: { not: id },
        },
      });

      if (duplicateTag) {
        throw new Error('Tag with this name already exists');
      }

      const tag = await ctx.db.tag.update({
        where: { id },
        data: {
          name,
          slug,
        },
      });

      return tag;
    }),

  // Soft delete tag
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const tag = await ctx.db.tag.findFirst({
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

      if (!tag) {
        throw new Error('Tag not found');
      }

      if (tag._count.posts > 0) {
        throw new Error('Cannot delete tag with existing posts');
      }

      await ctx.db.tag.update({
        where: { id: input.id },
        data: {
          deletedAt: new Date(),
        },
      });

      return { success: true };
    }),

  // Get popular tags
  getPopular: publicProcedure
    .input(z.object({
      limit: z.number().default(10),
    }))
    .query(async ({ input, ctx }) => {
      const { limit } = input;

      const tags = await ctx.db.tag.findMany({
        where: {
          deletedAt: null,
        },
        include: {
          _count: {
            select: {
              posts: true,
            },
          },
        },
        orderBy: {
          posts: {
            _count: 'desc',
          },
        },
        take: limit,
      });

      return tags;
    }),
});
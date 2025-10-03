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
 * Tags router with CRUD operations
 */
export const tagsRouter = router({
  // Get all tags with search
  getAll: protectedProcedure
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
  getById: protectedProcedure
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
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
    }))
    .mutation(async ({ input, ctx }) => {
      const { name } = input;

      // Generate slug from name
      const slug = generateSlug(name);

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

      // Log activity
      await logActivity(
        ctx,
        'CREATE',
        'tag_created',
        `Tag "${tag.name}" created`,
        tag.id,
        'Tag',
        null,
        tag
      );

      return tag;
    }),

  // Update existing tag
  update: protectedProcedure
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

      // Store old data for logging
      const oldTag = { ...existingTag };

      // Generate new slug
      const slug = generateSlug(name);

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

      // Log activity
      await logActivity(
        ctx,
        'UPDATE',
        'tag_updated',
        `Tag "${tag.name}" updated`,
        tag.id,
        'Tag',
        oldTag,
        tag
      );

      return tag;
    }),

  // Soft delete tag
  delete: protectedProcedure
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

      // Store tag data for logging
      const tagData = { ...tag };

      await ctx.db.tag.update({
        where: { id: input.id },
        data: {
          deletedAt: new Date(),
        },
      });

      // Log activity
      await logActivity(
        ctx,
        'DELETE',
        'tag_deleted',
        `Tag "${tag.name}" deleted`,
        tag.id,
        'Tag',
        tagData,
        null
      );

      return { success: true };
    }),

  // Get popular tags
  getPopular: protectedProcedure
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
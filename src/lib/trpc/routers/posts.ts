import { z } from 'zod';
import { protectedProcedure, router } from '../server';

// Helper function to generate slug
function generateSlug(title: string): string {
  return title
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
 * Posts router with CRUD operations
 */
export const postsRouter = router({
  // Get all posts with pagination and filtering
  getAll: protectedProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(10),
      search: z.string().optional(),
      categoryId: z.string().optional(),
      status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
      authorId: z.string().optional(),
    }))
    .query(async ({ input, ctx }) => {
      const { page, limit, search, categoryId, status, authorId } = input;
      const skip = (page - 1) * limit;

      const where = {
        deletedAt: null,
        ...(search && {
          OR: [
            { title: { contains: search } },
            { content: { contains: search } },
            { excerpt: { contains: search } },
          ],
        }),
        ...(categoryId && { categoryId }),
        ...(status && { status }),
        ...(authorId && { authorId }),
      };

      const [posts, total] = await Promise.all([
        ctx.db.post.findMany({
          where,
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
            category: true,
            tags: {
              include: {
                tag: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          skip,
          take: limit,
        }),
        ctx.db.post.count({ where }),
      ]);

      return {
        posts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    }),

  // Get single post by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const post = await ctx.db.post.findFirst({
        where: {
          id: input.id,
          deletedAt: null,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          category: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
      });

      if (!post) {
        throw new Error('Post not found');
      }

      return post;
    }),

  // Create new post
  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1),
      content: z.string(),
      excerpt: z.string().optional(),
      categoryId: z.string().optional(),
      status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      featuredImage: z.string().optional(),
      tagIds: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { tagIds, ...postData } = input;

      const createData: any = {
        ...postData,
        slug: generateSlug(postData.title),
        authorId: ctx.session.user.id,
        publishedAt: postData.status === 'PUBLISHED' ? new Date() : null,
      };

      if (postData.categoryId) {
        createData.categoryId = postData.categoryId;
      }

      const post = await ctx.db.post.create({
        data: createData,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          category: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
      });

      // Add tags if provided
      if (tagIds && tagIds.length > 0) {
        await ctx.db.postTag.createMany({
          data: tagIds.map(tagId => ({
            postId: post.id,
            tagId,
          })),
        });
      }

      // Log activity
      await logActivity(
        ctx,
        'CREATE',
        'post_created',
        `Post "${post.title}" created`,
        post.id,
        'Post',
        null,
        post
      );

      return post;
    }),

  // Update existing post
  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      title: z.string().min(1),
      content: z.string(),
      excerpt: z.string().optional(),
      categoryId: z.string().optional(),
      status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      featuredImage: z.string().optional(),
      tagIds: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, tagIds, ...updateData } = input;

      // Check if post exists
      const existingPost = await ctx.db.post.findFirst({
        where: {
          id,
          deletedAt: null,
        },
      });

      if (!existingPost) {
        throw new Error('Post not found');
      }

      // Store old data for logging
      const oldPost = { ...existingPost };

      // Update post
      const updatePayload: any = {
        ...updateData,
        slug: generateSlug(updateData.title),
        publishedAt: updateData.status === 'PUBLISHED' && !existingPost.publishedAt
          ? new Date()
          : existingPost.publishedAt,
      };

      if (updateData.categoryId) {
        updatePayload.categoryId = updateData.categoryId;
      }

      const post = await ctx.db.post.update({
        where: { id },
        data: updatePayload,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          category: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
      });

      // Update tags if provided
      if (tagIds !== undefined) {
        // Remove existing tags
        await ctx.db.postTag.deleteMany({
          where: { postId: id },
        });

        // Add new tags
        if (tagIds.length > 0) {
          await ctx.db.postTag.createMany({
            data: tagIds.map(tagId => ({
              postId: id,
              tagId,
            })),
          });
        }
      }

      // Log activity
      await logActivity(
        ctx,
        'UPDATE',
        'post_updated',
        `Post "${post.title}" updated`,
        post.id,
        'Post',
        oldPost,
        post
      );

      return post;
    }),

  // Soft delete post
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const post = await ctx.db.post.findFirst({
        where: {
          id: input.id,
          deletedAt: null,
        },
      });

      if (!post) {
        throw new Error('Post not found');
      }

      // Store post data for logging before deletion
      const postData = { ...post };

      await ctx.db.post.update({
        where: { id: input.id },
        data: {
          deletedAt: new Date(),
        },
      });

      // Log activity
      await logActivity(
        ctx,
        'DELETE',
        'post_deleted',
        `Post "${post.title}" deleted`,
        post.id,
        'Post',
        postData,
        null
      );

      return { success: true };
    }),

  // Bulk operations
  bulk: protectedProcedure
    .input(z.object({
      action: z.enum(['delete', 'publish', 'unpublish', 'archive']),
      postIds: z.array(z.string()),
    }))
    .mutation(async ({ input, ctx }) => {
      const { action, postIds } = input;

      let updateData: any = {};

      switch (action) {
        case 'delete':
          updateData = { deletedAt: new Date() };
          break;
        case 'publish':
          updateData = { 
            status: 'PUBLISHED',
            publishedAt: new Date(),
          };
          break;
        case 'unpublish':
          updateData = { 
            status: 'DRAFT',
          };
          break;
        case 'archive':
          updateData = { 
            status: 'ARCHIVED',
          };
          break;
      }

      const whereClause: any = {
        id: { in: postIds },
      };

      if (action === 'delete') {
        whereClause.deletedAt = null;
      }

      const result = await ctx.db.post.updateMany({
        where: whereClause,
        data: updateData,
      });

      return {
        success: true,
        count: result.count,
      };
    }),
});
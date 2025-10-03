import { z } from 'zod';
import { publicProcedure, router } from '../server';

/**
 * Reports router with CRUD operations
 */
export const reportsRouter = router({
  // Get all reports with pagination and filtering
  getAll: publicProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(10),
      search: z.string().optional(),
      statusId: z.string().optional(),
      authorId: z.string().optional(),
    }))
    .query(async ({ input, ctx }) => {
      const { page, limit, search, statusId, authorId } = input;
      const skip = (page - 1) * limit;

      const where = {
        deletedAt: null,
        ...(search && {
          OR: [
            { title: { contains: search } },
            { description: { contains: search } },
            { location: { contains: search } },
            { address: { contains: search } },
          ],
        }),
        ...(statusId && { statusId }),
        ...(authorId && { authorId }),
      };

      const [reports, total] = await Promise.all([
        ctx.db.report.findMany({
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
            status: true,
            media: {
              include: {
                media: true,
              },
            },
            responses: {
              include: {
                responder: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                  },
                },
              },
              orderBy: {
                createdAt: 'desc',
              },
            },
            _count: {
              select: {
                responses: true,
                media: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          skip,
          take: limit,
        }),
        ctx.db.report.count({ where }),
      ]);

      return {
        reports,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    }),

  // Get single report by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const report = await ctx.db.report.findFirst({
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
          status: true,
          media: {
            include: {
              media: true,
            },
          },
          responses: {
            include: {
              responder: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatar: true,
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });

      if (!report) {
        throw new Error('Report not found');
      }

      return report;
    }),

  // Create new report
  create: publicProcedure
    .input(z.object({
      title: z.string().min(1),
      description: z.string(),
      location: z.string().optional(),
      lat: z.number().optional(),
      lng: z.number().optional(),
      address: z.string().optional(),
      statusId: z.string(),
      mediaIds: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { mediaIds, ...reportData } = input;

      const createData: any = {
        ...reportData,
        publishedAt: new Date(),
      };

      // Handle optional fields properly
      if (reportData.location !== undefined) {
        createData.location = reportData.location;
      }
      if (reportData.lat !== undefined) {
        createData.lat = reportData.lat;
      }
      if (reportData.lng !== undefined) {
        createData.lng = reportData.lng;
      }
      if (reportData.address !== undefined) {
        createData.address = reportData.address;
      }

      const report = await ctx.db.report.create({
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
          status: true,
        },
      });

      // Add media if provided
      if (mediaIds && mediaIds.length > 0) {
        await ctx.db.reportMedia.createMany({
          data: mediaIds.map((mediaId, index) => ({
            reportId: report.id,
            mediaId,
            position: index,
          })),
        });
      }

      return report;
    }),

  // Update existing report
  update: publicProcedure
    .input(z.object({
      id: z.string(),
      title: z.string().min(1),
      description: z.string(),
      location: z.string().optional(),
      lat: z.number().optional(),
      lng: z.number().optional(),
      address: z.string().optional(),
      statusId: z.string(),
      mediaIds: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, mediaIds, ...updateData } = input;

      // Check if report exists
      const existingReport = await ctx.db.report.findFirst({
        where: {
          id,
          deletedAt: null,
        },
      });

      if (!existingReport) {
        throw new Error('Report not found');
      }

      // Update report
      const updatePayload: any = {};

      // Handle optional fields properly
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof typeof updateData] !== undefined) {
          updatePayload[key] = updateData[key as keyof typeof updateData];
        }
      });

      const report = await ctx.db.report.update({
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
          status: true,
          media: {
            include: {
              media: true,
            },
          },
        },
      });

      // Update media if provided
      if (mediaIds !== undefined) {
        // Remove existing media
        await ctx.db.reportMedia.deleteMany({
          where: { reportId: id },
        });

        // Add new media
        if (mediaIds.length > 0) {
          await ctx.db.reportMedia.createMany({
            data: mediaIds.map((mediaId, index) => ({
              reportId: id,
              mediaId,
              position: index,
            })),
          });
        }
      }

      return report;
    }),

  // Soft delete report
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const report = await ctx.db.report.findFirst({
        where: {
          id: input.id,
          deletedAt: null,
        },
      });

      if (!report) {
        throw new Error('Report not found');
      }

      await ctx.db.report.update({
        where: { id: input.id },
        data: {
          deletedAt: new Date(),
        },
      });

      return { success: true };
    }),

  // Add response to report
  addResponse: publicProcedure
    .input(z.object({
      reportId: z.string(),
      message: z.string().min(1),
      responderId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { reportId, message, responderId } = input;

      // Check if report exists
      const report = await ctx.db.report.findFirst({
        where: {
          id: reportId,
          deletedAt: null,
        },
      });

      if (!report) {
        throw new Error('Report not found');
      }

      const response = await ctx.db.reportResponse.create({
        data: {
          reportId,
          content: message,
          responderId,
        },
        include: {
          responder: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
      });

      return response;
    }),

  // Update report status
  updateStatus: publicProcedure
    .input(z.object({
      reportId: z.string(),
      statusId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { reportId, statusId } = input;

      // Check if report exists
      const report = await ctx.db.report.findFirst({
        where: {
          id: reportId,
          deletedAt: null,
        },
      });

      if (!report) {
        throw new Error('Report not found');
      }

      // Check if status exists
      const status = await ctx.db.status.findFirst({
        where: {
          id: statusId,
        },
      });

      if (!status) {
        throw new Error('Status not found');
      }

      const updatedReport = await ctx.db.report.update({
        where: { id: reportId },
        data: {
          statusId,
        },
        include: {
          status: true,
        },
      });

      return updatedReport;
    }),
});
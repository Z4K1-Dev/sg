import { db } from '@/lib/db'
import { DatabaseUtils, PaginationOptions, PaginationResult, SearchOptions } from './database-utils'
import { Prisma } from '@prisma/client'

export class UserService {
  /**
   * Get all users with pagination and search
   */
  static async getAllUsers(
    options: PaginationOptions & SearchOptions = {}
  ): Promise<PaginationResult<any>> {
    const { page, limit, sortBy, sortOrder } = options
    const paginationParams = DatabaseUtils.createPaginationParams({
      page: page || 1,
      limit: limit || 10,
      ...(sortBy && { sortBy }),
      ...(sortOrder && { sortOrder }),
    })
    const searchConditions = DatabaseUtils.createSearchConditions(options)
    
    const where = {
      ...searchConditions,
      ...DatabaseUtils.withSoftDelete(),
    }
    
    const [users, total] = await Promise.all([
      db.user.findMany({
        ...paginationParams,
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatar: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      db.user.count({ where }),
    ])
    
    return DatabaseUtils.createPaginationResult(users, total, { 
      page: page || 1, 
      limit: limit || 10 
    })
  }

  /**
   * Get user by ID
   */
  static async getUserById(id: string, includeDeleted = false) {
    return await db.user.findFirst({
      where: {
        id,
        ...DatabaseUtils.withSoftDelete(!includeDeleted),
      },
    })
  }

  /**
   * Get user by email
   */
  static async getUserByEmail(email: string, includeDeleted = false) {
    return await db.user.findFirst({
      where: {
        email,
        ...DatabaseUtils.withSoftDelete(!includeDeleted),
      },
    })
  }

  /**
   * Create user
   */
  static async createUser(data: Prisma.UserCreateInput) {
    return await db.user.create({
      data,
    })
  }

  /**
   * Update user
   */
  static async updateUser(id: string, data: Prisma.UserUpdateInput) {
    return await db.user.update({
      where: { id },
      data,
    })
  }

  /**
   * Soft delete user
   */
  static async deleteUser(id: string) {
    return await db.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  }

  /**
   * Restore user
   */
  static async restoreUser(id: string) {
    return await db.user.update({
      where: { id },
      data: { deletedAt: null },
    })
  }
}

export class PostService {
  /**
   * Get all posts with pagination and search
   */
  static async getAllPosts(
    options: PaginationOptions & SearchOptions & { categoryId?: string; status?: string } = {}
  ): Promise<PaginationResult<any>> {
    const { page, limit, sortBy, sortOrder, categoryId, status } = options
    const paginationParams = DatabaseUtils.createPaginationParams({
      page: page || 1,
      limit: limit || 10,
      ...(sortBy && { sortBy }),
      ...(sortOrder && { sortOrder }),
    })
    const searchConditions = DatabaseUtils.createSearchConditions(options)
    
    const where = {
      ...searchConditions,
      ...(categoryId && { categoryId }),
      ...(status && { status: status as any }),
      ...DatabaseUtils.withSoftDelete(),
    }
    
    const [posts, total] = await Promise.all([
      db.post.findMany({
        ...paginationParams,
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          tags: {
            include: {
              tag: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
          _count: {
            select: {
              tags: true,
            },
          },
        },
      }),
      db.post.count({ where }),
    ])
    
    return DatabaseUtils.createPaginationResult(posts, total, { 
      page: page || 1, 
      limit: limit || 10 
    })
  }

  /**
   * Get post by ID
   */
  static async getPostById(id: string, includeDeleted = false) {
    return await db.post.findFirst({
      where: {
        id,
        ...DatabaseUtils.withSoftDelete(!includeDeleted),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
        media: {
          include: {
            media: true,
          },
        },
      },
    })
  }

  /**
   * Get post by slug
   */
  static async getPostBySlug(slug: string, includeDeleted = false) {
    return await db.post.findFirst({
      where: {
        slug,
        ...DatabaseUtils.withSoftDelete(!includeDeleted),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    })
  }

  /**
   * Create post
   */
  static async createPost(data: Prisma.PostCreateInput & { tagIds?: string[] }) {
    const { tagIds, ...postData } = data
    
    const post = await db.post.create({
      data: postData,
    })

    // Add tags if provided
    if (tagIds && tagIds.length > 0) {
      await db.postTag.createMany({
        data: tagIds.map(tagId => ({
          postId: post.id,
          tagId,
        })),
      })
    }

    return await this.getPostById(post.id)
  }

  /**
   * Update post
   */
  static async updatePost(id: string, data: Prisma.PostUpdateInput & { tagIds?: string[] }) {
    const { tagIds, ...postData } = data
    
    // Update post
    await db.post.update({
      where: { id },
      data: postData,
    })

    // Update tags if provided
    if (tagIds !== undefined) {
      // Remove existing tags
      await db.postTag.deleteMany({
        where: { postId: id },
      })

      // Add new tags
      if (tagIds.length > 0) {
        await db.postTag.createMany({
          data: tagIds.map(tagId => ({
            postId: id,
            tagId,
          })),
        })
      }
    }

    return await this.getPostById(id)
  }

  /**
   * Soft delete post
   */
  static async deletePost(id: string) {
    return await db.post.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  }

  /**
   * Restore post
   */
  static async restorePost(id: string) {
    return await db.post.update({
      where: { id },
      data: { deletedAt: null },
    })
  }
}

export class CategoryService {
  /**
   * Get all categories
   */
  static async getAllCategories(type?: string) {
    return await db.category.findMany({
      where: {
        ...(type && { type: type as any }),
        ...DatabaseUtils.withSoftDelete(),
      },
      orderBy: {
        name: 'asc',
      },
    })
  }

  /**
   * Get category by ID
   */
  static async getCategoryById(id: string) {
    return await db.category.findFirst({
      where: {
        id,
        ...DatabaseUtils.withSoftDelete(),
      },
    })
  }

  /**
   * Get category by slug
   */
  static async getCategoryBySlug(slug: string) {
    return await db.category.findFirst({
      where: {
        slug,
        ...DatabaseUtils.withSoftDelete(),
      },
    })
  }

  /**
   * Create category
   */
  static async createCategory(data: Prisma.CategoryCreateInput) {
    return await db.category.create({
      data,
    })
  }

  /**
   * Update category
   */
  static async updateCategory(id: string, data: Prisma.CategoryUpdateInput) {
    return await db.category.update({
      where: { id },
      data,
    })
  }

  /**
   * Soft delete category
   */
  static async deleteCategory(id: string) {
    return await db.category.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  }
}

export class TagService {
  /**
   * Get all tags
   */
  static async getAllTags() {
    return await db.tag.findMany({
      where: DatabaseUtils.withSoftDelete(),
      orderBy: {
        name: 'asc',
      },
    })
  }

  /**
   * Get tag by ID
   */
  static async getTagById(id: string) {
    return await db.tag.findFirst({
      where: {
        id,
        ...DatabaseUtils.withSoftDelete(),
      },
    })
  }

  /**
   * Get tag by slug
   */
  static async getTagBySlug(slug: string) {
    return await db.tag.findFirst({
      where: {
        slug,
        ...DatabaseUtils.withSoftDelete(),
      },
    })
  }

  /**
   * Create tag
   */
  static async createTag(data: Prisma.TagCreateInput) {
    return await db.tag.create({
      data,
    })
  }

  /**
   * Update tag
   */
  static async updateTag(id: string, data: Prisma.TagUpdateInput) {
    return await db.tag.update({
      where: { id },
      data,
    })
  }

  /**
   * Soft delete tag
   */
  static async deleteTag(id: string) {
    return await db.tag.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  }
}

export class ReportService {
  /**
   * Get all reports with pagination and search
   */
  static async getAllReports(
    options: PaginationOptions & SearchOptions & { statusId?: string } = {}
  ): Promise<PaginationResult<any>> {
    const { page, limit, sortBy, sortOrder, statusId } = options
    const paginationParams = DatabaseUtils.createPaginationParams({
      page: page || 1,
      limit: limit || 10,
      ...(sortBy && { sortBy }),
      ...(sortOrder && { sortOrder }),
    })
    const searchConditions = DatabaseUtils.createSearchConditions(options)
    
    const where = {
      ...searchConditions,
      ...(statusId && { statusId }),
      ...DatabaseUtils.withSoftDelete(),
    }
    
    const [reports, total] = await Promise.all([
      db.report.findMany({
        ...paginationParams,
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          status: true,
          responses: {
            include: {
              responder: {
                select: {
                  id: true,
                  name: true,
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
      }),
      db.report.count({ where }),
    ])
    
    return DatabaseUtils.createPaginationResult(reports, total, { 
      page: page || 1, 
      limit: limit || 10 
    })
  }

  /**
   * Get report by ID
   */
  static async getReportById(id: string, includeDeleted = false) {
    return await db.report.findFirst({
      where: {
        id,
        ...DatabaseUtils.withSoftDelete(!includeDeleted),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        status: true,
        responses: {
          include: {
            responder: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        media: {
          include: {
            media: true,
          },
        },
      },
    })
  }

  /**
   * Create report
   */
  static async createReport(data: Prisma.ReportCreateInput) {
    return await db.report.create({
      data,
    })
  }

  /**
   * Update report
   */
  static async updateReport(id: string, data: Prisma.ReportUpdateInput) {
    return await db.report.update({
      where: { id },
      data,
    })
  }

  /**
   * Soft delete report
   */
  static async deleteReport(id: string) {
    return await db.report.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  }

  /**
   * Add response to report
   */
  static async addResponse(reportId: string, responderId: string, content: string) {
    return await db.reportResponse.create({
      data: {
        reportId,
        responderId,
        content,
      },
    })
  }
}

export class SettingsService {
  /**
   * Get setting by key
   */
  static async getSetting(key: string) {
    const setting = await db.setting.findUnique({
      where: { key },
    })
    
    if (!setting) return null
    
    // Parse value based on type
    switch (setting.type) {
      case 'number':
        return Number(setting.value)
      case 'boolean':
        return setting.value === 'true'
      case 'json':
        return JSON.parse(setting.value)
      default:
        return setting.value
    }
  }

  /**
   * Get all settings
   */
  static async getAllSettings() {
    const settings = await db.setting.findMany({
      orderBy: {
        category: 'asc',
      },
    })
    
    return settings.reduce((acc, setting) => {
      let value: any = setting.value
      
      switch (setting.type) {
        case 'number':
          value = Number(setting.value)
          break
        case 'boolean':
          value = setting.value === 'true'
          break
        case 'json':
          value = JSON.parse(setting.value)
          break
      }
      
      acc[setting.key] = {
        value,
        type: setting.type,
        description: setting.description,
        category: setting.category,
      }
      
      return acc
    }, {} as Record<string, any>)
  }

  /**
   * Update setting
   */
  static async updateSetting(key: string, value: any) {
    const setting = await db.setting.findUnique({
      where: { key },
    })
    
    if (!setting) {
      throw new Error(`Setting with key '${key}' not found`)
    }
    
    let stringValue: string
    
    switch (setting.type) {
      case 'json':
        stringValue = JSON.stringify(value)
        break
      default:
        stringValue = String(value)
    }
    
    return await db.setting.update({
      where: { key },
      data: { value: stringValue },
    })
  }
}
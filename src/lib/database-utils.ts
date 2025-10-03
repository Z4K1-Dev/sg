import { Prisma } from '@prisma/client'

export interface PaginationOptions {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginationResult<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface SearchOptions {
  query?: string
  searchFields?: string[]
}

export class DatabaseUtils {
  /**
   * Create pagination parameters for Prisma queries
   */
  static createPaginationParams(options: PaginationOptions = {}) {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options
    
    const skip = (page - 1) * limit
    
    return {
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
    }
  }

  /**
   * Create pagination result metadata
   */
  static createPaginationResult<T>(
    data: T[],
    total: number,
    options: PaginationOptions = {}
  ): PaginationResult<T> {
    const { page = 1, limit = 10 } = options
    const totalPages = Math.ceil(total / limit)
    
    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    }
  }

  /**
   * Create search conditions for Prisma queries
   */
  static createSearchConditions(
    options: SearchOptions = {}
  ): Prisma.Enumerable<Prisma.Enumerable<any> | any> | any {
    const { query, searchFields = [] } = options
    
    if (!query || !searchFields.length) {
      return {}
    }
    
    const searchConditions = searchFields.map(field => ({
      [field]: {
        contains: query,
        mode: 'insensitive' as const,
      },
    }))
    
    return {
      OR: searchConditions,
    }
  }

  /**
   * Create soft delete conditions
   */
  static withSoftDelete(includeDeleted = false) {
    if (includeDeleted) {
      return {}
    }
    
    return {
      deletedAt: null,
    }
  }

  /**
   * Generate slug from string
   */
  static generateSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Sanitize search query
   */
  static sanitizeSearchQuery(query: string): string {
    return query.trim().replace(/[^\w\s-]/g, '')
  }
}
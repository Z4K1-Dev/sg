'use client';

import { useState, useEffect } from 'react';
import { PostCard, Post } from './post-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  MoreHorizontal, 
  ChevronLeft, 
  ChevronRight,
  RefreshCw,
  Download,
  Trash2,
  Archive,
  Eye,
  Edit
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Types
interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface PostListResponse {
  posts: Post[];
  pagination: PaginationInfo;
}

interface PostCategory {
  id: string;
  name: string;
  slug: string;
}

interface PostAuthor {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface PostListProps {
  posts?: Post[];
  pagination?: PaginationInfo;
  loading?: boolean;
  categories?: PostCategory[];
  authors?: PostAuthor[];
  onRefresh?: () => void;
  onSearch?: (query: string) => void;
  onFilter?: (filters: PostFilters) => void;
  onPageChange?: (page: number) => void;
  onPostEdit?: (post: Post) => void;
  onPostDelete?: (postId: string) => void;
  onPostView?: (post: Post) => void;
  onPostStatusChange?: (postId: string, status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED') => void;
  onBulkAction?: (action: BulkAction, postIds: string[]) => void;
  onExport?: (format: 'json' | 'csv') => void;
}

interface PostFilters {
  search?: string;
  categoryId?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  authorId?: string;
}

type BulkAction = 'delete' | 'publish' | 'unpublish' | 'archive';

type ViewMode = 'grid' | 'list';

export function PostList({
  posts = [],
  pagination,
  loading = false,
  categories = [],
  authors = [],
  onRefresh,
  onSearch,
  onFilter,
  onPageChange,
  onPostEdit,
  onPostDelete,
  onPostView,
  onPostStatusChange,
  onBulkAction,
  onExport,
}: PostListProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<PostFilters>({});
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== filters.search) {
        const newFilters = { ...filters, search: searchQuery };
        setFilters(newFilters);
        onFilter?.(newFilters);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh?.();
      toast({
        title: "Success",
        description: "Posts refreshed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh posts",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleFilterChange = (key: keyof PostFilters, value: string) => {
    const newFilters = { ...filters, [key]: value || undefined };
    setFilters(newFilters);
    onFilter?.(newFilters);
  };

  const handlePostSelect = (postId: string, selected: boolean) => {
    const newSelected = new Set(selectedPosts);
    if (selected) {
      newSelected.add(postId);
    } else {
      newSelected.delete(postId);
    }
    setSelectedPosts(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPosts(new Set(posts.map(post => post.id)));
    } else {
      setSelectedPosts(new Set());
    }
  };

  const handleBulkAction = async (action: BulkAction) => {
    if (selectedPosts.size === 0) {
      toast({
        title: "No posts selected",
        description: "Please select at least one post to perform bulk actions",
        variant: "destructive",
      });
      return;
    }

    try {
      await onBulkAction?.(action, Array.from(selectedPosts));
      setSelectedPosts(new Set());
      toast({
        title: "Success",
        description: `Bulk ${action} completed successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to perform bulk ${action}`,
        variant: "destructive",
      });
    }
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
    onFilter?.({});
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined);

  if (loading && posts.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Posts</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <div className="flex items-center border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Filters */}
            <div className="flex gap-2">
              <Select
                value={filters.status || ''}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.categoryId || ''}
                onValueChange={(value) => handleFilterChange('categoryId', value)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.authorId || ''}
                onValueChange={(value) => handleFilterChange('authorId', value)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Author" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Authors</SelectItem>
                  {authors.map((author) => (
                    <SelectItem key={author.id} value={author.id}>
                      {author.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters}>
                  <Filter className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedPosts.size > 0 && (
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedPosts.size === posts.length}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm font-medium">
                  {selectedPosts.size} post{selectedPosts.size !== 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Bulk Actions
                      <MoreHorizontal className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleBulkAction('publish')}>
                      <Eye className="h-4 w-4 mr-2" />
                      Publish Selected
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkAction('unpublish')}>
                      <Edit className="h-4 w-4 mr-2" />
                      Set as Draft
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkAction('archive')}>
                      <Archive className="h-4 w-4 mr-2" />
                      Archive Selected
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleBulkAction('delete')}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Selected
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          )}

          {/* Results Summary */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              {pagination && (
                <span>
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} posts
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => onExport?.('json')}>
                    Export as JSON
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onExport?.('csv')}>
                    Export as CSV
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts Grid/List */}
      {posts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No posts found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {hasActiveFilters 
                  ? "Try adjusting your filters or search query"
                  : "Get started by creating your first post"
                }
              </p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === 'grid' 
          ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3" 
          : "space-y-4"
        }>
          {/* Select All Checkbox for List View */}
          {viewMode === 'list' && (
            <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Checkbox
                checked={selectedPosts.size === posts.length}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm font-medium">Select All</span>
            </div>
          )}

          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onEdit={onPostEdit}
              onDelete={onPostDelete}
              onView={onPostView}
              onStatusChange={onPostStatusChange}
              isSelected={selectedPosts.has(post.id)}
              onSelect={handlePostSelect}
              showCheckbox={viewMode === 'list'}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange?.(pagination.page - 1)}
            disabled={pagination.page <= 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          
          <div className="flex items-center gap-1">
            {[...Array(pagination.pages)].map((_, i) => {
              const page = i + 1;
              const isCurrentPage = page === pagination.page;
              const isNearCurrent = Math.abs(page - pagination.page) <= 2 || 
                                   page === 1 || 
                                   page === pagination.pages;
              
              if (!isNearCurrent) {
                if (page === pagination.page - 3 || page === pagination.page + 3) {
                  return <span key={page} className="px-2 text-gray-400">...</span>;
                }
                return null;
              }

              return (
                <Button
                  key={page}
                  variant={isCurrentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange?.(page)}
                  className="w-8 h-8 p-0"
                >
                  {page}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange?.(pagination.page + 1)}
            disabled={pagination.page >= pagination.pages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
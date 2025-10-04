'use client';

import { formatDistanceToNow } from 'date-fns';
import { Calendar, User, Eye, MoreHorizontal, Edit, Trash2, Archive } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

// Types based on tRPC response
interface PostAuthor {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface PostCategory {
  id: string;
  name: string;
  slug: string;
}

interface PostTag {
  id: string;
  tag: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  type: 'POST' | 'PAGE';
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  metaTitle?: string;
  metaDescription?: string;
  featuredImage?: string;
  authorId: string;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  author: PostAuthor;
  category?: PostCategory;
  tags: PostTag[];
}

interface PostCardProps {
  post: Post;
  onEdit?: (post: Post) => void;
  onDelete?: (postId: string) => void;
  onView?: (post: Post) => void;
  onStatusChange?: (postId: string, status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED') => void;
  isSelected?: boolean;
  onSelect?: (postId: string, selected: boolean) => void;
  showCheckbox?: boolean;
}

const statusColors = {
  DRAFT: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  PUBLISHED: 'bg-green-100 text-green-800 border-green-200',
  ARCHIVED: 'bg-gray-100 text-gray-800 border-gray-200',
};

const statusLabels = {
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
  ARCHIVED: 'Archived',
};

export function PostCard({
  post,
  onEdit,
  onDelete,
  onView,
  onStatusChange,
  isSelected = false,
  onSelect,
  showCheckbox = false,
}: PostCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!onDelete) return;
    
    setIsDeleting(true);
    try {
      await onDelete(post.id);
      toast({
        title: "Success",
        description: "Post deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleStatusChange = async (newStatus: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED') => {
    if (!onStatusChange) return;
    
    try {
      await onStatusChange(post.id, newStatus);
      toast({
        title: "Success",
        description: `Post status changed to ${statusLabels[newStatus]}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to change post status",
        variant: "destructive",
      });
    }
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <>
      <Card className={`transition-all duration-200 hover:shadow-md ${isSelected ? 'ring-2 ring-primary' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={statusColors[post.status]} variant="outline">
                  {statusLabels[post.status]}
                </Badge>
                {post.category && (
                  <Badge variant="secondary" className="text-xs">
                    {post.category.name}
                  </Badge>
                )}
              </div>
              <h3 
                className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate cursor-pointer hover:text-primary transition-colors"
                onClick={() => onView?.(post)}
              >
                {post.title}
              </h3>
              {post.excerpt && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                  {post.excerpt}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              {showCheckbox && (
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => onSelect?.(post.id, e.target.checked)}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onView?.(post)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit?.(post)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {post.status !== 'PUBLISHED' && (
                    <DropdownMenuItem onClick={() => handleStatusChange('PUBLISHED')}>
                      <Eye className="h-4 w-4 mr-2" />
                      Publish
                    </DropdownMenuItem>
                  )}
                  {post.status !== 'DRAFT' && (
                    <DropdownMenuItem onClick={() => handleStatusChange('DRAFT')}>
                      <Edit className="h-4 w-4 mr-2" />
                      Set as Draft
                    </DropdownMenuItem>
                  )}
                  {post.status !== 'ARCHIVED' && (
                    <DropdownMenuItem onClick={() => handleStatusChange('ARCHIVED')}>
                      <Archive className="h-4 w-4 mr-2" />
                      Archive
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => setDeleteDialogOpen(true)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        {(post.featuredImage || post.content) && (
          <CardContent className="pb-3">
            {post.featuredImage && (
              <div className="mb-3 rounded-lg overflow-hidden">
                <img
                  src={post.featuredImage}
                  alt={post.title}
                  className="w-full h-48 object-cover"
                />
              </div>
            )}
            {post.content && !post.excerpt && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {truncateContent(post.content)}
              </p>
            )}
          </CardContent>
        )}

        <CardFooter className="pt-3 border-t">
          <div className="flex items-center justify-between w-full text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{post.author.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
              </div>
            </div>
            
            {post.tags.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-gray-400">Tags:</span>
                <div className="flex gap-1">
                  {post.tags.slice(0, 3).map((postTag) => (
                    <Badge key={postTag.id} variant="outline" className="text-xs px-1 py-0">
                      {postTag.tag.name}
                    </Badge>
                  ))}
                  {post.tags.length > 3 && (
                    <span className="text-gray-400">+{post.tags.length - 3}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardFooter>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the post "{post.title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export type { PostCategory, PostTag };
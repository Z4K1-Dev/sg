'use client';

import { format } from 'date-fns';
import {
  Calendar,
  Eye,
  Edit,
  Share2,
  Printer,
  Clock,
  Tag,
  Folder,
  ArrowLeft,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { Post } from './post-card';

interface PostDetailProps {
  post: Post;
  onEdit?: (post: Post) => void;
  onDelete?: (postId: string) => void;
  onBack?: () => void;
  onShare?: (post: Post) => void;
  onPrint?: () => void;
  loading?: boolean;
  showActions?: boolean;
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

export function PostDetail({
  post,
  onEdit,
  onDelete,
  onBack,
  onShare,
  onPrint,
  showActions = true,
}: PostDetailProps) {
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

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: (post.excerpt || post.content?.substring(0, 160)) || '',
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Post link copied to clipboard",
      });
    }
    onShare?.(post);
  };

  const handlePrint = () => {
    window.print();
    onPrint?.();
  };

  const formatDate = (date: Date | string) => {
    return format(new Date(date), 'MMMM dd, yyyy');
  };

  const formatReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <Badge className={statusColors[post.status]} variant="outline">
              {statusLabels[post.status]}
            </Badge>
          </div>
        </div>

        {showActions && (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button onClick={() => onEdit?.(post)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit?.(post)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Post
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Post
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handlePrint}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print Post
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setDeleteDialogOpen(true)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Delete Post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Featured Image */}
      {post.featuredImage && (
        <div className="rounded-lg overflow-hidden">
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-64 md:h-96 object-cover"
          />
        </div>
      )}

      {/* Title and Meta */}
      <Card>
        <CardHeader className="pb-4">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {post.title}
            </h1>
            
            {/* Post Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={post.author.avatar} />
                  <AvatarFallback>
                    {post.author.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span>{post.author.name}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(post.createdAt)}</span>
              </div>
              
              {post.publishedAt && (
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>Published {formatDate(post.publishedAt)}</span>
                </div>
              )}
              
              {post.content && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatReadingTime(post.content)}</span>
                </div>
              )}
            </div>

            {/* Categories and Tags */}
            <div className="flex flex-wrap items-center gap-2">
              {post.category && (
                <div className="flex items-center gap-1">
                  <Folder className="h-4 w-4 text-gray-400" />
                  <Badge variant="secondary">
                    {post.category.name}
                  </Badge>
                </div>
              )}
              
              {post.tags.length > 0 && (
                <div className="flex items-center gap-1">
                  <Tag className="h-4 w-4 text-gray-400" />
                  <div className="flex gap-1">
                    {post.tags.map((postTag) => (
                      <Badge key={postTag.id} variant="outline" className="text-xs">
                        {postTag.tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Excerpt */}
          {post.excerpt && (
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-gray-700 dark:text-gray-300 italic">
                {post.excerpt}
              </p>
            </div>
          )}

          {/* Content */}
          {post.content && (
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <div 
                dangerouslySetInnerHTML={{ __html: post.content }}
                className="whitespace-pre-wrap"
              />
            </div>
          )}

          {/* SEO Info (for admin view) */}
          {(post.metaTitle || post.metaDescription) && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">SEO Information</h3>
                {post.metaTitle && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-1">Meta Title</h4>
                    <p className="text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded">
                      {post.metaTitle}
                    </p>
                  </div>
                )}
                {post.metaDescription && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-1">Meta Description</h4>
                    <p className="text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded">
                      {post.metaDescription}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Technical Info */}
          <Separator />
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Technical Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Post ID:</span>
                <span className="ml-2 font-mono">{post.id}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Slug:</span>
                <span className="ml-2 font-mono">{post.slug}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Type:</span>
                <span className="ml-2">{post.type}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Status:</span>
                <span className="ml-2">{post.status}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Created:</span>
                <span className="ml-2">{formatDate(post.createdAt)}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Updated:</span>
                <span className="ml-2">{formatDate(post.updatedAt)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
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
    </div>
  );
}
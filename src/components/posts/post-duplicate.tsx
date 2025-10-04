'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Copy,
  FileText,
  Loader2,
  CheckCircle,
  Eye
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { trpc } from '@/lib/trpc/client';
import { usePostEvents } from '@/lib/socket/client';

// Types
interface Post {
  id: string;
  title: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  publishedAt?: Date;
  content?: string;
  excerpt?: string;
  categoryId?: string;
  metaTitle?: string;
  metaDescription?: string;
  featuredImage?: string;
  author?: {
    id: string;
    name: string;
    email: string;
  };
  category?: {
    id: string;
    name: string;
  };
  tags?: Array<{
    tag: {
      id: string;
      name: string;
    };
  }>;
}

interface PostDuplicateProps {
  post: Post;
  onDuplicate?: (newPost: Post) => void;
  trigger?: React.ReactNode;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export function PostDuplicate({
  post,
  onDuplicate,
  trigger,
  showLabel = true,
  size = 'md',
  disabled = false,
}: PostDuplicateProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newTitle, setNewTitle] = useState(`${post.title} (Copy)`);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [duplicatedPost, setDuplicatedPost] = useState<Post | null>(null);

  // tRPC mutation for post duplication
  const duplicateMutation = trpc.posts.duplicate.useMutation({
    onSuccess: (data) => {
      setDuplicatedPost(data as any);
      setShowSuccessDialog(true);
      setIsOpen(false);
      toast({
        title: "Post Duplicated",
        description: `Post "${data.title}" has been created successfully`,
      });
      onDuplicate?.(data as any);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to duplicate post",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsDuplicating(false);
    },
  });

  // Listen for real-time post events
  usePostEvents((event) => {
    if (event.type === 'post.created' && event.data.authorId === post.author?.id) {
      toast({
        title: "New Post Created",
        description: `Post "${event.data.title}" has been created`,
      });
    }
  });

  const handleDuplicate = async () => {
    if (!newTitle.trim()) {
      toast({
        title: "Error",
        description: "Post title is required",
        variant: "destructive",
      });
      return;
    }

    setIsDuplicating(true);
    duplicateMutation.mutate({
      id: post.id,
      title: newTitle.trim(),
    });
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setNewTitle(`${post.title} (Copy)`);
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'lg':
        return 'px-4 py-2 text-base';
      default:
        return 'px-3 py-1.5 text-sm';
    }
  };

  const defaultTrigger = (
    <Button
      variant="outline"
      className={`flex items-center gap-2 ${getSizeClasses()}`}
      disabled={disabled || isDuplicating}
    >
      {isDuplicating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
      {showLabel && <span>Duplicate</span>}
    </Button>
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          {trigger || defaultTrigger}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Copy className="h-5 w-5" />
              Duplicate Post
            </DialogTitle>
            <DialogDescription>
              Create a copy of "{post.title}" with all its content, tags, and settings.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">New Post Title</Label>
              <Input
                id="title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Enter new post title"
                disabled={isDuplicating}
              />
            </div>

            <div className="space-y-2">
              <Label>Original Post Details</Label>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Title:</span>
                  <span className="text-sm">{post.title}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status:</span>
                  <Badge variant="outline">{post.status}</Badge>
                </div>
                {post.category && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Category:</span>
                    <span className="text-sm">{post.category.name}</span>
                  </div>
                )}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Tags:</span>
                    <div className="flex gap-1">
                      {post.tags.slice(0, 3).map((postTag) => (
                        <Badge key={postTag.tag.id} variant="secondary" className="text-xs">
                          {postTag.tag.name}
                        </Badge>
                      ))}
                      {post.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{post.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Author:</span>
                  <span className="text-sm">{post.author?.name || 'Unknown'}</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-start gap-2">
                <Eye className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-medium">What will be copied:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1 text-xs">
                    <li>Content and excerpt</li>
                    <li>Meta title and description</li>
                    <li>Featured image</li>
                    <li>Category assignment</li>
                    <li>All tags</li>
                  </ul>
                  <p className="mt-2 text-xs font-medium">Note: The new post will be created as a draft.</p>
                </div>
              </div>
            </div>

            {isDuplicating && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-800 rounded-lg">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Duplicating post...</span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isDuplicating}>
              Cancel
            </Button>
            <Button
              onClick={handleDuplicate}
              disabled={isDuplicating || !newTitle.trim()}
            >
              {isDuplicating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Duplicating...
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate Post
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Post Duplicated Successfully
            </AlertDialogTitle>
            <AlertDialogDescription>
              Post "{duplicatedPost?.title}" has been created as a draft.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {duplicatedPost && (
            <div className="space-y-3">
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                  <FileText className="h-4 w-4" />
                  <span className="font-medium">New Post Details</span>
                </div>
                <div className="mt-2 space-y-1 text-sm text-green-700 dark:text-green-300">
                  <p><strong>Title:</strong> {duplicatedPost.title}</p>
                  <p><strong>Status:</strong> <Badge variant="outline">DRAFT</Badge></p>
                  <p><strong>ID:</strong> {duplicatedPost.id}</p>
                </div>
              </div>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                setShowSuccessDialog(false);
                setDuplicatedPost(null);
                // Navigate to edit the new post (implementation depends on routing)
                // router.push(`/admin/posts/${duplicatedPost?.id}/edit`);
              }}
            >
              Edit New Post
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Quick duplicate button for inline use
export function PostQuickDuplicate({
  post,
  onDuplicate,
  disabled = false,
}: {
  post: Post;
  onDuplicate?: (newPost: Post) => void;
  disabled?: boolean;
}) {
  const [isDuplicating, setIsDuplicating] = useState(false);

  // tRPC mutation for quick post duplication
  const duplicateMutation = trpc.posts.duplicate.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Post Duplicated",
        description: `Post "${data.title}" has been created as a draft`,
      });
      onDuplicate?.(data as any);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to duplicate post",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsDuplicating(false);
    },
  });

  // Listen for real-time post events
  usePostEvents((event) => {
    if (event.type === 'post.created' && event.data.authorId === post.author?.id) {
      toast({
        title: "New Post Created",
        description: `Post "${event.data.title}" has been created`,
      });
    }
  });

  const handleQuickDuplicate = () => {
    setIsDuplicating(true);
    duplicateMutation.mutate({
      id: post.id,
    });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleQuickDuplicate}
      disabled={disabled || isDuplicating}
    >
      {isDuplicating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  );
}
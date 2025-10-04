'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import {
  Eye,
  Edit,
  Archive,
  Loader2
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
}

interface PostStatusToggleProps {
  post: Post;
  onStatusChange?: (postId: string, newStatus: string) => void;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

const statusConfig = {
  DRAFT: {
    icon: <Edit className="h-4 w-4" />,
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200',
    label: 'Draft',
    description: 'Post is being worked on and not yet published',
  },
  PUBLISHED: {
    icon: <Eye className="h-4 w-4" />,
    color: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
    label: 'Published',
    description: 'Post is live and visible to everyone',
  },
  ARCHIVED: {
    icon: <Archive className="h-4 w-4" />,
    color: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200',
    label: 'Archived',
    description: 'Post is no longer active but preserved',
  },
};

export function PostStatusToggle({
  post,
  onStatusChange,
  showLabel = true,
  size = 'md',
  disabled = false,
}: PostStatusToggleProps) {
  const [selectedStatus, setSelectedStatus] = useState(post.status);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // tRPC mutation for status toggle
  const toggleStatusMutation = trpc.posts.toggleStatus.useMutation({
    onSuccess: (data) => {
      setSelectedStatus(data.status);
      toast({
        title: "Status Updated",
        description: `Post "${data.title}" status changed to ${statusConfig[data.status].label}`,
      });
      onStatusChange?.(post.id, data.status);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update post status",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsUpdating(false);
    },
  });

  // Listen for real-time post events
  usePostEvents((event) => {
    if (event.data.id === post.id && event.type === 'post.updated') {
      setSelectedStatus(event.data.status);
      toast({
        title: "Status Updated",
        description: `Post "${event.data.title}" status changed to ${statusConfig[event.data.status].label}`,
      });
    }
  });

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === post.status) {
      setIsDialogOpen(false);
      return;
    }

    setIsUpdating(true);
    toggleStatusMutation.mutate({
      id: post.id,
      status: newStatus as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
    });
    setIsDialogOpen(false);
  };

  const openDialog = () => {
    setSelectedStatus(post.status);
    setIsDialogOpen(true);
  };

  const getStatusIcon = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig]?.icon || <Edit className="h-4 w-4" />;
  };

  const getStatusColor = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig]?.color || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusLabel = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig]?.label || status;
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

  return (
    <>
      <Button
        variant="outline"
        className={`flex items-center gap-2 ${getStatusColor(post.status)} ${getSizeClasses()}`}
        onClick={openDialog}
        disabled={disabled || isUpdating}
      >
        {isUpdating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          getStatusIcon(post.status)
        )}
        {showLabel && (
          <span>{getStatusLabel(post.status)}</span>
        )}
      </Button>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {getStatusIcon(selectedStatus)}
              Change Post Status
            </AlertDialogTitle>
            <AlertDialogDescription>
              Change the status of "{post.title}" from {getStatusLabel(post.status)} to a new status.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select New Status</label>
              <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusConfig).map(([status, config]) => (
                    <SelectItem key={status} value={status}>
                      <div className="flex items-center gap-2">
                        {config.icon}
                        {config.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedStatus && (
              <div className={`p-3 rounded-lg ${getStatusColor(selectedStatus)}`}>
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(selectedStatus)}
                  <span className="font-medium">{getStatusLabel(selectedStatus)}</span>
                </div>
                <p className="text-sm">
                  {statusConfig[selectedStatus as keyof typeof statusConfig]?.description}
                </p>
              </div>
            )}

            {isUpdating && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-800 rounded-lg">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Updating post status...</span>
              </div>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleStatusChange(selectedStatus)}
              disabled={isUpdating || selectedStatus === post.status}
              className={getStatusColor(selectedStatus)}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  {getStatusIcon(selectedStatus)}
                  <span className="ml-2">
                    Change to {getStatusLabel(selectedStatus)}
                  </span>
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Quick status toggle component for inline use
export function PostQuickStatusToggle({
  post,
  onStatusChange,
}: {
  post: Post;
  onStatusChange?: (postId: string, newStatus: string) => void;
}) {
  const [isUpdating, setIsUpdating] = useState(false);

  // tRPC mutation for quick status toggle
  const toggleStatusMutation = trpc.posts.toggleStatus.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Status Updated",
        description: `Post "${data.title}" status changed to ${statusConfig[data.status].label}`,
      });
      onStatusChange?.(post.id, data.status);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update post status",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsUpdating(false);
    },
  });

  // Listen for real-time post events
  usePostEvents((event) => {
    if (event.data.id === post.id && event.type === 'post.updated') {
      toast({
        title: "Status Updated",
        description: `Post "${event.data.title}" status changed to ${statusConfig[event.data.status].label}`,
      });
      onStatusChange?.(post.id, event.data.status);
    }
  });

  const handleQuickToggle = () => {
    let newStatus: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    
    switch (post.status) {
      case 'DRAFT':
        newStatus = 'PUBLISHED';
        break;
      case 'PUBLISHED':
        newStatus = 'ARCHIVED';
        break;
      case 'ARCHIVED':
        newStatus = 'DRAFT';
        break;
      default:
        newStatus = 'DRAFT';
    }

    setIsUpdating(true);
    toggleStatusMutation.mutate({
      id: post.id,
      status: newStatus,
    });
  };

  return (
    <Badge
      className={`cursor-pointer ${statusConfig[post.status]?.color || 'bg-gray-100 text-gray-800 border-gray-200'} ${isUpdating ? 'opacity-50' : ''}`}
      onClick={handleQuickToggle}
    >
      {isUpdating ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <>{(statusConfig[post.status as keyof typeof statusConfig]?.icon) || <Edit className="h-4 w-4" />}</>
      )}
      <span className="ml-1">{statusConfig[post.status]?.label || post.status}</span>
    </Badge>
  );
}
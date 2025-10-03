'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { 
  Eye, 
  Edit, 
  Archive, 
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Settings
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Types
interface PostStatus {
  id: string;
  name: string;
  slug: string;
  color: string;
  order: number;
  isDefault: boolean;
  _count?: {
    posts: number;
  };
}

interface Post {
  id: string;
  title: string;
  status: string;
  publishedAt?: Date;
}

interface PostStatusManagerProps {
  posts?: Post[];
  statuses?: PostStatus[];
  onStatusChange?: (postId: string, newStatus: string) => Promise<void>;
  onBulkStatusChange?: (postIds: string[], newStatus: string) => Promise<void>;
  onRefresh?: () => void;
  loading?: boolean;
}

const statusConfig = {
  DRAFT: {
    icon: <Edit className="h-4 w-4" />,
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    label: 'Draft',
    description: 'Post is being worked on and not yet published',
  },
  PUBLISHED: {
    icon: <Eye className="h-4 w-4" />,
    color: 'bg-green-100 text-green-800 border-green-200',
    label: 'Published',
    description: 'Post is live and visible to everyone',
  },
  ARCHIVED: {
    icon: <Archive className="h-4 w-4" />,
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    label: 'Archived',
    description: 'Post is no longer active but preserved',
  },
};

export function PostStatusManager({
  posts = [],
  statuses = [],
  onStatusChange,
  onBulkStatusChange,
  onRefresh,
  loading = false,
}: PostStatusManagerProps) {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const getStatusBreakdown = () => {
    const breakdown = {
      DRAFT: 0,
      PUBLISHED: 0,
      ARCHIVED: 0,
    };

    posts.forEach(post => {
      if (post.status in breakdown) {
        breakdown[post.status as keyof typeof breakdown]++;
      }
    });

    return breakdown;
  };

  const statusBreakdown = getStatusBreakdown();

  const handleStatusChange = async (postId: string, newStatus: string) => {
    setIsUpdating(true);
    try {
      await onStatusChange?.(postId, newStatus);
      toast({
        title: "Status Updated",
        description: `Post status changed to ${statusConfig[newStatus as keyof typeof statusConfig]?.label || newStatus}`,
      });
      setStatusDialogOpen(false);
      setSelectedPost(null);
      setSelectedStatus('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update post status",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const openStatusDialog = (post: Post) => {
    setSelectedPost(post);
    setSelectedStatus(post.status);
    setStatusDialogOpen(true);
  };

  const getStatusIcon = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig]?.icon || <Clock className="h-4 w-4" />;
  };

  const getStatusColor = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig]?.color || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusLabel = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig]?.label || status;
  };

  const getRecentStatusChanges = () => {
    // Sort posts by status change (simulated - in real app, this would come from activity logs)
    return posts
      .filter(post => post.publishedAt)
      .sort((a, b) => new Date(b.publishedAt!).getTime() - new Date(a.publishedAt!).getTime())
      .slice(0, 5);
  };

  const recentChanges = getRecentStatusChanges();

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        {Object.entries(statusBreakdown).map(([status, count]) => (
          <Card key={status} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-lg">
                <div className="flex items-center gap-2">
                  {getStatusIcon(status)}
                  {getStatusLabel(status)}
                </div>
                <Badge variant="outline" className="text-lg px-3 py-1">
                  {count}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                {statusConfig[status as keyof typeof statusConfig]?.description}
              </p>
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{count} post{count !== 1 ? 's' : ''}</span>
                  <span>{Math.round((count / posts.length) * 100)}%</span>
                </div>
                <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${posts.length > 0 ? (count / posts.length) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Quick Status Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => {
                // Filter posts by status
                const draftPosts = posts.filter(post => post.status === 'DRAFT');
                if (draftPosts.length > 0) {
                  toast({
                    title: "Draft Posts",
                    description: `Found ${draftPosts.length} draft posts`,
                  });
                }
              }}
            >
              <Edit className="h-6 w-6" />
              <span className="text-sm">View Drafts</span>
              <Badge variant="secondary">{statusBreakdown.DRAFT}</Badge>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => {
                const publishedPosts = posts.filter(post => post.status === 'PUBLISHED');
                if (publishedPosts.length > 0) {
                  toast({
                    title: "Published Posts",
                    description: `Found ${publishedPosts.length} published posts`,
                  });
                }
              }}
            >
              <Eye className="h-6 w-6" />
              <span className="text-sm">View Published</span>
              <Badge variant="default">{statusBreakdown.PUBLISHED}</Badge>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => {
                const archivedPosts = posts.filter(post => post.status === 'ARCHIVED');
                if (archivedPosts.length > 0) {
                  toast({
                    title: "Archived Posts",
                    description: `Found ${archivedPosts.length} archived posts`,
                  });
                }
              }}
            >
              <Archive className="h-6 w-6" />
              <span className="text-sm">View Archived</span>
              <Badge variant="outline">{statusBreakdown.ARCHIVED}</Badge>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={onRefresh}
              disabled={loading}
            >
              <RefreshCw className={`h-6 w-6 ${loading ? 'animate-spin' : ''}`} />
              <span className="text-sm">Refresh</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Status Changes */}
      {recentChanges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Status Changes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentChanges.map((post) => (
                <div key={post.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${getStatusColor(post.status)}`}>
                      {getStatusIcon(post.status)}
                    </div>
                    <div>
                      <p className="font-medium">{post.title}</p>
                      <p className="text-sm text-gray-600">
                        {post.publishedAt && `Published ${new Date(post.publishedAt).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openStatusDialog(post)}
                  >
                    Change Status
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Change Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change Post Status</DialogTitle>
            <DialogDescription>
              Change the status of "{selectedPost?.title}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="status">New Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => selectedPost && handleStatusChange(selectedPost.id, selectedStatus)}
              disabled={isUpdating || !selectedStatus || selectedStatus === selectedPost?.status}
            >
              {isUpdating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
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
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Status Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium">Total Posts</h4>
              <p className="text-2xl font-bold">{posts.length}</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Published Rate</h4>
              <p className="text-2xl font-bold">
                {posts.length > 0 ? Math.round((statusBreakdown.PUBLISHED / posts.length) * 100) : 0}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
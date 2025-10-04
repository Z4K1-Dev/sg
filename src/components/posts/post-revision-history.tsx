'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  History,
  Eye,
  RotateCcw,
  User,
  Clock,
  FileText,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { trpc } from '@/lib/trpc/client';
import { usePostEvents } from '@/lib/socket/client';

// Types
interface PostRevision {
  id: string;
  postId: string;
  title: string;
  content: string;
  excerpt?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  authorId: string;
  author: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  createdAt: Date;
  changeType: 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE';
  changeDescription: string;
  metadata?: string; // JSON string with additional data
}

interface Post {
  id: string;
  title: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}

interface PostRevisionHistoryProps {
  post: Post;
  onRestore?: (revisionId: string) => void;
  trigger?: React.ReactNode;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

const changeTypeConfig = {
  CREATE: {
    icon: <FileText className="h-4 w-4" />,
    color: 'bg-green-100 text-green-800 border-green-200',
    label: 'Created',
  },
  UPDATE: {
    icon: <FileText className="h-4 w-4" />,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    label: 'Updated',
  },
  DELETE: {
    icon: <AlertCircle className="h-4 w-4" />,
    color: 'bg-red-100 text-red-800 border-red-200',
    label: 'Deleted',
  },
  STATUS_CHANGE: {
    icon: <Eye className="h-4 w-4" />,
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    label: 'Status Changed',
  },
};

export function PostRevisionHistory({
  post,
  onRestore,
  trigger,
  showLabel = true,
  size = 'md',
  disabled = false,
}: PostRevisionHistoryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRevision, setSelectedRevision] = useState<PostRevision | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [isRestoring, setIsRestoring] = useState(false);

  // Mock data for revisions - in real implementation, this would come from tRPC
  const [revisions, setRevisions] = useState<PostRevision[]>([]);

  // tRPC mutation for restoring revision
  const restoreMutation = trpc.posts.update.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Revision Restored",
        description: `Post "${data.title}" has been restored to previous version`,
      });
      setIsOpen(false);
      setSelectedRevision(null);
      onRestore?.(selectedRevision?.id || '');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to restore revision",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsRestoring(false);
    },
  });

  // Listen for real-time post events
  usePostEvents((event) => {
    if (event.data.id === post.id) {
      // In a real implementation, you would fetch the latest revisions
      // For now, we'll just show a notification
      toast({
        title: "Post Updated",
        description: `Post "${event.data.title}" has been updated`,
      });
    }
  });

  // Mock data for demonstration
  useEffect(() => {
    const mockRevisions: PostRevision[] = [
      {
        id: '1',
        postId: post.id,
        title: post.title,
        content: 'Current content...',
        status: post.status,
        authorId: 'user1',
        author: {
          id: 'user1',
          name: 'John Doe',
          email: 'john@example.com',
        },
        createdAt: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        changeType: 'UPDATE',
        changeDescription: 'Updated content and meta description',
      },
      {
        id: '2',
        postId: post.id,
        title: post.title,
        content: 'Previous content...',
        status: 'DRAFT',
        authorId: 'user2',
        author: {
          id: 'user2',
          name: 'Jane Smith',
          email: 'jane@example.com',
        },
        createdAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        changeType: 'STATUS_CHANGE',
        changeDescription: 'Changed status from Published to Draft',
      },
      {
        id: '3',
        postId: post.id,
        title: post.title,
        content: 'Original content...',
        status: 'PUBLISHED',
        authorId: 'user1',
        author: {
          id: 'user1',
          name: 'John Doe',
          email: 'john@example.com',
        },
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        changeType: 'CREATE',
        changeDescription: 'Created post',
      },
    ];
    setRevisions(mockRevisions);
  }, [post.id, post.title, post.status]);

  const filteredRevisions = filterType === 'all' 
    ? revisions 
    : revisions.filter(revision => revision.changeType === filterType);

  const handleRestore = async (revision: PostRevision) => {
    setSelectedRevision(revision);
    setIsRestoring(true);
    
    // In a real implementation, you would have a dedicated tRPC procedure for restoring
    // For now, we'll use the update procedure with the revision data
    restoreMutation.mutate({
      id: post.id,
      title: revision.title,
      content: revision.content,
      excerpt: revision.excerpt,
      status: revision.status,
      metaTitle: '',
      metaDescription: '',
    });
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setSelectedRevision(null);
    }
  };

  const getChangeTypeIcon = (type: string) => {
    return changeTypeConfig[type as keyof typeof changeTypeConfig]?.icon || <FileText className="h-4 w-4" />;
  };

  const getChangeTypeColor = (type: string) => {
    return changeTypeConfig[type as keyof typeof changeTypeConfig]?.color || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getChangeTypeLabel = (type: string) => {
    return changeTypeConfig[type as keyof typeof changeTypeConfig]?.label || type;
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
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
      disabled={disabled}
    >
      <History className="h-4 w-4" />
      {showLabel && <span>History</span>}
    </Button>
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          {trigger || defaultTrigger}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Revision History
            </DialogTitle>
            <DialogDescription>
              View and restore previous versions of "{post.title}"
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Filter */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Filter:</label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Changes</SelectItem>
                    <SelectItem value="CREATE">Created</SelectItem>
                    <SelectItem value="UPDATE">Updated</SelectItem>
                    <SelectItem value="STATUS_CHANGE">Status Changed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Badge variant="outline">
                {filteredRevisions.length} revision{filteredRevisions.length !== 1 ? 's' : ''}
              </Badge>
            </div>

            {/* Revisions Table */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Change</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRevisions.map((revision) => (
                    <TableRow key={revision.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`p-1 rounded ${getChangeTypeColor(revision.changeType)}`}>
                            {getChangeTypeIcon(revision.changeType)}
                          </div>
                          <span className="text-sm font-medium">
                            {getChangeTypeLabel(revision.changeType)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{revision.author.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{formatRelativeTime(revision.createdAt)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {revision.changeDescription}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedRevision(revision)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {revision.changeType !== 'DELETE' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRestore(revision)}
                              disabled={isRestoring}
                            >
                              {isRestoring && selectedRevision?.id === revision.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <RotateCcw className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Revision Preview */}
            {selectedRevision && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Revision Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="font-medium mb-2">Title</h4>
                      <p className="text-sm">{selectedRevision.title}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Status</h4>
                      <Badge variant="outline">{selectedRevision.status}</Badge>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Content Preview</h4>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
                      {selectedRevision.content.substring(0, 200)}
                      {selectedRevision.content.length > 200 && '...'}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Modified {formatRelativeTime(selectedRevision.createdAt)} by {selectedRevision.author.name}
                    </div>
                    <Button
                      onClick={() => handleRestore(selectedRevision)}
                      disabled={isRestoring}
                    >
                      {isRestoring ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Restoring...
                        </>
                      ) : (
                        <>
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Restore This Version
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Quick revision history button for inline use
export function PostQuickRevisionHistory({
  post,
  disabled = false,
}: {
  post: Post;
  disabled?: boolean;
}) {
  return (
    <PostRevisionHistory
      post={post}
      showLabel={false}
      size="sm"
      disabled={disabled}
      trigger={
        <Button variant="ghost" size="sm" disabled={disabled}>
          <History className="h-4 w-4" />
        </Button>
      }
    />
  );
}
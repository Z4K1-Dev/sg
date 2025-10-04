'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import {
  Trash2,
  Archive,
  Eye,
  Edit,
  Download,
  MoreHorizontal,
  CheckCircle,
  AlertCircle,
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
  categoryId?: string;
  authorId: string;
}

interface PostCategory {
  id: string;
  name: string;
}

interface BulkAction {
  type: 'delete' | 'publish' | 'unpublish' | 'archive' | 'changeCategory' | 'export';
  label: string;
  icon: React.ReactNode;
  description: string;
  destructive?: boolean;
}

interface ActionResult {
  success: boolean;
  count: number;
  errors?: string[];
}

interface PostActionsProps {
  selectedPosts: string[];
  posts: Post[];
  categories?: PostCategory[];
  onBulkAction?: (action: string, postIds: string[], options?: any) => Promise<ActionResult>;
  onExport?: (postIds: string[], format: 'json' | 'csv') => Promise<void>;
  onClearSelection?: () => void;
  loading?: boolean;
}

export function PostActions({
  selectedPosts,
  posts,
  categories = [],
  onExport,
  onClearSelection,
  loading = false,
}: PostActionsProps) {
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<BulkAction | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [actionResult, setActionResult] = useState<ActionResult | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('');

  const selectedPostsData = posts.filter(post => selectedPosts.includes(post.id));
  const selectedCount = selectedPosts.length;

  // tRPC mutation for bulk actions
  const bulkActionMutation = trpc.posts.bulk.useMutation({
    onSuccess: (data) => {
      setActionResult({ success: true, count: data.count });
      setProgress(100);
      toast({
        title: "Success",
        description: `${selectedAction?.label} completed for ${data.count} posts`,
      });
      onClearSelection?.();
    },
    onError: (error) => {
      setActionResult({ success: false, count: 0, errors: [error.message] });
      toast({
        title: "Error",
        description: `Failed to ${selectedAction?.label.toLowerCase()} posts`,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsProcessing(false);
      setTimeout(() => {
        setActionDialogOpen(false);
        setSelectedAction(null);
        setSelectedCategory('');
      }, 2000);
    },
  });

  // Listen for real-time post events
  usePostEvents((event) => {
    if (event.type === 'post.published' || event.type === 'post.unpublished' || event.type === 'post.deleted') {
      // Update progress for bulk actions
      if (isProcessing && selectedPosts.includes(event.data.id)) {
        const completedPosts = selectedPosts.filter(() =>
          // In a real implementation, you would track which posts have been processed
          Math.random() > 0.5 // Simulate random completion for demo
        ).length;
        
        const newProgress = Math.round((completedPosts / selectedPosts.length) * 100);
        setProgress(Math.min(newProgress, 90)); // Cap at 90% until final result
      }
    }
  });

  const bulkActions: BulkAction[] = [
    {
      type: 'publish',
      label: 'Publish',
      icon: <Eye className="h-4 w-4" />,
      description: 'Publish selected posts',
    },
    {
      type: 'unpublish',
      label: 'Set as Draft',
      icon: <Edit className="h-4 w-4" />,
      description: 'Set selected posts as draft',
    },
    {
      type: 'archive',
      label: 'Archive',
      icon: <Archive className="h-4 w-4" />,
      description: 'Archive selected posts',
    },
    {
      type: 'changeCategory',
      label: 'Change Category',
      icon: <Edit className="h-4 w-4" />,
      description: 'Change category of selected posts',
    },
    {
      type: 'export',
      label: 'Export',
      icon: <Download className="h-4 w-4" />,
      description: 'Export selected posts',
    },
    {
      type: 'delete',
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4" />,
      description: 'Delete selected posts permanently',
      destructive: true,
    },
  ];

  const handleActionSelect = (action: BulkAction) => {
    setSelectedAction(action);
    setActionDialogOpen(true);
    setActionResult(null);
    setProgress(0);
  };

  const handleActionConfirm = async () => {
    if (!selectedAction || selectedPosts.length === 0) return;

    setIsProcessing(true);
    setProgress(0);

    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 100);

    try {
      if (selectedAction.type === 'export') {
        // Handle export separately
        await onExport?.(selectedPosts, 'json');
        clearInterval(progressInterval);
        setProgress(100);
        setActionResult({ success: true, count: selectedPosts.length });
      } else {
        // Use tRPC mutation for bulk actions
        bulkActionMutation.mutate({
          action: selectedAction.type as 'delete' | 'publish' | 'unpublish' | 'archive',
          postIds: selectedPosts,
        });
      }
    } catch (error) {
      clearInterval(progressInterval);
      setActionResult({ success: false, count: 0, errors: ['Action failed'] });
      toast({
        title: "Error",
        description: `Failed to ${selectedAction.label.toLowerCase()} posts`,
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      await onExport?.(selectedPosts, format);
      toast({
        title: "Export Started",
        description: `Exporting ${selectedCount} posts as ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export posts",
        variant: "destructive",
      });
    }
  };

  const getStatusBreakdown = () => {
    const breakdown = {
      DRAFT: 0,
      PUBLISHED: 0,
      ARCHIVED: 0,
    };

    selectedPostsData.forEach(post => {
      breakdown[post.status]++;
    });

    return breakdown;
  };

  const statusBreakdown = getStatusBreakdown();

  if (selectedCount === 0) {
    return null;
  }

  return (
    <Card className="border-primary">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {selectedCount} post{selectedCount !== 1 ? 's' : ''} selected
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClearSelection}>
            Clear selection
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Breakdown */}
        <div className="flex flex-wrap gap-2">
          {statusBreakdown.DRAFT > 0 && (
            <Badge variant="secondary">
              {statusBreakdown.DRAFT} Draft{statusBreakdown.DRAFT !== 1 ? 's' : ''}
            </Badge>
          )}
          {statusBreakdown.PUBLISHED > 0 && (
            <Badge variant="default">
              {statusBreakdown.PUBLISHED} Published
            </Badge>
          )}
          {statusBreakdown.ARCHIVED > 0 && (
            <Badge variant="outline">
              {statusBreakdown.ARCHIVED} Archived
            </Badge>
          )}
        </div>

        {/* Bulk Actions */}
        <div className="flex flex-wrap gap-2">
          {bulkActions.map((action) => (
            <Button
              key={action.type}
              variant={action.destructive ? "destructive" : "outline"}
              size="sm"
              onClick={() => handleActionSelect(action)}
              disabled={loading || isProcessing}
            >
              {action.icon}
              <span className="ml-2">{action.label}</span>
            </Button>
          ))}

          {/* Export Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={loading || isProcessing}>
                <Download className="h-4 w-4 mr-2" />
                Export
                <MoreHorizontal className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport('json')}>
                Export as JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('csv')}>
                Export as CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Action Confirmation Dialog */}
        <AlertDialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                {selectedAction?.icon}
                {selectedAction?.label} {selectedCount} post{selectedCount !== 1 ? 's' : ''}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {selectedAction?.description}
                {selectedAction?.destructive && (
                  <span className="text-red-600 font-medium block mt-2">
                    This action cannot be undone!
                  </span>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>

            {/* Category Selection for Change Category Action */}
            {selectedAction?.type === 'changeCategory' && (
              <div className="py-4">
                <label className="text-sm font-medium mb-2 block">Select New Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No category</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Progress */}
            {isProcessing && (
              <div className="py-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Processing...</span>
                  <span className="text-sm">{progress}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}

            {/* Action Result */}
            {actionResult && !isProcessing && (
              <div className="py-4">
                <div className={`flex items-center gap-2 ${actionResult.success ? 'text-green-600' : 'text-red-600'}`}>
                  {actionResult.success ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <AlertCircle className="h-5 w-5" />
                  )}
                  <span className="font-medium">
                    {actionResult.success ? 'Success!' : 'Completed with errors'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {actionResult.count} post{actionResult.count !== 1 ? 's' : ''} processed
                </p>
                {actionResult.errors && actionResult.errors.length > 0 && (
                  <div className="mt-2 text-sm text-red-600">
                    {actionResult.errors.map((error, index) => (
                      <div key={index}>• {error}</div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <AlertDialogFooter>
              <AlertDialogCancel disabled={isProcessing}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleActionConfirm}
                disabled={isProcessing || (selectedAction?.type === 'changeCategory' && !selectedCategory)}
                className={selectedAction?.destructive ? 'bg-red-600 hover:bg-red-700' : ''}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {selectedAction?.icon}
                    <span className="ml-2">
                      {selectedAction?.label} {selectedCount} post{selectedCount !== 1 ? 's' : ''}
                    </span>
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
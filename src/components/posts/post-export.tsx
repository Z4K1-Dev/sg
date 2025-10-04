'use client';

import { useState } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Download,
  Loader2,
  CheckCircle,
  AlertCircle,
  FileJson,
  FileSpreadsheet
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { trpc } from '@/lib/trpc/client';

// Types
interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  categoryId?: string;
  authorId: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
  category?: {
    id: string;
    name: string;
  };
  tags: Array<{
    tag: {
      id: string;
      name: string;
    };
  }>;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  metaTitle?: string;
  metaDescription?: string;
  featuredImage?: string;
}

interface PostExportProps {
  posts?: Post[];
  selectedPosts?: string[];
  onExport?: (format: 'json' | 'csv', options: ExportOptions) => void;
  trigger?: React.ReactNode;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

interface ExportOptions {
  format: 'json' | 'csv';
  includeContent: boolean;
  includeMetadata: boolean;
  includeAuthor: boolean;
  includeCategory: boolean;
  includeTags: boolean;
  includeDates: boolean;
  dateRange?: {
    from: Date;
    to: Date;
  };
  statusFilter?: string[];
}

const formatOptions = [
  { value: 'json', label: 'JSON', icon: <FileJson className="h-4 w-4" />, description: 'Structured data format' },
  { value: 'csv', label: 'CSV', icon: <FileSpreadsheet className="h-4 w-4" />, description: 'Spreadsheet format' },
];

const statusOptions = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'ARCHIVED', label: 'Archived' },
];

export function PostExport({
  posts = [],
  selectedPosts = [],
  onExport,
  trigger,
  showLabel = true,
  size = 'md',
  disabled = false,
}: PostExportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [exportResult, setExportResult] = useState<{ success: boolean; message: string } | null>(null);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'json',
    includeContent: true,
    includeMetadata: false,
    includeAuthor: true,
    includeCategory: true,
    includeTags: true,
    includeDates: true,
    statusFilter: [],
  });

  // tRPC query for getting posts to export
  const postsQuery = trpc.posts.getAll.useQuery({
    page: 1,
    limit: 1000, // Get more posts for export
    status: (exportOptions.statusFilter && exportOptions.statusFilter[0]) as any || undefined,
  }, {
    enabled: false, // Don't auto-fetch
  });

  const handleExport = async () => {
    setIsExporting(true);
    setProgress(0);
    setExportResult(null);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      // Get posts data (either selected or filtered)
      let postsToExport = selectedPosts.length > 0 
        ? posts.filter(post => selectedPosts.includes(post.id))
        : posts;

      // Apply status filter if set
      if (exportOptions.statusFilter && exportOptions.statusFilter.length > 0) {
        postsToExport = postsToExport.filter(post =>
          exportOptions.statusFilter!.includes(post.status)
        );
      }

      // If no posts provided, fetch them
      if (postsToExport.length === 0) {
        await postsQuery.refetch();
        postsToExport = (postsQuery.data?.posts || []) as any;
      }

      // Process and export data
      const exportData = processExportData(postsToExport, exportOptions);
      const blob = createExportFile(exportData, exportOptions.format);
      downloadFile(blob, `posts.${exportOptions.format}`);

      clearInterval(progressInterval);
      setProgress(100);
      setExportResult({
        success: true,
        message: `Successfully exported ${postsToExport.length} posts as ${exportOptions.format.toUpperCase()}`
      });

      toast({
        title: "Export Complete",
        description: `Exported ${postsToExport.length} posts as ${exportOptions.format.toUpperCase()}`,
      });

      onExport?.(exportOptions.format, exportOptions);

      setTimeout(() => {
        setIsOpen(false);
        setProgress(0);
        setExportResult(null);
      }, 2000);
    } catch (error) {
      setExportResult({
        success: false,
        message: "Failed to export posts"
      });
      toast({
        title: "Export Failed",
        description: "An error occurred while exporting posts",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const processExportData = (postsToExport: Post[], options: ExportOptions) => {
    return postsToExport.map(post => {
      const exportData: any = {
        id: post.id,
        title: post.title,
        slug: post.slug,
        status: post.status,
      };

      if (options.includeContent) {
        exportData.content = post.content;
        exportData.excerpt = post.excerpt;
      }

      if (options.includeMetadata) {
        exportData.metaTitle = post.metaTitle;
        exportData.metaDescription = post.metaDescription;
        exportData.featuredImage = post.featuredImage;
      }

      if (options.includeAuthor) {
        exportData.author = {
          id: post.author.id,
          name: post.author.name,
          email: post.author.email,
        };
      }

      if (options.includeCategory && post.category) {
        exportData.category = {
          id: post.category.id,
          name: post.category.name,
        };
      }

      if (options.includeTags) {
        exportData.tags = post.tags.map(postTag => ({
          id: postTag.tag.id,
          name: postTag.tag.name,
        }));
      }

      if (options.includeDates) {
        exportData.publishedAt = post.publishedAt;
        exportData.createdAt = post.createdAt;
        exportData.updatedAt = post.updatedAt;
      }

      return exportData;
    });
  };

  const createExportFile = (data: any[], format: 'json' | 'csv') => {
    if (format === 'json') {
      return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    } else {
      // Create CSV
      if (data.length === 0) return new Blob([''], { type: 'text/csv' });
      
      const headers = Object.keys(data[0]);
      const csvHeaders = headers.join(',');
      const csvRows = data.map(item => 
        headers.map(header => {
          const value = getNestedValue(item, header);
          return typeof value === 'string' && value.includes(',') 
            ? `"${value.replace(/"/g, '""')}"` 
            : value;
        }).join(',')
      );
      
      return new Blob([csvHeaders + '\n' + csvRows.join('\n')], { type: 'text/csv' });
    }
  };

  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((current, key) => current?.[key], obj) || '';
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleStatusFilterChange = (status: string, checked: boolean) => {
    setExportOptions(prev => ({
      ...prev,
      statusFilter: checked
        ? [...(prev.statusFilter || []), status]
        : (prev.statusFilter || []).filter(s => s !== status)
    }));
  };

  const getPostsCount = () => {
    if (selectedPosts.length > 0) return selectedPosts.length;
    if (exportOptions.statusFilter && exportOptions.statusFilter.length > 0) {
      return posts.filter(post => exportOptions.statusFilter!.includes(post.status)).length;
    }
    return posts.length;
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
      <Download className="h-4 w-4" />
      {showLabel && <span>Export</span>}
    </Button>
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {trigger || defaultTrigger}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Posts
            </DialogTitle>
            <DialogDescription>
              Export posts data in various formats
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Export Format */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Export Format</label>
              <div className="grid grid-cols-2 gap-3">
                {formatOptions.map((format) => (
                  <Card 
                    key={format.value}
                    className={`cursor-pointer transition-colors ${
                      exportOptions.format === format.value 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setExportOptions(prev => ({ ...prev, format: format.value as 'json' | 'csv' }))}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          exportOptions.format === format.value 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-gray-100'
                        }`}>
                          {format.icon}
                        </div>
                        <div>
                          <div className="font-medium">{format.label}</div>
                          <div className="text-xs text-gray-500">{format.description}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Separator />

            {/* Export Options */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Export Options</label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeContent"
                    checked={exportOptions.includeContent}
                    onCheckedChange={(checked) => 
                      setExportOptions(prev => ({ ...prev, includeContent: checked as boolean }))
                    }
                  />
                  <Label htmlFor="includeContent" className="text-sm">
                    Include content and excerpt
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeMetadata"
                    checked={exportOptions.includeMetadata}
                    onCheckedChange={(checked) => 
                      setExportOptions(prev => ({ ...prev, includeMetadata: checked as boolean }))
                    }
                  />
                  <Label htmlFor="includeMetadata" className="text-sm">
                    Include SEO metadata
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeAuthor"
                    checked={exportOptions.includeAuthor}
                    onCheckedChange={(checked) => 
                      setExportOptions(prev => ({ ...prev, includeAuthor: checked as boolean }))
                    }
                  />
                  <Label htmlFor="includeAuthor" className="text-sm">
                    Include author information
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeCategory"
                    checked={exportOptions.includeCategory}
                    onCheckedChange={(checked) => 
                      setExportOptions(prev => ({ ...prev, includeCategory: checked as boolean }))
                    }
                  />
                  <Label htmlFor="includeCategory" className="text-sm">
                    Include category information
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeTags"
                    checked={exportOptions.includeTags}
                    onCheckedChange={(checked) => 
                      setExportOptions(prev => ({ ...prev, includeTags: checked as boolean }))
                    }
                  />
                  <Label htmlFor="includeTags" className="text-sm">
                    Include tags
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeDates"
                    checked={exportOptions.includeDates}
                    onCheckedChange={(checked) => 
                      setExportOptions(prev => ({ ...prev, includeDates: checked as boolean }))
                    }
                  />
                  <Label htmlFor="includeDates" className="text-sm">
                    Include dates (created, updated, published)
                  </Label>
                </div>
              </div>
            </div>

            <Separator />

            {/* Status Filter */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Filter by Status (Optional)</label>
              <div className="flex flex-wrap gap-3">
                {statusOptions.map((status) => (
                  <div key={status.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`export-status-${status.value}`}
                      checked={exportOptions.statusFilter?.includes(status.value) || false}
                      onCheckedChange={(checked) => 
                        handleStatusFilterChange(status.value, checked as boolean)
                      }
                    />
                    <Label htmlFor={`export-status-${status.value}`} className="text-sm">
                      {status.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Export Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Export Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Posts to export:</span>
                    <Badge variant="outline">{getPostsCount()}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Format:</span>
                    <Badge variant="outline">{exportOptions.format.toUpperCase()}</Badge>
                  </div>
                  {selectedPosts.length > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Selection:</span>
                      <Badge variant="secondary">Selected posts</Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Progress */}
            {isExporting && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Exporting...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}

            {/* Result */}
            {exportResult && !isExporting && (
              <div className={`p-3 rounded-lg ${
                exportResult.success 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                <div className="flex items-center gap-2">
                  {exportResult.success ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <span className="text-sm font-medium">
                    {exportResult.success ? 'Export Successful' : 'Export Failed'}
                  </span>
                </div>
                <p className="text-sm mt-1">{exportResult.message}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isExporting}>
                Cancel
              </Button>
              <Button onClick={handleExport} disabled={isExporting || getPostsCount() === 0}>
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export {getPostsCount()} Posts
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Quick export button for inline use
export function PostQuickExport({
  posts,
  format = 'json',
  disabled = false,
}: {
  posts: Post[];
  format?: 'json' | 'csv';
  disabled?: boolean;
}) {
  const [isExporting, setIsExporting] = useState(false);

  const handleQuickExport = async () => {
    setIsExporting(true);
    try {
      // Simple export with default options
      const exportData = posts.map(post => ({
        id: post.id,
        title: post.title,
        status: post.status,
        author: post.author.name,
        createdAt: post.createdAt,
      }));

      const blob = format === 'json' 
        ? new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
        : new Blob([
            'id,title,status,author,createdAt\n',
            ...exportData.map(item => 
              `${item.id},"${item.title}",${item.status},${item.author},${item.createdAt}`
            )
          ], { type: 'text/csv' });

      downloadFile(blob, `posts.${format}`);
      
      toast({
        title: "Export Complete",
        description: `Exported ${posts.length} posts as ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export posts",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleQuickExport}
      disabled={disabled || isExporting}
    >
      {isExporting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : format === 'json' ? (
        <FileJson className="h-4 w-4" />
      ) : (
        <FileSpreadsheet className="h-4 w-4" />
      )}
    </Button>
  );
}
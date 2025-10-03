'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Plus, 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  Tag as TagIcon,
  Search,
  RefreshCw,
  TrendingUp
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Types
interface Tag {
  id: string;
  name: string;
  slug: string;
  _count?: {
    posts: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Form schema
const tagFormSchema = z.object({
  name: z.string().min(1, 'Tag name is required'),
  slug: z.string().min(1, 'Slug is required'),
});

type TagFormData = z.infer<typeof tagFormSchema>;

interface TagManagerProps {
  tags?: Tag[];
  loading?: boolean;
  onCreate?: (data: TagFormData) => Promise<void>;
  onUpdate?: (id: string, data: TagFormData) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onRefresh?: () => void;
}

export function TagManager({
  tags = [],
  loading = false,
  onCreate,
  onUpdate,
  onDelete,
  onRefresh,
}: TagManagerProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [autoGenerateSlug, setAutoGenerateSlug] = useState(true);
  const [sortBy, setSortBy] = useState<'name' | 'posts' | 'created'>('name');

  const createForm = useForm<TagFormData>({
    resolver: zodResolver(tagFormSchema),
    defaultValues: {
      name: '',
      slug: '',
    },
  });

  const editForm = useForm<TagFormData>({
    resolver: zodResolver(tagFormSchema),
    defaultValues: {
      name: '',
      slug: '',
    },
  });

  const { watch: watchCreate } = createForm;
  const { watch: watchEdit } = editForm;
  const createNameValue = watchCreate('name');
  const editNameValue = watchEdit('name');

  // Auto-generate slug from name
  useEffect(() => {
    if (autoGenerateSlug && createNameValue) {
      const slug = createNameValue
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      createForm.setValue('slug', slug);
    }
  }, [createNameValue, autoGenerateSlug, createForm]);

  useEffect(() => {
    if (autoGenerateSlug && editNameValue && selectedTag) {
      const slug = editNameValue
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      editForm.setValue('slug', slug);
    }
  }, [editNameValue, autoGenerateSlug, editForm, selectedTag]);

  const handleCreate = async (data: TagFormData) => {
    setIsSubmitting(true);
    try {
      await onCreate?.(data);
      setCreateDialogOpen(false);
      createForm.reset();
      toast({
        title: "Success",
        description: "Tag created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create tag",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (data: TagFormData) => {
    if (!selectedTag) return;
    
    setIsSubmitting(true);
    try {
      await onUpdate?.(selectedTag.id, data);
      setEditDialogOpen(false);
      setSelectedTag(null);
      editForm.reset();
      toast({
        title: "Success",
        description: "Tag updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update tag",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTag) return;
    
    setIsDeleting(true);
    try {
      await onDelete?.(selectedTag.id);
      setDeleteDialogOpen(false);
      setSelectedTag(null);
      toast({
        title: "Success",
        description: "Tag deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete tag",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const openEditDialog = (tag: Tag) => {
    setSelectedTag(tag);
    editForm.reset({
      name: tag.name,
      slug: tag.slug,
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (tag: Tag) => {
    setSelectedTag(tag);
    setDeleteDialogOpen(true);
  };

  const getSortedTags = () => {
    const filtered = tags.filter(tag =>
      tag.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'posts':
          return (b._count?.posts || 0) - (a._count?.posts || 0);
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });
  };

  const sortedTags = getSortedTags();
  const popularTags = tags
    .filter(tag => (tag._count?.posts || 0) > 0)
    .sort((a, b) => (b._count?.posts || 0) - (a._count?.posts || 0))
    .slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tags</h2>
          <p className="text-gray-600">
            Manage your blog tags
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Tag
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Tag</DialogTitle>
                <DialogDescription>
                  Create a new tag to categorize your posts
                </DialogDescription>
              </DialogHeader>
              <Form {...createForm}>
                <form onSubmit={createForm.handleSubmit(handleCreate)} className="space-y-4">
                  <FormField
                    control={createForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Tag name..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createForm.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel>Slug</FormLabel>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={autoGenerateSlug}
                              onChange={(e) => setAutoGenerateSlug(e.target.checked)}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm text-gray-600">Auto-generate</span>
                          </div>
                        </div>
                        <FormControl>
                          <Input 
                            placeholder="url-slug" 
                            {...field}
                            disabled={autoGenerateSlug}
                          />
                        </FormControl>
                        <FormDescription>
                          This will be part of the URL: /tag/{createForm.watch('slug')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Creating...' : 'Create Tag'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Popular Tags */}
      {popularTags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Popular Tags
            </CardTitle>
            <CardDescription>
              Most used tags across all posts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {popularTags.map((tag) => (
                <Badge 
                  key={tag.id} 
                  variant="secondary" 
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                  onClick={() => setSearchQuery(tag.name)}
                >
                  {tag.name} ({tag._count?.posts})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Sort */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'name' | 'posts' | 'created')}
          className="px-3 py-2 border rounded-md bg-white"
        >
          <option value="name">Sort by Name</option>
          <option value="posts">Sort by Posts</option>
          <option value="created">Sort by Created</option>
        </select>
      </div>

      {/* Tags Grid */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : sortedTags.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <TagIcon className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {searchQuery ? 'No tags found' : 'No tags yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchQuery 
                ? "Try adjusting your search query"
                : "Create your first tag to get started"
              }
            </p>
            {!searchQuery && (
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Tag
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sortedTags.map((tag) => (
            <Card key={tag.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {tag.name}
                    </h3>
                    <p className="text-sm text-gray-500 font-mono">
                      /{tag.slug}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(tag)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => openDeleteDialog(tag)}
                        className="text-red-600"
                        disabled={(tag._count?.posts || 0) > 0}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">
                    {tag._count?.posts || 0} posts
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {new Date(tag.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Tag</DialogTitle>
            <DialogDescription>
              Update the tag details
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleUpdate)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Tag name..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Slug</FormLabel>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={autoGenerateSlug}
                          onChange={(e) => setAutoGenerateSlug(e.target.checked)}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-600">Auto-generate</span>
                      </div>
                    </div>
                    <FormControl>
                      <Input 
                        placeholder="url-slug" 
                        {...field}
                        disabled={autoGenerateSlug}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Updating...' : 'Update Tag'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the tag "{selectedTag?.name}". 
              {selectedTag && (selectedTag._count?.posts || 0) > 0 && (
                <span className="text-red-600 font-medium">
                  {" "}This tag is used in {selectedTag._count?.posts} posts and cannot be deleted.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={isDeleting || (selectedTag && (selectedTag._count?.posts || 0) > 0)}
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
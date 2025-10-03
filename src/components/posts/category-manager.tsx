'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  CardHeader,
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
  Folder,
  Search,
  RefreshCw
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Types
interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  type: 'POST' | 'PAGE';
  _count?: {
    posts: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Form schema
const categoryFormSchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  type: z.enum(['POST', 'PAGE']).default('POST'),
});

type CategoryFormData = z.infer<typeof categoryFormSchema>;

interface CategoryManagerProps {
  categories?: Category[];
  loading?: boolean;
  onCreate?: (data: CategoryFormData) => Promise<void>;
  onUpdate?: (id: string, data: CategoryFormData) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onRefresh?: () => void;
}

export function CategoryManager({
  categories = [],
  loading = false,
  onCreate,
  onUpdate,
  onDelete,
  onRefresh,
}: CategoryManagerProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [autoGenerateSlug, setAutoGenerateSlug] = useState(true);

  const createForm = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      type: 'POST',
    },
  });

  const editForm = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      type: 'POST',
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
    if (autoGenerateSlug && editNameValue && selectedCategory) {
      const slug = editNameValue
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      editForm.setValue('slug', slug);
    }
  }, [editNameValue, autoGenerateSlug, editForm, selectedCategory]);

  const handleCreate = async (data: CategoryFormData) => {
    setIsSubmitting(true);
    try {
      await onCreate?.(data);
      setCreateDialogOpen(false);
      createForm.reset();
      toast({
        title: "Success",
        description: "Category created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create category",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (data: CategoryFormData) => {
    if (!selectedCategory) return;
    
    setIsSubmitting(true);
    try {
      await onUpdate?.(selectedCategory.id, data);
      setEditDialogOpen(false);
      setSelectedCategory(null);
      editForm.reset();
      toast({
        title: "Success",
        description: "Category updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;
    
    setIsDeleting(true);
    try {
      await onDelete?.(selectedCategory.id);
      setDeleteDialogOpen(false);
      setSelectedCategory(null);
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const openEditDialog = (category: Category) => {
    setSelectedCategory(category);
    editForm.reset({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      type: category.type,
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (category: Category) => {
    setSelectedCategory(category);
    setDeleteDialogOpen(true);
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const typeColors = {
    POST: 'bg-blue-100 text-blue-800 border-blue-200',
    PAGE: 'bg-purple-100 text-purple-800 border-purple-200',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Categories</h2>
          <p className="text-gray-600">
            Manage your blog categories
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
                New Category
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Category</DialogTitle>
                <DialogDescription>
                  Create a new category to organize your posts
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
                          <Input placeholder="Category name..." {...field} />
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
                          This will be part of the URL: /category/{createForm.watch('slug')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Category description..."
                            className="resize-none"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createForm.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <select
                          className="w-full p-2 border rounded-md"
                          {...field}
                        >
                          <option value="POST">Blog Posts</option>
                          <option value="PAGE">Pages</option>
                        </select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Creating...' : 'Create Category'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredCategories.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Folder className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {searchQuery ? 'No categories found' : 'No categories yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchQuery 
                ? "Try adjusting your search query"
                : "Create your first category to get started"
              }
            </p>
            {!searchQuery && (
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Category
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCategories.map((category) => (
            <Card key={category.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={typeColors[category.type]} variant="outline">
                        {category.type}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-500 font-mono">
                      /{category.slug}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(category)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => openDeleteDialog(category)}
                        className="text-red-600"
                        disabled={(category._count?.posts || 0) > 0}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                {category.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {category.description}
                  </p>
                )}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{category._count?.posts || 0} posts</span>
                  <span>Created {new Date(category.createdAt).toLocaleDateString()}</span>
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
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update the category details
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
                      <Input placeholder="Category name..." {...field} />
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

              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Category description..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <select
                      className="w-full p-2 border rounded-md"
                      {...field}
                    >
                      <option value="POST">Blog Posts</option>
                      <option value="PAGE">Pages</option>
                    </select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Updating...' : 'Update Category'}
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
              This will permanently delete the category "{selectedCategory?.name}". 
              {selectedCategory && (selectedCategory._count?.posts || 0) > 0 && (
                <span className="text-red-600 font-medium">
                  {" "}This category has {selectedCategory._count?.posts} posts and cannot be deleted.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={isDeleting || (selectedCategory && (selectedCategory._count?.posts || 0) > 0)}
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
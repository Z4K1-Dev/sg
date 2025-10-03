'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Filter, 
  X, 
  ChevronDown, 
  ChevronUp,
  Calendar,
  User,
  Tag,
  Folder,
  SlidersHorizontal
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Types
interface PostCategory {
  id: string;
  name: string;
  slug: string;
}

interface PostTag {
  id: string;
  name: string;
  slug: string;
}

interface PostAuthor {
  id: string;
  name: string;
  email: string;
}

// Advanced search schema
const advancedSearchSchema = z.object({
  query: z.string().optional(),
  title: z.string().optional(),
  content: z.string().optional(),
  excerpt: z.string().optional(),
  categoryId: z.string().optional(),
  tagIds: z.array(z.string()).optional(),
  authorId: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  type: z.enum(['POST', 'PAGE']).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  hasFeaturedImage: z.boolean().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'publishedAt', 'title']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

type AdvancedSearchData = z.infer<typeof advancedSearchSchema>;

interface PostSearchProps {
  categories?: PostCategory[];
  tags?: PostTag[];
  authors?: PostAuthor[];
  onSearch?: (filters: AdvancedSearchData) => void;
  onClear?: () => void;
  loading?: boolean;
  initialFilters?: Partial<AdvancedSearchData>;
}

export function PostSearch({
  categories = [],
  tags = [],
  authors = [],
  onSearch,
  onClear,
  loading = false,
  initialFilters = {},
}: PostSearchProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const form = useForm<AdvancedSearchData>({
    resolver: zodResolver(advancedSearchSchema),
    defaultValues: {
      query: '',
      title: '',
      content: '',
      excerpt: '',
      categoryId: '',
      tagIds: [],
      authorId: '',
      status: undefined,
      type: undefined,
      dateFrom: '',
      dateTo: '',
      hasFeaturedImage: undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      ...initialFilters,
    },
  });

  const { watch, setValue, reset } = form;
  const watchedValues = watch();

  // Track active filters
  useEffect(() => {
    const filters: string[] = [];
    
    if (watchedValues.query) filters.push('Query');
    if (watchedValues.title) filters.push('Title');
    if (watchedValues.content) filters.push('Content');
    if (watchedValues.excerpt) filters.push('Excerpt');
    if (watchedValues.categoryId) filters.push('Category');
    if (watchedValues.tagIds && watchedValues.tagIds.length > 0) filters.push('Tags');
    if (watchedValues.authorId) filters.push('Author');
    if (watchedValues.status) filters.push('Status');
    if (watchedValues.type) filters.push('Type');
    if (watchedValues.dateFrom) filters.push('Date From');
    if (watchedValues.dateTo) filters.push('Date To');
    if (watchedValues.hasFeaturedImage !== undefined) filters.push('Featured Image');
    
    setActiveFilters(filters);
  }, [watchedValues]);

  const handleSearch = (data: AdvancedSearchData) => {
    onSearch?.(data);
  };

  const handleQuickSearch = (query: string) => {
    setValue('query', query);
    onSearch?.({ ...watchedValues, query });
  };

  const handleClear = () => {
    reset();
    onClear?.();
    toast({
      title: "Search cleared",
      description: "All search filters have been removed",
    });
  };

  const removeFilter = (filterKey: keyof AdvancedSearchData) => {
    setValue(filterKey, filterKey === 'tagIds' ? [] : '');
    // Trigger search with updated filters
    setTimeout(() => {
      onSearch?.(watch());
    }, 0);
  };

  const handleTagToggle = (tagId: string) => {
    const currentTags = watchedValues.tagIds || [];
    const newTags = currentTags.includes(tagId)
      ? currentTags.filter(id => id !== tagId)
      : [...currentTags, tagId];
    setValue('tagIds', newTags);
  };

  const hasActiveFilters = activeFilters.length > 0;

  return (
    <div className="space-y-4">
      {/* Quick Search Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Posts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search posts..."
                value={watchedValues.query || ''}
                onChange={(e) => setValue('query', e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch(watchedValues);
                  }
                }}
                className="pl-10"
              />
            </div>
            <Button 
              onClick={() => handleSearch(watchedValues)}
              disabled={loading}
            >
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Advanced
            </Button>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-600">Active filters:</span>
              {activeFilters.map((filter) => (
                <Badge key={filter} variant="secondary" className="flex items-center gap-1">
                  {filter}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => {
                      const key = filter.toLowerCase().replace(' ', '') as keyof AdvancedSearchData;
                      removeFilter(key);
                    }}
                  />
                </Badge>
              ))}
              <Button variant="ghost" size="sm" onClick={handleClear}>
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Advanced Search */}
      <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
        <CollapsibleContent className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Advanced Search Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSearch)} className="space-y-6">
                  {/* Content Search */}
                  <div className="grid gap-4 md:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Search in title..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Content</FormLabel>
                          <FormControl>
                            <Input placeholder="Search in content..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="excerpt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Excerpt</FormLabel>
                          <FormControl>
                            <Input placeholder="Search in excerpt..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Filters */}
                  <div className="grid gap-4 md:grid-cols-4">
                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="">All Categories</SelectItem>
                              {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="authorId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Author</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select author" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="">All Authors</SelectItem>
                              {authors.map((author) => (
                                <SelectItem key={author.id} value={author.id}>
                                  {author.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="">All Status</SelectItem>
                              <SelectItem value="DRAFT">Draft</SelectItem>
                              <SelectItem value="PUBLISHED">Published</SelectItem>
                              <SelectItem value="ARCHIVED">Archived</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="">All Types</SelectItem>
                              <SelectItem value="POST">Post</SelectItem>
                              <SelectItem value="PAGE">Page</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Date Range */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="dateFrom"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date From</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dateTo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date To</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <FormLabel>Tags</FormLabel>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <Badge
                          key={tag.id}
                          variant={watchedValues.tagIds?.includes(tag.id) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => handleTagToggle(tag.id)}
                        >
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Additional Filters */}
                  <div className="grid gap-4 md:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="hasFeaturedImage"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Has Featured Image
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="sortBy"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sort By</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="createdAt">Created Date</SelectItem>
                              <SelectItem value="updatedAt">Updated Date</SelectItem>
                              <SelectItem value="publishedAt">Published Date</SelectItem>
                              <SelectItem value="title">Title</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="sortOrder"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sort Order</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="desc">Descending</SelectItem>
                              <SelectItem value="asc">Ascending</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={handleClear}>
                      <X className="h-4 w-4 mr-2" />
                      Clear Filters
                    </Button>
                    <Button type="submit" disabled={loading}>
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Quick Search Suggestions */}
      {!isAdvancedOpen && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">Quick Search:</h4>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickSearch('')}
                >
                  All Posts
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickSearch('DRAFT')}
                >
                  Drafts
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickSearch('PUBLISHED')}
                >
                  Published
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickSearch('tutorial')}
                >
                  Tutorials
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickSearch('guide')}
                >
                  Guides
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
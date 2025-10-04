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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Search,
  Filter,
  X,
  Calendar as CalendarIcon,
  User,
  Loader2,
  SlidersHorizontal
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { trpc } from '@/lib/trpc/client';
import { format } from 'date-fns';

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

interface User {
  id: string;
  name: string;
  email: string;
}

interface SearchFilters {
  query: string;
  status: string[];
  categoryId: string;
  authorId: string;
  tagIds: string[];
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  hasFeaturedImage: boolean | undefined;
  contentLength: 'short' | 'medium' | 'long' | undefined;
}

interface PostAdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  categories?: PostCategory[];
  tags?: PostTag[];
  authors?: User[];
  trigger?: React.ReactNode;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

const statusOptions = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'ARCHIVED', label: 'Archived' },
];

const contentLengthOptions = [
  { value: 'short', label: 'Short (< 300 chars)', min: 0, max: 300 },
  { value: 'medium', label: 'Medium (300-1000 chars)', min: 300, max: 1000 },
  { value: 'long', label: 'Long (> 1000 chars)', min: 1000, max: Infinity },
];

export function PostAdvancedSearch({
  onSearch,
  categories = [],
  tags = [],
  authors = [],
  trigger,
  showLabel = true,
  size = 'md',
  disabled = false,
}: PostAdvancedSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [activeFilters, setActiveFilters] = useState<SearchFilters>({
    query: '',
    status: [],
    categoryId: '',
    authorId: '',
    tagIds: [],
    dateFrom: undefined,
    dateTo: undefined,
    hasFeaturedImage: undefined,
    contentLength: undefined,
  });

  // tRPC query for search results
  const searchQuery = trpc.posts.getAll.useQuery(
    {
      page: 1,
      limit: 20,
      search: activeFilters.query,
      categoryId: activeFilters.categoryId || undefined,
      status: activeFilters.status[0] as any || undefined,
      authorId: activeFilters.authorId || undefined,
    },
    {
      enabled: false, // Don't auto-fetch
    }
  );

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      // Execute the search query
      await searchQuery.refetch();
      
      // Call the onSearch callback with filters
      onSearch(activeFilters);
      
      toast({
        title: "Search Complete",
        description: `Found ${searchQuery.data?.posts.length || 0} posts matching your criteria`,
      });
      
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Search Error",
        description: "Failed to search posts",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleReset = () => {
    setActiveFilters({
      query: '',
      status: [],
      categoryId: '',
      authorId: '',
      tagIds: [],
      dateFrom: undefined,
      dateTo: undefined,
      hasFeaturedImage: undefined,
      contentLength: undefined,
    });
  };

  const handleStatusChange = (status: string, checked: boolean) => {
    setActiveFilters(prev => ({
      ...prev,
      status: checked 
        ? [...prev.status, status]
        : prev.status.filter(s => s !== status)
    }));
  };

  const handleTagChange = (tagId: string, checked: boolean) => {
    setActiveFilters(prev => ({
      ...prev,
      tagIds: checked 
        ? [...prev.tagIds, tagId]
        : prev.tagIds.filter(id => id !== tagId)
    }));
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (activeFilters.query) count++;
    if (activeFilters.status.length > 0) count++;
    if (activeFilters.categoryId) count++;
    if (activeFilters.authorId) count++;
    if (activeFilters.tagIds.length > 0) count++;
    if (activeFilters.dateFrom) count++;
    if (activeFilters.dateTo) count++;
    if (activeFilters.hasFeaturedImage !== undefined) count++;
    if (activeFilters.contentLength) count++;
    return count;
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
      <SlidersHorizontal className="h-4 w-4" />
      {showLabel && <span>Advanced Search</span>}
      {getActiveFilterCount() > 0 && (
        <Badge variant="secondary" className="ml-1">
          {getActiveFilterCount()}
        </Badge>
      )}
    </Button>
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {trigger || defaultTrigger}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Advanced Search
            </DialogTitle>
            <DialogDescription>
              Search posts with multiple filters and criteria
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Search */}
            <div className="space-y-2">
              <Label htmlFor="query">Search Query</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="query"
                  placeholder="Search in title, content, excerpt..."
                  value={activeFilters.query}
                  onChange={(e) => setActiveFilters(prev => ({ ...prev, query: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            <Separator />

            {/* Status Filter */}
            <div className="space-y-3">
              <Label>Status</Label>
              <div className="flex flex-wrap gap-3">
                {statusOptions.map((status) => (
                  <div key={status.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${status.value}`}
                      checked={activeFilters.status.includes(status.value)}
                      onCheckedChange={(checked) => 
                        handleStatusChange(status.value, checked as boolean)
                      }
                    />
                    <Label htmlFor={`status-${status.value}`} className="text-sm">
                      {status.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Category Filter */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={activeFilters.categoryId} 
                onValueChange={(value) => setActiveFilters(prev => ({ ...prev, categoryId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Author Filter */}
            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Select 
                value={activeFilters.authorId} 
                onValueChange={(value) => setActiveFilters(prev => ({ ...prev, authorId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select author" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Authors</SelectItem>
                  {authors.map((author) => (
                    <SelectItem key={author.id} value={author.id}>
                      {author.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tags Filter */}
            <div className="space-y-3">
              <Label>Tags</Label>
              <div className="max-h-32 overflow-y-auto border rounded-lg p-3">
                <div className="grid grid-cols-2 gap-2">
                  {tags.map((tag) => (
                    <div key={tag.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`tag-${tag.id}`}
                        checked={activeFilters.tagIds.includes(tag.id)}
                        onCheckedChange={(checked) => 
                          handleTagChange(tag.id, checked as boolean)
                        }
                      />
                      <Label htmlFor={`tag-${tag.id}`} className="text-sm">
                        {tag.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Separator />

            {/* Date Range Filter */}
            <div className="space-y-3">
              <Label>Date Range</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm">From</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {activeFilters.dateFrom ? (
                          format(activeFilters.dateFrom, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={activeFilters.dateFrom}
                        onSelect={(date) => 
                          setActiveFilters(prev => ({ ...prev, dateFrom: date }))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label className="text-sm">To</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {activeFilters.dateTo ? (
                          format(activeFilters.dateTo, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={activeFilters.dateTo}
                        onSelect={(date) => 
                          setActiveFilters(prev => ({ ...prev, dateTo: date }))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            <Separator />

            {/* Additional Filters */}
            <div className="space-y-3">
              <Label>Additional Filters</Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasFeaturedImage"
                    checked={activeFilters.hasFeaturedImage === true}
                    onCheckedChange={(checked) => 
                      setActiveFilters(prev => ({ 
                        ...prev, 
                        hasFeaturedImage: checked === true ? true : undefined 
                      }))
                    }
                  />
                  <Label htmlFor="hasFeaturedImage" className="text-sm">
                    Has featured image
                  </Label>
                </div>
                
                <div>
                  <Label className="text-sm">Content Length</Label>
                  <Select 
                    value={activeFilters.contentLength || ''} 
                    onValueChange={(value) => 
                      setActiveFilters(prev => ({ 
                        ...prev, 
                        contentLength: value as any || undefined 
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any length" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any length</SelectItem>
                      {contentLengthOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Active Filters Summary */}
            {getActiveFilterCount() > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Active Filters ({getActiveFilterCount()})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {activeFilters.query && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        Query: {activeFilters.query.substring(0, 20)}...
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => setActiveFilters(prev => ({ ...prev, query: '' }))}
                        />
                      </Badge>
                    )}
                    {activeFilters.status.map((status) => (
                      <Badge key={status} variant="secondary" className="flex items-center gap-1">
                        {status}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => handleStatusChange(status, false)}
                        />
                      </Badge>
                    ))}
                    {activeFilters.categoryId && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        Category: {categories.find(c => c.id === activeFilters.categoryId)?.name}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => setActiveFilters(prev => ({ ...prev, categoryId: '' }))}
                        />
                      </Badge>
                    )}
                    {activeFilters.authorId && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        Author: {authors.find(a => a.id === activeFilters.authorId)?.name}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => setActiveFilters(prev => ({ ...prev, authorId: '' }))}
                        />
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex justify-between">
              <Button variant="outline" onClick={handleReset}>
                Reset Filters
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSearch} disabled={isSearching}>
                  {isSearching ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Quick search component for inline use
export function PostQuickSearch({
  onSearch,
  disabled = false,
}: {
  onSearch: (query: string) => void;
  disabled?: boolean;
}) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    try {
      onSearch(query.trim());
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="relative w-full max-w-sm">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        placeholder="Search posts..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={disabled}
        className="pl-10 pr-10"
      />
      {isSearching ? (
        <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
      ) : (
        query && (
          <X 
            className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 cursor-pointer" 
            onClick={() => setQuery('')}
          />
        )
      )}
    </div>
  );
}
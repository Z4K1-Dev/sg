'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CalendarIcon, Filter, SortAsc, SortDesc } from 'lucide-react';
import { useState } from 'react';

interface FilterOption {
  id: string;
  label: string;
  type: 'select' | 'text' | 'date';
  options?: { value: string; label: string }[];
}

interface SortOption {
  id: string;
  label: string;
}

interface FilterSortControlsProps {
  filterOptions?: FilterOption[];
  sortOptions?: SortOption[];
  onFilterChange?: (filters: Record<string, string>) => void;
  onSortChange?: (sort: { field: string; direction: 'asc' | 'desc' }) => void;
  onSearchChange?: (search: string) => void;
}

export function FilterSortControls({ 
  filterOptions = [], 
  sortOptions = [],
  onFilterChange,
  onSortChange,
  onSearchChange
}: FilterSortControlsProps) {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sort, setSort] = useState<{ field: string; direction: 'asc' | 'desc' }>({ 
    field: '', 
    direction: 'asc' 
  });
  const [search, setSearch] = useState('');

  const handleFilterChange = (filterId: string, value: string) => {
    const newFilters = { ...filters, [filterId]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleSortChange = (field: string) => {
    const newDirection: 'asc' | 'desc' = sort.field === field && sort.direction === 'asc' ? 'desc' : 'asc';
    const newSort = { field, direction: newDirection };
    setSort(newSort);
    onSortChange?.(newSort);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onSearchChange?.(value);
  };

  return (
    <div className="flex flex-wrap items-center gap-4 mb-6">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[200px]">
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9"
        />
        <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      </div>

      {/* Filter Controls */}
      {filterOptions.map((filter) => (
        <div key={filter.id} className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">{filter.label}</label>
          {filter.type === 'select' ? (
            <Select 
              value={filters[filter.id] || ''} 
              onValueChange={(value) => handleFilterChange(filter.id, value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={`Select ${filter.label}`} />
              </SelectTrigger>
              <SelectContent>
                {filter.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : filter.type === 'date' ? (
            <div className="relative">
              <Input 
                type="date" 
                value={filters[filter.id] || ''} 
                onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                className="pl-9 w-[180px]"
              />
              <CalendarIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          ) : (
            <Input
              placeholder={`Enter ${filter.label}`}
              value={filters[filter.id] || ''}
              onChange={(e) => handleFilterChange(filter.id, e.target.value)}
              className="w-[180px]"
            />
          )}
        </div>
      ))}

      {/* Sort Controls */}
      {sortOptions.length > 0 && (
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">Sort by</label>
          <Select 
            value={sort.field} 
            onValueChange={(value) => handleSortChange(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSortChange(sort.field)}
            disabled={!sort.field}
          >
            {sort.direction === 'asc' ? (
              <SortAsc className="h-4 w-4" />
            ) : (
              <SortDesc className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
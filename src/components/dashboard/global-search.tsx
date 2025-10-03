'use client';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface SearchItem {
  id: string;
  title: string;
  description?: string;
  type: 'post' | 'page' | 'user' | 'report' | 'category' | 'tag';
  url: string;
}

interface GlobalSearchProps {
  searchItems?: SearchItem[];
}

export function GlobalSearch({ searchItems = [] }: GlobalSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState<SearchItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter items based on query
  useEffect(() => {
    if (!query.trim()) {
      setFilteredItems(searchItems);
      return;
    }

    const results = searchItems.filter(item =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(query.toLowerCase()))
    );
    setFilteredItems(results);
  }, [query, searchItems]);

  // Handle keyboard shortcut (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelect = (url: string) => {
    window.location.href = url;
    setOpen(false);
    setQuery('');
  };

  return (
    <>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          placeholder="Search... (Ctrl+K)"
          className="pl-9 pr-9 rounded-full"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hidden md:block">
          Ctrl+K
        </span>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
          <div 
            className="fixed inset-0 bg-black/50" 
            onClick={() => setOpen(false)}
          />
          <Command className="relative z-50 w-full max-w-2xl overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-md">
            <CommandInput
              placeholder="Type a command or search..."
              value={query}
              onValueChange={setQuery}
              autoFocus
            />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Results">
                {filteredItems.map((item) => (
                  <CommandItem
                    key={item.id}
                    onSelect={() => handleSelect(item.url)}
                  >
                    <div>
                      <div className="font-medium">{item.title}</div>
                      {item.description && (
                        <div className="text-sm text-muted-foreground">
                          {item.description}
                        </div>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      )}
    </>
  );
}
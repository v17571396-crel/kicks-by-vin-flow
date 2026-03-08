import { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ProductFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sizeFilter: string;
  onSizeChange: (size: string) => void;
  conditionFilter: string;
  onConditionChange: (condition: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  availableSizes?: string[];
}

const ProductFilters = ({
  searchQuery, onSearchChange,
  sizeFilter, onSizeChange,
  conditionFilter, onConditionChange,
  sortBy, onSortChange,
  availableSizes = [],
}: ProductFiltersProps) => {
  const [showFilters, setShowFilters] = useState(false);

  // Sort sizes naturally (UK 6 before UK 10)
  const sortedSizes = [...availableSizes].sort((a, b) => {
    const numA = parseFloat(a.replace(/[^\d.]/g, ''));
    const numB = parseFloat(b.replace(/[^\d.]/g, ''));
    return numA - numB;
  });

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <Input
          placeholder="Search shoes..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-card border-border font-body"
        />
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors md:hidden"
        >
          <SlidersHorizontal size={18} />
        </button>
      </div>

      {/* Filters row */}
      <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 ${showFilters ? 'block' : 'hidden md:grid'}`}>
        <Select value={sizeFilter} onValueChange={onSizeChange}>
          <SelectTrigger className="bg-card font-body text-sm">
            <SelectValue placeholder="Size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sizes</SelectItem>
            {sortedSizes.map((size) => (
              <SelectItem key={size} value={size}>{size}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={conditionFilter} onValueChange={onConditionChange}>
          <SelectTrigger className="bg-card font-body text-sm">
            <SelectValue placeholder="Condition" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Conditions</SelectItem>
            <SelectItem value="Grade A">Grade A</SelectItem>
            <SelectItem value="Grade B">Grade B</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="bg-card font-body text-sm">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ProductFilters;

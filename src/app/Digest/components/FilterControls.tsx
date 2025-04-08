import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { daoConfig } from "@/lib/constants";
import { Filter, Search, X } from "lucide-react";
import { DigestFilters } from "../types";

export function FilterControls({ 
  filters, 
  setFilters, 
  clearFilters 
}: { 
  filters: DigestFilters, 
  setFilters: (filters: DigestFilters) => void,
  clearFilters: () => void
}) {
  // Get unique categories from the digest items
  const categories = ["Governance", "Protocol Update", "Treasury", "Partnership", "Development"];
  
  return (
    <div className="flex flex-col mb-6 space-y-4">
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
        {/* Search input remains the same */}
        <div className="flex-1 relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search updates..."
            value={filters.searchTerm}
            onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
            className="pl-8"
          />
          {filters.searchTerm && (
            <button 
              onClick={() => setFilters({ ...filters, searchTerm: '' })}
              className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        <div className="flex gap-2">
          <Select 
            value={filters.dao || undefined}
            onValueChange={(value) => setFilters({ ...filters, dao: value || null })}
          >
            <SelectTrigger className="min-w-[160px]">
              <SelectValue placeholder="Filter by DAO" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-daos">All DAOs</SelectItem>
              {Object.keys(daoConfig).map((daoId) => (
                <SelectItem key={daoId} value={daoId}>
                  {daoConfig[daoId].name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select 
            value={filters.category || undefined}
            onValueChange={(value) => setFilters({ ...filters, category: value || null })}
          >
            <SelectTrigger className="min-w-[180px]">
              <SelectValue placeholder="Filter by Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-categories">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {(filters.dao || filters.category || filters.searchTerm) && (
        <div className="flex items-center">
          <div className="flex flex-wrap gap-2">
            {filters.dao && filters.dao !== "all-daos" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                DAO: {daoConfig[filters.dao].name}
                <button 
                  onClick={() => setFilters({ ...filters, dao: null })}
                  className="ml-1 rounded-full hover:bg-muted-foreground/20"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            
            {filters.dao && filters.dao === "all-daos" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                DAO: All DAOs
                <button 
                  onClick={() => setFilters({ ...filters, dao: null })}
                  className="ml-1 rounded-full hover:bg-muted-foreground/20"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            
            {filters.category && filters.category !== "all-categories" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Category: {filters.category}
                <button 
                  onClick={() => setFilters({ ...filters, category: null })}
                  className="ml-1 rounded-full hover:bg-muted-foreground/20"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            
            {filters.category && filters.category === "all-categories" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Category: All Categories
                <button 
                  onClick={() => setFilters({ ...filters, category: null })}
                  className="ml-1 rounded-full hover:bg-muted-foreground/20"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            
            {filters.searchTerm && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Search: {filters.searchTerm}
                <button 
                  onClick={() => setFilters({ ...filters, searchTerm: '' })}
                  className="ml-1 rounded-full hover:bg-muted-foreground/20"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters}
            className="ml-auto text-xs"
          >
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  );
}
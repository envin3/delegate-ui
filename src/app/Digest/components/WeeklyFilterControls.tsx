import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { daoConfig } from "@/lib/constants";
import { CalendarIcon, Search, X } from "lucide-react";
import { WeeklyFilters } from "../types";

export function WeeklyFilterControls({ 
  filters, 
  setFilters, 
  clearFilters 
}: { 
  filters: WeeklyFilters, 
  setFilters: (filters: WeeklyFilters) => void,
  clearFilters: () => void
}) {
  const statuses = ["active", "passed", "failed"];
  
  // Format date for input (YYYY-MM-DD)
  const formatDateForInput = (dateString: string | null) => {
    if (!dateString) return "";
    return new Date(dateString).toISOString().split('T')[0];
  };
  
  return (
    <div className="flex flex-col mb-6 space-y-4">
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search proposals..."
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
        
        <div className="flex gap-2 flex-wrap">
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
            value={filters.status || undefined}
            onValueChange={(value) => setFilters({ ...filters, status: value || null })}
          >
            <SelectTrigger className="min-w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-statuses">All Statuses</SelectItem>
              {statuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="relative">
            <CalendarIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="date"
              placeholder="Date"
              value={formatDateForInput(filters.date)}
              onChange={(e) => setFilters({ ...filters, date: e.target.value || null })}
              className="pl-8 min-w-[140px]"
            />
            {filters.date && (
              <button 
                onClick={() => setFilters({ ...filters, date: null })}
                className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
      
      {(filters.dao || filters.status || filters.date || filters.searchTerm) && (
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
            
            {filters.status && filters.status !== "all-statuses" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Status: {filters.status.charAt(0).toUpperCase() + filters.status.slice(1)}
                <button 
                  onClick={() => setFilters({ ...filters, status: null })}
                  className="ml-1 rounded-full hover:bg-muted-foreground/20"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            
            {filters.date && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Date: {new Date(filters.date).toLocaleDateString()}
                <button 
                  onClick={() => setFilters({ ...filters, date: null })}
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
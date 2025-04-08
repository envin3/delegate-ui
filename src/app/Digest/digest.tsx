import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Filter } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { daoConfig } from "@/lib/constants";
import { DigestPeriod, DigestFilters, WeeklyFilters } from "./types";
import { useDigestData } from "./hooks/useDigestData";
import { useProposalSummary } from "./hooks/useProposalSummary";
import { DigestCard } from "./components/DigestCard";
import { WeeklyProposalCard } from "./components/WeeklyProposalCard";
import { DaoMonthlyCard } from "./components/DaoMonthlyCard";
import { FilterControls } from "./components/FilterControls";
import { WeeklyFilterControls } from "./components/WeeklyFilterControls";
import { GlobalFilterControls } from "./components/GlobalFilterControls";

export default function Digest() {
  const { tabType = "global" } = useParams<{ tabType: DigestPeriod }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Extract DAO filter from URL if present
  const daoFromURL = searchParams.get("dao");
  
  // Use the URL parameter to set the initial period
  const [period, setPeriod] = useState<DigestPeriod>(tabType as DigestPeriod);
  
  // Use custom hook to fetch data
  const { 
    digestItems, 
    weeklyProposals, 
    setWeeklyProposals, 
    daoSummaries, 
    isLoading 
  } = useDigestData(period);

  // Use custom hook for proposal summaries
  const { generateProposalSummary } = useProposalSummary(weeklyProposals, setWeeklyProposals);
  
  // Daily filters
  const [filters, setFilters] = useState<DigestFilters>({
    dao: null,
    category: null,
    searchTerm: ""
  });
  
  // Weekly filters (includes date and status)
  const [weeklyFilters, setWeeklyFilters] = useState<WeeklyFilters>({
    dao: null,
    category: null,
    searchTerm: "",
    date: null,
    status: null
  });
  
  // Global filter for DAOs - initialized from URL param if available
  const [selectedGlobalDao, setSelectedGlobalDao] = useState<string | null>(daoFromURL);

  // Update URL when global DAO filter changes
  useEffect(() => {
    // Skip during initial loading
    if (isLoading) return;
    
    // Only update URL when on global tab
    if (period === "global") {
      // Create new search params
      const newParams = new URLSearchParams();
      
      // Add dao param if a DAO is selected
      if (selectedGlobalDao) {
        newParams.set("dao", selectedGlobalDao);
      }
      
      // Update URL without navigation
      setSearchParams(newParams, { replace: true });
    }
  }, [selectedGlobalDao, period, isLoading]);
  
  // Initialize filters from URL when component loads or tab changes
  useEffect(() => {
    if (period === "global" && daoFromURL) {
      setSelectedGlobalDao(daoFromURL);
    }
  }, [period, daoFromURL]);

  // Function to clear all daily filters
  const clearFilters = () => {
    setFilters({
      dao: null,
      category: null,
      searchTerm: ""
    });
  };
  
  // Function to clear all weekly filters
  const clearWeeklyFilters = () => {
    setWeeklyFilters({
      dao: null,
      category: null,
      searchTerm: "",
      date: null,
      status: null
    });
  };
  
  // Function to clear global filters
  const clearGlobalFilters = () => {
    setSelectedGlobalDao(null);
    
    // Also update URL when clearing filters
    if (period === "global") {
      setSearchParams({}, { replace: true });
    }
  };

  // Apply filters to digest items (daily)
  const filteredDigestItems = digestItems.filter(item => {
    // Filter by search term
    if (filters.searchTerm && !item.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) &&
        !item.description.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
      return false;
    }
    
    // Filter by DAO - make sure to check for the special "all-daos" value
    if (filters.dao && filters.dao !== "all-daos" && 
        !item.source.toLowerCase().includes(daoConfig[filters.dao].name.toLowerCase())) {
      return false;
    }
    
    // Filter by category - make sure to check for the special "all-categories" value
    if (filters.category && filters.category !== "all-categories" && 
        item.category !== filters.category) {
      return false;
    }
    
    return true;
  });
  
  // Apply filters to weekly proposals
  const filteredWeeklyProposals = weeklyProposals.filter(proposal => {
    // Filter by search term
    if (weeklyFilters.searchTerm && 
        !proposal.title.toLowerCase().includes(weeklyFilters.searchTerm.toLowerCase())) {
      return false;
    }
    
    // Filter by DAO
    if (weeklyFilters.dao && weeklyFilters.dao !== "all-daos" && 
        proposal.daoId !== weeklyFilters.dao) {
      return false;
    }
    
    // Filter by status
    if (weeklyFilters.status && weeklyFilters.status !== "all-statuses") {
      if (weeklyFilters.status === "active" && proposal.state !== "active") {
        return false;
      }
      if (weeklyFilters.status === "passed" && proposal.result !== "Passed") {
        return false;
      }
      if (weeklyFilters.status === "failed" && proposal.result !== "Failed") {
        return false;
      }
    }
    
    // Filter by date
    if (weeklyFilters.date) {
      const filterDate = new Date(weeklyFilters.date);
      const proposalDate = new Date(proposal.date);
      
      // Compare year, month, and day only
      if (filterDate.getFullYear() !== proposalDate.getFullYear() ||
          filterDate.getMonth() !== proposalDate.getMonth() ||
          filterDate.getDate() !== proposalDate.getDate()) {
        return false;
      }
    }
    
    return true;
  });
  
  // Filter global DAO summaries
  const filteredDaoSummaries = selectedGlobalDao 
    ? daoSummaries.filter(dao => dao.daoId === selectedGlobalDao)
    : daoSummaries;

  // Render loading skeletons for daily digest
  const renderSkeletons = () => (
    <>
      {[1, 2, 3].map((i) => (
        <div key={i} className="mb-4">
          <Skeleton className="h-48 w-full rounded-lg" />
        </div>
      ))}
    </>
  );
  
  // Render loading skeletons for monthly digest
  const renderDaoSummarySkeletons = () => (
    <>
      {Object.keys(daoConfig)
        .filter(daoId => !selectedGlobalDao || daoId === selectedGlobalDao)
        .map((daoId) => (
          <div key={daoId} className="mb-6">
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        ))
      }
    </>
  );

  // Render loading skeletons for weekly digest
  const renderWeeklySkeletons = () => (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="mb-3">
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
      ))}
    </>
  );

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    const newPeriod = value as DigestPeriod;
    setPeriod(newPeriod);
    
    // Construct the query parameters based on the active tab
    const params = new URLSearchParams();
    
    // Add the appropriate filter parameters based on tab
    if (newPeriod === "global" && selectedGlobalDao) {
      params.set("dao", selectedGlobalDao);
    }
    // We could add params for other tabs here too
    
    // Generate the URL with query string if needed
    const queryString = params.toString() ? `?${params.toString()}` : '';
    navigate(`/digest/${newPeriod}${queryString}`);
  };
  
  // Handle DAO selection with URL update
  const handleGlobalDaoSelect = (dao: string | null) => {
    setSelectedGlobalDao(dao);
    
    // No need to update URL here - the useEffect will handle it
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Tabs defaultValue={period} onValueChange={handleTabChange} className="mb-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="updates">Updates</TabsTrigger>
          <TabsTrigger value="proposals">Proposals</TabsTrigger>
          <TabsTrigger value="global">Global</TabsTrigger>
        </TabsList>
        
        {/* Daily Tab */}
        <TabsContent value="updates" className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center">
              <CalendarIcon className="mr-2 h-5 w-5" />
              Today's Updates
            </h2>
          </div>
          
          {/* Add filter controls */}
          {!isLoading && (
            <FilterControls 
              filters={filters} 
              setFilters={setFilters} 
              clearFilters={clearFilters} 
            />
          )}
          
          {isLoading ? renderSkeletons() : (
            <>
              {filteredDigestItems.length > 0 ? (
                <div className="space-y-4">
                  {filteredDigestItems.map((item) => (
                    <DigestCard key={item.id} item={item} period={period} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border rounded-md">
                  <Filter className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-lg font-medium mb-1">No results found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your filters or search term
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={clearFilters} 
                    className="mt-4"
                  >
                    Clear filters
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>
        
        {/* Weekly Tab */}
        <TabsContent value="proposals" className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center">
              <CalendarIcon className="mr-2 h-5 w-5" />
              DAO Proposals
            </h2>
          </div>
          
          {!isLoading && (
            <WeeklyFilterControls 
              filters={weeklyFilters} 
              setFilters={setWeeklyFilters} 
              clearFilters={clearWeeklyFilters} 
            />
          )}
          
          {isLoading ? renderWeeklySkeletons() : (
            <>
              {filteredWeeklyProposals.length > 0 ? (
                <div className="space-y-3">
                  {filteredWeeklyProposals.map((proposal) => (
                    <WeeklyProposalCard 
                      key={proposal.id} 
                      proposal={proposal} 
                      generateSummary={generateProposalSummary}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border rounded-md">
                  <Filter className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-lg font-medium mb-1">No proposals found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your filters or check back later
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={clearWeeklyFilters} 
                    className="mt-4"
                  >
                    Clear filters
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>
        
        {/* Global Tab */}
        <TabsContent value="global" className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center">
              <CalendarIcon className="mr-2 h-5 w-5" />
              Last Month Overview
            </h2>
          </div>
          
          {!isLoading && (
            <div className="flex justify-between items-center">
              <GlobalFilterControls
                selectedDao={selectedGlobalDao}
                setSelectedDao={handleGlobalDaoSelect}
              />
              
              {selectedGlobalDao && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={clearGlobalFilters}
                >
                  Show All DAOs
                </Button>
              )}
            </div>
          )}
          
          {isLoading ? renderDaoSummarySkeletons() : (
            <>
              {filteredDaoSummaries.length > 0 ? (
                <div className="space-y-6">
                  {filteredDaoSummaries.map((dao) => (
                    <DaoMonthlyCard key={dao.daoId} dao={dao} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border rounded-md">
                  <Filter className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-lg font-medium mb-1">No DAO summaries found</h3>
                  <p className="text-muted-foreground">
                    There may be an issue loading the data. Please try again later.
                  </p>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, NavLink } from "react-router";
import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, ExternalLink, Mountain, FileSymlink, Star, Cpu } from "lucide-react";
import { useSubscriptions } from '@/contexts/subscriptions';
import { daoConfig, DaoConfigItem, MONTHLY_REPORT_DIRECTIVE, PROPOSALS_QUERY, SPACE_QUERY } from "@/lib/constants";
import { toast } from "sonner";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { DrawerDialog } from "../Suggest/Suggest";
import { formatNumber } from "@/lib/utils";
import { useAccount } from "wagmi";
import { Skeleton } from "@/components/ui/skeleton"
import { useDaoInfo, useGraphQL } from "@/hooks/use-dao";
import { useAI } from "@/hooks/use-ai";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { filterProposalsByAge } from "@/lib/dao-utils";
import { Delegate } from "../Delegate/Delegate";
import Markdown from "react-markdown";
import { useAgents } from "@/contexts/AgentContext";

function DaoDashboard() {
  const { identifier } = useParams<{ identifier: string }>();
  const navigate = useNavigate();
  
  // Find the dao by identifier
  const daoEntry = Object.entries(daoConfig).find(([_, dao]) => dao.identifier === identifier);
  const dao = daoEntry ? daoEntry[1] : undefined;
  
  // Redirect to home if DAO not found
  useEffect(() => {
    if (!dao && identifier) {
      toast.error("DAO not found");
      navigate("/");
    }
  }, [dao, identifier, navigate]);
  
  // Don't render if DAO not found
  if (!dao) {
    return null;
  }
  
  return <DashboardContent dao={dao} />;
}

function DashboardContent({ dao }: { dao: DaoConfigItem }) {
  const { hasAgent } = useAgents();
  const { 
    isSubscribed,
    addSubscription,
    removeSubscription
  } = useSubscriptions();
  const subscribed = isSubscribed(dao);
  const account = useAccount();
  const [insightExpanded, setInsightExpanded] = useState(false);
  const [expandSummary, setExpandSummary] = useState(false);
  
  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const proposalsPerPage = 10;

  const { 
    data: daoData,
    isLoading: isDaoDataLoading,
    error: daoDataError 
  } = useDaoInfo(dao.source, dao.identifier);
  const { 
    data: spaceResult,
    isLoading: isSpaceLoading,
    error: spaceError 
  } = useGraphQL(SPACE_QUERY, { id: dao.identifier });
  const { 
    data: proposalsResult,
    isLoading: isProposalsLoading,
    error: proposalsError 
  } = useGraphQL(PROPOSALS_QUERY, { 
    space: dao.identifier,
    limit: spaceResult?.space?.proposalsCount,
  });

  // Extract data from query results
  const spaceData = spaceResult?.space;
  const proposals = proposalsResult?.proposals || [];
  
  // Combine loading and error states
  const isLoading = isSpaceLoading || isProposalsLoading || isDaoDataLoading;
  const error = spaceError || proposalsError || daoDataError;

  // Process the most recent proposals for the AI summary
  const latestProposals = useMemo(() => {
    return !isLoading && !error && proposals.length > 0
      ? filterProposalsByAge(proposals, 30)
      : [];
  }, [proposals, isLoading, error]);
  
  // Create the prompt for the AI summary
  const prompt = useMemo(() => {
    if (latestProposals.length === 0) return '';
    
    // Create a concatenated string of all latest proposal titles and short body excerpts
    const proposalSummaries = latestProposals
      .map(p => `BEGIN "${p.title}" - ${p.body} END`)
      .join('\n');
    
    return `Recent proposals: ${proposalSummaries}`;
  }, [latestProposals, dao, spaceData]);

  // Use the AI hook to generate the summary
  const { 
    data: daoSummary, 
    isLoading: loadingSummary, 
    error: summaryError 
  } = useAI(MONTHLY_REPORT_DIRECTIVE, prompt, dao.name, {
    // Only enable when we have a prompt and context
    enabled: prompt !== '',
    // Use a longer stale time for summaries (30 min)
    staleTime: 30 * 60 * 1000
  });

  const handleSubscription = () => {
    if (subscribed) {
      removeSubscription(dao);
      toast("Removed from Watchlist", {
        description: `You've removed ${dao.name} to the watchlist`,
      });
    } else {
      addSubscription(dao);
      toast("Added to Watchlist", {
        description: `You've added ${dao.name} to the watchlist`,
      });
    }
  };

  // Process all proposals into table data
  const proposalTableData = proposals.map(proposal => ({
    id: proposal.id,
    title: proposal.title,
    body: proposal.body,
    state: proposal.state,
    start: new Date(proposal.start * 1000).toLocaleDateString(),
    end: new Date(proposal.end * 1000).toLocaleDateString(),
    votes: proposal.votes,
    score: proposal.scores_total.toFixed(2)
  }));
  
  // Add pagination logic
  const totalPages = Math.max(1, Math.ceil(proposalTableData.length / proposalsPerPage));
  
  // Ensure current page is within bounds if data changes
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [proposalTableData.length, totalPages, currentPage]);
  
  // Get current page proposals
  const indexOfLastProposal = currentPage * proposalsPerPage;
  const indexOfFirstProposal = indexOfLastProposal - proposalsPerPage;
  const currentProposals = proposalTableData.slice(indexOfFirstProposal, indexOfLastProposal);
  
  // Handle page changes
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // Scroll to top of table
    document.querySelector('.overflow-x-auto')?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Generate array of page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5; // Show at most 5 page numbers
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if there are 5 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always include page 1
      pageNumbers.push(1);
      
      // Calculate start and end of page numbers to show
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust if at the start or end
      if (currentPage <= 2) {
        endPage = 3;
      } else if (currentPage >= totalPages - 1) {
        startPage = totalPages - 2;
      }
      
      // Add ellipsis after page 1 if needed
      if (startPage > 2) {
        pageNumbers.push('ellipsis');
      }
      
      // Add the range of page numbers
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      // Add ellipsis before the last page if needed
      if (endPage < totalPages - 1) {
        pageNumbers.push('ellipsis');
      }
      
      // Always include the last page
      if (totalPages > 1) {
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };
  
  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        {/* Header Card */}
        <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6">
          <Card className="@container/card">
            <CardHeader>
              <CardDescription>
                {dao.source === 'snapshot' ? 'Snapshot' : dao.source}
              </CardDescription>
              <CardAction>
                {account.isConnected ? (
                  <div className="flex items-center gap-2">
                    <Button
                    variant="outline" 
                    onClick={handleSubscription}
                    title={subscribed ? "Unsubscribe" : "Subscribe"}
                    className="flex items-center gap-2"
                    >
                    {subscribed ? (
                      <>
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        {/* Unsubscribe */}
                      </>
                    ) : (
                      <>
                      <Star className="h-4 w-4" />
                      {/* Subscribe */}
                      </>
                    )}
                    </Button>
                    <Delegate dao={dao} />
                  </div>
                ) : (
                  <ConnectButton.Custom>
                    {({
                      openConnectModal
                    }) => {
                      return (
                        <Button 
                          variant="outline"
                          onClick={openConnectModal}
                          className="flex items-center gap-2"
                        >
                          <Star className="h-4 w-4" />
                          {/* Subscribe */}
                        </Button>
                      );
                    }}
                  </ConnectButton.Custom>
                )}
              </CardAction>
              <CardTitle className="flex text-xl font-semibold tabular-nums @[250px]/card:text-2xl ">
                <div className="flex size-16 items-center justify-center mr-4">
                  <img src={dao.logo} className="shrink-0" alt={`${dao.name} logo`} />
                </div>
                <div className="grid flex-1 text-left text-xl lg:text-2xl xl:text-3xl leading-tight">
                  <span className="truncate font-bold">{dao.name}</span>
                  <div className="flex gap-2">
                    <Badge variant="outline">
                      <ExternalLink className="h-4 w-4" />
                        <a 
                          href={`https://snapshot.org/#/${dao.identifier}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="ml-1"
                        >
                          {dao.identifier}
                        </a>
                    </Badge>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-3 text-sm">
            {isLoading ? (
                <div>Loading data...</div>
              ) : error ? (
                <div className="text-red-500">{error}</div>
              ) : (
                <div className="w-full flex flex-col md:flex-row gap-6">
                  {/* Left column - Stats */}
                  <div className="md:w-1/4 space-y-1.5">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                      Followers
                      <Badge variant="outline">
                        {spaceData?.followersCount ? formatNumber(spaceData.followersCount) : formatNumber(dao.totalMembers || 0)}
                      </Badge>
                    </div>
                    <div className="line-clamp-1 flex gap-2 font-medium">
                      Proposals
                      <Badge variant="outline">
                        {spaceData?.proposalsCount || dao.proposals || "0"}
                      </Badge>
                    </div>
                    <div className="line-clamp-1 flex gap-2 font-medium">
                      Votes
                      <Badge variant="outline">
                        {spaceData?.votesCount ? formatNumber(spaceData.votesCount) : `${dao.votes || 0}m`}
                      </Badge>
                    </div>
                    {/* {spaceData?.network && (
                      <div className="line-clamp-1 flex gap-2 font-medium">
                        Network
                        <Badge variant="outline">
                          {spaceData.network}
                        </Badge>
                      </div>
                    )} */}
                  </div>
                  
                  {/* Right column - DAO About section */}
                  {spaceData?.about && (
                    <div className="md:w-3/4">
                      <Card className="border shadow-sm gap-0 pt-4 pb-3 bg-muted/5">
                      <CardHeader className="pb-0">
                        <CardTitle className="text-sm flex items-center">
                        About
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {spaceData.about}
                      </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              )}
            </CardFooter>
          </Card>
        </div>

        {/* Monthly Digest Card */}
        {hasAgent(dao) && (
          <div className="px-4 lg:px-6">
            <Card className="border shadow-sm gap-0 pt-4 pb-3 bg-muted/5">
              <CardHeader className="pb-0">
                <CardTitle className="text-sm flex items-center">
                  <span className="bg-primary/10 p-1 rounded-md mr-2 flex items-center justify-center">
                    <Cpu className="h-4 w-4 text-primary" />
                  </span>
                  Your Voting Agent Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <NavLink to="/account">
                  <Button 
                    variant="outline" 
                    className="w-full"
                  >
                    Configure Ethos
                  </Button>
                </NavLink>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Monthly Digest Card */}
        <div className="px-4 lg:px-6 text-sm">
            <Card onClick={() => !expandSummary ? setExpandSummary(true) : null}>
              <CardHeader>
                <CardTitle className="text-sm flex items-center">
                  <span className="bg-primary/10 p-1 rounded-md mr-2 flex items-center justify-center">
                    <Mountain className="h-4 w-4 text-primary" />
                  </span>
                  Monthly Digest
                </CardTitle>
                <CardAction >
                  {daoSummary && daoSummary.length > 100 && (
                    <Button 
                      variant="link" 
                      size="sm" 
                      onClick={() => setExpandSummary(!expandSummary)} 
                      className="text-xs h-6 px-2 flex items-center gap-1 text-muted-foreground"
                    >
                      {expandSummary ? "Show less" : "Show more"}
                    </Button>
                  )}
                </CardAction>
              </CardHeader>
              {!loadingSummary && daoSummary ? (
                <CardContent>
                  <div className="relative px-4">
                    <div className={expandSummary ? "" : "max-h-[125px] overflow-hidden"}>
                      <Markdown>{daoSummary}</Markdown>
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        className="text-xs h-6 mt-4 px-2 flex items-center gap-1"
                        asChild
                      >
                        <a href={`/#/digest/monthly?dao=${dao.name.toLowerCase()}`}>
                          <FileSymlink className="h-3 w-3" />
                          Full Digest
                        </a>
                      </Button>
                    </div>
                    {!expandSummary && daoSummary.length > 100 && (
                      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none" />
                    )}
                  </div>
                </CardContent>
              ) : loadingSummary ? (
                <div className="flex items-center justify-center py-8">
                <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                </div>
              ) : null
            }
            </Card>
        </div>
        
        {/* Proposals Table with Pagination */}
        <div className="px-4 lg:px-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between">
                <span>Recent Proposals</span>
                {!isLoading && !error && proposalTableData.length > 0 && (
                  <Badge variant="outline">
                    {proposalTableData.length} proposals total
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                <div>Loading proposals...</div>
                ) : error ? (
                <div className="text-red-500">{error}</div>
                ) : proposalTableData.length === 0 ? (
                <div>No proposals found</div>
                ) : (
                <div className="overflow-x-auto text-sm">
                  <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                    <th className="p-2 text-left">Title</th>
                    <th className="p-2 text-left">State</th>
                    <th className="p-2 text-left">Start</th>
                    <th className="p-2 text-left">End</th>
                    <th className="p-2 text-left">Votes</th>
                    {/* Only show Actions column if account is connected */}
                    {account.address ? (
                      <th className="p-2 text-left">Actions</th>
                    ) : null}
                    </tr>
                  </thead>
                  <tbody>
                    {currentProposals.map((proposal) => (
                    <tr key={proposal.id} className="border-b hover:bg-muted/50">
                        <td className="p-2">
                        {proposal.state.toLowerCase() === 'active' ? (
                          <span className="font-bold">{proposal.title}</span>
                        ) : (
                          proposal.title
                        )}
                        </td>
                      <td className="p-2">
                      <Badge variant={getStateVariant(proposal.state)} className="text-sm">
                        {proposal.state}
                      </Badge>
                      </td>
                      <td className="p-2">
                        <Badge variant="outline">
                          {proposal.start}
                        </Badge></td>
                      <td className="p-2">
                        <Badge variant="outline">
                          {proposal.end}
                        </Badge>
                      </td>
                      <td className="p-2">{proposal.votes}</td>
                      {/* Only show Actions column if account is connected */}
                      {account.address ? (
                        <td className="p-2">
                          <DrawerDialog proposal={proposal}/>
                        </td>
                      ): null}
                    </tr>
                    ))}
                  </tbody>
                  </table>
                  
                  {/* Shadcn Pagination Component */}
                  {proposalTableData.length > proposalsPerPage && (
                    <div className="mt-4">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious 
                              onClick={() => handlePageChange(currentPage - 1)}
                              className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} 
                            />
                          </PaginationItem>
                          
                          {getPageNumbers().map((page, index) => (
                            page === 'ellipsis' ? (
                              <PaginationItem key={`ellipsis-${index}`}>
                                <PaginationEllipsis />
                              </PaginationItem>
                            ) : (
                              <PaginationItem key={`page-${page}`}>
                                <PaginationLink 
                                  isActive={page === currentPage}
                                  onClick={() => handlePageChange(page as number)}
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            )
                          ))}
                          
                          <PaginationItem>
                            <PaginationNext 
                              onClick={() => handlePageChange(currentPage + 1)}
                              className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                      
                      {/* <div className="text-center text-xs text-muted-foreground mt-2">
                        Showing {indexOfFirstProposal + 1} to {Math.min(indexOfLastProposal, proposalTableData.length)} of {proposalTableData.length} proposals
                      </div> */}
                    </div>
                  )}
                </div>
                )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Helper function to determine badge variant based on proposal state
function getStateVariant(state: string): "default" | "secondary" | "destructive" | "outline" {
  switch (state.toLowerCase()) {
    case "active":
      return "default";
    case "closed":
      return "secondary";
    case "pending":
      return "outline";
    case "rejected":
      return "destructive";
    default:
      return "outline";
  }
}

export default DaoDashboard;
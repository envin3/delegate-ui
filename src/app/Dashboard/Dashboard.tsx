import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { SectionCards } from "@/components/section-cards";
import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, Globe, Twitter, ExternalLink, CreditCard, Mountain, FileSymlink } from "lucide-react";
import { useSubscriptions } from '@/contexts/subscriptions';
import { daoConfig, DaoConfigItem, PROPOSALS_QUERY, SPACE_QUERY } from "@/lib/constants";
import { toast } from "sonner";
import { DataTable } from "@/components/data-table";
import { ConnectButton } from '@rainbow-me/rainbowkit';

import dataw from "./data.json"
import { fetchDaoInfo, fetchGraphQL } from "@/lib/dao-utils";
import { DrawerDialog } from "../Delegate/delegate";
import { formatNumber } from "@/lib/utils";
import { useAccount } from "wagmi";
import { parseQuery } from "@/lib/delegate-query";
import { Skeleton } from "@/components/ui/skeleton"

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
  const { 
    isSubscribed,
    addSubscription,
    removeSubscription
  } = useSubscriptions();
  const subscribed = isSubscribed(dao);
  const account = useAccount();
  const [daoProposals, setDaoProposals] = useState<Record<string, any> | null>(null);

  const [spaceData, setSpaceData] = useState<any>(null);
  const [proposals, setProposals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add these new state variables
  const [daoSummary, setDaoSummary] = useState<string>("");
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [insightExpanded, setInsightExpanded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch space data
        const spaceResult = await fetchGraphQL(SPACE_QUERY, { id: dao.identifier });
        setSpaceData(spaceResult.space);
        
        // Fetch proposals
        const proposalsResult = await fetchGraphQL(PROPOSALS_QUERY, { 
          space: dao.identifier,
          limit: 10 // Limit to 10 proposals
        });
        setProposals(proposalsResult.proposals);
      } catch (err) {
        console.error('Error fetching DAO data:', err);
        setError('Failed to load DAO data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [dao.identifier]);

  useEffect(() => {
    const loadData = async () => {        
      const data = await fetchDaoInfo(dao?.source, dao?.identifier);
      setDaoProposals(data);
    };
    
    loadData();
  }, []);

  // Add this useEffect to fetch the summary when proposals load
  useEffect(() => {
    const generateDaoSummary = async () => {
      if (!isLoading && !error && proposals.length > 0) {
        setLoadingSummary(true);
        try {
          // Get the latest proposal
          const latestProposal = proposals[0]; 
          
          // Format prompt for the DAO summary
          const prompt = `Based on the following information, provide a concise summary (max 3 sentences) of the current state for non technical people and focus of the ${dao.name} DAO:
          
          Latest proposal: "${latestProposal.title}"
          Proposal state: ${latestProposal.state}
          Total proposals: ${spaceData?.proposalsCount || dao.proposals || 0}
          Number of followers: ${spaceData?.followersCount || dao.totalMembers || 0}
          Total votes: ${spaceData?.votesCount || dao.votes || 0}`;
          
          // Use parseQuery to get AI-generated summary
          const response = await parseQuery(prompt, latestProposal.body);
          setDaoSummary(response);
        } catch (error) {
          console.error("Error generating DAO summary:", error);
          setDaoSummary("Unable to generate DAO summary at this time.");
        } finally {
          setLoadingSummary(false);
        }
      }
    };
    
    generateDaoSummary();
  }, [isLoading, error, proposals, dao, spaceData]);

  const handleSubscription = () => {
    if (subscribed) {
      removeSubscription(dao);
      toast("Unsubscribed", {
        description: `You've unsubscribed from ${dao.name}`,
      });
    } else {
      addSubscription(dao);
      toast("Subscribed", {
        description: `You've subscribed to ${dao.name}`,
      });
    }
  };

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
  
  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6">
          <Card className="@container/card">
            <CardHeader>
              <CardDescription>
                {dao.source === 'snapshot' ? 'Snapshot' : dao.source}
              </CardDescription>
              <CardAction>
                {account.isConnected ? (
                  <Button
                  variant="outline" 
                  onClick={handleSubscription}
                  title={subscribed ? "Unsubscribe" : "Subscribe"}
                  className="flex items-center gap-2"
                  >
                  {subscribed ? (
                    <>
                    <BellOff className="h-4 w-4" />
                    Unsubscribe
                    </>
                  ) : (
                    <>
                    <Bell className="h-4 w-4" />
                    Subscribe
                    </>
                  )}
                  </Button>
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
                          <Bell className="h-4 w-4" />
                          Subscribe
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
                    {spaceData?.network && (
                      <div className="line-clamp-1 flex gap-2 font-medium">
                        Network
                        <Badge variant="outline">
                          {spaceData.network}
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  {/* Right column - DAO Insight styled as a card */}
                  <div className="md:w-3/4">
                    <Card className="border shadow-sm gap-0 pt-4 pb-3 bg-muted/5">
                      <CardHeader className="pb-0">
                        <CardAction>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-xs h-6 px-2 flex items-center gap-1"
                            asChild
                          >
                            <a href={`/#/digest/global?dao=${dao.name.toLowerCase()}`} target="_blank" rel="noopener noreferrer">
                              <FileSymlink className="h-3 w-3" />
                              Full Digest
                            </a>
                          </Button>
                        </CardAction>
                        <CardTitle className="text-sm flex items-center">
                          <span className="bg-primary/10 p-1 rounded-md mr-2 flex items-center justify-center">
                            <Mountain className="h-4 w-4 text-primary" />
                          </span>
                          DAO Insight
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {loadingSummary ? (
                          <div className="flex items-center justify-center py-4">
                            <Skeleton className="w-[300px] h-[20px] rounded-full" />
                          </div>
                        ) : daoSummary ? (
                          <div className="relative">
                            {/* Content container with line clamp instead of max-height */}
                            <div className={insightExpanded ? "text-sm leading-relaxed" : "text-sm leading-relaxed line-clamp-1"}>
                              {daoSummary}
                            </div>
                            
                            {/* Gradient overlay when collapsed - positioned relative to text */}
                            {!insightExpanded && (
                              <div className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none" />
                            )}
                            
                            {/* Footer with Show more/less button - different layout based on expanded state */}
                            <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                              {/* Only show the attribution when expanded */}
                              {insightExpanded && (
                                <span>Based on {proposals.length} recent proposals</span>
                              )}
                              
                              {/* Push button to right when collapsed, or position in normal flow when expanded */}
                              <div className={insightExpanded ? "" : "ml-auto"}>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => setInsightExpanded(!insightExpanded)}
                                  className="text-xs h-6 px-2"
                                >
                                  {insightExpanded ? "Show less" : "Show more"}
                                </Button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-muted-foreground text-sm py-2">
                            No information available to generate insights.
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </CardFooter>
          </Card>
        </div>
        
        {/* Show space about information if available */}
        {/* {spaceData?.about && ( */}
          <div className="px-4 lg:px-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Digest</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                {/* <div dangerouslySetInnerHTML={{ __html: spaceData.about }} /> */}
              </CardContent>
            </Card>
          </div>
        {/* )} */}
        
        {/* Proposals Table */}
        <div className="px-4 lg:px-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Proposals</CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                <div>Loading proposals...</div>
                ) : error ? (
                <div className="text-red-500">{error}</div>
                ) : proposals.length === 0 ? (
                <div>No proposals found</div>
                ) : (
                <div className="overflow-x-auto">
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
                    {proposalTableData.map((proposal) => (
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
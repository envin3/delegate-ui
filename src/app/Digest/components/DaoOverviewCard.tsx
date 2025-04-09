import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRightIcon, Mountain } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { GLOBAL_REPORT_DIRECTIVE, PROPOSALS_QUERY, SPACE_QUERY } from "@/lib/constants";
import { useGraphQL } from "@/hooks/use-dao";
import { useAI } from "@/hooks/use-ai";
import { filterProposalsByAge } from "@/lib/dao-utils";

export function DaoOverviewCard({ dao  }: { dao: any }) {
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
  const spaceData = spaceResult?.space;
  const proposals = proposalsResult?.proposals || [];

  const isLoading = isSpaceLoading || isProposalsLoading;
  const error = spaceError || proposalsError;

  // Process the most recent proposals for the AI summary
  const latestProposals = useMemo(() => {
    return !isLoading && !error && proposals.length > 0
      ? filterProposalsByAge(proposals, 30)
      : [];
  }, [proposals, isLoading, error]);

  const prompt = useMemo(() => {
    if (proposals.length === 0) return '';
    
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
  } = useAI(GLOBAL_REPORT_DIRECTIVE, prompt, dao.name, {
    // Only enable when we have a prompt and context
    enabled: prompt !== ''    
  });

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center">
          <Avatar className="h-12 w-12 mr-3">
            <AvatarImage src={dao.logo} alt={dao.name} />
            <AvatarFallback>{dao.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-xl">{dao.name}</CardTitle>
            <CardDescription>Overview</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-0">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        ) : (
          <>
            <div className="bg-muted/20 p-4 pb-0 rounded-md mb-4">
              <div className="flex items-start gap-2 mb-2">
                <Mountain className="h-5 w-5 text-primary mt-0.5" />
                <p className="text-sm leading-relaxed">{daoSummary}</p>
              </div>
            </div>
            
            {/* <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="flex flex-col items-center p-3 rounded-md bg-muted/10 border">
                <span className="text-sm text-muted-foreground">Active</span>
                <span className="text-2xl font-semibold">{dao.activeProposals}</span>
              </div>
              <div className="flex flex-col items-center p-3 rounded-md bg-muted/10 border">
                <span className="text-sm text-muted-foreground">Closed</span>
                <span className="text-2xl font-semibold">{dao.closedProposals}</span>
              </div>
              <div className="flex flex-col items-center p-3 rounded-md bg-muted/10 border">
                <span className="text-sm text-muted-foreground">Votes</span>
                <span className="text-2xl font-semibold">{dao.totalVotes}</span>
              </div>
            </div>             */}
          </>
        )}
      </CardContent>
      <CardFooter className="pt-0">
        <Button variant="outline" size="sm" className="w-full" asChild>
          <a 
            href={`https://snapshot.org/#/${dao.identifier}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center"
          >
            View DAO on Snapshot <ChevronRightIcon className="ml-1 h-4 w-4" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
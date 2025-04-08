import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ExternalLinkIcon, Mountain } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { WeeklyProposalSummary } from "../types";
import { daoConfig } from "@/lib/constants";

export function WeeklyProposalCard({ 
  proposal, 
  generateSummary 
}: { 
  proposal: WeeklyProposalSummary, 
  generateSummary: (proposalId: string) => void 
}) {
  const [expanded, setExpanded] = useState(false);
  
  // Generate summary when expanding if it doesn't exist yet
  const handleExpand = () => {
    if (!proposal.summary && !proposal.isLoadingSummary) {
      generateSummary(proposal.id);
    }
    setExpanded(true);
  };
  
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={proposal.daoLogo} alt={proposal.daoName} />
              <AvatarFallback>{proposal.daoName.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">{proposal.title}</CardTitle>
              <CardDescription>{proposal.daoName}</CardDescription>
            </div>
          </div>
          {proposal.state === "active" ? (
            <Badge variant="secondary">Active</Badge>
          ) : (
            <Badge variant={proposal.result === "Passed" ? "default" : "destructive"}>
              {proposal.result}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      {/* Proposal summary section - shown when expanded */}
      {expanded && (
        <CardContent className="pt-0 pb-3">
          <div className="bg-muted/10 p-3 rounded-md mt-1">
            {proposal.isLoadingSummary ? (
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-full" />
                <span className="text-xs text-muted-foreground whitespace-nowrap">Generating summary...</span>
              </div>
            ) : proposal.summary ? (
              <div className="flex items-start gap-2">
                <Mountain className="h-4 w-4 text-primary mt-1 shrink-0" />
                <p className="text-sm text-muted-foreground">{proposal.summary}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No summary available.</p>
            )}
          </div>
        </CardContent>
      )}
      
      <CardFooter className="flex justify-between items-center pt-2 pb-3">
        <div className="flex items-center text-sm text-muted-foreground">
          <CalendarIcon className="mr-1 h-4 w-4" />
          {new Date(proposal.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
          <span className="ml-2">{proposal.votes} votes</span>
        </div>
        <div className="flex items-center gap-2">
          {!expanded && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleExpand}
              className="text-xs"
            >
              Show summary
            </Button>
          )}
          {expanded && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setExpanded(false)}
              className="text-xs"
            >
              Hide summary
            </Button>
          )}
          <Button variant="outline" size="sm" asChild>
            <a 
              href={`https://snapshot.org/#/${daoConfig[proposal.daoId].identifier}/proposal/${proposal.id}`} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              View <ExternalLinkIcon className="ml-1 h-4 w-4" />
            </a>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
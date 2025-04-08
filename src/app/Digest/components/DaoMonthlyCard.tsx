import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRightIcon, BarChart3, Mountain } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { DaoDigestSummary } from "../types";
import { daoConfig } from "@/lib/constants";

export function DaoMonthlyCard({ dao }: { dao: DaoDigestSummary }) {
  const [expanded, setExpanded] = useState(false);
  
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
            <CardDescription>Monthly Activity Summary</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        {dao.isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        ) : (
          <>
            <div className="bg-muted/20 p-4 rounded-md mb-4">
              <div className="flex items-start gap-2 mb-2">
                <Mountain className="h-5 w-5 text-primary mt-0.5" />
                <p className="text-sm leading-relaxed">{dao.summary}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
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
            </div>
            
            {/* Only show proposals if there are any */}
            {dao.proposals.length > 0 && (
              <>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium flex items-center">
                    <BarChart3 className="h-4 w-4 mr-1" />
                    Recent Proposals
                  </h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setExpanded(!expanded)}
                    className="text-xs"
                  >
                    {expanded ? "Show Less" : "Show More"}
                  </Button>
                </div>
                
                <div className={`space-y-2 ${expanded ? "" : "max-h-32 overflow-hidden relative"}`}>
                  {dao.proposals.map(proposal => (
                    <div key={proposal.id} className="flex items-center justify-between py-1 border-b text-sm">
                      <div className="truncate mr-2">
                        {proposal.title}
                      </div>
                      <div className="flex items-center shrink-0">
                        {proposal.state === "active" ? (
                          <Badge variant="secondary" className="mr-2">Active</Badge>
                        ) : (
                          <Badge 
                            variant={proposal.result === "Passed" ? "default" : "destructive"} 
                            className="mr-2"
                          >
                            {proposal.result}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {proposal.votes} votes
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {/* Gradient fade at the bottom when not expanded */}
                  {!expanded && dao.proposals.length > 2 && (
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none" />
                  )}
                </div>
              </>
            )}
          </>
        )}
      </CardContent>
      <CardFooter className="pt-2">
        <Button variant="outline" size="sm" className="w-full" asChild>
          <a 
            href={`https://snapshot.org/#/${daoConfig[dao.daoId].identifier}`} 
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
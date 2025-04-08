import { Badge } from "@/components/ui/badge"
import {
    Card,
    CardAction,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Github, Twitter, Zap } from "lucide-react"
import { ChartEngagement } from "./chart-engagement"
import { ChartProps } from "./char-properties";
import { NavLink } from "react-router";
import { formatNumber } from "@/lib/utils";
import { useEffect, useState } from "react";
import { fetchGraphQL } from "@/lib/dao-utils";
import { PROPOSALS_QUERY, SPACE_QUERY } from "@/lib/constants";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface DaoCardProps {
    dao: any;
    logo: any;
    daoData: any;
  }

// Convert time string in format "HH:MM" or "MM" to minutes
const parseTimeToMinutes = (timeStr: string | number): number => {
  if (typeof timeStr === 'number') return timeStr;
  if (typeof timeStr === 'string' && timeStr.includes(':')) {
    const parts = timeStr.split(':');
    return parts.length === 2
      ? parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10)
      : parseInt(parts[1], 10);
  }
  return 0;
};

// Convert minutes to "HH:MM" format
const formatMinutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};
  
export function DaoCard({ dao, logo, daoData }: DaoCardProps) {
    const [spaceData, setSpaceData] = useState<any>(null);
    const [proposals, setProposals] = useState<any[]>([]);
    const [activeProposals, setActiveProposals] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const hasSummary = daoData && daoData.summary;
    const timeString = hasSummary && daoData.summary.median_reading_time_per_proposal 
        ? daoData.summary.median_reading_time_per_proposal 
        : 100;

    const monthlyMins = hasSummary && daoData.summary.average_reading_time_per_day ? parseTimeToMinutes(daoData.summary.average_reading_time_per_day) * 30 : 0
    const monthlyTime = formatMinutesToTime(monthlyMins)

    useEffect(() => {
      const activeProposalCount = proposals.filter(proposal => proposal.state === 'active').length
      setActiveProposals(activeProposalCount)
    }, [proposals])
  
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

    // Calculate normalized scores from 0-100 based on data
    const chartData = {
      activeVotingWeight: 100,//spaceData?.followersCount ? Math.min(Math.round((spaceData.followersCount / 500000) * 100), 100) : 0,
      activeVoters: spaceData?.proposalsCount ? Math.min(Math.round(spaceData?.followersCount / dao.totalMembers * 100), 100) : 0,
      activityScore: hasSummary && daoData?.summary.total_proposals ? Math.min(Math.round(daoData.summary.total_proposals / 59 * 100), 100) : 50, // 1 hour (60 mins) is max
      participationEffortScore: hasSummary && daoData.summary.median_reading_time_per_proposal ? Math.min(Math.round(monthlyMins / 600 * 100), 100) : 0,
    }
    
    return (
        <NavLink 
            key={dao.identifier} 
            to={`/dao/${dao.identifier}`}
            className="block"
        >
        <Card className="@container/card">
        <CardHeader>
          <CardDescription>
            Snapshot
          </CardDescription>
          <CardAction>
            <Badge variant={activeProposals > 0 ? "secondary" : "outline"}>
              {activeProposals} Active Proposal{activeProposals !== 1 ? 's' : ''}
            </Badge>
          </CardAction>
            <CardTitle className="flex text-lg font-semibold tabular-nums @[250px]/card:text-2xl">
            <div className="flex size-16 items-center justify-center mr-4">
            <img src={logo} className="shrink-0" alt="Arbitrum logo" />
            </div>
            <div className="grid flex-1 text-left text-sm lg:text-lg xl:text-xl leading-tight">
            <span className="truncate font-bold">{dao.name}</span>
            <Badge variant="outline">
              <Zap/>
              <Twitter/>
              <Github/>
            </Badge>
            </div>
            </CardTitle>
        </CardHeader>
        <div className="flex flex-row justify-between items-center">
          {/* <ChartEngagement medianTimePerProposal={mins} angle={angle} /> */}
          <ChartProps users={chartData.activeVotingWeight} proposals={chartData.activeVoters} timePerDay={chartData.activityScore} votes={chartData.participationEffortScore} totalTime={0} />
        </div>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          {/* {isLoading ? (
            <div>Loading data...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : ( */}
            <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="line-clamp-1 flex gap-2 font-medium">
                    Total Members
                    <Badge variant="outline">
                      {dao?.totalMembers ? formatNumber(dao.totalMembers) : ""}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-56">The number of unique wallet addresses that are part of the DAO community.</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger className="line-clamp-1 flex gap-2 font-medium">
                    Active Voters
                    <Badge variant="outline">
                      {spaceData?.followersCount ? formatNumber(spaceData.followersCount) : ""}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-56">Members who have voted on at least one proposal in the past 30 days.</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger className="line-clamp-1 flex gap-2 font-medium">
                    Recent Proposals
                    <Badge variant="outline">
                      {daoData?.summary ? formatNumber(daoData.summary.total_proposals) : ""}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-56">The number of governance proposals submitted in the past 90 days.</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger className="line-clamp-1 flex gap-2 font-medium">
                    Participation Effort
                    <Badge variant="outline">
                      {daoData?.summary ? monthlyTime : ""} 
                    </Badge>
                    <div className="font-light txt-xs text-muted-foreground">
                        hh/month
                      </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-56">Estimated time (in hours) required to review and understand all new proposals this month.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              {dao?.network && (
                <div className="line-clamp-1 flex gap-2 font-medium">
                  Network
                  <Badge variant="outline">
                    {dao.network}
                  </Badge>
                </div>
              )}
            </>
          {/* )} */}
        </CardFooter>
      </Card>
      </NavLink>
    )
}
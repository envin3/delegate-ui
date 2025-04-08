import { daoConfig, PROPOSALS_QUERY } from "@/lib/constants";
import { fetchGraphQL } from "@/lib/dao-utils";
import { WeeklyProposalSummary } from "../types";

export const fetchWeeklyProposals = async (): Promise<WeeklyProposalSummary[]> => {
  try {
    // Calculate date range for the current week
    const today = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    // Convert to Unix timestamp (seconds)
    const startTime = Math.floor(oneWeekAgo.getTime() / 1000);
    
    // Fetch data for all DAOs
    const proposalsPromises = Object.keys(daoConfig).map(async (daoId) => {
      const dao = daoConfig[daoId];
      
      // Fetch proposals using GraphQL
      const proposalsResult = await fetchGraphQL(PROPOSALS_QUERY, { 
        space: dao.identifier,
        limit: 10 // Limit to 10 proposals per DAO
      });
      
      // Filter for proposals in the last week and format for display
      return proposalsResult.proposals
        .filter((p: any) => p.start >= startTime || p.end >= startTime)
        .map((p: any) => ({
          id: p.id,
          title: p.title,
          body: p.body, // Include the body for summarization
          daoId: daoId,
          daoName: dao.name,
          daoLogo: dao.logo,
          state: p.state,
          date: new Date(p.end * 1000).toISOString(),
          votes: p.votes,
          result: p.state === "closed" ? 
            (p.scores_total > 0 ? "Passed" : "Failed") : undefined,
          summary: "", // Will be populated later
          isLoadingSummary: false
        }));
    });
    
    // Flatten the array of arrays into a single array of proposals
    const weeklyProposals = (await Promise.all(proposalsPromises)).flat();
    
    // Sort by date (most recent first)
    return weeklyProposals.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error("Error fetching weekly proposals:", error);
    return [];
  }
};
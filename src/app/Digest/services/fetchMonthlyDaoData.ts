import { daoConfig, PROPOSALS_QUERY } from "@/lib/constants";
import { fetchGraphQL } from "@/lib/dao-utils";
import { parseQuery } from "@/lib/delegate-query";
import { DaoDigestSummary } from "../types";

export const fetchMonthlyDaoData = async (daoId: string): Promise<DaoDigestSummary> => {
  const dao = daoConfig[daoId];
  let summary = "";
  let proposals = [];
  
  try {
    // Fetch last month's proposals
    const now = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    // Convert to Unix timestamp (seconds)
    const startTime = Math.floor(oneMonthAgo.getTime() / 1000);
    
    // Fetch proposals using GraphQL
    const proposalsResult = await fetchGraphQL(PROPOSALS_QUERY, { 
      space: dao.identifier,
      limit: 15 // Limit to reasonable number of proposals
    });
    
    // Filter for proposals in the last month
    const recentProposals = proposalsResult.proposals.filter(
      (p: any) => p.start >= startTime
    );
    
    // Format proposals for display
    proposals = recentProposals.map((p: any) => ({
      id: p.id,
      title: p.title,
      state: p.state,
      result: p.state === "closed" ? 
        (p.scores_total > 0 ? "Passed" : "Failed") : undefined,
      votes: p.votes
    }));
    
    // Get monthly summary using AI
    const promptData = {
      daoName: dao.name,
      proposalsCount: recentProposals.length,
      activeProposals: recentProposals.filter((p: any) => p.state === "active").length,
      closedProposals: recentProposals.filter((p: any) => p.state === "closed").length,
      topProposalTitles: recentProposals.slice(0, 3).map((p: any) => p.title)
    };
    
    const prompt = `Generate a concise 2-3 sentence summary of the current state of ${dao.name} DAO based on the following information:
    
    Number of proposals in the last month: ${promptData.proposalsCount}
    Active proposals: ${promptData.activeProposals}
    Closed proposals: ${promptData.closedProposals}
    Recent proposal topics: ${promptData.topProposalTitles.join(', ')}
    
    Focus on governance activity level, key initiatives, and overall health of the DAO. Keep it objective and informative.`;
    
    // Call parseQuery to get AI-generated summary
    const proposalContext = recentProposals.length > 0 ? 
      recentProposals[0].body || "" : "";
    summary = await parseQuery(prompt, proposalContext);
    
    return {
      daoId,
      name: dao.name,
      logo: dao.logo,
      summary,
      activeProposals: promptData.activeProposals,
      closedProposals: promptData.closedProposals,
      totalVotes: recentProposals.reduce((sum: number, p: any) => sum + p.votes, 0),
      proposals,
      isLoading: false
    };
  } catch (error) {
    console.error(`Error fetching data for ${dao.name}:`, error);
    
    return {
      daoId,
      name: dao.name,
      logo: dao.logo,
      summary: "Unable to load summary at this time.",
      activeProposals: 0,
      closedProposals: 0,
      totalVotes: 0,
      proposals: [],
      isLoading: false
    };
  }
};
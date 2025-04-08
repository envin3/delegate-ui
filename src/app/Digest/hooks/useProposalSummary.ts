import { WeeklyProposalSummary } from "../types";
import { parseQuery } from "@/lib/delegate-query";

export function useProposalSummary(
  weeklyProposals: WeeklyProposalSummary[],
  setWeeklyProposals: (proposals: WeeklyProposalSummary[]) => void
) {
  const generateProposalSummary = async (proposalId: string) => {
    // Find the proposal and set its loading state
    const updatedProposals = weeklyProposals.map(p => 
      p.id === proposalId ? { ...p, isLoadingSummary: true } : p
    );
    
    setWeeklyProposals(updatedProposals);
    
    // Find the proposal to summarize
    const proposal = weeklyProposals.find(p => p.id === proposalId);
    if (!proposal || !proposal.body) {
      // If proposal not found or has no body, update state with error
      const failedProposals = weeklyProposals.map(p => 
        p.id === proposalId ? { 
          ...p, 
          isLoadingSummary: false, 
          summary: "Unable to generate summary due to missing content." 
        } : p
      );
      setWeeklyProposals(failedProposals);
      return;
    }
    
    try {
      // Create a prompt for the OpenAI API
      const prompt = `Provide a concise 1-2 sentence summary of the following DAO proposal content. 
          Focus on the main objective and expected outcome. Be objective and informative.`;
      
      // Get summary from OpenAI API
      const summary = await parseQuery(prompt, proposal.body);
      
      // Update the proposal with the summary
      const updatedProposalsWithSummary = weeklyProposals.map(p => 
        p.id === proposalId ? { 
          ...p, 
          isLoadingSummary: false, 
          summary: summary || "No summary could be generated." 
        } : p
      );
      
      setWeeklyProposals(updatedProposalsWithSummary);
    } catch (error) {
      console.error("Error generating proposal summary:", error);
      
      // Update state with error
      const failedProposals = weeklyProposals.map(p => 
        p.id === proposalId ? { 
          ...p, 
          isLoadingSummary: false, 
          summary: "Failed to generate summary. Please try again." 
        } : p
      );
      setWeeklyProposals(failedProposals);
    }
  };

  return { generateProposalSummary };
}
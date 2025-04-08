import { useState, useEffect } from "react";
import { DigestItem, DigestPeriod, DaoDigestSummary, WeeklyProposalSummary } from "../types";
import { fetchDigestData } from "../services/fetchDigestData";
import { fetchMonthlyDaoData } from "../services/fetchMonthlyDaoData";
import { fetchWeeklyProposals } from "../services/fetchWeeklyProposals";
import { daoConfig } from "@/lib/constants";

export function useDigestData(period: DigestPeriod) {
  const [digestItems, setDigestItems] = useState<DigestItem[]>([]);
  const [weeklyProposals, setWeeklyProposals] = useState<WeeklyProposalSummary[]>([]);
  const [daoSummaries, setDaoSummaries] = useState<DaoDigestSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDigestData = async () => {
      setIsLoading(true);
      try {
        if (period === "global") {
          // Initialize loading state for each DAO
          const initialDaoStates = Object.keys(daoConfig).map(daoId => ({
            daoId,
            name: daoConfig[daoId].name,
            logo: daoConfig[daoId].logo,
            summary: "",
            activeProposals: 0,
            closedProposals: 0,
            totalVotes: 0,
            proposals: [],
            isLoading: true
          }));
          
          setDaoSummaries(initialDaoStates);
          
          // Fetch data for each DAO
          const summaries = await Promise.all(
            Object.keys(daoConfig).map(daoId => fetchMonthlyDaoData(daoId))
          );
          
          setDaoSummaries(summaries);
        } else if (period === "proposals") {
          // Fetch weekly proposal summaries
          const proposals = await fetchWeeklyProposals();
          setWeeklyProposals(proposals);
        } else {
          // Regular digest data for daily
          const data = await fetchDigestData(period);
          setDigestItems(data);
        }
      } catch (error) {
        console.error("Failed to fetch digest data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDigestData();
  }, [period]);

  return { 
    digestItems, 
    weeklyProposals, 
    setWeeklyProposals,
    daoSummaries, 
    isLoading 
  };
}
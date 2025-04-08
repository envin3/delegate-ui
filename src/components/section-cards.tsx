import { fetchMultipleDaos } from "@/lib/dao-utils"
import { useEffect, useState } from "react"
import { DaoCard } from "./dao-card"
import { daoConfig } from "@/lib/constants"

export function SectionCards() {
  const [daoProposals, setDaoProposals] = useState<Record<string, any> | null>(null);
  
  useEffect(() => {
    const loadData = async () => {
      const daoSources = Object.values(daoConfig).map(dao => ({
        source: dao.source,
        identifier: dao.identifier
      }));
      
      const data = await fetchMultipleDaos(daoSources);
      setDaoProposals(data);
    };
    
    loadData();
  }, []);

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @2xl/main:grid-cols-2 @6xl/main:grid-cols-3 @7xl/main:grid-cols-4">
      {Object.entries(daoConfig).map(([key, dao]) => (
        <DaoCard 
          key={key}
          dao={dao}
          logo={dao.logo}
          daoData={daoProposals ? daoProposals[dao.identifier]: []}
        />
      ))}
    </div>
  )
}

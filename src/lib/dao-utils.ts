import { useQuery, useMutation, QueryClient, useQueries, useQueryClient } from '@tanstack/react-query'
import { persistQueryClient } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'

/**
 * Base function to fetch DAO info - Non-hook version
 */
export async function fetchDaoInfo(source: string = 'snapshot', identifier: string = 'aave.eth'): Promise<any> {
  try {
    const response = await fetch(`https://delegate-api-1.ngrok.io/api/proposals?source=${source}&identifier=${identifier}`);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching proposals:', error);
    throw error;
  }
}

// Filter proposals by age (in days)
export const filterProposalsByAge = (proposals: any, maxAgeDays: number) => {
  if (!proposals || proposals.length === 0) return [];
  
  const now = Math.floor(Date.now() / 1000); // Current time in seconds
  return proposals.filter(proposal => {
    const proposalAge = now - proposal.start;
    const maxAgeSeconds = maxAgeDays * 24 * 60 * 60; // Convert days to seconds
    return proposalAge <= maxAgeSeconds;
  });
};

/**
 * Base function to fetch multiple DAOs - Non-hook version
 */
// export async function fetchMultipleDaos(daos: Array<{ source?: string, identifier: string }>): Promise<Record<string, any>> {
//   // Create an array of promises for each DAO
//   const fetchPromises = daos.map(dao => {
//     return fetchDaoInfo(dao.source, dao.identifier)
//       .then(data => ({ identifier: dao.identifier, data }))
//       .catch(error => {
//         console.error(`Error fetching data for ${dao.identifier}:`, error);
//         return { identifier: dao.identifier, data: null };
//       });
//   });

//   // Wait for all promises to resolve
//   const results = await Promise.all(fetchPromises);

//   // Convert the array of results to an object keyed by identifier
//   return results.reduce((acc, { identifier, data }) => {
//     acc[identifier] = data;
//     return acc;
//   }, {} as Record<string, any>);
// }

// Convert time string in format "HH:MM" or "MM" to minutes
export const parseTimeToMinutes = (timeStr: string | number): number => {
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
export const formatMinutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

/**
 * Get a subset of proposals from cache or fetch if needed
 */
// export function useFilteredProposals(
//   space: string, 
//   options: { 
//     limit?: number,
//     states?: string[],
//     includeIds?: string[],
//     excludeIds?: string[],
//     startDate?: Date,
//     endDate?: Date,
//   } = {}
// ) {
//   const queryClient = useQueryClient();
//   const { limit = 15 } = options;
  
//   // Convert options to a stable key using JSON.stringify
//   const optionsKey = JSON.stringify(options);
  
//   return useQuery({
//     queryKey: ['filteredProposals', space, optionsKey],
//     queryFn: async () => {
//       console.log('Filter function running');
      
//       // Try to get data from cache first
//       let cachedData = queryClient.getQueryData(['allProposals', space, 300]);
      
//       // If not in cache, fetch it and store in cache
//       if (!cachedData) {
//         console.log('No cached data for proposals, fetching...');
//         cachedData = await fetchAllProposals(space, 300);
        
//         // Store in cache explicitly
//         queryClient.setQueryData(['allProposals', space, 300], cachedData);
//       } else {
//         console.log('Using cached proposal data');
//       }
      
//       return filterProposalsFromCache(cachedData, options);
//     },
//     staleTime: 30 * 60 * 1000, // 30 minutes
//     // Make this query depend on the all proposals query
//     enabled: true,
//   });
// }

/**
 * Helper function to filter proposals from cache
 */
// function filterProposalsFromCache(data: any, options: any = {}) {
//   const { 
//     limit = 15, 
//     states, 
//     includeIds,
//     excludeIds,
//     startDate,
//     endDate
//   } = options;
  
//   if (!data?.proposals) return { proposals: [] };
  
//   let filtered = [...data.proposals];
  
//   // Apply filters
//   if (states && states.length > 0) {
//     filtered = filtered.filter(p => states.includes(p.state));
//   }
  
//   if (includeIds && includeIds.length > 0) {
//     filtered = filtered.filter(p => includeIds.includes(p.id));
//   }
  
//   if (excludeIds && excludeIds.length > 0) {
//     filtered = filtered.filter(p => !excludeIds.includes(p.id));
//   }
  
//   if (startDate) {
//     const start = new Date(startDate).getTime() / 1000;
//     filtered = filtered.filter(p => p.start >= start);
//   }
  
//   if (endDate) {
//     const end = new Date(endDate).getTime() / 1000;
//     filtered = filtered.filter(p => p.end <= end);
//   }
  
//   // Apply limit
//   filtered = filtered.slice(0, limit);
  
//   return { proposals: filtered };
// }

/**
 * Hook to fetch a single proposal by ID (uses cached data if available)
 */
// export function useProposalById(space: string, proposalId: string, options = {}) {
//   const queryClient = useQueryClient(); // Use the existing QueryClient from context
  
//   return useQuery({
//     queryKey: ['proposal', space, proposalId],
//     queryFn: async () => {
//       // Use the injected queryClient
//       const cachedData = queryClient.getQueryData(['allProposals', space, 300]);
      
//       if (cachedData?.proposals) {
//         const proposal = cachedData.proposals.find((p: any) => p.id === proposalId);
//         if (proposal) return { proposal };
//       }
      
//       // If not found in cache, fetch directly
//       const query = `
//         query Proposal($id: String!) {
//           proposal(id: $id) {
//             id
//             title
//             body
//             choices
//             start
//             end
//             snapshot
//             state
//             author
//             space {
//               id
//               name
//             }
//             scores_total
//             scores
//             votes
//           }
//         }
//       `;
      
//       return fetchGraphQL(query, { id: proposalId });
//     },
//     staleTime: 30 * 60 * 1000, // 30 minutes
//     ...options
//   });
// }
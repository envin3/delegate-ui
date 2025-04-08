/**
 * Utility functions for interacting with DAO data
 */

/**
 * Fetches proposals from the delegate API
 * @param source - The source platform (e.g., 'snapshot')
 * @param identifier - The DAO identifier (e.g., 'aave.eth')
 * @returns A promise that resolves to the proposal data
 * Example usage:
 * const aaveProposals = await fetchDaoInfo('snapshot', 'aave.eth');
 */
export async function fetchDaoInfo(source: string = 'snapshot', identifier: string = 'aave.eth'): Promise<any> {
    // Create a cache key based on the parameters
    const cacheKey = `dao_info_${source}_${identifier}`;
    
    // Check if data exists in localStorage cache
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
        try {
            const { data, timestamp } = JSON.parse(cachedData);
            // Cache valid for 10 minutes (600000 ms)
            if (Date.now() - timestamp < 600000) {
                return data;
            }
        } catch (error) {
            console.warn('Error parsing cached data:', error);
            // Continue with fetching fresh data if cache parsing fails
        }
    }
    
    try {
        const response = await fetch(`https://delegate-api-1.ngrok.io/api/proposals?source=${source}&identifier=${identifier}`);
        
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        
        // Store in cache with timestamp
        localStorage.setItem(cacheKey, JSON.stringify({
            data,
            timestamp: Date.now()
        }));
        
        return data;
    } catch (error) {
        console.error('Error fetching proposals:', error);
        throw error;
    }
}

/**
 * Fetches information for multiple DAOs in parallel
 * @param daos - Array of DAO objects with source and identifier properties
 * @returns A promise that resolves to an object with DAO identifiers as keys and their data as values
 * Example usage:
 * const daoData = await fetchMultipleDaos([
 *   { source: 'snapshot', identifier: 'aave.eth' },
 *   { source: 'snapshot', identifier: 'ens.eth' }
 * ]);
 * 
 * // Example return value:
 * // {
 * //   "aave.eth": { proposals: [...], metadata: {...} },
 * //   "ens.eth": { proposals: [...], metadata: {...} }
 * // }
 */
export async function fetchMultipleDaos(daos: Array<{ source?: string, identifier: string }>): Promise<Record<string, any>> {
    // Create an array of promises for each DAO
    const fetchPromises = daos.map(dao => {
        return fetchDaoInfo(dao.source, dao.identifier)
            .then(data => ({ identifier: dao.identifier, data }))
            .catch(error => {
                console.error(`Error fetching data for ${dao.identifier}:`, error);
                return { identifier: dao.identifier, data: null };
            });
    });

    // Wait for all promises to resolve
    const results = await Promise.all(fetchPromises);

    // Convert the array of results to an object keyed by identifier
    return results.reduce((acc, { identifier, data }) => {
        acc[identifier] = data;
        return acc;
    }, {} as Record<string, any>);
}

export async function fetchGraphQL(query: string, variables: Record<string, any> = {}) {
    // Snapshot GraphQL API endpoint
    const endpoint = 'https://hub.snapshot.org/graphql';
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.errors) {
        throw new Error(data.errors.map((e: any) => e.message).join('\n'));
      }
      
      return data.data;
    } catch (error) {
      console.error('Error fetching GraphQL data:', error);
      throw error;
    }
  }
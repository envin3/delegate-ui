import { SNAPSHOT_API_URL } from "./constants";

/**
 * Base GraphQL fetch function - Non-hook version
 */
export async function fetchGraphQL(query: string, variables: Record<string, any> = {}) {    
    try {
      const response = await fetch(SNAPSHOT_API_URL, {
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

/**
 * Fetch and cache all proposals for a space
 */
export async function fetchAllProposals(space: string, limit: number = 2000) {    
    const query = `
      query Proposals($space: String!, $limit: Int!) {
        proposals(
          first: $limit, 
          where: {
            space: $space
          },
          orderBy: "created",
          orderDirection: desc
        ) {
          id
          title
          body
          choices
          start
          end
          snapshot
          state
          author
          space {
            id
            name
          }
          scores_total
          scores
          votes
        }
      }
    `;
    
    const result = await fetchGraphQL(query, { space, limit });
    return result;
  }
import arbitrumLogo from "/arbitrum-arb-logo.svg"
import aaveLogo from "/aave-aave-logo.svg"
import gnosisLogo from "/gnosis-gno-gno-logo.svg"
import balancerLogo from "/balancer-bal-logo.svg"
import lidoLogo from "/lido-dao-ldo-logo.svg"
import uniswapLogo from "/uniswap-uni-logo.svg"

// Snapshot GraphQL API endpoint
export const SNAPSHOT_API_URL = 'https://hub.snapshot.org/graphql'
export const STALE_TIME = 5 * 60 * 1000; // 30 minutes
export const GC_TIME = 24 * 60 * 60 * 1000; // 24 hours
export const PROPOSAL_FETCH_LIMIT_ALL = 2000; // Limit to 200 proposals

export const MONTHLY_REPORT_DIRECTIVE = 'Based on the following information, provide a concise summary (max 15 sentences) of the current state for non technical people and focus of the following DAO. Provide, if possible, a list of the most important topics that are being discussed in the DAO.'
export const GLOBAL_REPORT_DIRECTIVE = 'Based on the following information, provide a concise summary (max 30 sentences) of the current DAO for non technical people. What is it about, why was it created, when was it created? Provide a reason why the user would want to join this DAO.';
export const PROPROSAL_DIRECTIVE = 'Provide a concise summary (max 5 sentences) of the provided proposal. Include the most important points and a summary of the proposal. Provide a reason why the user would want to vote for or against this proposal.';
export const FILTERED_PROPOSAL_DIRECTIVE = 'Based on the following information, provide a concise summary (max 5 sentences) of the provided proposals. Include the most important points and a summary of the proposal. Give a point for each proposal.'; 

export interface DaoConfigItem {
    name: string;
    logo: string;
    source: string;
    identifier: string;
    totalMembers?: number;
    proposals?: number;
    votes?: number;
  }
  
export const daoConfig: Record<string, DaoConfigItem> = {
    aave: { 
      name: 'Aave',
      logo: aaveLogo,
      source: 'snapshot',
      identifier: 'aavedao.eth',
      totalMembers: 184598,
      proposals: 364,
      votes: 5.6,
    },
    arbitrum: { 
      name: 'Arbitrum',
      logo: arbitrumLogo,
      source: 'snapshot', 
      identifier: 'arbitrumfoundation.eth',
      totalMembers: 1428677,
      proposals: 364,
      votes: 5.6,
    },
    balancer: { 
      name: 'Balancer',
      logo: balancerLogo,
      source: 'snapshot', 
      identifier: 'balancer.eth',
      totalMembers: 49111,
      proposals: 364,
      votes: 5.6,
    },
    gnosis: { 
      name: 'Gnosis',
      logo: gnosisLogo,
      source: 'snapshot', 
      identifier: 'gnosis.eth',
      totalMembers: 56191,
      proposals: 364,
      votes: 5.6,
    },
    lido: { 
      name: 'Lido',
      logo: lidoLogo,
      source: 'snapshot', 
      identifier: 'lido-snapshot.eth',
      totalMembers: 52055,
      proposals: 364,
      votes: 5.6,
    },
    uniswap: { 
      name: 'Uniswap',
      logo: uniswapLogo,
      source: 'snapshot', 
      identifier: 'uniswapgovernance.eth',
      totalMembers: 360515,
      proposals: 364,
      votes: 5.6,
    },
  }

  /**
   * Get DAO configuration by identifier
   * @param identifier The space identifier (e.g., 'aave.eth')
   * @returns The matching DaoConfigItem or undefined if not found
   */
  export function getDaoByIdentifier(identifier: string): DaoConfigItem | undefined {
    return Object.values(daoConfig).find(dao => dao.identifier === identifier);
  }

export const SPACE_QUERY = `
  query Space($id: String!) {
    space(id: $id) {
      id
      name
      about
      network
      symbol
      members
      admins
      strategies {
        name
      }
      proposalsCount
      votesCount
      followersCount
    }
  }
`

export const PROPOSALS_QUERY = `
  query Proposals($space: String!, $limit: Int) {
    proposals(
      first: $limit,
      skip: 0,
      where: { space: $space },
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
      scores
      scores_total
      votes
    }
  }
`
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

export const DAVOS_RELAYER_ENDPOINT = 'https://34cf-82-60-186-207.ngrok-free.app'

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

type EthosOption = {
  title: string;
  description: string;
};

export const ethosOptions: EthosOption[] = [
  {
    title: "The Pragmatic Reformer",
    description: "I value practical, incremental improvements that make the DAO more effective, transparent, and sustainable. I support proposals that are well-scoped, actionable, and grounded in reality, even if they aren't the most exciting. I'm skeptical of hype and prefer ideas that deliver real utility and long-term value. I care about getting things done and making steady progress over time.",
  },
  {
    title: "The Decentralization Maximalist",
    description: "I strongly believe in decentralization, transparency, and distributed power. I support proposals that empower token holders, minimize reliance on centralized actors, and protect open participation. I'm opposed to anything that concentrates control, limits access, or compromises the values that make DAOs meaningful. I prioritize integrity over convenience.",
  },
  {
    title: "The Impact-Driven Idealist",
    description: "I care about using governance to advance ethical, social, or environmental goals. I support initiatives that create positive externalities, increase inclusivity, or align with broader missions beyond profit. I'm comfortable making long-term investments in change, even if they don't have immediate returns. Purpose and impact matter more to me than short-term gains.",
  },
  {
    title: "The Ecosystem Optimizer",
    description: "I look at proposals through the lens of broader network health. I support ideas that strengthen infrastructure, tooling, security, or composability. I care about building things that other DAOs, protocols, or contributors can benefit from. I want to see our ecosystem become more connected, reliable, and resilient over time.",
  },
  {
    title: "The Risk-Tolerant Innovator",
    description: "I'm drawn to bold, unconventional ideas — even if they might fail. I support proposals that test boundaries, explore new models, or introduce ambitious upgrades. I see experimentation as essential to progress and I'm willing to accept uncertainty if the upside is transformative. I believe governance should enable rapid iteration and breakthrough innovation.",
  },
  {
    title: "The Minimalist Voter",
    description: "I prefer to keep things simple and focused. I'm only interested in voting when a proposal clearly aligns with or challenges my core principles. I avoid unnecessary complexity and tend to skip proposals that feel marginal or low impact. I value clarity, relevance, and low noise in governance.",
  },
  {
    title: "The Community First Advocate",
    description: "I prioritize the needs and voices of the active community. I support proposals that broaden participation, reward contributors fairly, and reduce gatekeeping. I believe that DAOs should be driven by those who are most involved and care most deeply. I trust grassroots energy over top-down direction.",
  },
  {
    title: "The Treasury Hawk",
    description: "I pay close attention to spending and financial sustainability. I support proposals with clear deliverables, reasonable budgets, and transparent accountability. I oppose anything that feels vague, overfunded, or misaligned with long-term ROI. I believe treasury decisions should be disciplined and based on results.",
  },
  {
    title: "The Rational Evaluator",
    description: "I approach governance with a focus on reason, consistency, and fairness. I evaluate each proposal on its own merits, with clear criteria and attention to detail. I avoid emotional or ideological voting and look for sound logic, evidence, and alignment with good process. I believe clear thinking leads to better outcomes.",
  },
  {
    title: "The Passive Protector",
    description: "I don't want to be involved in every vote, but I care about guarding against harmful decisions. I support proposals that maintain basic safeguards, protect against centralization, and defend core values. I generally prefer to abstain unless something directly challenges my principles. I want governance that stays aligned without constant oversight.",
  },
];
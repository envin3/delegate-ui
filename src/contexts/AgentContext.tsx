import { DaoConfigItem } from '@/lib/constants';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAccount } from 'wagmi';

// Define the structure of a Agent
export interface Agent {
  dao: DaoConfigItem
}

// Interface for Agents storage by account
interface AccountAgents {
  [address: string]: Agent[]
}

// Define the context shape
interface AgentsContextType {
  Agents: Agent[];
  addAgent: (dao: DaoConfigItem) => void;
  removeAgent: (dao: DaoConfigItem) => void;
  hasAgent: (dao: DaoConfigItem) => boolean;
}

// Create the context with a default value
const AgentsContext = createContext<AgentsContextType>({
  Agents: [],
  addAgent: () => {},
  removeAgent: () => {},
  hasAgent: () => false,
});

// Custom hook to use the Agents context
export const useAgents = () => useContext(AgentsContext);

// Helper to get storage key for an address
const getStorageKey = (address: string | undefined) => {
  return `daoAgents_${address || 'anonymous'}`;
};

// Provider component
export function AgentsProvider({ children }: { children: ReactNode }) {
  const { address } = useAccount();
  const [allAgents, setAllAgents] = useState<AccountAgents>(() => {
    if (typeof window === 'undefined') return {};
    
    // Load all Agent data
    try {
      const saved = localStorage.getItem('allDaoAgents');
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error("Failed to parse Agents from localStorage:", error);
      return {};
    }
  });
  
  // Get current user's Agents
  const currentAgents = address ? (allAgents[address] || []) : [];
  
  // Save to localStorage whenever Agents change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('allDaoAgents', JSON.stringify(allAgents));
    }
  }, [allAgents]);
  
  // Update Agents when address changes
  useEffect(() => {
    // This is just to ensure the UI updates when account changes
    // The actual Agents are pulled directly from allAgents
  }, [address]);

  // Add a new Agent for the current account
  const addAgent = (dao: DaoConfigItem) => {
    if (!address) return; // Don't save if no address is connected
    
    setAllAgents(prev => {
      const userAgents = prev[address] || [];
      
      // Check if already subscribed
      if (userAgents.some(sub => sub.dao?.identifier === dao.identifier)) {
        return prev;
      }
      
      // Add new Agent
      return {
        ...prev,
        [address]: [
          ...userAgents,
          { dao }
        ]
      };
    });
  };

  // Remove a Agent for the current account
  const removeAgent = (dao: DaoConfigItem) => {
    if (!address) return;
    
    setAllAgents(prev => {
      const userAgents = prev[address] || [];
      
      return {
        ...prev,
        [address]: userAgents.filter(sub => sub.dao?.identifier !== dao.identifier)
      };
    });
  };

  // Check if the current account is subscribed
  const hasAgent = (dao: DaoConfigItem) => {
    if (!address) return false;
    
    const userAgents = allAgents[address] || [];
    return userAgents.some(sub => sub.dao?.identifier === dao.identifier);
  };

  // Create the context value based on the current user's Agents
  const contextValue: AgentsContextType = {
    Agents: currentAgents,
    addAgent,
    removeAgent,
    hasAgent
  };

  return (
    <AgentsContext.Provider value={contextValue}>
      {children}
    </AgentsContext.Provider>
  );
}
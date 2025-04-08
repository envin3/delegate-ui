import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAccount } from 'wagmi';

interface EthosContextType {
    ethos: string;
    setEthos: (value: string) => void;
}

const EthosContext = createContext<EthosContextType | undefined>(undefined);

export function EthosProvider({ children }: { children: ReactNode }) {
    const { address } = useAccount();
    const [ethos, setEthos] = useState<string>('');

    // Generate a storage key based on user's address
    const storageKey = address ? `ethos_${address}` : null;

    // Load ethos from localStorage when component mounts or address changes
    useEffect(() => {
        if (storageKey) {
            const savedEthos = localStorage.getItem(storageKey);
            if (savedEthos) {
                setEthos(savedEthos);
            }
        }
    }, [storageKey]);

    // Custom setter that updates both state and localStorage
    const updateEthos = (value: string) => {
        setEthos(value);
        if (storageKey) {
            localStorage.setItem(storageKey, value);
        }
    };

    const value = {
        ethos,
        setEthos: updateEthos,
    };

    return <EthosContext.Provider value={value}>{children}</EthosContext.Provider>;
}

export function useEthos() {
    const context = useContext(EthosContext);
    if (context === undefined) {
        throw new Error('useEthos must be used within an EthosProvider');
    }
    return context;
}
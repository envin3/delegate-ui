import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { DAVOS_RELAYER_ENDPOINT } from "./constants";
import { HDKey, generateMnemonic, english, mnemonicToAccount, deriveAccount, hdKeyToAccount } from 'viem/accounts';
import { toHex, hexToBytes } from "viem";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to format large numbers
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}m`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(0)}k`;
  }
  return num.toString();
}

/**
 * Fetches the KMS adapter address from the external service
 * @returns Promise with the KMS adapter address string
 */
export async function predictKmsAdapterAddress(): Promise<string> {
  try {
    const response = await fetch(`${DAVOS_RELAYER_ENDPOINT}/predict-kms-address`, {
      method: 'GET',
      headers: {
        'ngrok-skip-browser-warning': 'true',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch KMS address: ${response.status}`);
    }
    
    const data = await response.json();
    return data.predictedAddress || '';
  } catch (error) {
    console.error('Error fetching KMS adapter address:', error);
    throw error;
  }
}

/**
 * Deploys the KMS adapter for a specific voter address
 * @param voterAddress The Ethereum address of the voter
 * @returns Promise with the deployment response
 */
export async function deployKmsAdapter(voterAddress: string): Promise<any> {
  try {
    const response = await fetch(`${DAVOS_RELAYER_ENDPOINT}/set-kms-adapter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        voterAddress: voterAddress
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to deploy KMS adapter: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error deploying KMS adapter:', error);
    throw error;
  }
}

/**
 * Derives a private key from an address using Viem
 * @param {string} address - The address to derive private key from
 * @returns {import('viem').HDAccount} - The derived account
 */
export const getHDAccountByAddress = (address: string) => {
  const masterSeed = toHex(new TextEncoder().encode(`master-seed-${address}`));
  const hdKey = HDKey.fromMasterSeed(hexToBytes(masterSeed)) 
  
  // Convert address to numeric index for derivation
  const index = Number(BigInt(address).toString(10).slice(0, 10))
  const account = hdKeyToAccount(
    hdKey,
    {
      accountIndex: 1,
      addressIndex: index
    }
  )
  return account;
};
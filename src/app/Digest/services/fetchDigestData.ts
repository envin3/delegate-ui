import { DigestItem, DigestPeriod } from "../types";

// Example data (replace with actual API fetch)
export const fetchDigestData = async (period: DigestPeriod): Promise<DigestItem[]> => {
  // This would be replaced with an actual API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: "1",
          title: "Uniswap Governance Proposal #14 Passes",
          description: "The community voted to allocate 10M UNI tokens to development grants.",
          date: "2023-11-15T10:30:00Z",
          source: "Uniswap",
          sourceIcon: "/icons/uniswap.png",
          url: "https://example.com/news/1",
          category: "Governance"
        },
        {
          id: "2",
          title: "Aave Launches v3 on Ethereum Mainnet",
          description: "The latest version brings improved capital efficiency and risk management.",
          date: "2023-11-14T14:45:00Z",
          source: "Aave",
          sourceIcon: "/icons/aave.png",
          url: "https://example.com/news/2",
          category: "Protocol Update"
        },
        {
          id: "3",
          title: "MakerDAO Passes Constitutional Amendment",
          description: "The amendment aims to improve decentralization of the protocol's governance.",
          date: "2023-11-13T09:15:00Z",
          source: "MakerDAO",
          sourceIcon: "/icons/makerdao.png",
          url: "https://example.com/news/3",
          category: "Governance"
        }
      ]);
    }, 1000);
  });
};

export const formatDate = (dateString: string, period: DigestPeriod) => {
  const date = new Date(dateString);
  if (period === "updates") {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
};
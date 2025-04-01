// import { http, createConfig } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

// export const config = createConfig({
//   chains: [mainnet, sepolia],
//   transports: {
//     [mainnet.id]: http(),
//     [sepolia.id]: http(),
//   },
// })

export const config = getDefaultConfig({
    appName: 'Delegate',
    projectId: 'baac4104fc8693f7b3fd30570968a04c',
    chains: [mainnet, sepolia]
  });
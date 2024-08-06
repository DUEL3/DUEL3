import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import "@nomicfoundation/hardhat-foundry";

const config: HardhatUserConfig = {
  solidity: "0.8.23",
  networks: {
    fuji: {
      // url: "https://avalanche-fuji-c-chain-rpc.publicnode.com",
      url: "https://api.avax-test.network/ext/bc/C/rpc",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    scrolltest: {
      url: "https://sepolia-rpc.scroll.io",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    basesepolia: {
      url: "https://sepolia.base.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    base: {
      url: "https://mainnet.base.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    arbitrum: {
      url: "https://arb1.arbitrum.io/rpc",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: {
      scrolltest: process.env.ETHERSCAN_API_KEY!,
      baseSepolia: process.env.ETHERSCAN_API_KEY!,
      arbitrumOne: process.env.ETHERSCAN_API_KEY_ARB!,
    },
    customChains: [
      {
        network: "scrolltest",
        chainId: 534351,
        urls: {
          apiURL: "https://api-sepolia.scrollscan.com/api",
          browserURL: "https://sepolia.scrollscan.com",
        },
      },
    ],
  },
};

export default config;

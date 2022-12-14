import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import '@openzeppelin/hardhat-upgrades';
import 'hardhat-gas-reporter';
import * as dotenv from 'dotenv';
dotenv.config();

const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const POLYGON_API_KEY = process.env.POLYGON_API_KEY;
const ARBITRUM_API_KEY = process.env.ARBITRUM_API_KEY;
const OPTIMISM_API_KEY = process.env.OPTIMISM_API_KEY;
const BSC_API_KEY = process.env.BSC_API_KEY;

const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL;
const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL;
const POLYGON_RPC_URL = process.env.POLYGON_RPC_URL;
const ARBITRUM_RPC_URL = process.env.ARBITRUM_RPC_URL;
const OPTIMISM_RPC_URL = process.env.OPTIMISM_RPC_URL;
const BSC_RPC_URL = process.env.BSC_RPC_URL;
const MUMBAI_RPC_URL = process.env.MUMBAI_RPC_URL;

const TESTING_PRIVATE_KEY = process.env.TESTING_PRIVATE_KEY || '';
const MAIN_PRIVATE_KEY = process.env.MAIN_PRIVATE_KEY || '';

const config: HardhatUserConfig = {
  solidity: '0.8.17',
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      chainId: 31337,
    },
    goerli: {
      accounts: [TESTING_PRIVATE_KEY],
      url: GOERLI_RPC_URL,
      chainId: 5,
    },
    mainnet: {
      accounts: [MAIN_PRIVATE_KEY],
      url: MAINNET_RPC_URL,
      chainId: 1,
      // gasPrice: 10000000000,
    },
    polygon: {
      accounts: [MAIN_PRIVATE_KEY],
      url: POLYGON_RPC_URL,
      chainId: 137,
    },
    arbitrum: {
      accounts: [MAIN_PRIVATE_KEY],
      url: ARBITRUM_RPC_URL,
      chainId: 42161,
    },
    optimism: {
      accounts: [MAIN_PRIVATE_KEY],
      url: OPTIMISM_RPC_URL,
      chainId: 10,
    },
    bsc: {
      accounts: [MAIN_PRIVATE_KEY],
      url: BSC_RPC_URL,
      chainId: 56,
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  defaultNetwork: 'hardhat',
  gasReporter: {
    enabled: true,
    outputFile: 'gas-report.txt',
    noColors: true,
    currency: 'USD',
    coinmarketcap: COINMARKETCAP_API_KEY,
  },
};

export default config;

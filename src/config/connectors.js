import { initializeConnector } from '@web3-react/core'
import { MetaMask } from '@web3-react/metamask'
import { Network } from '@web3-react/network'

// MetaMask 连接器
export const [metaMask, hooks] = initializeConnector((actions) => new MetaMask({ actions }))

// 网络连接器 - 用于只读模式
const URLS = {
    1: 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY', // 主网
    5: 'https://goerli.infura.io/v3/YOUR_INFURA_KEY',  // Goerli 测试网
    11155111: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY', // Sepolia 测试网
    31337: 'http://localhost:8545', // 本地开发网络
}

export const [network, networkHooks] = initializeConnector(
    (actions) => new Network({ actions, urlMap: URLS, defaultChainId: 31337 })
)

// 连接器列表
export const connectors = [
    [metaMask, hooks],
    [network, networkHooks],
] 
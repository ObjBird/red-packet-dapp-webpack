# 升级到 Web3-React 框架

本文档说明如何将项目从自定义 Web3 实现升级到使用 web3-react 框架。

## 🚀 升级优势

- **标准化**：使用业界标准的 web3-react 框架
- **更好的连接管理**：自动处理钱包连接状态
- **多连接器支持**：轻松支持多种钱包类型
- **更好的错误处理**：内置的错误处理机制
- **社区支持**：活跃的社区和文档

## 📦 安装依赖

```bash
# 删除旧的依赖缓存（如果遇到权限问题）
rm -rf node_modules package-lock.json

# 安装新依赖
npm install

# 或者使用 yarn
yarn install
```

## 🔧 主要变更

### 1. 新增依赖包

```json
{
  "@web3-react/core": "^8.2.3",
  "@web3-react/metamask": "^8.2.4", 
  "@web3-react/network": "^8.2.3",
  "@web3-react/types": "^8.2.3"
}
```

### 2. 文件结构变更

```
src/
├── config/
│   └── connectors.js          # 新增：Web3-React 连接器配置
├── hooks/
│   ├── useWeb3.js             # 原有：自定义 Web3 hook
│   └── useWeb3React.js        # 新增：基于 web3-react 的 hook
├── components/
└── ...
```

### 3. 核心变更说明

#### 入口文件 (src/index.js)
- 添加了 `Web3ReactProvider` 包装整个应用
- 导入连接器配置

#### 连接器配置 (src/config/connectors.js)
- 配置 MetaMask 连接器
- 配置网络连接器（用于只读模式）
- 支持多种网络（主网、测试网、本地网络）

#### 新的 Web3 Hook (src/hooks/useWeb3React.js)
- 基于 web3-react 的 `useWeb3React` hook
- 保持与原有接口的兼容性
- 自动连接功能
- 更好的错误处理

## 🔄 迁移步骤

### 步骤 1：安装依赖
```bash
npm install
```

### 步骤 2：更新网络配置
编辑 `src/config/connectors.js`，更新 Infura 密钥：
```javascript
const URLS = {
  1: 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY',
  5: 'https://goerli.infura.io/v3/YOUR_INFURA_KEY',
  11155111: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
  31337: 'http://localhost:8545',
}
```

### 步骤 3：启动应用
```bash
npm start
```

## 🆚 对比：原有 vs 新版

### 原有实现
```javascript
// 自定义 Web3 管理
const web3 = useWeb3(); // 自定义 hook
```

### 新版实现  
```javascript
// 使用 web3-react
const web3 = useWeb3(); // 基于 web3-react 的 hook
```

**接口保持一致**，但底层使用了更稳定的 web3-react 框架。

## 🔧 配置选项

### 支持的网络
- 以太坊主网 (Chain ID: 1)
- Goerli 测试网 (Chain ID: 5)  
- Sepolia 测试网 (Chain ID: 11155111)
- 本地开发网络 (Chain ID: 31337)

### 支持的钱包
- MetaMask
- 网络连接器（只读模式）

## 🐛 故障排除

### 权限问题
如果遇到 npm 权限问题：
```bash
# 方法 1：清理后重装
rm -rf node_modules package-lock.json
npm install

# 方法 2：使用 yarn
yarn install

# 方法 3：修复权限
sudo chown -R $(whoami) ~/.npm
```

### 连接问题
1. 确保 MetaMask 已安装
2. 检查网络配置
3. 查看浏览器控制台错误信息

## 📚 相关文档

- [Web3-React 官方文档](https://github.com/Uniswap/web3-react)
- [Ethers.js 文档](https://docs.ethers.org/)
- [MetaMask 开发者文档](https://docs.metamask.io/)

## ✅ 验证升级

升级完成后，应用应该：
1. ✅ 正常连接 MetaMask
2. ✅ 显示钱包地址和余额
3. ✅ 支持账户切换
4. ✅ 支持断开连接
5. ✅ 保持所有原有功能

---

**注意**：升级后的应用在用户界面上会显示 "Web3-React 版本" 标识，技术栈信息也会更新为 "React + Web3-React + Ethers.js"。 
# 🧧 红包 DApp - Webpack 版本

基于以太坊的去中心化红包系统，使用 **Webpack + React + Web3** 技术栈构建。

## ✨ 特色功能

- 🔗 **Web3 钱包集成**: 完整的 MetaMask 连接和管理
- 🧧 **智能红包系统**: 支持等额和随机红包
- 💰 **安全抢红包**: 智能合约保障资金安全
- 📱 **响应式设计**: 完美适配移动端和桌面端
- ⚡ **现代化 UI**: 毛玻璃效果和流畅动画
- 🛠️ **标准 Web3 语法**: 使用业界标准的 Web3 开发模式

## 🚀 快速开始

### 前置要求

- Node.js 16+
- npm 或 yarn
- MetaMask 浏览器插件

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
# 或
npm start
```

应用将在 `http://localhost:3000` 启动

### 构建生产版本

```bash
npm run build
```

## 🏗️ 项目架构

```
src/
├── config/
│   └── constants.js          # 合约配置和常量
├── hooks/                    # 自定义 React Hooks
│   ├── useWeb3.js           # Web3 连接管理
│   └── useRedPacketContract.js # 合约交互逻辑
├── components/              # React 组件
│   ├── WalletConnection.jsx # 钱包连接组件
│   ├── CreateRedPacket.jsx  # 发红包组件
│   └── ClaimRedPackets.jsx  # 抢红包组件
├── styles/
│   └── App.css              # 主样式文件
├── App.jsx                  # 主应用组件
└── index.js                 # 应用入口
```

## 🔧 技术栈

### 前端框架
- **React 18**: 现代化前端框架
- **React Hooks**: 状态管理和副作用处理

### Web3 集成
- **Ethers.js 6**: 以太坊交互库
- **Web3.js 4**: 备用 Web3 库
- **标准 Web3 模式**: 遵循 Web3 最佳实践

### 构建工具
- **Webpack 5**: 模块打包工具
- **Babel**: JavaScript 编译器
- **CSS Loader**: 样式处理

### 开发工具
- **Webpack Dev Server**: 开发服务器
- **Hot Module Replacement**: 热更新

## 🎯 核心功能

### 钱包管理
- ✅ MetaMask 连接和断开
- ✅ 账户切换和监听
- ✅ 网络状态检测
- ✅ 余额实时更新

### 红包功能
- ✅ 创建等额红包
- ✅ 创建随机红包
- ✅ 抢红包机制
- ✅ 红包状态管理
- ✅ 领取历史记录

### 用户体验
- ✅ 响应式界面设计
- ✅ 加载状态指示
- ✅ 错误处理和提示
- ✅ 交易状态跟踪

## 📋 使用说明

### 1. 连接钱包
- 确保安装了 MetaMask
- 点击"连接 MetaMask"按钮
- 在 MetaMask 中确认连接

### 2. 发红包
- 选择红包类型（等额/随机）
- 输入总金额和红包个数
- 填写祝福语（可选）
- 点击"发红包"并确认交易

### 3. 抢红包
- 查看红包列表
- 点击"抢红包"按钮
- 确认交易并等待结果

## ⚙️ 合约配置

默认合约地址：`0xCbdC0Cc887d97a7dfF87737419fec04ff61caE1E`

如需修改合约地址或 ABI，请编辑 `src/config/constants.js` 文件。

## 🔍 开发说明

### Web3 Hook 模式

本项目采用现代化的 React Hooks 模式管理 Web3 状态：

```javascript
// 使用 Web3 Hook
const web3 = useWeb3();
const contract = useRedPacketContract(web3.signer);

// 访问 Web3 状态
const { isConnected, account, provider } = web3;
```

### 合约交互模式

```javascript
// 创建红包
const result = await contract.createRedPacket({
  count: 5,
  message: "恭喜发财！",
  packetType: 0,
  totalAmount: "0.1"
});

// 抢红包
const result = await contract.claimRedPacket(packetId);
```

### 状态管理

使用 React Hooks 进行状态管理，避免复杂的状态管理库：

- `useState`: 组件本地状态
- `useEffect`: 副作用处理
- `useCallback`: 函数缓存优化

## 🎨 样式设计

- **设计语言**: Modern Glassmorphism
- **色彩方案**: 渐变背景 + 毛玻璃效果
- **响应式**: Mobile-first 设计
- **动画**: CSS3 过渡和变换
- **字体**: 系统字体栈

## 🔒 安全考虑

- ✅ 合约地址和 ABI 验证
- ✅ 交易参数校验
- ✅ 用户输入验证
- ✅ Error Boundary 错误捕获
- ✅ Gas Limit 设置

## 📱 浏览器兼容性

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feature/new-feature`
3. 提交更改：`git commit -am 'Add new feature'`
4. 推送到分支：`git push origin feature/new-feature`
5. 提交 Pull Request

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- [React](https://reactjs.org/) - 前端框架
- [Ethers.js](https://docs.ethers.io/) - 以太坊交互
- [Webpack](https://webpack.js.org/) - 构建工具

---

**注意**: 本项目仅用于学习和演示目的，请勿在生产环境中使用未经审计的智能合约。

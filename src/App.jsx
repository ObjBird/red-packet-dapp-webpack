import React, { useState } from 'react';
import { useWeb3 } from './hooks/useWeb3';
import { useRedPacketContract } from './hooks/useRedPacketContract';
import WalletConnection from './components/WalletConnection';
import CreateRedPacket from './components/CreateRedPacket';
import ClaimRedPackets from './components/ClaimRedPackets';
import './styles/App.css';

const App = () => {
  const [activeTab, setActiveTab] = useState('create');
  
  // Web3 状态管理
  const web3 = useWeb3();
  const contract = useRedPacketContract(web3.signer);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="app">
      {/* 顶部导航 */}
      <header className="app-header">
        <div className="container">
          <div className="brand">
            <h1>🧧 红包 DApp</h1>
            <p>基于以太坊的去中心化红包系统</p>
          </div>
          
          {/* 网络状态指示 */}
          {web3.isConnected && (
            <div className="network-info">
              <div className="network-badge">
                🌐 Chain ID: {web3.chainId}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* 钱包连接区域 */}
      <section className="wallet-section">
        <div className="container">
          <WalletConnection web3={web3} />
        </div>
      </section>

      {/* 主要内容区域 */}
      <main className="main-content">
        <div className="container">
          {web3.isConnected ? (
            <>
              {/* 标签导航 */}
              <nav className="tab-navigation">
                <button
                  className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`}
                  onClick={() => handleTabChange('create')}
                >
                  <span className="tab-icon">🧧</span>
                  <span>发红包</span>
                </button>
                <button
                  className={`tab-btn ${activeTab === 'claim' ? 'active' : ''}`}
                  onClick={() => handleTabChange('claim')}
                >
                  <span className="tab-icon">💰</span>
                  <span>抢红包</span>
                </button>
              </nav>

              {/* 标签内容 */}
              <div className="tab-content">
                {activeTab === 'create' ? (
                  <CreateRedPacket web3={web3} contract={contract} />
                ) : (
                  <ClaimRedPackets web3={web3} contract={contract} />
                )}
              </div>
            </>
          ) : (
            /* 未连接钱包时的提示 */
            <div className="welcome-section">
              <div className="welcome-card">
                <div className="welcome-icon">🎉</div>
                <h2>欢迎使用红包 DApp</h2>
                <p>连接您的钱包开始使用去中心化红包功能</p>
                <ul className="feature-list">
                  <li>✨ 创建等额或随机红包</li>
                  <li>🎲 参与抢红包活动</li>
                  <li>🔒 安全的智能合约保障</li>
                  <li>⚡ 快速的链上交易</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 底部信息 */}
      <footer className="app-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-info">
              <p>红包 DApp - Webpack 版本</p>
              <p>基于 React + Ethers.js + Web3 技术栈</p>
            </div>
            <div className="footer-links">
              <a href="https://github.com/ObjBird/red-packet-dapp-webpack" 
                 target="_blank" 
                 rel="noopener noreferrer">
                📁 源代码
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* 全局加载状态 */}
      {(web3.isConnecting || contract.loading) && (
        <div className="global-loading">
          <div className="loading-backdrop">
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>
                {web3.isConnecting ? '连接钱包中...' : '处理交易中...'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;

import React, { useState } from 'react';
import { useRedPacketDApp } from './hooks/useRedPacketDApp';
import WalletConnection from './components/WalletConnection';
import CreateRedPacket from './components/CreateRedPacket';
import ClaimRedPackets from './components/ClaimRedPackets';
import './styles/App.css';

const App = () => {
  const [activeTab, setActiveTab] = useState('create');
  
  // 使用合并的 DApp hook
  const dapp = useRedPacketDApp();

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
            <p>基于以太坊的去中心化红包系统 (Web3-React 版本)</p>
          </div>
          
          {/* 网络状态指示 */}
          {dapp.isConnected && (
            <div className="network-info">
              <div className="network-badge">
                🌐 Chain ID: {dapp.chainId}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* 钱包连接区域 */}
      <section className="wallet-section">
        <div className="container">
          <WalletConnection web3={dapp} />
        </div>
      </section>

      {/* 主要内容区域 */}
      <main className="main-content">
        <div className="container">
          {dapp.isConnected ? (
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
                  <CreateRedPacket web3={dapp} contract={dapp} />
                ) : (
                  <ClaimRedPackets web3={dapp} contract={dapp} />
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
                <div className="tech-stack">
                  <p>技术栈：React + Web3-React + Ethers.js</p>
                </div>
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
              <p>红包 DApp - Web3-React 版本</p>
              <p>基于 React + Web3-React + Ethers.js 技术栈</p>
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
      {(dapp.isConnecting || dapp.contractLoading) && (
        <div className="global-loading">
          <div className="loading-backdrop">
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>
                {dapp.isConnecting ? '连接钱包中...' : '处理交易中...'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
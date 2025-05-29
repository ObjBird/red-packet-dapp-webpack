import React from 'react';
import ReactDOM from 'react-dom/client';
import { Web3ReactProvider } from '@web3-react/core';
import App from './App';
import { connectors } from './config/connectors';

// 检查是否支持 Web3
const checkWeb3Support = () => {
  if (typeof window.ethereum === 'undefined') {
    console.warn('请安装 MetaMask 钱包以使用此应用');
  }
};

// 初始化应用
const initApp = () => {
  checkWeb3Support();

  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <Web3ReactProvider connectors={connectors}>
        <App />
      </Web3ReactProvider>
    </React.StrictMode>
  );
};

// 启动应用
initApp();

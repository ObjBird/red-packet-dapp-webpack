import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

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
      <App />
    </React.StrictMode>
  );
};

// 启动应用
initApp();

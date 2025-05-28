import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const WalletConnection = ({ web3 }) => {
  const [balance, setBalance] = useState('0.00');

  const {
    account,
    isConnected,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
    switchAccount,
    getBalance
  } = web3;

  // 更新余额
  useEffect(() => {
    const updateBalance = async () => {
      if (isConnected && account) {
        const bal = await getBalance(account);
        setBalance(parseFloat(bal).toFixed(4));
      }
    };
    
    updateBalance();
  }, [isConnected, account, getBalance]);

  if (!isConnected) {
    return (
      <div className="wallet-section">
        <div className="wallet-card">
          <h3>连接钱包</h3>
          <p>请连接您的 MetaMask 钱包以使用红包功能</p>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <button
            className={`connect-btn ${isConnecting ? 'loading' : ''}`}
            onClick={connectWallet}
            disabled={isConnecting}
          >
            {isConnecting ? '连接中...' : '连接 MetaMask'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="wallet-section">
      <div className="wallet-card connected">
        <div className="wallet-info">
          <div className="account-info">
            <div className="account-label">钱包地址</div>
            <div className="account-address">
              {account.slice(0, 6)}...{account.slice(-4)}
            </div>
          </div>
          
          <div className="balance-info">
            <div className="balance-label">余额</div>
            <div className="balance-amount">
              {balance} ETH
            </div>
          </div>
        </div>

        <div className="wallet-actions">
          <button
            className="switch-btn"
            onClick={switchAccount}
          >
            切换账户
          </button>
          <button
            className="disconnect-btn"
            onClick={disconnectWallet}
          >
            断开连接
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletConnection;

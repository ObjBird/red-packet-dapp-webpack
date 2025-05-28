import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

export const useWeb3 = () => {
  const [web3State, setWeb3State] = useState({
    account: null,
    provider: null,
    signer: null,
    chainId: null,
    isConnected: false,
    isConnecting: false,
    error: null
  });

  // 检查钱包是否已连接
  const checkConnection = useCallback(async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          await connectWallet();
        }
      } catch (error) {
        console.error('检查连接状态失败:', error);
      }
    }
  }, []);

  // 连接钱包
  const connectWallet = useCallback(async () => {
    if (typeof window.ethereum === 'undefined') {
      setWeb3State(prev => ({
        ...prev,
        error: '请安装 MetaMask 钱包'
      }));
      return;
    }

    try {
      setWeb3State(prev => ({ ...prev, isConnecting: true, error: null }));

      // 请求连接账户
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });

      // 创建 provider 和 signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();

      setWeb3State({
        account: accounts[0],
        provider,
        signer,
        chainId: Number(network.chainId),
        isConnected: true,
        isConnecting: false,
        error: null
      });

      // 设置事件监听器
      setupEventListeners();

    } catch (error) {
      console.error('连接钱包失败:', error);
      setWeb3State(prev => ({
        ...prev,
        isConnecting: false,
        error: error.code === 4001 ? '用户拒绝连接' : error.message
      }));
    }
  }, []);

  // 断开连接
  const disconnectWallet = useCallback(() => {
    // 移除事件监听器
    if (window.ethereum) {
      window.ethereum.removeAllListeners('accountsChanged');
      window.ethereum.removeAllListeners('chainChanged');
    }

    setWeb3State({
      account: null,
      provider: null,
      signer: null,
      chainId: null,
      isConnected: false,
      isConnecting: false,
      error: null
    });
  }, []);

  // 切换账户
  const switchAccount = useCallback(async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }]
      });
      await connectWallet();
    } catch (error) {
      setWeb3State(prev => ({
        ...prev,
        error: error.code === 4001 ? '用户取消操作' : error.message
      }));
    }
  }, [connectWallet]);

  // 设置事件监听器
  const setupEventListeners = useCallback(() => {
    if (!window.ethereum) return;

    // 账户变化
    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        setWeb3State(prev => ({ ...prev, account: accounts[0] }));
      }
    };

    // 网络变化
    const handleChainChanged = (chainId) => {
      setWeb3State(prev => ({ ...prev, chainId: parseInt(chainId, 16) }));
      // 建议页面刷新以避免状态问题
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    // 清理函数
    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [disconnectWallet]);

  // 获取余额
  const getBalance = useCallback(async (address) => {
    if (!web3State.provider || !address) return '0';
    
    try {
      const balance = await web3State.provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('获取余额失败:', error);
      return '0';
    }
  }, [web3State.provider]);

  // 初始化检查
  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  return {
    ...web3State,
    connectWallet,
    disconnectWallet,
    switchAccount,
    getBalance
  };
};

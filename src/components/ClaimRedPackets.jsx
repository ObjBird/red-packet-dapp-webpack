import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const ClaimRedPackets = ({ web3, contract }) => {
  const [packets, setPackets] = useState([]);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [refreshing, setRefreshing] = useState(false);

  const { isConnected, account } = web3;
  const { getRedPacketList, claimRedPacket, checkHasClaimed, loading } = contract;

  // 加载红包列表
  const loadPackets = async () => {
    if (!isConnected) return;

    try {
      setRefreshing(true);
      setStatus({ type: '', message: '' });
      
      const packetList = await getRedPacketList(0, 20);
      
      // 为每个红包检查用户是否已领取
      const packetsWithClaimStatus = await Promise.all(
        packetList.map(async (packet) => {
          const hasClaimed = await checkHasClaimed(packet.id, account);
          return { ...packet, hasClaimed };
        })
      );
      
      setPackets(packetsWithClaimStatus);
      
      if (packetList.length === 0) {
        setStatus({ type: 'info', message: '暂无红包，快去创建第一个红包吧！' });
      }
    } catch (error) {
      console.error('加载红包列表失败:', error);
      setStatus({ type: 'error', message: '加载失败: ' + error.message });
    } finally {
      setRefreshing(false);
    }
  };

  // 抢红包
  const handleClaimPacket = async (packetId) => {
    try {
      setStatus({ type: 'info', message: '正在抢红包...' });
      
      const result = await claimRedPacket(packetId);
      
      if (result.success) {
        setStatus({ 
          type: 'success', 
          message: `恭喜！成功领取 ${result.claimedAmount || '未知'} ETH` 
        });
        
        // 刷新列表
        setTimeout(() => {
          loadPackets();
        }, 2000);
      }
    } catch (error) {
      console.error('抢红包失败:', error);
      setStatus({ type: 'error', message: `抢红包失败: ${error.message}` });
    }
  };

  // 获取按钮状态和文本
  const getButtonState = (packet) => {
    if (!isConnected) return { disabled: true, text: '请连接钱包' };
    if (!packet.isActive) return { disabled: true, text: '已结束' };
    if (packet.remainCount === 0) return { disabled: true, text: '已抢完' };
    if (packet.creator.toLowerCase() === account?.toLowerCase()) {
      return { disabled: true, text: '自己的红包' };
    }
    if (packet.hasClaimed) return { disabled: true, text: '已领取' };
    return { disabled: false, text: '抢红包' };
  };

  // 格式化时间
  const formatTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // 初始加载
  useEffect(() => {
    if (isConnected) {
      loadPackets();
    }
  }, [isConnected, account]);

  const clearStatus = () => {
    setStatus({ type: '', message: '' });
  };

  return (
    <div className="claim-section">
      <div className="section-header">
        <h2>💰 抢红包</h2>
        <p>参与红包活动，看看你的手气如何</p>
      </div>

      {status.message && (
        <div className={`status-message ${status.type}`} onClick={clearStatus}>
          {status.message}
          <span className="close-btn">×</span>
        </div>
      )}

      <div className="controls">
        <button
          className={`refresh-btn ${refreshing ? 'loading' : ''}`}
          onClick={loadPackets}
          disabled={refreshing || !isConnected}
        >
          {refreshing ? '刷新中...' : '🔄 刷新列表'}
        </button>
      </div>

      <div className="packets-container">
        {packets.length === 0 && !refreshing ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>暂无红包</h3>
            <p>还没有人发红包呢，要不你来发第一个？</p>
          </div>
        ) : (
          <div className="packets-grid">
            {packets.map((packet) => {
              const buttonState = getButtonState(packet);
              
              return (
                <div key={packet.id} className="packet-card">
                  <div className="packet-header">
                    <div className="packet-type">
                      <span className={`type-badge ${packet.packetType === 0 ? 'equal' : 'random'}`}>
                        {packet.packetType === 0 ? '等额' : '随机'}
                      </span>
                      <span className="packet-id">#{packet.id}</span>
                    </div>
                    <div className={`packet-status ${packet.isActive ? 'active' : 'inactive'}`}>
                      {packet.isActive ? '🟢 进行中' : '🔴 已结束'}
                    </div>
                  </div>

                  <div className="packet-amount">
                    <span className="amount-label">总金额</span>
                    <span className="amount-value">
                      {ethers.formatEther(packet.totalAmount)} ETH
                    </span>
                  </div>

                  <div className="packet-info">
                    <div className="info-row">
                      <span>剩余个数</span>
                      <span>{packet.remainCount} 个</span>
                    </div>
                    <div className="info-row">
                      <span>创建者</span>
                      <span className="address">
                        {packet.creator.slice(0, 6)}...{packet.creator.slice(-4)}
                      </span>
                    </div>
                  </div>

                  {packet.message && (
                    <div className="packet-message">
                      <div className="message-icon">💬</div>
                      <div className="message-text">{packet.message}</div>
                    </div>
                  )}

                  <button
                    className={`claim-btn ${buttonState.disabled ? 'disabled' : ''}`}
                    onClick={() => handleClaimPacket(packet.id)}
                    disabled={buttonState.disabled || loading}
                  >
                    {loading ? '处理中...' : buttonState.text}
                  </button>

                  {packet.hasClaimed && (
                    <div className="claimed-badge">
                      ✅ 已领取
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {refreshing && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>加载中...</p>
        </div>
      )}
    </div>
  );
};

export default ClaimRedPackets;

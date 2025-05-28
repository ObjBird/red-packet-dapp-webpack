import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/constants';

export const useRedPacketContract = (signer) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 获取合约实例
  const getContract = useCallback(() => {
    if (!signer) return null;
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  }, [signer]);

  // 创建红包
  const createRedPacket = useCallback(async (packetData) => {
    const contract = getContract();
    if (!contract) {
      throw new Error('请先连接钱包');
    }

    try {
      setLoading(true);
      setError(null);

      const { count, message, packetType, totalAmount } = packetData;
      
      const tx = await contract.createRedPacket(
        count,
        message || '恭喜发财！',
        packetType,
        { 
          value: ethers.parseEther(totalAmount.toString()),
          gasLimit: 300000 // 设置 gas limit
        }
      );

      console.log('交易已发送:', tx.hash);
      const receipt = await tx.wait();
      console.log('交易已确认:', receipt);

      // 解析事件
      const event = receipt.logs.find(log => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed.name === 'PacketCreated';
        } catch {
          return false;
        }
      });

      let packetId = null;
      if (event) {
        const parsed = contract.interface.parseLog(event);
        packetId = parsed.args.packetId.toString();
      }

      return { success: true, packetId, txHash: tx.hash };
    } catch (error) {
      console.error('创建红包失败:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [getContract]);

  // 抢红包
  const claimRedPacket = useCallback(async (packetId) => {
    const contract = getContract();
    if (!contract) {
      throw new Error('请先连接钱包');
    }

    try {
      setLoading(true);
      setError(null);

      const tx = await contract.claimRedPacket(packetId, {
        gasLimit: 200000
      });

      console.log('抢红包交易已发送:', tx.hash);
      const receipt = await tx.wait();
      console.log('抢红包交易已确认:', receipt);

      // 解析事件获取领取金额
      const event = receipt.logs.find(log => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed.name === 'PacketClaimed';
        } catch {
          return false;
        }
      });

      let claimedAmount = null;
      if (event) {
        const parsed = contract.interface.parseLog(event);
        claimedAmount = ethers.formatEther(parsed.args.amount);
      }

      return { success: true, claimedAmount, txHash: tx.hash };
    } catch (error) {
      console.error('抢红包失败:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [getContract]);

  // 获取红包列表
  const getRedPacketList = useCallback(async (start = 0, limit = 10) => {
    const contract = getContract();
    if (!contract) return [];

    try {
      setLoading(true);
      setError(null);

      // 获取总数
      const total = await contract.getTotalPackets();
      if (total === 0n) return [];

      // 计算查询范围
      const totalNum = Number(total);
      const actualStart = Math.max(0, totalNum - limit);
      const actualLimit = Math.min(limit, totalNum);

      const result = await contract.getPacketList(actualStart, actualLimit);
      
      const packets = [];
      for (let i = result.ids.length - 1; i >= 0; i--) {
        packets.push({
          id: Number(result.ids[i]),
          creator: result.creators[i],
          totalAmount: result.totalAmounts[i],
          remainCount: Number(result.remainCounts[i]),
          message: result.messages[i],
          isActive: result.isActives[i],
          packetType: Number(result.packetTypes[i])
        });
      }

      return packets;
    } catch (error) {
      console.error('获取红包列表失败:', error);
      setError(error.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [getContract]);

  // 检查是否已领取
  const checkHasClaimed = useCallback(async (packetId, userAddress) => {
    const contract = getContract();
    if (!contract || !userAddress) return false;

    try {
      return await contract.hasClaimed(packetId, userAddress);
    } catch (error) {
      console.error('检查领取状态失败:', error);
      return false;
    }
  }, [getContract]);

  // 获取红包详情
  const getPacketInfo = useCallback(async (packetId) => {
    const contract = getContract();
    if (!contract) return null;

    try {
      const info = await contract.getPacketInfo(packetId);
      return {
        creator: info.creator,
        totalAmount: info.totalAmount,
        remainAmount: info.remainAmount,
        totalCount: Number(info.totalCount),
        remainCount: Number(info.remainCount),
        message: info.message,
        isActive: info.isActive,
        createTime: Number(info.createTime),
        packetType: Number(info.packetType)
      };
    } catch (error) {
      console.error('获取红包详情失败:', error);
      return null;
    }
  }, [getContract]);

  return {
    loading,
    error,
    createRedPacket,
    claimRedPacket,
    getRedPacketList,
    checkHasClaimed,
    getPacketInfo
  };
};

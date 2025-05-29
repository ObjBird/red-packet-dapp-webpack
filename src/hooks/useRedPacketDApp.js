import { useCallback, useEffect, useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import { ethers } from 'ethers';
import { metaMask, hooks } from '../config/connectors';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/constants';
import { safeFormatEther } from '../utils/bigNumberUtils';

/**
 * 统一的红包 DApp Hook
 * 集成了 Web3 连接和红包合约功能
 */
export const useRedPacketDApp = () => {
    // Web3React 状态
    const { connector, account, isActive, provider, chainId } = useWeb3React();

    // 本地状态
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState(null);
    const [signer, setSigner] = useState(null);
    const [contractLoading, setContractLoading] = useState(false);
    const [contractError, setContractError] = useState(null);

    // ==================== Web3 连接功能 ====================

    // 连接钱包
    const connectWallet = useCallback(async () => {
        if (isActive) return;

        try {
            setIsConnecting(true);
            setError(null);
            await metaMask.activate();
        } catch (error) {
            console.error('连接钱包失败:', error);
            setError(error.code === 4001 ? '用户拒绝连接' : error.message);
        } finally {
            setIsConnecting(false);
        }
    }, [isActive]);

    // 断开连接
    const disconnectWallet = useCallback(async () => {
        try {
            if (connector?.deactivate) {
                await connector.deactivate();
            } else {
                await connector.resetState();
            }
            setSigner(null);
            setError(null);
        } catch (error) {
            console.error('断开连接失败:', error);
        }
    }, [connector]);

    // 切换账户
    const switchAccount = useCallback(async () => {
        try {
            if (window.ethereum) {
                await window.ethereum.request({
                    method: 'wallet_requestPermissions',
                    params: [{ eth_accounts: {} }]
                });
            }
        } catch (error) {
            setError(error.code === 4001 ? '用户取消操作' : error.message);
        }
    }, []);

    // 获取余额
    const getBalance = useCallback(async (address) => {
        if (!provider || !address) return '0';

        try {
            const balance = await provider.getBalance(address);
            return safeFormatEther(balance);
        } catch (error) {
            console.error('获取余额失败:', error);
            return '0';
        }
    }, [provider]);

    // ==================== 合约功能 ====================

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
            setContractLoading(true);
            setContractError(null);

            const { count, message, packetType, totalAmount } = packetData;

            const tx = await contract.createRedPacket(
                count,
                message || '恭喜发财！',
                packetType,
                {
                    value: ethers.parseEther(totalAmount.toString()),
                    gasLimit: 300000
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
            setContractError(error.message);
            throw error;
        } finally {
            setContractLoading(false);
        }
    }, [getContract]);

    // 抢红包
    const claimRedPacket = useCallback(async (packetId) => {
        const contract = getContract();
        if (!contract) {
            throw new Error('请先连接钱包');
        }

        try {
            setContractLoading(true);
            setContractError(null);

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
                claimedAmount = safeFormatEther(parsed.args.amount);
            }

            return { success: true, claimedAmount, txHash: tx.hash };
        } catch (error) {
            console.error('抢红包失败:', error);
            setContractError(error.message);
            throw error;
        } finally {
            setContractLoading(false);
        }
    }, [getContract]);

    // 获取红包列表
    const getRedPacketList = useCallback(async (start = 0, limit = 10) => {
        const contract = getContract();
        if (!contract) return [];

        try {
            setContractLoading(true);
            setContractError(null);

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
            setContractError(error.message);
            return [];
        } finally {
            setContractLoading(false);
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

    // ==================== Effects ====================

    // 更新 signer
    useEffect(() => {
        if (provider && account && isActive) {
            try {
                const signerInstance = provider.getSigner();
                setSigner(signerInstance);
            } catch (error) {
                console.error('获取 signer 失败:', error);
                setSigner(null);
            }
        } else {
            setSigner(null);
        }
    }, [provider, account, isActive]);

    // 自动连接（如果之前已连接）
    useEffect(() => {
        const tryAutoConnect = async () => {
            try {
                await metaMask.connectEagerly();
            } catch (error) {
                console.log('自动连接失败:', error);
            }
        };

        tryAutoConnect();
    }, []);

    // ==================== 返回值 ====================

    return {
        // Web3 状态
        account,
        provider,
        signer,
        chainId,
        isConnected: isActive,
        isConnecting,
        error,

        // Web3 方法
        connectWallet,
        disconnectWallet,
        switchAccount,
        getBalance,

        // 合约状态
        contractLoading,
        contractError,

        // 合约方法
        createRedPacket,
        claimRedPacket,
        getRedPacketList,
        checkHasClaimed,
        getPacketInfo,

        // 组合状态（兼容性）
        loading: isConnecting || contractLoading,
    };
};

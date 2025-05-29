import { ethers } from 'ethers';

/**
 * 处理不同版本的 BigNumber 兼容性问题
 * @param {any} value - 可能是 BigNumber 对象或其他值
 * @returns {string|number} - 标准化后的值
 */
export const normalizeBigNumber = (value) => {
    if (!value) return '0';

    // 如果是对象类型（可能是 BigNumber）
    if (typeof value === 'object') {
        // 优先使用 hex 属性（旧版本 BigNumber）
        if (value.hex) {
            return value.hex;
        }
        // 其次使用 toString 方法
        if (value.toString && typeof value.toString === 'function') {
            return value.toString();
        }
        // 如果有 _hex 属性（某些版本的 BigNumber）
        if (value._hex) {
            return value._hex;
        }
    }

    // 直接返回原值
    return value;
};

/**
 * 安全地格式化 Ether 值
 * @param {any} value - 要格式化的值
 * @returns {string} - 格式化后的 Ether 字符串
 */
export const safeFormatEther = (value) => {
    try {
        const normalizedValue = normalizeBigNumber(value);
        return ethers.formatEther(normalizedValue);
    } catch (error) {
        console.error('格式化 Ether 失败:', error, '原值:', value);
        return '0';
    }
};

/**
 * 安全地解析 Ether 值
 * @param {string} value - 要解析的 Ether 字符串
 * @returns {bigint} - 解析后的 wei 值
 */
export const safeParseEther = (value) => {
    try {
        return ethers.parseEther(value.toString());
    } catch (error) {
        console.error('解析 Ether 失败:', error, '原值:', value);
        return 0n;
    }
}; 
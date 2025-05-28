import React, { useState } from 'react';
import { PACKET_TYPES } from '../config/constants';

const CreateRedPacket = ({ web3, contract }) => {
  const [formData, setFormData] = useState({
    packetType: PACKET_TYPES.EQUAL,
    totalAmount: '',
    count: '',
    message: ''
  });
  
  const [status, setStatus] = useState({ type: '', message: '' });
  const { isConnected } = web3;
  const { createRedPacket, loading } = contract;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.totalAmount || parseFloat(formData.totalAmount) <= 0) {
      setStatus({ type: 'error', message: '请输入有效的金额' });
      return false;
    }
    
    if (!formData.count || parseInt(formData.count) <= 0 || parseInt(formData.count) > 100) {
      setStatus({ type: 'error', message: '红包个数必须在 1-100 之间' });
      return false;
    }

    // 等额红包验证
    if (formData.packetType === PACKET_TYPES.EQUAL) {
      const amount = parseFloat(formData.totalAmount);
      const count = parseInt(formData.count);
      if (amount < count * 0.000000000000000001) { // 最小单位检查
        setStatus({ type: 'error', message: '等额红包金额过小' });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isConnected) {
      setStatus({ type: 'error', message: '请先连接钱包' });
      return;
    }

    if (!validateForm()) return;

    try {
      setStatus({ type: 'info', message: '正在创建红包...' });
      
      const result = await createRedPacket({
        count: parseInt(formData.count),
        message: formData.message || '恭喜发财！',
        packetType: parseInt(formData.packetType),
        totalAmount: formData.totalAmount
      });

      if (result.success) {
        setStatus({ 
          type: 'success', 
          message: `红包创建成功！${result.packetId ? `红包 ID: ${result.packetId}` : ''}` 
        });
        
        // 重置表单
        setFormData({
          packetType: PACKET_TYPES.EQUAL,
          totalAmount: '',
          count: '',
          message: ''
        });
      }
    } catch (error) {
      console.error('创建红包失败:', error);
      setStatus({ type: 'error', message: `创建失败: ${error.message}` });
    }
  };

  const clearStatus = () => {
    setStatus({ type: '', message: '' });
  };

  return (
    <div className="create-section">
      <div className="section-header">
        <h2>🧧 发红包</h2>
        <p>创建红包分享给朋友们</p>
      </div>

      {status.message && (
        <div className={`status-message ${status.type}`} onClick={clearStatus}>
          {status.message}
          <span className="close-btn">×</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="create-form">
        <div className="form-group">
          <label htmlFor="packetType">红包类型</label>
          <select
            id="packetType"
            name="packetType"
            value={formData.packetType}
            onChange={handleInputChange}
            className="form-select"
          >
            <option value={PACKET_TYPES.EQUAL}>等额红包</option>
            <option value={PACKET_TYPES.RANDOM}>随机红包</option>
          </select>
          <small className="form-hint">
            {formData.packetType === PACKET_TYPES.EQUAL 
              ? '每个红包金额相等' 
              : '每个红包金额随机'
            }
          </small>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="totalAmount">总金额 (ETH)</label>
            <input
              id="totalAmount"
              name="totalAmount"
              type="number"
              step="0.001"
              min="0"
              value={formData.totalAmount}
              onChange={handleInputChange}
              placeholder="0.1"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="count">红包个数</label>
            <input
              id="count"
              name="count"
              type="number"
              min="1"
              max="100"
              value={formData.count}
              onChange={handleInputChange}
              placeholder="5"
              className="form-input"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="message">祝福语</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            placeholder="恭喜发财，大吉大利！"
            maxLength="100"
            rows="3"
            className="form-textarea"
          />
          <small className="form-hint">
            {formData.message.length}/100 字符
          </small>
        </div>

        {formData.totalAmount && formData.count && (
          <div className="preview-section">
            <h4>红包预览</h4>
            <div className="preview-info">
              <span>类型: {formData.packetType === PACKET_TYPES.EQUAL ? '等额' : '随机'}</span>
              <span>总金额: {formData.totalAmount} ETH</span>
              <span>个数: {formData.count} 个</span>
              {formData.packetType === PACKET_TYPES.EQUAL && (
                <span>单个: {(parseFloat(formData.totalAmount) / parseInt(formData.count)).toFixed(6)} ETH</span>
              )}
            </div>
          </div>
        )}

        <button
          type="submit"
          className={`submit-btn ${loading ? 'loading' : ''}`}
          disabled={loading || !isConnected}
        >
          {loading ? '创建中...' : '发红包 🧧'}
        </button>
      </form>
    </div>
  );
};

export default CreateRedPacket;

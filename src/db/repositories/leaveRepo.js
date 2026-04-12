/**
 * 请假申请数据访问层
 */
import { BaseRepository } from './BaseRepository';
import dayjs from 'dayjs';

class LeaveRepository extends BaseRepository {
  constructor() {
    super('leaves');
  }

  /**
   * 根据用户ID查询
   * @param {number} userId
   * @returns {Promise<Array>}
   */
  async findByUserId(userId) {
    return this.findByIndex('userId', userId);
  }

  /**
   * 根据状态查询
   * @param {string} status
   * @returns {Promise<Array>}
   */
  async findByStatus(status) {
    return this.findByIndex('status', status);
  }

  /**
   * 查询所有待审批的请假申请
   * @returns {Promise<Array>}
   */
  async findPending() {
    return this.findByStatus('pending');
  }

  /**
   * 审批请假申请
   * @param {number} id
   * @param {boolean} approved
   * @param {string} comment
   * @param {number} approverId
   */
  async approve(id, approved, comment, approverId) {
    return this.update(id, {
      status: approved ? 'approved' : 'rejected',
      approvalComment: comment,
      approvedBy: approverId,
      approvedAt: new Date()
    });
  }

  /**
   * 检查日期范围内是否已有请假
   * @param {number} userId
   * @param {string} startDate
   * @param {string} endDate
   * @param {number} excludeId
   * @returns {Promise<Object|null>}
   */
  async checkOverlap(userId, startDate, endDate, excludeId = null) {
    const leaves = await this.findByUserId(userId);

    for (const leave of leaves) {
      if (excludeId && leave.id === excludeId) continue;
      if (leave.status === 'rejected') continue;

      // 检查日期重叠
      if (startDate <= leave.endDate && endDate >= leave.startDate) {
        return leave;
      }
    }

    return null;
  }

  /**
   * 计算请假天数
   * @param {string} startDate
   * @param {string} endDate
   * @returns {number}
   */
  calculateDays(startDate, endDate) {
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    return end.diff(start, 'day') + 1;
  }

  /**
   * 获取用户指定日期范围内的请假记录
   * @param {number} userId
   * @param {string} month 'YYYY-MM'
   * @returns {Promise<Array>}
   */
  async findByUserAndMonth(userId, month) {
    const leaves = await this.findByUserId(userId);
    return leaves.filter(l => {
      if (l.status !== 'approved') return false;
      return l.startDate.startsWith(month) || l.endDate.startsWith(month) ||
             (l.startDate < `${month}-01` && l.endDate > `${month}-31`);
    });
  }

  /**
   * 获取用户的申请（按创建时间倒序）
   * @param {number} userId
   * @returns {Promise<Array>}
   */
  async findByUserIdOrdered(userId) {
    const leaves = await this.findByUserId(userId);
    return leaves.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
}

export const leaveRepo = new LeaveRepository();
export default leaveRepo;

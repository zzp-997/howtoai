/**
 * 差旅申请数据访问层
 */
import { BaseRepository } from './BaseRepository';

class TripRepository extends BaseRepository {
  constructor() {
    super('trips');
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
   * @param {string} status 'pending' | 'approved' | 'rejected'
   * @returns {Promise<Array>}
   */
  async findByStatus(status) {
    return this.findByIndex('status', status);
  }

  /**
   * 查询所有待审批的差旅申请
   * @returns {Promise<Array>}
   */
  async findPending() {
    return this.findByStatus('pending');
  }

  /**
   * 审批差旅申请
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
   * 统计差旅费用
   * @param {string} status 可选，按状态筛选
   * @returns {Promise<Object>}
   */
  async calculateTotalFee(status = null) {
    let trips;
    if (status) {
      trips = await this.findByStatus(status);
    } else {
      trips = await this.findAll();
    }

    const totalTransport = trips.reduce((sum, t) => sum + (t.estTransportFee || 0), 0);
    const totalAccom = trips.reduce((sum, t) => sum + (t.estAccomFee || 0), 0);

    return {
      count: trips.length,
      totalTransport,
      totalAccom,
      total: totalTransport + totalAccom
    };
  }

  /**
   * 获取用户的申请（按创建时间倒序）
   * @param {number} userId
   * @returns {Promise<Array>}
   */
  async findByUserIdOrdered(userId) {
    const trips = await this.findByUserId(userId);
    return trips.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
}

export const tripRepo = new TripRepository();
export default tripRepo;

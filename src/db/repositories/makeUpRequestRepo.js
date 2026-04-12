/**
 * 补卡申请数据访问层
 */
import { BaseRepository } from './BaseRepository';

class MakeUpRequestRepository extends BaseRepository {
  constructor() {
    super('make_up_requests');
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
   * 查询所有待审批的补卡申请
   * @returns {Promise<Array>}
   */
  async findPending() {
    return this.findByStatus('pending');
  }

  /**
   * 审批补卡申请
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
   * 获取用户的申请（按创建时间倒序）
   * @param {number} userId
   * @returns {Promise<Array>}
   */
  async findByUserIdOrdered(userId) {
    const requests = await this.findByUserId(userId);
    return requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
}

export const makeUpRequestRepo = new MakeUpRequestRepository();
export default makeUpRequestRepo;

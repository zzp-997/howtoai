/**
 * 报销单数据访问层
 */
import { BaseRepository } from './BaseRepository';

class ExpenseClaimRepository extends BaseRepository {
  constructor() {
    super('expense_claims');
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
   * 根据差旅ID查询
   * @param {number} tripId
   * @returns {Promise<Object|null>}
   */
  async findByTripId(tripId) {
    const results = await this.findByIndex('tripId', tripId);
    return results[0] || null;
  }

  /**
   * 根据状态查询
   * @param {string} status 'draft' | 'submitted' | 'approved'
   * @returns {Promise<Array>}
   */
  async findByStatus(status) {
    return this.findByIndex('status', status);
  }

  /**
   * 创建报销单
   * @param {Object} data
   * @returns {Promise<number>}
   */
  async createClaim(data) {
    return this.create({
      ...data,
      status: data.status || 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  /**
   * 更新报销单
   * @param {number} id
   * @param {Object} data
   * @returns {Promise<void>}
   */
  async updateClaim(id, data) {
    return this.update(id, {
      ...data,
      updatedAt: new Date()
    });
  }

  /**
   * 计算总金额
   * @param {Object} expenseClaim
   * @returns {number}
   */
  calculateTotal(expenseClaim) {
    if (!expenseClaim?.expenses) return 0;
    return expenseClaim.expenses.reduce((sum, e) => sum + (e.actual || 0), 0);
  }

  /**
   * 提交报销单
   * @param {number} id
   * @returns {Promise<void>}
   */
  async submitClaim(id) {
    const claim = await this.findById(id);
    if (!claim) throw new Error('报销单不存在');

    const totalActual = this.calculateTotal(claim);
    if (totalActual <= 0) throw new Error('请填写实际费用');

    return this.update(id, {
      status: 'submitted',
      totalActual,
      submittedAt: new Date(),
      updatedAt: new Date()
    });
  }

  /**
   * 获取用户的报销单（按创建时间倒序）
   * @param {number} userId
   * @returns {Promise<Array>}
   */
  async findByUserIdOrdered(userId) {
    const claims = await this.findByUserId(userId);
    return claims.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  /**
   * 获取草稿状态的报销单
   * @param {number} userId
   * @returns {Promise<Array>}
   */
  async findDraftsByUserId(userId) {
    const claims = await this.findByUserId(userId);
    return claims.filter(c => c.status === 'draft');
  }
}

export const expenseClaimRepo = new ExpenseClaimRepository();
export default expenseClaimRepo;

/**
 * 待办事项数据访问层
 */
import { BaseRepository } from './BaseRepository';

class TodoRepository extends BaseRepository {
  constructor() {
    super('todos');
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
   * 查询未完成的待办（按截止日期和优先级排序）
   * @param {number} userId
   * @returns {Promise<Array>}
   */
  async findPending(userId) {
    const todos = await this.findByUserId(userId);
    return todos.filter(t => t.status === 'pending').sort((a, b) => {
      // 有截止日期的按日期排序
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;
      // 都没有截止日期按优先级排序
      return a.priority - b.priority;
    });
  }

  /**
   * 查询已完成的待办
   * @param {number} userId
   * @returns {Promise<Array>}
   */
  async findCompleted(userId) {
    const todos = await this.findByUserId(userId);
    return todos.filter(t => t.status === 'completed').sort((a, b) => {
      return new Date(b.completedAt) - new Date(a.completedAt);
    });
  }

  /**
   * 切换完成状态
   * @param {number} id
   * @returns {Promise<void>}
   */
  async toggleComplete(id) {
    const todo = await this.findById(id);
    if (!todo) throw new Error('待办不存在');
    return this.update(id, {
      status: todo.status === 'completed' ? 'pending' : 'completed',
      completedAt: todo.status === 'pending' ? new Date() : null
    });
  }

  /**
   * 从审批创建待办
   * @param {number} userId
   * @param {string} type 业务类型
   * @param {string} title
   * @param {number} relatedId
   * @returns {Promise<number>}
   */
  async createFromApproval(userId, type, title, relatedId) {
    return this.create({
      userId,
      title,
      status: 'pending',
      priority: 2,
      relatedType: type,
      relatedId,
      createdAt: new Date()
    });
  }

  /**
   * 统计未完成数量
   * @param {number} userId
   * @returns {Promise<number>}
   */
  async countPending(userId) {
    const todos = await this.findByUserId(userId);
    return todos.filter(t => t.status === 'pending').length;
  }

  /**
   * 查询即将到期的待办（今天和明天）
   * @param {number} userId
   * @returns {Promise<Array>}
   */
  async findUpcoming(userId) {
    const todos = await this.findPending(userId);
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    return todos.filter(t => t.dueDate && (t.dueDate === today || t.dueDate === tomorrow));
  }
}

export const todoRepo = new TodoRepository();
export default todoRepo;

/**
 * 用户数据访问层
 */
import { BaseRepository } from './BaseRepository';

class UserRepository extends BaseRepository {
  constructor() {
    super('users');
  }

  /**
   * 根据用户名查询用户
   * @param {string} username
   * @returns {Promise<Object|null>}
   */
  async findByUsername(username) {
    return this.findOneByIndex('username', username);
  }

  /**
   * 根据角色查询用户
   * @param {string} role 'admin' | 'user'
   * @returns {Promise<Array>}
   */
  async findByRole(role) {
    return this.findByIndex('role', role);
  }

  /**
   * 用户登录验证
   * @param {string} username
   * @param {string} password
   * @returns {Promise<Object|null>}
   */
  async validateLogin(username, password) {
    const user = await this.findByUsername(username);
    if (user && user.password === password) {
      return user;
    }
    return null;
  }

  /**
   * 更新假期余额
   * @param {number} userId
   * @param {string} leaveType 'annual' | 'sick'
   * @param {number} days 变化量（正数增加，负数减少）
   */
  async updateLeaveBalance(userId, leaveType, days) {
    const user = await this.findById(userId);
    if (!user) throw new Error('用户不存在');

    if (leaveType === 'annual') {
      user.annualLeaveBalance = Math.max(0, user.annualLeaveBalance + days);
    } else if (leaveType === 'sick') {
      user.sickLeaveBalance = Math.max(0, user.sickLeaveBalance + days);
    }

    await this.replace(user);
    return user;
  }
}

export const userRepo = new UserRepository();
export default userRepo;

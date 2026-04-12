/**
 * 用户状态管理
 * 改为 IndexedDB 本地验证
 */
import { defineStore } from "pinia";
import { userRepo } from "@/db/repositories";

export const useUserStore = defineStore("user", {
  state: () => ({
    userInfo: null,      // 当前登录用户信息
    role: null,          // 当前角色 'user' | 'admin'
    isLoggedIn: false    // 登录状态
  }),
  getters: {
    // 是否是管理员
    isAdmin: (state) => state.role === 'admin',
    // 用户ID
    userId: (state) => state.userInfo?.id || null,
    // 用户名
    username: (state) => state.userInfo?.username || '',
    // 姓名
    name: (state) => state.userInfo?.name || '',
    // 年假余额
    annualLeaveBalance: (state) => state.userInfo?.annualLeaveBalance || 0,
    // 病假余额
    sickLeaveBalance: (state) => state.userInfo?.sickLeaveBalance || 0
  },
  actions: {
    /**
     * 登录验证
     * @param {string} username 用户名
     * @param {string} password 密码
     * @param {string} role 选择的角色
     */
    async login(username, password, role) {
      try {
        // 从 IndexedDB 验证
        const user = await userRepo.validateLogin(username, password);
        if (!user) {
          throw new Error('用户名或密码错误');
        }
        // 验证角色是否匹配
        if (user.role !== role) {
          throw new Error('角色不匹配，请选择正确的角色');
        }

        // 存储用户信息
        this.userInfo = {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
          annualLeaveBalance: user.annualLeaveBalance,
          sickLeaveBalance: user.sickLeaveBalance
        };
        this.role = user.role;
        this.isLoggedIn = true;

        return user;
      } catch (error) {
        throw error;
      }
    },

    /**
     * 退出登录
     */
    logout() {
      this.userInfo = null;
      this.role = null;
      this.isLoggedIn = false;
    },

    /**
     * 更新假期余额
     * @param {string} leaveType 'annual' | 'sick'
     * @param {number} days 变化量（负数为减少）
     */
    async updateLeaveBalance(leaveType, days) {
      if (!this.userInfo) return;

      const updatedUser = await userRepo.updateLeaveBalance(
        this.userInfo.id,
        leaveType,
        days
      );

      this.userInfo.annualLeaveBalance = updatedUser.annualLeaveBalance;
      this.userInfo.sickLeaveBalance = updatedUser.sickLeaveBalance;
    }
  },
  persist: {
    key: 'office_user',
    pick: ['userInfo', 'role', 'isLoggedIn']
  }
});
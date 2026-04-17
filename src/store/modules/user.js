/**
 * 用户状态管理
 * 对接 FastAPI 后端
 */
import { defineStore } from "pinia";
import { login as loginApi, logout as logoutApi, getUserInfo } from "@/api";

export const useUserStore = defineStore("user", {
  state: () => ({
    userInfo: null,      // 当前登录用户信息
    role: null,          // 当前角色 'user' | 'admin'
    token: null,         // JWT token
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
        // 调用后端登录 API
        const res = await loginApi({ username, password, loginType: 1 });

        if (!res || !res.data) {
          throw new Error('登录失败');
        }

        const { token, user } = res.data;

        // 验证角色是否匹配
        if (user.role !== role) {
          throw new Error('角色不匹配，请选择正确的角色');
        }

        // 存储 token 和用户信息
        this.token = token;
        this.userInfo = {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
          department: user.department,
          position: user.position,
          avatar: user.avatar,
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
    async logout() {
      try {
        await logoutApi();
      } catch (e) {
        console.warn('登出请求失败', e);
      }
      this.userInfo = null;
      this.role = null;
      this.token = null;
      this.isLoggedIn = false;
    },

    /**
     * 获取当前用户信息
     */
    async fetchUserInfo() {
      try {
        const res = await getUserInfo();
        if (res && res.data) {
          this.userInfo = res.data;
          this.role = res.data.role;
        }
        return res?.data;
      } catch (error) {
        throw error;
      }
    },

    /**
     * 更新假期余额
     * @param {string} leaveType 'annual' | 'sick'
     * @param {number} days 变化量（负数为减少）
     */
    updateLeaveBalance(leaveType, days) {
      if (!this.userInfo) return;

      if (leaveType === 'annual') {
        this.userInfo.annualLeaveBalance = Math.max(0, this.userInfo.annualLeaveBalance + days);
      } else if (leaveType === 'sick') {
        this.userInfo.sickLeaveBalance = Math.max(0, this.userInfo.sickLeaveBalance + days);
      }
    }
  },
  persist: {
    key: 'office_user',
    pick: ['userInfo', 'role', 'token', 'isLoggedIn']
  }
});
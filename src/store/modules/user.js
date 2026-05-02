/**
 * 用户状态管理
 * 对接 FastAPI 后端
 */
import { defineStore } from "pinia";
import { login as loginApi, logout as logoutApi, getUserInfo, refreshToken as refreshTokenApi } from "@/api";

/**
 * 解析JWT Token获取payload
 * @param {string} token - JWT token
 * @returns {Object|null} payload对象或null
 */
function parseJwt(token) {
  try {
    if (!token) return null;
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.warn('解析JWT Token失败:', e);
    return null;
  }
}

/**
 * 检查Token是否即将过期（5分钟内）
 * @param {string} token - JWT token
 * @returns {boolean} 是否即将过期
 */
function isTokenExpiringSoon(token) {
  const payload = parseJwt(token);
  if (!payload || !payload.exp) return false;

  const expiresAt = payload.exp * 1000; // 转换为毫秒
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000;

  return (expiresAt - now) < fiveMinutes;
}

/**
 * 获取Token剩余有效期（秒）
 * @param {string} token - JWT token
 * @returns {number} 剩余秒数，-1表示无效
 */
function getTokenRemainingTime(token) {
  const payload = parseJwt(token);
  if (!payload || !payload.exp) return -1;

  const expiresAt = payload.exp * 1000;
  const now = Date.now();

  return Math.max(0, Math.floor((expiresAt - now) / 1000));
}

export const useUserStore = defineStore("user", {
  state: () => ({
    userInfo: null,        // 当前登录用户信息
    role: null,            // 当前角色 'user' | 'admin'
    token: null,           // JWT access token
    refreshToken: null,    // JWT refresh token
    isLoggedIn: false,     // 登录状态
    isRefreshing: false    // 是否正在刷新Token
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

        const { accessToken: token, refreshToken, user, passwordExpiry } = res.data;

        // 验证角色是否匹配
        if (user.role !== role) {
          throw new Error('角色不匹配，请选择正确的角色');
        }

        // 存储 token 和用户信息
        this.token = token;
        this.refreshToken = refreshToken || null;
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

        // 存储refreshToken到localStorage
        if (refreshToken) {
          localStorage.setItem('office_refresh_token', refreshToken);
        }

        // 登录成功时清理公告展示标记，确保每次登录都会展示重要公告
        try {
          sessionStorage.removeItem('announcement_shown');
        } catch (e) {
          console.warn('清理公告标记失败:', e);
        }

        return { user, passwordExpiry };
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
      this.refreshToken = null;
      this.isLoggedIn = false;

      // 清除localStorage中的refreshToken
      localStorage.removeItem('office_refresh_token');
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
     * 刷新Token
     * @returns {Promise<boolean>} 刷新是否成功
     */
    async refreshAccessToken() {
      // 防止重复刷新
      if (this.isRefreshing) {
        return false;
      }

      // 优先使用内存中的refreshToken，其次从localStorage获取
      const rt = this.refreshToken || localStorage.getItem('office_refresh_token');
      if (!rt) {
        console.warn('没有可用的refreshToken');
        return false;
      }

      this.isRefreshing = true;

      try {
        const res = await refreshTokenApi(rt);

        if (res && res.data) {
          const { token, refreshToken: newRefreshToken } = res.data;
          this.token = token;

          // 如果返回了新的refreshToken，更新它
          if (newRefreshToken) {
            this.refreshToken = newRefreshToken;
            localStorage.setItem('office_refresh_token', newRefreshToken);
          }

          console.log('Token刷新成功');
          return true;
        }

        return false;
      } catch (error) {
        console.error('Token刷新失败:', error);

        // 刷新失败，清除状态，需要重新登录
        await this.logout();

        return false;
      } finally {
        this.isRefreshing = false;
      }
    },

    /**
     * 检查并刷新Token（如果即将过期）
     * @returns {Promise<boolean>} 是否需要刷新或刷新是否成功
     */
    async checkAndRefreshToken() {
      if (!this.token) return false;

      // 检查Token是否即将过期
      if (isTokenExpiringSoon(this.token)) {
        console.log('Token即将过期，自动刷新中...');
        return await this.refreshAccessToken();
      }

      return true;
    },

    /**
     * 获取Token剩余有效期（秒）
     * @returns {number} 剩余秒数
     */
    getTokenTimeToLive() {
      return getTokenRemainingTime(this.token);
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
    paths: ['userInfo', 'role', 'token', 'refreshToken', 'isLoggedIn']
  }
});

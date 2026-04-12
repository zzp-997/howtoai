import { defineStore } from "pinia";

export const usePermissionStore = defineStore("permission", {
  state: () => ({
    // 白名单路由 - 无需登录即可访问
    whiteListRouters: ['/login', '/404'],
    // 上一个路由信息
    previousRoute: null,
    // 动态路由
    asyncRoutes: [],
  }),
  getters: {
    getWhiteListRouters() {
      return this.whiteListRouters;
    },
    getPreviousRoute() {
      return this.previousRoute;
    },
    getAsyncRoutes() {
      return this.asyncRoutes;
    }
  },
  actions: {
    // 构建动态路由
    async buildAsyncRoutes() {
      // TODO: 根据用户权限动态生成路由
      return [];
    },
    // 重置路由
    restoreRoutes() {
      this.asyncRoutes = [];
      this.previousRoute = null;
    }
  },
  persist: {
    key: 'permission',
    pick: ['whiteListRouters']
  },
});

// 获取权限Store实例
export function getPermissionStore() {
  return usePermissionStore();
}
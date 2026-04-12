import 'nprogress/nprogress.css'; // progress bar style

import NProgress from 'nprogress'; // progress bar

import router from '@/router';
import { getPermissionStore, useUserStore, useSettingsStore } from '@/store';
import { showToast } from './utils/common/tools';
import { Dialog } from 'tdesign-mobile-vue';

NProgress.configure({ showSpinner: false });

router.beforeEach(async (to, from, next) => {
  NProgress.start();

  const permissionStore = getPermissionStore();
  const { whiteListRouters } = permissionStore;
  permissionStore.previousRoute = from;

  const userStore = useUserStore();

  // 使用 isLoggedIn 判断登录状态
  if (userStore.isLoggedIn) {
    if (to.path === '/login') {
      next();
      NProgress.done();
      return;
    }
    try {
      // 已登录，检查默认首页
      if (to.path === '/user' && !userStore.isAdmin) {
        const settingsStore = useSettingsStore();
        if (settingsStore.defaultPage && settingsStore.defaultPage !== '/user') {
          next(settingsStore.defaultPage);
          NProgress.done();
          return;
        }
      }
      next();
    } catch (error) {
      next({
        path: '/login',
        query: { redirect: encodeURIComponent(to.fullPath) },
      });
      NProgress.done();
    }
  } else {
    /* white list router */
    if (whiteListRouters.indexOf(to.path) !== -1) {
      next();
    } else {
      next({
        path: '/login',
        query: { redirect: encodeURIComponent(to.fullPath) },
      });
    }
    NProgress.done();
  }
});

router.afterEach(async (to) => {
  if (to.path === '/login') {
    const userStore = useUserStore();
    const permissionStore = getPermissionStore();

    await userStore.logout();
    await permissionStore.restoreRoutes();
  }
  NProgress.done();
});

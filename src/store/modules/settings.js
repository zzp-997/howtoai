/**
 * 设置状态管理
 * 主题、字体大小、紧凑模式、默认首页
 */
import { defineStore } from "pinia";

export const useSettingsStore = defineStore("settings", {
  state: () => ({
    theme: 'light',           // 'light' | 'dark' | 'system'
    fontSize: 'medium',       // 'small' | 'medium' | 'large'
    compactMode: false,       // 紧凑模式
    vibration: true,          // 震动反馈
    defaultPage: '/user',     // 默认首页
  }),
  getters: {
    // 实际主题（处理系统跟随）
    actualTheme: (state) => {
      if (state.theme === 'system') {
        if (typeof window !== 'undefined') {
          return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return 'light';
      }
      return state.theme;
    }
  },
  actions: {
    /**
     * 设置主题
     * @param {string} theme 'light' | 'dark' | 'system'
     */
    setTheme(theme) {
      this.theme = theme;
      this.applyTheme();
    },

    /**
     * 应用主题到 DOM
     */
    applyTheme() {
      const actualTheme = this.actualTheme;
      document.documentElement.setAttribute('data-theme', actualTheme);

      // 同时设置 color-scheme 让浏览器原生组件适配
      document.documentElement.style.colorScheme = actualTheme;
    },

    /**
     * 设置字体大小
     * @param {string} size 'small' | 'medium' | 'large'
     */
    setFontSize(size) {
      this.fontSize = size;
      this.applyFontSize();
    },

    /**
     * 应用字体大小到 DOM
     */
    applyFontSize() {
      document.documentElement.setAttribute('data-font-size', this.fontSize);
    },

    /**
     * 设置紧凑模式
     * @param {boolean} compact
     */
    setCompactMode(compact) {
      this.compactMode = compact;
      this.applyCompactMode();
    },

    /**
     * 应用紧凑模式到 DOM
     */
    applyCompactMode() {
      if (this.compactMode) {
        document.documentElement.setAttribute('data-compact', 'true');
      } else {
        document.documentElement.removeAttribute('data-compact');
      }
    },

    /**
     * 设置默认首页
     * @param {string} page
     */
    setDefaultPage(page) {
      this.defaultPage = page;
    },

    /**
     * 设置震动反馈
     * @param {boolean} enabled
     */
    setVibration(enabled) {
      this.vibration = enabled;
    },

    /**
     * 初始化所有设置
     */
    initSettings() {
      this.applyTheme();
      this.applyFontSize();
      this.applyCompactMode();

      // 监听系统主题变化
      if (typeof window !== 'undefined') {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', () => {
          if (this.theme === 'system') {
            this.applyTheme();
          }
        });
      }
    }
  },
  persist: {
    key: 'office_settings',
    pick: ['theme', 'fontSize', 'compactMode', 'vibration', 'defaultPage']
  }
});

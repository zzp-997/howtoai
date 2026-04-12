import 'core-js/stable'
import 'regenerator-runtime/runtime'

// Vue 3 需要的额外 polyfill
import 'core-js/actual/array/iterator'
import 'core-js/actual/object/assign'
import 'core-js/actual/promise'

import 'tdesign-mobile-vue/es/style/index.css';
import 'vant/lib/index.css';
import '@/style/index.less';
import './permission'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router';
import root from '@/components/root.vue';

import { store } from './store';
import { setupGlobDirectives } from '@/directives';
import { useSettingsStore } from '@/store/modules/settings';

// IndexedDB 数据库初始化
import { initDB } from '@/db';
import { insertSeedData } from '@/db/seed';

// Mock 数据 - 仅在开发环境启用
if (import.meta.env.VITE_USE_MOCK === 'true') {
  import('@/api/mock');
}

// 初始化数据库后再挂载应用
async function bootstrap() {
  try {
    // 初始化 IndexedDB
    const db = await initDB();
    // 插入预置数据
    await insertSeedData(db);
    console.log('数据库初始化完成');
  } catch (error) {
    console.error('数据库初始化失败:', error);
  }

  const app = createApp(App);

  app.use(router);
  app.use(store);
  app.component('Root', root);
  setupGlobDirectives(app);

  // 初始化设置（主题、字体大小等）
  const settingsStore = useSettingsStore();
  settingsStore.initSettings();

  app.mount('#app');
}

bootstrap();

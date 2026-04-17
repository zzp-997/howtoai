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

// Mock 数据 - 已禁用，使用后端 API

// 初始化应用
async function bootstrap() {
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
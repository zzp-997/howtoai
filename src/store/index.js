import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

const store = createPinia();
store.use(piniaPluginPersistedstate);

export { store };

export * from './modules/user';
export * from './modules/permission';
export * from './modules/settings';

export default store;
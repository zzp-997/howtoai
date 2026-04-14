/**
 * IndexedDB 数据库初始化入口
 * 极智协同 - 本地数据存储
 */

const DB_NAME = 'OfficeAssistantDB';
const DB_VERSION = 4;

let db = null;

/**
 * 初始化数据库
 * @returns {Promise<IDBDatabase>}
 */
export async function initDB() {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('数据库打开失败:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      db = request.result;
      console.log('数据库连接成功');
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      console.log('数据库升级/创建中...');
      const database = event.target.result;
      createStores(database);
    };
  });
}

/**
 * 创建数据表
 * @param {IDBDatabase} database
 */
function createStores(database) {
  // 用户表
  if (!database.objectStoreNames.contains('users')) {
    const userStore = database.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
    userStore.createIndex('username', 'username', { unique: true });
    userStore.createIndex('role', 'role', { unique: false });
  }

  // 会议室表
  if (!database.objectStoreNames.contains('meeting_rooms')) {
    const roomStore = database.createObjectStore('meeting_rooms', { keyPath: 'id', autoIncrement: true });
    roomStore.createIndex('name', 'name', { unique: false });
  }

  // 预定记录表
  if (!database.objectStoreNames.contains('reservations')) {
    const reservationStore = database.createObjectStore('reservations', { keyPath: 'id', autoIncrement: true });
    reservationStore.createIndex('roomId', 'roomId', { unique: false });
    reservationStore.createIndex('userId', 'userId', { unique: false });
    reservationStore.createIndex('start', 'start', { unique: false });
  }

  // 差旅申请表
  if (!database.objectStoreNames.contains('trips')) {
    const tripStore = database.createObjectStore('trips', { keyPath: 'id', autoIncrement: true });
    tripStore.createIndex('userId', 'userId', { unique: false });
    tripStore.createIndex('status', 'status', { unique: false });
  }

  // 请假申请表
  if (!database.objectStoreNames.contains('leaves')) {
    const leaveStore = database.createObjectStore('leaves', { keyPath: 'id', autoIncrement: true });
    leaveStore.createIndex('userId', 'userId', { unique: false });
    leaveStore.createIndex('status', 'status', { unique: false });
  }

  // 打卡记录表
  if (!database.objectStoreNames.contains('attendances')) {
    const attendanceStore = database.createObjectStore('attendances', { keyPath: 'id', autoIncrement: true });
    attendanceStore.createIndex('userId', 'userId', { unique: false });
    attendanceStore.createIndex('date', 'date', { unique: false });
    attendanceStore.createIndex('userDate', ['userId', 'date'], { unique: true });
  }

  // 补卡申请表
  if (!database.objectStoreNames.contains('make_up_requests')) {
    const makeUpStore = database.createObjectStore('make_up_requests', { keyPath: 'id', autoIncrement: true });
    makeUpStore.createIndex('userId', 'userId', { unique: false });
    makeUpStore.createIndex('status', 'status', { unique: false });
  }

  // 考勤配置表
  if (!database.objectStoreNames.contains('attendance_config')) {
    const configStore = database.createObjectStore('attendance_config', { keyPath: 'key' });
  }

  // 文档表
  if (!database.objectStoreNames.contains('documents')) {
    const documentStore = database.createObjectStore('documents', { keyPath: 'id', autoIncrement: true });
    documentStore.createIndex('categoryId', 'categoryId', { unique: false });
    documentStore.createIndex('name', 'name', { unique: false });
    documentStore.createIndex('uploadBy', 'uploadBy', { unique: false });
  }

  // 文档分类表
  if (!database.objectStoreNames.contains('document_categories')) {
    const categoryStore = database.createObjectStore('document_categories', { keyPath: 'id', autoIncrement: true });
    categoryStore.createIndex('name', 'name', { unique: false });
  }

  // 待办事项表
  if (!database.objectStoreNames.contains('todos')) {
    const todoStore = database.createObjectStore('todos', { keyPath: 'id', autoIncrement: true });
    todoStore.createIndex('userId', 'userId', { unique: false });
    todoStore.createIndex('status', 'status', { unique: false });
    todoStore.createIndex('dueDate', 'dueDate', { unique: false });
  }

  // 公告表
  if (!database.objectStoreNames.contains('announcements')) {
    const announcementStore = database.createObjectStore('announcements', { keyPath: 'id', autoIncrement: true });
    announcementStore.createIndex('isTop', 'isTop', { unique: false });
    announcementStore.createIndex('publishTime', 'publishTime', { unique: false });
    announcementStore.createIndex('category', 'category', { unique: false });
  }

  // ========== 扩展四期：智能化功能相关表 ==========

  // 用户偏好设置表
  if (!database.objectStoreNames.contains('user_preferences')) {
    const prefStore = database.createObjectStore('user_preferences', { keyPath: 'id', autoIncrement: true });
    prefStore.createIndex('userId', 'userId', { unique: true });
  }

  // 出差模板表
  if (!database.objectStoreNames.contains('trip_templates')) {
    const templateStore = database.createObjectStore('trip_templates', { keyPath: 'id', autoIncrement: true });
    templateStore.createIndex('userId', 'userId', { unique: false });
  }

  // 城市配置表
  if (!database.objectStoreNames.contains('city_configs')) {
    const cityStore = database.createObjectStore('city_configs', { keyPath: 'id', autoIncrement: true });
    cityStore.createIndex('name', 'name', { unique: false });
    cityStore.createIndex('region', 'region', { unique: false });
  }

  // 节假日配置表
  if (!database.objectStoreNames.contains('holiday_configs')) {
    const holidayStore = database.createObjectStore('holiday_configs', { keyPath: 'id', autoIncrement: true });
    holidayStore.createIndex('date', 'date', { unique: true });
  }

  // 文档浏览记录表
  if (!database.objectStoreNames.contains('document_view_logs')) {
    const viewLogStore = database.createObjectStore('document_view_logs', { keyPath: 'id', autoIncrement: true });
    viewLogStore.createIndex('userId', 'userId', { unique: false });
    viewLogStore.createIndex('documentId', 'documentId', { unique: false });
    viewLogStore.createIndex('viewedAt', 'viewedAt', { unique: false });
    viewLogStore.createIndex('userDocument', ['userId', 'documentId'], { unique: false });
  }

  // 搜索历史表
  if (!database.objectStoreNames.contains('search_histories')) {
    const searchStore = database.createObjectStore('search_histories', { keyPath: 'id', autoIncrement: true });
    searchStore.createIndex('userId', 'userId', { unique: false });
    searchStore.createIndex('keyword', 'keyword', { unique: false });
    searchStore.createIndex('searchedAt', 'searchedAt', { unique: false });
  }

  // 报销单表
  if (!database.objectStoreNames.contains('expense_claims')) {
    const expenseStore = database.createObjectStore('expense_claims', { keyPath: 'id', autoIncrement: true });
    expenseStore.createIndex('userId', 'userId', { unique: false });
    expenseStore.createIndex('tripId', 'tripId', { unique: false });
    expenseStore.createIndex('status', 'status', { unique: false });
  }

  console.log('数据表创建完成');
}

/**
 * 获取数据库实例
 * @returns {IDBDatabase|null}
 */
export function getDB() {
  return db;
}

/**
 * 清空所有数据（用于测试/重置）
 */
export async function clearAllData() {
  const database = await initDB();
  const storeNames = Array.from(database.objectStoreNames);

  return new Promise((resolve, reject) => {
    const tx = database.transaction(storeNames, 'readwrite');

    tx.oncomplete = () => {
      console.log('所有数据已清空');
      resolve();
    };

    tx.onerror = () => {
      reject(tx.error);
    };

    storeNames.forEach(name => {
      tx.objectStore(name).clear();
    });
  });
}

/**
 * 导出所有数据为 JSON
 * @returns {Promise<string>} JSON 字符串
 */
export async function exportAllData() {
  const database = await initDB();
  const storeNames = Array.from(database.objectStoreNames);
  const data = {
    exportTime: new Date().toISOString(),
    version: DB_VERSION,
    stores: {}
  };

  for (const name of storeNames) {
    data.stores[name] = await new Promise((resolve, reject) => {
      const tx = database.transaction(name, 'readonly');
      const store = tx.objectStore(name);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  return JSON.stringify(data, null, 2);
}

/**
 * 导入数据
 * @param {string} jsonString - JSON 字符串
 * @returns {Promise<void>}
 */
export async function importAllData(jsonString) {
  const data = JSON.parse(jsonString);

  if (!data.stores) {
    throw new Error('无效的备份文件格式');
  }

  const database = await initDB();

  for (const [storeName, records] of Object.entries(data.stores)) {
    if (!database.objectStoreNames.contains(storeName)) {
      console.warn(`跳过未知的数据表: ${storeName}`);
      continue;
    }

    await new Promise((resolve, reject) => {
      const tx = database.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);

      // 先清空再导入
      store.clear();

      records.forEach(record => {
        // 移除 id 让数据库自动生成新 ID，避免冲突
        const { id, ...recordWithoutId } = record;
        store.add(recordWithoutId);
      });
    });
  }

  console.log('数据导入完成');
}

/**
 * 获取数据库占用大小估算
 * @returns {Promise<string>} 格式化的大小字符串
 */
export async function getDatabaseSize() {
  const database = await initDB();
  const storeNames = Array.from(database.objectStoreNames);
  let totalRecords = 0;

  for (const name of storeNames) {
    const count = await new Promise((resolve, reject) => {
      const tx = database.transaction(name, 'readonly');
      const store = tx.objectStore(name);
      const request = store.count();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    totalRecords += count;
  }

  return `${totalRecords} 条记录`;
}

export default { initDB, getDB, clearAllData, exportAllData, importAllData, getDatabaseSize };

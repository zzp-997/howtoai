/**
 * 基础 Repository 类
 * 提供 IndexedDB 的通用 CRUD 操作
 */
import { getDB } from '../index';

export class BaseRepository {
  constructor(storeName) {
    this.storeName = storeName;
  }

  /**
   * 获取数据库实例
   */
  _getDB() {
    const db = getDB();
    if (!db) {
      throw new Error('数据库未初始化');
    }
    return db;
  }

  /**
   * 新增记录
   * @param {Object} data
   * @returns {Promise<number>} 返回新增记录的 ID
   */
  async create(data) {
    const db = this._getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      const request = store.add(data);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 批量新增
   * @param {Array} dataList
   * @returns {Promise<void>}
   */
  async createBatch(dataList) {
    const db = this._getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);

      dataList.forEach(data => store.add(data));
    });
  }

  /**
   * 根据 ID 查询
   * @param {number|string} id
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    const db = this._getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readonly');
      const store = tx.objectStore(this.storeName);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 查询所有记录
   * @returns {Promise<Array>}
   */
  async findAll() {
    const db = this._getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readonly');
      const store = tx.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 根据索引查询
   * @param {string} indexName 索引名称
   * @param {*} value 索引值
   * @returns {Promise<Array>}
   */
  async findByIndex(indexName, value) {
    const db = this._getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readonly');
      const store = tx.objectStore(this.storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 根据索引查询单条记录
   * @param {string} indexName
   * @param {*} value
   * @returns {Promise<Object|null>}
   */
  async findOneByIndex(indexName, value) {
    const db = this._getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readonly');
      const store = tx.objectStore(this.storeName);
      const index = store.index(indexName);
      const request = index.get(value);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 更新记录
   * @param {number|string} id
   * @param {Object} data 要更新的字段
   * @returns {Promise<void>}
   */
  async update(id, data) {
    const db = this._getDB();
    return new Promise(async (resolve, reject) => {
      const existing = await this.findById(id);
      if (!existing) {
        reject(new Error('记录不存在'));
        return;
      }

      const tx = db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      const updated = { ...existing, ...data, id }; // 保持 ID 不变
      const request = store.put(updated);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 替换整个记录（不合并）
   * @param {Object} data 必须包含 id 字段
   * @returns {Promise<void>}
   */
  async replace(data) {
    const db = this._getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 删除记录
   * @param {number|string} id
   * @returns {Promise<void>}
   */
  async delete(id) {
    const db = this._getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 统计记录数
   * @returns {Promise<number>}
   */
  async count() {
    const db = this._getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readonly');
      const store = tx.objectStore(this.storeName);
      const request = store.count();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 清空表
   * @returns {Promise<void>}
   */
  async clear() {
    const db = this._getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export default BaseRepository;

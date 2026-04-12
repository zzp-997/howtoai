/**
 * 考勤配置数据访问层
 */
import { BaseRepository } from './BaseRepository';

class AttendanceConfigRepository extends BaseRepository {
  constructor() {
    super('attendance_config');
  }

  /**
   * 获取配置值
   * @param {string} key
   * @returns {Promise<string|null>}
   */
  async getValue(key) {
    const config = await this.findById(key);
    return config ? config.value : null;
  }

  /**
   * 设置配置值
   * @param {string} key
   * @param {string} value
   */
  async setValue(key, value) {
    const db = this._getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      const request = store.put({ key, value });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 获取所有配置
   * @returns {Promise<Object>}
   */
  async getAllConfig() {
    const all = await this.findAll();
    const config = {};
    all.forEach(item => {
      config[item.key] = item.value;
    });
    return config;
  }

  /**
   * 获取上班时间
   * @returns {Promise<string>}
   */
  async getWorkStartTime() {
    return (await this.getValue('workStartTime')) || '09:00';
  }

  /**
   * 获取下班时间
   * @returns {Promise<string>}
   */
  async getWorkEndTime() {
    return (await this.getValue('workEndTime')) || '18:00';
  }

  /**
   * 是否允许补卡
   * @returns {Promise<boolean>}
   */
  async isAllowMakeUp() {
    const value = await this.getValue('allowMakeUp');
    return value === 'true';
  }
}

export const attendanceConfigRepo = new AttendanceConfigRepository();
export default attendanceConfigRepo;

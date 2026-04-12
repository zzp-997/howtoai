/**
 * 考勤打卡数据访问层
 */
import { BaseRepository } from './BaseRepository';
import dayjs from 'dayjs';

class AttendanceRepository extends BaseRepository {
  constructor() {
    super('attendances');
  }

  /**
   * 根据用户ID查询
   * @param {number} userId
   * @returns {Promise<Array>}
   */
  async findByUserId(userId) {
    return this.findByIndex('userId', userId);
  }

  /**
   * 根据日期查询
   * @param {string} date 'YYYY-MM-DD'
   * @returns {Promise<Array>}
   */
  async findByDate(date) {
    return this.findByIndex('date', date);
  }

  /**
   * 查询用户指定日期的打卡记录
   * @param {number} userId
   * @param {string} date
   * @returns {Promise<Object|null>}
   */
  async findByUserAndDate(userId, date) {
    const db = this._getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readonly');
      const store = tx.objectStore(this.storeName);
      const index = store.index('userDate');
      const request = index.get([userId, date]);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 查询用户指定月份的打卡记录
   * @param {number} userId
   * @param {string} month 'YYYY-MM'
   * @returns {Promise<Array>}
   */
  async findByUserAndMonth(userId, month) {
    const all = await this.findByUserId(userId);
    return all.filter(a => a.date.startsWith(month));
  }

  /**
   * 上班打卡
   * @param {number} userId
   * @param {string} workStartTime 上班时间 'HH:mm'
   * @returns {Promise<Object>}
   */
  async checkIn(userId, workStartTime = '09:00') {
    const today = dayjs().format('YYYY-MM-DD');
    const now = dayjs().format('HH:mm');

    // 检查是否已打卡
    const existing = await this.findByUserAndDate(userId, today);
    if (existing && existing.checkInTime) {
      throw new Error('今日已上班打卡');
    }

    // 判断是否迟到
    const isLate = now > workStartTime;

    if (existing) {
      // 更新
      await this.update(existing.id, {
        checkInTime: now,
        isLate
      });
      return this.findById(existing.id);
    } else {
      // 新增
      const id = await this.create({
        userId,
        date: today,
        checkInTime: now,
        checkOutTime: null,
        isLate,
        status: 'normal'
      });
      return this.findById(id);
    }
  }

  /**
   * 下班打卡
   * @param {number} userId
   * @param {string} workEndTime 下班时间 'HH:mm'
   * @returns {Promise<Object>}
   */
  async checkOut(userId, workEndTime = '18:00') {
    const today = dayjs().format('YYYY-MM-DD');
    const now = dayjs().format('HH:mm');

    const existing = await this.findByUserAndDate(userId, today);
    if (!existing) {
      throw new Error('请先上班打卡');
    }
    if (existing.checkOutTime) {
      throw new Error('今日已下班打卡');
    }

    // 判断是否早退
    const isEarlyLeave = now < workEndTime;

    await this.update(existing.id, {
      checkOutTime: now,
      isEarlyLeave
    });

    return this.findById(existing.id);
  }

  /**
   * 获取用户本月统计
   * @param {number} userId
   * @param {string} month 'YYYY-MM'
   * @returns {Promise<Object>}
   */
  async getMonthlyStats(userId, month) {
    const records = await this.findByUserAndMonth(userId, month);

    return {
      total: records.length,
      normal: records.filter(r => r.checkInTime && r.checkOutTime && !r.isLate).length,
      late: records.filter(r => r.isLate).length,
      missingCheckIn: records.filter(r => !r.checkInTime).length,
      missingCheckOut: records.filter(r => !r.checkOutTime).length
    };
  }

  /**
   * 获取全员考勤报表
   * @param {string} month 'YYYY-MM'
   * @returns {Promise<Array>}
   */
  async getMonthlyReport(month) {
    const db = this._getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readonly');
      const store = tx.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        const all = request.result || [];
        const filtered = all.filter(a => a.date.startsWith(month));
        resolve(filtered);
      };
      request.onerror = () => reject(request.error);
    });
  }
}

export const attendanceRepo = new AttendanceRepository();
export default attendanceRepo;

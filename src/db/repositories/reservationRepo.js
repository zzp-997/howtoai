/**
 * 预定记录数据访问层
 */
import { BaseRepository } from './BaseRepository';
import dayjs from 'dayjs';

class ReservationRepository extends BaseRepository {
  constructor() {
    super('reservations');
  }

  /**
   * 根据用户ID查询预定
   * @param {number} userId
   * @returns {Promise<Array>}
   */
  async findByUserId(userId) {
    return this.findByIndex('userId', userId);
  }

  /**
   * 根据会议室ID查询预定
   * @param {number} roomId
   * @returns {Promise<Array>}
   */
  async findByRoomId(roomId) {
    return this.findByIndex('roomId', roomId);
  }

  /**
   * 查询指定日期的预定
   * @param {number} roomId
   * @param {string} date 'YYYY-MM-DD'
   * @returns {Promise<Array>}
   */
  async findByRoomAndDate(roomId, date) {
    const all = await this.findByRoomId(roomId);
    return all.filter(r => r.start.startsWith(date));
  }

  /**
   * 查询指定日期范围的所有预定
   * @param {string} startDate
   * @param {string} endDate
   * @returns {Promise<Array>}
   */
  async findByDateRange(startDate, endDate) {
    const all = await this.findAll();
    return all.filter(r => {
      const rStart = r.start.split(' ')[0];
      return rStart >= startDate && rStart <= endDate;
    });
  }

  /**
   * 检测预定冲突
   * @param {number} roomId
   * @param {string} start 'YYYY-MM-DD HH:mm'
   * @param {string} end 'YYYY-MM-DD HH:mm'
   * @param {number} excludeId 排除的预定ID（用于编辑时）
   * @returns {Promise<Object|null>} 返回冲突的预定，无冲突返回 null
   */
  async checkConflict(roomId, start, end, excludeId = null) {
    const date = start.split(' ')[0];
    const sameDayReservations = await this.findByRoomAndDate(roomId, date);

    const startTime = dayjs(start);
    const endTime = dayjs(end);

    for (const r of sameDayReservations) {
      if (excludeId && r.id === excludeId) continue;

      const rStart = dayjs(r.start);
      const rEnd = dayjs(r.end);

      // 检测时间重叠
      if (startTime < rEnd && endTime > rStart) {
        return r;
      }
    }

    return null;
  }

  /**
   * 获取用户未来的预定
   * @param {number} userId
   * @returns {Promise<Array>}
   */
  async findFutureByUserId(userId) {
    const now = dayjs().format('YYYY-MM-DD HH:mm');
    const all = await this.findByUserId(userId);
    return all.filter(r => r.start >= now).sort((a, b) => a.start.localeCompare(b.start));
  }

  /**
   * 获取用户历史预定
   * @param {number} userId
   * @returns {Promise<Array>}
   */
  async findPastByUserId(userId) {
    const now = dayjs().format('YYYY-MM-DD HH:mm');
    const all = await this.findByUserId(userId);
    return all.filter(r => r.start < now).sort((a, b) => b.start.localeCompare(a.start));
  }
}

export const reservationRepo = new ReservationRepository();
export default reservationRepo;

/**
 * 会议室数据访问层
 */
import { BaseRepository } from './BaseRepository';

class MeetingRoomRepository extends BaseRepository {
  constructor() {
    super('meeting_rooms');
  }

  /**
   * 根据名称模糊查询
   * @param {string} keyword
   * @returns {Promise<Array>}
   */
  async searchByName(keyword) {
    const all = await this.findAll();
    if (!keyword) return all;
    return all.filter(room =>
      room.name.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  /**
   * 根据容量筛选
   * @param {number} minCapacity 最小容量
   * @returns {Promise<Array>}
   */
  async findByMinCapacity(minCapacity) {
    const all = await this.findAll();
    return all.filter(room => room.capacity >= minCapacity);
  }

  /**
   * 根据设备筛选
   * @param {string} equipment 设备名称
   * @returns {Promise<Array>}
   */
  async findByEquipment(equipment) {
    const all = await this.findAll();
    return all.filter(room =>
      room.equipment && room.equipment.includes(equipment)
    );
  }
}

export const meetingRoomRepo = new MeetingRoomRepository();
export default meetingRoomRepo;

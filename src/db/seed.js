/**
 * 预置数据
 * 首次运行时自动初始化基础数据
 */

import dayjs from 'dayjs';
import { cityConfigRepo, DEFAULT_CITIES } from './repositories/cityConfigRepo';
import { holidayConfigRepo } from './repositories/holidayConfigRepo';

/**
 * 预置用户数据
 */
export const seedUsers = [
  {
    id: 1,
    username: 'admin',
    password: '123456',
    role: 'admin',
    name: '管理员',
    annualLeaveBalance: 12,
    sickLeaveBalance: 10,
    createdAt: new Date()
  },
  {
    id: 2,
    username: 'user',
    password: '123456',
    role: 'user',
    name: '张三',
    annualLeaveBalance: 5,
    sickLeaveBalance: 5,
    createdAt: new Date()
  },
  {
    id: 3,
    username: 'lisi',
    password: '123456',
    role: 'user',
    name: '李四',
    annualLeaveBalance: 8,
    sickLeaveBalance: 6,
    createdAt: new Date()
  }
];

/**
 * 预置会议室数据
 */
export const seedMeetingRooms = [
  {
    id: 1,
    name: 'A会议室',
    capacity: 10,
    equipment: ['投影仪', '白板', '视频会议系统'],
    createdAt: new Date()
  },
  {
    id: 2,
    name: 'B会议室',
    capacity: 6,
    equipment: ['电视', '白板'],
    createdAt: new Date()
  },
  {
    id: 3,
    name: 'C会议室',
    capacity: 4,
    equipment: ['电视'],
    createdAt: new Date()
  },
  {
    id: 4,
    name: '大会议室',
    capacity: 20,
    equipment: ['投影仪', '白板', '视频会议系统', '麦克风'],
    createdAt: new Date()
  }
];

/**
 * 预置考勤配置
 */
export const seedAttendanceConfig = [
  { key: 'workStartTime', value: '09:00' },
  { key: 'workEndTime', value: '18:00' },
  { key: 'lateThresholdMinutes', value: '5' },
  { key: 'allowMakeUp', value: 'true' }
];

/**
 * 预置文档分类
 */
export const seedDocumentCategories = [
  { id: 1, name: '公司制度', createdAt: new Date() },
  { id: 2, name: '技术文档', createdAt: new Date() },
  { id: 3, name: '产品文档', createdAt: new Date() },
  { id: 4, name: '人事文档', createdAt: new Date() }
];

/**
 * 预置公告数据
 */
export const seedAnnouncements = [
  {
    id: 1,
    title: '关于2024年春节放假安排的通知',
    content: '根据国务院办公厅通知，2024年春节放假安排如下：2月10日至2月17日放假调休，共8天。2月4日（星期日）、2月18日（星期日）上班。请各部门提前做好工作安排，确保节前各项工作顺利完成。',
    isTop: true,
    isRemind: true,
    publishTime: new Date(),
    publishedBy: 1,
    readBy: []
  },
  {
    id: 2,
    title: '公司新版考勤制度公告',
    content: '为进一步规范公司考勤管理，现对考勤制度进行如下调整：\n1. 上下班打卡时间不变（9:00-18:00）\n2. 迟到超过30分钟需提交书面说明\n3. 月累计迟到3次以上将影响绩效考核\n4. 补卡申请需在3个工作日内提交',
    isTop: false,
    isRemind: true,
    publishTime: new Date(Date.now() - 86400000),
    publishedBy: 1,
    readBy: []
  },
  {
    id: 3,
    title: '关于开展年度体检的通知',
    content: '为关爱员工身体健康，公司将于本月组织年度体检。体检时间：每周一至周五上午8:00-11:00。体检地点：XX医院体检中心。请各位同事合理安排时间，体检前需空腹。',
    isTop: false,
    isRemind: false,
    publishTime: new Date(Date.now() - 172800000),
    publishedBy: 1,
    readBy: []
  }
];

/**
 * 生成预定测试数据
 */
function generateTestReservations() {
  const today = dayjs();
  const reservations = [];
  let id = 1;

  // 生成今天和未来几天的预定
  for (let i = 0; i < 5; i++) {
    const date = today.add(i, 'day').format('YYYY-MM-DD');

    // A会议室上午
    reservations.push({
      id: id++,
      roomId: 1,
      userId: 2,
      subject: '项目周会',
      start: `${date} 09:00`,
      end: `${date} 10:00`,
      attendees: [2, 3],
      createdAt: new Date()
    });

    // B会议室下午
    if (i < 3) {
      reservations.push({
        id: id++,
        roomId: 2,
        userId: 3,
        subject: '需求讨论',
        start: `${date} 14:00`,
        end: `${date} 15:30`,
        attendees: [2, 3],
        createdAt: new Date()
      });
    }
  }

  return reservations;
}

export const seedReservations = generateTestReservations();

/**
 * 插入预置数据到数据库
 * @param {IDBDatabase} db
 */
export async function insertSeedData(db) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(
      ['users', 'meeting_rooms', 'attendance_config', 'document_categories', 'announcements'],
      'readwrite'
    );

    tx.oncomplete = async () => {
      console.log('预置数据插入完成');

      // 初始化扩展四期数据（异步）
      try {
        await cityConfigRepo.initCities(DEFAULT_CITIES);
        await holidayConfigRepo.initHolidays(new Date().getFullYear());
        console.log('智能功能数据初始化完成');
      } catch (e) {
        console.warn('智能功能数据初始化跳过:', e.message);
      }

      resolve();
    };

    tx.onerror = () => {
      console.error('预置数据插入失败:', tx.error);
      reject(tx.error);
    };

    // 检查是否已有数据
    const userStore = tx.objectStore('users');
    const userRequest = userStore.count();

    userRequest.onsuccess = () => {
      if (userRequest.result === 0) {
        // 插入用户
        seedUsers.forEach(user => {
          userStore.put(user);
        });

        // 插入会议室
        const roomStore = tx.objectStore('meeting_rooms');
        seedMeetingRooms.forEach(room => {
          roomStore.put(room);
        });

        // 插入考勤配置
        const configStore = tx.objectStore('attendance_config');
        seedAttendanceConfig.forEach(config => {
          configStore.put(config);
        });

        // 插入文档分类
        const categoryStore = tx.objectStore('document_categories');
        seedDocumentCategories.forEach(category => {
          categoryStore.put(category);
        });

        // 插入公告
        const announcementStore = tx.objectStore('announcements');
        seedAnnouncements.forEach(announcement => {
          announcementStore.put(announcement);
        });
      }
    };
  });
}

export default {
  seedUsers,
  seedMeetingRooms,
  seedAttendanceConfig,
  seedDocumentCategories,
  seedAnnouncements,
  seedReservations,
  insertSeedData
};

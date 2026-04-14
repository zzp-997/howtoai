/**
 * 数据访问层统一导出
 */

export { BaseRepository } from './BaseRepository';
export { userRepo } from './userRepo';
export { meetingRoomRepo } from './meetingRoomRepo';
export { reservationRepo } from './reservationRepo';
export { tripRepo } from './tripRepo';
export { leaveRepo } from './leaveRepo';
export { attendanceRepo } from './attendanceRepo';
export { makeUpRequestRepo } from './makeUpRequestRepo';
export { documentRepo } from './documentRepo';
export { documentCategoryRepo } from './documentCategoryRepo';
export { attendanceConfigRepo } from './attendanceConfigRepo';
export { todoRepo } from './todoRepo';
export { announcementRepo, ANNOUNCEMENT_CATEGORIES } from './announcementRepo';

// 扩展四期：智能功能相关
export { userPreferenceRepo } from './userPreferenceRepo';
export { tripTemplateRepo } from './tripTemplateRepo';
export { cityConfigRepo, DEFAULT_CITIES } from './cityConfigRepo';
export { holidayConfigRepo } from './holidayConfigRepo';
export { documentViewLogRepo } from './documentViewLogRepo';
export { searchHistoryRepo } from './searchHistoryRepo';
export { expenseClaimRepo } from './expenseClaimRepo';

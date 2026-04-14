/**
 * 智能推荐工具函数
 * 提供会议室推荐、差旅行程提醒等功能
 */
import dayjs from 'dayjs'
import { meetingRoomRepo, reservationRepo, userPreferenceRepo, tripRepo, cityConfigRepo } from '@/db/repositories'

// 推荐缓存
const recommendCache = {
  meeting: {
    data: null,
    timestamp: null,
    ttl: 30 * 60 * 1000 // 30分钟
  }
}

/**
 * 获取会议室推荐
 * @param {number} userId 用户ID
 * @param {Object} options 可选参数
 * @param {boolean} options.useCache 是否使用缓存
 * @param {number} options.capacity 人数需求
 * @param {string[]} options.equipment 设备需求
 * @returns {Promise<Array>} 推荐列表
 */
export async function getMeetingRecommendations(userId, options = {}) {
  const { useCache = true, capacity, equipment } = options

  // 检查缓存
  if (useCache && recommendCache.meeting.data && recommendCache.meeting.timestamp) {
    const now = Date.now()
    if (now - recommendCache.meeting.timestamp < recommendCache.meeting.ttl) {
      return recommendCache.meeting.data
    }
  }

  // 获取用户偏好
  const preference = await userPreferenceRepo.findByUserId(userId)

  // 获取所有会议室
  const rooms = await meetingRoomRepo.findAll()

  // 获取今日预定情况
  const today = dayjs().format('YYYY-MM-DD')
  const recommendations = []
  const now = dayjs()
  const currentHour = now.hour()

  for (const room of rooms) {
    // 容量筛选
    if (capacity && room.capacity < capacity) continue

    // 设备筛选
    if (equipment && equipment.length > 0) {
      const hasEquipment = equipment.every(e => room.equipment?.includes(e))
      if (!hasEquipment) continue
    }

    // 获取该会议室今日预定
    const reservations = await reservationRepo.findByRoomAndDate(room.id, today)

    // 计算空闲时段
    const { availHours, availSlots } = calculateAvailability(reservations, currentHour)

    if (availHours > 0) {
      // 计算匹配分数
      const matchScore = calculateScore(room, preference, availHours, availSlots)

      // 找最佳推荐时段
      const bestSlot = findBestSlot(availSlots)

      recommendations.push({
        room,
        availHours,
        availText: bestSlot ? `${bestSlot.start}-${bestSlot.end} 空闲` : `${availHours}小时空闲`,
        matchScore,
        bestSlot,
        reason: getRecommendReason(room, preference, availHours)
      })
    }
  }

  // 按匹配度排序，取前3个
  const result = recommendations
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3)

  // 更新缓存
  recommendCache.meeting.data = result
  recommendCache.meeting.timestamp = Date.now()

  return result
}

/**
 * 计算会议室空闲时段
 * @param {Array} reservations 预定记录
 * @param {number} currentHour 当前小时
 * @returns {Object} { availHours, availSlots }
 */
function calculateAvailability(reservations, currentHour) {
  let availHours = 0
  let availSlots = []

  if (reservations.length === 0) {
    // 全天空闲
    const startHour = Math.max(8, currentHour + 1)
    availHours = 20 - startHour
    if (availHours > 0) {
      availSlots = [{ start: `${String(startHour).padStart(2, '0')}:00`, end: '20:00' }]
    }
  } else {
    // 计算空闲时段
    const sortedRes = [...reservations].sort((a, b) => a.start.localeCompare(b.start))
    let currentTime = Math.max(8, currentHour + 1)
    currentTime = `${String(currentTime).padStart(2, '0')}:00`

    for (const r of sortedRes) {
      const startTime = r.start.split(' ')[1]
      if (currentTime < startTime) {
        const startH = parseInt(currentTime.split(':')[0])
        const endH = parseInt(startTime.split(':')[0])
        if (endH > startH) {
          availHours += endH - startH
          availSlots.push({ start: currentTime, end: startTime })
        }
      }
      currentTime = r.end.split(' ')[1]
    }

    // 检查最后一个预定到20:00之间的空闲
    const lastEndH = parseInt(currentTime.split(':')[0])
    if (lastEndH < 20) {
      availHours += 20 - lastEndH
      availSlots.push({ start: currentTime, end: '20:00' })
    }
  }

  return { availHours, availSlots }
}

/**
 * 计算推荐分数
 * @param {Object} room 会议室
 * @param {Object} preference 用户偏好
 * @param {number} availHours 空闲时长
 * @param {Array} availSlots 空闲时段
 * @returns {number} 分数 (0-5)
 */
function calculateScore(room, preference, availHours, availSlots) {
  let score = 3 // 基础分

  // 空闲时长加分
  if (availHours >= 4) score += 0.5
  if (availHours >= 8) score += 0.5

  // 常用会议室加分（权重最高）
  if (preference?.frequentRooms?.includes(room.id)) {
    score += 1
  }

  // 适中容量加分
  if (room.capacity >= 6 && room.capacity <= 12) {
    score += 0.5
  }

  // 有设备加分
  if (room.equipment?.length > 0) {
    score += 0.5
  }

  return Math.min(5, Math.round(score * 10) / 10)
}

/**
 * 找最佳推荐时段
 * @param {Array} availSlots 空闲时段
 * @returns {Object|null} 最佳时段
 */
function findBestSlot(availSlots) {
  // 优先推荐9点-14点开始的时段
  const preferred = availSlots.find(s => {
    const startHour = parseInt(s.start.split(':')[0])
    return startHour >= 9 && startHour <= 14
  })
  return preferred || availSlots[0]
}

/**
 * 获取推荐理由
 * @param {Object} room 会议室
 * @param {Object} preference 用户偏好
 * @param {number} availHours 空闲时长
 * @returns {string} 推荐理由
 */
function getRecommendReason(room, preference, availHours) {
  const reasons = []

  if (preference?.frequentRooms?.includes(room.id)) {
    reasons.push('您最常用的会议室')
  }

  if (availHours >= 8) {
    reasons.push('今日大部分时间空闲')
  } else if (availHours >= 4) {
    reasons.push('今日有较长空闲时段')
  }

  if (room.equipment?.length > 0) {
    reasons.push(`配备${room.equipment.slice(0, 2).join('、')}`)
  }

  return reasons.join('，') || '适合您的需求'
}

/**
 * 刷新推荐缓存
 */
export function refreshMeetingCache() {
  recommendCache.meeting.data = null
  recommendCache.meeting.timestamp = null
}

/**
 * 获取差旅行程提醒
 * @param {number} userId 用户ID
 * @returns {Promise<Array>} 提醒列表
 */
export async function getTripReminders(userId) {
  const today = dayjs()
  const tomorrow = today.add(1, 'day').format('YYYY-MM-DD')

  // 查询明天出发的差旅
  const trips = await tripRepo.findByUserId(userId)
  const upcomingTrips = trips.filter(t => {
    return t.startDate === tomorrow && t.status === 'approved'
  })

  const reminders = []

  for (const trip of upcomingTrips) {
    // 获取城市信息
    const cityInfo = await cityConfigRepo.findByName(trip.destination)

    // 生成建议携带物品
    const suggestions = generatePackingSuggestions(trip, cityInfo)

    reminders.push({
      trip,
      cityInfo,
      weatherTips: cityInfo?.weatherTips || '请提前查询当地天气',
      suggestions,
      reminderId: `trip-${trip.id}`
    })
  }

  return reminders
}

/**
 * 生成建议携带物品
 * @param {Object} trip 差旅信息
 * @param {Object} cityInfo 城市信息
 * @returns {string[]} 建议物品列表
 */
function generatePackingSuggestions(trip, cityInfo) {
  const suggestions = []

  // 根据天气提示
  if (cityInfo?.weatherTips?.includes('雨') || cityInfo?.weatherTips?.includes('梅雨')) {
    suggestions.push('雨伞')
  }
  if (cityInfo?.weatherTips?.includes('冷') || cityInfo?.weatherTips?.includes('寒')) {
    suggestions.push('保暖衣物')
  }
  if (cityInfo?.weatherTips?.includes('热') || cityInfo?.weatherTips?.includes('炎热')) {
    suggestions.push('防晒用品')
  }

  // 根据出差天数
  const days = dayjs(trip.endDate).diff(dayjs(trip.startDate), 'day') + 1
  if (days >= 3) {
    suggestions.push('充电器')
    suggestions.push('洗漱用品')
  }

  // 根据出差事由
  if (trip.reason?.includes('会议') || trip.reason?.includes('汇报')) {
    suggestions.push('正装')
    suggestions.push('名片')
  }

  // 默认建议
  if (suggestions.length === 0) {
    suggestions.push('笔记本电脑')
    suggestions.push('充电器')
  }

  return [...new Set(suggestions)].slice(0, 5)
}

/**
 * 生成报销单预填数据
 * @param {Object} trip 差旅信息
 * @returns {Promise<Object>} 报销单数据
 */
export async function generateExpenseFromTrip(trip) {
  // 获取城市费用预估
  let costEstimate = null
  try {
    costEstimate = await cityConfigRepo.getCostEstimate(trip?.destination)
  } catch (e) {
    console.warn('获取费用预估失败:', e)
  }

  // 使用默认值作为兜底
  const fee = costEstimate || {
    transportFee: { min: 500, max: 1500 },
    accommodationFee: { min: 200, max: 500 }
  }

  // 计算天数
  const days = dayjs(trip.endDate).diff(dayjs(trip.startDate), 'day') + 1

  // 生成费用明细
  const expenses = [
    {
      category: '交通费',
      estimated: fee.transportFee.min,
      estimatedMax: fee.transportFee.max,
      actual: 0
    },
    {
      category: '住宿费',
      estimated: fee.accommodationFee.min * days,
      estimatedMax: fee.accommodationFee.max * days,
      actual: 0
    },
    {
      category: '餐饮费',
      estimated: 100 * days,
      estimatedMax: 200 * days,
      actual: 0
    },
    {
      category: '其他费用',
      estimated: 0,
      estimatedMax: 0,
      actual: 0
    }
  ]

  return {
    tripId: trip.id,
    reason: trip.reason,
    destination: trip.destination,
    startDate: trip.startDate,
    endDate: trip.endDate,
    expenses,
    totalEstimated: expenses.reduce((sum, e) => sum + e.estimated, 0),
    totalEstimatedMax: expenses.reduce((sum, e) => sum + e.estimatedMax, 0),
    totalActual: 0
  }
}

/**
 * 获取需要报销提醒的差旅
 * @param {number} userId 用户ID
 * @returns {Promise<Array>} 需要提醒的差旅列表
 */
export async function getExpenseReminders(userId) {
  const today = dayjs().format('YYYY-MM-DD')

  // 查询所有差旅
  const trips = await tripRepo.findByUserId(userId)

  // 筛选已批准且已结束的差旅
  const endedTrips = trips.filter(t => {
    return t.status === 'approved' && t.endDate < today
  })

  const reminders = []

  // 动态导入避免循环依赖
  const { expenseClaimRepo } = await import('@/db/repositories')

  for (const trip of endedTrips) {
    // 检查是否已有报销单
    const existingClaim = await expenseClaimRepo.findByTripId(trip.id)

    if (!existingClaim || existingClaim.status === 'draft') {
      reminders.push({
        trip,
        existingClaim,
        reminderId: `expense-${trip.id}`,
        daysSinceEnd: dayjs(today).diff(dayjs(trip.endDate), 'day')
      })
    }
  }

  // 按结束日期倒序排序（最近结束的优先）
  return reminders.sort((a, b) => a.daysSinceEnd - b.daysSinceEnd)
}

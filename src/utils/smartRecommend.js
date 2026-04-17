/**
 * 智能推荐工具函数
 * 提供会议室推荐、差旅行程提醒等功能
 */
import dayjs from 'dayjs'
import { getMeetingRooms } from '@/api/meeting-rooms'
import { getReservations } from '@/api/reservations'
import { getUserPreference } from '@/api/configs'
import { getTrips } from '@/api/trips'
import { getCityConfigs } from '@/api/configs'
import { getExpenses } from '@/api/expenses'

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

  try {
    // 获取用户偏好
    let preference = {}
    try {
      const prefRes = await getUserPreference()
      preference = prefRes.data || {}
    } catch (e) {
      // 忽略用户偏好获取失败
    }

    // 获取所有会议室
    const roomsRes = await getMeetingRooms()
    const rooms = roomsRes.data || []

    // 获取今日预定情况
    const today = dayjs().format('YYYY-MM-DD')
    const recommendations = []
    const now = dayjs()
    const currentHour = now.hour()

    // 获取所有预定
    let allReservations = []
    try {
      const resRes = await getReservations()
      allReservations = resRes.data || []
    } catch (e) {
      // 忽略预定获取失败
    }

    for (const room of rooms) {
      // 容量筛选
      if (capacity && room.capacity < capacity) continue

      // 设备筛选
      if (equipment && equipment.length > 0) {
        const hasEquipment = equipment.every(e => room.equipment?.includes(e))
        if (!hasEquipment) continue
      }

      // 获取该会议室今日预定
      const reservations = allReservations.filter(r =>
        r.roomId === room.id && r.start && r.start.startsWith(today)
      )

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
  } catch (error) {
    console.error('获取会议室推荐失败:', error)
    return []
  }
}

/**
 * 计算会议室空闲时段
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
 */
function calculateScore(room, preference, availHours, availSlots) {
  let score = 3 // 基础分

  // 空闲时长加分
  if (availHours >= 4) score += 0.5
  if (availHours >= 8) score += 0.5

  // 常用会议室加分
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
 */
function findBestSlot(availSlots) {
  const preferred = availSlots.find(s => {
    const startHour = parseInt(s.start.split(':')[0])
    return startHour >= 9 && startHour <= 14
  })
  return preferred || availSlots[0]
}

/**
 * 获取推荐理由
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
 */
export async function getTripReminders(userId) {
  try {
    const today = dayjs()
    const tomorrow = today.add(1, 'day').format('YYYY-MM-DD')

    // 查询差旅
    let trips = []
    try {
      const tripsRes = await getTrips()
      trips = tripsRes.data || []
    } catch (e) {
      console.error('获取差旅数据失败:', e)
      return []
    }

    const upcomingTrips = trips.filter(t => {
      return t.startDate === tomorrow && t.status === 'approved'
    })

    // 获取城市配置
    let cityConfigs = []
    try {
      const cityRes = await getCityConfigs()
      cityConfigs = cityRes.data || []
    } catch (e) {
      // 忽略城市配置获取失败
    }

    const reminders = []

    for (const trip of upcomingTrips) {
      const cityInfo = cityConfigs.find(c => c.name === trip.destination)
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
  } catch (error) {
    console.error('获取行程提醒失败:', error)
    return []
  }
}

/**
 * 生成建议携带物品
 */
function generatePackingSuggestions(trip, cityInfo) {
  const suggestions = []

  const days = dayjs(trip.endDate).diff(dayjs(trip.startDate), 'day') + 1
  if (days >= 3) {
    suggestions.push('充电器', '洗漱用品')
  }

  if (trip.reason?.includes('会议') || trip.reason?.includes('汇报')) {
    suggestions.push('正装', '名片')
  }

  if (suggestions.length === 0) {
    suggestions.push('笔记本电脑', '充电器')
  }

  return [...new Set(suggestions)].slice(0, 5)
}

/**
 * 获取需要报销提醒的差旅
 */
export async function getExpenseReminders(userId) {
  try {
    const today = dayjs().format('YYYY-MM-DD')

    // 查询所有差旅
    let trips = []
    try {
      const tripsRes = await getTrips()
      trips = tripsRes.data || []
    } catch (e) {
      console.error('获取差旅数据失败:', e)
      return []
    }

    // 筛选已批准且已结束的差旅
    const endedTrips = trips.filter(t => {
      return t.status === 'approved' && t.endDate < today
    })

    // 获取所有报销单
    let expenses = []
    try {
      const expensesRes = await getExpenses()
      expenses = expensesRes.data || []
    } catch (e) {
      // 忽略报销单获取失败
    }

    const reminders = []

    for (const trip of endedTrips) {
      // 检查是否已有报销单
      const existingClaim = expenses.find(e => e.tripId === trip.id)

      if (!existingClaim || existingClaim.status === 'draft') {
        reminders.push({
          trip,
          existingClaim,
          reminderId: `expense-${trip.id}`,
          daysSinceEnd: dayjs(today).diff(dayjs(trip.endDate), 'day')
        })
      }
    }

    return reminders.sort((a, b) => a.daysSinceEnd - b.daysSinceEnd)
  } catch (error) {
    console.error('获取报销提醒失败:', error)
    return []
  }
}

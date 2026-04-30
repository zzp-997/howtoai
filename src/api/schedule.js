/**
 * 会议智能调度API模块
 * 对应后端接口: /api/v1/meetings/*
 */

// 获取会议室列表
export function getMeetingRooms(params) {
  return mockRequest({
    url: '/api/v1/meetings/rooms',
    method: 'get',
    params
  })
}

// 获取会议室详情
export function getMeetingRoom(id) {
  return mockRequest({
    url: `/api/v1/meetings/rooms/${id}`,
    method: 'get'
  })
}

// 创建会议室
export function createMeetingRoom(data) {
  return mockRequest({
    url: '/api/v1/meetings/rooms',
    method: 'post',
    data
  })
}

// 更新会议室
export function updateMeetingRoom(id, data) {
  return mockRequest({
    url: `/api/v1/meetings/rooms/${id}`,
    method: 'put',
    data
  })
}

// 删除会议室
export function deleteMeetingRoom(id) {
  return mockRequest({
    url: `/api/v1/meetings/rooms/${id}`,
    method: 'delete'
  })
}

// 智能推荐会议室
export function recommendMeetingRooms(data) {
  return mockRequest({
    url: '/api/v1/meetings/recommend',
    method: 'post',
    data
  })
}

// 查询可用时段
export function getAvailableSlots(params) {
  return mockRequest({
    url: '/api/v1/meetings/available',
    method: 'get',
    params
  })
}

// 检测会议室冲突
export function checkConflict(params) {
  return mockRequest({
    url: '/api/v1/meetings/check-conflict',
    method: 'post',
    data: params
  })
}

// 创建会议预约
export function createMeeting(data) {
  return mockRequest({
    url: '/api/v1/meetings',
    method: 'post',
    data
  })
}

// 获取我的会议列表
export function getMyMeetings(params) {
  return mockRequest({
    url: '/api/v1/meetings/my',
    method: 'get',
    params
  })
}

// 获取会议详情
export function getMeetingDetail(id) {
  return mockRequest({
    url: `/api/v1/meetings/${id}`,
    method: 'get'
  })
}

// 更新会议预约
export function updateMeeting(id, data) {
  return mockRequest({
    url: `/api/v1/meetings/${id}`,
    method: 'put',
    data
  })
}

// 取消会议预约
export function cancelMeeting(id) {
  return mockRequest({
    url: `/api/v1/meetings/${id}/cancel`,
    method: 'post'
  })
}

// 获取会议室使用情况（日视图）
export function getRoomDayView(params) {
  return mockRequest({
    url: '/api/v1/meetings/room-day-view',
    method: 'get',
    params
  })
}

// 获取会议室使用情况（周视图）
export function getRoomWeekView(params) {
  return mockRequest({
    url: '/api/v1/meetings/room-week-view',
    method: 'get',
    params
  })
}

// 模拟请求函数
function mockRequest(config) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: generateMockData(config) })
    }, 300)
  })
}

function generateMockData(config) {
  const { url, method } = config

  if (url.includes('rooms')) {
    return mockRooms()
  }
  if (url.includes('recommend')) {
    return mockRecommendations()
  }
  if (url.includes('available')) {
    return mockAvailableSlots()
  }
  if (url.includes('check-conflict')) {
    return mockConflictCheck()
  }
  if (url.includes('my')) {
    return mockMyMeetings()
  }
  if (url.includes('day-view')) {
    return mockDayView()
  }
  if (url.includes('week-view')) {
    return mockWeekView()
  }

  return {}
}

function mockRooms() {
  return {
    list: [
      {
        id: 1,
        name: '第一会议室',
        floor: '1楼',
        capacity: 10,
        equipment: ['projector', 'whiteboard', 'video_conference'],
        roomType: 'medium',
        status: 'normal'
      },
      {
        id: 2,
        name: '第二会议室',
        floor: '1楼',
        capacity: 6,
        equipment: ['projector', 'whiteboard'],
        roomType: 'small',
        status: 'normal'
      },
      {
        id: 3,
        name: '第三会议室',
        floor: '2楼',
        capacity: 20,
        equipment: ['projector', 'whiteboard', 'video_conference', 'microphone'],
        roomType: 'large',
        status: 'normal'
      },
      {
        id: 4,
        name: 'VIP会议室',
        floor: '3楼',
        capacity: 8,
        equipment: ['projector', 'whiteboard', 'video_conference', 'microphone'],
        roomType: 'vip',
        status: 'normal'
      }
    ],
    total: 4
  }
}

function mockRecommendations() {
  return {
    recommendations: [
      {
        room: {
          id: 1,
          name: '第一会议室',
          floor: '1楼',
          capacity: 10,
          equipment: ['projector', 'whiteboard', 'video_conference']
        },
        score: 95,
        reasons: ['容量合适', '设备齐全', '距离最近'],
        availableSlots: [
          { start: '09:00', end: '10:00', available: true },
          { start: '10:00', end: '11:00', available: true },
          { start: '14:00', end: '15:00', available: true },
          { start: '15:00', end: '16:00', available: false }
        ]
      },
      {
        room: {
          id: 2,
          name: '第二会议室',
          floor: '1楼',
          capacity: 6,
          equipment: ['projector', 'whiteboard']
        },
        score: 85,
        reasons: ['容量合适', '空闲时间多'],
        availableSlots: [
          { start: '09:00', end: '10:00', available: true },
          { start: '10:00', end: '11:00', available: true },
          { start: '11:00', end: '12:00', available: true },
          { start: '14:00', end: '15:00', available: true }
        ]
      }
    ]
  }
}

function mockAvailableSlots() {
  return {
    date: '2026-04-30',
    roomId: 1,
    slots: [
      { start: '09:00', end: '10:00', available: true },
      { start: '10:00', end: '11:00', available: false, meeting: '部门例会' },
      { start: '11:00', end: '12:00', available: true },
      { start: '14:00', end: '15:00', available: true },
      { start: '15:00', end: '16:00', available: false, meeting: '项目评审' },
      { start: '16:00', end: '17:00', available: true }
    ]
  }
}

function mockConflictCheck() {
  return {
    hasConflict: false,
    conflictWith: null
  }
}

function mockMyMeetings() {
  return {
    list: [
      {
        id: 1,
        title: '部门周例会',
        roomName: '第一会议室',
        startTime: '2026-04-30 10:00',
        endTime: '2026-04-30 11:00',
        status: 'scheduled',
        attendees: ['张三', '李四', '王五']
      },
      {
        id: 2,
        title: '项目评审会',
        roomName: '第三会议室',
        startTime: '2026-04-30 15:00',
        endTime: '2026-04-30 16:30',
        status: 'scheduled',
        attendees: ['产品经理', '开发', '测试']
      }
    ],
    total: 2
  }
}

function mockDayView() {
  return {
    date: '2026-04-30',
    roomId: 1,
    bookings: [
      { start: '10:00', end: '11:00', title: '部门例会', organizer: '张三' },
      { start: '14:00', end: '15:30', title: '需求评审', organizer: '李四' },
      { start: '16:00', end: '17:00', title: '周报会议', organizer: '王五' }
    ]
  }
}

function mockWeekView() {
  return {
    weekStart: '2026-04-28',
    roomId: 1,
    days: [
      {
        date: '2026-04-28',
        bookings: [
          { start: '10:00', end: '11:00', title: '部门例会' }
        ]
      },
      {
        date: '2026-04-29',
        bookings: [
          { start: '14:00', end: '15:00', title: '项目评审' },
          { start: '16:00', end: '17:00', title: '周报会议' }
        ]
      },
      {
        date: '2026-04-30',
        bookings: [
          { start: '10:00', end: '11:00', title: '部门例会' },
          { start: '15:00', end: '16:30', title: '需求评审' }
        ]
      }
    ]
  }
}

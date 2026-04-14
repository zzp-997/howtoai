<template>
  <Root title="会议预定" :back-url="'/user'">
    <div class="min-h-screen bg-[#f5f7fa] pb-[150px]">
      <!-- 日期选择卡片 -->
      <div class="bg-gradient-to-br from-[#0052D9] to-[#266FE8] p-[32px] text-white">
        <!-- 标题栏 -->
        <div class="flex justify-between items-center mb-[24px]">
          <div>
            <div class="text-[26px] opacity-80">选择日期</div>
            <div class="text-[36px] font-semibold mt-[8px]">{{ formatDisplayDate(selectedDate) }} {{ getWeekDay(selectedDate) }}</div>
          </div>
          <div
            class="w-[60px] h-[60px] bg-white/20 rounded-[16px] flex flex-col items-center justify-center cursor-pointer active:bg-white/30 transition-colors"
            @click="showCalendarPopup = true"
          >
            <CalendarIcon class="text-[26px]" />
            <div class="text-[16px] mt-[2px]">日历</div>
          </div>
        </div>

        <!-- 快速日期选择 -->
        <div class="flex gap-[10px] overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div
            v-for="day in quickDays"
            :key="day.date"
            :class="[
              'flex-shrink-0 text-center py-[16px] px-[20px] rounded-[12px] cursor-pointer transition-all min-w-[80px]',
              day.date === selectedDate ? 'bg-white text-[#0052D9] shadow-lg' : 'bg-white/15 active:bg-white/25'
            ]"
            @click="selectedDate = day.date"
          >
            <div class="text-[18px] opacity-70 mb-[4px]">{{ day.weekLabel }}</div>
            <div class="text-[28px] font-semibold">{{ day.dayNum }}</div>
          </div>
        </div>
      </div>

      <!-- 智能推荐卡片 -->
      <div v-if="recommendedRooms.length > 0" class="px-[32px] pt-[20px]">
        <div class="bg-gradient-to-br from-[#7B61FF]/10 to-[#9B8AFF]/10 rounded-[24px] p-[24px] border border-[#7B61FF]/20">
          <div class="flex items-center gap-[10px] mb-[16px]">
            <div class="w-[40px] h-[40px] bg-gradient-to-br from-[#7B61FF] to-[#9B8AFF] rounded-[10px] flex items-center justify-center">
              <LightbulbIcon class="text-[22px] text-white" />
            </div>
            <div>
              <div class="text-[28px] font-semibold text-[#333]">智能推荐</div>
              <div class="text-[22px] text-[#999]">为您推荐空闲会议室</div>
            </div>
          </div>
          <div class="flex gap-[12px] overflow-x-auto [scrollbar-width:none]">
            <div
              v-for="rec in recommendedRooms"
              :key="rec.room.id"
              class="flex-shrink-0 w-[240px] bg-white rounded-[16px] p-[20px] shadow-sm"
              @click="handleBook(rec.room)"
            >
              <div class="text-[26px] font-semibold text-[#333] mb-[8px]">{{ rec.room.name }}</div>
              <div class="text-[22px] text-[#999] mb-[12px]">{{ rec.room.capacity }}人 · {{ rec.availText }}</div>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-[4px]">
                  <span v-for="n in 5" :key="n" class="text-[18px]" :class="n <= rec.matchScore ? 'text-[#7B61FF]' : 'text-[#ddd]'">★</span>
                </div>
                <div class="text-[22px] text-[#7B61FF]">预定</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 会议室列表 -->
      <div class="px-[32px] pt-[24px]">
        <div class="flex justify-between items-center mb-[20px]">
          <div class="text-[32px] font-semibold text-[#333]">会议室</div>
          <div class="text-[26px] text-[#999]">共 {{ rooms.length }} 间</div>
        </div>

        <div v-if="rooms.length === 0" class="text-center py-[80px]">
          <FolderIcon class="text-[80px] text-[#ddd] mb-[20px]" />
          <div class="text-[28px] text-[#999]">暂无会议室</div>
        </div>

        <div
          v-for="room in rooms"
          :key="room.id"
          class="bg-white rounded-[24px] p-[24px] mb-[16px] shadow-sm"
        >
          <div class="flex justify-between items-start mb-[20px]">
            <div class="flex-1">
              <div class="text-[32px] font-semibold text-[#333] mb-[12px]">{{ room.name }}</div>
              <div class="flex gap-[20px]">
                <div class="flex items-center gap-[6px] text-[24px] text-[#999]">
                  <UserIcon class="text-[26px]" />
                  {{ room.capacity }}人
                </div>
                <div v-if="room.equipment?.length" class="flex items-center gap-[6px] text-[24px] text-[#999]">
                  <ToolsIcon class="text-[26px]" />
                  {{ room.equipment.slice(0, 2).join('、') }}
                </div>
              </div>
            </div>
            <t-button theme="primary" size="medium" class="h-[64px] px-[32px] text-[28px] rounded-[12px]" @click="handleBook(room)">预定</t-button>
          </div>

          <!-- 时间轴 -->
          <div class="pt-[20px] border-t border-[#f0f0f0]">
            <div class="text-[24px] text-[#999] mb-[16px]">{{ selectedDate === todayStr ? '今日' : '当日' }}占用时段</div>
            <div v-if="roomReservations[room.id]?.length" class="flex flex-col gap-[12px]">
              <div
                v-for="r in roomReservations[room.id]"
                :key="r.id"
                class="flex items-center gap-[16px] p-[16px] bg-[#f5f7fa] rounded-[12px]"
              >
                <span class="text-[26px] font-medium text-[#0052D9]">{{ formatTime(r.start) }}-{{ formatTime(r.end) }}</span>
                <span class="text-[26px] text-[#666]">{{ r.subject }}</span>
              </div>
            </div>
            <div v-else class="flex items-center gap-[10px] text-[26px] text-[#00A870]">
              <CheckCircleIcon class="text-[28px]" />
              暂无预定
            </div>
          </div>
        </div>
      </div>

      <!-- 悬浮按钮组 -->
      <div class="fixed right-[32px] bottom-[150px] flex flex-col gap-[16px] z-50">
        <!-- 我的预定 -->
        <div
          class="w-[60px] h-[60px] bg-gradient-to-br from-[#0052D9] to-[#266FE8] rounded-full flex items-center justify-center shadow-lg shadow-[#0052D9]/30 cursor-pointer hover:scale-110 transition-transform"
          @click="router.push('/user/meeting/my')"
        >
          <CalendarIcon class="text-[28px] text-white" />
        </div>
        <!-- 智能推荐 -->
        <div
          class="w-[60px] h-[60px] bg-gradient-to-br from-[#7B61FF] to-[#9B8AFF] rounded-full flex items-center justify-center shadow-lg shadow-[#7B61FF]/30 cursor-pointer hover:scale-110 transition-transform"
          @click="showRecommendPopup = true"
        >
          <LightbulbIcon class="text-[28px] text-white" />
        </div>
      </div>
    </div>

    <!-- 日历选择弹窗 -->
    <t-calendar
      v-model:visible="showCalendarPopup"
      v-model="calendarValue"
      :min-date="minDate"
      :max-date="maxDate"
      type="single"
      title="选择预定日期"
      @confirm="handleCalendarConfirm"
    />

    <!-- 智能推荐弹窗 -->
    <t-popup v-model="showRecommendPopup" placement="bottom" round>
      <div class="bg-white rounded-t-[32px] p-[32px] pb-[48px]">
        <div class="flex items-center justify-between mb-[24px]">
          <div class="flex items-center gap-[12px]">
            <div class="w-[48px] h-[48px] bg-gradient-to-br from-[#7B61FF] to-[#9B8AFF] rounded-[14px] flex items-center justify-center">
              <LightbulbIcon class="text-[26px] text-white" />
            </div>
            <div>
              <div class="text-[32px] font-bold text-[#333]">智能推荐</div>
              <div class="text-[22px] text-[#999]">为您推荐以下会议室</div>
            </div>
          </div>
          <div class="w-[40px] h-[40px] bg-[#f5f5f5] rounded-full flex items-center justify-center" @click="showRecommendPopup = false">
            <ChevronDownIcon class="text-[24px] text-[#999]" />
          </div>
        </div>

        <div v-if="recommendedRooms.length === 0" class="text-center py-[40px]">
          <div class="text-[26px] text-[#999]">暂无推荐</div>
          <div class="text-[22px] text-[#bbb] mt-[8px]">当前时段暂无空闲会议室</div>
        </div>

        <div v-else class="flex flex-col gap-[16px]">
          <div
            v-for="(rec, idx) in recommendedRooms"
            :key="rec.room.id"
            class="p-[20px] bg-[#f8fafc] rounded-[20px] border border-[#e5e5e5]"
          >
            <div class="flex items-start justify-between mb-[12px]">
              <div>
                <div class="flex items-center gap-[8px]">
                  <span class="text-[28px] font-semibold text-[#333]">{{ rec.room.name }}</span>
                  <span class="px-[10px] py-[2px] bg-[#7B61FF]/10 text-[#7B61FF] text-[18px] rounded-[6px]">
                    推荐 {{ idx + 1 }}
                  </span>
                </div>
                <div class="text-[22px] text-[#999] mt-[4px]">
                  {{ rec.room.capacity }}人 · {{ rec.availText }}
                </div>
              </div>
              <div class="flex items-center gap-[4px]">
                <span v-for="n in 5" :key="n" class="text-[18px]" :class="n <= Math.round(rec.matchScore) ? 'text-[#FFB800]' : 'text-[#e5e5e5]'">★</span>
              </div>
            </div>
            <div class="text-[20px] text-[#666] mb-[16px]">
              {{ rec.room.equipment?.length ? '设备：' + rec.room.equipment.join('、') : '' }}
            </div>
            <t-button theme="primary" size="medium" block class="h-[60px] text-[24px] rounded-[12px]" @click="handleQuickBookFromPopup(rec)">
              立即预定
            </t-button>
          </div>
        </div>
      </div>
    </t-popup>
  </Root>
</template>

<script setup>
import { ChevronDownIcon, FolderIcon, UserIcon, ToolsIcon, CheckCircleIcon, CalendarIcon, LightbulbIcon } from "tdesign-icons-vue-next"
import { meetingRoomRepo, reservationRepo, userPreferenceRepo } from "@/db/repositories"
import { useUserStore } from "@/store"
import { useRouter } from "vue-router"
import dayjs from "dayjs"

const router = useRouter()
const userStore = useUserStore()
const today = dayjs()
const todayStr = today.format("YYYY-MM-DD")
const selectedDate = ref(todayStr)
const calendarValue = ref(new Date())
const minDate = new Date()
const maxDate = today.add(365, "day").toDate()
const rooms = ref([])
const roomReservations = ref({})
const recommendedRooms = ref([])
const userPreference = ref(null)
const showRecommendPopup = ref(false)
const showCalendarPopup = ref(false)

const formatTime = (datetime) => datetime.split(' ')[1]
const formatDisplayDate = (date) => dayjs(date).format('MM月DD日')
const getWeekDay = (date) => {
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return weekDays[dayjs(date).day()]
}

// 快速日期选择（显示14天）
const quickDays = computed(() => {
  const days = []
  const weekLabels = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  for (let i = 0; i < 14; i++) {
    const d = today.add(i, 'day')
    days.push({
      date: d.format('YYYY-MM-DD'),
      weekLabel: i === 0 ? '今天' : weekLabels[d.day()],
      dayNum: d.date(),
      isToday: i === 0
    })
  }
  return days
})

// 日历确认选择
const handleCalendarConfirm = (value) => {
  if (value) {
    selectedDate.value = dayjs(value).format('YYYY-MM-DD')
  }
  showCalendarPopup.value = false
}

const loadRooms = async () => { rooms.value = await meetingRoomRepo.findAll() }

const loadReservations = async () => {
  const result = {}
  for (const room of rooms.value) {
    const reservations = await reservationRepo.findByRoomAndDate(room.id, selectedDate.value)
    result[room.id] = reservations.sort((a, b) => a.start.localeCompare(b.start))
  }
  roomReservations.value = result
}

// 计算智能推荐
const calculateRecommendations = async () => {
  if (rooms.value.length === 0) return

  // 获取用户偏好
  userPreference.value = await userPreferenceRepo.findByUserId(userStore.userId)

  const recommendations = []
  const now = dayjs()
  const isTodaySelected = selectedDate.value === todayStr

  for (const room of rooms.value) {
    const reservations = roomReservations.value[room.id] || []

    // 计算空闲时段
    let availHours = 0
    let availSlots = []

    if (reservations.length === 0) {
      // 全天空闲
      availHours = 12 // 8:00-20:00
      availSlots = [{ start: '08:00', end: '20:00' }]
    } else {
      // 计算空闲时段
      let currentTime = '08:00'
      for (const r of reservations) {
        const startTime = formatTime(r.start)
        if (currentTime < startTime) {
          const gapHours = (parseInt(startTime.split(':')[0]) - parseInt(currentTime.split(':')[0]))
          availHours += gapHours
          availSlots.push({ start: currentTime, end: startTime })
        }
        currentTime = formatTime(r.end)
      }
      if (currentTime < '20:00') {
        const gapHours = (20 - parseInt(currentTime.split(':')[0]))
        availHours += gapHours
        availSlots.push({ start: currentTime, end: '20:00' })
      }
    }

    // 如果是今天且当前时间已过，调整空闲时段
    if (isTodaySelected) {
      const currentHour = now.hour()
      availSlots = availSlots.filter(slot => parseInt(slot.start.split(':')[0]) > currentHour)
      availHours = availSlots.reduce((sum, slot) => {
        return sum + (parseInt(slot.end.split(':')[0]) - parseInt(slot.start.split(':')[0]))
      }, 0)
    }

    if (availHours > 0) {
      // 计算匹配度分数
      let matchScore = 3 // 基础分数

      // 根据空闲时间加分
      if (availHours >= 4) matchScore += 1
      if (availHours >= 8) matchScore += 1

      // 根据用户常用会议室加分
      const frequentRooms = userPreference.value?.frequentRooms || []
      if (frequentRooms.includes(room.id)) matchScore += 1

      // 根据会议室容量加分（适中容量更受欢迎）
      if (room.capacity >= 6 && room.capacity <= 12) matchScore += 1

      matchScore = Math.min(5, matchScore)

      // 找一个推荐的空闲时段
      const bestSlot = availSlots.find(s => {
        const startHour = parseInt(s.start.split(':')[0])
        return startHour >= 9 && startHour <= 14 // 推荐9点-14点开始的时段
      }) || availSlots[0]

      recommendations.push({
        room,
        availHours,
        availText: bestSlot ? `${bestSlot.start}-${bestSlot.end} 空闲` : `${availHours}小时空闲`,
        matchScore,
        bestSlot
      })
    }
  }

  // 按匹配度排序
  recommendedRooms.value = recommendations
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3)
}

const handleBook = (room) => {
  router.push({ path: '/user/meeting/create', query: { roomId: room.id, roomName: room.name, date: selectedDate.value } })
}

// 从弹窗快捷预定
const handleQuickBookFromPopup = (rec) => {
  showRecommendPopup.value = false
  router.push({
    path: '/user/meeting/create',
    query: {
      roomId: rec.room.id,
      roomName: rec.room.name,
      date: selectedDate.value,
      startTime: rec.bestSlot?.start,
      endTime: rec.bestSlot?.end
    }
  })
}

watch(selectedDate, async () => {
  await loadReservations()
  await calculateRecommendations()
})

onMounted(async () => {
  await loadRooms()
  await loadReservations()
  await calculateRecommendations()
})
</script>

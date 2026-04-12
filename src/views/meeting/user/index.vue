<template>
  <Root title="会议预定" :back-url="'/user'">
    <div class="min-h-screen bg-[#f5f7fa] pb-[140px]">
      <!-- 日期选择卡片 -->
      <div class="bg-gradient-to-br from-[#0052D9] to-[#266FE8] p-[32px] text-white">
        <div class="flex justify-between items-center mb-[24px]">
          <div class="text-[28px] opacity-80">选择日期</div>
          <div class="flex items-center gap-[8px] text-[30px] font-semibold px-[20px] py-[12px] bg-white/15 rounded-[12px]" @click="showDatePicker = true">
            {{ formatDisplayDate(selectedDate) }}
            <ChevronDownIcon class="text-[28px]" />
          </div>
        </div>

        <!-- 日期滑动区域 -->
        <div class="relative">
          <div class="flex gap-[8px] overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden" ref="dateScrollRef">
            <div
              v-for="day in displayDays"
              :key="day.date"
              :ref="el => { if (day.date === selectedDate) selectedDayRef = el }"
              :class="[
                'flex-shrink-0 text-center py-[16px] px-[12px] rounded-[12px] relative min-w-[70px] cursor-pointer transition-all',
                day.date === selectedDate ? 'bg-white text-[#0052D9]' : 'bg-white/10'
              ]"
              @click="selectedDate = day.date"
            >
              <div class="text-[22px] opacity-80 mb-[8px]">{{ day.weekLabel }}</div>
              <div class="text-[32px] font-semibold">{{ day.dayNum }}</div>
              <div v-if="day.isToday" class="absolute bottom-[8px] left-1/2 -translate-x-1/2 w-[6px] h-[6px] bg-white rounded-full"></div>
            </div>
          </div>
          <!-- 左右滑动按钮 -->
          <div class="absolute left-0 top-1/2 -translate-y-1/2 w-[40px] h-[40px] bg-black/30 rounded-full flex items-center justify-center" @click="scrollDays(-7)">
            <ChevronLeftIcon class="text-[24px] text-white" />
          </div>
          <div class="absolute right-0 top-1/2 -translate-y-1/2 w-[40px] h-[40px] bg-black/30 rounded-full flex items-center justify-center" @click="scrollDays(7)">
            <ChevronRightIcon class="text-[24px] text-white" />
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

      <!-- 底部操作栏 -->
      <div class="fixed bottom-0 left-0 right-0 px-[32px] py-[24px] pb-safe bg-white shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
        <t-button theme="primary" block size="large" class="h-[88px] text-[30px] rounded-[16px]" @click="router.push('/user/meeting/my')">
          <template #icon><CalendarIcon /></template>
          我的预定
        </t-button>
      </div>
    </div>

    <!-- 日期选择弹窗 -->
    <t-popup v-model="showDatePicker" placement="bottom" round>
      <t-date-time-picker
        mode="date"
        :start="datePickerStart"
        :end="datePickerEnd"
        format="YYYY-MM-DD"
        title="选择日期"
        @confirm="handleDateConfirm"
        @cancel="showDatePicker = false"
      />
    </t-popup>
  </Root>
</template>

<script setup>
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, FolderIcon, UserIcon, ToolsIcon, CheckCircleIcon, CalendarIcon, LightbulbIcon } from "tdesign-icons-vue-next"
import { meetingRoomRepo, reservationRepo, userPreferenceRepo } from "@/db/repositories"
import { useUserStore } from "@/store"
import { useRouter } from "vue-router"
import dayjs from "dayjs"

const router = useRouter()
const userStore = useUserStore()
const today = dayjs()
const todayStr = today.format("YYYY-MM-DD")
const selectedDate = ref(todayStr)
const datePickerStart = todayStr
const datePickerEnd = today.add(30, "day").format("YYYY-MM-DD")
const showDatePicker = ref(false)
const rooms = ref([])
const roomReservations = ref({})
const dateScrollRef = ref(null)
const selectedDayRef = ref(null)
const startOffset = ref(0)
const recommendedRooms = ref([])
const userPreference = ref(null)

const displayDays = computed(() => {
  const days = []
  const weekLabels = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  for (let i = startOffset.value; i < startOffset.value + 14; i++) {
    const d = today.add(i, 'day')
    const isToday = i === 0
    days.push({
      date: d.format('YYYY-MM-DD'),
      weekLabel: isToday ? '今天' : weekLabels[d.day()],
      dayNum: d.date(),
      isToday,
      offset: i
    })
  }
  return days
})

const formatDisplayDate = (date) => dayjs(date).format('MM月DD日')
const formatTime = (datetime) => datetime.split(' ')[1]

const scrollDays = (delta) => {
  const newOffset = Math.max(0, Math.min(30 - 14, startOffset.value + delta))
  startOffset.value = newOffset
}

const scrollToSelected = () => {
  nextTick(() => {
    if (selectedDayRef.value) {
      selectedDayRef.value.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    }
  })
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

const handleDateConfirm = (value) => {
  selectedDate.value = value
  showDatePicker.value = false
  const offset = dayjs(value).diff(today, 'day')
  if (offset < startOffset.value) {
    startOffset.value = Math.max(0, offset - 3)
  } else if (offset >= startOffset.value + 14) {
    startOffset.value = Math.min(30 - 14, offset - 10)
  }
  loadReservations()
}

const handleBook = (room) => {
  router.push({ path: '/user/meeting/create', query: { roomId: room.id, roomName: room.name, date: selectedDate.value } })
}

watch(selectedDate, async () => {
  await loadReservations()
  await calculateRecommendations()
  scrollToSelected()
})

onMounted(async () => {
  await loadRooms()
  await loadReservations()
  await calculateRecommendations()
})
</script>

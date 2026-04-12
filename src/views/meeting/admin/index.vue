<template>
  <Root title="会议管理" back-url="/admin">
    <div class="min-h-screen bg-[#f5f7fa]">
      <!-- 日期选择 -->
      <div class="bg-gradient-to-br from-[#0052D9] to-[#266FE8] p-[32px] text-white">
        <div class="flex justify-between items-center">
          <div class="text-[28px] opacity-80">选择日期</div>
          <div class="flex items-center gap-[8px] text-[30px] font-semibold px-[20px] py-[12px] bg-white/15 rounded-[12px]" @click="showDatePicker = true">
            {{ formatDisplayDate(selectedDate) }}
            <ChevronDownIcon class="text-[28px]" />
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="p-[24px] px-[32px]">
        <t-button theme="primary" class="h-[80px] text-[28px] rounded-[16px]" @click="router.push('/admin/meeting/rooms')">
          <template #icon><SettingIcon /></template>
          会议室管理
        </t-button>
      </div>

      <!-- 统计概览 -->
      <div class="mx-[32px] flex items-center p-[28px] bg-white rounded-[24px] shadow-sm">
        <div class="flex-1 text-center">
          <div class="text-[44px] font-bold text-[#0052D9] mb-[8px]">{{ reservations.length }}</div>
          <div class="text-[24px] text-[#666]">{{ selectedDate === todayStr ? '今日' : '当日' }}预定</div>
        </div>
        <div class="w-[1px] h-[60px] bg-[#eee]"></div>
        <div class="flex-1 text-center">
          <div class="text-[44px] font-bold text-[#0052D9] mb-[8px]">{{ futureReservations.length }}</div>
          <div class="text-[24px] text-[#666]">未来7天预定</div>
        </div>
        <div class="w-[1px] h-[60px] bg-[#eee]"></div>
        <div class="flex-1 text-center">
          <div class="text-[44px] font-bold text-[#0052D9] mb-[8px]">{{ rooms.length }}</div>
          <div class="text-[24px] text-[#666]">会议室</div>
        </div>
      </div>

      <!-- 当日预定列表 -->
      <div class="p-[24px] px-[32px]">
        <div class="text-[32px] font-semibold text-[#333] mb-[20px]">{{ selectedDate === todayStr ? '今日' : '当日' }}预定</div>

        <div v-if="reservations.length === 0" class="text-center py-[60px]">
          <CheckCircleIcon class="text-[60px] text-[#00A870] mb-[16px]" />
          <div class="text-[28px] text-[#999]">暂无预定</div>
        </div>

        <div v-for="r in reservations" :key="r.id" class="bg-white rounded-[24px] mb-[16px] overflow-hidden shadow-sm">
          <div class="flex justify-between items-center p-[24px] bg-gradient-to-br from-[#f5f7fa] to-[#e8ecf0]">
            <div class="text-[30px] font-semibold text-[#333]">{{ r.subject }}</div>
            <t-button theme="danger" variant="outline" size="small" @click="handleDelete(r)">删除</t-button>
          </div>
          <div class="p-[20px] px-[24px]">
            <div class="flex items-center gap-[12px] text-[26px] text-[#666] mb-[12px]">
              <LocationIcon class="text-[28px] text-[#0052D9]" />
              <span>{{ getRoomName(r.roomId) }}</span>
            </div>
            <div class="flex items-center gap-[12px] text-[26px] text-[#666] mb-[12px]">
              <UserIcon class="text-[28px] text-[#0052D9]" />
              <span>{{ getUserName(r.userId) }}</span>
            </div>
            <div class="flex items-center gap-[12px] text-[26px] text-[#666]">
              <TimeIcon class="text-[28px] text-[#0052D9]" />
              <span>{{ formatTime(r.start) }} - {{ formatTime(r.end) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 未来预定列表 -->
      <div class="p-[24px] px-[32px] pt-0">
        <div class="text-[32px] font-semibold text-[#333] mb-[20px]">未来7天预定</div>

        <div v-if="futureReservations.length === 0" class="text-center py-[60px] bg-white rounded-[24px]">
          <CalendarIcon class="text-[60px] text-[#ddd] mb-[16px]" />
          <div class="text-[28px] text-[#999]">暂无未来预定</div>
        </div>

        <div v-for="r in futureReservations" :key="'future-'+r.id" class="bg-white rounded-[24px] mb-[16px] overflow-hidden shadow-sm">
          <div class="flex justify-between items-center p-[24px] bg-gradient-to-br from-[#e3f2fd] to-[#bbdefb]">
            <div class="text-[30px] font-semibold text-[#333]">{{ r.subject }}</div>
            <div class="text-[24px] text-[#0052D9] font-medium">{{ formatDate(r.start) }}</div>
          </div>
          <div class="p-[20px] px-[24px]">
            <div class="flex items-center gap-[12px] text-[26px] text-[#666] mb-[12px]">
              <LocationIcon class="text-[28px] text-[#0052D9]" />
              <span>{{ getRoomName(r.roomId) }}</span>
            </div>
            <div class="flex items-center gap-[12px] text-[26px] text-[#666] mb-[12px]">
              <UserIcon class="text-[28px] text-[#0052D9]" />
              <span>{{ getUserName(r.userId) }}</span>
            </div>
            <div class="flex items-center gap-[12px] text-[26px] text-[#666]">
              <TimeIcon class="text-[28px] text-[#0052D9]" />
              <span>{{ formatTime(r.start) }} - {{ formatTime(r.end) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 日期选择弹窗 -->
    <t-popup v-model="showDatePicker" placement="bottom" round>
      <t-date-time-picker mode="date" :start="datePickerStart" :end="datePickerEnd" format="YYYY-MM-DD" title="选择日期" @confirm="handleDateConfirm" @cancel="showDatePicker = false" />
    </t-popup>
  </Root>
</template>

<script setup>
import { ChevronDownIcon, SettingIcon, CheckCircleIcon, CalendarIcon, LocationIcon, UserIcon, TimeIcon } from "tdesign-icons-vue-next"
import { reservationRepo, meetingRoomRepo, userRepo } from "@/db/repositories"
import { showToast, showConfirmDialog } from "@/utils/common/tools"
import { useRouter } from "vue-router"
import dayjs from "dayjs"

const router = useRouter()
const today = dayjs()
const todayStr = today.format("YYYY-MM-DD")
const selectedDate = ref(todayStr)
const datePickerStart = todayStr
const datePickerEnd = today.add(90, "day").format("YYYY-MM-DD")
const showDatePicker = ref(false)
const reservations = ref([])
const allReservations = ref([])
const rooms = ref([])
const users = ref([])

const formatDisplayDate = (date) => dayjs(date).format('MM月DD日 dddd')
const formatTime = (datetime) => datetime.split(" ")[1]
const formatDate = (datetime) => {
  const date = datetime.split(" ")[0]
  const d = dayjs(date)
  const isToday = date === todayStr
  const isTomorrow = date === today.add(1, 'day').format('YYYY-MM-DD')
  if (isToday) return '今天'
  if (isTomorrow) return '明天'
  return d.format('MM月DD日')
}
const getRoomName = (roomId) => rooms.value.find(r => r.id === roomId)?.name || '未知会议室'
const getUserName = (userId) => users.value.find(u => u.id === userId)?.name || '未知用户'

// 当日预定
const loadReservations = async () => {
  reservations.value = allReservations.value.filter(r => r.start.startsWith(selectedDate.value)).sort((a, b) => a.start.localeCompare(b.start))
}

// 未来7天预定（不包含当日）
const futureReservations = computed(() => {
  const startDate = today.add(1, 'day').format('YYYY-MM-DD')
  const endDate = today.add(7, 'day').format('YYYY-MM-DD')
  return allReservations.value
    .filter(r => {
      const date = r.start.split(' ')[0]
      return date >= startDate && date <= endDate
    })
    .sort((a, b) => a.start.localeCompare(b.start))
})

const handleDateConfirm = (value) => {
  // TDesign DateTimePicker 返回的是字符串格式 YYYY-MM-DD
  selectedDate.value = typeof value === 'string' ? value : dayjs(value).format('YYYY-MM-DD')
  showDatePicker.value = false
  loadReservations()
}

const handleDelete = async (r) => {
  try {
    await showConfirmDialog({ content: `确定删除预定「${r.subject}」吗？` })
    await reservationRepo.delete(r.id)
    showToast('已删除')
    loadAllReservations()
  } catch (e) {
    // 用户取消操作
  }
}

const loadAllReservations = async () => {
  allReservations.value = await reservationRepo.findAll()
  loadReservations()
}

onMounted(async () => {
  rooms.value = await meetingRoomRepo.findAll()
  users.value = await userRepo.findAll()
  await loadAllReservations()
})
</script>

<template>
  <Root title="打卡日历" back-url="/user/attendance">
    <div class="min-h-screen bg-[#f5f7fa]">
      <!-- 月份导航 -->
      <div class="flex justify-between items-center p-[24px] px-[32px] bg-white">
        <t-button theme="default" size="small" @click="prevMonth"><ChevronLeftIcon /></t-button>
        <div class="text-[34px] font-semibold text-[#333]">{{ currentMonthFormatted }}</div>
        <t-button theme="default" size="small" @click="nextMonth"><ChevronRightIcon /></t-button>
      </div>

      <!-- 日历视图 -->
      <div class="mx-[32px] bg-white rounded-[24px] p-[24px] shadow-sm">
        <div class="grid grid-cols-7 mb-[16px]">
          <div v-for="w in ['日','一','二','三','四','五','六']" :key="w" class="text-center text-[24px] text-[#999] py-[8px]">{{ w }}</div>
        </div>
        <div class="grid grid-cols-7 gap-[8px]">
          <div v-for="day in calendarDays" :key="day.date"
            :class="['aspect-square flex flex-col items-center justify-center rounded-[12px] transition-all', {
              'opacity-30': !day.isCurrentMonth,
              'bg-gradient-to-br from-[#0052D9] to-[#266FE8] text-white': day.isToday,
              'bg-[#E8F5E9] text-[#00A870]': day.isNormal,
              'bg-[#FFF3E0] text-[#ED7B2F]': day.isLate,
              'bg-[#FFEBEE] text-[#E34D59]': day.isAbsent,
              'bg-[#E3F2FD] text-[#0052D9]': day.isLeave
            }]">
            <div class="text-[28px] font-semibold">{{ day.day }}</div>
            <div class="mt-[4px]">
              <CheckCircleIcon v-if="day.isNormal" class="text-[20px]" />
              <TimeFilledIcon v-else-if="day.isLate" class="text-[20px]" />
              <CloseCircleIcon v-else-if="day.isAbsent" class="text-[20px]" />
              <span v-else-if="day.isLeave" class="text-[18px]">假</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 状态说明 -->
      <div class="flex justify-center gap-[24px] p-[20px]">
        <div class="flex items-center gap-[8px] text-[24px] text-[#666]">
          <CheckCircleIcon class="text-[#00A870] text-[20px]" />
          <span>正常</span>
        </div>
        <div class="flex items-center gap-[8px] text-[24px] text-[#666]">
          <TimeFilledIcon class="text-[#ED7B2F] text-[20px]" />
          <span>迟到</span>
        </div>
        <div class="flex items-center gap-[8px] text-[24px] text-[#666]">
          <CloseCircleIcon class="text-[#E34D59] text-[20px]" />
          <span>缺卡</span>
        </div>
        <div class="flex items-center gap-[8px] text-[24px] text-[#666]">
          <div class="w-[16px] h-[16px] rounded-[4px] bg-[#0052D9]"></div>
          <span>请假</span>
        </div>
      </div>

      <!-- 本月统计 -->
      <div class="mx-[32px] bg-white rounded-[24px] p-[24px] shadow-sm">
        <div class="text-[28px] font-semibold text-[#333] mb-[20px]">本月统计</div>
        <div class="grid grid-cols-4 gap-[16px]">
          <div class="text-center">
            <div class="text-[40px] font-bold text-[#00A870]">{{ stats.normal }}</div>
            <div class="text-[24px] text-[#666] mt-[8px]">正常</div>
          </div>
          <div class="text-center">
            <div class="text-[40px] font-bold text-[#ED7B2F]">{{ stats.late }}</div>
            <div class="text-[24px] text-[#666] mt-[8px]">迟到</div>
          </div>
          <div class="text-center">
            <div class="text-[40px] font-bold text-[#E34D59]">{{ stats.absent }}</div>
            <div class="text-[24px] text-[#666] mt-[8px]">缺卡</div>
          </div>
          <div class="text-center">
            <div class="text-[40px] font-bold text-[#0052D9]">{{ stats.leave }}</div>
            <div class="text-[24px] text-[#666] mt-[8px]">请假</div>
          </div>
        </div>
      </div>
    </div>
  </Root>
</template>

<script setup>
import { ChevronLeftIcon, ChevronRightIcon, CheckCircleIcon, CloseCircleIcon, TimeFilledIcon } from "tdesign-icons-vue-next"
import { attendanceRepo, leaveRepo } from "@/db/repositories"
import { useUserStore } from "@/store"
import dayjs from "dayjs"

const userStore = useUserStore()
const currentMonth = ref(dayjs().format("YYYY-MM"))
const currentMonthFormatted = computed(() => dayjs(currentMonth.value).format('YYYY年MM月'))
const attendanceRecords = ref([])
const leaveRecords = ref([])
const calendarDays = ref([])
const stats = ref({ normal: 0, late: 0, absent: 0, leave: 0 })

const generateCalendar = async () => {
  const monthStart = dayjs(currentMonth.value).startOf("month")
  const monthEnd = dayjs(currentMonth.value).endOf("month")
  const daysInMonth = monthEnd.date()
  const startWeekday = monthStart.day()
  const days = []
  const today = dayjs().format("YYYY-MM-DD")

  for (let i = 0; i < startWeekday; i++) {
    const prevDay = monthStart.subtract(startWeekday - i, "day")
    days.push({ date: prevDay.format("YYYY-MM-DD"), day: prevDay.date(), isCurrentMonth: false })
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const date = dayjs(currentMonth.value).date(i).format("YYYY-MM-DD")
    const record = attendanceRecords.value.find(r => r.date === date)
    const leave = leaveRecords.value.find(l => l.status === "approved" && date >= l.startDate && date <= l.endDate)
    days.push({
      date, day: i, isCurrentMonth: true, isToday: date === today, isLeave: !!leave,
      isNormal: !leave && record?.checkInTime && record?.checkOutTime && !record?.isLate,
      isLate: !leave && record?.isLate, isAbsent: !leave && !record?.checkInTime
    })
  }

  calendarDays.value = days
  stats.value = { normal: days.filter(d => d.isCurrentMonth && d.isNormal).length, late: days.filter(d => d.isCurrentMonth && d.isLate).length, absent: days.filter(d => d.isCurrentMonth && d.isAbsent).length, leave: days.filter(d => d.isCurrentMonth && d.isLeave).length }
}

const loadData = async () => {
  attendanceRecords.value = await attendanceRepo.findByUserAndMonth(userStore.userId, currentMonth.value)
  leaveRecords.value = await leaveRepo.findByUserId(userStore.userId)
  generateCalendar()
}

const prevMonth = () => { currentMonth.value = dayjs(currentMonth.value).subtract(1, "month").format("YYYY-MM"); loadData() }
const nextMonth = () => { currentMonth.value = dayjs(currentMonth.value).add(1, "month").format("YYYY-MM"); loadData() }

onMounted(() => loadData())
</script>

<template>
  <Root title="考勤打卡" back-url="/user">
    <div class="min-h-screen bg-[#f5f7fa]">
      <!-- 今日打卡状态 -->
      <div class="bg-gradient-to-br from-[#0052D9] to-[#266FE8] p-[32px] text-white">
        <!-- 上班时间提示 -->
        <div class="text-center mb-[24px]">
          <div class="text-[32px] font-semibold mb-[8px]">{{ todayFormatted }}</div>
          <div class="text-[26px] opacity-80">{{ weekText }}</div>
          <div class="mt-[16px] inline-flex items-center gap-[12px] px-[24px] py-[10px] bg-white/15 rounded-[24px]">
            <TimeIcon class="text-[24px]" />
            <span class="text-[24px]">工作时间 {{ workStartTime }} - {{ workEndTime }}</span>
          </div>
        </div>

        <div class="flex gap-[20px]">
          <!-- 上班打卡 -->
          <div :class="['flex-1 p-[32px] text-center rounded-[24px] cursor-pointer transition-all', todayRecord?.checkInTime ? (todayRecord?.isLate ? 'bg-white/95 text-[#E34D59]' : 'bg-white/95 text-[#00A870]') : 'bg-white/15']" @click="handleCheckIn">
            <component :is="todayRecord?.checkInTime ? CheckCircleIcon : TimeFilledIcon" class="text-[48px] mb-[16px]" />
            <div class="text-[48px] font-bold mb-[12px]">{{ todayRecord?.checkInTime || '--:--' }}</div>
            <div class="text-[26px] opacity-90">{{ todayRecord?.checkInTime ? '已上班打卡' : '上班打卡' }}</div>
            <div v-if="todayRecord?.isLate" class="text-[22px] mt-[12px] bg-[#FFEBEE] text-[#E34D59] py-[6px] px-[16px] rounded-[12px] inline-block">迟到</div>
          </div>
          <!-- 下班打卡 -->
          <div :class="['flex-1 p-[32px] text-center rounded-[24px] cursor-pointer transition-all', todayRecord?.checkOutTime ? (todayRecord?.isEarlyLeave ? 'bg-white/95 text-[#ED7B2F]' : 'bg-white/95 text-[#00A870]') : 'bg-white/15']" @click="handleCheckOut">
            <component :is="todayRecord?.checkOutTime ? CheckCircleIcon : TimeFilledIcon" class="text-[48px] mb-[16px]" />
            <div class="text-[48px] font-bold mb-[12px]">{{ todayRecord?.checkOutTime || '--:--' }}</div>
            <div class="text-[26px] opacity-90">{{ todayRecord?.checkOutTime ? '已下班打卡' : '下班打卡' }}</div>
            <div v-if="todayRecord?.isEarlyLeave" class="text-[22px] mt-[12px] bg-[#FFF3E0] text-[#ED7B2F] py-[6px] px-[16px] rounded-[12px] inline-block">早退</div>
          </div>
        </div>
        <div v-if="!todayRecord?.checkInTime && !todayRecord?.checkOutTime" class="text-center mt-[24px] text-[26px] opacity-80">请先完成上班打卡</div>
      </div>

      <!-- 智能提醒卡片 -->
      <div class="px-[32px] pt-[20px]">
        <!-- 假期过期提醒 -->
        <div v-if="leaveExpirationWarning" class="bg-gradient-to-br from-[#FF7D7D]/10 to-[#FFA8A8]/10 rounded-[24px] p-[24px] mb-[16px] border border-[#FF7D7D]/20">
          <div class="flex items-center gap-[12px] mb-[12px]">
            <div class="w-[40px] h-[40px] bg-gradient-to-br from-[#FF7D7D] to-[#FFA8A8] rounded-[10px] flex items-center justify-center">
              <ErrorCircleIcon class="text-[22px] text-white" />
            </div>
            <div class="text-[28px] font-semibold text-[#E34D59]">假期即将过期</div>
          </div>
          <div class="text-[26px] text-[#666] mb-[16px]">{{ leaveExpirationWarning }}</div>
          <div class="inline-flex items-center gap-[8px] px-[20px] py-[10px] bg-[#E34D59] rounded-[12px]" @click="router.push('/user/leave')">
            <span class="text-[24px] text-white">立即请假</span>
          </div>
        </div>

        <!-- 连休推荐 -->
        <div v-if="continuousLeaveRecommendations.length > 0" class="bg-gradient-to-br from-[#7B61FF]/10 to-[#9B8AFF]/10 rounded-[24px] p-[24px] mb-[16px] border border-[#7B61FF]/20">
          <div class="flex items-center gap-[12px] mb-[16px]">
            <div class="w-[40px] h-[40px] bg-gradient-to-br from-[#7B61FF] to-[#9B8AFF] rounded-[10px] flex items-center justify-center">
              <LightbulbIcon class="text-[22px] text-white" />
            </div>
            <div>
              <div class="text-[28px] font-semibold text-[#333]">连休推荐</div>
              <div class="text-[22px] text-[#999]">请假效益最大化</div>
            </div>
          </div>
          <div class="flex flex-col gap-[12px]">
            <div
              v-for="(rec, index) in continuousLeaveRecommendations"
              :key="index"
              class="flex items-center justify-between p-[16px] bg-white rounded-[12px] shadow-sm"
              @click="applyContinuousLeave(rec)"
            >
              <div>
                <div class="text-[26px] font-medium text-[#333]">{{ rec.reason }}</div>
                <div class="text-[22px] text-[#999]">{{ formatDate(rec.suggestDate) }} 请假</div>
              </div>
              <div class="flex items-center gap-[8px]">
                <span class="text-[24px] text-[#7B61FF] font-semibold">连休{{ rec.totalDays }}天</span>
                <ChevronRightIcon class="text-[24px] text-[#ccc]" />
              </div>
            </div>
          </div>
        </div>

        <!-- 补卡提醒 -->
        <div v-if="missedCheckIns.length > 0" class="bg-gradient-to-br from-[#ED7B2F]/10 to-[#F09143]/10 rounded-[24px] p-[24px] mb-[16px] border border-[#ED7B2F]/20">
          <div class="flex items-center gap-[12px] mb-[16px]">
            <div class="w-[40px] h-[40px] bg-gradient-to-br from-[#ED7B2F] to-[#F09143] rounded-[10px] flex items-center justify-center">
              <InfoCircleIcon class="text-[22px] text-white" />
            </div>
            <div>
              <div class="text-[28px] font-semibold text-[#333]">补卡提醒</div>
              <div class="text-[22px] text-[#999]">您有 {{ missedCheckIns.length }} 天未打卡</div>
            </div>
          </div>
          <div class="flex flex-wrap gap-[12px]">
            <div
              v-for="missed in missedCheckIns.slice(0, 3)"
              :key="missed.date"
              class="px-[16px] py-[10px] bg-white rounded-[12px] shadow-sm"
              @click="quickMakeUp(missed)"
            >
              <div class="text-[24px] text-[#333]">{{ missed.label }}</div>
              <div class="text-[20px] text-[#ED7B2F]">申请补卡</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 假期余额 -->
      <div class="p-[24px] px-[32px]">
        <div class="text-[30px] font-semibold text-[#333] mb-[20px]">假期余额</div>
        <div class="flex gap-[16px]">
          <div class="flex-1 flex items-center gap-[16px] bg-white rounded-[24px] p-[24px] shadow-sm">
            <div class="w-[56px] h-[56px] rounded-[14px] bg-gradient-to-br from-[#0052D9] to-[#266FE8] flex items-center justify-center text-[26px] font-semibold text-white">年</div>
            <div>
              <div class="text-[36px] font-bold text-[#333]">{{ userStore.annualLeaveBalance }}</div>
              <div class="text-[22px] text-[#999] mt-[4px]">年假（天）</div>
            </div>
          </div>
          <div class="flex-1 flex items-center gap-[16px] bg-white rounded-[24px] p-[24px] shadow-sm">
            <div class="w-[56px] h-[56px] rounded-[14px] bg-gradient-to-br from-[#00A870] to-[#2BA471] flex items-center justify-center text-[26px] font-semibold text-white">病</div>
            <div>
              <div class="text-[36px] font-bold text-[#333]">{{ userStore.sickLeaveBalance }}</div>
              <div class="text-[22px] text-[#999] mt-[4px]">病假（天）</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 快捷操作 -->
      <div class="grid grid-cols-4 gap-[16px] px-[32px] pb-[32px]">
        <div class="bg-white rounded-[24px] p-[24px] px-[12px] text-center shadow-sm" @click="router.push('/user/leave')">
          <div class="w-[56px] h-[56px] mx-auto mb-[12px] rounded-[14px] bg-gradient-to-br from-[#0052D9] to-[#266FE8] flex items-center justify-center text-[28px] text-white"><CalendarIcon /></div>
          <div class="text-[24px] text-[#333]">请假申请</div>
        </div>
        <div class="bg-white rounded-[24px] p-[24px] px-[12px] text-center shadow-sm" @click="router.push('/user/attendance/calendar')">
          <div class="w-[56px] h-[56px] mx-auto mb-[12px] rounded-[14px] bg-gradient-to-br from-[#00A870] to-[#2BA471] flex items-center justify-center text-[28px] text-white"><ViewListIcon /></div>
          <div class="text-[24px] text-[#333]">打卡日历</div>
        </div>
        <div class="bg-white rounded-[24px] p-[24px] px-[12px] text-center shadow-sm" @click="router.push('/user/makeup')">
          <div class="w-[56px] h-[56px] mx-auto mb-[12px] rounded-[14px] bg-gradient-to-br from-[#ED7B2F] to-[#F09143] flex items-center justify-center text-[28px] text-white"><RefreshIcon /></div>
          <div class="text-[24px] text-[#333]">补卡申请</div>
        </div>
        <div class="bg-white rounded-[24px] p-[24px] px-[12px] text-center shadow-sm" @click="router.push('/user/leave')">
          <div class="w-[56px] h-[56px] mx-auto mb-[12px] rounded-[14px] bg-gradient-to-br from-[#E34D59] to-[#F06956] flex items-center justify-center text-[28px] text-white"><FileIcon /></div>
          <div class="text-[24px] text-[#333]">请假记录</div>
        </div>
      </div>
    </div>
  </Root>
</template>

<script setup>
import { TimeFilledIcon, TimeIcon, CheckCircleIcon, CalendarIcon, ViewListIcon, RefreshIcon, FileIcon, LightbulbIcon, ErrorCircleIcon, InfoCircleIcon, ChevronRightIcon } from "tdesign-icons-vue-next"
import { attendanceRepo, attendanceConfigRepo, holidayConfigRepo, leaveRepo } from "@/db/repositories"
import { useUserStore } from "@/store"
import { showToast, showErrorDialog, vibrateWithSettings, VIBRATE_PATTERNS } from "@/utils/common/tools"
import { useRouter } from "vue-router"
import dayjs from "dayjs"

const router = useRouter()

const userStore = useUserStore()
const today = dayjs()
const todayFormatted = today.format('YYYY年MM月DD日')
const weekText = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][today.day()]
const todayDate = today.format('YYYY-MM-DD')

const todayRecord = ref(null)
const workStartTime = ref('09:00')
const workEndTime = ref('18:00')
const continuousLeaveRecommendations = ref([])
const missedCheckIns = ref([])
const leaveExpirationWarning = ref('')

const loadTodayRecord = async () => {
  todayRecord.value = await attendanceRepo.findByUserAndDate(userStore.userId, todayDate)
  workStartTime.value = await attendanceConfigRepo.getWorkStartTime()
  workEndTime.value = await attendanceConfigRepo.getWorkEndTime()
}

// 加载连休推荐
const loadContinuousLeaveRecommendations = async () => {
  if (userStore.annualLeaveBalance > 0) {
    continuousLeaveRecommendations.value = await holidayConfigRepo.getContinuousLeaveRecommendations(userStore.annualLeaveBalance)
  }
}

// 检查漏打卡
const checkMissedCheckIns = async () => {
  const records = await attendanceRepo.findByUserId(userStore.userId)
  const recordDates = new Set(records.map(r => r.date))

  const missed = []
  // 检查最近7个工作日
  for (let i = 1; i <= 14 && missed.length < 5; i++) {
    const checkDate = today.subtract(i, 'day')
    const dateStr = checkDate.format('YYYY-MM-DD')

    // 跳过周末
    const day = checkDate.day()
    if (day === 0 || day === 6) continue

    // 检查是否节假日
    const isWorkday = await holidayConfigRepo.isWorkday(dateStr)
    if (!isWorkday) continue

    // 检查是否已打卡
    if (!recordDates.has(dateStr)) {
      missed.push({
        date: dateStr,
        label: checkDate.format('MM月DD日')
      })
    }
  }

  missedCheckIns.value = missed
}

// 检查假期过期
const checkLeaveExpiration = async () => {
  // 获取用户信息，检查年假余额
  if (userStore.annualLeaveBalance > 0) {
    // 假设年假在年底过期
    const currentYear = today.year()
    const endOfYear = dayjs(`${currentYear}-12-31`)
    const daysUntilExpiry = endOfYear.diff(today, 'day')

    if (daysUntilExpiry <= 60 && daysUntilExpiry > 0) {
      leaveExpirationWarning.value = `您的${userStore.annualLeaveBalance}天年假将在${daysUntilExpiry}天后过期，请及时使用！`
    }
  }
}

const formatDate = (date) => dayjs(date).format('MM月DD日')

// 申请连休
const applyContinuousLeave = (rec) => {
  router.push({
    path: '/user/leave/create',
    query: {
      date: rec.suggestDate,
      days: rec.leaveDays
    }
  })
}

// 快速补卡
const quickMakeUp = (missed) => {
  router.push({
    path: '/user/makeup',
    query: {
      date: missed.date
    }
  })
}

const handleCheckIn = async () => {
  if (todayRecord.value?.checkInTime) { showToast('今日已上班打卡'); return }
  try {
    await attendanceRepo.checkIn(userStore.userId, workStartTime.value)
    vibrateWithSettings(VIBRATE_PATTERNS.success)
    showToast('上班打卡成功')
    loadTodayRecord()
  } catch (error) { showErrorDialog(error.message || '打卡失败') }
}

const handleCheckOut = async () => {
  if (!todayRecord.value?.checkInTime) { showToast('请先上班打卡'); return }
  if (todayRecord.value?.checkOutTime) { showToast('今日已下班打卡'); return }
  try {
    await attendanceRepo.checkOut(userStore.userId, workEndTime.value)
    vibrateWithSettings(VIBRATE_PATTERNS.success)
    showToast('下班打卡成功')
    loadTodayRecord()
  } catch (error) { showErrorDialog(error.message || '打卡失败') }
}

onMounted(async () => {
  await loadTodayRecord()
  await loadContinuousLeaveRecommendations()
  await checkMissedCheckIns()
  await checkLeaveExpiration()
})
</script>

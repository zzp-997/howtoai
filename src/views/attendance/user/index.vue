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
      <div class="grid grid-cols-4 gap-[16px] px-[32px]">
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
import { TimeFilledIcon, TimeIcon, CheckCircleIcon, CalendarIcon, ViewListIcon, RefreshIcon, FileIcon } from "tdesign-icons-vue-next"
import { attendanceRepo, attendanceConfigRepo } from "@/db/repositories"
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

const loadTodayRecord = async () => {
  todayRecord.value = await attendanceRepo.findByUserAndDate(userStore.userId, todayDate)
  workStartTime.value = await attendanceConfigRepo.getWorkStartTime()
  workEndTime.value = await attendanceConfigRepo.getWorkEndTime()
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

onMounted(() => loadTodayRecord())
</script>

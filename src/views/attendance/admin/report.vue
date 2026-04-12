<template>
  <Root title="考勤报表" back-url="/admin/attendance">
    <div class="min-h-screen bg-[#f5f7fa]">
      <!-- 月份选择 -->
      <div class="flex justify-between items-center mx-[32px] bg-white rounded-[24px] p-[24px] mb-[20px] shadow-sm">
        <t-button theme="default" size="small" @click="prevMonth"><ChevronLeftIcon /></t-button>
        <div class="text-[32px] font-semibold text-[#333]">{{ currentMonthFormatted }}</div>
        <t-button theme="default" size="small" @click="nextMonth"><ChevronRightIcon /></t-button>
      </div>

      <!-- 用户考勤统计 -->
      <div class="mx-[32px] bg-white rounded-[24px] p-[24px] mb-[20px] shadow-sm">
        <div class="text-[28px] font-semibold text-[#333] mb-[20px]">用户考勤统计</div>
        <div v-for="user in users.filter(u => u.role === 'user')" :key="user.id" class="py-[25px] border-b border-[#eee] last:border-b-0">
          <div class="text-[28px] font-medium text-[#333] mb-[15px]">{{ user.name }}</div>
          <div class="grid grid-cols-4 gap-[15px] text-center">
            <div>
              <div class="text-[28px] font-bold text-[#00A870]">{{ getUserStats(user.id).normal }}</div>
              <div class="text-[24px] text-[#666]">正常</div>
            </div>
            <div>
              <div class="text-[28px] font-bold text-[#E34D59]">{{ getUserStats(user.id).late }}</div>
              <div class="text-[24px] text-[#666]">迟到</div>
            </div>
            <div>
              <div class="text-[28px] font-bold text-[#999]">{{ getUserStats(user.id).absent }}</div>
              <div class="text-[24px] text-[#666]">缺卡</div>
            </div>
            <div>
              <div class="text-[28px] font-bold text-[#ED7B2F]">{{ getUserStats(user.id).leave }}</div>
              <div class="text-[24px] text-[#666]">请假</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 导出按钮 -->
      <div class="mx-[32px]">
        <t-button theme="primary" block size="large" class="h-[88px] text-[30px] rounded-[24px]" @click="exportCSV">导出 CSV 报表</t-button>
      </div>
    </div>
  </Root>
</template>

<script setup>
import { ChevronLeftIcon, ChevronRightIcon } from "tdesign-icons-vue-next"
import { attendanceRepo, userRepo, leaveRepo } from "@/db/repositories"
import { showToast } from "@/utils/common/tools"
import dayjs from "dayjs"

const currentMonth = ref(dayjs().format("YYYY-MM"))
const currentMonthFormatted = computed(() => dayjs(currentMonth.value).format('YYYY年MM月'))
const users = ref([])
const attendanceRecords = ref([])
const leaveRecords = ref([])

const getUserStats = (userId) => {
  const records = attendanceRecords.value.filter(r => r.userId === userId)
  const leaves = leaveRecords.value.filter(l => l.userId === userId && l.status === "approved" && (l.startDate.startsWith(currentMonth.value) || l.endDate.startsWith(currentMonth.value)))
  return {
    normal: records.filter(r => r.checkInTime && r.checkOutTime && !r.isLate).length,
    late: records.filter(r => r.isLate).length,
    absent: records.filter(r => !r.checkInTime || !r.checkOutTime).length,
    leave: leaves.length
  }
}

const loadData = async () => {
  users.value = await userRepo.findAll()
  attendanceRecords.value = await attendanceRepo.getMonthlyReport(currentMonth.value)
  leaveRecords.value = await leaveRepo.findAll()
}

const prevMonth = () => { currentMonth.value = dayjs(currentMonth.value).subtract(1, "month").format("YYYY-MM"); loadData() }
const nextMonth = () => { currentMonth.value = dayjs(currentMonth.value).add(1, "month").format("YYYY-MM"); loadData() }

const exportCSV = () => {
  const csvRows = [["姓名", "正常天数", "迟到天数", "缺卡天数", "请假天数"]]
  users.value.filter(u => u.role === "user").forEach(user => {
    const stats = getUserStats(user.id)
    csvRows.push([user.name, stats.normal, stats.late, stats.absent, stats.leave])
  })
  const csvContent = csvRows.map(row => row.join(",")).join("\n")
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a"); link.href = url; link.download = `考勤报表_${currentMonth.value}.csv`; link.click()
  URL.revokeObjectURL(url)
  showToast("导出成功")
}

onMounted(() => loadData())
</script>

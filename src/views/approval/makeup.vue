<template>
  <Root title="补卡审批" back-url="/admin/approval">
    <div class="approval-makeup-page p-[24px] px-[32px]">
      <!-- 筛选 Tab -->
      <div class="flex mb-[30px] bg-white rounded-[24px] p-[8px]">
        <div
          v-for="tab in statusTabs"
          :key="tab.value"
          :class="[
            'flex-1 text-center py-[15px] rounded-[12px] text-[26px] transition-all cursor-pointer',
            activeStatus === tab.value ? 'bg-[#0052D9] text-white' : 'text-[#666]'
          ]"
          @click="activeStatus = tab.value"
        >
          {{ tab.label }}
        </div>
      </div>

      <!-- 列表 -->
      <div v-if="makeUps.length === 0" class="text-center py-[60px] text-[#999]">
        暂无补卡申请
      </div>
      <div
        v-for="makeup in filteredMakeUps"
        :key="makeup.id"
        class="bg-white rounded-[24px] p-[24px] mb-[20px]"
      >
        <div class="flex justify-between items-start mb-[15px]">
          <div>
            <div class="text-[30px] font-bold text-[#333]">
              {{ makeup.type === 'checkIn' ? '上班' : '下班' }}补卡
            </div>
            <div class="text-[24px] text-[#999] mt-[10px]">
              {{ getUserName(makeup.userId) }} · {{ makeup.date }}
            </div>
          </div>
          <t-tag :theme="getStatusTheme(makeup.status)" variant="light">
            {{ getStatusLabel(makeup.status) }}
          </t-tag>
        </div>

        <div class="text-[26px] text-[#666] mb-[15px]">
          补卡原因：{{ makeup.reason }}
        </div>

        <!-- 审批操作 -->
        <div v-if="makeup.status === 'pending'" class="flex gap-[20px] mt-[20px] pt-[20px] border-t border-[#eee]">
          <t-input
            v-model="makeup._comment"
            placeholder="审批意见（可选）"
            class="flex-1"
          />
          <t-button theme="primary" class="!bg-gradient-to-br !from-[#0052D9] !to-[#266FE8]" @click="handleApprove(makeup, true)">通过</t-button>
          <t-button theme="danger" variant="outline" @click="handleApprove(makeup, false)">拒绝</t-button>
        </div>

        <!-- 审批结果 -->
        <div v-if="makeup.approvalComment" class="mt-[20px] pt-[20px] border-t border-[#eee]">
          <div class="text-[24px] text-[#999]">审批意见：{{ makeup.approvalComment }}</div>
        </div>
      </div>
    </div>
  </Root>
</template>

<script setup>
import { makeUpRequestRepo, userRepo, attendanceRepo } from "@/db/repositories"
import { useUserStore } from "@/store"
import { showToast, vibrateWithSettings, VIBRATE_PATTERNS } from "@/utils/common/tools"

const userStore = useUserStore()

const makeUps = ref([])
const users = ref([])
const activeStatus = ref('pending')

const statusTabs = [
  { label: '待审批', value: 'pending' },
  { label: '已通过', value: 'approved' },
  { label: '已拒绝', value: 'rejected' },
  { label: '全部', value: 'all' }
]

const filteredMakeUps = computed(() => {
  if (activeStatus.value === 'all') return makeUps.value
  return makeUps.value.filter(m => m.status === activeStatus.value)
})

const getUserName = (userId) => {
  const user = users.value.find(u => u.id === userId)
  return user?.name || '未知用户'
}

const getStatusLabel = (status) => {
  const map = { pending: '待审批', approved: '已通过', rejected: '已拒绝' }
  return map[status] || status
}

const getStatusTheme = (status) => {
  const map = { pending: 'warning', approved: 'success', rejected: 'danger' }
  return map[status] || 'default'
}

// 审批
const handleApprove = async (makeup, approved) => {
  await makeUpRequestRepo.approve(makeup.id, approved, makeup._comment || '', userStore.userId)

  // 如果通过，更新考勤记录
  if (approved) {
    const record = await attendanceRepo.findByUserAndDate(makeup.userId, makeup.date)
    if (record) {
      if (makeup.type === 'checkIn') {
        await attendanceRepo.update(record.id, { checkInTime: '09:00', isLate: false })
      } else {
        await attendanceRepo.update(record.id, { checkOutTime: '18:00' })
      }
    }
  }

  // 震动反馈
  vibrateWithSettings(approved ? VIBRATE_PATTERNS.success : VIBRATE_PATTERNS.normal)
  showToast(approved ? '已通过' : '已拒绝')
  loadData()
}

const loadData = async () => {
  users.value = await userRepo.findAll()
  makeUps.value = await makeUpRequestRepo.findAll()
}

watch(activeStatus, () => loadData())

onMounted(() => {
  loadData()
})
</script>

<style lang="less" scoped>
.approval-makeup-page {
  min-height: 100%;
  background-color: #f5f5f5;
}
</style>

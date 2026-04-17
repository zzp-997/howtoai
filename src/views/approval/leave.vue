<template>
  <Root title="请假审批" back-url="/admin/approval">
    <div class="approval-leave-page p-[24px] px-[32px]">
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
      <div v-if="leaves.length === 0" class="text-center py-[60px] text-[#999]">
        暂无请假申请
      </div>
      <div
        v-for="leave in filteredLeaves"
        :key="leave.id"
        class="bg-white rounded-[24px] p-[24px] mb-[20px]"
      >
        <div class="flex justify-between items-start mb-[15px]">
          <div>
            <div class="text-[30px] font-bold text-[#333]">
              {{ getLeaveTypeName(leave.leaveType) }}请假
            </div>
            <div class="text-[24px] text-[#999] mt-[10px]">
              {{ getUserName(leave.userId) }} · {{ leave.days || 1 }}天
            </div>
          </div>
          <t-tag :theme="getStatusTheme(leave.status)" variant="light">
            {{ getStatusLabel(leave.status) }}
          </t-tag>
        </div>

        <div class="text-[26px] text-[#666] mb-[10px]">
          {{ leave.startDate }} ~ {{ leave.endDate }}
        </div>
        <div class="text-[26px] text-[#666] mb-[15px]">
          事由：{{ leave.reason }}
        </div>

        <!-- 审批操作 -->
        <div v-if="leave.status === 'pending'" class="flex gap-[20px] mt-[20px] pt-[20px] border-t border-[#eee]">
          <t-input
            v-model="leave._comment"
            placeholder="审批意见（可选）"
            class="flex-1"
          />
          <t-button theme="primary" class="!bg-gradient-to-br !from-[#0052D9] !to-[#266FE8]" @click="handleApprove(leave, true)">通过</t-button>
          <t-button theme="danger" variant="outline" @click="handleApprove(leave, false)">拒绝</t-button>
        </div>

        <!-- 审批结果 -->
        <div v-if="leave.approvalComment" class="mt-[20px] pt-[20px] border-t border-[#eee]">
          <div class="text-[24px] text-[#999]">审批意见：{{ leave.approvalComment }}</div>
        </div>
      </div>
    </div>
  </Root>
</template>

<script setup>
import { getLeaves, approveLeave } from "@/api/leaves"
import { getUsers, updateUser } from "@/api/users"
import { createTodo } from "@/api/todos"
import { useUserStore } from "@/store"
import { showToast, vibrateWithSettings, VIBRATE_PATTERNS } from "@/utils/common/tools"

const userStore = useUserStore()

const leaves = ref([])
const users = ref([])
const activeStatus = ref('pending')

const statusTabs = [
  { label: '待审批', value: 'pending' },
  { label: '已通过', value: 'approved' },
  { label: '已拒绝', value: 'rejected' },
  { label: '全部', value: 'all' }
]

const filteredLeaves = computed(() => {
  if (activeStatus.value === 'all') return leaves.value
  return leaves.value.filter(l => l.status === activeStatus.value)
})

const getUserName = (userId) => {
  const user = users.value.find(u => u.id === userId)
  return user?.name || '未知用户'
}

const getLeaveTypeName = (type) => {
  const map = { annual: '年假', sick: '病假', personal: '事假' }
  return map[type] || type
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
const handleApprove = async (leave, approved) => {
  await approveLeave(leave.id, { approved, comment: leave._comment || '' })

  // 如果通过，扣减假期余额
  if (approved && leave.leaveType !== 'personal') {
    const user = users.value.find(u => u.id === leave.userId)
    if (user) {
      const balanceField = leave.leaveType === 'annual' ? 'annualLeaveBalance' : 'sickLeaveBalance'
      const newBalance = Math.max(0, (user[balanceField] || 0) - (leave.days || 1))
      await updateUser(leave.userId, { [balanceField]: newBalance })
    }
    // 创建待办任务
    const leaveTypeName = leave.leaveType === 'annual' ? '年假' : (leave.leaveType === 'sick' ? '病假' : '事假')
    await createTodo({
      title: `${leaveTypeName}归来，请提交工作总结`,
      relatedType: 'leave',
      relatedId: leave.id
    })
  }

  // 震动反馈
  vibrateWithSettings(approved ? VIBRATE_PATTERNS.success : VIBRATE_PATTERNS.normal)
  showToast(approved ? '已通过' : '已拒绝')
  loadData()
}

const loadData = async () => {
  const usersRes = await getUsers()
  users.value = usersRes.data || []

  const leavesRes = await getLeaves()
  leaves.value = leavesRes.data || []
}

watch(activeStatus, () => loadData())

onMounted(() => {
  loadData()
})
</script>

<style lang="less" scoped>
.approval-leave-page {
  min-height: 100%;
  background-color: #f5f5f5;
}
</style>

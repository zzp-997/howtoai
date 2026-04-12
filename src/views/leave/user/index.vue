<template>
  <Root title="我的请假" back-url="/user">
    <div class="min-h-screen bg-[#f5f7fa]">
      <!-- 顶部操作栏 -->
      <div class="p-[24px] px-[32px] bg-gradient-to-br from-[#0052D9] to-[#266FE8]">
        <div class="flex items-center bg-white/15 rounded-[24px] p-[24px]">
          <div class="flex-1 text-center">
            <div class="text-[44px] font-bold text-white">{{ userStore.annualLeaveBalance }}</div>
            <div class="text-[24px] text-white/80 mt-[8px]">年假余额</div>
          </div>
          <div class="w-[1px] h-[60px] bg-white/30"></div>
          <div class="flex-1 text-center">
            <div class="text-[44px] font-bold text-white">{{ userStore.sickLeaveBalance }}</div>
            <div class="text-[24px] text-white/80 mt-[8px]">病假余额</div>
          </div>
          <t-button theme="primary" class="h-[72px] px-[32px] ml-[24px] text-[28px] rounded-[14px]" @click="router.push('/user/leave/create')">申请请假</t-button>
        </div>
      </div>

      <!-- 状态筛选 -->
      <div class="flex p-[16px] px-[32px] bg-white gap-[12px]">
        <div v-for="tab in statusTabs" :key="tab.value"
          :class="['flex-1 py-[16px] text-center text-[26px] rounded-[12px] transition-all', activeStatus === tab.value ? 'bg-gradient-to-br from-[#0052D9] to-[#266FE8] text-white' : 'bg-[#f5f7fa] text-[#666]']"
          @click="activeStatus = tab.value">{{ tab.label }}</div>
      </div>

      <!-- 列表 -->
      <div class="p-[24px] px-[32px]">
        <div v-if="filteredLeaves.length === 0" class="text-center py-[80px]">
          <CalendarIcon class="text-[80px] text-[#ddd] mb-[20px]" />
          <div class="text-[28px] text-[#999]">暂无请假记录</div>
        </div>

        <div v-for="leave in filteredLeaves" :key="leave.id" class="bg-white rounded-[24px] mb-[16px] overflow-hidden shadow-sm">
          <div class="flex justify-between items-center p-[20px] px-[24px] bg-[#f9fafb]">
            <div class="flex items-center gap-[12px]">
              <div :class="['w-[48px] h-[48px] rounded-[12px] flex items-center justify-center text-[24px] font-semibold text-white', {
                'bg-gradient-to-br from-[#0052D9] to-[#266FE8]': leave.leaveType === 'annual',
                'bg-gradient-to-br from-[#00A870] to-[#2BA471]': leave.leaveType === 'sick',
                'bg-gradient-to-br from-[#ED7B2F] to-[#F09143]': leave.leaveType === 'personal'
              }]">{{ getLeaveTypeIcon(leave.leaveType) }}</div>
              <div class="text-[30px] font-semibold text-[#333]">{{ getLeaveTypeName(leave.leaveType) }}请假</div>
            </div>
            <div :class="['px-[16px] py-[8px] rounded-[8px] text-[24px]', {
              'bg-[#FFF3E0] text-[#ED7B2F]': leave.status === 'pending',
              'bg-[#E8F5E9] text-[#00A870]': leave.status === 'approved',
              'bg-[#FFEBEE] text-[#E34D59]': leave.status === 'rejected'
            }]">{{ getStatusLabel(leave.status) }}</div>
          </div>

          <div class="p-[24px]">
            <div class="mb-[16px]">
              <span class="text-[48px] font-bold text-[#0052D9]">{{ leave.days || 1 }}</span>
              <span class="text-[24px] text-[#666] ml-[8px]">天</span>
            </div>
            <div class="text-[26px] text-[#666] mb-[12px]">{{ leave.startDate }} ~ {{ leave.endDate }}</div>
            <div class="text-[24px] text-[#999]">事由：{{ leave.reason }}</div>
          </div>

          <div v-if="leave.status === 'pending'" class="px-[24px] py-[16px] border-t border-[#f0f0f0]">
            <t-button theme="danger" variant="outline" size="small" @click="handleCancel(leave)">撤销申请</t-button>
          </div>

          <div v-if="leave.approvalComment" class="px-[24px] py-[16px] bg-[#fff8e1] text-[24px] text-[#666]">
            审批意见：{{ leave.approvalComment }}
          </div>
        </div>
      </div>
    </div>
  </Root>
</template>

<script setup>
import { CalendarIcon } from "tdesign-icons-vue-next"
import { leaveRepo } from "@/db/repositories"
import { useUserStore } from "@/store"
import { showToast, showConfirmDialog } from "@/utils/common/tools"
import { useRouter } from "vue-router"

const router = useRouter()
const userStore = useUserStore()
const leaves = ref([])
const activeStatus = ref('all')
const statusTabs = [
  { label: '全部', value: 'all' },
  { label: '待审批', value: 'pending' },
  { label: '已批准', value: 'approved' },
  { label: '已拒绝', value: 'rejected' }
]

const filteredLeaves = computed(() => activeStatus.value === 'all' ? leaves.value : leaves.value.filter(l => l.status === activeStatus.value))
const getLeaveTypeName = (type) => ({ annual: '年假', sick: '病假', personal: '事假' }[type] || type)
const getLeaveTypeIcon = (type) => ({ annual: '年', sick: '病', personal: '事' }[type] || '假')
const getStatusLabel = (status) => ({ pending: '待审批', approved: '已批准', rejected: '已拒绝' }[status] || status)

const loadData = async () => { leaves.value = await leaveRepo.findByUserIdOrdered(userStore.userId) }

const handleCancel = async (leave) => {
  try {
    await showConfirmDialog({ content: '确定撤销该请假申请吗？' })
    await leaveRepo.delete(leave.id)
    showToast('已撤销')
    loadData()
  } catch (e) {
    // 用户取消操作
  }
}

onMounted(() => loadData())
</script>

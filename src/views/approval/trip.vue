<template>
  <Root title="审批详情" back-url="/admin/approval">
    <div class="min-h-screen bg-[#f5f7fa]">
      <!-- 筛选 Tab -->
      <div class="flex p-[16px] px-[32px] bg-white gap-[12px]">
        <div v-for="tab in statusTabs" :key="tab.value"
          :class="['flex-1 py-[16px] text-center text-[26px] rounded-[12px] transition-all', activeStatus === tab.value ? 'bg-gradient-to-br from-[#0052D9] to-[#266FE8] text-white' : 'bg-[#f5f7fa] text-[#666]']"
          @click="activeStatus = tab.value">{{ tab.label }}</div>
      </div>

      <!-- 列表 -->
      <div class="p-[24px] px-[32px]">
        <div v-if="filteredTrips.length === 0" class="text-center py-[80px]">
          <CheckCircleIcon class="text-[60px] text-[#00A870] mb-[16px]" />
          <div class="text-[28px] text-[#999]">暂无{{ activeStatus === 'pending' ? '待审批' : '' }}差旅申请</div>
        </div>

        <div v-for="trip in filteredTrips" :key="trip.id" class="bg-white rounded-[24px] mb-[16px] overflow-hidden shadow-sm">
          <div class="flex justify-between items-start p-[24px] bg-[#f9fafb]">
            <div>
              <div class="text-[32px] font-semibold text-[#333] mb-[8px]">{{ trip.reason }}</div>
              <div class="text-[24px] text-[#999]"><span>{{ getUserName(trip.userId) }}</span><span class="mx-[8px]">·</span><span>{{ trip.destination }}</span></div>
            </div>
            <div :class="['px-[16px] py-[8px] rounded-[8px] text-[24px]', { 'bg-[#FFF3E0] text-[#ED7B2F]': trip.status === 'pending', 'bg-[#E8F5E9] text-[#00A870]': trip.status === 'approved', 'bg-[#FFEBEE] text-[#E34D59]': trip.status === 'rejected' }]">{{ getStatusLabel(trip.status) }}</div>
          </div>

          <div class="p-[24px] px-[24px]">
            <div class="flex items-center gap-[10px] text-[26px] text-[#666] mb-[16px]">
              <TimeIcon class="text-[28px] text-[#0052D9]" />
              <span>{{ trip.startDate }} ~ {{ trip.endDate }}</span>
            </div>
            <div class="flex items-center gap-[16px] text-[26px]">
              <span class="text-[#666]">交通 ¥{{ trip.estTransportFee || 0 }}</span>
              <span class="text-[#666]">住宿 ¥{{ trip.estAccomFee || 0 }}</span>
              <span class="text-[#E34D59] font-semibold ml-auto">合计 ¥{{ (trip.estTransportFee || 0) + (trip.estAccomFee || 0) }}</span>
            </div>
          </div>

          <div v-if="trip.status === 'pending'" class="p-[24px] px-[24px] border-t border-[#f0f0f0]">
            <t-input v-model="trip._comment" placeholder="审批意见（可选）" class="mb-[16px]" />
            <div class="flex gap-[16px]">
              <t-button theme="primary" class="flex-1 h-[72px] text-[28px] rounded-[12px] !bg-gradient-to-br !from-[#0052D9] !to-[#266FE8]" @click="handleApprove(trip, true)">通过</t-button>
              <t-button theme="danger" variant="outline" class="flex-1 h-[72px] text-[28px] rounded-[12px]" @click="handleApprove(trip, false)">拒绝</t-button>
            </div>
          </div>

          <div v-if="trip.approvalComment" class="px-[24px] py-[16px] bg-[#fff8e1] text-[24px] text-[#666]">审批意见：{{ trip.approvalComment }}</div>
        </div>
      </div>
    </div>
  </Root>
</template>

<script setup>
import { CheckCircleIcon, TimeIcon } from "tdesign-icons-vue-next"
import { getTrips, approveTrip } from "@/api/trips"
import { getUsers } from "@/api/users"
import { createTodo } from "@/api/todos"
import { useUserStore } from "@/store"
import { showToast, vibrateWithSettings, VIBRATE_PATTERNS } from "@/utils/common/tools"

const userStore = useUserStore()
const trips = ref([])
const users = ref([])
const activeStatus = ref('pending')
const statusTabs = [
  { label: '待审批', value: 'pending' },
  { label: '已通过', value: 'approved' },
  { label: '已拒绝', value: 'rejected' },
  { label: '全部', value: 'all' }
]

const filteredTrips = computed(() => activeStatus.value === 'all' ? trips.value : trips.value.filter(t => t.status === activeStatus.value))
const getUserName = (userId) => users.value.find(u => u.id === userId)?.name || '未知用户'
const getStatusLabel = (status) => ({ pending: '待审批', approved: '已通过', rejected: '已拒绝' }[status] || status)

const handleApprove = async (trip, approved) => {
  await approveTrip(trip.id, { approved, comment: trip._comment || '' })
  // 如果通过，创建待办任务
  if (approved) {
    await createTodo({
      title: '差旅归来，请提交报销申请',
      relatedType: 'trip',
      relatedId: trip.id
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

  const tripsRes = await getTrips()
  trips.value = tripsRes.data || []
}

watch(activeStatus, () => loadData())
onMounted(() => loadData())
</script>

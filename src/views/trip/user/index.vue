<template>
  <Root title="我的差旅" back-url="/user">
    <div class="min-h-screen bg-[#f5f7fa]">
      <!-- 顶部操作栏 -->
      <div class="p-[24px] px-[32px] bg-gradient-to-br from-[#0052D9] to-[#266FE8]">
        <t-button theme="primary" class="h-[72px] text-[28px] rounded-[14px] bg-white/20 border-0" @click="router.push('/user/trip/create')">
          <template #icon><AddIcon /></template>
          新建申请
        </t-button>
      </div>

      <!-- 状态筛选 -->
      <div class="flex p-[16px] bg-white gap-[12px]">
        <div v-for="tab in statusTabs" :key="tab.value"
          :class="['flex-1 p-[16px] rounded-[12px] text-center', activeStatus === tab.value ? 'bg-gradient-to-br from-[#0052D9] to-[#266FE8] text-white' : 'bg-[#f5f7fa]']"
          @click="activeStatus = tab.value">
          <div class="text-[24px] mb-[6px]">{{ tab.label }}</div>
          <div class="text-[32px] font-bold" :class="activeStatus === tab.value ? 'text-white' : 'text-[#0052D9]'">{{ getCountByStatus(tab.value) }}</div>
        </div>
      </div>

      <!-- 列表 -->
      <div class="p-[24px] px-[32px]">
        <div v-if="filteredTrips.length === 0" class="text-center py-[80px]">
          <LocationIcon class="text-[80px] text-[#ddd] mb-[20px]" />
          <div class="text-[28px] text-[#999] mb-[32px]">暂无差旅申请</div>
          <t-button theme="primary" size="medium" class="h-[72px] px-[48px] text-[28px] rounded-[12px]" @click="router.push('/user/trip/create')">新建申请</t-button>
        </div>

        <div v-for="trip in filteredTrips" :key="trip.id" class="bg-white rounded-[24px] mb-[16px] overflow-hidden shadow-sm">
          <div class="flex justify-between items-center p-[20px] px-[24px] bg-[#f9fafb]">
            <div :class="['px-[16px] py-[8px] rounded-[8px] text-[24px] font-medium', {
              'bg-[#FFF3E0] text-[#ED7B2F]': trip.status === 'pending',
              'bg-[#E8F5E9] text-[#00A870]': trip.status === 'approved',
              'bg-[#FFEBEE] text-[#E34D59]': trip.status === 'rejected'
            }]">{{ getStatusLabel(trip.status) }}</div>
            <t-button v-if="trip.status === 'pending'" theme="danger" variant="outline" size="small" @click="handleCancel(trip)">撤销</t-button>
          </div>

          <div class="p-[24px]">
            <div class="text-[32px] font-semibold text-[#333] mb-[16px]">{{ trip.reason }}</div>
            <div class="flex items-center gap-[10px] text-[26px] text-[#666] mb-[12px]">
              <LocationIcon class="text-[28px] text-[#0052D9]" />
              {{ trip.destination }}
            </div>
            <div class="flex items-center gap-[10px] text-[26px] text-[#666]">
              <TimeIcon class="text-[28px] text-[#0052D9]" />
              {{ trip.startDate }} ~ {{ trip.endDate }}
            </div>
          </div>

          <div class="px-[24px] py-[16px] bg-[#f9fafb] border-t border-[#f0f0f0] flex justify-between items-center">
            <span class="text-[24px] text-[#999]">预估费用</span>
            <div class="flex items-center gap-[12px]">
              <span class="text-[32px] font-semibold text-[#E34D59]">¥{{ (trip.estTransportFee || 0) + (trip.estAccomFee || 0) }}</span>
              <t-button v-if="trip.status === 'pending'" theme="primary" variant="outline" size="small" @click="handleEdit(trip)">修改</t-button>
            </div>
          </div>

          <div v-if="trip.approvalComment" class="px-[24px] py-[16px] bg-[#fff8e1] text-[24px] text-[#666]">
            审批意见：{{ trip.approvalComment }}
          </div>

          <!-- 报销入口（已批准且已结束的差旅） -->
          <div v-if="trip.status === 'approved' && isTripEnded(trip)" class="px-[24px] py-[16px] border-t border-[#f0f0f0] flex items-center justify-between">
            <div class="flex items-center gap-[10px]">
              <MoneyIcon class="text-[28px] text-[#00A870]" />
              <span class="text-[24px] text-[#666]">
                {{ hasExpenseClaim(trip.id) ? '报销状态：' + getExpenseStatusLabel(trip.id) : '差旅已结束，可提交报销' }}
              </span>
            </div>
            <t-button
              :theme="hasExpenseClaim(trip.id) ? 'default' : 'primary'"
              size="small"
              class="h-[56px] px-[20px] text-[22px]"
              :class="!hasExpenseClaim(trip.id) ? '!bg-gradient-to-r !from-[#00A870] !to-[#2BA471]' : ''"
              @click="handleExpense(trip)"
            >
              {{ hasExpenseClaim(trip.id) ? '查看报销' : '填写报销' }}
            </t-button>
          </div>
        </div>
      </div>
    </div>
  </Root>
</template>

<script setup>
import { AddIcon, LocationIcon, TimeIcon, MoneyIcon, CheckCircleIcon } from "tdesign-icons-vue-next"
import { getTrips, deleteTrip, getExpenses } from "@/api"
import { useUserStore } from "@/store"
import { showToast, showConfirmDialog } from "@/utils/common/tools"
import { useRouter } from "vue-router"
import dayjs from "dayjs"

const router = useRouter()
const userStore = useUserStore()
const trips = ref([])
const expenseStatusMap = ref({}) // 存储每个差旅的报销状态
const activeStatus = ref('all')
const statusTabs = [
  { label: '全部', value: 'all' },
  { label: '待审批', value: 'pending' },
  { label: '已批准', value: 'approved' },
  { label: '已拒绝', value: 'rejected' }
]

const getCountByStatus = (status) => status === 'all' ? trips.value.length : trips.value.filter(t => t.status === status).length
const filteredTrips = computed(() => activeStatus.value === 'all' ? trips.value : trips.value.filter(t => t.status === activeStatus.value))
const getStatusLabel = (status) => ({ pending: '待审批', approved: '已批准', rejected: '已拒绝' }[status] || status)

// 判断差旅是否已结束
const isTripEnded = (trip) => {
  const today = dayjs().format('YYYY-MM-DD')
  return trip.endDate < today
}

// 检查差旅是否已有报销单
const hasExpenseClaim = (tripId) => {
  return !!expenseStatusMap.value[tripId]
}

// 获取报销单状态标签
const getExpenseStatusLabel = (tripId) => {
  const status = expenseStatusMap.value[tripId]
  if (status === 'draft') return '草稿'
  if (status === 'submitted') return '已提交'
  if (status === 'approved') return '已批准'
  return null
}

const loadData = async () => {
  const res = await getTrips()
  trips.value = res.data || []

  // 检查每个已批准差旅的报销状态
  const expenseRes = await getExpenses()
  const expenses = expenseRes.data || []

  for (const trip of trips.value) {
    if (trip.status === 'approved') {
      const claim = expenses.find(e => e.tripId === trip.id)
      if (claim) {
        expenseStatusMap.value[trip.id] = claim.status
      }
    }
  }
}

const handleCancel = async (trip) => {
  try {
    await showConfirmDialog({ content: '确定撤销该申请吗？' })
    await deleteTrip(trip.id)
    showToast('已撤销')
    loadData()
  } catch (e) {
    // 用户取消操作
  }
}

const handleEdit = (trip) => {
  router.push({ path: '/user/trip/create', query: { id: trip.id } })
}

// 跳转到报销单
const handleExpense = (trip) => {
  const existingStatus = expenseStatusMap.value[trip.id]
  if (existingStatus) {
    // 已有报销单，直接编辑
    router.push({ path: '/user/expense/create', query: { tripId: trip.id } })
  } else {
    // 新建报销单
    router.push({ path: '/user/expense/create', query: { tripId: trip.id } })
  }
}

onMounted(() => loadData())
</script>

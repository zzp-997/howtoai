<template>
  <Root title="审批中心" back-url="/admin">
    <div class="min-h-screen bg-[#f5f7fa]">
      <!-- 统计概览 -->
      <div class="flex p-[24px] gap-[16px] bg-gradient-to-br from-[#0052D9] to-[#266FE8]">
        <div class="flex-1 text-center bg-white/15 rounded-[24px] p-[24px] px-[12px]">
          <div class="text-[48px] font-bold text-white">{{ pendingTrips + pendingLeaves + pendingMakeUps }}</div>
          <div class="text-[24px] text-white/80 mt-[8px]">待审批</div>
        </div>
        <div class="flex-1 text-center bg-white/15 rounded-[24px] p-[24px] px-[12px]">
          <div class="text-[48px] font-bold text-white">{{ approvedCount }}</div>
          <div class="text-[24px] text-white/80 mt-[8px]">已通过</div>
        </div>
        <div class="flex-1 text-center bg-white/15 rounded-[24px] p-[24px] px-[12px]">
          <div class="text-[48px] font-bold text-white">{{ rejectedCount }}</div>
          <div class="text-[24px] text-white/80 mt-[8px]">已拒绝</div>
        </div>
      </div>

      <!-- 待审批列表 -->
      <div class="p-[24px] px-[32px]">
        <div class="text-[30px] font-semibold text-[#333] mb-[20px]">待审批申请</div>

        <!-- 差旅申请 -->
        <div v-if="pendingTripsList.length > 0" class="mb-[24px]">
          <div class="flex items-center gap-[10px] mb-[12px]">
            <LocationIcon class="text-[28px] text-[#0052D9]" />
            <span class="text-[28px] font-medium text-[#333]">差旅申请</span>
            <span class="bg-[#0052D9] text-white text-[22px] px-[12px] py-[4px] rounded-[24px]">{{ pendingTripsList.length }}</span>
          </div>
          <div v-for="trip in pendingTripsList" :key="'trip-'+trip.id" class="flex items-center bg-white rounded-[24px] p-[20px] px-[24px] mb-[12px] shadow-sm" @click="router.push('/admin/approval/trip')">
            <div class="flex-1">
              <div class="text-[28px] font-medium text-[#333] mb-[8px]">{{ trip.reason }}</div>
              <div class="text-[24px] text-[#999]"><span>{{ getUserName(trip.userId) }}</span><span class="mx-[8px]">·</span><span>{{ trip.destination }}</span></div>
            </div>
            <ChevronRightIcon class="text-[28px] text-[#ccc]" />
          </div>
        </div>

        <!-- 请假申请 -->
        <div v-if="pendingLeavesList.length > 0" class="mb-[24px]">
          <div class="flex items-center gap-[10px] mb-[12px]">
            <CalendarIcon class="text-[28px] text-[#0052D9]" />
            <span class="text-[28px] font-medium text-[#333]">请假申请</span>
            <span class="bg-[#0052D9] text-white text-[22px] px-[12px] py-[4px] rounded-[24px]">{{ pendingLeavesList.length }}</span>
          </div>
          <div v-for="leave in pendingLeavesList" :key="'leave-'+leave.id" class="flex items-center bg-white rounded-[24px] p-[20px] px-[24px] mb-[12px] shadow-sm" @click="router.push('/admin/approval/leave')">
            <div class="flex-1">
              <div class="text-[28px] font-medium text-[#333] mb-[8px]">{{ getLeaveTypeName(leave.leaveType) }}请假</div>
              <div class="text-[24px] text-[#999]"><span>{{ getUserName(leave.userId) }}</span><span class="mx-[8px]">·</span><span>{{ leave.days || 1 }}天</span></div>
            </div>
            <ChevronRightIcon class="text-[28px] text-[#ccc]" />
          </div>
        </div>

        <!-- 补卡申请 -->
        <div v-if="pendingMakeUpsList.length > 0" class="mb-[24px]">
          <div class="flex items-center gap-[10px] mb-[12px]">
            <TimeIcon class="text-[28px] text-[#0052D9]" />
            <span class="text-[28px] font-medium text-[#333]">补卡申请</span>
            <span class="bg-[#0052D9] text-white text-[22px] px-[12px] py-[4px] rounded-[24px]">{{ pendingMakeUpsList.length }}</span>
          </div>
          <div v-for="makeup in pendingMakeUpsList" :key="'makeup-'+makeup.id" class="flex items-center bg-white rounded-[24px] p-[20px] px-[24px] mb-[12px] shadow-sm" @click="router.push('/admin/approval/makeup')">
            <div class="flex-1">
              <div class="text-[28px] font-medium text-[#333] mb-[8px]">{{ makeup.type === 'checkIn' ? '上班' : '下班' }}补卡</div>
              <div class="text-[24px] text-[#999]"><span>{{ getUserName(makeup.userId) }}</span><span class="mx-[8px]">·</span><span>{{ makeup.date }}</span></div>
            </div>
            <ChevronRightIcon class="text-[28px] text-[#ccc]" />
          </div>
        </div>

        <!-- 无待审批 -->
        <div v-if="pendingTripsList.length + pendingLeavesList.length + pendingMakeUpsList.length === 0" class="text-center py-[60px]">
          <CheckCircleIcon class="text-[60px] text-[#00A870] mb-[16px]" />
          <div class="text-[28px] text-[#999]">暂无待审批申请</div>
        </div>
      </div>

      <!-- 快捷入口 -->
      <div class="px-[32px]">
        <div class="text-[30px] font-semibold text-[#333] mb-[20px]">审批分类</div>
        <div class="grid grid-cols-3 gap-[16px]">
          <div class="bg-white rounded-[24px] p-[28px] px-[12px] text-center shadow-sm" @click="router.push('/admin/approval/trip')">
            <div class="w-[64px] h-[64px] mx-auto mb-[16px] rounded-[24px] bg-gradient-to-br from-[#0052D9] to-[#266FE8] flex items-center justify-center text-[32px] text-white"><LocationIcon /></div>
            <div class="text-[26px] text-[#333]">差旅审批</div>
          </div>
          <div class="bg-white rounded-[24px] p-[28px] px-[12px] text-center shadow-sm" @click="router.push('/admin/approval/leave')">
            <div class="w-[64px] h-[64px] mx-auto mb-[16px] rounded-[24px] bg-gradient-to-br from-[#00A870] to-[#2BA471] flex items-center justify-center text-[32px] text-white"><CalendarIcon /></div>
            <div class="text-[26px] text-[#333]">请假审批</div>
          </div>
          <div class="bg-white rounded-[24px] p-[28px] px-[12px] text-center shadow-sm" @click="router.push('/admin/approval/makeup')">
            <div class="w-[64px] h-[64px] mx-auto mb-[16px] rounded-[24px] bg-gradient-to-br from-[#ED7B2F] to-[#F09143] flex items-center justify-center text-[32px] text-white"><TimeIcon /></div>
            <div class="text-[26px] text-[#333]">补卡审批</div>
          </div>
        </div>
      </div>
    </div>
  </Root>
</template>

<script setup>
import { LocationIcon, CalendarIcon, TimeIcon, CheckCircleIcon, ChevronRightIcon } from "tdesign-icons-vue-next"
import { tripRepo, leaveRepo, makeUpRequestRepo, userRepo } from "@/db/repositories"
import { useRouter } from "vue-router"

const router = useRouter()
const trips = ref([])
const leaves = ref([])
const makeUps = ref([])
const users = ref([])

const pendingTripsList = computed(() => trips.value.filter(t => t.status === 'pending'))
const pendingLeavesList = computed(() => leaves.value.filter(l => l.status === 'pending'))
const pendingMakeUpsList = computed(() => makeUps.value.filter(m => m.status === 'pending'))

const pendingTrips = computed(() => pendingTripsList.value.length)
const pendingLeaves = computed(() => pendingLeavesList.value.length)
const pendingMakeUps = computed(() => pendingMakeUpsList.value.length)

const approvedCount = computed(() => trips.value.filter(t => t.status === 'approved').length + leaves.value.filter(l => l.status === 'approved').length + makeUps.value.filter(m => m.status === 'approved').length)
const rejectedCount = computed(() => trips.value.filter(t => t.status === 'rejected').length + leaves.value.filter(l => l.status === 'rejected').length + makeUps.value.filter(m => m.status === 'rejected').length)

const getUserName = (userId) => users.value.find(u => u.id === userId)?.name || '未知用户'
const getLeaveTypeName = (type) => ({ annual: '年假', sick: '病假', personal: '事假' }[type] || type)

const loadData = async () => {
  users.value = await userRepo.findAll()
  trips.value = await tripRepo.findAll()
  leaves.value = await leaveRepo.findAll()
  makeUps.value = await makeUpRequestRepo.findAll()
}

onMounted(() => loadData())
</script>

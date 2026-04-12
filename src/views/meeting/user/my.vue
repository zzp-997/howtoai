<template>
  <Root title="我的预定" back-url="/user/meeting">
    <div class="min-h-screen bg-[#f5f7fa]">
      <!-- 筛选 Tab -->
      <div class="flex p-[16px] px-[32px] bg-white gap-[16px]">
        <div
          :class="['flex-1 p-[20px] rounded-[24px] text-center', activeTab === 'future' ? 'bg-gradient-to-br from-[#0052D9] to-[#266FE8] text-white' : 'bg-[#f5f7fa]']"
          @click="activeTab = 'future'"
        >
          <div class="text-[26px] mb-[8px]">即将进行</div>
          <div class="text-[36px] font-bold">{{ futureCount }}</div>
        </div>
        <div
          :class="['flex-1 p-[20px] rounded-[24px] text-center', activeTab === 'past' ? 'bg-gradient-to-br from-[#0052D9] to-[#266FE8] text-white' : 'bg-[#f5f7fa]']"
          @click="activeTab = 'past'"
        >
          <div class="text-[26px] mb-[8px]">历史预定</div>
          <div class="text-[36px] font-bold">{{ pastCount }}</div>
        </div>
      </div>

      <!-- 预定列表 -->
      <div class="p-[24px] px-[32px]">
        <div v-if="reservations.length === 0" class="text-center py-[80px]">
          <CalendarIcon class="text-[80px] text-[#ddd] mb-[20px]" />
          <div class="text-[28px] text-[#999] mb-[32px]">暂无预定记录</div>
          <t-button theme="primary" size="medium" class="h-[72px] px-[48px] text-[28px] rounded-[12px]" @click="router.push('/user/meeting')">去预定</t-button>
        </div>

        <div v-for="r in reservations" :key="r.id" class="bg-white rounded-[24px] mb-[16px] overflow-hidden shadow-sm">
          <div class="flex justify-between items-center p-[24px] bg-gradient-to-br from-[#f5f7fa] to-[#e8ecf0]">
            <div class="text-[30px] font-semibold text-[#333]">{{ r.subject }}</div>
            <t-button v-if="activeTab === 'future'" theme="danger" variant="outline" size="small" @click="handleCancel(r)">取消</t-button>
          </div>
          <div class="p-[24px]">
            <div class="flex items-center gap-[12px] text-[26px] text-[#666] mb-[12px]">
              <LocationIcon class="text-[28px] text-[#0052D9]" />
              <span>{{ getRoomName(r.roomId) }}</span>
            </div>
            <div class="flex items-center gap-[12px] text-[26px] text-[#666]">
              <TimeIcon class="text-[28px] text-[#0052D9]" />
              <span>{{ r.start.replace(' ', ' ') }}</span>
            </div>
          </div>
          <div class="px-[24px] py-[16px] bg-[#fafafa] border-t border-[#f0f0f0] text-[24px] text-[#999]">
            {{ formatRelativeTime(r.start) }}
          </div>
        </div>
      </div>
    </div>
  </Root>
</template>

<script setup>
import { CalendarIcon, LocationIcon, TimeIcon } from "tdesign-icons-vue-next"
import { reservationRepo, meetingRoomRepo } from "@/db/repositories"
import { useUserStore } from "@/store"
import { showToast } from "@/utils/common/tools"
import { useRouter } from "vue-router"
import dayjs from "dayjs"

const router = useRouter()
const userStore = useUserStore()
const activeTab = ref('future')
const reservations = ref([])
const rooms = ref([])

const futureCount = computed(() => reservations.value.length)
const pastCount = computed(() => reservations.value.length)

const getRoomName = (roomId) => rooms.value.find(r => r.id === roomId)?.name || '未知会议室'

const formatRelativeTime = (datetime) => {
  const d = dayjs(datetime), now = dayjs()
  const diff = d.diff(now, 'day')
  if (diff === 0) return '今天'
  if (diff === 1) return '明天'
  if (diff === -1) return '昨天'
  return d.format('MM月DD日')
}

const loadData = async () => {
  rooms.value = await meetingRoomRepo.findAll()
  reservations.value = activeTab.value === 'future'
    ? await reservationRepo.findFutureByUserId(userStore.userId)
    : await reservationRepo.findPastByUserId(userStore.userId)
}

const handleCancel = async (r) => {
  if (confirm('确定取消该预定吗？')) {
    await reservationRepo.delete(r.id)
    showToast('已取消预定')
    loadData()
  }
}

watch(activeTab, () => loadData())
onMounted(() => loadData())
</script>

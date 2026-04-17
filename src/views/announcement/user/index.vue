<template>
  <Root title="公告通知" back-url="/user">
    <div class="min-h-screen bg-[#f5f7fa] pb-[150px]">
      <!-- 未读提示 -->
      <div v-if="unreadCount > 0" class="flex items-center gap-[12px] p-[20px] px-[32px] bg-[#FFF3E0]">
        <InfoCircleIcon class="text-[28px] text-[#ED7B2F]" />
        <span class="text-[26px] text-[#ED7B2F]">您有 {{ unreadCount }} 条未读公告</span>
      </div>

      <!-- 公告列表 -->
      <div class="p-[16px] px-[32px]">
        <div v-if="announcements.length === 0" class="text-center py-[80px]">
          <NotificationIcon class="text-[60px] text-[#ddd] mb-[16px]" />
          <div class="text-[28px] text-[#999]">暂无公告</div>
        </div>

        <div v-for="item in announcements" :key="item.id" class="bg-white rounded-[24px] mb-[16px] overflow-hidden shadow-sm" @click="handleView(item)">
          <div class="p-[24px]">
            <div class="flex items-start gap-[12px] mb-[12px]">
              <!-- 置顶标签 -->
              <div v-if="item.isTop" class="px-[12px] py-[4px] bg-[#E34D59] text-white text-[22px] rounded-[6px] flex-shrink-0">置顶</div>
              <!-- 未读标记 -->
              <div v-if="!isRead(item)" class="w-[12px] h-[12px] bg-[#E34D59] rounded-full flex-shrink-0 mt-[8px]"></div>
              <div class="flex-1 min-w-0">
                <div :class="['text-[30px] font-semibold mb-[8px]', isRead(item) ? 'text-[#666]' : 'text-[#333]']">
                  {{ item.title }}
                </div>
                <div class="text-[24px] text-[#999]">{{ formatDate(item.publishTime) }}</div>
              </div>
              <ChevronRightIcon class="text-[28px] text-[#ccc] flex-shrink-0" />
            </div>
            <!-- 内容预览 -->
            <div class="text-[26px] text-[#666] line-clamp-2">{{ item.content }}</div>
          </div>
        </div>
      </div>
    </div>
  </Root>
</template>

<script setup>
import { NotificationIcon, ChevronRightIcon, InfoCircleIcon } from "tdesign-icons-vue-next"
import { getAnnouncements, getUnreadAnnouncementCount } from "@/api"
import { useUserStore } from "@/store"
import { useRouter } from "vue-router"
import dayjs from "dayjs"

const router = useRouter()
const userStore = useUserStore()

const announcements = ref([])
const unreadCount = ref(0)

const isRead = (item) => (item.readBy || []).includes(userStore.userId)

const formatDate = (date) => dayjs(date).format('YYYY-MM-DD HH:mm')

const loadAnnouncements = async () => {
  const res = await getAnnouncements()
  announcements.value = res.data || []
  const countRes = await getUnreadAnnouncementCount()
  unreadCount.value = countRes.data?.count || 0
}

const handleView = (item) => {
  router.push(`/user/announcement/${item.id}`)
}

onMounted(() => loadAnnouncements())
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

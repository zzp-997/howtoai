<template>
  <Root title="公告详情" back-url="/user/announcement">
    <div class="min-h-screen bg-[var(--bg-secondary)] p-[24px]">
      <div v-if="announcement" class="bg-[var(--bg-primary)] rounded-[24px] shadow-sm overflow-hidden">
        <!-- 标题区 -->
        <div class="p-[24px] border-b border-[var(--border-color)]">
          <div class="flex items-center gap-[12px] mb-[16px]">
            <div v-if="announcement.isTop" class="px-[12px] py-[4px] bg-[#E34D59] text-white text-[22px] rounded-[6px]">置顶</div>
            <div v-if="announcement.isRemind" class="px-[12px] py-[4px] bg-[#0052D9] text-white text-[22px] rounded-[6px]">重要</div>
          </div>
          <div class="text-[32px] font-bold text-[var(--text-primary)] mb-[12px]">{{ announcement.title }}</div>
          <div class="flex items-center gap-[16px] text-[24px] text-[var(--text-tertiary)]">
            <span>{{ formatDate(announcement.publishTime) }}</span>
            <span>发布人：{{ getPublisherName() }}</span>
          </div>
        </div>

        <!-- 内容区 -->
        <div class="p-[24px]">
          <div class="text-[28px] text-[var(--text-primary)] leading-[1.8] whitespace-pre-wrap">{{ announcement.content }}</div>
        </div>

        <!-- 阅读情况 -->
        <div class="p-[24px] border-t border-[var(--border-color)]">
          <div class="flex items-center gap-[12px] text-[24px] text-[var(--text-tertiary)]">
            <ViewListIcon class="text-[24px]" />
            <span>已有 {{ (announcement.readBy || []).length }} 人阅读</span>
          </div>
        </div>
      </div>
    </div>
  </Root>
</template>

<script setup>
import { ViewListIcon } from "tdesign-icons-vue-next"
import { announcementRepo, userRepo } from "@/db/repositories"
import { useUserStore } from "@/store"
import { useRouter, useRoute } from "vue-router"
import dayjs from "dayjs"

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const announcement = ref(null)
const users = ref([])

const formatDate = (date) => dayjs(date).format('YYYY年MM月DD日 HH:mm')

const getPublisherName = () => {
  const user = users.value.find(u => u.id === announcement.value?.publishedBy)
  return user?.name || '管理员'
}

const loadDetail = async () => {
  const id = Number(route.params.id)
  announcement.value = await announcementRepo.findById(id)
  users.value = await userRepo.findAll()

  // 标记已读
  if (announcement.value && !(announcement.value.readBy || []).includes(userStore.userId)) {
    await announcementRepo.markAsRead(id, userStore.userId)
  }
}

onMounted(() => loadDetail())
</script>
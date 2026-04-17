<template>
  <Root title="公告管理" back-url="/admin">
    <div class="min-h-screen bg-[#f5f7fa]">
      <!-- 操作按钮 -->
      <div class="p-[24px] px-[32px]">
        <t-button theme="primary" class="h-[80px] text-[28px] rounded-[16px]" @click="router.push('/admin/announcement/create')">
          <template #icon><AddIcon /></template>
          发布公告
        </t-button>
      </div>

      <!-- 公告列表 -->
      <div class="px-[32px]">
        <div v-if="announcements.length === 0" class="text-center py-[80px]">
          <NotificationIcon class="text-[60px] text-[#ddd] mb-[16px]" />
          <div class="text-[28px] text-[#999]">暂无公告</div>
        </div>

        <div v-for="item in announcements" :key="item.id" class="bg-white rounded-[24px] mb-[16px] overflow-hidden shadow-sm">
          <div class="flex justify-between items-start p-[24px] bg-[#f9fafb]">
            <div class="flex items-center gap-[12px]">
              <div v-if="item.isTop" class="px-[12px] py-[4px] bg-[#E34D59] text-white text-[22px] rounded-[6px]">置顶</div>
              <div class="text-[28px] font-semibold text-[#333]">{{ item.title }}</div>
            </div>
            <t-button theme="danger" variant="outline" size="small" @click="handleDelete(item)">删除</t-button>
          </div>
          <div class="p-[24px] px-[24px]">
            <div class="text-[24px] text-[#999] mb-[12px]">发布时间：{{ formatDate(item.publishTime) }}</div>
            <div class="text-[26px] text-[#666] line-clamp-2">{{ item.content }}</div>
            <div class="flex items-center gap-[12px] mt-[16px]">
              <ViewListIcon class="text-[24px] text-[#0052D9]" />
              <span class="text-[24px] text-[#666]">阅读量：{{ (item.readBy || []).length }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Root>
</template>

<script setup>
import { AddIcon, NotificationIcon, ViewListIcon } from "tdesign-icons-vue-next"
import { getAnnouncements, deleteAnnouncement } from "@/api/announcements"
import { showToast, showConfirmDialog } from "@/utils/common/tools"
import { useRouter } from "vue-router"
import dayjs from "dayjs"

const router = useRouter()

const announcements = ref([])

const formatDate = (date) => dayjs(date).format('YYYY-MM-DD HH:mm')

const loadAnnouncements = async () => {
  const res = await getAnnouncements()
  announcements.value = res.data || []
}

const handleDelete = async (item) => {
  try {
    await showConfirmDialog({ content: `确定删除公告「${item.title}」吗？` })
    await deleteAnnouncement(item.id)
    showToast('已删除')
    loadAnnouncements()
  } catch (e) {
    // 用户取消操作
  }
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

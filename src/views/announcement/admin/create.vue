<template>
  <Root title="发布公告" back-url="/admin/announcement">
    <div class="min-h-screen bg-[#f5f7fa] pb-[160px]">
      <!-- 表单区域 -->
      <div class="p-[24px] px-[32px]">
        <div class="bg-white rounded-[24px] p-[24px] mb-[16px] shadow-sm">
          <div class="text-[28px] font-semibold text-[#333] mb-[20px]">公告标题</div>
          <t-input v-model="form.title" placeholder="请输入公告标题" :maxlength="100" clearable />
        </div>

        <div class="bg-white rounded-[24px] p-[24px] mb-[16px] shadow-sm">
          <div class="text-[28px] font-semibold text-[#333] mb-[20px]">公告内容</div>
          <t-textarea v-model="form.content" placeholder="请输入公告内容" :maxlength="2000" :autosize="{ minRows: 6, maxRows: 12 }" />
        </div>

        <div class="bg-white rounded-[24px] p-[24px] shadow-sm">
          <div class="text-[28px] font-semibold text-[#333] mb-[20px]">发布选项</div>
          <div class="space-y-[24px]">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-[28px] text-[#333]">置顶显示</div>
                <div class="text-[22px] text-[#999] mt-[4px]">置顶公告将优先展示</div>
              </div>
              <t-switch v-model="form.isTop" />
            </div>
            <div class="flex items-center justify-between">
              <div>
                <div class="text-[28px] text-[#333]">重要提醒</div>
                <div class="text-[22px] text-[#999] mt-[4px]">重要公告会特别提示</div>
              </div>
              <t-switch v-model="form.isRemind" />
            </div>
          </div>
        </div>
      </div>

      <!-- 底部操作栏 -->
      <div class="fixed bottom-0 left-0 right-0 px-[32px] py-[24px] pb-safe bg-white shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
        <t-button theme="primary" block size="large" :loading="loading" class="h-[88px] text-[30px] rounded-[24px] !bg-gradient-to-br !from-[#0052D9] !to-[#266FE8]" @click="handleSubmit">发布公告</t-button>
      </div>
    </div>
  </Root>
</template>

<script setup>
import { announcementRepo } from "@/db/repositories"
import { useUserStore } from "@/store"
import { showToast, showErrorDialog } from "@/utils/common/tools"
import { useRouter } from "vue-router"

const router = useRouter()
const userStore = useUserStore()

const form = reactive({
  title: '',
  content: '',
  isTop: false,
  isRemind: false
})

const loading = ref(false)

const handleSubmit = async () => {
  if (!form.title.trim()) {
    showToast('请输入公告标题')
    return
  }
  if (!form.content.trim()) {
    showToast('请输入公告内容')
    return
  }

  loading.value = true
  try {
    await announcementRepo.create({
      title: form.title.trim(),
      content: form.content.trim(),
      isTop: form.isTop,
      isRemind: form.isRemind,
      publishTime: new Date(),
      publishedBy: userStore.userId,
      readBy: []
    })
    showToast('发布成功')
    router.back()
  } catch (error) {
    showErrorDialog(error.message || '发布失败')
  } finally {
    loading.value = false
  }
}
</script>

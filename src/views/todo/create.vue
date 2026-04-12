<template>
  <Root title="新建待办" back-url="/user/todo">
    <div class="min-h-screen bg-[#f5f7fa] pb-[160px]">
      <!-- 表单区域 -->
      <div class="p-[24px] px-[32px]">
        <div class="bg-white rounded-[24px] p-[24px] mb-[16px] shadow-sm">
          <div class="text-[28px] font-semibold text-[#333] mb-[20px]">任务内容</div>
          <t-input v-model="form.title" placeholder="请输入待办事项" :maxlength="100" clearable />
        </div>

        <div class="bg-white rounded-[24px] mb-[16px] shadow-sm">
          <t-cell-group theme="card">
            <t-cell title="截止日期" @click="showDatePicker = true">
              <template #note>
                <span :class="form.dueDate ? 'text-[#0052D9]' : 'text-[#999]'">{{ form.dueDate || '不设置' }}</span>
                <ChevronRightIcon class="text-[#ccc] ml-[8px]" />
              </template>
            </t-cell>
          </t-cell-group>
        </div>

        <div class="bg-white rounded-[24px] p-[24px] mb-[16px] shadow-sm">
          <div class="text-[28px] font-semibold text-[#333] mb-[20px]">优先级</div>
          <div class="flex gap-[16px]">
            <div
              v-for="p in priorities"
              :key="p.value"
              :class="['flex-1 text-center py-[20px] rounded-[24px] transition-all', form.priority === p.value ? 'border-[2px] border-[#0052D9]' : '']"
              :style="{ background: form.priority === p.value ? p.activeBg : p.bg }"
              @click="form.priority = p.value"
            >
              <div class="text-[28px] font-semibold" :style="{ color: p.color }">{{ p.label }}</div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-[24px] p-[24px] shadow-sm">
          <div class="text-[28px] font-semibold text-[#333] mb-[16px]">备注</div>
          <t-textarea v-model="form.remark" placeholder="添加备注信息（可选）" :maxlength="200" :autosize="{ minRows: 2, maxRows: 4 }" />
        </div>
      </div>

      <!-- 底部操作栏 -->
      <div class="fixed bottom-0 left-0 right-0 px-[32px] py-[24px] pb-safe bg-white shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
        <t-button theme="primary" block size="large" :loading="loading" class="h-[88px] text-[30px] rounded-[24px] !bg-gradient-to-br !from-[#0052D9] !to-[#266FE8]" @click="handleSubmit">创建待办</t-button>
      </div>
    </div>

    <!-- 日期选择弹窗 -->
    <t-popup v-model="showDatePicker" placement="bottom" round>
      <t-date-time-picker mode="date" format="YYYY-MM-DD" title="选择截止日期" @confirm="handleDateConfirm" @cancel="showDatePicker = false" />
    </t-popup>
  </Root>
</template>

<script setup>
import { ChevronRightIcon } from "tdesign-icons-vue-next"
import { todoRepo } from "@/db/repositories"
import { useUserStore } from "@/store"
import { showToast, showErrorDialog } from "@/utils/common/tools"
import { useRouter } from "vue-router"

const router = useRouter()
const userStore = useUserStore()

const form = reactive({
  title: '',
  dueDate: '',
  priority: 2,
  remark: ''
})

const loading = ref(false)
const showDatePicker = ref(false)

const priorities = [
  { value: 1, label: '高', color: '#E34D59', bg: '#FFEBEE', activeBg: 'rgba(227,77,89,0.15)' },
  { value: 2, label: '中', color: '#ED7B2F', bg: '#FFF3E0', activeBg: 'rgba(237,123,47,0.15)' },
  { value: 3, label: '低', color: '#00A870', bg: '#E8F5E9', activeBg: 'rgba(0,168,112,0.15)' }
]

const handleDateConfirm = (value) => {
  form.dueDate = value
  showDatePicker.value = false
}

const handleSubmit = async () => {
  if (!form.title.trim()) {
    showToast('请输入待办事项')
    return
  }

  loading.value = true
  try {
    await todoRepo.create({
      userId: userStore.userId,
      title: form.title.trim(),
      dueDate: form.dueDate || null,
      priority: form.priority,
      remark: form.remark.trim() || null,
      status: 'pending',
      createdAt: new Date()
    })
    showToast('创建成功')
    router.back()
  } catch (error) {
    showErrorDialog(error.message || '创建失败')
  } finally {
    loading.value = false
  }
}
</script>

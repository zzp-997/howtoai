<template>
  <Root title="新建待办" back-url="/user/todo">
    <div class="min-h-screen bg-[#f5f7fa] pb-[160px]">
      <!-- 表单区域 -->
      <div class="p-[24px] px-[32px]">
        <div class="bg-white rounded-[24px] p-[24px] mb-[16px] shadow-sm">
          <div class="text-[28px] font-semibold text-[#333] mb-[20px]">任务内容</div>
          <t-input v-model="form.title" placeholder="请输入待办事项" :maxlength="100" clearable @blur="analyzeTask" />
        </div>

        <!-- 智能提醒建议 -->
        <div v-if="smartSuggestion" class="bg-gradient-to-br from-[#7B61FF]/10 to-[#9B8AFF]/10 rounded-[24px] p-[24px] mb-[16px] border border-[#7B61FF]/20">
          <div class="flex items-center gap-[10px] mb-[12px]">
            <LightbulbIcon class="text-[24px] text-[#7B61FF]" />
            <span class="text-[26px] font-medium text-[#7B61FF]">智能建议</span>
          </div>
          <div class="text-[24px] text-[#666] mb-[16px]">{{ smartSuggestion.reason }}</div>
          <div class="flex gap-[12px]">
            <div class="px-[20px] py-[12px] bg-white rounded-[12px] shadow-sm" @click="applySuggestion('priority')">
              <div class="text-[22px] text-[#999]">建议优先级</div>
              <div class="text-[26px] font-semibold" :style="{ color: getPriorityColor(smartSuggestion.priority) }">{{ getPriorityLabel(smartSuggestion.priority) }}</div>
            </div>
            <div v-if="smartSuggestion.suggestDate" class="px-[20px] py-[12px] bg-white rounded-[12px] shadow-sm" @click="applySuggestion('date')">
              <div class="text-[22px] text-[#999]">建议截止</div>
              <div class="text-[26px] font-semibold text-[#0052D9]">{{ smartSuggestion.suggestDateLabel }}</div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-[24px] mb-[16px] shadow-sm">
          <t-cell-group theme="card">
            <t-cell title="任务日期" @click="showTaskDatePicker = true">
              <template #note>
                <span class="text-[#0052D9]">{{ form.taskDate }}</span>
                <ChevronRightIcon class="text-[#ccc] ml-[8px]" />
              </template>
            </t-cell>
            <t-cell title="截止日期" @click="showDatePicker = true">
              <template #note>
                <span :class="form.dueDate ? 'text-[#0052D9]' : 'text-[#999]'">{{ form.dueDate || '不设置' }}</span>
                <ChevronRightIcon class="text-[#ccc] ml-[8px]" />
              </template>
            </t-cell>
          </t-cell-group>
          <!-- 快捷日期选择 -->
          <div class="px-[24px] pb-[20px] flex gap-[12px] flex-wrap">
            <div
              v-for="opt in quickDateOptions"
              :key="opt.value"
              :class="['px-[16px] py-[10px] rounded-[12px] text-[24px] transition-all',
                form.dueDate === opt.value ? 'bg-[#0052D9] text-white' : 'bg-[#f5f7fa] text-[#666]']"
              @click="form.dueDate = opt.value"
            >
              {{ opt.label }}
            </div>
          </div>
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
          <!-- 优先级说明 -->
          <div class="mt-[16px] p-[16px] bg-[#f5f7fa] rounded-[12px]">
            <div class="text-[22px] text-[#999]">
              <span class="text-[#E34D59]">●</span> 高：紧急重要，今日处理<br/>
              <span class="text-[#ED7B2F]">●</span> 中：重要不紧急，本周处理<br/>
              <span class="text-[#00A870]">●</span> 低：不紧急，稍后处理
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
    <!-- 任务日期选择弹窗 -->
    <t-popup v-model="showTaskDatePicker" placement="bottom" round>
      <t-date-time-picker mode="date" format="YYYY-MM-DD" title="选择任务日期" @confirm="handleTaskDateConfirm" @cancel="showTaskDatePicker = false" />
    </t-popup>
  </Root>
</template>

<script setup>
import { ChevronRightIcon, LightbulbIcon } from "tdesign-icons-vue-next"
import { todoRepo } from "@/db/repositories"
import { useUserStore } from "@/store"
import { showToast, showErrorDialog } from "@/utils/common/tools"
import { useRouter } from "vue-router"
import dayjs from "dayjs"

const router = useRouter()
const userStore = useUserStore()

const form = reactive({
  title: '',
  taskDate: dayjs().format('YYYY-MM-DD'), // 任务日期，默认今天
  dueDate: '',
  priority: 2,
  remark: ''
})

const loading = ref(false)
const showDatePicker = ref(false)
const showTaskDatePicker = ref(false)
const smartSuggestion = ref(null)

const priorities = [
  { value: 1, label: '高', color: '#E34D59', bg: '#FFEBEE', activeBg: 'rgba(227,77,89,0.15)' },
  { value: 2, label: '中', color: '#ED7B2F', bg: '#FFF3E0', activeBg: 'rgba(237,123,47,0.15)' },
  { value: 3, label: '低', color: '#00A870', bg: '#E8F5E9', activeBg: 'rgba(0,168,112,0.15)' }
]

// 快捷日期选项
const quickDateOptions = computed(() => {
  const today = dayjs()
  return [
    { label: '今天', value: today.format('YYYY-MM-DD') },
    { label: '明天', value: today.add(1, 'day').format('YYYY-MM-DD') },
    { label: '本周', value: today.endOf('week').format('YYYY-MM-DD') },
    { label: '下周', value: today.add(1, 'week').endOf('week').format('YYYY-MM-DD') }
  ]
})

const getPriorityLabel = (priority) => ({ 1: '高', 2: '中', 3: '低' }[priority] || '中')
const getPriorityColor = (priority) => ({ 1: '#E34D59', 2: '#ED7B2F', 3: '#00A870' }[priority] || '#666')

// 智能分析任务内容
const analyzeTask = () => {
  const title = form.title.toLowerCase()
  if (!title.trim()) {
    smartSuggestion.value = null
    return
  }

  // 关键词匹配
  const urgentKeywords = ['紧急', '急', 'urgent', 'asap', '立即', '马上', '今天', '今日']
  const importantKeywords = ['重要', '关键', '核心', '重要', '必须', 'critical', 'important']
  const lowKeywords = ['有空', '闲时', '不急', '慢慢', 'low', 'later', '稍后']

  const hasUrgent = urgentKeywords.some(k => title.includes(k))
  const hasImportant = importantKeywords.some(k => title.includes(k))
  const hasLow = lowKeywords.some(k => title.includes(k))

  // 判断优先级
  let suggestedPriority = 2 // 默认中等
  let reason = '根据任务内容分析'

  if (hasUrgent || hasImportant) {
    suggestedPriority = 1
    reason = hasUrgent ? '检测到紧急关键词，建议高优先级' : '检测到重要关键词，建议高优先级'
  } else if (hasLow) {
    suggestedPriority = 3
    reason = '检测到低优先级关键词'
  }

  // 建议截止日期
  let suggestDate = null
  let suggestDateLabel = ''
  const today = dayjs()

  if (hasUrgent) {
    suggestDate = today.format('YYYY-MM-DD')
    suggestDateLabel = '今天'
  } else if (suggestedPriority === 1) {
    suggestDate = today.add(1, 'day').format('YYYY-MM-DD')
    suggestDateLabel = '明天'
  } else if (suggestedPriority === 2) {
    suggestDate = today.endOf('week').format('YYYY-MM-DD')
    suggestDateLabel = '本周'
  }

  smartSuggestion.value = {
    priority: suggestedPriority,
    reason,
    suggestDate,
    suggestDateLabel
  }
}

// 应用智能建议
const applySuggestion = (type) => {
  if (!smartSuggestion.value) return
  if (type === 'priority') {
    form.priority = smartSuggestion.value.priority
  } else if (type === 'date' && smartSuggestion.value.suggestDate) {
    form.dueDate = smartSuggestion.value.suggestDate
  }
}

const handleDateConfirm = (value) => {
  form.dueDate = value
  showDatePicker.value = false
}

const handleTaskDateConfirm = (value) => {
  form.taskDate = value
  showTaskDatePicker.value = false
}

const handleSubmit = async () => {
  if (!form.title.trim()) {
    showToast('请输入待办事项')
    return
  }

  loading.value = true
  try {
    // 计算智能优先级分数
    const smartPriority = calculateSmartPriority(form.priority, form.dueDate)

    await todoRepo.create({
      userId: userStore.userId,
      title: form.title.trim(),
      taskDate: form.taskDate, // 任务日期
      dueDate: form.dueDate || null,
      priority: form.priority,
      smartPriority,
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

// 计算智能优先级分数（1-10）
const calculateSmartPriority = (priority, dueDate) => {
  let score = 10 - (priority * 2) // 高=8, 中=6, 低=4

  if (dueDate) {
    const today = dayjs()
    const due = dayjs(dueDate)
    const daysUntilDue = due.diff(today, 'day')

    if (daysUntilDue < 0) {
      score += 5 // 已超期
    } else if (daysUntilDue === 0) {
      score += 3 // 今天到期
    } else if (daysUntilDue <= 2) {
      score += 2 // 2天内到期
    } else if (daysUntilDue <= 7) {
      score += 1 // 一周内到期
    }
  }

  return Math.min(10, Math.max(1, score))
}
</script>

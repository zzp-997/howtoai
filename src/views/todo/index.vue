<template>
  <Root title="我的待办" back-url="/user">
    <div class="min-h-screen bg-[#f5f7fa]">
      <!-- 状态切换 -->
      <div class="flex p-[16px] px-[32px] bg-white gap-[12px]">
        <div
          v-for="tab in statusTabs"
          :key="tab.value"
          :class="['flex-1 py-[16px] text-center text-[26px] rounded-[12px] transition-all', activeTab === tab.value ? 'bg-gradient-to-br from-[#0052D9] to-[#266FE8] text-white' : 'bg-[#f5f7fa] text-[#666]']"
          @click="activeTab = tab.value"
        >
          {{ tab.label }}
          <span v-if="tab.value === 'pending' && pendingCount > 0" class="ml-[4px] text-[22px]">({{ pendingCount }})</span>
        </div>
      </div>

      <!-- 快速添加 -->
      <div class="p-[16px] px-[32px]">
        <div class="flex gap-[12px]">
          <t-input v-model="quickAddTitle" placeholder="快速添加待办，回车确认" class="flex-1" @enter="handleQuickAdd" />
          <t-button theme="primary" @click="handleQuickAdd" :disabled="!quickAddTitle.trim()">
            <template #icon><AddIcon /></template>
          </t-button>
        </div>
      </div>

      <!-- 待办列表 -->
      <div class="px-[32px]">
        <div v-if="displayList.length === 0" class="text-center py-[80px]">
          <CheckCircleIcon class="text-[60px] text-[#00A870] mb-[16px]" />
          <div class="text-[28px] text-[#999]">{{ activeTab === 'pending' ? '暂无待办任务' : '暂无已完成任务' }}</div>
        </div>

        <div v-for="todo in displayList" :key="todo.id" class="bg-white rounded-[24px] mb-[12px] p-[24px] shadow-sm flex items-start gap-[16px]">
          <!-- 完成勾选 -->
          <div
            :class="['w-[40px] h-[40px] rounded-full flex items-center justify-center flex-shrink-0 mt-[4px] transition-all cursor-pointer', todo.status === 'completed' ? 'bg-[#00A870]' : 'border-[2px] border-[#ddd]']"
            @click="handleToggle(todo)"
          >
            <CheckIcon v-if="todo.status === 'completed'" class="text-[24px] text-white" />
          </div>

          <!-- 内容区 -->
          <div class="flex-1 min-w-0">
            <div :class="['text-[28px] text-[#333] mb-[8px]', todo.status === 'completed' && 'line-through text-[#999]']">
              {{ todo.title }}
            </div>
            <div class="flex items-center gap-[12px] flex-wrap">
              <!-- 优先级标签 -->
              <span :class="['text-[22px] px-[10px] py-[2px] rounded-[6px]', getPriorityStyle(todo.priority)]">
                {{ getPriorityLabel(todo.priority) }}
              </span>
              <!-- 任务日期 -->
              <span v-if="todo.taskDate" class="flex items-center gap-[6px] text-[22px] text-[#0052D9]">
                <CalendarIcon class="text-[20px]" />
                {{ formatTaskDate(todo.taskDate) }}
              </span>
              <!-- 截止日期 -->
              <span v-if="todo.dueDate" class="flex items-center gap-[6px] text-[22px] text-[#666]">
                <TimeIcon class="text-[20px]" />
                截止: {{ formatDueDate(todo.dueDate) }}
              </span>
              <!-- 关联业务 -->
              <span v-if="todo.relatedType" class="text-[22px] text-[#0052D9]">
                #{{ getRelatedLabel(todo.relatedType) }}
              </span>
            </div>
          </div>

          <!-- 删除按钮 -->
          <div class="w-[40px] h-[40px] flex items-center justify-center text-[#ccc]" @click="handleDelete(todo)">
            <DeleteIcon class="text-[28px]" />
          </div>
        </div>
      </div>

      <!-- 底部新建按钮 -->
      <div class="fixed bottom-[32px] right-[32px]">
        <div class="w-[100px] h-[100px] bg-gradient-to-br from-[#0052D9] to-[#266FE8] rounded-full flex items-center justify-center shadow-lg shadow-[#0052D9]/30" @click="router.push('/user/todo/create')">
          <AddIcon class="text-[48px] text-white" />
        </div>
      </div>
    </div>
  </Root>
</template>

<script setup>
import { AddIcon, CheckIcon, CheckCircleIcon, TimeIcon, DeleteIcon, CalendarIcon } from "tdesign-icons-vue-next"
import { todoRepo } from "@/db/repositories"
import { useUserStore } from "@/store"
import { showToast, showConfirmDialog } from "@/utils/common/tools"
import { useRouter } from "vue-router"
import dayjs from "dayjs"

const router = useRouter()
const userStore = useUserStore()

const activeTab = ref('pending')
const todos = ref([])
const quickAddTitle = ref('')

const statusTabs = [
  { label: '待完成', value: 'pending' },
  { label: '已完成', value: 'completed' }
]

const pendingCount = computed(() => todos.value.filter(t => t.status === 'pending').length)

const displayList = computed(() => {
  if (activeTab.value === 'pending') {
    return todos.value.filter(t => t.status === 'pending').sort((a, b) => {
      if (a.dueDate && b.dueDate) return new Date(a.dueDate) - new Date(b.dueDate)
      if (a.dueDate && !b.dueDate) return -1
      if (!a.dueDate && b.dueDate) return 1
      return a.priority - b.priority
    })
  }
  return todos.value.filter(t => t.status === 'completed').sort((a, b) => {
    return new Date(b.completedAt) - new Date(a.completedAt)
  })
})

const getPriorityLabel = (priority) => ({ 1: '高', 2: '中', 3: '低' }[priority] || '中')
const getPriorityStyle = (priority) => ({
  1: 'bg-[#FFEBEE] text-[#E34D59]',
  2: 'bg-[#FFF3E0] text-[#ED7B2F]',
  3: 'bg-[#E8F5E9] text-[#00A870]'
}[priority] || 'bg-[#f5f7fa] text-[#666]')

const getRelatedLabel = (type) => ({ leave: '请假', trip: '差旅', meeting: '会议' }[type] || type)

const formatTaskDate = (date) => {
  const today = dayjs().format('YYYY-MM-DD')
  const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD')
  if (date === today) return '今天'
  if (date === tomorrow) return '明天'
  return dayjs(date).format('MM月DD日')
}

const formatDueDate = (date) => {
  const today = dayjs().format('YYYY-MM-DD')
  const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD')
  if (date === today) return '今天'
  if (date === tomorrow) return '明天'
  return dayjs(date).format('MM月DD日')
}

const loadTodos = async () => {
  todos.value = await todoRepo.findByUserId(userStore.userId)
}

const handleQuickAdd = async () => {
  if (!quickAddTitle.value.trim()) return
  await todoRepo.create({
    userId: userStore.userId,
    title: quickAddTitle.value.trim(),
    taskDate: dayjs().format('YYYY-MM-DD'), // 默认今天
    status: 'pending',
    priority: 2,
    createdAt: new Date()
  })
  quickAddTitle.value = ''
  showToast('添加成功')
  loadTodos()
}

const handleToggle = async (todo) => {
  await todoRepo.toggleComplete(todo.id)
  loadTodos()
}

const handleDelete = async (todo) => {
  try {
    await showConfirmDialog({ content: `确定删除「${todo.title}」吗？` })
    await todoRepo.delete(todo.id)
    showToast('已删除')
    loadTodos()
  } catch (e) {
    // 用户取消操作
  }
}

onMounted(() => loadTodos())
</script>

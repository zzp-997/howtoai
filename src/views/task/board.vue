<template>
  <Root title="任务看板" back-url="/user">
    <div class="min-h-screen bg-[#f5f7fa] pb-[150px]">
      <!-- 顶部操作栏 - 重新设计 -->
      <div class="bg-white px-[24px] pt-[16px] pb-[12px] sticky top-0 z-10 shadow-sm">
        <!-- 搜索框 - 更大更明显 -->
        <div class="flex gap-[12px] mb-[16px]">
          <div class="flex-1 relative">
            <t-input
              v-model="searchKeyword"
              placeholder="搜索任务标题或内容..."
              class="!h-[72px] !bg-[#f5f7fa] !rounded-[16px] !text-[26px]"
              clearable
              @clear="handleSearch"
              @enter="handleSearch"
            >
              <template #prefix-icon>
                <SearchIcon class="text-[28px] text-[#999]" />
              </template>
            </t-input>
          </div>
          <t-button
            theme="primary"
            size="large"
            class="!w-[88px] !h-[72px] !rounded-[16px] !bg-gradient-to-r !from-[#0052D9] !to-[#266FE8] shadow-lg shadow-[#0052D9]/30"
            @click="router.push('/user/task/create')"
          >
            <template #icon><AddIcon class="text-[32px]" /></template>
          </t-button>
        </div>

        <!-- 筛选条件 - 优化为胶囊标签 -->
        <div class="flex gap-[12px] overflow-x-auto [scrollbar-width:none] pb-[4px]">
          <div
            :class="[
              'flex-shrink-0 px-[20px] h-[52px] rounded-full text-[24px] font-medium transition-all cursor-pointer flex items-center gap-[8px]',
              filterPriority
                ? 'bg-gradient-to-r from-[#0052D9] to-[#266FE8] text-white shadow-lg shadow-[#0052D9]/20'
                : 'bg-[#f5f7fa] text-[#666] hover:bg-[#e8ecf0]'
            ]"
            @click="showPrioritySheet = true"
          >
            <FilterIcon class="text-[22px]" />
            {{ filterPriority ? TASK_PRIORITY_LABELS[filterPriority] : '优先级' }}
          </div>
          <div
            :class="[
              'flex-shrink-0 px-[20px] h-[52px] rounded-full text-[24px] font-medium transition-all cursor-pointer flex items-center gap-[8px]',
              filterAssignee
                ? 'bg-gradient-to-r from-[#0052D9] to-[#266FE8] text-white shadow-lg shadow-[#0052D9]/20'
                : 'bg-[#f5f7fa] text-[#666] hover:bg-[#e8ecf0]'
            ]"
            @click="showAssigneeSheet = true"
          >
            <UserIcon class="text-[22px]" />
            {{ filterAssignee ? getAssigneeName(filterAssignee) : '分配人' }}
          </div>
          <div
            v-if="filterPriority || filterAssignee"
            class="flex-shrink-0 px-[20px] h-[52px] rounded-full text-[24px] text-[#E34D59] flex items-center gap-[6px] cursor-pointer active:scale-95 transition-transform"
            @click="clearFilters"
          >
            <CloseIcon class="text-[20px]" />
            清除
          </div>
        </div>
      </div>

      <!-- 看板区域 - 重新设计卡片风格 -->
      <div class="flex gap-[16px] p-[16px] px-[24px] overflow-x-auto [scrollbar-width:none]">
        <!-- 待处理列 -->
        <div class="flex-shrink-0 w-[340px]">
          <!-- 列头 - 重新设计 -->
          <div class="bg-gradient-to-r from-[#64748b] to-[#94a3b8] rounded-[20px] p-[16px] mb-[12px]">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-[12px]">
                <div class="w-[10px] h-[10px] rounded-full bg-white/80 animate-pulse"></div>
                <span class="text-[28px] font-semibold text-white">待处理</span>
                <span class="px-[10px] py-[2px] bg-white/20 rounded-full text-[22px] text-white/90">{{ todoList.length }}</span>
              </div>
              <div
                class="w-[48px] h-[48px] bg-white/20 hover:bg-white/30 rounded-[14px] flex items-center justify-center cursor-pointer active:scale-95 transition-all"
                @click="handleQuickAdd(TASK_STATUS.TODO)"
              >
                <AddIcon class="text-[26px] text-white" />
              </div>
            </div>
          </div>
          <!-- 卡片区域 -->
          <div class="bg-[#f8fafc] rounded-[20px] p-[12px] max-h-[58vh] overflow-y-auto [scrollbar-width:none] space-y-[12px]">
            <div
              v-for="(task, index) in todoList"
              :key="task.id"
              class="bg-white rounded-[20px] p-[20px] shadow-sm cursor-pointer active:scale-[0.98] transition-all border border-transparent hover:border-[#64748b]/20 hover:shadow-md"
              :style="{ animationDelay: `${index * 50}ms` }"
              @click="goToDetail(task)"
            >
              <TaskCard :task="task" @status-change="(t, s) => handleStatusChange(t, s)" />
            </div>
            <div v-if="todoList.length === 0" class="text-center py-[60px]">
              <div class="w-[80px] h-[80px] mx-auto bg-[#f1f5f9] rounded-full flex items-center justify-center mb-[16px]">
                <FileIcon class="text-[40px] text-[#94a3b8]" />
              </div>
              <div class="text-[24px] text-[#94a3b8]">暂无待处理任务</div>
            </div>
          </div>
        </div>

        <!-- 进行中列 -->
        <div class="flex-shrink-0 w-[340px]">
          <div class="bg-gradient-to-r from-[#0052D9] to-[#266FE8] rounded-[20px] p-[16px] mb-[12px] shadow-lg shadow-[#0052D9]/20">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-[12px]">
                <div class="w-[10px] h-[10px] rounded-full bg-white/80 animate-pulse"></div>
                <span class="text-[28px] font-semibold text-white">进行中</span>
                <span class="px-[10px] py-[2px] bg-white/20 rounded-full text-[22px] text-white/90">{{ inProgressList.length }}</span>
              </div>
              <div
                class="w-[48px] h-[48px] bg-white/20 hover:bg-white/30 rounded-[14px] flex items-center justify-center cursor-pointer active:scale-95 transition-all"
                @click="handleQuickAdd(TASK_STATUS.IN_PROGRESS)"
              >
                <AddIcon class="text-[26px] text-white" />
              </div>
            </div>
          </div>
          <div class="bg-[#EEF4FF] rounded-[20px] p-[12px] max-h-[58vh] overflow-y-auto [scrollbar-width:none] space-y-[12px]">
            <div
              v-for="(task, index) in inProgressList"
              :key="task.id"
              class="bg-white rounded-[20px] p-[20px] shadow-sm cursor-pointer active:scale-[0.98] transition-all border-l-[5px] border-[#0052D9] hover:shadow-md"
              :style="{ animationDelay: `${index * 50}ms` }"
              @click="goToDetail(task)"
            >
              <TaskCard :task="task" @status-change="(t, s) => handleStatusChange(t, s)" />
            </div>
            <div v-if="inProgressList.length === 0" class="text-center py-[60px]">
              <div class="w-[80px] h-[80px] mx-auto bg-[#dbeafe] rounded-full flex items-center justify-center mb-[16px]">
                <TimeIcon class="text-[40px] text-[#3b82f6]" />
              </div>
              <div class="text-[24px] text-[#93c5fd]">暂无进行中任务</div>
            </div>
          </div>
        </div>

        <!-- 已完成列 -->
        <div class="flex-shrink-0 w-[340px]">
          <div class="bg-gradient-to-r from-[#00A870] to-[#2BA471] rounded-[20px] p-[16px] mb-[12px] shadow-lg shadow-[#00A870]/20">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-[12px]">
                <div class="w-[10px] h-[10px] rounded-full bg-white/80"></div>
                <span class="text-[28px] font-semibold text-white">已完成</span>
                <span class="px-[10px] py-[2px] bg-white/20 rounded-full text-[22px] text-white/90">{{ doneList.length }}</span>
              </div>
            </div>
          </div>
          <div class="bg-[#E8F9F0] rounded-[20px] p-[12px] max-h-[58vh] overflow-y-auto [scrollbar-width:none] space-y-[12px]">
            <div
              v-for="(task, index) in doneList"
              :key="task.id"
              class="bg-white rounded-[20px] p-[20px] shadow-sm cursor-pointer active:scale-[0.98] transition-all border-l-[5px] border-[#00A870] opacity-85 hover:opacity-100 hover:shadow-md"
              :style="{ animationDelay: `${index * 50}ms` }"
              @click="goToDetail(task)"
            >
              <TaskCard :task="task" :completed="true" @status-change="(t, s) => handleStatusChange(t, s)" />
            </div>
            <div v-if="doneList.length === 0" class="text-center py-[60px]">
              <div class="w-[80px] h-[80px] mx-auto bg-[#d1fae5] rounded-full flex items-center justify-center mb-[16px]">
                <CheckCircleIcon class="text-[40px] text-[#34d399]" />
              </div>
              <div class="text-[24px] text-[#6ee7b7]">暂无已完成任务</div>
            </div>
          </div>
        </div>

        <!-- 已关闭列 -->
        <div class="flex-shrink-0 w-[340px]">
          <div class="bg-gradient-to-r from-[#94a3b8] to-[#cbd5e1] rounded-[20px] p-[16px] mb-[12px]">
            <div class="flex items-center gap-[12px]">
              <div class="w-[10px] h-[10px] rounded-full bg-white/60"></div>
              <span class="text-[28px] font-semibold text-white">已关闭</span>
              <span class="px-[10px] py-[2px] bg-white/20 rounded-full text-[22px] text-white/80">{{ closedList.length }}</span>
            </div>
          </div>
          <div class="bg-[#f1f5f9] rounded-[20px] p-[12px] max-h-[58vh] overflow-y-auto [scrollbar-width:none] space-y-[12px]">
            <div
              v-for="(task, index) in closedList"
              :key="task.id"
              class="bg-white rounded-[20px] p-[20px] shadow-sm cursor-pointer active:scale-[0.98] transition-all opacity-60 hover:opacity-80 hover:shadow-md"
              :style="{ animationDelay: `${index * 50}ms` }"
              @click="goToDetail(task)"
            >
              <TaskCard :task="task" :closed="true" @status-change="(t, s) => handleStatusChange(t, s)" />
            </div>
            <div v-if="closedList.length === 0" class="text-center py-[60px]">
              <div class="w-[80px] h-[80px] mx-auto bg-[#e2e8f0] rounded-full flex items-center justify-center mb-[16px]">
                <FolderIcon class="text-[40px] text-[#94a3b8]" />
              </div>
              <div class="text-[24px] text-[#cbd5e1]">暂无已关闭任务</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 快速添加弹窗 - 重新设计 -->
      <t-popup v-model="showQuickAdd" placement="bottom" round>
        <div class="bg-white rounded-t-[32px] p-[32px] pb-[48px]">
          <div class="flex items-center justify-between mb-[24px]">
            <div class="text-[32px] font-bold text-[#1e293b]">快速添加任务</div>
            <div
              class="w-[48px] h-[48px] bg-[#f5f7fa] rounded-full flex items-center justify-center cursor-pointer active:scale-95 transition-all"
              @click="showQuickAdd = false"
            >
              <CloseIcon class="text-[24px] text-[#666]" />
            </div>
          </div>
          <!-- 状态指示 -->
          <div class="flex items-center gap-[12px] mb-[20px]">
            <div :class="['w-[12px] h-[12px] rounded-full', getStatusDotColor(quickAddStatus)]"></div>
            <span class="text-[24px] text-[#666]">{{ getStatusLabel(quickAddStatus) }}</span>
          </div>
          <div class="flex flex-col gap-[16px]">
            <t-input
              v-model="quickAddTitle"
              placeholder="输入任务标题..."
              class="!h-[88px] !text-[28px] !bg-[#f5f7fa] !rounded-[16px]"
              @enter="submitQuickAdd"
            />
            <div class="flex gap-[12px]">
              <div
                :class="['flex-1 h-[72px] flex items-center justify-center gap-[8px] rounded-[16px] text-[24px] font-medium cursor-pointer transition-all border-2',
                  quickAddPriority === TASK_PRIORITY.HIGH ? 'border-[#E34D59] bg-[#FFEBEE] text-[#E34D59]' :
                  quickAddPriority === TASK_PRIORITY.MEDIUM ? 'border-[#ED7B2F] bg-[#FFF3E0] text-[#ED7B2F]' :
                  'border-[#00A870] bg-[#E8F5E9] text-[#00A870]'
                ]"
                @click="showQuickPrioritySheet = true"
              >
                <FlagIcon class="text-[24px]" />
                {{ TASK_PRIORITY_LABELS[quickAddPriority] }}
              </div>
              <t-button
                theme="primary"
                size="large"
                class="flex-1 !h-[72px] !text-[28px] !rounded-[16px] !bg-gradient-to-r !from-[#0052D9] !to-[#266FE8] shadow-lg shadow-[#0052D9]/30"
                :disabled="!quickAddTitle.trim()"
                :loading="submitting"
                @click="submitQuickAdd"
              >
                添加任务
              </t-button>
            </div>
          </div>
        </div>
      </t-popup>

      <t-action-sheet v-model="showQuickPrioritySheet" :items="priorityOptions" @selected="handleQuickPrioritySelect" />
      <t-action-sheet v-model="showPrioritySheet" :items="priorityOptions" @selected="handlePrioritySelect" />
      <t-action-sheet v-model="showAssigneeSheet" :items="assigneeOptions" @selected="handleAssigneeSelect" />
    </div>
  </Root>
</template>

<script setup lang="tsx">
import {
  SearchIcon,
  AddIcon,
  CloseIcon,
  FilterIcon,
  UserIcon,
  CheckCircleIcon,
  TimeIcon,
  FolderIcon,
  FileIcon,
  CheckIcon,
  ChevronRightIcon,
  FlagIcon
} from 'tdesign-icons-vue-next'
import {
  getTasks,
  createTask,
  updateTaskStatus,
  TASK_STATUS,
  TASK_PRIORITY,
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS
} from '@/api/task'
import { useUserStore } from '@/store'
import { useRouter } from 'vue-router'
import { showToast } from '@/utils/common/tools'
import dayjs from 'dayjs'

const router = useRouter()
const userStore = useUserStore()

const tasks = ref([])
const searchKeyword = ref('')
const filterPriority = ref(null)
const filterAssignee = ref(null)
const showPrioritySheet = ref(false)
const showAssigneeSheet = ref(false)
const submitting = ref(false)

const showQuickAdd = ref(false)
const quickAddTitle = ref('')
const quickAddPriority = ref(TASK_PRIORITY.MEDIUM)
const quickAddStatus = ref(TASK_STATUS.TODO)
const showQuickPrioritySheet = ref(false)

const priorityOptions = computed(() => [
  { label: TASK_PRIORITY_LABELS[TASK_PRIORITY.HIGH], value: TASK_PRIORITY.HIGH },
  { label: TASK_PRIORITY_LABELS[TASK_PRIORITY.MEDIUM], value: TASK_PRIORITY.MEDIUM },
  { label: TASK_PRIORITY_LABELS[TASK_PRIORITY.LOW], value: TASK_PRIORITY.LOW }
])

const assigneeOptions = computed(() => {
  const assignees = new Map()
  tasks.value.forEach(task => {
    if (task.assignees && task.assignees.length > 0) {
      task.assignees.forEach(assignee => {
        if (assignee) assignees.set(assignee.id, assignee)
      })
    }
  })
  return Array.from(assignees.values()).map(user => ({ label: user.name, value: user.id }))
})

const filteredTasks = computed(() => {
  let result = [...tasks.value]
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.trim().toLowerCase()
    result = result.filter(task =>
      task.title.toLowerCase().includes(keyword) ||
      (task.description && task.description.toLowerCase().includes(keyword))
    )
  }
  if (filterPriority.value) result = result.filter(task => task.priority === filterPriority.value)
  if (filterAssignee.value) result = result.filter(task => task.assignees?.some(a => a.id === filterAssignee.value))
  return result
})

const todoList = computed(() => filteredTasks.value.filter(t => t.status === TASK_STATUS.TODO).sort((a, b) => getPriorityWeight(a.priority) - getPriorityWeight(b.priority)))
const inProgressList = computed(() => filteredTasks.value.filter(t => t.status === TASK_STATUS.IN_PROGRESS).sort((a, b) => getPriorityWeight(a.priority) - getPriorityWeight(b.priority)))
const doneList = computed(() => filteredTasks.value.filter(t => t.status === TASK_STATUS.DONE).sort((a, b) => new Date(b.completedAt || b.updatedAt) - new Date(a.completedAt || a.updatedAt)))
const closedList = computed(() => filteredTasks.value.filter(t => t.status === TASK_STATUS.CLOSED).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)))

const getPriorityWeight = (priority) => ({ [TASK_PRIORITY.HIGH]: 1, [TASK_PRIORITY.MEDIUM]: 2, [TASK_PRIORITY.LOW]: 3 }[priority] || 2)
const getAssigneeName = (id) => assigneeOptions.value.find(opt => opt.value === id)?.label || ''

const getStatusDotColor = (status) => ({
  [TASK_STATUS.TODO]: 'bg-[#94a3b8]',
  [TASK_STATUS.IN_PROGRESS]: 'bg-[#0052D9]',
  [TASK_STATUS.DONE]: 'bg-[#00A870]',
  [TASK_STATUS.CLOSED]: 'bg-[#94a3b8]'
}[status] || 'bg-[#94a3b8]')

const getStatusLabel = (status) => TASK_STATUS_LABELS[status] || ''

const loadTasks = async () => {
  try {
    const res = await getTasks()
    const data = res.data
    tasks.value = Array.isArray(data) ? data : (data?.list || [])
  } catch (error) {
    console.error('加载任务失败:', error)
    showToast('加载任务失败')
  }
}

const handleSearch = () => {}
const handlePrioritySelect = (index) => { filterPriority.value = priorityOptions.value[index]?.value || null }
const handleAssigneeSelect = (index) => { filterAssignee.value = assigneeOptions.value[index]?.value || null }
const clearFilters = () => { filterPriority.value = null; filterAssignee.value = null; searchKeyword.value = '' }
const goToDetail = (task) => { router.push(`/user/task/${task.id}`) }

const handleStatusChange = async (task, newStatus) => {
  try {
    await updateTaskStatus(task.id, newStatus)
    showToast('状态已更新')
    await loadTasks()
  } catch (error) {
    console.error('更新状态失败:', error)
    showToast('更新状态失败')
  }
}

const handleQuickAdd = (status) => {
  quickAddStatus.value = status
  quickAddTitle.value = ''
  quickAddPriority.value = TASK_PRIORITY.MEDIUM
  showQuickAdd.value = true
}
const handleQuickPrioritySelect = (index) => { quickAddPriority.value = priorityOptions.value[index]?.value || TASK_PRIORITY.MEDIUM }

const submitQuickAdd = async () => {
  if (!quickAddTitle.value.trim()) return
  submitting.value = true
  try {
    await createTask({
      title: quickAddTitle.value.trim(),
      priority: quickAddPriority.value,
      status: quickAddStatus.value,
      assignees: userStore.userInfo?.id ? [userStore.userInfo.id] : []
    })
    showToast('添加成功')
    showQuickAdd.value = false
    quickAddTitle.value = ''
    await loadTasks()
  } catch (error) {
    console.error('添加任务失败:', error)
    showToast('添加任务失败')
  } finally {
    submitting.value = false
  }
}

const TaskCard = defineComponent({
  name: 'TaskCard',
  props: {
    task: { type: Object, required: true },
    completed: { type: Boolean, default: false },
    closed: { type: Boolean, default: false }
  },
  emits: ['status-change'],
  setup(props, { emit }) {
    const getPriorityConfig = (priority) => ({
      [TASK_PRIORITY.HIGH]: {
        bg: 'bg-gradient-to-r from-[#FFEBEE] to-[#FFCDD2]',
        text: 'text-[#E34D59]',
        dot: 'bg-[#E34D59]',
        label: '高'
      },
      [TASK_PRIORITY.MEDIUM]: {
        bg: 'bg-gradient-to-r from-[#FFF3E0] to-[#FFE0B2]',
        text: 'text-[#ED7B2F]',
        dot: 'bg-[#ED7B2F]',
        label: '中'
      },
      [TASK_PRIORITY.LOW]: {
        bg: 'bg-gradient-to-r from-[#E8F5E9] to-[#C8E6C9]',
        text: 'text-[#00A870]',
        dot: 'bg-[#00A870]',
        label: '低'
      }
    }[priority] || {
      bg: 'bg-[#f5f7fa]',
      text: 'text-[#666]',
      dot: 'bg-[#666]',
      label: '中'
    })

    const formatDueDate = (date) => {
      if (!date) return ''
      const today = dayjs().format('YYYY-MM-DD')
      const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD')
      if (date === today) return '今天'
      if (date === tomorrow) return '明天'
      return dayjs(date).format('MM月DD日')
    }

    const isOverdue = (date) => date && dayjs(date).isBefore(dayjs(), 'day')

    const handleStatusChangeLocal = (e) => {
      e.stopPropagation()
      const statusOrder = [TASK_STATUS.TODO, TASK_STATUS.IN_PROGRESS, TASK_STATUS.DONE, TASK_STATUS.CLOSED]
      const currentIndex = statusOrder.indexOf(props.task.status)
      emit('status-change', props.task, statusOrder[(currentIndex + 1) % statusOrder.length])
    }

    return () => {
      const priorityConfig = getPriorityConfig(props.task.priority)
      return (
        <div>
          {/* 标题区域 */}
          <div class={['text-[28px] font-semibold mb-[14px] leading-tight', (props.completed || props.closed) && 'line-through text-[#999]']}>
            {props.task.title}
          </div>

          {/* 标签区域 */}
          <div class="flex items-center gap-[10px] flex-wrap mb-[14px]">
            {/* 优先级标签 */}
            <span class={['px-[12px] py-[4px] rounded-[10px] text-[20px] font-medium flex items-center gap-[6px]', priorityConfig.bg, priorityConfig.text]}>
              <span class={['w-[6px] h-[6px] rounded-full', priorityConfig.dot]}></span>
              {priorityConfig.label}优先级
            </span>

            {/* 截止日期 */}
            {props.task.dueDate && (
              <span class={['flex items-center gap-[6px] text-[20px] px-[12px] py-[4px] rounded-[10px] bg-[#f5f7fa]', isOverdue(props.task.dueDate) && !props.completed ? 'text-[#E34D59] bg-[#FFEBEE]' : 'text-[#666]']}>
                <TimeIcon class="text-[18px]" />
                {formatDueDate(props.task.dueDate)}
              </span>
            )}
          </div>

          {/* 底部区域 */}
          <div class="flex items-center justify-between pt-[10px] border-t border-[#f0f0f0]">
            {/* 负责人 */}
            {props.task.assignees && props.task.assignees.length > 0 && (
              <div class="flex items-center gap-[10px]">
                <div class="flex -space-x-2">
                  {props.task.assignees.slice(0, 3).map((a, i) => (
                    <t-avatar key={a.id || i} image={a.avatar} size="36px" class="border-2 border-white shadow-sm">
                      {a.name?.charAt(0)}
                    </t-avatar>
                  ))}
                </div>
                {props.task.assignees.length > 1 && (
                  <span class="text-[22px] text-[#666] font-medium">+{props.task.assignees.length - 1}</span>
                )}
              </div>
            )}

            {/* 状态切换按钮 */}
            {!props.closed && (
              <div
                class="flex items-center gap-[4px] text-[22px] text-[#0052D9] font-medium cursor-pointer px-[12px] py-[6px] rounded-[10px] hover:bg-[#0052D9]/10 active:scale-95 transition-all"
                onClick={handleStatusChangeLocal}
              >
                切换
                <ChevronRightIcon class="text-[20px]" />
              </div>
            )}
          </div>
        </div>
      )
    }
  }
})

onMounted(() => { loadTasks() })
</script>

<style scoped>
/* 卡片入场动画 */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.bg-white.rounded-\[20px\].p-\[20px\] {
  animation: slideInUp 0.3s ease-out forwards;
}

/* 脉冲动画优化 */
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* 触摸反馈 */
.active\:scale-\[0\.98\] {
  transform: scale(0.98);
}

/* 悬停效果 */
.hover\:border-\[\#64748b\]\/20:hover {
  border-color: rgba(100, 116, 139, 0.2);
}

.hover\:shadow-md:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.hover\:bg-\[0052D9\]\/10:hover {
  background-color: rgba(0, 82, 217, 0.1);
}

/* 状态切换按钮悬停 */
.active\:scale-95:active {
  transform: scale(0.95);
}
</style>

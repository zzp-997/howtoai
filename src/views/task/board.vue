<template>
  <Root title="任务看板" back-url="/user">
    <div class="min-h-screen bg-[#f5f7fa] pb-[150px]">
      <!-- 顶部操作栏 -->
      <div class="bg-white p-[16px] px-[32px] sticky top-0 z-10 shadow-sm">
        <!-- 搜索框 -->
        <div class="flex gap-[12px] mb-[16px]">
          <t-input
            v-model="searchKeyword"
            placeholder="搜索任务..."
            class="flex-1"
            clearable
            @clear="handleSearch"
            @enter="handleSearch"
          >
            <template #prefix-icon>
              <SearchIcon class="text-[24px] text-[#999]" />
            </template>
          </t-input>
          <t-button theme="primary" @click="router.push('/user/task/create')">
            <template #icon><AddIcon /></template>
          </t-button>
        </div>

        <!-- 筛选条件 -->
        <div class="flex gap-[12px] overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <!-- 优先级筛选 -->
          <t-dropdown
            :options="priorityOptions"
            @change="handlePriorityChange"
          >
            <t-button
              variant="outline"
              size="small"
              :class="['!h-[56px] !text-[24px] !rounded-[12px]', filterPriority ? '!border-[#0052D9] !text-[#0052D9]' : '']"
            >
              {{ filterPriority ? TASK_PRIORITY_LABELS[filterPriority] : '优先级' }}
              <template #suffix><ChevronDownIcon class="text-[20px]" /></template>
            </t-button>
          </t-dropdown>

          <!-- 分配人筛选 -->
          <t-dropdown
            :options="assigneeOptions"
            @change="handleAssigneeChange"
          >
            <t-button
              variant="outline"
              size="small"
              :class="['!h-[56px] !text-[24px] !rounded-[12px]', filterAssignee ? '!border-[#0052D9] !text-[#0052D9]' : '']"
            >
              {{ filterAssignee ? getAssigneeName(filterAssignee) : '分配人' }}
              <template #suffix><ChevronDownIcon class="text-[20px]" /></template>
            </t-button>
          </t-dropdown>

          <!-- 清除筛选 -->
          <t-button
            v-if="filterPriority || filterAssignee"
            variant="text"
            size="small"
            class="!h-[56px] !text-[24px] !text-[#E34D59]"
            @click="clearFilters"
          >
            清除筛选
          </t-button>
        </div>
      </div>

      <!-- 看板区域 -->
      <div class="flex gap-[16px] p-[16px] px-[24px] overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden" style="scroll-snap-type: x mandatory;">
        <!-- 待处理列 -->
        <div class="flex-shrink-0 w-[320px] bg-[#f0f0f0] rounded-[20px] p-[16px]" style="scroll-snap-align: start;">
          <div class="flex items-center justify-between mb-[16px]">
            <div class="flex items-center gap-[8px]">
              <div class="w-[8px] h-[8px] rounded-full bg-[#666]"></div>
              <span class="text-[26px] font-medium text-[#333]">待处理</span>
              <span class="text-[22px] text-[#999]">({{ todoList.length }})</span>
            </div>
            <t-button
              variant="text"
              size="small"
              class="!h-[40px] !w-[40px] !p-0"
              @click="handleQuickAdd(TASK_STATUS.TODO)"
            >
              <AddIcon class="text-[28px] text-[#666]" />
            </t-button>
          </div>
          <div class="flex flex-col gap-[12px] max-h-[60vh] overflow-y-auto [scrollbar-width:none]">
            <div
              v-for="task in todoList"
              :key="task.id"
              class="bg-white rounded-[16px] p-[16px] shadow-sm cursor-pointer active:scale-[0.98] transition-transform"
              @click="goToDetail(task)"
            >
              <TaskCard :task="task" @status-change="(task, status) => handleStatusChange(task, status)" />
            </div>
            <div v-if="todoList.length === 0" class="text-center py-[40px] text-[24px] text-[#999]">
              暂无待处理任务
            </div>
          </div>
        </div>

        <!-- 进行中列 -->
        <div class="flex-shrink-0 w-[320px] bg-[#e8f4ff] rounded-[20px] p-[16px]" style="scroll-snap-align: start;">
          <div class="flex items-center justify-between mb-[16px]">
            <div class="flex items-center gap-[8px]">
              <div class="w-[8px] h-[8px] rounded-full bg-[#0052D9]"></div>
              <span class="text-[26px] font-medium text-[#333]">进行中</span>
              <span class="text-[22px] text-[#999]">({{ inProgressList.length }})</span>
            </div>
            <t-button
              variant="text"
              size="small"
              class="!h-[40px] !w-[40px] !p-0"
              @click="handleQuickAdd(TASK_STATUS.IN_PROGRESS)"
            >
              <AddIcon class="text-[28px] text-[#0052D9]" />
            </t-button>
          </div>
          <div class="flex flex-col gap-[12px] max-h-[60vh] overflow-y-auto [scrollbar-width:none]">
            <div
              v-for="task in inProgressList"
              :key="task.id"
              class="bg-white rounded-[16px] p-[16px] shadow-sm cursor-pointer active:scale-[0.98] transition-transform border-l-[4px] border-[#0052D9]"
              @click="goToDetail(task)"
            >
              <TaskCard :task="task" @status-change="(task, status) => handleStatusChange(task, status)" />
            </div>
            <div v-if="inProgressList.length === 0" class="text-center py-[40px] text-[24px] text-[#999]">
              暂无进行中任务
            </div>
          </div>
        </div>

        <!-- 已完成列 -->
        <div class="flex-shrink-0 w-[320px] bg-[#e8f9f0] rounded-[20px] p-[16px]" style="scroll-snap-align: start;">
          <div class="flex items-center gap-[8px] mb-[16px]">
            <div class="w-[8px] h-[8px] rounded-full bg-[#00A870]"></div>
            <span class="text-[26px] font-medium text-[#333]">已完成</span>
            <span class="text-[22px] text-[#999]">({{ doneList.length }})</span>
          </div>
          <div class="flex flex-col gap-[12px] max-h-[60vh] overflow-y-auto [scrollbar-width:none]">
            <div
              v-for="task in doneList"
              :key="task.id"
              class="bg-white rounded-[16px] p-[16px] shadow-sm cursor-pointer active:scale-[0.98] transition-transform border-l-[4px] border-[#00A870]"
              @click="goToDetail(task)"
            >
              <TaskCard :task="task" :completed="true" @status-change="(task, status) => handleStatusChange(task, status)" />
            </div>
            <div v-if="doneList.length === 0" class="text-center py-[40px] text-[24px] text-[#999]">
              暂无已完成任务
            </div>
          </div>
        </div>

        <!-- 已关闭列 -->
        <div class="flex-shrink-0 w-[320px] bg-[#f5f5f5] rounded-[20px] p-[16px]" style="scroll-snap-align: start;">
          <div class="flex items-center gap-[8px] mb-[16px]">
            <div class="w-[8px] h-[8px] rounded-full bg-[#999]"></div>
            <span class="text-[26px] font-medium text-[#333]">已关闭</span>
            <span class="text-[22px] text-[#999]">({{ closedList.length }})</span>
          </div>
          <div class="flex flex-col gap-[12px] max-h-[60vh] overflow-y-auto [scrollbar-width:none]">
            <div
              v-for="task in closedList"
              :key="task.id"
              class="bg-white rounded-[16px] p-[16px] shadow-sm cursor-pointer active:scale-[0.98] transition-transform opacity-70"
              @click="goToDetail(task)"
            >
              <TaskCard :task="task" :closed="true" @status-change="(task, status) => handleStatusChange(task, status)" />
            </div>
            <div v-if="closedList.length === 0" class="text-center py-[40px] text-[24px] text-[#999]">
              暂无已关闭任务
            </div>
          </div>
        </div>
      </div>

      <!-- 快速添加弹窗 -->
      <t-popup v-model="showQuickAdd" placement="bottom" round>
        <div class="bg-white rounded-t-[32px] p-[32px] pb-[48px]">
          <div class="text-[32px] font-bold text-[#333] mb-[24px]">快速添加任务</div>
          <div class="flex flex-col gap-[16px]">
            <t-input
              v-model="quickAddTitle"
              placeholder="输入任务标题..."
              class="!h-[80px] !text-[28px]"
              @enter="submitQuickAdd"
            />
            <div class="flex gap-[12px]">
              <t-dropdown :options="priorityOptions" @change="handleQuickPriorityChange">
                <div class="flex-1">
                  <t-button variant="outline" class="!w-full !h-[64px] !text-[24px]">
                    {{ quickAddPriority ? TASK_PRIORITY_LABELS[quickAddPriority] : '选择优先级' }}
                    <template #suffix><ChevronDownIcon class="text-[20px]" /></template>
                  </t-button>
                </div>
              </t-dropdown>
              <t-button
                theme="primary"
                class="flex-1 !h-[64px] !text-[26px]"
                :disabled="!quickAddTitle.trim()"
                @click="submitQuickAdd"
              >
                添加
              </t-button>
            </div>
          </div>
        </div>
      </t-popup>
    </div>
  </Root>
</template>

<script setup>
import {
  SearchIcon,
  AddIcon,
  ChevronDownIcon,
  CheckIcon,
  TimeIcon,
  ChevronRightIcon
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

// 数据
const tasks = ref([])
const searchKeyword = ref('')
const filterPriority = ref(null)
const filterAssignee = ref(null)

// 快速添加
const showQuickAdd = ref(false)
const quickAddTitle = ref('')
const quickAddPriority = ref(TASK_PRIORITY.MEDIUM)
const quickAddStatus = ref(TASK_STATUS.TODO)

// 优先级选项
const priorityOptions = computed(() => [
  { label: TASK_PRIORITY_LABELS[TASK_PRIORITY.HIGH], value: TASK_PRIORITY.HIGH },
  { label: TASK_PRIORITY_LABELS[TASK_PRIORITY.MEDIUM], value: TASK_PRIORITY.MEDIUM },
  { label: TASK_PRIORITY_LABELS[TASK_PRIORITY.LOW], value: TASK_PRIORITY.LOW }
])

// 状态选项
const statusOptions = computed(() => [
  { label: TASK_STATUS_LABELS[TASK_STATUS.TODO], value: TASK_STATUS.TODO },
  { label: TASK_STATUS_LABELS[TASK_STATUS.IN_PROGRESS], value: TASK_STATUS.IN_PROGRESS },
  { label: TASK_STATUS_LABELS[TASK_STATUS.DONE], value: TASK_STATUS.DONE },
  { label: TASK_STATUS_LABELS[TASK_STATUS.CLOSED], value: TASK_STATUS.CLOSED }
])

// 分配人选项（从任务列表中提取）
const assigneeOptions = computed(() => {
  const assignees = new Map()
  tasks.value.forEach(task => {
    if (task.assignees && task.assignees.length > 0) {
      task.assignees.forEach(assignee => {
        if (assignee) {
          assignees.set(assignee.id, assignee)
        }
      })
    }
  })
  return Array.from(assignees.values()).map(user => ({
    label: user.name,
    value: user.id
  }))
})

// 过滤后的任务列表
const filteredTasks = computed(() => {
  let result = [...tasks.value]

  // 搜索过滤
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.trim().toLowerCase()
    result = result.filter(task =>
      task.title.toLowerCase().includes(keyword) ||
      (task.description && task.description.toLowerCase().includes(keyword))
    )
  }

  // 优先级过滤
  if (filterPriority.value) {
    result = result.filter(task => task.priority === filterPriority.value)
  }

  // 分配人过滤
  if (filterAssignee.value) {
    result = result.filter(task =>
      task.assignees?.some(a => a.id === filterAssignee.value)
    )
  }

  return result
})

// 各状态列表
const todoList = computed(() =>
  filteredTasks.value
    .filter(t => t.status === TASK_STATUS.TODO)
    .sort((a, b) => getPriorityWeight(a.priority) - getPriorityWeight(b.priority))
)

const inProgressList = computed(() =>
  filteredTasks.value
    .filter(t => t.status === TASK_STATUS.IN_PROGRESS)
    .sort((a, b) => getPriorityWeight(a.priority) - getPriorityWeight(b.priority))
)

const doneList = computed(() =>
  filteredTasks.value
    .filter(t => t.status === TASK_STATUS.DONE)
    .sort((a, b) => new Date(b.completedAt || b.updatedAt) - new Date(a.completedAt || a.updatedAt))
)

const closedList = computed(() =>
  filteredTasks.value
    .filter(t => t.status === TASK_STATUS.CLOSED)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
)

// 优先级权重（用于排序，高优先级排前面）
const getPriorityWeight = (priority) => {
  const weights = {
    [TASK_PRIORITY.HIGH]: 1,
    [TASK_PRIORITY.MEDIUM]: 2,
    [TASK_PRIORITY.LOW]: 3
  }
  return weights[priority] || 2
}

// 优先级样式
const getPriorityStyle = (priority) => {
  const styles = {
    [TASK_PRIORITY.HIGH]: 'bg-[#FFEBEE] text-[#E34D59]',
    [TASK_PRIORITY.MEDIUM]: 'bg-[#FFF3E0] text-[#ED7B2F]',
    [TASK_PRIORITY.LOW]: 'bg-[#E8F5E9] text-[#00A870]'
  }
  return styles[priority] || 'bg-[#f5f7fa] text-[#666]'
}

const getAssigneeName = (id) => {
  const option = assigneeOptions.value.find(opt => opt.value === id)
  return option?.label || ''
}

const formatDueDate = (date) => {
  if (!date) return ''
  const today = dayjs().format('YYYY-MM-DD')
  const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD')
  if (date === today) return '今天'
  if (date === tomorrow) return '明天'
  return dayjs(date).format('MM月DD日')
}

const isOverdue = (date) => {
  if (!date) return false
  return dayjs(date).isBefore(dayjs(), 'day')
}

const getSubtaskProgress = (task) => {
  if (!task.subtasks || task.subtasks.length === 0) return null
  const completed = task.subtasks.filter(s => s.completed).length
  return `${completed}/${task.subtasks.length}`
}

const getSubtaskPercent = (task) => {
  if (!task.subtasks || task.subtasks.length === 0) return 0
  return (task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100
}

// 加载任务
const loadTasks = async () => {
  try {
    const res = await getTasks()
    tasks.value = res.data || []
  } catch (error) {
    console.error('加载任务失败:', error)
    showToast('加载任务失败')
  }
}

// 搜索
const handleSearch = () => {
  // 搜索由计算属性自动处理
}

// 筛选变化
const handlePriorityChange = (value) => {
  filterPriority.value = value
}

const handleAssigneeChange = (value) => {
  filterAssignee.value = value
}

const clearFilters = () => {
  filterPriority.value = null
  filterAssignee.value = null
  searchKeyword.value = ''
}

// 跳转详情
const goToDetail = (task) => {
  router.push(`/user/task/${task.id}`)
}

// 状态变更
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

// 快速添加
const handleQuickAdd = (status) => {
  quickAddStatus.value = status
  quickAddTitle.value = ''
  quickAddPriority.value = TASK_PRIORITY.MEDIUM
  showQuickAdd.value = true
}

const handleQuickPriorityChange = (value) => {
  quickAddPriority.value = value
}

const submitQuickAdd = async () => {
  if (!quickAddTitle.value.trim()) return

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
  }
}

// 任务卡片子组件
const TaskCard = defineComponent({
  name: 'TaskCard',
  props: {
    task: { type: Object, required: true },
    completed: { type: Boolean, default: false },
    closed: { type: Boolean, default: false }
  },
  emits: ['status-change'],
  setup(props, { emit }) {
    const getPriorityStyleLocal = (priority) => {
      const styles = {
        [TASK_PRIORITY.HIGH]: 'bg-[#FFEBEE] text-[#E34D59]',
        [TASK_PRIORITY.MEDIUM]: 'bg-[#FFF3E0] text-[#ED7B2F]',
        [TASK_PRIORITY.LOW]: 'bg-[#E8F5E9] text-[#00A870]'
      }
      return styles[priority] || 'bg-[#f5f7fa] text-[#666]'
    }

    const formatDueDateLocal = (date) => {
      if (!date) return ''
      const today = dayjs().format('YYYY-MM-DD')
      const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD')
      if (date === today) return '今天'
      if (date === tomorrow) return '明天'
      return dayjs(date).format('MM月DD日')
    }

    const isOverdueLocal = (date) => {
      if (!date) return false
      return dayjs(date).isBefore(dayjs(), 'day')
    }

    const getSubtaskProgressLocal = (task) => {
      if (!task.subtasks || task.subtasks.length === 0) return null
      const completed = task.subtasks.filter(s => s.completed).length
      return `${completed}/${task.subtasks.length}`
    }

    const getSubtaskPercentLocal = (task) => {
      if (!task.subtasks || task.subtasks.length === 0) return 0
      return (task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100
    }

    const localStatusOptions = [
      { label: TASK_STATUS_LABELS[TASK_STATUS.TODO], value: TASK_STATUS.TODO },
      { label: TASK_STATUS_LABELS[TASK_STATUS.IN_PROGRESS], value: TASK_STATUS.IN_PROGRESS },
      { label: TASK_STATUS_LABELS[TASK_STATUS.DONE], value: TASK_STATUS.DONE },
      { label: TASK_STATUS_LABELS[TASK_STATUS.CLOSED], value: TASK_STATUS.CLOSED }
    ]

    const handleStatusChangeLocal = (value) => {
      emit('status-change', props.task, value)
    }

    return () => (
      <div>
        {/* 标题 */}
        <div class={['text-[28px] text-[#333] mb-[12px] font-medium', (props.completed || props.closed) && 'line-through text-[#999]']}>
          {props.task.title}
        </div>

        {/* 标签区 */}
        <div class="flex items-center gap-[8px] flex-wrap mb-[12px]">
          {/* 优先级标签 */}
          <span class={['text-[20px] px-[8px] py-[2px] rounded-[6px]', getPriorityStyleLocal(props.task.priority)]}>
            {TASK_PRIORITY_LABELS[props.task.priority] || '中'}
          </span>

          {/* 截止日期 */}
          {props.task.dueDate && (
            <span class={['flex items-center gap-[4px] text-[20px]', isOverdueLocal(props.task.dueDate) && !props.completed ? 'text-[#E34D59]' : 'text-[#666]']}>
              <TimeIcon class="text-[18px]" />
              {formatDueDateLocal(props.task.dueDate)}
            </span>
          )}

          {/* 子任务进度 */}
          {getSubtaskProgressLocal(props.task) && (
            <span class="flex items-center gap-[4px] text-[20px] text-[#0052D9]">
              <CheckIcon class="text-[18px]" />
              {getSubtaskProgressLocal(props.task)}
            </span>
          )}
        </div>

        {/* 底部：分配人 + 操作 */}
        <div class="flex items-center justify-between">
          {/* 分配人 */}
          {props.task.assignees && props.task.assignees.length > 0 && (
            <div class="flex items-center gap-[8px]">
              <div class="flex -space-x-2">
                {props.task.assignees.slice(0, 3).map((assignee, idx) => (
                  <t-avatar
                    key={assignee.id || idx}
                    image={assignee.avatar}
                    size="32px"
                    class="border-2 border-white"
                  >
                    {assignee.name?.charAt(0)}
                  </t-avatar>
                ))}
              </div>
              {props.task.assignees.length > 1 && (
                <span class="text-[22px] text-[#666]">
                  {props.task.assignees.length}人
                </span>
              )}
              {props.task.assignees.length === 1 && (
                <span class="text-[22px] text-[#666]">{props.task.assignees[0].name}</span>
              )}
            </div>
          )}

          {/* 状态切换 */}
          {!props.closed && (
            <div class="flex items-center">
              <t-dropdown
                options={localStatusOptions}
                onChange={handleStatusChangeLocal}
              >
                <div class="flex items-center gap-[4px] text-[22px] text-[#0052D9]">
                  切换状态
                  <ChevronRightIcon class="text-[18px]" />
                </div>
              </t-dropdown>
            </div>
          )}
        </div>

        {/* 子任务进度条 */}
        {props.task.subtasks && props.task.subtasks.length > 0 && (
          <div class="mt-[12px]">
            <div class="h-[4px] bg-[#f0f0f0] rounded-[2px] overflow-hidden">
              <div
                class="h-full bg-[#0052D9] rounded-[2px] transition-all"
                style={{ width: getSubtaskPercentLocal(props.task) + '%' }}
              ></div>
            </div>
          </div>
        )}
      </div>
    )
  }
})

onMounted(() => {
  loadTasks()
})
</script>

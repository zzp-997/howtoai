<template>
  <Root title="任务详情" back-url="/user/task/board">
    <div class="min-h-screen bg-[#f5f7fa] pb-[200px]">
      <!-- 加载中 -->
      <div v-if="loading" class="flex items-center justify-center py-[100px]">
        <t-loading text="加载中..." />
      </div>

      <!-- 任务内容 -->
      <div v-else-if="task">
        <!-- 顶部操作栏 -->
        <div class="bg-white px-[32px] py-[16px] flex items-center justify-between sticky top-0 z-10 border-b border-[#eee]">
          <div class="flex items-center gap-[16px]">
            <!-- 编辑按钮 -->
            <div
              class="w-[64px] h-[64px] rounded-full bg-[#f5f7fa] flex items-center justify-center"
              @click="handleEdit"
            >
              <Edit1Icon class="text-[32px] text-[#666]" />
            </div>
            <!-- 删除按钮 -->
            <div
              class="w-[64px] h-[64px] rounded-full bg-[#FFEBEE] flex items-center justify-center"
              @click="handleDelete"
            >
              <DeleteIcon class="text-[32px] text-[#E34D59]" />
            </div>
          </div>
          <!-- 关注按钮 -->
          <div
            :class="['px-[24px] py-[12px] rounded-[24px] flex items-center gap-[8px]', task.isWatched ? 'bg-[#e8f4ff] text-[#0052D9]' : 'bg-[#f5f7fa] text-[#666]']"
            @click="handleToggleWatch"
          >
            <StarFilledIcon v-if="task.isWatched" class="text-[24px]" />
            <StarIcon v-else class="text-[24px]" />
            <span class="text-[24px]">{{ task.isWatched ? '已关注' : '关注' }}</span>
          </div>
        </div>

        <!-- 任务标题 -->
        <div class="bg-white p-[32px] mb-[16px]">
          <div v-if="!isEditingTitle" class="flex items-start gap-[16px]" @click="startEditTitle">
            <div :class="['w-[8px] h-[8px] rounded-full mt-[12px] flex-shrink-0', getStatusDotColor(task.status)]"></div>
            <div class="flex-1">
              <div :class="['text-[32px] font-bold text-[#333] leading-[1.4]', isCompleted && 'line-through text-[#999]']">
                {{ task.title }}
              </div>
            </div>
            <Edit1Icon class="text-[28px] text-[#ccc] flex-shrink-0" />
          </div>
          <div v-else class="flex items-center gap-[12px]">
            <t-input
              v-model="editTitle"
              placeholder="输入任务标题"
              class="flex-1 !text-[32px]"
              :maxlength="100"
              @blur="saveTitle"
              @enter="saveTitle"
            />
            <t-button theme="primary" size="small" @click="saveTitle">保存</t-button>
          </div>
        </div>

        <!-- 状态、优先级、截止日期 -->
        <div class="bg-white px-[32px] py-[24px] mb-[16px]">
          <div class="flex items-center gap-[24px] flex-wrap">
            <!-- 状态选择 -->
            <div class="flex items-center gap-[12px]">
              <span class="text-[24px] text-[#999]">状态</span>
              <t-dropdown :options="statusOptions" @change="handleStatusChange">
                <div :class="['px-[20px] py-[10px] rounded-[12px] text-[24px] flex items-center gap-[8px]', getStatusBgClass(task.status)]">
                  <span :class="getStatusTextClass(task.status)">{{ getStatusLabel(task.status) }}</span>
                  <ChevronDownIcon class="text-[20px]" />
                </div>
              </t-dropdown>
            </div>

            <!-- 优先级选择 -->
            <div class="flex items-center gap-[12px]">
              <span class="text-[24px] text-[#999]">优先级</span>
              <t-dropdown :options="priorityOptions" @change="handlePriorityChange">
                <div :class="['px-[20px] py-[10px] rounded-[12px] text-[24px] flex items-center gap-[8px]', getPriorityBgClass(task.priority)]">
                  <span :class="getPriorityTextClass(task.priority)">{{ getPriorityLabel(task.priority) }}</span>
                  <ChevronDownIcon class="text-[20px]" />
                </div>
              </t-dropdown>
            </div>

            <!-- 截止日期 -->
            <div class="flex items-center gap-[12px]">
              <span class="text-[24px] text-[#999]">截止</span>
              <div
                :class="['px-[20px] py-[10px] rounded-[12px] text-[24px] flex items-center gap-[8px]', task.dueDate && isOverdue(task.dueDate) ? 'bg-[#FFEBEE]' : 'bg-[#f5f7fa]']"
                @click="showDatePicker = true"
              >
                <TimeIcon class="text-[20px] text-[#666]" />
                <span :class="task.dueDate && isOverdue(task.dueDate) ? 'text-[#E34D59]' : 'text-[#666]'">
                  {{ task.dueDate ? formatDueDate(task.dueDate) : '设置日期' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 描述内容 -->
        <div class="bg-white p-[32px] mb-[16px]">
          <div class="flex items-center justify-between mb-[16px]">
            <span class="text-[28px] font-semibold text-[#333]">描述</span>
            <Edit1Icon class="text-[28px] text-[#ccc]" @click="startEditDesc" />
          </div>
          <div v-if="!isEditingDesc" @click="startEditDesc">
            <div v-if="task.description" class="text-[26px] text-[#666] leading-[1.6] whitespace-pre-wrap">
              {{ task.description }}
            </div>
            <div v-else class="text-[26px] text-[#999]">点击添加描述...</div>
          </div>
          <div v-else>
            <t-textarea
              v-model="editDesc"
              placeholder="添加任务描述..."
              :maxlength="500"
              :autosize="{ minRows: 3, maxRows: 6 }"
            />
            <div class="flex justify-end gap-[12px] mt-[16px]">
              <t-button variant="outline" @click="isEditingDesc = false">取消</t-button>
              <t-button theme="primary" @click="saveDesc">保存</t-button>
            </div>
          </div>
        </div>

        <!-- 分配人员 -->
        <div class="bg-white p-[32px] mb-[16px]">
          <div class="flex items-center justify-between mb-[16px]">
            <span class="text-[28px] font-semibold text-[#333]">分配人员</span>
            <UserAddIcon class="text-[28px] text-[#0052D9]" @click="showAssigneePicker = true" />
          </div>
          <div v-if="task.assignees && task.assignees.length > 0" class="flex flex-wrap gap-[12px]">
            <div
              v-for="assignee in task.assignees"
              :key="assignee.id"
              class="flex items-center gap-[8px] bg-[#f5f7fa] px-[16px] py-[10px] rounded-[24px]"
            >
              <t-avatar :image="assignee.avatar" size="40px">
                {{ assignee.name?.charAt(0) }}
              </t-avatar>
              <span class="text-[24px] text-[#333]">{{ assignee.name }}</span>
              <CloseCircleFilledIcon class="text-[24px] text-[#999]" @click.stop="removeAssignee(assignee.id)" />
            </div>
          </div>
          <div v-else class="text-[26px] text-[#999]" @click="showAssigneePicker = true">
            点击添加分配人员...
          </div>
        </div>

        <!-- 关注者 -->
        <div class="bg-white p-[32px] mb-[16px]">
          <div class="flex items-center justify-between mb-[16px]">
            <span class="text-[28px] font-semibold text-[#333]">关注者</span>
            <UserAddIcon class="text-[28px] text-[#0052D9]" @click="showWatcherPicker = true" />
          </div>
          <div v-if="task.watchers && task.watchers.length > 0" class="flex flex-wrap gap-[12px]">
            <div
              v-for="watcher in task.watchers"
              :key="watcher.id"
              class="flex items-center gap-[8px] bg-[#f5f7fa] px-[16px] py-[10px] rounded-[24px]"
            >
              <t-avatar :image="watcher.avatar" size="40px">
                {{ watcher.name?.charAt(0) }}
              </t-avatar>
              <span class="text-[24px] text-[#333]">{{ watcher.name }}</span>
            </div>
          </div>
          <div v-else class="text-[26px] text-[#999]">
            暂无关注者
          </div>
        </div>

        <!-- 子任务区域 -->
        <div class="bg-white p-[32px] mb-[16px]">
          <div class="flex items-center justify-between mb-[16px]">
            <div class="flex items-center gap-[8px]">
              <span class="text-[28px] font-semibold text-[#333]">子任务</span>
              <span v-if="subtasks.length > 0" class="text-[24px] text-[#0052D9]">
                ({{ completedSubtaskCount }}/{{ subtasks.length }})
              </span>
            </div>
            <AddIcon class="text-[28px] text-[#0052D9]" @click="showAddSubtask = true" />
          </div>

          <!-- 子任务进度条 -->
          <div v-if="subtasks.length > 0" class="mb-[16px]">
            <div class="h-[8px] bg-[#f0f0f0] rounded-[4px] overflow-hidden">
              <div
                class="h-full bg-gradient-to-r from-[#0052D9] to-[#266FE8] rounded-[4px] transition-all"
                :style="{ width: subtaskProgress + '%' }"
              ></div>
            </div>
          </div>

          <!-- 子任务列表 -->
          <div class="flex flex-col gap-[12px]">
            <div
              v-for="subtask in subtasks"
              :key="subtask.id"
              class="flex items-center gap-[12px] p-[16px] bg-[#f5f7fa] rounded-[16px]"
            >
              <t-checkbox
                :checked="subtask.completed"
                @change="handleSubtaskToggle(subtask)"
              />
              <div class="flex-1 min-w-0">
                <div :class="['text-[26px] text-[#333]', subtask.completed && 'line-through text-[#999]']">
                  {{ subtask.title }}
                </div>
                <div v-if="subtask.assignee" class="flex items-center gap-[6px] mt-[6px]">
                  <t-avatar :image="subtask.assignee.avatar" size="24px" />
                  <span class="text-[20px] text-[#999]">{{ subtask.assignee.name }}</span>
                </div>
              </div>
              <DeleteIcon class="text-[28px] text-[#ccc]" @click="handleDeleteSubtask(subtask)" />
            </div>
          </div>

          <div v-if="subtasks.length === 0" class="text-center py-[30px] text-[26px] text-[#999]">
            暂无子任务，点击右上角添加
          </div>
        </div>

        <!-- 评论区 -->
        <div class="bg-white p-[32px] mb-[16px]">
          <div class="flex items-center justify-between mb-[16px]">
            <span class="text-[28px] font-semibold text-[#333]">评论</span>
            <span class="text-[24px] text-[#999]">{{ comments.length }} 条</span>
          </div>

          <!-- 评论列表 -->
          <div class="flex flex-col gap-[20px] mb-[20px]">
            <div
              v-for="comment in comments"
              :key="comment.id"
              class="flex gap-[12px]"
            >
              <t-avatar :image="comment.user?.avatar" size="48px">
                {{ comment.user?.name?.charAt(0) }}
              </t-avatar>
              <div class="flex-1">
                <div class="flex items-center gap-[8px] mb-[6px]">
                  <span class="text-[24px] font-medium text-[#333]">{{ comment.user?.name }}</span>
                  <span class="text-[20px] text-[#999]">{{ formatTime(comment.createdAt) }}</span>
                </div>
                <div class="text-[26px] text-[#666] leading-[1.5]">
                  {{ comment.content }}
                </div>
              </div>
              <DeleteIcon
                v-if="comment.userId === currentUserId"
                class="text-[24px] text-[#ccc]"
                @click="handleDeleteComment(comment)"
              />
            </div>
          </div>

          <div v-if="comments.length === 0" class="text-center py-[30px] text-[26px] text-[#999]">
            暂无评论
          </div>

          <!-- 评论输入 -->
          <div class="flex gap-[12px] mt-[16px]">
            <t-input
              v-model="newComment"
              placeholder="写下你的评论..."
              class="flex-1"
              :maxlength="500"
            />
            <t-button
              theme="primary"
              :disabled="!newComment.trim()"
              @click="handleAddComment"
            >
              发送
            </t-button>
          </div>
        </div>

        <!-- 任务动态 -->
        <div class="bg-white p-[32px]">
          <div class="flex items-center justify-between mb-[16px]">
            <span class="text-[28px] font-semibold text-[#333]">任务动态</span>
          </div>

          <div v-if="activities.length > 0" class="relative pl-[32px]">
            <!-- 时间线 -->
            <div class="absolute left-[11px] top-[8px] bottom-[8px] w-[2px] bg-[#e0e0e0]"></div>

            <div class="flex flex-col gap-[24px]">
              <div
                v-for="activity in activities"
                :key="activity.id"
                class="relative flex gap-[16px]"
              >
                <div class="absolute -left-[32px] w-[24px] h-[24px] rounded-full bg-[#0052D9] flex items-center justify-center">
                  <div class="w-[8px] h-[8px] rounded-full bg-white"></div>
                </div>
                <div class="flex-1 pb-[8px]">
                  <div class="flex items-center gap-[8px] mb-[6px]">
                    <t-avatar :image="activity.user?.avatar" size="32px">
                      {{ activity.user?.name?.charAt(0) }}
                    </t-avatar>
                    <span class="text-[24px] font-medium text-[#333]">{{ activity.user?.name }}</span>
                    <span class="text-[22px] text-[#666]">{{ getActivityText(activity) }}</span>
                  </div>
                  <div class="text-[20px] text-[#999]">{{ formatTime(activity.createdAt) }}</div>
                  <div v-if="activity.detail" class="mt-[6px] text-[24px] text-[#666] bg-[#f5f7fa] p-[12px] rounded-[8px]">
                    {{ activity.detail }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-[30px] text-[26px] text-[#999]">
            暂无动态
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="flex flex-col items-center justify-center py-[100px]">
        <div class="text-[32px] text-[#999]">任务不存在</div>
        <t-button theme="primary" class="mt-[24px]" @click="router.back()">返回</t-button>
      </div>

      <!-- 日期选择弹窗 -->
      <t-popup v-model="showDatePicker" placement="bottom" round>
        <t-date-time-picker
          mode="date"
          format="YYYY-MM-DD"
          title="选择截止日期"
          @confirm="handleDateConfirm"
          @cancel="showDatePicker = false"
        />
      </t-popup>

      <!-- 添加子任务弹窗 -->
      <t-popup v-model="showAddSubtask" placement="bottom" round>
        <div class="bg-white rounded-t-[32px] p-[32px] pb-[48px]">
          <div class="text-[32px] font-bold text-[#333] mb-[24px]">添加子任务</div>
          <div class="flex flex-col gap-[16px]">
            <t-input
              v-model="newSubtaskTitle"
              placeholder="输入子任务标题..."
              class="!h-[80px] !text-[28px]"
            />
            <div class="flex gap-[12px]">
              <t-button
                variant="outline"
                class="flex-1 !h-[64px] !text-[26px]"
                @click="showAddSubtask = false"
              >
                取消
              </t-button>
              <t-button
                theme="primary"
                class="flex-1 !h-[64px] !text-[26px]"
                :disabled="!newSubtaskTitle.trim()"
                @click="handleAddSubtask"
              >
                添加
              </t-button>
            </div>
          </div>
        </div>
      </t-popup>

      <!-- 分配人员选择弹窗 -->
      <t-popup v-model="showAssigneePicker" placement="bottom" round>
        <div class="bg-white rounded-t-[32px] p-[32px] pb-[48px] max-h-[60vh] overflow-y-auto">
          <div class="text-[32px] font-bold text-[#333] mb-[24px]">选择分配人员</div>
          <div class="flex flex-col gap-[12px]">
            <div
              v-for="user in availableUsers"
              :key="user.id"
              :class="['flex items-center gap-[12px] p-[16px] rounded-[16px]', isAssigneeSelected(user.id) ? 'bg-[#e8f4ff]' : 'bg-[#f5f7fa]']"
              @click="toggleAssignee(user.id)"
            >
              <t-avatar :image="user.avatar" size="48px">
                {{ user.name?.charAt(0) }}
              </t-avatar>
              <div class="flex-1">
                <div class="text-[26px] text-[#333]">{{ user.name }}</div>
                <div class="text-[22px] text-[#999]">{{ user.department }}</div>
              </div>
              <CheckIcon v-if="isAssigneeSelected(user.id)" class="text-[32px] text-[#0052D9]" />
            </div>
          </div>
          <t-button
            theme="primary"
            block
            class="mt-[24px] !h-[72px] !text-[28px]"
            @click="confirmAssignees"
          >
            确认
          </t-button>
        </div>
      </t-popup>
    </div>
  </Root>
</template>

<script setup>
import {
  Edit1Icon,
  DeleteIcon,
  StarIcon,
  StarFilledIcon,
  ChevronDownIcon,
  TimeIcon,
  UserAddIcon,
  AddIcon,
  CheckIcon,
  CloseCircleFilledIcon
} from 'tdesign-icons-vue-next'
import {
  getTask,
  updateTask,
  deleteTask,
  getSubtasks,
  createSubtask,
  toggleSubtask,
  deleteSubtask,
  getTaskComments,
  createTaskComment,
  deleteTaskComment,
  getTaskActivities,
  setTaskWatch,
  TASK_STATUS,
  TASK_PRIORITY,
  TASK_STATUS_LABELS,
  TASK_PRIORITY_LABELS,
  TASK_STATUS_CONFIG,
  TASK_PRIORITY_CONFIG,
  TASK_ACTIVITY_TYPE_LABELS
} from '@/api/task'
import { useUserStore } from '@/store'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showConfirmDialog, showErrorDialog } from '@/utils/common/tools'
import dayjs from 'dayjs'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 状态
const loading = ref(true)
const task = ref(null)
const subtasks = ref([])
const comments = ref([])
const activities = ref([])

// 编辑状态
const isEditingTitle = ref(false)
const editTitle = ref('')
const isEditingDesc = ref(false)
const editDesc = ref('')

// 弹窗状态
const showDatePicker = ref(false)
const showAddSubtask = ref(false)
const showAssigneePicker = ref(false)
const showWatcherPicker = ref(false)

// 新增数据
const newComment = ref('')
const newSubtaskTitle = ref('')
const selectedAssignees = ref([])

// 模拟用户列表（实际应从 API 获取）
const availableUsers = ref([
  { id: 1, name: '管理员', avatar: 'https://tdesign.gtimg.com/site/avatar.jpg', department: '技术部' },
  { id: 2, name: '普通用户', avatar: 'https://tdesign.gtimg.com/site/avatar.jpg', department: '产品部' },
  { id: 3, name: '张三', avatar: 'https://tdesign.gtimg.com/site/avatar.jpg', department: '设计部' },
  { id: 4, name: '李四', avatar: 'https://tdesign.gtimg.com/site/avatar.jpg', department: '运营部' }
])

// 当前用户 ID
const currentUserId = computed(() => userStore.userInfo?.id)

// 计算属性
const isCompleted = computed(() => task.value?.status === TASK_STATUS.DONE || task.value?.status === TASK_STATUS.CLOSED)

const completedSubtaskCount = computed(() => subtasks.value.filter(s => s.completed).length)

const subtaskProgress = computed(() => {
  if (subtasks.value.length === 0) return 0
  return (completedSubtaskCount.value / subtasks.value.length) * 100
})

// 状态选项
const statusOptions = [
  { label: '待处理', value: TASK_STATUS.TODO },
  { label: '进行中', value: TASK_STATUS.IN_PROGRESS },
  { label: '已完成', value: TASK_STATUS.DONE },
  { label: '已关闭', value: TASK_STATUS.CLOSED }
]

// 优先级选项
const priorityOptions = [
  { label: '高', value: TASK_PRIORITY.HIGH },
  { label: '中', value: TASK_PRIORITY.MEDIUM },
  { label: '低', value: TASK_PRIORITY.LOW }
]

// 方法：获取状态样式
const getStatusLabel = (status) => TASK_STATUS_LABELS[status] || '未知'
const getStatusDotColor = (status) => {
  const config = TASK_STATUS_CONFIG[status]
  return config ? `bg-[${config.color}]` : 'bg-[#999]'
}
const getStatusBgClass = (status) => TASK_STATUS_CONFIG[status]?.bgClass || 'bg-[#f5f7fa]'
const getStatusTextClass = (status) => TASK_STATUS_CONFIG[status]?.textClass || 'text-[#666]'

// 方法：获取优先级样式
const getPriorityLabel = (priority) => TASK_PRIORITY_LABELS[priority] || '中'
const getPriorityBgClass = (priority) => TASK_PRIORITY_CONFIG[priority]?.bgClass || 'bg-[#f5f7fa]'
const getPriorityTextClass = (priority) => TASK_PRIORITY_CONFIG[priority]?.textClass || 'text-[#666]'

// 方法：日期格式化
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

const formatTime = (date) => {
  if (!date) return ''
  const d = dayjs(date)
  const now = dayjs()
  const diff = now.diff(d, 'minute')

  if (diff < 1) return '刚刚'
  if (diff < 60) return `${diff}分钟前`
  if (diff < 1440) return `${Math.floor(diff / 60)}小时前`
  if (diff < 10080) return `${Math.floor(diff / 1440)}天前`
  return d.format('MM月DD日 HH:mm')
}

// 方法：获取动态文本
const getActivityText = (activity) => {
  const typeLabel = TASK_ACTIVITY_TYPE_LABELS[activity.type] || '操作了任务'
  if (activity.type === 'status_change' && activity.detail) {
    return `${typeLabel} 为 "${TASK_STATUS_LABELS[activity.detail] || activity.detail}"`
  }
  if (activity.type === 'subtask' && activity.detail) {
    return activity.detail
  }
  return typeLabel
}

// 方法：分配人选择
const isAssigneeSelected = (userId) => {
  return selectedAssignees.value.includes(userId) ||
    task.value?.assignees?.some(a => a.id === userId)
}

const toggleAssignee = (userId) => {
  const index = selectedAssignees.value.indexOf(userId)
  if (index > -1) {
    selectedAssignees.value.splice(index, 1)
  } else {
    selectedAssignees.value.push(userId)
  }
}

const confirmAssignees = async () => {
  // 更新分配人员
  try {
    await updateTask(task.value.id, {
      assigneeIds: selectedAssignees.value
    })
    showToast('分配人员已更新')
    showAssigneePicker.value = false
    loadTaskDetail()
  } catch (error) {
    showErrorDialog('更新失败')
  }
}

const removeAssignee = async (userId) => {
  try {
    const newAssignees = task.value.assignees
      .filter(a => a.id !== userId)
      .map(a => a.id)
    await updateTask(task.value.id, { assigneeIds: newAssignees })
    showToast('已移除')
    loadTaskDetail()
  } catch (error) {
    showErrorDialog('移除失败')
  }
}

// 加载任务详情
const loadTaskDetail = async () => {
  const taskId = Number(route.params.id)
  if (!taskId) {
    loading.value = false
    return
  }

  try {
    loading.value = true
    const res = await getTask(taskId)
    task.value = res.data
  } catch (error) {
    console.error('加载任务失败:', error)
    task.value = null
  } finally {
    loading.value = false
  }
}

// 加载子任务
const loadSubtasks = async () => {
  const taskId = Number(route.params.id)
  if (!taskId) return

  try {
    const res = await getSubtasks(taskId)
    subtasks.value = res.data || []
  } catch (error) {
    console.error('加载子任务失败:', error)
    subtasks.value = []
  }
}

// 加载评论
const loadComments = async () => {
  const taskId = Number(route.params.id)
  if (!taskId) return

  try {
    const res = await getTaskComments(taskId)
    comments.value = res.data || []
  } catch (error) {
    console.error('加载评论失败:', error)
    comments.value = []
  }
}

// 加载动态
const loadActivities = async () => {
  const taskId = Number(route.params.id)
  if (!taskId) return

  try {
    const res = await getTaskActivities(taskId)
    activities.value = res.data || []
  } catch (error) {
    console.error('加载动态失败:', error)
    activities.value = []
  }
}

// 编辑标题
const startEditTitle = () => {
  editTitle.value = task.value.title
  isEditingTitle.value = true
}

const saveTitle = async () => {
  if (!editTitle.value.trim()) {
    showToast('标题不能为空')
    return
  }

  try {
    await updateTask(task.value.id, { title: editTitle.value.trim() })
    task.value.title = editTitle.value.trim()
    isEditingTitle.value = false
    showToast('标题已更新')
  } catch (error) {
    showErrorDialog('更新失败')
  }
}

// 编辑描述
const startEditDesc = () => {
  editDesc.value = task.value.description || ''
  isEditingDesc.value = true
}

const saveDesc = async () => {
  try {
    await updateTask(task.value.id, { description: editDesc.value.trim() || null })
    task.value.description = editDesc.value.trim() || null
    isEditingDesc.value = false
    showToast('描述已更新')
  } catch (error) {
    showErrorDialog('更新失败')
  }
}

// 状态变更
const handleStatusChange = async (status) => {
  try {
    await updateTask(task.value.id, { status })
    task.value.status = status
    showToast('状态已更新')
    loadActivities()
  } catch (error) {
    showErrorDialog('更新失败')
  }
}

// 优先级变更
const handlePriorityChange = async (priority) => {
  try {
    await updateTask(task.value.id, { priority })
    task.value.priority = priority
    showToast('优先级已更新')
    loadActivities()
  } catch (error) {
    showErrorDialog('更新失败')
  }
}

// 日期确认
const handleDateConfirm = async (value) => {
  try {
    await updateTask(task.value.id, { dueDate: value })
    task.value.dueDate = value
    showDatePicker.value = false
    showToast('截止日期已更新')
    loadActivities()
  } catch (error) {
    showErrorDialog('更新失败')
  }
}

// 关注切换
const handleToggleWatch = async () => {
  try {
    await setTaskWatch(task.value.id, !task.value.isWatched)
    task.value.isWatched = !task.value.isWatched
    showToast(task.value.isWatched ? '已关注' : '已取消关注')
  } catch (error) {
    showErrorDialog('操作失败')
  }
}

// 删除任务
const handleDelete = async () => {
  try {
    await showConfirmDialog({ content: `确定删除任务「${task.value.title}」吗？删除后无法恢复。` })
    await deleteTask(task.value.id)
    showToast('任务已删除')
    router.back()
  } catch (e) {
    // 用户取消操作
  }
}

// 编辑任务
const handleEdit = () => {
  router.push(`/user/task/${task.value.id}/edit`)
}

// 子任务操作
const handleSubtaskToggle = async (subtask) => {
  try {
    await toggleSubtask(task.value.id, subtask.id)
    subtask.completed = !subtask.completed
    loadActivities()
  } catch (error) {
    showErrorDialog('操作失败')
  }
}

const handleAddSubtask = async () => {
  if (!newSubtaskTitle.value.trim()) return

  try {
    await createSubtask(task.value.id, { title: newSubtaskTitle.value.trim() })
    showToast('子任务已添加')
    showAddSubtask.value = false
    newSubtaskTitle.value = ''
    loadSubtasks()
    loadActivities()
  } catch (error) {
    showErrorDialog('添加失败')
  }
}

const handleDeleteSubtask = async (subtask) => {
  try {
    await showConfirmDialog({ content: `确定删除子任务「${subtask.title}」吗？` })
    await deleteSubtask(task.value.id, subtask.id)
    showToast('已删除')
    loadSubtasks()
    loadActivities()
  } catch (e) {
    // 用户取消操作
  }
}

// 评论操作
const handleAddComment = async () => {
  if (!newComment.value.trim()) return

  try {
    await createTaskComment(task.value.id, { content: newComment.value.trim() })
    showToast('评论已发送')
    newComment.value = ''
    loadComments()
    loadActivities()
  } catch (error) {
    showErrorDialog('发送失败')
  }
}

const handleDeleteComment = async (comment) => {
  try {
    await showConfirmDialog({ content: '确定删除这条评论吗？' })
    await deleteTaskComment(task.value.id, comment.id)
    showToast('已删除')
    loadComments()
  } catch (e) {
    // 用户取消操作
  }
}

// 页面加载
onMounted(() => {
  loadTaskDetail()
  loadSubtasks()
  loadComments()
  loadActivities()
})
</script>

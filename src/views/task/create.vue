<template>
  <Root title="新建任务" back-url="/user/task/board">
    <div class="min-h-screen bg-[#f5f7fa] pb-[150px]">
      <!-- 表单区域 -->
      <div class="p-[32px]">
        <div class="bg-white rounded-[24px] p-[32px] shadow-sm">
          <!-- 标题 -->
          <div class="mb-[24px]">
            <div class="text-[26px] text-[#333] mb-[12px]">任务标题 <span class="text-[#E34D59]">*</span></div>
            <t-input
              v-model="form.title"
              placeholder="请输入任务标题"
              class="!h-[80px] !text-[28px]"
              :maxlength="100"
            />
          </div>

          <!-- 描述 -->
          <div class="mb-[24px]">
            <div class="text-[26px] text-[#333] mb-[12px]">任务描述</div>
            <t-textarea
              v-model="form.description"
              placeholder="请输入任务描述..."
              class="!text-[28px]"
              :maxlength="500"
              :autosize="{ minRows: 4, maxRows: 8 }"
            />
          </div>

          <!-- 优先级 -->
          <div class="mb-[24px]">
            <div class="text-[26px] text-[#333] mb-[12px]">优先级</div>
            <div class="flex gap-[12px]">
              <div
                v-for="item in priorityOptions"
                :key="item.value"
                :class="[
                  'flex-1 py-[16px] text-center text-[24px] rounded-[12px] cursor-pointer transition-all',
                  form.priority === item.value
                    ? 'bg-[#0052D9] text-white'
                    : 'bg-[#f5f7fa] text-[#666] active:bg-[#e5e5e5]'
                ]"
                @click="form.priority = item.value"
              >
                {{ item.label }}
              </div>
            </div>
          </div>

          <!-- 截止日期 -->
          <div class="mb-[24px]">
            <div class="text-[26px] text-[#333] mb-[12px]">截止日期</div>
            <div
              class="flex items-center justify-between p-[20px] bg-[#f5f7fa] rounded-[12px] cursor-pointer"
              @click="showDatePicker = true"
            >
              <div class="flex items-center gap-[12px]">
                <CalendarIcon class="text-[28px] text-[#0052D9]" />
                <span class="text-[28px] text-[#333]">
                  {{ form.dueDate ? formatDate(form.dueDate) : '选择截止日期' }}
                </span>
              </div>
              <ChevronRightIcon class="text-[28px] text-[#999]" />
            </div>
          </div>

          <!-- 分配人员 -->
          <div class="mb-[24px]">
            <div class="text-[26px] text-[#333] mb-[12px]">分配人员</div>
            <div
              class="flex items-center justify-between p-[20px] bg-[#f5f7fa] rounded-[12px] cursor-pointer"
              @click="showAssigneePicker = true"
            >
              <div class="flex items-center gap-[12px]">
                <UserIcon class="text-[28px] text-[#0052D9]" />
                <span class="text-[28px] text-[#333]">
                  {{ selectedAssigneeNames || '选择分配人员' }}
                </span>
              </div>
              <ChevronRightIcon class="text-[28px] text-[#999]" />
            </div>
          </div>

          <!-- 子任务 -->
          <div class="mb-[24px]">
            <div class="flex items-center justify-between mb-[12px]">
              <div class="text-[26px] text-[#333]">子任务</div>
              <t-button
                variant="outline"
                size="small"
                class="!h-[48px] !text-[22px]"
                @click="addSubtask"
              >
                <template #icon><AddIcon /></template>
                添加子任务
              </t-button>
            </div>
            <div v-if="form.subtasks.length > 0" class="flex flex-col gap-[12px]">
              <div
                v-for="(subtask, index) in form.subtasks"
                :key="index"
                class="flex items-center gap-[12px] p-[16px] bg-[#f5f7fa] rounded-[12px]"
              >
                <t-input
                  v-model="subtask.title"
                  placeholder="子任务标题"
                  class="flex-1 !text-[26px]"
                  :maxlength="100"
                />
                <div
                  class="w-[48px] h-[48px] flex items-center justify-center text-[#E34D59]"
                  @click="removeSubtask(index)"
                >
                  <DeleteIcon class="text-[28px]" />
                </div>
              </div>
            </div>
            <div v-else class="text-center py-[32px] text-[24px] text-[#999]">
              暂无子任务
            </div>
          </div>
        </div>

        <!-- 提交按钮 -->
        <div class="mt-[32px]">
          <t-button
            theme="primary"
            block
            class="!h-[88px] !text-[32px] !rounded-[16px]"
            :disabled="!form.title.trim()"
            :loading="submitting"
            @click="handleSubmit"
          >
            创建任务
          </t-button>
        </div>
      </div>

      <!-- 日期选择器 -->
      <t-calendar
        v-model:visible="showDatePicker"
        v-model="selectedDate"
        :min-date="minDate"
        type="single"
        title="选择截止日期"
        @confirm="handleDateConfirm"
      />

      <!-- 人员选择弹窗 -->
      <t-popup v-model="showAssigneePicker" placement="bottom" round>
        <div class="bg-white rounded-t-[32px] p-[32px] pb-[48px] max-h-[60vh] overflow-y-auto">
          <div class="flex items-center justify-between mb-[24px]">
            <div class="text-[32px] font-bold text-[#333]">选择分配人员</div>
            <div
              class="w-[40px] h-[40px] bg-[#f5f5f5] rounded-full flex items-center justify-center"
              @click="showAssigneePicker = false"
            >
              <CloseIcon class="text-[24px] text-[#999]" />
            </div>
          </div>

          <!-- 已选人员 -->
          <div v-if="form.assignees.length > 0" class="flex flex-wrap gap-[12px] mb-[24px]">
            <div
              v-for="userId in form.assignees"
              :key="userId"
              class="flex items-center gap-[8px] px-[16px] py-[8px] bg-[#e8f4ff] rounded-[24px]"
            >
              <t-avatar
                :image="getUserById(userId)?.avatar"
                size="32px"
              >
                {{ getUserById(userId)?.name?.charAt(0) }}
              </t-avatar>
              <span class="text-[24px] text-[#0052D9]">{{ getUserById(userId)?.name }}</span>
              <CloseIcon
                class="text-[20px] text-[#999] cursor-pointer"
                @click="toggleAssignee(userId)"
              />
            </div>
          </div>

          <!-- 人员列表 -->
          <div class="flex flex-col gap-[12px]">
            <div
              v-for="user in userList"
              :key="user.id"
              :class="[
                'flex items-center justify-between p-[20px] rounded-[16px] cursor-pointer transition-all',
                form.assignees.includes(user.id) ? 'bg-[#e8f4ff]' : 'bg-[#f5f7fa] active:bg-[#e5e5e5]'
              ]"
              @click="toggleAssignee(user.id)"
            >
              <div class="flex items-center gap-[12px]">
                <t-avatar :image="user.avatar" size="48px">
                  {{ user.name?.charAt(0) }}
                </t-avatar>
                <div>
                  <div class="text-[28px] text-[#333]">{{ user.name }}</div>
                  <div class="text-[22px] text-[#999]">{{ user.department }}</div>
                </div>
              </div>
              <CheckIcon v-if="form.assignees.includes(user.id)" class="text-[32px] text-[#0052D9]" />
            </div>
          </div>
        </div>
      </t-popup>
    </div>
  </Root>
</template>

<script setup>
import {
  AddIcon,
  DeleteIcon,
  ChevronRightIcon,
  CalendarIcon,
  UserIcon,
  CheckIcon,
  CloseIcon
} from 'tdesign-icons-vue-next'
import { createTask, TASK_PRIORITY, TASK_PRIORITY_LABELS } from '@/api/task'
import { getUsers } from '@/api'
import { useUserStore } from '@/store'
import { useRouter } from 'vue-router'
import { showToast } from '@/utils/common/tools'
import dayjs from 'dayjs'

const router = useRouter()
const userStore = useUserStore()

// 表单数据
const form = ref({
  title: '',
  description: '',
  priority: TASK_PRIORITY.MEDIUM,
  dueDate: '',
  assignees: [],
  subtasks: []
})

const submitting = ref(false)
const userList = ref([])

// 日期选择
const showDatePicker = ref(false)
const selectedDate = ref(new Date())
const minDate = new Date()

// 分配人员选择
const showAssigneePicker = ref(false)

// 优先级选项
const priorityOptions = computed(() => [
  { label: TASK_PRIORITY_LABELS[TASK_PRIORITY.HIGH], value: TASK_PRIORITY.HIGH },
  { label: TASK_PRIORITY_LABELS[TASK_PRIORITY.MEDIUM], value: TASK_PRIORITY.MEDIUM },
  { label: TASK_PRIORITY_LABELS[TASK_PRIORITY.LOW], value: TASK_PRIORITY.LOW }
])

// 已选人员名称
const selectedAssigneeNames = computed(() => {
  return form.value.assignees
    .map(id => getUserById(id)?.name)
    .filter(Boolean)
    .join('、')
})

// 获取用户信息
const getUserById = (id) => {
  return userList.value.find(u => u.id === id)
}

// 格式化日期
const formatDate = (date) => {
  return dayjs(date).format('YYYY年MM月DD日')
}

// 日期确认
const handleDateConfirm = (value) => {
  if (value) {
    form.value.dueDate = dayjs(value).format('YYYY-MM-DD')
  }
  showDatePicker.value = false
}

// 切换分配人员
const toggleAssignee = (userId) => {
  const index = form.value.assignees.indexOf(userId)
  if (index > -1) {
    form.value.assignees.splice(index, 1)
  } else {
    form.value.assignees.push(userId)
  }
}

// 添加子任务
const addSubtask = () => {
  form.value.subtasks.push({
    title: '',
    completed: false
  })
}

// 删除子任务
const removeSubtask = (index) => {
  form.value.subtasks.splice(index, 1)
}

// 加载用户列表
const loadUsers = async () => {
  try {
    const res = await getUsers()
    userList.value = res.data || []
  } catch (error) {
    console.error('加载用户列表失败:', error)
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!form.value.title.trim()) {
    showToast('请输入任务标题')
    return
  }

  submitting.value = true
  try {
    await createTask({
      title: form.value.title.trim(),
      description: form.value.description.trim(),
      priority: form.value.priority,
      dueDate: form.value.dueDate || undefined,
      assignees: form.value.assignees,
      subtasks: form.value.subtasks.filter(s => s.title.trim())
    })
    showToast('创建成功')
    router.push('/user/task/board')
  } catch (error) {
    console.error('创建任务失败:', error)
    showToast('创建任务失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadUsers()
})
</script>

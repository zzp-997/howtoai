<template>
  <Root :title="false" :show-back="false">
    <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 relative overflow-hidden pb-safe">
      <!-- 背景装饰 -->
      <div class="absolute -top-[300px] -right-[200px] w-[600px] h-[600px] bg-gradient-to-br from-[#0052D9]/20 to-[#266FE8]/20 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-[200px] -left-[150px] w-[400px] h-[400px] bg-gradient-to-br from-[#00A870]/15 to-[#2BA471]/15 rounded-full blur-3xl"></div>

      <!-- 顶部欢迎区域 -->
      <div class="relative px-[32px] pt-[60px] mb-[32px]">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-[20px]">
            <div class="relative">
              <div class="w-[100px] h-[100px] bg-gradient-to-br from-[#0052D9] to-[#266FE8] rounded-[28px] flex items-center justify-center text-[44px] font-bold text-white shadow-lg shadow-[#0052D9]/30">
                {{ userStore.name?.charAt(0) || 'U' }}
              </div>
              <div class="absolute -bottom-[4px] -right-[4px] w-[32px] h-[32px] bg-[#00A870] rounded-full flex items-center justify-center">
                <CheckCircleIcon class="text-[18px] text-white" />
              </div>
            </div>
            <div>
              <div class="text-[36px] font-bold text-[#1a1a1a] tracking-tight">{{ getGreeting() }}</div>
              <div class="text-[26px] text-[#666] mt-[4px]">{{ userStore.name }} · {{ userStore.isAdmin ? '管理员' : '员工' }}</div>
            </div>
          </div>
          <!-- 设置和退出按钮 -->
          <div class="flex flex-col gap-[12px]">
            <div class="w-[56px] h-[56px] bg-[var(--bg-primary)] rounded-[16px] flex items-center justify-center shadow-sm" @click="router.push('/user/settings')">
              <SettingIcon class="text-[28px] text-[var(--text-secondary)]" />
            </div>
            <div class="w-[56px] h-[56px] bg-[var(--bg-primary)] rounded-[16px] flex items-center justify-center shadow-sm" @click="handleLogout">
              <PoweroffIcon class="text-[28px] text-[var(--text-secondary)]" />
            </div>
          </div>
        </div>

        <!-- 日期信息 -->
        <div class="mt-[24px] flex items-center gap-[12px] text-[24px] text-[#888]">
          <CalendarIcon class="text-[24px]" />
          <span>{{ todayDate }}</span>
          <span class="text-[#0052D9] font-medium">{{ todayWeek }}</span>
        </div>
      </div>

      <!-- 企业公告滚动（用户端） -->
      <div v-if="!userStore.isAdmin && announcements.length > 0" class="px-[32px] mb-[24px]">
        <div class="bg-white rounded-[20px] p-[20px] shadow-sm flex items-center gap-[16px]">
          <div class="flex-shrink-0 px-[12px] py-[6px] bg-gradient-to-br from-[#FF7D7D] to-[#FFA8A8] rounded-[8px]">
            <NotificationIcon class="text-[24px] text-white" />
          </div>
          <div class="flex-1 h-[36px] overflow-hidden relative">
            <div :class="{ 'announcement-scroll': announcements.length > 1 }">
              <div v-for="(item, index) in announcements" :key="item.id" class="h-[36px] flex items-center text-[24px] text-[#333] truncate cursor-pointer" @click="router.push(`/user/announcement/${item.id}`)">
                <span v-if="item.isTop" class="px-[8px] py-[2px] bg-[#E34D59] text-white text-[18px] rounded-[4px] mr-[8px]">置顶</span>
                <span class="truncate">{{ item.title }}</span>
              </div>
            </div>
          </div>
          <ChevronRightIcon class="text-[24px] text-[#ccc] flex-shrink-0" @click="router.push('/user/announcement')" />
        </div>
      </div>

      <!-- 考勤状态卡片（用户端） -->
      <div v-if="!userStore.isAdmin" class="px-[32px] mb-[24px]">
        <div class="bg-gradient-to-br from-[#0052D9] to-[#266FE8] rounded-[24px] p-[24px] text-white shadow-lg">
          <div class="flex items-center justify-between mb-[16px]">
            <div class="flex items-center gap-[12px]">
              <div class="w-[48px] h-[48px] bg-white/20 rounded-[14px] flex items-center justify-center">
                <TimeFilledIcon class="text-[28px]" />
              </div>
              <div>
                <div class="text-[28px] font-semibold">今日考勤</div>
                <div class="text-[22px] opacity-80">{{ todayWeek }}</div>
              </div>
            </div>
            <div class="text-[22px] opacity-80" @click="router.push('/user/attendance')">查看详情</div>
          </div>
          <div class="flex gap-[16px]">
            <div class="flex-1 bg-white/15 rounded-[16px] p-[16px] text-center" @click="handleCheckIn">
              <div class="text-[40px] font-bold mb-[4px]">{{ todayRecord?.checkInTime || '--:--' }}</div>
              <div class="text-[22px] opacity-80">{{ todayRecord?.checkInTime ? '已上班打卡' : '上班打卡' }}</div>
              <div v-if="todayRecord?.isLate" class="text-[18px] mt-[4px] text-[#FFA8A8]">迟到</div>
            </div>
            <div class="flex-1 bg-white/15 rounded-[16px] p-[16px] text-center" @click="handleCheckOut">
              <div class="text-[40px] font-bold mb-[4px]">{{ todayRecord?.checkOutTime || '--:--' }}</div>
              <div class="text-[22px] opacity-80">{{ todayRecord?.checkOutTime ? '已下班打卡' : '下班打卡' }}</div>
              <div v-if="todayRecord?.isEarlyLeave" class="text-[18px] mt-[4px] text-[#FFA8A8]">早退</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 待办事项（用户端） -->
      <div v-if="!userStore.isAdmin" class="px-[32px] mb-[32px]">
        <div class="flex items-center justify-between mb-[20px]">
          <div class="flex items-center gap-[12px]">
            <Edit1Icon class="text-[28px] text-[#7B61FF]" />
            <span class="text-[30px] font-bold text-[#1a1a1a]">我的待办</span>
            <span v-if="pendingTodos.length > 0" class="px-[10px] py-[4px] bg-[#7B61FF] text-white text-[22px] rounded-[8px]">{{ pendingTodos.length }}</span>
            <span v-if="overdueTodos.length > 0" class="px-[10px] py-[4px] bg-[#E34D59] text-white text-[22px] rounded-[8px]">{{ overdueTodos.length }}超期</span>
          </div>
          <div class="flex items-center gap-[8px] text-[24px] text-[#999]" @click="router.push('/user/todo')">
            <span>全部</span>
            <ChevronRightIcon class="text-[20px]" />
          </div>
        </div>

        <!-- 超期预警 -->
        <div v-if="overdueTodos.length > 0" class="bg-[#FFEBEE] rounded-[16px] p-[20px] mb-[16px] border border-[#E34D59]/20">
          <div class="flex items-center gap-[10px] text-[#E34D59] text-[24px] font-medium mb-[12px]">
            <ErrorCircleIcon class="text-[28px]" />
            <span>您有 {{ overdueTodos.length }} 项待办已超期</span>
          </div>
          <div class="flex flex-wrap gap-[12px]">
            <div
              v-for="todo in overdueTodos.slice(0, 3)"
              :key="todo.id"
              class="bg-white px-[16px] py-[8px] rounded-[12px] text-[22px] text-[#333] cursor-pointer"
              @click="router.push('/user/todo')"
            >
              {{ todo.title }}
            </div>
          </div>
        </div>

        <div v-if="pendingTodos.length === 0 && overdueTodos.length === 0" class="bg-white rounded-[24px] p-[32px] shadow-sm text-center">
          <CheckCircleIcon class="text-[48px] text-[#00A870] mb-[12px]" />
          <div class="text-[26px] text-[#999]">暂无待办任务</div>
          <div class="mt-[20px] inline-flex items-center gap-[8px] px-[20px] py-[10px] bg-[#7B61FF] rounded-[12px]" @click="router.push('/user/todo/create')">
            <AddIcon class="text-[20px] text-white" />
            <span class="text-[24px] text-white">添加待办</span>
          </div>
        </div>

        <div v-else class="bg-white rounded-[24px] shadow-sm overflow-hidden">
          <div v-for="todo in displayTodos" :key="todo.id" class="flex items-center gap-[16px] p-[24px] border-b border-[#f0f0f0] last:border-b-0">
            <!-- 完成勾选 -->
            <div
              :class="['w-[36px] h-[36px] rounded-full flex items-center justify-center flex-shrink-0 transition-all cursor-pointer', 'border-[2px] border-[#ddd]']"
              @click="handleToggleTodo(todo)"
            ></div>
            <!-- 内容 -->
            <div class="flex-1 min-w-0">
              <div class="text-[26px] text-[#333] truncate">{{ todo.title }}</div>
              <div class="flex items-center gap-[10px] mt-[6px]">
                <span class="text-[20px]" :style="{ color: getPriorityColor(todo.priority) }">{{ getPriorityLabel(todo.priority) }}</span>
                <span v-if="todo.dueDate" class="flex items-center gap-[4px] text-[20px]" :class="isOverdue(todo.dueDate) ? 'text-[#E34D59]' : 'text-[#666]'">
                  <TimeIcon class="text-[16px]" />
                  {{ formatDueDate(todo.dueDate) }}
                </span>
                <span v-if="isOverdue(todo.dueDate)" class="text-[18px] text-[#E34D59] bg-[#FFEBEE] px-[8px] py-[2px] rounded-[4px]">超期</span>
                <span v-else-if="isToday(todo.dueDate)" class="text-[18px] text-[#ED7B2F] bg-[#FFF3E0] px-[8px] py-[2px] rounded-[4px]">今日</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 功能入口区域 -->
      <div class="px-[32px] mb-[32px]">
        <div class="flex items-center justify-between mb-[20px]">
          <div class="text-[30px] font-bold text-[#1a1a1a]">{{ userStore.isAdmin ? '管理功能' : '快捷服务' }}</div>
          <div class="text-[24px] text-[#999]">{{ menuList.length }} 项</div>
        </div>

        <div class="grid grid-cols-2 gap-[16px]">
          <div
            v-for="item in menuList"
            :key="item.id"
            class="relative bg-white rounded-[24px] p-[24px] shadow-sm overflow-hidden active:scale-[0.97] transition-transform cursor-pointer group"
            @click="handleMenuClick(item)"
          >
            <div class="absolute top-0 right-0 w-[80px] h-[80px] opacity-5 transform translate-x-[20px] -translate-y-[20px]">
              <component :is="item.icon" class="text-[80px]" :style="{ color: item.color }" />
            </div>
            <div
              class="w-[60px] h-[60px] rounded-[18px] flex items-center justify-center mb-[16px] shadow-md"
              :style="{ background: item.gradient, boxShadow: `0 8px 20px ${item.color}30` }"
            >
              <component :is="item.icon" class="text-[30px] text-white" />
            </div>
            <div class="text-[28px] font-semibold text-[#1a1a1a] mb-[6px]">{{ item.title }}</div>
            <div class="text-[22px] text-[#999] leading-[1.4]">{{ item.desc }}</div>
            <ChevronRightIcon class="absolute bottom-[20px] right-[16px] text-[24px] text-[#ddd] group-hover:text-[#0052D9] transition-colors" />
          </div>
        </div>
      </div>

      <!-- 底部版本信息 -->
      <div class="text-center py-[32px]">
        <div class="inline-flex items-center gap-[8px] text-[22px] text-[#bbb]">
          <div class="w-[6px] h-[6px] bg-[#00A870] rounded-full"></div>
          <span>极智协同 v1.0.0</span>
        </div>
      </div>
    </div>
  </Root>
</template>

<script setup>
import {
  CalendarIcon,
  LocationIcon,
  UserTalkIcon,
  FolderIcon,
  CheckCircleIcon,
  SettingIcon,
  ChevronRightIcon,
  PoweroffIcon,
  NotificationIcon,
  Edit1Icon,
  AddIcon,
  TimeIcon
} from "tdesign-icons-vue-next"
import { useUserStore } from "@/store"
import { showToast } from "@/utils/common/tools"
import { todoRepo, announcementRepo } from "@/db/repositories"
import { useRouter } from "vue-router"
import dayjs from "dayjs"

const router = useRouter()
const userStore = useUserStore()

const todayDate = computed(() => {
  const now = new Date()
  return `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`
})

const todayWeek = computed(() => {
  const weeks = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return weeks[new Date().getDay()]
})

const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了'
  if (hour < 9) return '早上好'
  if (hour < 12) return '上午好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  if (hour < 22) return '晚上好'
  return '夜深了'
}

const userMenuList = [
  { id: 1, title: '会议预定', desc: '会议室预约', icon: CalendarIcon, gradient: 'linear-gradient(135deg, #0052D9 0%, #266FE8 100%)', color: '#0052D9', path: '/user/meeting' },
  { id: 2, title: '差旅出行', desc: '出差申请', icon: LocationIcon, gradient: 'linear-gradient(135deg, #00A870 0%, #2BA471 100%)', color: '#00A870', path: '/user/trip' },
  { id: 3, title: '请假打卡', desc: '考勤管理', icon: UserTalkIcon, gradient: 'linear-gradient(135deg, #ED7B2F 0%, #F09143 100%)', color: '#ED7B2F', path: '/user/attendance' },
  { id: 4, title: '文档查询', desc: '公司资料', icon: FolderIcon, gradient: 'linear-gradient(135deg, #E34D59 0%, #F06956 100%)', color: '#E34D59', path: '/user/document' },
  { id: 5, title: '我的待办', desc: '任务管理', icon: Edit1Icon, gradient: 'linear-gradient(135deg, #7B61FF 0%, #9B8AFF 100%)', color: '#7B61FF', path: '/user/todo' },
  { id: 6, title: '公告通知', desc: '企业动态', icon: NotificationIcon, gradient: 'linear-gradient(135deg, #FF7D7D 0%, #FFA8A8 100%)', color: '#FF7D7D', path: '/user/announcement' }
]

const adminMenuList = [
  { id: 1, title: '会议管理', desc: '会议室配置', icon: CalendarIcon, gradient: 'linear-gradient(135deg, #0052D9 0%, #266FE8 100%)', color: '#0052D9', path: '/admin/meeting' },
  { id: 2, title: '审批中心', desc: '待办审批', icon: CheckCircleIcon, gradient: 'linear-gradient(135deg, #00A870 0%, #2BA471 100%)', color: '#00A870', path: '/admin/approval' },
  { id: 3, title: '文档管理', desc: '上传维护', icon: FolderIcon, gradient: 'linear-gradient(135deg, #ED7B2F 0%, #F09143 100%)', color: '#ED7B2F', path: '/admin/document' },
  { id: 4, title: '考勤管理', desc: '数据报表', icon: SettingIcon, gradient: 'linear-gradient(135deg, #E34D59 0%, #F06956 100%)', color: '#E34D59', path: '/admin/attendance' },
  { id: 5, title: '公告管理', desc: '企业通知', icon: NotificationIcon, gradient: 'linear-gradient(135deg, #7B61FF 0%, #9B8AFF 100%)', color: '#7B61FF', path: '/admin/announcement' }
]

const menuList = computed(() => userStore.isAdmin ? adminMenuList : userMenuList)

// 待办事项
const todos = ref([])

// 公告
const announcements = ref([])

const pendingTodos = computed(() => {
  return todos.value.filter(t => t.status === 'pending').sort((a, b) => {
    if (a.dueDate && b.dueDate) return new Date(a.dueDate) - new Date(b.dueDate)
    if (a.dueDate && !b.dueDate) return -1
    if (!a.dueDate && b.dueDate) return 1
    return a.priority - b.priority
  }).slice(0, 5) // 只显示前5条
})

const loadTodos = async () => {
  if (!userStore.isAdmin) {
    todos.value = await todoRepo.findByUserId(userStore.userId)
  }
}

const loadAnnouncements = async () => {
  if (!userStore.isAdmin) {
    const all = await announcementRepo.findAllOrdered()
    // 只取前5条用于滚动
    announcements.value = all.slice(0, 5)
  }
}

const getPriorityLabel = (priority) => ({ 1: '高', 2: '中', 3: '低' }[priority] || '中')
const getPriorityColor = (priority) => ({ 1: '#E34D59', 2: '#ED7B2F', 3: '#00A870' }[priority] || '#666')

const formatDueDate = (date) => {
  const today = dayjs().format('YYYY-MM-DD')
  const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD')
  if (date === today) return '今天'
  if (date === tomorrow) return '明天'
  return dayjs(date).format('MM/DD')
}

const handleToggleTodo = async (todo) => {
  await todoRepo.toggleComplete(todo.id)
  loadTodos()
}

const handleMenuClick = (item) => router.push(item.path)

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
  showToast('已退出登录')
}

onMounted(() => {
  loadTodos()
  loadAnnouncements()
})
</script>

<style scoped>
.announcement-scroll {
  animation: scroll-up 12s linear infinite;
}

.announcement-scroll:hover {
  animation-play-state: paused;
}

@keyframes scroll-up {
  0% {
    transform: translateY(0);
  }
  20% {
    transform: translateY(0);
  }
  25% {
    transform: translateY(-36px);
  }
  45% {
    transform: translateY(-36px);
  }
  50% {
    transform: translateY(-72px);
  }
  70% {
    transform: translateY(-72px);
  }
  75% {
    transform: translateY(-108px);
  }
  95% {
    transform: translateY(-108px);
  }
  100% {
    transform: translateY(-144px);
  }
}
</style>

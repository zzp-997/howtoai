<template>
  <Root :title="false" :show-back="false">
    <div class="home-page min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] relative overflow-hidden pb-safe">
      <!-- 背景装饰 -->
      <div class="absolute -top-[200px] -right-[150px] w-[500px] h-[500px] bg-gradient-to-br from-[#0052D9]/10 to-[#266FE8]/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none z-0"></div>
      <div class="absolute -bottom-[150px] -left-[100px] w-[400px] h-[400px] bg-gradient-to-br from-[#00A870]/10 to-[#2BA471]/10 rounded-full blur-3xl animate-pulse-slow animation-delay-2000 pointer-events-none z-0"></div>
      <div class="absolute top-[40%] left-[50%] -translate-x-1/2 w-[300px] h-[300px] bg-gradient-to-br from-[#7B61FF]/5 to-[#9B8AFF]/5 rounded-full blur-3xl pointer-events-none z-0"></div>

      <!-- 顶部欢迎区域 -->
      <div class="relative px-[32px] pt-[60px] mb-[24px]">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-[20px]">
            <div class="avatar-container relative">
              <div class="w-[100px] h-[100px] bg-gradient-to-br from-[#0052D9] to-[#266FE8] rounded-[28px] flex items-center justify-center text-[44px] font-bold text-white shadow-xl shadow-[#0052D9]/25">
                {{ userStore.name?.charAt(0) || 'U' }}
              </div>
              <div class="absolute -bottom-[4px] -right-[4px] w-[32px] h-[32px] bg-gradient-to-br from-[#00A870] to-[#2BA471] rounded-full flex items-center justify-center shadow-lg shadow-[#00A870]/30">
                <CheckCircleIcon class="text-[18px] text-white" />
              </div>
              <!-- 未读公告角标 -->
              <div v-if="unreadAnnouncementCount > 0" class="absolute -top-[4px] -right-[4px] min-w-[28px] h-[28px] bg-gradient-to-br from-[#E34D59] to-[#F06956] rounded-full flex items-center justify-center px-[6px] shadow-lg shadow-[#E34D59]/30 animate-bounce-subtle">
                <span class="text-[16px] text-white font-bold">{{ unreadAnnouncementCount > 9 ? '9+' : unreadAnnouncementCount }}</span>
              </div>
            </div>
            <div>
              <div class="text-[36px] font-bold text-[#1e293b] tracking-tight">{{ getGreeting() }}</div>
              <div class="text-[26px] text-[#64748b] mt-[4px] flex items-center gap-[8px]">
                <span>{{ userStore.name }}</span>
                <span class="w-[1px] h-[18px] bg-[#cbd5e1]"></span>
                <span class="px-[10px] py-[2px] bg-gradient-to-r from-[#0052D9]/10 to-[#266FE8]/10 rounded-[6px] text-[#0052D9] font-medium">{{ userStore.isAdmin ? '管理员' : '员工' }}</span>
              </div>
            </div>
          </div>
          <!-- 设置和退出按钮 -->
          <div class="flex flex-col gap-[12px]">
            <div class="action-btn w-[56px] h-[56px] bg-white rounded-[16px] flex items-center justify-center shadow-lg shadow-slate-200/50 border border-slate-100 hover:shadow-xl hover:scale-105 transition-all cursor-pointer" @click="router.push('/user/settings')">
              <SettingIcon class="text-[28px] text-[#64748b]" />
            </div>
            <div class="action-btn w-[56px] h-[56px] bg-white rounded-[16px] flex items-center justify-center shadow-lg shadow-slate-200/50 border border-slate-100 hover:shadow-xl hover:scale-105 transition-all cursor-pointer" @click="handleLogout">
              <PoweroffIcon class="text-[28px] text-[#64748b]" />
            </div>
          </div>
        </div>

        <!-- 日期信息 -->
        <div class="mt-[20px] flex items-center gap-[12px] text-[24px] text-[#94a3b8]">
          <div class="w-[32px] h-[32px] bg-gradient-to-br from-[#7B61FF]/10 to-[#9B8AFF]/10 rounded-[8px] flex items-center justify-center">
            <CalendarIcon class="text-[20px] text-[#7B61FF]" />
          </div>
          <span>{{ todayDate }}</span>
          <span class="px-[10px] py-[4px] bg-gradient-to-r from-[#7B61FF]/10 to-[#9B8AFF]/10 rounded-[8px] text-[#7B61FF] font-medium">{{ todayWeek }}</span>
        </div>
      </div>

      <!-- 企业公告轮播（用户端） -->
      <div v-if="!userStore.isAdmin && announcements.length > 0" class="px-[32px] mb-[20px]">
        <div class="announcement-card bg-white rounded-[20px] p-[16px] shadow-lg shadow-slate-200/50 flex items-center gap-[12px] border border-slate-100">
          <div class="flex-shrink-0 w-[40px] h-[40px] bg-gradient-to-br from-[#FF7D7D] to-[#FFA8A8] rounded-[12px] flex items-center justify-center shadow-lg shadow-[#FF7D7D]/30">
            <NotificationIcon class="text-[22px] text-white" />
          </div>
          <div class="flex-1 h-[32px] overflow-hidden relative">
            <transition name="slide-fade" mode="out-in">
              <div
                :key="currentAnnouncementIndex"
                class="h-[32px] flex items-center text-[22px] text-[#475569] truncate cursor-pointer hover:text-[#0052D9] transition-colors"
                @click="router.push(`/user/announcement/${announcements[currentAnnouncementIndex]?.id}`)"
              >
                <span v-if="announcements[currentAnnouncementIndex]?.isTop" class="px-[6px] py-[1px] bg-gradient-to-r from-[#E34D59] to-[#F06956] text-white text-[16px] rounded-[4px] mr-[8px] shadow-sm">置顶</span>
                <span v-if="announcements[currentAnnouncementIndex]?.categoryLabel" class="px-[6px] py-[1px] rounded-[4px] mr-[8px] text-[16px] text-white shadow-sm" :style="{ background: getCategoryColor(announcements[currentAnnouncementIndex]?.category) }">{{ announcements[currentAnnouncementIndex]?.categoryLabel }}</span>
                <span class="truncate">{{ announcements[currentAnnouncementIndex]?.title }}</span>
              </div>
            </transition>
          </div>
          <ChevronRightIcon class="text-[20px] text-[#cbd5e1] flex-shrink-0 hover:text-[#0052D9] transition-colors cursor-pointer" @click="router.push('/user/announcement')" />
        </div>
      </div>

      <!-- 考勤状态卡片（用户端） -->
      <div v-if="!userStore.isAdmin" class="px-[32px] mb-[20px]">
        <div class="attendance-card bg-white rounded-[20px] shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div class="flex items-center">
            <!-- 左侧状态指示 -->
            <div class="w-[8px] h-full bg-gradient-to-b from-[#0052D9] to-[#266FE8] self-stretch"></div>

            <div class="flex-1 p-[16px]">
              <div class="flex items-center justify-between mb-[10px]">
                <div class="flex items-center gap-[10px]">
                  <div class="w-[36px] h-[36px] bg-gradient-to-br from-[#0052D9]/10 to-[#266FE8]/10 rounded-[10px] flex items-center justify-center">
                    <TimeFilledIcon class="text-[20px] text-[#0052D9]" />
                  </div>
                  <span class="text-[24px] font-semibold text-[#1e293b]">今日考勤</span>
                </div>
                <div class="text-[20px] text-[#94a3b8] hover:text-[#0052D9] transition-colors cursor-pointer" @click="router.push('/user/attendance')">
                  详情 ›
                </div>
              </div>

              <div class="flex items-center gap-[16px]">
                <!-- 上班打卡 -->
                <div class="flex-1 flex items-center gap-[12px] py-[8px] px-[12px] rounded-[12px] transition-all cursor-pointer hover:bg-slate-50" @click="handleCheckIn">
                  <div :class="['w-[32px] h-[32px] rounded-[10px] flex items-center justify-center', todayRecord?.checkInTime ? 'bg-[#00A870]/10' : 'bg-slate-100']">
                    <LoginIcon :class="['text-[18px]', todayRecord?.checkInTime ? 'text-[#00A870]' : 'text-slate-400']" />
                  </div>
                  <div class="flex-1">
                    <div class="text-[16px] text-[#94a3b8]">上班</div>
                    <div class="text-[24px] font-bold text-[#1e293b]">{{ todayRecord?.checkInTime || '--:--' }}</div>
                  </div>
                  <div v-if="todayRecord?.isLate" class="px-[8px] py-[2px] bg-[#FFEBEE] text-[#E34D59] text-[14px] rounded-[4px]">迟到</div>
                  <div v-else-if="todayRecord?.checkInTime" class="px-[8px] py-[2px] bg-[#E8F5E9] text-[#00A870] text-[14px] rounded-[4px]">正常</div>
                </div>

                <div class="w-[1px] h-[40px] bg-slate-200"></div>

                <!-- 下班打卡 -->
                <div class="flex-1 flex items-center gap-[12px] py-[8px] px-[12px] rounded-[12px] transition-all cursor-pointer hover:bg-slate-50" @click="handleCheckOut">
                  <div :class="['w-[32px] h-[32px] rounded-[10px] flex items-center justify-center', todayRecord?.checkOutTime ? 'bg-[#0052D9]/10' : 'bg-slate-100']">
                    <LogoutIcon :class="['text-[18px]', todayRecord?.checkOutTime ? 'text-[#0052D9]' : 'text-slate-400']" />
                  </div>
                  <div class="flex-1">
                    <div class="text-[16px] text-[#94a3b8]">下班</div>
                    <div class="text-[24px] font-bold text-[#1e293b]">{{ todayRecord?.checkOutTime || '--:--' }}</div>
                  </div>
                  <div v-if="todayRecord?.isEarlyLeave" class="px-[8px] py-[2px] bg-[#FFEBEE] text-[#E34D59] text-[14px] rounded-[4px]">早退</div>
                  <div v-else-if="todayRecord?.checkOutTime" class="px-[8px] py-[2px] bg-[#E8F5E9] text-[#00A870] text-[14px] rounded-[4px]">正常</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 待办事项（用户端） -->
      <div v-if="!userStore.isAdmin" class="px-[32px] mb-[28px]">
        <div class="flex items-center justify-between mb-[16px]">
          <div class="flex items-center gap-[12px]">
            <div class="w-[32px] h-[32px] bg-gradient-to-br from-[#7B61FF] to-[#9B8AFF] rounded-[10px] flex items-center justify-center shadow-lg shadow-[#7B61FF]/30">
              <Edit1Icon class="text-[18px] text-white" />
            </div>
            <span class="text-[30px] font-bold text-[#1e293b]">我的待办</span>
            <span v-if="pendingTodos.length > 0" class="px-[10px] py-[4px] bg-gradient-to-r from-[#7B61FF] to-[#9B8AFF] text-white text-[22px] rounded-[10px] shadow-lg shadow-[#7B61FF]/30">{{ pendingTodos.length }}</span>
            <span v-if="overdueTodos.length > 0" class="px-[10px] py-[4px] bg-gradient-to-r from-[#E34D59] to-[#F06956] text-white text-[22px] rounded-[10px] shadow-lg shadow-[#E34D59]/30">{{ overdueTodos.length }}超期</span>
          </div>
          <div class="flex items-center gap-[6px] text-[24px] text-[#94a3b8] hover:text-[#0052D9] transition-colors cursor-pointer" @click="router.push('/user/todo')">
            <span>全部</span>
            <ChevronRightIcon class="text-[20px]" />
          </div>
        </div>

        <!-- 超期预警 -->
        <div v-if="overdueTodos.length > 0" class="warning-card bg-gradient-to-r from-[#FFEBEE] to-[#FCE4EC] rounded-[20px] p-[20px] mb-[16px] border border-[#E34D59]/20">
          <div class="flex items-center gap-[10px] text-[#E34D59] text-[24px] font-medium mb-[12px]">
            <div class="w-[28px] h-[28px] bg-[#E34D59] rounded-[8px] flex items-center justify-center">
              <ErrorCircleIcon class="text-[18px] text-white" />
            </div>
            <span>您有 {{ overdueTodos.length }} 项待办已超期</span>
          </div>
          <div class="flex flex-wrap gap-[12px]">
            <div
              v-for="todo in overdueTodos.slice(0, 3)"
              :key="todo.id"
              class="bg-white px-[18px] py-[10px] rounded-[14px] text-[22px] text-[#475569] cursor-pointer shadow-sm hover:shadow-md transition-shadow"
              @click="router.push('/user/todo')"
            >
              {{ todo.title }}
            </div>
          </div>
        </div>

        <div v-if="pendingTodos.length === 0 && overdueTodos.length === 0" class="empty-card bg-white rounded-[24px] p-[32px] shadow-lg shadow-slate-200/50 text-center border border-slate-100">
          <div class="w-[80px] h-[80px] mx-auto bg-gradient-to-br from-[#00A870]/10 to-[#2BA471]/10 rounded-full flex items-center justify-center mb-[16px]">
            <CheckCircleIcon class="text-[40px] text-[#00A870]" />
          </div>
          <div class="text-[26px] text-[#64748b]">暂无待办任务</div>
          <div class="mt-[24px] inline-flex items-center gap-[10px] px-[28px] py-[16px] bg-gradient-to-r from-[#7B61FF] to-[#9B8AFF] rounded-[16px] shadow-lg shadow-[#7B61FF]/30 hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer" @click="handleAddTodo">
            <div class="w-[36px] h-[36px] bg-white/20 rounded-[10px] flex items-center justify-center">
              <AddIcon class="text-[22px] text-white" />
            </div>
            <span class="text-[26px] text-white font-semibold">添加待办</span>
          </div>
        </div>

        <div v-else class="todo-list bg-white rounded-[24px] shadow-lg shadow-slate-200/50 overflow-hidden border border-slate-100">
          <div v-for="todo in displayTodos" :key="todo.id" class="todo-item flex items-center gap-[16px] p-[20px] border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 transition-colors">
            <!-- 完成勾选 -->
            <div
              :class="['w-[36px] h-[36px] rounded-full flex items-center justify-center flex-shrink-0 transition-all cursor-pointer border-[2px] hover:border-[#0052D9] hover:bg-[#0052D9]/5', 'border-slate-300']"
              @click="handleToggleTodo(todo)"
            ></div>
            <!-- 内容 -->
            <div class="flex-1 min-w-0">
              <div class="text-[26px] text-[#1e293b] truncate font-medium">{{ todo.title }}</div>
              <div class="flex items-center gap-[10px] mt-[6px]">
                <span class="text-[20px] font-medium" :style="{ color: getPriorityColor(todo.priority) }">{{ getPriorityLabel(todo.priority) }}</span>
                <span v-if="todo.taskDate" class="text-[20px] text-[#0052D9]">{{ formatTaskDate(todo.taskDate) }}</span>
                <span v-if="todo.dueDate" class="flex items-center gap-[4px] text-[20px]" :class="isOverdue(todo.dueDate) ? 'text-[#E34D59]' : 'text-[#64748b]'">
                  <TimeIcon class="text-[16px]" />
                  截止: {{ formatDueDate(todo.dueDate) }}
                </span>
                <span v-if="isOverdue(todo.dueDate)" class="text-[18px] text-[#E34D59] bg-[#FFEBEE] px-[10px] py-[4px] rounded-[6px] font-medium">超期</span>
                <span v-else-if="isToday(todo.dueDate)" class="text-[18px] text-[#ED7B2F] bg-[#FFF7ED] px-[10px] py-[4px] rounded-[6px] font-medium">今日</span>
              </div>
            </div>
          </div>
          <!-- 添加待办按钮 -->
          <div class="p-[16px] border-t border-slate-100">
            <div class="flex items-center justify-center gap-[10px] py-[14px] bg-gradient-to-r from-[#7B61FF]/10 via-[#8B7AFF]/10 to-[#9B8AFF]/10 rounded-[16px] cursor-pointer hover:from-[#7B61FF]/20 hover:via-[#8B7AFF]/20 hover:to-[#9B8AFF]/20 transition-all group" @click="handleAddTodo">
              <div class="w-[32px] h-[32px] bg-gradient-to-br from-[#7B61FF] to-[#9B8AFF] rounded-[10px] flex items-center justify-center shadow-md shadow-[#7B61FF]/20 group-hover:shadow-lg group-hover:scale-110 transition-all">
                <AddIcon class="text-[20px] text-white" />
              </div>
              <span class="text-[24px] text-[#7B61FF] font-semibold">添加待办</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 功能入口区域 -->
      <div class="px-[32px] mb-[32px]">
        <div class="flex items-center justify-between mb-[20px]">
          <div class="text-[30px] font-bold text-[#1e293b]">{{ userStore.isAdmin ? '管理功能' : '快捷服务' }}</div>
          <div class="text-[24px] text-[#94a3b8]">{{ menuList.length }} 项</div>
        </div>

        <div class="grid grid-cols-2 gap-[16px]">
          <div
            v-for="item in menuList"
            :key="item.id"
            class="menu-card relative bg-white rounded-[24px] p-[24px] shadow-lg shadow-slate-200/50 overflow-hidden active:scale-[0.97] transition-all cursor-pointer group border border-slate-100 hover:shadow-xl"
            @click="handleMenuClick(item)"
          >
            <div class="absolute top-[-10px] right-[-10px] w-[80px] h-[80px] opacity-[0.03] transform translate-x-[10px] -translate-y-[10px]">
              <component :is="item.icon" class="text-[100px]" :style="{ color: item.color }" />
            </div>
            <div
              class="w-[56px] h-[56px] rounded-[18px] flex items-center justify-center mb-[16px] relative z-10"
              :style="{ background: item.gradient, boxShadow: `0 8px 24px ${item.color}25` }"
            >
              <component :is="item.icon" class="text-[28px] text-white" />
            </div>
            <div class="text-[28px] font-semibold text-[#1e293b] mb-[6px] relative z-10">{{ item.title }}</div>
            <div class="text-[22px] text-[#94a3b8] leading-[1.4] relative z-10">{{ item.desc }}</div>
            <ChevronRightIcon class="absolute bottom-[20px] right-[16px] text-[24px] text-slate-300 group-hover:text-[#0052D9] group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </div>

      <!-- 底部版本信息 -->
      <div class="text-center py-[32px]">
        <div class="inline-flex items-center gap-[8px] text-[22px] text-[#cbd5e1]">
          <div class="w-[8px] h-[8px] bg-gradient-to-br from-[#00A870] to-[#2BA471] rounded-full shadow-sm shadow-[#00A870]/30"></div>
          <span>极智协同 v1.0.0</span>
        </div>
      </div>
    </div>

    <!-- 重要公告弹窗 -->
    <t-popup v-model="showAnnouncementPopup" placement="center" :close-on-overlay-click="false">
      <div v-if="popupAnnouncements.length > 0" class="popup-card bg-white rounded-[32px] w-[600px] max-w-[90vw] overflow-hidden shadow-2xl">
        <!-- 头部 -->
        <div class="flex items-center justify-between p-[24px] bg-gradient-to-br from-[#FF7D7D] to-[#FFA8A8]">
          <div class="flex items-center gap-[12px]">
            <NotificationIcon class="text-[32px] text-white" />
            <span class="text-[32px] font-bold text-white">重要公告</span>
          </div>
          <div class="flex items-center gap-[12px]">
            <span v-if="popupAnnouncements.length > 1" class="text-[22px] text-white/80">{{ currentPopupIndex + 1 }}/{{ popupAnnouncements.length }}</span>
            <div class="w-[40px] h-[40px] bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors cursor-pointer" @click="closeAnnouncementPopup">
              <CloseIcon class="text-[24px] text-white" />
            </div>
          </div>
        </div>
        <!-- 内容 -->
        <div class="p-[32px]">
          <!-- 标签 -->
          <div class="flex items-center gap-[10px] mb-[16px]">
            <span v-if="popupAnnouncements[currentPopupIndex]?.isTop" class="px-[12px] py-[4px] bg-gradient-to-r from-[#E34D59] to-[#F06956] text-white text-[20px] rounded-[8px] shadow-sm">置顶</span>
            <span class="px-[12px] py-[4px] text-white text-[20px] rounded-[8px] shadow-sm" :style="{ background: getCategoryColor(popupAnnouncements[currentPopupIndex]?.category) }">{{ popupAnnouncements[currentPopupIndex]?.categoryLabel || '通知' }}</span>
          </div>
          <!-- 标题 -->
          <div class="text-[32px] font-bold text-[#1e293b] mb-[16px]">{{ popupAnnouncements[currentPopupIndex]?.title }}</div>
          <!-- 摘要 -->
          <div class="text-[26px] text-[#64748b] leading-[1.6] mb-[24px] line-clamp-4">{{ popupAnnouncements[currentPopupIndex]?.summary || popupAnnouncements[currentPopupIndex]?.content?.substring(0, 100) }}...</div>
          <!-- 发布时间 -->
          <div class="text-[22px] text-[#94a3b8] mb-[24px]">{{ formatDate(popupAnnouncements[currentPopupIndex]?.publishTime) }}</div>
          <!-- 操作按钮 -->
          <div class="flex gap-[16px]">
            <t-button v-if="popupAnnouncements.length > 1 && currentPopupIndex > 0" theme="default" class="flex-1 h-[72px] text-[26px] rounded-[14px]" @click="prevPopup">上一条</t-button>
            <t-button theme="primary" class="flex-1 h-[72px] text-[26px] rounded-[14px] !bg-gradient-to-r !from-[#0052D9] !to-[#266FE8]" @click="viewPopupAnnouncement(popupAnnouncements[currentPopupIndex])">查看详情</t-button>
            <t-button v-if="popupAnnouncements.length > 1 && currentPopupIndex < popupAnnouncements.length - 1" theme="default" class="flex-1 h-[72px] text-[26px] rounded-[14px]" @click="nextPopup">下一条</t-button>
          </div>
        </div>
      </div>
    </t-popup>
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
  TimeIcon,
  CloseIcon,
  ErrorCircleIcon,
  TimeFilledIcon,
  LoginIcon,
  LogoutIcon
} from "tdesign-icons-vue-next"
import { useUserStore } from "@/store"
import { showToast } from "@/utils/common/tools"
import { todoRepo, announcementRepo, ANNOUNCEMENT_CATEGORIES, attendanceRepo, attendanceConfigRepo } from "@/db/repositories"
import { useRouter } from "vue-router"
import dayjs from "dayjs"

const router = useRouter()
const userStore = useUserStore()
const unreadAnnouncementCount = ref(0)
const showAnnouncementPopup = ref(false)
const popupAnnouncements = ref([])
const currentPopupIndex = ref(0)

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
const currentAnnouncementIndex = ref(0)
let announcementTimer = null

// 考勤
const todayRecord = ref(null)
const workStartTime = ref('09:00')
const workEndTime = ref('18:00')

const pendingTodos = computed(() => {
  return todos.value.filter(t => t.status === 'pending').sort((a, b) => {
    if (a.dueDate && b.dueDate) return new Date(a.dueDate) - new Date(b.dueDate)
    if (a.dueDate && !b.dueDate) return -1
    if (!a.dueDate && b.dueDate) return 1
    return a.priority - b.priority
  }).slice(0, 5) // 只显示前5条
})

// 超期待办
const overdueTodos = computed(() => {
  const today = dayjs().format('YYYY-MM-DD')
  return todos.value.filter(t => t.status === 'pending' && t.dueDate && t.dueDate < today)
})

// 显示的待办列表（排除超期的）
const displayTodos = computed(() => {
  return pendingTodos.value.filter(t => !overdueTodos.value.find(o => o.id === t.id)).slice(0, 5)
})

// 判断是否超期
const isOverdue = (dueDate) => {
  if (!dueDate) return false
  const today = dayjs().format('YYYY-MM-DD')
  return dueDate < today
}

// 判断是否今天
const isToday = (dueDate) => {
  if (!dueDate) return false
  const today = dayjs().format('YYYY-MM-DD')
  return dueDate === today
}

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
    // 启动自动轮播
    startAnnouncementAutoPlay()
    // 获取未读数量
    unreadAnnouncementCount.value = await announcementRepo.getUnreadCount(userStore.userId)
    // 获取需要弹窗的重要公告
    const important = await announcementRepo.findImportantUnread(userStore.userId)
    if (important.length > 0) {
      popupAnnouncements.value = important
      showAnnouncementPopup.value = true
    }
  }
}

// 加载今日考勤记录
const loadTodayRecord = async () => {
  if (!userStore.isAdmin) {
    const today = dayjs().format('YYYY-MM-DD')
    todayRecord.value = await attendanceRepo.findByUserAndDate(userStore.userId, today)
    workStartTime.value = await attendanceConfigRepo.getWorkStartTime()
    workEndTime.value = await attendanceConfigRepo.getWorkEndTime()
  }
}

// 上班打卡
const handleCheckIn = async () => {
  if (todayRecord.value?.checkInTime) {
    showToast('今日已上班打卡')
    return
  }
  try {
    await attendanceRepo.checkIn(userStore.userId, workStartTime.value)
    showToast('上班打卡成功')
    await loadTodayRecord()
  } catch (error) {
    showToast(error.message || '打卡失败')
  }
}

// 下班打卡
const handleCheckOut = async () => {
  if (!todayRecord.value?.checkInTime) {
    showToast('请先上班打卡')
    return
  }
  if (todayRecord.value?.checkOutTime) {
    showToast('今日已下班打卡')
    return
  }
  try {
    await attendanceRepo.checkOut(userStore.userId, workEndTime.value)
    showToast('下班打卡成功')
    await loadTodayRecord()
  } catch (error) {
    showToast(error.message || '打卡失败')
  }
}

// 公告自动轮播
const startAnnouncementAutoPlay = () => {
  if (announcements.value.length <= 1) return
  stopAnnouncementAutoPlay()
  announcementTimer = setInterval(() => {
    currentAnnouncementIndex.value = (currentAnnouncementIndex.value + 1) % announcements.value.length
  }, 5000)
}

const stopAnnouncementAutoPlay = () => {
  if (announcementTimer) {
    clearInterval(announcementTimer)
    announcementTimer = null
  }
}

// 公告分类颜色
const getCategoryColor = (category) => ANNOUNCEMENT_CATEGORIES[category]?.color || '#999'

// 关闭弹窗
const closeAnnouncementPopup = async () => {
  if (popupAnnouncements.value.length > 0) {
    // 标记当前公告已弹窗展示
    await announcementRepo.markPopupShown(popupAnnouncements.value[currentPopupIndex.value].id, userStore.userId)
  }
  showAnnouncementPopup.value = false
}

// 查看弹窗公告详情
const viewPopupAnnouncement = async (item) => {
  await announcementRepo.markPopupShown(item.id, userStore.userId)
  showAnnouncementPopup.value = false
  router.push(`/user/announcement/${item.id}`)
}

// 上一条/下一条弹窗公告
const prevPopup = () => {
  if (currentPopupIndex.value > 0) {
    currentPopupIndex.value--
  }
}
const nextPopup = () => {
  if (currentPopupIndex.value < popupAnnouncements.value.length - 1) {
    currentPopupIndex.value++
  }
}

const getPriorityLabel = (priority) => ({ 1: '高', 2: '中', 3: '低' }[priority] || '中')
const getPriorityColor = (priority) => ({ 1: '#E34D59', 2: '#ED7B2F', 3: '#00A870' }[priority] || '#666')

const formatDate = (date) => dayjs(date).format('YYYY-MM-DD HH:mm')

const formatTaskDate = (date) => {
  const today = dayjs().format('YYYY-MM-DD')
  const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD')
  if (date === today) return '今天'
  if (date === tomorrow) return '明天'
  return dayjs(date).format('MM/DD')
}

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

const handleAddTodo = () => {
  router.push('/user/todo/create')
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
  loadTodayRecord()
})

onUnmounted(() => {
  stopAnnouncementAutoPlay()
})
</script>

<style scoped>
/* 缓慢脉冲动画 */
.animate-pulse-slow {
  animation: pulse-slow 4s ease-in-out infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

@keyframes pulse-slow {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.05); }
}

/* 微妙弹跳 */
.animate-bounce-subtle {
  animation: bounce-subtle 2s ease-in-out infinite;
}

@keyframes bounce-subtle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

/* 公告轮播过渡动画 */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* 卡片悬停效果 */
.menu-card:hover {
  transform: translateY(-2px);
}

.todo-item:hover {
  background: linear-gradient(90deg, transparent 0%, rgba(0, 82, 217, 0.03) 100%);
}

/* 夜间模式适配 */
[data-theme="dark"] .home-page {
  background: linear-gradient(to bottom right, #1f2937, #1a1a1a, #111827);
}

[data-theme="dark"] .menu-card {
  background: var(--bg-primary);
  border-color: var(--border-color);
}

[data-theme="dark"] .menu-card:hover {
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

[data-theme="dark"] .todo-list,
[data-theme="dark"] .empty-card,
[data-theme="dark"] .announcement-card {
  background: var(--bg-primary);
  border-color: var(--border-color);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

[data-theme="dark"] .attendance-card {
  background: var(--bg-primary);
  border-color: var(--border-color);
}

[data-theme="dark"] .attendance-card .hover\:bg-slate-50:hover {
  background: rgba(255, 255, 255, 0.03);
}

[data-theme="dark"] .warning-card {
  background: linear-gradient(90deg, rgba(242, 123, 133, 0.15), rgba(242, 123, 133, 0.1));
  border-color: rgba(242, 123, 133, 0.2);
}

[data-theme="dark"] .action-btn {
  background: var(--bg-tertiary);
  border-color: var(--border-color);
}

[data-theme="dark"] .todo-item:hover {
  background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.03) 100%);
}
</style>
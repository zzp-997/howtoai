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
          <!-- 退出登录按钮 -->
          <div
            class="w-[64px] h-[64px] bg-white rounded-[18px] flex items-center justify-center shadow-lg shadow-slate-200/50 border border-slate-100 cursor-pointer hover:shadow-xl hover:scale-105 transition-all"
            @click="handleLogout"
          >
            <PoweroffIcon class="text-[32px] text-[#E34D59]" />
          </div>
        </div>

        <!-- 日期信息 -->
        <div class="mt-[20px] flex items-center gap-[12px] text-[24px] text-[#94a3b8]">
          <div class="w-[36px] h-[36px] bg-gradient-to-br from-[#7B61FF]/10 to-[#9B8AFF]/10 rounded-[10px] flex items-center justify-center">
            <CalendarIcon class="text-[22px] text-[#7B61FF]" />
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

      <!-- 行程提醒（用户端） -->
      <div v-if="!userStore.isAdmin && visibleTripReminders.length > 0" class="px-[32px] mb-[20px]">
        <div
          v-for="reminder in visibleTripReminders"
          :key="reminder.reminderId"
          class="trip-reminder-card bg-gradient-to-br from-[#00A870] to-[#2BA471] rounded-[20px] p-[20px] text-white relative overflow-hidden"
        >
          <!-- 装饰背景 -->
          <div class="absolute -top-[20px] -right-[20px] w-[120px] h-[120px] bg-white/10 rounded-full"></div>

          <div class="flex items-start justify-between relative z-10">
            <div class="flex-1">
              <div class="flex items-center gap-[10px] mb-[12px]">
                <div class="w-[40px] h-[40px] bg-white/20 rounded-[12px] flex items-center justify-center">
                  <LocationIcon class="text-[22px] text-white" />
                </div>
                <div>
                  <div class="text-[18px] opacity-80">明天出发</div>
                  <div class="text-[28px] font-semibold">{{ reminder.trip.destination }}</div>
                </div>
              </div>

              <div class="flex items-center gap-[20px] text-[22px] opacity-90 mb-[12px]">
                <span>{{ reminder.trip.startDate }}</span>
                <span class="w-[1px] h-[16px] bg-white/30"></span>
                <span>{{ reminder.trip.reason }}</span>
              </div>

              <div v-if="reminder.weatherTips" class="text-[20px] opacity-80 mb-[12px]">
                🌤️ {{ reminder.weatherTips }}
              </div>

              <div v-if="reminder.suggestions?.length" class="flex flex-wrap gap-[8px]">
                <span class="text-[18px] opacity-70">建议携带：</span>
                <span
                  v-for="item in reminder.suggestions"
                  :key="item"
                  class="px-[10px] py-[4px] bg-white/20 rounded-[6px] text-[18px]"
                >
                  {{ item }}
                </span>
              </div>
            </div>

            <div class="flex flex-col gap-[10px]">
              <div
                class="w-[36px] h-[36px] bg-white/20 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors"
                @click="router.push(`/user/trip`)"
              >
                <ChevronRightIcon class="text-[20px] text-white" />
              </div>
              <div
                class="w-[36px] h-[36px] bg-white/20 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors"
                @click="handleDismissReminder(reminder.reminderId)"
              >
                <CloseIcon class="text-[18px] text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 报销提醒（用户端） -->
      <div v-if="!userStore.isAdmin && visibleExpenseReminders.length > 0" class="px-[32px] mb-[20px]">
        <div
          v-for="reminder in visibleExpenseReminders"
          :key="reminder.reminderId"
          class="expense-reminder-card bg-gradient-to-br from-[#ED7B2F] to-[#F09143] rounded-[20px] p-[20px] text-white relative overflow-hidden"
        >
          <!-- 装饰背景 -->
          <div class="absolute -top-[20px] -right-[20px] w-[120px] h-[120px] bg-white/10 rounded-full"></div>

          <div class="flex items-start justify-between relative z-10">
            <div class="flex-1">
              <div class="flex items-center gap-[10px] mb-[12px]">
                <div class="w-[40px] h-[40px] bg-white/20 rounded-[12px] flex items-center justify-center">
                  <MoneyIcon class="text-[22px] text-white" />
                </div>
                <div>
                  <div class="text-[18px] opacity-80">{{ reminder.existingClaim ? '报销待提交' : '差旅已结束' }}</div>
                  <div class="text-[28px] font-semibold">{{ reminder.trip.destination }}</div>
                </div>
              </div>

              <div class="flex items-center gap-[20px] text-[22px] opacity-90 mb-[12px]">
                <span>{{ reminder.trip.reason }}</span>
                <span class="w-[1px] h-[16px] bg-white/30"></span>
                <span v-if="reminder.daysSinceEnd === 0">今日结束</span>
                <span v-else-if="reminder.daysSinceEnd === 1">昨天结束</span>
                <span v-else>{{ reminder.daysSinceEnd }}天前结束</span>
              </div>

              <div class="text-[20px] opacity-80">
                {{ reminder.existingClaim ? '草稿待提交，点击继续填写' : '点击填写报销单' }}
              </div>
            </div>

            <div class="flex flex-col gap-[10px]">
              <t-button
                theme="primary"
                size="small"
                class="h-[56px] px-[20px] text-[22px] bg-white text-[#ED7B2F] border-0 rounded-[12px]"
                @click="handleExpense(reminder)"
              >
                {{ reminder.existingClaim ? '继续填写' : '立即报销' }}
              </t-button>
              <div
                class="w-[36px] h-[36px] bg-white/20 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors mx-auto"
                @click="handleDismissExpenseReminder(reminder.reminderId)"
              >
                <CloseIcon class="text-[18px] text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 待办事项（用户端） -->
      <div v-if="!userStore.isAdmin" class="px-[32px] mb-[28px]">
        <div class="flex items-center justify-between mb-[16px]">
          <div class="flex items-center gap-[12px]">
            <div class="w-[40px] h-[40px] bg-gradient-to-br from-[#7B61FF] to-[#9B8AFF] rounded-[12px] flex items-center justify-center shadow-lg shadow-[#7B61FF]/30">
              <Edit1Icon class="text-[22px] text-white" />
            </div>
            <span class="text-[28px] font-bold text-[#1e293b]">我的待办</span>
            <span v-if="pendingTodos.length > 0" class="px-[10px] py-[4px] bg-gradient-to-r from-[#7B61FF] to-[#9B8AFF] text-white text-[20px] rounded-[10px] shadow-lg shadow-[#7B61FF]/30">{{ pendingTodos.length }}</span>
            <span v-if="overdueTodos.length > 0" class="px-[10px] py-[4px] bg-gradient-to-r from-[#E34D59] to-[#F06956] text-white text-[20px] rounded-[10px] shadow-lg shadow-[#E34D59]/30">{{ overdueTodos.length }}超期</span>
          </div>
          <div class="flex items-center gap-[6px] text-[22px] text-[#94a3b8] hover:text-[#0052D9] transition-colors cursor-pointer" @click="router.push('/user/todo')">
            <span>全部</span>
            <ChevronRightIcon class="text-[18px]" />
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

      <!-- 智能推荐（用户端） -->
      <div v-if="!userStore.isAdmin && meetingRecommendations.length > 0" class="px-[32px] mb-[28px]">
        <div class="flex items-center justify-between mb-[16px]">
          <div class="flex items-center gap-[12px]">
            <div class="w-[40px] h-[40px] bg-gradient-to-br from-[#0052D9] to-[#266FE8] rounded-[12px] flex items-center justify-center shadow-lg shadow-[#0052D9]/30">
              <LightbulbIcon class="text-[22px] text-white" />
            </div>
            <span class="text-[28px] font-bold text-[#1e293b]">智能推荐</span>
          </div>
          <div class="flex items-center gap-[10px]">
            <div class="text-[22px] text-[#94a3b8] hover:text-[#0052D9] transition-colors cursor-pointer" @click="handleRefreshRecommend">换一批</div>
            <ChevronRightIcon class="text-[18px] text-[#cbd5e1]" />
          </div>
        </div>

        <div class="bg-white rounded-[24px] shadow-lg shadow-slate-200/50 overflow-hidden border border-slate-100">
          <!-- 轮播指示器 -->
          <div v-if="meetingRecommendations.length > 1" class="flex justify-center gap-[8px] pt-[16px]">
            <div
              v-for="(_, idx) in meetingRecommendations"
              :key="idx"
              :class="['w-[8px] h-[8px] rounded-full transition-all', idx === currentRecommendIndex ? 'bg-[#0052D9] w-[24px]' : 'bg-slate-200']"
            ></div>
          </div>

          <!-- 推荐卡片 -->
          <div class="relative overflow-hidden">
            <transition name="recommend-slide" mode="out-in">
              <div
                :key="currentRecommendIndex"
                class="p-[24px]"
              >
                <div class="flex items-start gap-[20px]">
                  <!-- 会议室信息 -->
                  <div class="flex-1">
                    <div class="text-[26px] font-semibold text-[#1e293b] mb-[8px]">{{ meetingRecommendations[currentRecommendIndex]?.room?.name }}</div>
                    <div class="flex items-center gap-[16px] mb-[12px]">
                      <span class="flex items-center gap-[6px] text-[20px] text-[#64748b]">
                        <UserIcon class="text-[18px]" />
                        {{ meetingRecommendations[currentRecommendIndex]?.room?.capacity }}人
                      </span>
                      <span v-if="meetingRecommendations[currentRecommendIndex]?.room?.equipment?.length" class="text-[20px] text-[#64748b]">
                        {{ meetingRecommendations[currentRecommendIndex]?.room?.equipment?.slice(0, 2).join('、') }}
                      </span>
                    </div>
                    <div class="text-[20px] text-[#00A870] mb-[8px]">
                      🕐 {{ meetingRecommendations[currentRecommendIndex]?.availText }}
                    </div>
                    <div class="text-[18px] text-[#94a3b8]">
                      {{ meetingRecommendations[currentRecommendIndex]?.reason }}
                    </div>
                  </div>
                  <!-- 评分和按钮 -->
                  <div class="flex flex-col items-end gap-[12px]">
                    <div class="flex items-center gap-[4px]">
                      <span v-for="n in 5" :key="n" class="text-[18px]" :class="n <= Math.round(meetingRecommendations[currentRecommendIndex]?.matchScore || 0) ? 'text-[#FFB800]' : 'text-[#e5e5e5]'">★</span>
                    </div>
                    <t-button theme="primary" size="small" class="h-[44px] px-[20px] text-[20px] rounded-[12px] !bg-gradient-to-r !from-[#0052D9] !to-[#266FE8]" @click="handleQuickBook(meetingRecommendations[currentRecommendIndex])">
                      一键预定
                    </t-button>
                  </div>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>

      <!-- 功能入口区域 -->
      <div class="px-[32px] mb-[32px] pb-[150px]">
        <div class="flex items-center justify-between mb-[20px]">
          <div class="text-[28px] font-bold text-[#1e293b]">{{ userStore.isAdmin ? '管理功能' : '快捷服务' }}</div>
          <div class="text-[22px] text-[#94a3b8]">{{ menuList.length }} 项</div>
        </div>

        <div class="grid grid-cols-2 gap-[16px]">
          <div
            v-for="item in menuList"
            :key="item.id"
            class="menu-card relative bg-white rounded-[20px] p-[20px] shadow-lg shadow-slate-200/50 overflow-hidden active:scale-[0.97] transition-all cursor-pointer group border border-slate-100 hover:shadow-xl"
            @click="handleMenuClick(item)"
          >
            <div class="absolute top-[-10px] right-[-10px] w-[80px] h-[80px] opacity-[0.03] transform translate-x-[10px] -translate-y-[10px]">
              <component :is="item.icon" class="text-[100px]" :style="{ color: item.color }" />
            </div>
            <div
              class="w-[48px] h-[48px] rounded-[14px] flex items-center justify-center mb-[12px] relative z-10"
              :style="{ background: item.gradient, boxShadow: `0 8px 24px ${item.color}25` }"
            >
              <component :is="item.icon" class="text-[24px] text-white" />
            </div>
            <div class="text-[24px] font-semibold text-[#1e293b] mb-[4px] relative z-10">{{ item.title }}</div>
            <div class="text-[20px] text-[#94a3b8] leading-[1.4] relative z-10">{{ item.desc }}</div>
            <ChevronRightIcon class="absolute bottom-[16px] right-[12px] text-[20px] text-slate-300 group-hover:text-[#0052D9] group-hover:translate-x-1 transition-all" />
          </div>
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
  LogoutIcon,
  LightbulbIcon,
  UserIcon,
  MoneyIcon
} from "tdesign-icons-vue-next"
import { useUserStore } from "@/store"
import { showToast } from "@/utils/common/tools"
import {
  getTodos,
  toggleTodo,
  getAnnouncements,
  getUnreadAnnouncementCount,
  markAnnouncementRead,
  getTodayAttendance,
  checkIn,
  checkOut,
  getAttendanceConfigs
} from "@/api"

// 公告分类常量（从原 repository 复制）
const ANNOUNCEMENT_CATEGORIES = {
  policy: { label: '政策', color: '#0052D9' },
  activity: { label: '活动', color: '#7B61FF' },
  notice: { label: '通知', color: '#00A870' }
}
import { getMeetingRecommendations, refreshMeetingCache, getTripReminders, getExpenseReminders } from "@/utils/smartRecommend"
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

// 智能推荐
const meetingRecommendations = ref([])
const currentRecommendIndex = ref(0)
let recommendTimer = null

// 行程提醒
const tripReminders = ref([])
const dismissedReminders = ref(new Set())

// 报销提醒
const expenseReminders = ref([])
const dismissedExpenseReminders = ref(new Set())

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

// 可见的行程提醒（排除已关闭的）
const visibleTripReminders = computed(() => {
  return tripReminders.value.filter(r => !dismissedReminders.value.has(r.reminderId))
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
    try {
      const res = await getTodos()
      todos.value = res.data || []
    } catch (error) {
      console.error('加载待办失败:', error)
      todos.value = []
    }
  }
}

const loadAnnouncements = async () => {
  if (!userStore.isAdmin) {
    try {
      const res = await getAnnouncements()
      const all = res.data || []
      // 只取前5条用于滚动
      announcements.value = all.slice(0, 5)
      // 启动自动轮播
      startAnnouncementAutoPlay()
      // 获取未读数量
      try {
        const countRes = await getUnreadAnnouncementCount()
        unreadAnnouncementCount.value = countRes.data?.count || 0
      } catch (e) {
        console.error('获取未读公告数量失败:', e)
      }
      // 获取需要弹窗的重要公告（置顶公告）
      const important = all.filter(a => a.isTop)
      if (important.length > 0) {
        popupAnnouncements.value = important
        showAnnouncementPopup.value = true
      }
    } catch (error) {
      console.error('加载公告失败:', error)
      announcements.value = []
    }
  }
}

// 加载今日考勤记录
const loadTodayRecord = async () => {
  if (!userStore.isAdmin) {
    try {
      const res = await getTodayAttendance()
      todayRecord.value = res.data
    } catch (error) {
      console.error('加载考勤记录失败:', error)
      todayRecord.value = null
    }
    // 获取考勤配置
    try {
      const configRes = await getAttendanceConfigs()
      const configs = configRes.data || []
      const startTimeConfig = configs.find(c => c.key === 'workStartTime')
      const endTimeConfig = configs.find(c => c.key === 'workEndTime')
      workStartTime.value = startTimeConfig?.value || '09:00'
      workEndTime.value = endTimeConfig?.value || '18:00'
    } catch (error) {
      console.error('加载考勤配置失败:', error)
    }
  }
}

// 加载会议推荐
const loadMeetingRecommendations = async () => {
  if (!userStore.isAdmin) {
    try {
      meetingRecommendations.value = await getMeetingRecommendations(userStore.userId, { useCache: true })
      // 启动轮播
      if (meetingRecommendations.value.length > 1) {
        startRecommendAutoPlay()
      }
    } catch (error) {
      console.error('加载会议推荐失败:', error)
      meetingRecommendations.value = []
    }
  }
}

// 加载行程提醒
const loadTripReminders = async () => {
  if (!userStore.isAdmin) {
    try {
      tripReminders.value = await getTripReminders(userStore.userId)
      // 从本地存储加载已关闭的提醒
      const dismissed = localStorage.getItem('dismissedReminders')
      if (dismissed) {
        dismissedReminders.value = new Set(JSON.parse(dismissed))
      }
    } catch (error) {
      console.error('加载行程提醒失败:', error)
      tripReminders.value = []
    }
  }
}

// 关闭行程提醒
const handleDismissReminder = (reminderId) => {
  dismissedReminders.value.add(reminderId)
  localStorage.setItem('dismissedReminders', JSON.stringify([...dismissedReminders.value]))
}

// 加载报销提醒
const loadExpenseReminders = async () => {
  if (!userStore.isAdmin) {
    try {
      expenseReminders.value = await getExpenseReminders(userStore.userId)
      // 从本地存储加载已关闭的提醒
      const dismissed = localStorage.getItem('dismissedExpenseReminders')
      if (dismissed) {
        dismissedExpenseReminders.value = new Set(JSON.parse(dismissed))
      }
    } catch (error) {
      console.error('加载报销提醒失败:', error)
      expenseReminders.value = []
    }
  }
}

// 可见的报销提醒（排除已关闭的）
const visibleExpenseReminders = computed(() => {
  return expenseReminders.value.filter(r => !dismissedExpenseReminders.value.has(r.reminderId))
})

// 关闭报销提醒
const handleDismissExpenseReminder = (reminderId) => {
  dismissedExpenseReminders.value.add(reminderId)
  localStorage.setItem('dismissedExpenseReminders', JSON.stringify([...dismissedExpenseReminders.value]))
}

// 跳转到报销
const handleExpense = (reminder) => {
  router.push({ path: '/user/expense/create', query: { tripId: reminder.trip.id } })
}

// 推荐轮播
const startRecommendAutoPlay = () => {
  if (meetingRecommendations.value.length <= 1) return
  stopRecommendAutoPlay()
  recommendTimer = setInterval(() => {
    currentRecommendIndex.value = (currentRecommendIndex.value + 1) % meetingRecommendations.value.length
  }, 5000)
}

const stopRecommendAutoPlay = () => {
  if (recommendTimer) {
    clearInterval(recommendTimer)
    recommendTimer = null
  }
}

// 刷新推荐
const handleRefreshRecommend = async () => {
  refreshMeetingCache()
  meetingRecommendations.value = await getMeetingRecommendations(userStore.userId, { useCache: false })
  currentRecommendIndex.value = 0
  showToast('已刷新推荐')
}

// 一键预定
const handleQuickBook = (rec) => {
  const today = dayjs().format('YYYY-MM-DD')
  router.push({
    path: '/user/meeting/create',
    query: {
      roomId: rec.room.id,
      roomName: rec.room.name,
      date: today,
      startTime: rec.bestSlot?.start || '09:00',
      endTime: rec.bestSlot?.end || '10:00'
    }
  })
}

// 上班打卡
const handleCheckIn = async () => {
  if (todayRecord.value?.checkInTime) {
    showToast('今日已上班打卡')
    return
  }
  try {
    await checkIn()
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
    await checkOut()
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
  if (popupAnnouncements.value.length > 0 && popupAnnouncements.value[currentPopupIndex.value]) {
    // 标记当前公告已读
    try {
      await markAnnouncementRead(popupAnnouncements.value[currentPopupIndex.value].id)
    } catch (e) {
      // 忽略错误
    }
  }
  showAnnouncementPopup.value = false
}

// 查看弹窗公告详情
const viewPopupAnnouncement = async (item) => {
  if (item) {
    try {
      await markAnnouncementRead(item.id)
    } catch (e) {
      // 忽略错误
    }
  }
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
  // 使用 toggleTodo API
  const res = await toggleTodo(todo.id)
  if (res.data) {
    // 更新本地数据
    const index = todos.value.findIndex(t => t.id === todo.id)
    if (index !== -1) {
      todos.value[index] = res.data
    }
  }
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
  loadMeetingRecommendations()
  loadTripReminders()
  loadExpenseReminders()
})

onUnmounted(() => {
  stopAnnouncementAutoPlay()
  stopRecommendAutoPlay()
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

/* 推荐卡片轮播过渡 */
.recommend-slide-enter-active,
.recommend-slide-leave-active {
  transition: all 0.3s ease;
}

.recommend-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.recommend-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
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
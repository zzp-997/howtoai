<template>
  <Root title="消息中心" back-url="/user">
    <div class="min-h-screen bg-[#f5f7fa] pb-[150px]">
      <!-- 分类标签页 -->
      <div class="bg-white p-[16px] px-[32px]">
        <t-tabs v-model="activeTab" theme="line" :list="tabList" @change="handleTabChange">
          <template #label="{ tab }">
            <div class="flex items-center gap-[8px]">
              <span>{{ tab.label }}</span>
              <t-badge
                v-if="tab.unreadCount > 0"
                :count="tab.unreadCount"
                :max-count="99"
                size="small"
              />
            </div>
          </template>
        </t-tabs>
      </div>

      <!-- 操作栏：一键已读 -->
      <div class="flex items-center justify-between px-[32px] py-[16px]">
        <div class="text-[24px] text-[#666]">
          共 <span class="font-semibold text-[#333]">{{ totalCount }}</span> 条消息
          <span v-if="unreadTotal > 0" class="text-[#E34D59] ml-[8px]">({{ unreadTotal }} 条未读)</span>
        </div>
        <t-button
          v-if="unreadTotal > 0"
          theme="primary"
          variant="outline"
          size="small"
          class="h-[56px] px-[20px] text-[22px] rounded-[12px]"
          :loading="markingAllRead"
          @click="handleMarkAllRead"
        >
          全部标记已读
        </t-button>
      </div>

      <!-- 下拉刷新区域 -->
      <t-pull-down-refresh
        v-model="refreshing"
        :loading-texts="['下拉刷新', '松手刷新', '正在刷新']"
        @refresh="handleRefresh"
      >
        <div class="px-[32px]">
          <!-- 消息列表 -->
          <div v-if="messageList.length === 0 && !loading" class="text-center py-[80px]">
            <div class="w-[100px] h-[100px] mx-auto bg-[#f5f7fa] rounded-full flex items-center justify-center mb-[20px]">
              <NotificationIcon class="text-[60px] text-[#999]" />
            </div>
            <div class="text-[28px] text-[#999]">暂无消息</div>
          </div>

          <div v-else class="space-y-[12px]">
            <div
              v-for="msg in messageList"
              :key="msg.id"
              class="message-item bg-white rounded-[20px] p-[20px] shadow-sm flex items-start gap-[16px] cursor-pointer hover:shadow-md transition-shadow"
              @click="handleMessageClick(msg)"
            >
              <!-- 未读标识 -->
              <div class="relative flex-shrink-0 mt-[4px]">
                <div
                  :class="[
                    'w-[50px] h-[50px] rounded-[14px] flex items-center justify-center',
                    getMessageTypeBg(msg.type)
                  ]"
                >
                  <component :is="getMessageTypeIcon(msg.type)" class="text-[26px] text-white" />
                </div>
                <div
                  v-if="!msg.isRead"
                  class="absolute -top-[4px] -right-[4px] w-[16px] h-[16px] bg-[#E34D59] rounded-full border-[2px] border-white"
                ></div>
              </div>

              <!-- 消息内容 -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between mb-[8px]">
                  <div class="flex items-center gap-[8px]">
                    <span
                      :class="[
                        'text-[22px] px-[8px] py-[2px] rounded-[6px]',
                        getMessageTypeStyle(msg.type)
                      ]"
                    >
                      {{ getMessageTypeLabel(msg.type) }}
                    </span>
                    <span v-if="!msg.isRead" class="text-[18px] text-[#E34D59] font-medium">未读</span>
                  </div>
                  <div class="text-[22px] text-[#999]">{{ formatTime(msg.createdAt) }}</div>
                </div>

                <div
                  :class="[
                    'text-[28px] font-medium mb-[8px] line-clamp-1',
                    msg.isRead ? 'text-[#666]' : 'text-[#333]'
                  ]"
                >
                  {{ msg.title }}
                </div>

                <div
                  :class="[
                    'text-[24px] line-clamp-2',
                    msg.isRead ? 'text-[#999]' : 'text-[#666]'
                  ]"
                >
                  {{ msg.content }}
                </div>
              </div>

              <!-- 右侧箭头 -->
              <ChevronRightIcon class="text-[28px] text-[#ccc] flex-shrink-0 mt-[20px]" />
            </div>
          </div>

          <!-- 加载更多 -->
          <div v-if="hasMore && messageList.length > 0" class="py-[20px] text-center">
            <t-button
              variant="outline"
              size="small"
              :loading="loadingMore"
              class="h-[56px] px-[40px] text-[22px] rounded-[12px]"
              @click="loadMore"
            >
              加载更多
            </t-button>
          </div>

          <div v-if="!hasMore && messageList.length > 0" class="py-[20px] text-center text-[22px] text-[#999]">
            没有更多消息了
          </div>
        </div>
      </t-pull-down-refresh>
    </div>
  </Root>
</template>

<script setup>
import {
  NotificationIcon,
  CheckCircleIcon,
  CloseCircleIcon,
  TimeFilledIcon,
  ChevronRightIcon
} from 'tdesign-icons-vue-next'
import { getMessages, getUnreadCount, markMessageRead, markAllRead } from '@/api/message'
import { showToast } from '@/utils/common/tools'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

// 配置 dayjs
dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

const router = useRouter()

// 状态管理
const activeTab = ref('all')
const messageList = ref([])
const loading = ref(false)
const refreshing = ref(false)
const loadingMore = ref(false)
const markingAllRead = ref(false)
const page = ref(1)
const pageSize = 20
const hasMore = ref(false)
const totalCount = ref(0)

// 未读数量统计
const unreadTotal = ref(0)
const unreadCounts = ref({
  approval: 0,
  system: 0,
  task: 0
})

// 标签页配置
const tabList = computed(() => [
  { label: '全部', value: 'all', unreadCount: unreadTotal.value },
  { label: '审批通知', value: 'approval', unreadCount: unreadCounts.value.approval },
  { label: '系统通知', value: 'system', unreadCount: unreadCounts.value.system },
  { label: '任务通知', value: 'task', unreadCount: unreadCounts.value.task }
])

// 消息类型配置
const getMessageTypeLabel = (type) => {
  const labels = {
    approval: '审批',
    system: '系统',
    task: '任务'
  }
  return labels[type] || '通知'
}

const getMessageTypeBg = (type) => {
  const bgs = {
    approval: 'bg-gradient-to-br from-[#0052D9] to-[#266FE8]',
    system: 'bg-gradient-to-br from-[#7B61FF] to-[#9B8AFF]',
    task: 'bg-gradient-to-br from-[#00A870] to-[#2BA471]'
  }
  return bgs[type] || 'bg-gradient-to-br from-[#ED7B2F] to-[#F09143]'
}

const getMessageTypeStyle = (type) => {
  const styles = {
    approval: 'bg-[#E8F3FF] text-[#0052D9]',
    system: 'bg-[#F3E8FF] text-[#7B61FF]',
    task: 'bg-[#E8FFEF] text-[#00A870]'
  }
  return styles[type] || 'bg-[#FFF3E0] text-[#ED7B2F]'
}

const getMessageTypeIcon = (type) => {
  const icons = {
    approval: CheckCircleIcon,
    system: NotificationIcon,
    task: TimeFilledIcon
  }
  return icons[type] || NotificationIcon
}

// 时间格式化
const formatTime = (time) => {
  if (!time) return ''
  const date = dayjs(time)
  const now = dayjs()

  // 今天
  if (date.isSame(now, 'day')) {
    return date.format('HH:mm')
  }

  // 昨天
  if (date.isSame(now.subtract(1, 'day'), 'day')) {
    return '昨天 ' + date.format('HH:mm')
  }

  // 前天
  if (date.isSame(now.subtract(2, 'day'), 'day')) {
    return '前天 ' + date.format('HH:mm')
  }

  // 今年
  if (date.isSame(now, 'year')) {
    return date.format('MM-DD HH:mm')
  }

  // 其他年份
  return date.format('YYYY-MM-DD HH:mm')
}

// 加载消息列表
const loadMessages = async (isRefresh = false) => {
  if (isRefresh) {
    page.value = 1
    messageList.value = []
  }

  loading.value = true
  try {
    const params = {
      page: page.value,
      size: pageSize
    }

    // 根据当前分类筛选
    if (activeTab.value !== 'all') {
      params.type = activeTab.value
    }

    const res = await getMessages(params)
    const data = res.data || {}

    if (isRefresh) {
      messageList.value = data.list || []
    } else {
      messageList.value = [...messageList.value, ...(data.list || [])]
    }

    totalCount.value = data.total || 0
    hasMore.value = messageList.value.length < data.total
  } catch (error) {
    console.error('加载消息失败:', error)
    showToast('加载消息失败')
  } finally {
    loading.value = false
    refreshing.value = false
    loadingMore.value = false
  }
}

// 加载未读数量
const loadUnreadCount = async () => {
  try {
    const res = await getUnreadCount()
    const data = res.data || {}
    unreadTotal.value = data.total || 0
    unreadCounts.value = {
      approval: data.approval || 0,
      system: data.system || 0,
      task: data.task || 0
    }
  } catch (error) {
    console.error('获取未读数量失败:', error)
  }
}

// 下拉刷新
const handleRefresh = () => {
  refreshing.value = true
  page.value = 1
  Promise.all([loadMessages(true), loadUnreadCount()])
    .finally(() => {
      refreshing.value = false
    })
}

// 加载更多
const loadMore = () => {
  if (loadingMore.value || !hasMore.value) return
  loadingMore.value = true
  page.value++
  loadMessages()
}

// 标签页切换
const handleTabChange = (value) => {
  activeTab.value = value
  page.value = 1
  loadMessages(true)
}

// 点击消息
const handleMessageClick = async (msg) => {
  // 标记已读
  if (!msg.isRead) {
    try {
      await markMessageRead(msg.id)
      msg.isRead = true
      // 更新未读数量
      unreadTotal.value = Math.max(0, unreadTotal.value - 1)
      if (msg.type && unreadCounts.value[msg.type] !== undefined) {
        unreadCounts.value[msg.type] = Math.max(0, unreadCounts.value[msg.type] - 1)
      }
    } catch (error) {
      console.error('标记已读失败:', error)
    }
  }

  // 跳转到关联页面
  if (msg.link) {
    router.push(msg.link)
  }
}

// 一键全部已读
const handleMarkAllRead = async () => {
  if (markingAllRead.value) return

  markingAllRead.value = true
  try {
    // 根据当前选中类型标记已读
    const type = activeTab.value === 'all' ? undefined : activeTab.value
    await markAllRead(type)

    // 更新本地状态
    messageList.value.forEach(msg => {
      if (!type || msg.type === type) {
        msg.isRead = true
      }
    })

    // 清空未读数量
    if (!type) {
      unreadTotal.value = 0
      unreadCounts.value = { approval: 0, system: 0, task: 0 }
    } else {
      unreadTotal.value -= unreadCounts.value[type] || 0
      unreadCounts.value[type] = 0
    }

    showToast('已全部标记为已读')
  } catch (error) {
    console.error('标记已读失败:', error)
    showToast('操作失败，请重试')
  } finally {
    markingAllRead.value = false
  }
}

// 初始化
onMounted(() => {
  loadMessages(true)
  loadUnreadCount()
})
</script>

<style scoped>
.message-item {
  transition: all 0.2s ease;
}

.message-item:active {
  transform: scale(0.98);
}

/* 多行文本截断 */
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 夜间模式适配 */
[data-theme="dark"] .message-item {
  background: var(--bg-primary);
  border-color: var(--border-color);
}

[data-theme="dark"] .message-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
</style>

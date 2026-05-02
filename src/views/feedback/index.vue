<template>
  <Root title="意见反馈" back-url="/user">
    <div class="min-h-screen bg-[#f5f7fa] pb-[150px]">
      <!-- 顶部标签页 - 重新设计 -->
      <div class="bg-white sticky top-0 z-10 shadow-sm">
        <div class="px-[24px] pt-[16px] pb-[20px]">
          <div class="flex gap-[8px] bg-[#f5f7fa] p-[6px] rounded-[20px]">
            <div
              :class="[
                'flex-1 py-[16px] rounded-[16px] text-[26px] font-semibold text-center transition-all duration-300 cursor-pointer',
                activeTab === 'submit'
                  ? 'bg-gradient-to-r from-[#0052D9] to-[#266FE8] text-white shadow-lg shadow-[#0052D9]/30'
                  : 'text-[#666] hover:text-[#333]'
              ]"
              @click="activeTab = 'submit'"
            >
              提交反馈
            </div>
            <div
              :class="[
                'flex-1 py-[16px] rounded-[16px] text-[26px] font-semibold text-center transition-all duration-300 cursor-pointer',
                activeTab === 'list'
                  ? 'bg-gradient-to-r from-[#0052D9] to-[#266FE8] text-white shadow-lg shadow-[#0052D9]/30'
                  : 'text-[#666] hover:text-[#333]'
              ]"
              @click="activeTab = 'list'; loadFeedbackList()"
            >
              我的反馈
            </div>
          </div>
        </div>
      </div>

      <!-- 提交反馈表单 - 重新设计 -->
      <div v-show="activeTab === 'submit'" class="p-[24px]">
        <div class="bg-white rounded-[24px] shadow-lg shadow-slate-200/50 overflow-hidden">
          <!-- 卡片头部装饰 -->
          <div class="h-[8px] bg-gradient-to-r from-[#0052D9] via-[#7B61FF] to-[#00A870]"></div>

          <div class="p-[28px]">
            <!-- 标题区域 -->
            <div class="text-[30px] font-bold text-[#1e293b] mb-[24px] flex items-center gap-[12px]">
              <div class="w-[8px] h-[32px] rounded-[4px] bg-gradient-to-b from-[#0052D9] to-[#266FE8]"></div>
              反馈信息
            </div>

            <t-form :data="formData" :rules="formRules" ref="formRef" @submit="submitForm">
              <!-- 反馈类型 - 重新设计为选择卡片 -->
              <div class="mb-[28px]">
                <div class="text-[26px] font-medium text-[#333] mb-[14px]">反馈类型 <span class="text-[#E34D59]">*</span></div>
                <div class="grid grid-cols-3 gap-[12px]">
                  <div
                    v-for="type in feedbackTypes"
                    :key="type.value"
                    :class="[
                      'py-[16px] px-[12px] rounded-[16px] text-center text-[24px] font-medium cursor-pointer transition-all border-2',
                      formData.type === type.value
                        ? 'border-[#0052D9] bg-gradient-to-b from-[#EEF4FF] to-[#dbeafe] text-[#0052D9] shadow-md'
                        : 'border-[#e8ecf0] bg-[#f8fafc] text-[#666] hover:border-[#0052D9]/30 hover:bg-[#f0f7ff]'
                    ]"
                    @click="formData.type = type.value"
                  >
                    <div :class="['text-[32px] mb-[6px]', formData.type === type.value ? 'scale-110' : 'grayscale']">{{ type.icon }}</div>
                    <div>{{ type.label }}</div>
                  </div>
                </div>
              </div>

              <!-- 标题输入 -->
              <div class="mb-[28px]">
                <div class="text-[26px] font-medium text-[#333] mb-[14px]">
                  标题 <span class="text-[#E34D59]">*</span>
                </div>
                <t-input
                  v-model="formData.title"
                  placeholder="请输入简明扼要的问题描述..."
                  :maxlength="50"
                  show-limit-number
                  clearable
                  class="!h-[80px] !text-[26px] !bg-[#f8fafc] !rounded-[16px] !border !border-[#e8ecf0] focus:!border-[#0052D9]"
                />
              </div>

              <!-- 内容输入 -->
              <div class="mb-[28px]">
                <div class="text-[26px] font-medium text-[#333] mb-[14px]">
                  详细描述 <span class="text-[#E34D59]">*</span>
                </div>
                <t-textarea
                  v-model="formData.content"
                  placeholder="请详细描述您遇到的问题或建议...&#10;• 问题出现的场景&#10;• 期望的行为&#10;• 您的设备信息（如适用）"
                  :maxlength="500"
                  :autosize="{ minRows: 5, maxRows: 10 }"
                  indicator
                  class="!text-[26px] !bg-[#f8fafc] !rounded-[16px] !border !border-[#e8ecf0] focus:!border-[#0052D9]"
                />
              </div>

              <!-- 图片上传 - 重新设计 -->
              <div class="mb-[32px]">
                <div class="text-[26px] font-medium text-[#333] mb-[14px] flex items-center gap-[8px]">
                  上传图片
                  <span class="text-[22px] text-[#999] font-normal">(最多5张)</span>
                </div>
                <div class="flex flex-wrap gap-[16px]">
                  <div
                    v-for="(file, index) in fileList"
                    :key="index"
                    class="relative w-[150px] h-[150px] rounded-[20px] overflow-hidden shadow-lg group"
                  >
                    <img
                      :src="file.url || file.raw"
                      class="w-full h-full object-cover"
                    />
                    <!-- 删除按钮 -->
                    <div
                      class="absolute top-[8px] right-[8px] w-[36px] h-[36px] bg-[#E34D59] rounded-full flex items-center justify-center shadow-lg cursor-pointer opacity-0 group-hover:opacity-100 transition-all active:scale-95"
                      @click.stop="removeFile(index)"
                    >
                      <CloseIcon class="text-[20px] text-white" />
                    </div>
                    <!-- 图片索引 -->
                    <div class="absolute bottom-[8px] left-[8px] px-[10px] py-[4px] bg-black/50 rounded-[8px] text-[20px] text-white">
                      {{ index + 1 }}
                    </div>
                  </div>
                  <div
                    v-if="fileList.length < 5"
                    class="w-[150px] h-[150px] rounded-[20px] bg-[#f8fafc] border-2 border-dashed border-[#d1d5db] flex flex-col items-center justify-center cursor-pointer hover:border-[#0052D9] hover:bg-[#f0f7ff] transition-all active:scale-95"
                    @click="triggerUpload"
                  >
                    <div class="w-[64px] h-[64px] bg-[#e8ecf0] rounded-full flex items-center justify-center mb-[8px]">
                      <AddIcon class="text-[36px] text-[#666]" />
                    </div>
                    <span class="text-[22px] text-[#666]">添加图片</span>
                  </div>
                </div>
                <div class="text-[22px] text-[#999] mt-[12px] flex items-center gap-[6px]">
                  <InfoCircleIcon class="text-[20px]" />
                  每张图片不超过5MB，支持JPG、PNG格式
                </div>
              </div>

              <!-- 提交按钮 -->
              <t-button
                theme="primary"
                size="large"
                block
                :loading="submitting"
                :disabled="!formData.type || !formData.title || !formData.content"
                class="!h-[88px] !text-[28px] !rounded-[20px] !bg-gradient-to-r !from-[#0052D9] !to-[#266FE8] shadow-xl shadow-[#0052D9]/30 active:scale-[0.98] transition-transform"
                @click="submitForm"
              >
                <template #icon>
                  <SendIcon class="text-[28px]" />
                </template>
                提交反馈
              </t-button>
            </t-form>
          </div>
        </div>

        <!-- 底部提示卡片 -->
        <div class="mt-[20px] bg-white rounded-[20px] p-[20px] shadow-sm flex items-start gap-[14px]">
          <div class="w-[48px] h-[48px] bg-[#0052D9]/10 rounded-full flex items-center justify-center flex-shrink-0">
            <LightbulbIcon class="text-[26px] text-[#0052D9]" />
          </div>
          <div class="flex-1">
            <div class="text-[24px] font-medium text-[#333] mb-[6px]">反馈小贴士</div>
            <div class="text-[22px] text-[#666] leading-[1.6]">
              • 描述问题时，请提供具体的操作步骤<br/>
              • 建议反馈时，说明您期望的效果<br/>
              • 上传截图可以帮助我们更快定位问题
            </div>
          </div>
        </div>
      </div>

      <!-- 我的反馈列表 - 重新设计 -->
      <div v-show="activeTab === 'list'" class="p-[24px]">
        <!-- 筛选标签 - 横向滚动 -->
        <div class="flex gap-[12px] mb-[20px] overflow-x-auto [scrollbar-width:none] pb-[4px]">
          <div
            v-for="status in statusTabs"
            :key="status.value"
            :class="[
              'flex-shrink-0 px-[20px] h-[52px] rounded-full text-[24px] font-medium transition-all cursor-pointer flex items-center gap-[8px]',
              filterStatus === status.value
                ? 'bg-gradient-to-r from-[#0052D9] to-[#266FE8] text-white shadow-lg shadow-[#0052D9]/20'
                : 'bg-white text-[#666] shadow-sm hover:shadow-md active:scale-95'
            ]"
            @click="filterStatus = status.value"
          >
            <span>{{ status.label }}</span>
            <span v-if="status.count > 0" :class="['px-[8px] py-[2px] rounded-full text-[20px]', filterStatus === status.value ? 'bg-white/20' : 'bg-[#f0f0f0]']">
              {{ status.count }}
            </span>
          </div>
        </div>

        <!-- 反馈列表 -->
        <div v-if="filteredList.length > 0" class="space-y-[16px]">
          <div
            v-for="(item, index) in filteredList"
            :key="item.id"
            class="bg-white rounded-[24px] shadow-sm overflow-hidden cursor-pointer active:scale-[0.99] transition-all hover:shadow-lg"
            :style="{ animationDelay: `${index * 60}ms` }"
            @click="showDetail(item)"
          >
            <!-- 状态头部 - 重新设计 -->
            <div :class="['px-[20px] py-[16px] flex items-center justify-between', getStatusHeaderBg(item.status)]">
              <div class="flex items-center gap-[12px]">
                <div :class="['w-[10px] h-[10px] rounded-full', getStatusDotClass(item.status)]"></div>
                <span class="text-[24px] text-white/90 font-medium">{{ item.type }}</span>
              </div>
              <div class="flex items-center gap-[10px]">
                <div class="px-[14px] py-[6px] rounded-[10px] bg-white/20 text-[22px] text-white flex items-center gap-[6px]">
                  <div :class="['w-[6px] h-[6px] rounded-full', getStatusDotClass(item.status)]"></div>
                  {{ getStatusText(item.status) }}
                </div>
              </div>
            </div>

            <!-- 内容区 -->
            <div class="p-[20px]">
              <!-- 标题 -->
              <div class="text-[28px] font-semibold text-[#1e293b] mb-[10px] line-clamp-1">
                {{ item.title }}
              </div>

              <!-- 内容预览 -->
              <div class="text-[24px] text-[#64748b] mb-[16px] line-clamp-2 leading-relaxed">
                {{ item.content }}
              </div>

              <!-- 图片预览 - 网格展示 -->
              <div v-if="item.images && item.images.length > 0" class="flex gap-[10px] mb-[16px]">
                <img
                  v-for="(img, idx) in item.images.slice(0, 4)"
                  :key="idx"
                  :src="img"
                  class="w-[90px] h-[90px] rounded-[14px] object-cover shadow-sm"
                />
                <div
                  v-if="item.images.length > 4"
                  class="w-[90px] h-[90px] rounded-[14px] bg-[#f5f7fa] flex items-center justify-center text-[24px] text-[#666] font-medium"
                >
                  +{{ item.images.length - 4 }}
                </div>
              </div>

              <!-- 底部信息栏 -->
              <div class="flex items-center justify-between pt-[14px] border-t border-[#f0f0f0]">
                <div class="flex items-center gap-[6px] text-[22px] text-[#94a3b8]">
                  <TimeIcon class="text-[20px]" />
                  {{ formatDate(item.createdAt) }}
                </div>
                <div v-if="item.replyCount > 0" class="flex items-center gap-[6px] text-[#0052D9] text-[24px] font-medium">
                  <ChatIcon class="text-[22px]" />
                  {{ item.replyCount }} 条回复
                  <ChevronRightIcon class="text-[20px]" />
                </div>
                <div v-else class="text-[22px] text-[#cbd5e1]">
                  点击查看详情
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 - 重新设计 -->
        <div v-else class="text-center py-[80px]">
          <div class="w-[160px] h-[160px] mx-auto bg-gradient-to-br from-[#f0f7ff] to-[#e0e7ff] rounded-full flex items-center justify-center mb-[24px] shadow-lg">
            <div class="w-[120px] h-[120px] bg-white rounded-full flex items-center justify-center">
              <Edit1Icon class="text-[64px] text-[#7B61FF]" />
            </div>
          </div>
          <div class="text-[30px] font-semibold text-[#64748b] mb-[8px]">暂无反馈记录</div>
          <div class="text-[24px] text-[#94a3b8]">遇到问题或有好建议？期待您的反馈</div>
          <div
            class="mt-[24px] inline-flex items-center gap-[8px] px-[24px] py-[12px] bg-gradient-to-r from-[#0052D9] to-[#266FE8] text-white rounded-full text-[24px] font-medium cursor-pointer active:scale-95 transition-all shadow-lg shadow-[#0052D9]/20"
            @click="activeTab = 'submit'"
          >
            <EditIcon class="text-[24px]" />
            立即反馈
          </div>
        </div>
      </div>

      <!-- 类型选择弹窗 -->
      <t-action-sheet v-model="showTypeSheet" :items="typeOptions" @selected="handleTypeSelect" />

      <!-- 反馈详情弹窗 - 重新设计 -->
      <t-popup v-model="showDetailPopup" placement="bottom" round>
        <div class="bg-white rounded-t-[32px] max-h-[90vh] overflow-hidden flex flex-col">
          <!-- 弹窗头部 -->
          <div class="p-[24px] flex items-center justify-between flex-shrink-0 border-b border-[#f0f0f0]">
            <div class="text-[30px] font-bold text-[#1e293b]">反馈详情</div>
            <div
              class="w-[48px] h-[48px] bg-[#f5f7fa] rounded-full flex items-center justify-center cursor-pointer active:scale-95 transition-all hover:bg-[#e8ecf0]"
              @click="showDetailPopup = false"
            >
              <CloseIcon class="text-[24px] text-[#666]" />
            </div>
          </div>

          <!-- 弹窗内容 -->
          <div class="flex-1 overflow-auto p-[24px]" v-if="currentFeedback">
            <!-- 状态和类型 -->
            <div class="flex items-center gap-[12px] mb-[20px]">
              <div :class="['px-[16px] py-[8px] rounded-[12px] text-[24px] text-white flex items-center gap-[8px]', getStatusHeaderBg(currentFeedback.status)]">
                <div :class="['w-[8px] h-[8px] rounded-full', getStatusDotClass(currentFeedback.status)]"></div>
                {{ getStatusText(currentFeedback.status) }}
              </div>
              <span class="text-[24px] text-[#64748b]">{{ currentFeedback.type }}</span>
            </div>

            <!-- 标题 -->
            <div class="text-[32px] font-bold text-[#1e293b] mb-[16px] leading-tight">
              {{ currentFeedback.title }}
            </div>

            <!-- 提交时间 -->
            <div class="flex items-center gap-[8px] text-[22px] text-[#94a3b8] mb-[24px]">
              <TimeIcon class="text-[20px]" />
              提交于 {{ formatDate(currentFeedback.createdAt) }}
            </div>

            <!-- 内容 -->
            <div class="bg-[#f8fafc] rounded-[20px] p-[20px] mb-[24px]">
              <div class="text-[26px] text-[#334155] leading-[1.8] whitespace-pre-wrap">
                {{ currentFeedback.content }}
              </div>
            </div>

            <!-- 图片网格 -->
            <div v-if="currentFeedback.images && currentFeedback.images.length > 0" class="mb-[28px]">
              <div class="text-[24px] font-medium text-[#333] mb-[12px]">附件图片 ({{ currentFeedback.images.length }})</div>
              <div class="flex flex-wrap gap-[12px]">
                <img
                  v-for="(img, idx) in currentFeedback.images"
                  :key="idx"
                  :src="img"
                  class="w-[140px] h-[140px] rounded-[16px] object-cover shadow-sm cursor-pointer active:scale-95 transition-all"
                  @click="previewImage(currentFeedback.images, idx)"
                />
              </div>
            </div>

            <!-- 回复列表 - 重新设计 -->
            <div v-if="replies.length > 0" class="border-t border-[#f0f0f0] pt-[24px]">
              <div class="text-[26px] font-bold text-[#1e293b] mb-[20px] flex items-center gap-[10px]">
                <div class="w-[6px] h-[24px] rounded-[3px] bg-gradient-to-b from-[#7B61FF] to-[#9B8AFF]"></div>
                回复记录 ({{ replies.length }})
              </div>
              <div class="space-y-[16px]">
                <div
                  v-for="reply in replies"
                  :key="reply.id"
                  class="bg-gradient-to-br from-[#f8fafc] to-[#f0f7ff] rounded-[20px] p-[20px]"
                >
                  <div class="flex items-center gap-[12px] mb-[12px]">
                    <t-avatar :image="reply.userAvatar" size="48px" class="shadow-sm">{{ reply.userName?.charAt(0) }}</t-avatar>
                    <div class="flex-1">
                      <div class="flex items-center gap-[8px]">
                        <span class="text-[26px] text-[#333] font-medium">{{ reply.userName }}</span>
                        <t-tag
                          v-if="reply.isAdmin"
                          theme="primary"
                          size="small"
                          class="!rounded-[8px] !text-[20px] !px-[10px]"
                        >
                          官方
                        </t-tag>
                      </div>
                      <div class="text-[20px] text-[#94a3b8]">{{ formatDate(reply.createdAt) }}</div>
                    </div>
                  </div>
                  <div class="text-[24px] text-[#475569] leading-[1.7] pl-[60px]">
                    {{ reply.content }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 回复输入框 - 固定底部 -->
          <div class="p-[20px] border-t border-[#f0f0f0] flex-shrink-0 bg-[#fafbfc]">
            <div class="flex gap-[12px]">
              <t-input
                v-model="replyContent"
                placeholder="输入回复内容..."
                class="flex-1 !h-[72px] !text-[26px] !bg-white !rounded-[16px] !border !border-[#e8ecf0]"
                :maxlength="500"
              />
              <t-button
                theme="primary"
                size="large"
                :loading="replying"
                :disabled="!replyContent.trim()"
                class="!w-[120px] !h-[72px] !rounded-[16px] !bg-gradient-to-r !from-[#0052D9] !to-[#266FE8] shadow-lg shadow-[#0052D9]/20"
                @click="handleReply"
              >
                <template #icon>
                  <SendIcon class="text-[24px]" />
                </template>
              </t-button>
            </div>
          </div>
        </div>
      </t-popup>

      <!-- 图片预览 -->
      <t-image-viewer
        v-model:visible="showImagePreview"
        :images="previewImages"
        :initial-index="previewIndex"
      />
    </div>
  </Root>
</template>

<script setup>
import {
  ChevronDownIcon,
  CloseIcon,
  AddIcon,
  ChatIcon,
  InfoCircleIcon,
  TimeIcon,
  SendIcon,
  ChevronRightIcon,
  EditIcon,
  Edit1Icon,
  LightbulbIcon
} from 'tdesign-icons-vue-next'
import {
  getMyFeedbacks,
  submitFeedback,
  getFeedbackDetail,
  getFeedbackReplies,
  replyFeedback,
  FEEDBACK_STATUS,
  FEEDBACK_STATUS_TEXT
} from '@/api/feedback'
import { showToast, showSuccessToast, showErrorToast } from '@/utils/common/tools'
import dayjs from 'dayjs'

// 反馈类型配置
const feedbackTypes = [
  { label: '功能建议', value: '功能建议', icon: '💡' },
  { label: '问题反馈', value: '问题反馈', icon: '🐛' },
  { label: '其他', value: '其他', icon: '📝' }
]

// 状态
const activeTab = ref('submit')
const filterStatus = ref('all')
const submitting = ref(false)
const replying = ref(false)
const showDetailPopup = ref(false)
const showTypeSheet = ref(false)
const showImagePreview = ref(false)
const previewImages = ref([])
const previewIndex = ref(0)
const fileInput = ref(null)

// 表单数据
const formRef = ref(null)
const formData = ref({
  type: '',
  title: '',
  content: ''
})
const fileList = ref([])

// 反馈列表
const feedbackList = ref([])
const currentFeedback = ref(null)
const replies = ref([])
const replyContent = ref('')

// 表单校验规则
const formRules = {
  type: [{ required: true, message: '请选择反馈类型', trigger: 'blur' }],
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' },
    { min: 2, max: 50, message: '标题长度为2-50个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入内容', trigger: 'blur' },
    { min: 10, max: 500, message: '内容长度为10-500个字符', trigger: 'blur' }
  ]
}

// 反馈类型选项（ActionSheet格式）
const typeOptions = [
  { label: '功能建议', value: '功能建议' },
  { label: '问题反馈', value: '问题反馈' },
  { label: '其他', value: '其他' }
]

// 状态筛选选项
const statusTabs = computed(() => [
  { label: '全部', value: 'all', count: feedbackList.value.length },
  { label: '待处理', value: FEEDBACK_STATUS.PENDING, count: feedbackList.value.filter(f => f.status === FEEDBACK_STATUS.PENDING).length },
  { label: '处理中', value: FEEDBACK_STATUS.PROCESSING, count: feedbackList.value.filter(f => f.status === FEEDBACK_STATUS.PROCESSING).length },
  { label: '已回复', value: FEEDBACK_STATUS.REPLIED, count: feedbackList.value.filter(f => f.status === FEEDBACK_STATUS.REPLIED).length },
  { label: '已关闭', value: FEEDBACK_STATUS.CLOSED, count: feedbackList.value.filter(f => f.status === FEEDBACK_STATUS.CLOSED).length }
])

// 计算筛选后的列表
const filteredList = computed(() => {
  if (filterStatus.value === 'all') {
    return feedbackList.value
  }
  return feedbackList.value.filter(item => item.status === filterStatus.value)
})

// 获取状态头部背景
const getStatusHeaderBg = (status) => {
  const bgs = {
    [FEEDBACK_STATUS.PENDING]: 'bg-gradient-to-r from-[#ED7B2F] to-[#F09143]',
    [FEEDBACK_STATUS.PROCESSING]: 'bg-gradient-to-r from-[#0052D9] to-[#266FE8]',
    [FEEDBACK_STATUS.REPLIED]: 'bg-gradient-to-r from-[#00A870] to-[#2BA471]',
    [FEEDBACK_STATUS.CLOSED]: 'bg-gradient-to-r from-[#94a3b8] to-[#cbd5e1]'
  }
  return bgs[status] || 'bg-gradient-to-r from-[#94a3b8] to-[#cbd5e1]'
}

// 获取状态圆点样式
const getStatusDotClass = (status) => {
  const dots = {
    [FEEDBACK_STATUS.PENDING]: 'bg-white',
    [FEEDBACK_STATUS.PROCESSING]: 'bg-white animate-pulse',
    [FEEDBACK_STATUS.REPLIED]: 'bg-white',
    [FEEDBACK_STATUS.CLOSED]: 'bg-white/60'
  }
  return dots[status] || 'bg-white/60'
}

// 获取状态文本
const getStatusText = (status) => {
  return FEEDBACK_STATUS_TEXT[status] || '未知'
}

// 格式化日期
const formatDate = (date) => {
  const d = dayjs(date)
  const now = dayjs()
  const diff = now.diff(d, 'day')

  if (diff === 0) {
    return `今天 ${d.format('HH:mm')}`
  } else if (diff === 1) {
    return `昨天 ${d.format('HH:mm')}`
  } else if (diff < 7) {
    return `${diff}天前`
  } else {
    return d.format('YYYY-MM-DD HH:mm')
  }
}

// 处理类型选择（ActionSheet）
const handleTypeSelect = (index) => {
  formData.value.type = typeOptions[index]?.value || ''
}

// 触发文件上传
const triggerUpload = () => {
  if (fileList.value.length >= 5) {
    showErrorToast('最多上传5张图片')
    return
  }
  fileInput.value?.click()
}

// 处理文件选择
const handleFileChange = (e) => {
  const files = e.target.files
  if (!files) return

  for (let i = 0; i < files.length; i++) {
    if (fileList.value.length >= 5) {
      showErrorToast('最多上传5张图片')
      break
    }

    const file = files[i]
    if (file.size > 5 * 1024 * 1024) {
      showErrorToast(`文件 ${file.name} 超过5MB限制`)
      continue
    }

    // 将文件转为 base64 用于预览
    const reader = new FileReader()
    reader.onload = (e) => {
      fileList.value.push({
        url: e.target.result,
        raw: file
      })
    }
    reader.readAsDataURL(file)
  }

  // 清空 input 以便再次选择
  e.target.value = ''
}

// 移除文件
const removeFile = (index) => {
  fileList.value.splice(index, 1)
}

// 提交表单
const submitForm = async () => {
  const valid = await formRef.value.validate()
  if (valid !== true) return

  submitting.value = true
  try {
    // 处理图片
    const images = fileList.value
      .filter(f => f.url)
      .map(f => f.url)

    await submitFeedback({
      type: formData.value.type,
      title: formData.value.title,
      content: formData.value.content,
      images: images.length > 0 ? JSON.stringify(images) : null
    })

    showSuccessToast('提交成功，感谢您的反馈')
    // 重置表单
    formData.value = { type: '', title: '', content: '' }
    fileList.value = []
    // 切换到列表页
    activeTab.value = 'list'
    loadFeedbackList()
  } catch (error) {
    showErrorToast(error.message || '提交失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

// 加载反馈列表
const loadFeedbackList = async () => {
  try {
    const res = await getMyFeedbacks({ page: 1, pageSize: 100 })
    feedbackList.value = res.data?.list || res.data || []
  } catch (error) {
    console.error('加载反馈列表失败:', error)
  }
}

// 显示详情
const showDetail = async (item) => {
  currentFeedback.value = item
  showDetailPopup.value = true
  replyContent.value = ''

  // 加载详情和回复
  try {
    const [detailRes, repliesRes] = await Promise.all([
      getFeedbackDetail(item.id),
      getFeedbackReplies(item.id, { page: 1, pageSize: 100 })
    ])
    currentFeedback.value = detailRes.data || item
    replies.value = repliesRes.data?.list || repliesRes.data || []
  } catch (error) {
    console.error('加载详情失败:', error)
  }
}

// 提交回复
const handleReply = async () => {
  if (!replyContent.value.trim()) return

  replying.value = true
  try {
    await replyFeedback(currentFeedback.value.id, {
      content: replyContent.value.trim()
    })
    showToast('回复成功')
    replyContent.value = ''
    // 刷新回复列表
    const repliesRes = await getFeedbackReplies(currentFeedback.value.id, { page: 1, pageSize: 100 })
    replies.value = repliesRes.data?.list || repliesRes.data || []
    // 刷新列表
    loadFeedbackList()
  } catch (error) {
    showErrorToast(error.message || '回复失败')
  } finally {
    replying.value = false
  }
}

// 预览图片
const previewImage = (images, index) => {
  previewImages.value = images
  previewIndex.value = index
  showImagePreview.value = true
}

// 页面加载时获取列表
onMounted(() => {
  loadFeedbackList()
})
</script>

<style scoped>
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

/* 列表卡片入场动画 */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.bg-white.rounded-\[24px\] {
  animation: slideInUp 0.3s ease-out forwards;
}

/* 脉冲动画 */
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

/* 表单项样式优化 */
:deep(.t-form-item) {
  margin-bottom: 24px;
}

:deep(.t-form-item__label) {
  font-size: 26px;
  font-weight: 500;
  color: #333;
  margin-bottom: 12px;
}

:deep(.t-input) {
  font-size: 26px;
}

:deep(.t-input__inner) {
  font-size: 26px;
}

:deep(.t-textarea) {
  font-size: 26px;
}

:deep(.t-textarea__inner) {
  font-size: 26px;
}

/* 输入框焦点效果 */
:deep(.t-input--focus),
:deep(.t-textarea--focus) {
  border-color: #0052D9 !important;
}

/* 触摸反馈 */
.active\:scale-\[0\.99\] {
  transform: scale(0.99);
}

.active\:scale-\[0\.98\] {
  transform: scale(0.98);
}

.active\:scale-95:active {
  transform: scale(0.95);
}

/* 悬停效果 */
.hover\:shadow-lg:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.hover\:shadow-md:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.hover\:border-\[\#0052D9\]\/30:hover {
  border-color: rgba(0, 82, 217, 0.3);
}

.hover\:bg-\[f0f7ff\]:hover {
  background-color: #f0f7ff;
}

.hover\:bg-\[e8ecf0\]:hover {
  background-color: #e8ecf0;
}

/* 图片悬停效果 */
.group:hover .group-hover\:opacity-100 {
  opacity: 1;
}

/* 渐变文字 */
.text-transparent {
  -webkit-background-clip: text;
  background-clip: text;
}

/* 状态指示点动画 */
.bg-white.animate-pulse {
  animation: statusPulse 1.5s ease-in-out infinite;
}

@keyframes statusPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.7;
  }
}
</style>

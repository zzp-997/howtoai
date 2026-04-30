<template>
  <Root title="意见反馈" back-url="/user">
    <div class="min-h-screen bg-[var(--bg-secondary)] pb-[150px]">
      <!-- 顶部标签页 -->
      <div class="bg-[var(--bg-primary)]">
        <t-tabs v-model="activeTab" :space-evenly="true" @change="handleTabChange">
          <t-tab-panel value="submit" label="提交反馈" />
          <t-tab-panel value="list" label="我的反馈" />
        </t-tabs>
      </div>

      <!-- 提交反馈表单 -->
      <div v-show="activeTab === 'submit'" class="p-[24px]">
        <div class="bg-[var(--bg-primary)] rounded-[24px] shadow-sm p-[24px]">
          <t-form :data="formData" :rules="formRules" ref="formRef" @submit="handleSubmit">
            <!-- 反馈类型 -->
            <t-form-item label="反馈类型" name="type">
              <t-picker
                v-model="formData.type"
                :columns="typeOptions"
                @confirm="handleTypeConfirm"
              >
                <template #suffixIcon>
                  <ChevronDownIcon class="text-[24px] text-[var(--text-tertiary)]" />
                </template>
                <template #default="{ value }">
                  <div class="w-full text-[28px] text-[var(--text-primary)] text-right">
                    {{ formData.type || '请选择反馈类型' }}
                  </div>
                </template>
              </t-picker>
            </t-form-item>

            <!-- 标题 -->
            <t-form-item label="标题" name="title">
              <t-input
                v-model="formData.title"
                placeholder="请输入标题"
                :maxlength="50"
                clearable
              />
            </t-form-item>

            <!-- 内容 -->
            <t-form-item label="内容" name="content">
              <t-textarea
                v-model="formData.content"
                placeholder="请详细描述您的问题或建议..."
                :maxlength="500"
                :autosize="{ minRows: 4, maxRows: 8 }"
                indicator
              />
            </t-form-item>

            <!-- 图片上传 -->
            <t-form-item label="图片（可选）">
              <div class="w-full">
                <t-upload
                  v-model="fileList"
                  multiple
                  :max="5"
                  :size-limit="{ size: 5, unit: 'MB' }"
                  accept="image/*"
                  :request-method="handleUpload"
                  @validate="handleUploadValidate"
                >
                  <template #file-list-display>
                    <div class="flex flex-wrap gap-[16px]">
                      <div
                        v-for="(file, index) in fileList"
                        :key="index"
                        class="relative w-[160px] h-[160px] rounded-[12px] overflow-hidden"
                      >
                        <img
                          :src="file.url || file.raw"
                          class="w-full h-full object-cover"
                        />
                        <div
                          class="absolute top-[8px] right-[8px] w-[32px] h-[32px] bg-black/50 rounded-full flex items-center justify-center"
                          @click.stop="removeFile(index)"
                        >
                          <CloseIcon class="text-[20px] text-white" />
                        </div>
                      </div>
                      <div
                        v-if="fileList.length < 5"
                        class="w-[160px] h-[160px] rounded-[12px] border-[2px] border-dashed border-[var(--border-color)] flex flex-col items-center justify-center"
                      >
                        <AddIcon class="text-[40px] text-[var(--text-tertiary)]" />
                        <span class="text-[22px] text-[var(--text-tertiary)] mt-[8px]">添加图片</span>
                      </div>
                    </div>
                  </template>
                </t-upload>
                <div class="text-[22px] text-[var(--text-tertiary)] mt-[12px]">
                  最多上传5张，每张不超过5MB
                </div>
              </div>
            </t-form-item>

            <!-- 提交按钮 -->
            <div class="mt-[32px]">
              <t-button
                theme="primary"
                size="large"
                block
                :loading="submitting"
                @click="submitForm"
              >
                提交反馈
              </t-button>
            </div>
          </t-form>
        </div>
      </div>

      <!-- 我的反馈列表 -->
      <div v-show="activeTab === 'list'" class="p-[24px]">
        <!-- 筛选条件 -->
        <div class="flex gap-[12px] mb-[24px] overflow-x-auto pb-[8px]">
          <div
            v-for="status in statusTabs"
            :key="status.value"
            :class="[
              'flex-shrink-0 px-[24px] py-[12px] rounded-[20px] text-[24px] transition-all',
              filterStatus === status.value
                ? 'bg-[#0052D9] text-white'
                : 'bg-[var(--bg-primary)] text-[var(--text-secondary)]'
            ]"
            @click="filterStatus = status.value"
          >
            {{ status.label }}
          </div>
        </div>

        <!-- 反馈列表 -->
        <div v-if="feedbackList.length > 0">
          <div
            v-for="item in filteredList"
            :key="item.id"
            class="bg-[var(--bg-primary)] rounded-[24px] shadow-sm p-[24px] mb-[16px]"
            @click="showDetail(item)"
          >
            <!-- 顶部：类型 + 状态 -->
            <div class="flex items-center justify-between mb-[12px]">
              <span class="text-[24px] text-[var(--text-tertiary)]">{{ item.type }}</span>
              <t-tag :theme="getStatusTheme(item.status)" variant="light" size="medium">
                {{ getStatusText(item.status) }}
              </t-tag>
            </div>

            <!-- 标题 -->
            <div class="text-[30px] font-medium text-[var(--text-primary)] mb-[12px] line-clamp-2">
              {{ item.title }}
            </div>

            <!-- 内容预览 -->
            <div class="text-[26px] text-[var(--text-tertiary)] mb-[16px] line-clamp-2">
              {{ item.content }}
            </div>

            <!-- 图片预览 -->
            <div v-if="item.images && item.images.length > 0" class="flex gap-[8px] mb-[16px]">
              <img
                v-for="(img, idx) in item.images.slice(0, 3)"
                :key="idx"
                :src="img"
                class="w-[120px] h-[120px] rounded-[8px] object-cover"
              />
              <div
                v-if="item.images.length > 3"
                class="w-[120px] h-[120px] rounded-[8px] bg-[var(--bg-secondary)] flex items-center justify-center text-[26px] text-[var(--text-tertiary)]"
              >
                +{{ item.images.length - 3 }}
              </div>
            </div>

            <!-- 底部：时间 + 回复数 -->
            <div class="flex items-center justify-between text-[22px] text-[var(--text-tertiary)]">
              <span>{{ formatDate(item.createdAt) }}</span>
              <span v-if="item.replyCount > 0" class="flex items-center gap-[4px]">
                <ChatIcon class="text-[20px]" />
                {{ item.replyCount }} 条回复
              </span>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="text-center py-[80px]">
          <InfoCircleIcon class="text-[80px] text-[var(--text-tertiary)] mb-[24px]" />
          <div class="text-[28px] text-[var(--text-tertiary)]">暂无反馈记录</div>
          <div class="text-[24px] text-[var(--text-tertiary)] mt-[8px]">如有问题或建议，欢迎提交反馈</div>
        </div>
      </div>
    </div>

    <!-- 反馈详情弹窗 -->
    <t-popup v-model="showDetailPopup" placement="bottom" round>
      <div class="bg-[var(--bg-primary)] rounded-t-[24px] max-h-[80vh] overflow-hidden flex flex-col">
        <!-- 弹窗头部 -->
        <div class="p-[24px] border-b border-[var(--border-color)] flex items-center justify-between flex-shrink-0">
          <div class="text-[32px] font-semibold text-[var(--text-primary)]">反馈详情</div>
          <CloseIcon class="text-[32px] text-[var(--text-tertiary)]" @click="showDetailPopup = false" />
        </div>

        <!-- 弹窗内容 -->
        <div class="flex-1 overflow-auto p-[24px]" v-if="currentFeedback">
          <!-- 状态和类型 -->
          <div class="flex items-center gap-[12px] mb-[16px]">
            <t-tag :theme="getStatusTheme(currentFeedback.status)" variant="light" size="medium">
              {{ getStatusText(currentFeedback.status) }}
            </t-tag>
            <span class="text-[24px] text-[var(--text-tertiary)]">{{ currentFeedback.type }}</span>
          </div>

          <!-- 标题 -->
          <div class="text-[32px] font-medium text-[var(--text-primary)] mb-[16px]">
            {{ currentFeedback.title }}
          </div>

          <!-- 内容 -->
          <div class="text-[28px] text-[var(--text-primary)] leading-[1.6] mb-[16px] whitespace-pre-wrap">
            {{ currentFeedback.content }}
          </div>

          <!-- 图片 -->
          <div v-if="currentFeedback.images && currentFeedback.images.length > 0" class="flex flex-wrap gap-[12px] mb-[24px]">
            <img
              v-for="(img, idx) in currentFeedback.images"
              :key="idx"
              :src="img"
              class="w-[200px] h-[200px] rounded-[12px] object-cover"
              @click="previewImage(currentFeedback.images, idx)"
            />
          </div>

          <!-- 时间 -->
          <div class="text-[24px] text-[var(--text-tertiary)] mb-[32px]">
            提交于 {{ formatDate(currentFeedback.createdAt) }}
          </div>

          <!-- 回复列表 -->
          <div v-if="replies.length > 0" class="border-t border-[var(--border-color)] pt-[24px]">
            <div class="text-[28px] font-medium text-[var(--text-primary)] mb-[16px]">回复记录</div>
            <div
              v-for="reply in replies"
              :key="reply.id"
              class="mb-[24px] last:mb-0"
            >
              <div class="flex items-center gap-[12px] mb-[8px]">
                <t-avatar :image="reply.userAvatar" size="48px">{{ reply.userName?.charAt(0) }}</t-avatar>
                <div>
                  <div class="text-[26px] text-[var(--text-primary)]">{{ reply.userName }}</div>
                  <div class="text-[22px] text-[var(--text-tertiary)]">{{ formatDate(reply.createdAt) }}</div>
                </div>
                <t-tag
                  v-if="reply.isAdmin"
                  theme="primary"
                  variant="outline"
                  size="small"
                  class="ml-[8px]"
                >
                  官方
                </t-tag>
              </div>
              <div class="text-[26px] text-[var(--text-primary)] leading-[1.6] ml-[60px]">
                {{ reply.content }}
              </div>
            </div>
          </div>
        </div>

        <!-- 回复输入框 -->
        <div class="p-[24px] border-t border-[var(--border-color)] flex-shrink-0">
          <div class="flex gap-[12px]">
            <t-input
              v-model="replyContent"
              placeholder="输入回复内容..."
              class="flex-1"
              :maxlength="500"
            />
            <t-button
              theme="primary"
              :loading="replying"
              :disabled="!replyContent.trim()"
              @click="handleReply"
            >
              发送
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
  </Root>
</template>

<script setup>
import {
  ChevronDownIcon,
  CloseIcon,
  AddIcon,
  ChatIcon,
  InfoCircleIcon
} from 'tdesign-icons-vue-next'
import {
  getMyFeedbacks,
  submitFeedback,
  getFeedbackDetail,
  getFeedbackReplies,
  replyFeedback,
  FEEDBACK_STATUS,
  FEEDBACK_STATUS_TEXT,
  FEEDBACK_TYPE
} from '@/api/feedback'
import { showToast, showSuccessToast, showErrorToast } from '@/utils/common/tools'
import dayjs from 'dayjs'

// 状态
const activeTab = ref('submit')
const filterStatus = ref('all')
const submitting = ref(false)
const replying = ref(false)
const showDetailPopup = ref(false)
const showImagePreview = ref(false)
const previewImages = ref([])
const previewIndex = ref(0)

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

// 反馈类型选项
const typeOptions = [
  { label: '功能建议', value: '功能建议' },
  { label: '问题反馈', value: '问题反馈' },
  { label: '其他', value: '其他' }
]

// 状态筛选选项
const statusTabs = [
  { label: '全部', value: 'all' },
  { label: '待处理', value: FEEDBACK_STATUS.PENDING },
  { label: '处理中', value: FEEDBACK_STATUS.PROCESSING },
  { label: '已回复', value: FEEDBACK_STATUS.REPLIED },
  { label: '已关闭', value: FEEDBACK_STATUS.CLOSED }
]

// 计算筛选后的列表
const filteredList = computed(() => {
  if (filterStatus.value === 'all') {
    return feedbackList.value
  }
  return feedbackList.value.filter(item => item.status === filterStatus.value)
})

// 获取状态主题
const getStatusTheme = (status) => {
  const themes = {
    [FEEDBACK_STATUS.PENDING]: 'warning',
    [FEEDBACK_STATUS.PROCESSING]: 'primary',
    [FEEDBACK_STATUS.REPLIED]: 'success',
    [FEEDBACK_STATUS.CLOSED]: 'default'
  }
  return themes[status] || 'default'
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

// 处理类型选择
const handleTypeConfirm = (value) => {
  formData.value.type = value
}

// 处理标签页切换
const handleTabChange = (value) => {
  if (value === 'list') {
    loadFeedbackList()
  }
}

// 自定义上传处理
const handleUpload = (file) => {
  return new Promise((resolve) => {
    // 将文件转为 base64 用于预览
    const reader = new FileReader()
    reader.onload = (e) => {
      resolve({
        status: 'success',
        response: { url: e.target.result }
      })
    }
    reader.readAsDataURL(file.raw)
  })
}

// 上传验证
const handleUploadValidate = ({ type, file }) => {
  if (type === 'FILE_EXCEEDS_SIZE') {
    showErrorToast(`文件 ${file.name} 超过5MB限制`)
  } else if (type === 'FILES_OVER_LENGTH_LIMIT') {
    showErrorToast('最多上传5张图片')
  }
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
      .filter(f => f.response?.url)
      .map(f => f.response.url)

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
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 隐藏 TDesign Picker 默认输入框样式 */
:deep(.t-picker) {
  width: 100%;
}

:deep(.t-picker__suffix) {
  width: 100%;
}

/* 表单项样式优化 */
:deep(.t-form-item) {
  margin-bottom: 24px;
}

:deep(.t-form-item__label) {
  font-size: 28px;
  color: var(--text-primary);
  margin-bottom: 12px;
}

:deep(.t-input) {
  font-size: 28px;
}

:deep(.t-textarea) {
  font-size: 28px;
}

:deep(.t-textarea__inner) {
  font-size: 28px;
}
</style>

<template>
  <Root title="文档管理" back-url="/admin">
    <div class="min-h-screen bg-[#f5f7fa]">
      <!-- 操作按钮 -->
      <div class="flex gap-[16px] p-[24px] px-[32px] bg-gradient-to-br from-[#0052D9] to-[#266FE8]">
        <t-button theme="primary" class="flex-1 h-[80px] text-[28px] rounded-[24px] bg-white text-[#0052D9] border-0" @click="showUploadDialog = true">
          <template #icon><AddIcon /></template>
          上传文档
        </t-button>
        <t-button theme="default" class="flex-1 h-[80px] text-[28px] rounded-[24px] bg-white/20 border-0 text-white" @click="router.push('/admin/document/category')">
          <template #icon><FolderIcon /></template>
          分类管理
        </t-button>
      </div>

      <!-- 分类筛选 -->
      <div class="py-[16px] bg-white">
        <div class="flex px-[16px] overflow-x-auto gap-[12px]">
          <div :class="['px-[24px] py-[12px] rounded-[24px] text-[26px] whitespace-nowrap transition-all', activeCategory === null ? 'bg-gradient-to-br from-[#0052D9] to-[#266FE8] text-white' : 'bg-[#f5f7fa] text-[#666]']" @click="activeCategory = null">全部</div>
          <div v-for="cat in categories" :key="cat.id" :class="['px-[24px] py-[12px] rounded-[24px] text-[26px] whitespace-nowrap transition-all', activeCategory === cat.id ? 'bg-gradient-to-br from-[#0052D9] to-[#266FE8] text-white' : 'bg-[#f5f7fa] text-[#666]']" @click="activeCategory = cat.id">{{ cat.name }}</div>
        </div>
      </div>

      <!-- 文档列表 -->
      <div class="p-[24px] px-[32px]">
        <div v-if="documents.length === 0" class="text-center py-[80px]">
          <FolderIcon class="text-[80px] text-[#ddd] mb-[20px]" />
          <div class="text-[28px] text-[#999]">暂无文档</div>
        </div>

        <div v-for="doc in documents" :key="doc.id" class="flex items-center bg-white rounded-[24px] p-[24px] mb-[16px] shadow-sm">
          <div class="w-[64px] h-[64px] bg-gradient-to-br from-[#ED7B2F] to-[#F09143] rounded-[24px] flex items-center justify-center flex-shrink-0">
            <FileIcon class="text-[32px] text-white" />
          </div>
          <div class="flex-1 ml-[20px] min-w-0">
            <div class="text-[28px] font-medium text-[#333] mb-[8px] truncate">{{ doc.name }}</div>
            <div class="text-[24px] text-[#999] mb-[6px]"><span>{{ getCategoryName(doc.categoryId) }}</span><span class="mx-[8px]">·</span><span>{{ formatFileSize(doc.fileSize) }}</span></div>
            <div class="text-[22px] text-[#bbb]">上传于 {{ formatDate(doc.uploadAt) }}</div>
          </div>
          <t-button theme="danger" variant="outline" size="small" class="flex-shrink-0 ml-[12px]" @click="handleDelete(doc)">删除</t-button>
        </div>
      </div>
    </div>

    <!-- 上传弹窗 -->
    <t-dialog v-model:visible="showUploadDialog" title="上传文档" :confirm-btn="{ content: '上传', theme: 'primary' }" @confirm="handleUpload">
      <div class="p-[20px]">
        <div class="mb-[24px]">
          <div class="text-[28px] text-[#333] mb-[16px]">选择文件</div>
          <t-upload v-model="uploadFiles" :max="1" :size-limit="{ size: 20, unit: 'MB' }" />
        </div>
        <div class="mb-[24px]">
          <div class="text-[28px] text-[#333] mb-[16px]">选择分类</div>
          <div class="flex justify-between items-center p-[20px] bg-[#f5f7fa] rounded-[12px] text-[28px] text-[#666]" @click="showCategoryPicker = true">
            <span>{{ getSelectedCategoryName() || '请选择分类' }}</span>
            <ChevronRightIcon class="text-[#ccc]" />
          </div>
        </div>
        <t-input v-model="uploadForm.tags" placeholder="标签用逗号分隔" label="标签" />
      </div>
    </t-dialog>

    <!-- 分类选择弹窗 -->
    <t-popup v-model="showCategoryPicker" placement="bottom" round>
      <t-picker :columns="categoryColumns" title="选择分类" @confirm="handleCategoryConfirm" @cancel="showCategoryPicker = false" />
    </t-popup>
  </Root>
</template>

<script setup>
import { AddIcon, FolderIcon, FileIcon, ChevronRightIcon } from "tdesign-icons-vue-next"
import { getDocuments, createDocument, deleteDocument, getDocumentCategories } from "@/api/documents"
import { useUserStore } from "@/store"
import { showToast, showConfirmDialog } from "@/utils/common/tools"
import { useRouter } from "vue-router"
import dayjs from "dayjs"

const router = useRouter()
const userStore = useUserStore()
const documents = ref([])
const categories = ref([])
const activeCategory = ref(null)
const showUploadDialog = ref(false)
const showCategoryPicker = ref(false)
const uploadFiles = ref([])
const uploadForm = reactive({ categoryId: null, tags: "" })

const categoryColumns = computed(() => [categories.value.map(c => ({ label: c.name, value: c.id }))])

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + " B"
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
  return (bytes / (1024 * 1024)).toFixed(1) + " MB"
}

const formatDate = (date) => dayjs(date).format("YYYY-MM-DD HH:mm")
const getCategoryName = (categoryId) => categories.value.find(c => c.id === categoryId)?.name || "未分类"
const getSelectedCategoryName = () => uploadForm.categoryId ? getCategoryName(uploadForm.categoryId) : ''

const handleCategoryConfirm = (value) => { uploadForm.categoryId = value[0]; showCategoryPicker.value = false }

const loadCategories = async () => {
  const res = await getDocumentCategories()
  categories.value = res.data || []
}
const loadDocuments = async () => {
  const params = activeCategory.value ? { categoryId: activeCategory.value } : {}
  const res = await getDocuments(params)
  documents.value = res.data || []
}

watch(activeCategory, () => loadDocuments())

const handleUpload = async () => {
  if (uploadFiles.value.length === 0) { showToast("请选择文件"); return }
  if (!uploadForm.categoryId) { showToast("请选择分类"); return }

  const file = uploadFiles.value[0]
  if (file.raw) {
    // 简化实现：只保存文档元数据
    await createDocument({
      name: file.name,
      categoryId: uploadForm.categoryId,
      tags: uploadForm.tags.split(",").map(s => s.trim()).filter(Boolean),
      fileType: file.raw.type,
      fileSize: file.raw.size
    })
    showToast("上传成功")
    showUploadDialog.value = false
    uploadFiles.value = []; uploadForm.categoryId = null; uploadForm.tags = ""
    loadDocuments()
  }
}

const handleDelete = async (doc) => {
  try {
    await showConfirmDialog({ content: `确定删除「${doc.name}」吗？` })
    await deleteDocument(doc.id)
    showToast("已删除")
    loadDocuments()
  } catch (e) {
    // 用户取消操作
  }
}

onMounted(async () => { await loadCategories(); await loadDocuments() })
</script>

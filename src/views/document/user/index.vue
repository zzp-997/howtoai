<template>
  <Root title="文档查询" back-url="/user">
    <div class="min-h-screen bg-[#f5f7fa]">
      <!-- 搜索框 -->
      <div class="p-[16px] px-[32px] bg-white">
        <t-search v-model="searchKeyword" placeholder="搜索文档名称或标签" @search="handleSearch" />
      </div>

      <!-- 分类筛选 -->
      <div class="py-[16px] bg-white border-b border-[#f0f0f0]">
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

        <div v-for="doc in documents" :key="doc.id" class="flex items-start bg-white rounded-[24px] p-[24px] mb-[16px] shadow-sm">
          <div class="w-[64px] h-[64px] bg-gradient-to-br from-[#0052D9] to-[#266FE8] rounded-[16px] flex items-center justify-center flex-shrink-0">
            <FileIcon class="text-[32px] text-white" />
          </div>
          <div class="flex-1 ml-[20px] min-w-0">
            <div class="text-[28px] font-medium text-[#333] mb-[8px] truncate">{{ doc.name }}</div>
            <div class="text-[24px] text-[#999] mb-[12px]"><span>{{ getCategoryName(doc.categoryId) }}</span><span class="mx-[8px]">·</span><span>{{ formatFileSize(doc.fileSize) }}</span></div>
            <div v-if="doc.tags?.length" class="flex flex-wrap gap-[8px]">
              <t-tag v-for="tag in doc.tags.slice(0, 3)" :key="tag" theme="primary" variant="light" size="small">{{ tag }}</t-tag>
            </div>
          </div>
          <div class="flex flex-col gap-[10px] flex-shrink-0 ml-[12px]">
            <t-button theme="primary" size="small" @click="handlePreview(doc)">预览</t-button>
            <t-button theme="default" size="small" @click="handleDownload(doc)">下载</t-button>
          </div>
        </div>
      </div>
    </div>
  </Root>
</template>

<script setup>
import { FolderIcon, FileIcon } from "tdesign-icons-vue-next"
import { documentRepo, documentCategoryRepo } from "@/db/repositories"
import { showToast } from "@/utils/common/tools"

const documents = ref([])
const categories = ref([])
const searchKeyword = ref("")
const activeCategory = ref(null)

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + " B"
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
  return (bytes / (1024 * 1024)).toFixed(1) + " MB"
}

const getCategoryName = (categoryId) => categories.value.find(c => c.id === categoryId)?.name || "未分类"

const loadCategories = async () => { categories.value = await documentCategoryRepo.findAllOrdered() }
const loadDocuments = async () => { documents.value = await documentRepo.getList(activeCategory.value) }

const handleSearch = () => loadDocuments()

watch(activeCategory, () => loadDocuments())

const handlePreview = async (doc) => {
  try {
    const fullDoc = await documentRepo.findById(doc.id)
    if (!fullDoc?.fileBlob) { showToast("文档不存在"); return }
    window.open(URL.createObjectURL(fullDoc.fileBlob), "_blank")
  } catch (error) { showToast("预览失败") }
}

const handleDownload = async (doc) => {
  try {
    const fullDoc = await documentRepo.findById(doc.id)
    if (!fullDoc?.fileBlob) { showToast("文档不存在"); return }
    const url = URL.createObjectURL(fullDoc.fileBlob)
    const a = document.createElement("a"); a.href = url; a.download = fullDoc.name; a.click()
    URL.revokeObjectURL(url)
    showToast("下载成功")
  } catch (error) { showToast("下载失败") }
}

onMounted(async () => { await loadCategories(); await loadDocuments() })
</script>

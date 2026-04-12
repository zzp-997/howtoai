<template>
  <Root title="文档查询" back-url="/user">
    <div class="min-h-screen bg-[#f5f7fa]">
      <!-- 顶部搜索区域 -->
      <div class="bg-gradient-to-br from-[#0052D9] to-[#266FE8] p-[32px] pb-[24px]">
        <div class="text-[32px] font-bold text-white mb-[20px]">搜索文档</div>
        <div class="bg-white rounded-[24px] overflow-hidden shadow-lg">
          <t-search
            v-model="searchKeyword"
            placeholder="输入关键词搜索..."
            @search="handleSearch"
            @input="handleSearchInput"
            @clear="clearSearch"
          />
        </div>
      </div>

      <!-- 搜索联想 -->
      <div v-if="showSuggestions && searchSuggestions.length > 0" class="bg-white px-[32px] py-[16px] border-b border-[#f0f0f0]">
        <div class="text-[22px] text-[#999] mb-[12px]">搜索建议</div>
        <div class="flex flex-wrap gap-[10px]">
          <div
            v-for="sug in searchSuggestions"
            :key="sug"
            class="px-[20px] py-[10px] bg-gradient-to-br from-[#0052D9]/10 to-[#266FE8]/10 rounded-[20px] text-[24px] text-[#0052D9]"
            @click="applySuggestion(sug)"
          >
            {{ sug }}
          </div>
        </div>
      </div>

      <!-- 热门搜索 -->
      <div v-if="!searchKeyword && hotKeywords.length > 0" class="bg-white px-[32px] py-[20px] border-b border-[#f0f0f0]">
        <div class="flex items-center gap-[8px] mb-[16px]">
          <div class="w-[32px] h-[32px] bg-gradient-to-br from-[#FF7D7D] to-[#FFA8A8] rounded-[8px] flex items-center justify-center">
            <span class="text-[18px]">🔥</span>
          </div>
          <span class="text-[26px] font-semibold text-[#333]">热门搜索</span>
        </div>
        <div class="flex flex-wrap gap-[12px]">
          <div
            v-for="(item, index) in hotKeywords"
            :key="item.keyword"
            class="flex items-center gap-[8px] px-[20px] py-[12px] bg-[#f5f7fa] rounded-[16px]"
            @click="applySuggestion(item.keyword)"
          >
            <span :class="['w-[28px] h-[28px] rounded-[6px] flex items-center justify-center text-[18px] font-bold',
              index === 0 ? 'bg-[#E34D59] text-white' :
              index === 1 ? 'bg-[#ED7B2F] text-white' :
              index === 2 ? 'bg-[#0052D9] text-white' : 'bg-[#ddd] text-[#666]']">{{ index + 1 }}</span>
            <span class="text-[24px] text-[#333]">{{ item.keyword }}</span>
          </div>
        </div>
      </div>

      <!-- 分类筛选 -->
      <div class="py-[20px] bg-white border-b border-[#f0f0f0]">
        <div class="flex px-[32px] overflow-x-auto gap-[12px] [scrollbar-width:none]">
          <div
            :class="['px-[28px] py-[14px] rounded-[20px] text-[26px] whitespace-nowrap transition-all font-medium',
              activeCategory === null ? 'bg-gradient-to-br from-[#0052D9] to-[#266FE8] text-white shadow-md' : 'bg-[#f5f7fa] text-[#666]']"
            @click="activeCategory = null"
          >
            全部文档
          </div>
          <div
            v-for="cat in categories"
            :key="cat.id"
            :class="['px-[28px] py-[14px] rounded-[20px] text-[26px] whitespace-nowrap transition-all font-medium',
              activeCategory === cat.id ? 'bg-gradient-to-br from-[#0052D9] to-[#266FE8] text-white shadow-md' : 'bg-[#f5f7fa] text-[#666]']"
            @click="activeCategory = cat.id"
          >
            {{ cat.name }}
          </div>
        </div>
      </div>

      <!-- 最近浏览 -->
      <div v-if="!searchKeyword && recentDocuments.length > 0 && activeCategory === null" class="px-[32px] pt-[24px]">
        <div class="flex items-center justify-between mb-[16px]">
          <div class="flex items-center gap-[10px]">
            <div class="w-[32px] h-[32px] bg-gradient-to-br from-[#7B61FF] to-[#9B8AFF] rounded-[8px] flex items-center justify-center">
              <TimeFilledIcon class="text-[18px] text-white" />
            </div>
            <span class="text-[28px] font-semibold text-[#333]">最近浏览</span>
          </div>
          <span class="text-[24px] text-[#999]">{{ recentDocuments.length }}篇</span>
        </div>
        <div class="flex gap-[16px] overflow-x-auto [scrollbar-width:none] pb-[12px]">
          <div
            v-for="rec in recentDocuments"
            :key="rec.documentId"
            class="flex-shrink-0 w-[220px] bg-white rounded-[20px] p-[20px] shadow-sm border border-[#f0f0f0]"
            @click="handlePreview(getDocumentById(rec.documentId))"
          >
            <div class="w-[56px] h-[56px] bg-gradient-to-br from-[#7B61FF] to-[#9B8AFF] rounded-[14px] flex items-center justify-center mb-[14px]">
              <FileIcon class="text-[28px] text-white" />
            </div>
            <div class="text-[26px] text-[#333] truncate font-medium">{{ getDocumentName(rec.documentId) }}</div>
            <div class="text-[22px] text-[#999] mt-[6px]">{{ formatViewTime(rec.viewedAt) }}</div>
          </div>
        </div>
      </div>

      <!-- 常用文档 -->
      <div v-if="!searchKeyword && frequentDocuments.length > 0 && activeCategory === null" class="px-[32px] pt-[24px]">
        <div class="flex items-center gap-[10px] mb-[16px]">
          <div class="w-[32px] h-[32px] bg-gradient-to-br from-[#ED7B2F] to-[#F09143] rounded-[8px] flex items-center justify-center">
            <StarFilledIcon class="text-[18px] text-white" />
          </div>
          <span class="text-[28px] font-semibold text-[#333]">常用文档</span>
        </div>
        <div class="bg-white rounded-[24px] shadow-sm overflow-hidden border border-[#f0f0f0]">
          <div
            v-for="(freq, index) in frequentDocuments.slice(0, 3)"
            :key="freq.documentId"
            class="flex items-center gap-[20px] p-[24px] border-b border-[#f0f0f0] last:border-b-0"
            @click="handlePreview(getDocumentById(freq.documentId))"
          >
            <div :class="['w-[48px] h-[48px] rounded-[12px] flex items-center justify-center text-[22px] font-bold text-white',
              index === 0 ? 'bg-gradient-to-br from-[#FFD700] to-[#FFA500]' :
              index === 1 ? 'bg-gradient-to-br from-[#C0C0C0] to-[#A0A0A0]' :
              'bg-gradient-to-br from-[#CD7F32] to-[#B8860B]']">
              {{ index + 1 }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-[28px] text-[#333] truncate font-medium">{{ getDocumentName(freq.documentId) }}</div>
              <div class="text-[22px] text-[#999] mt-[4px]">浏览 {{ freq.viewCount }} 次</div>
            </div>
            <ChevronRightIcon class="text-[28px] text-[#ccc]" />
          </div>
        </div>
      </div>

      <!-- 文档列表标题 -->
      <div class="px-[32px] pt-[28px] pb-[16px]">
        <div class="flex items-center justify-between">
          <div class="text-[32px] font-bold text-[#333]">
            {{ searchKeyword ? '搜索结果' : (activeCategory ? getCategoryName(activeCategory) : '全部文档') }}
          </div>
          <div class="text-[26px] text-[#999]">共 {{ documents.length }} 篇</div>
        </div>
      </div>

      <!-- 文档列表 -->
      <div class="px-[32px] pb-[32px]">
        <div v-if="documents.length === 0" class="text-center py-[100px]">
          <div class="w-[120px] h-[120px] mx-auto bg-[#f5f7fa] rounded-full flex items-center justify-center mb-[24px]">
            <FolderIcon class="text-[60px] text-[#ccc]" />
          </div>
          <div class="text-[30px] text-[#999]">暂无文档</div>
          <div class="text-[24px] text-[#bbb] mt-[8px]">换个关键词试试</div>
        </div>

        <div v-for="doc in documents" :key="doc.id" class="bg-white rounded-[24px] mb-[16px] overflow-hidden shadow-sm border border-[#f0f0f0]" @click="handleDocumentClick(doc)">
          <div class="flex items-center p-[24px]">
            <div class="w-[80px] h-[80px] bg-gradient-to-br from-[#0052D9] to-[#266FE8] rounded-[20px] flex items-center justify-center flex-shrink-0">
              <FileIcon class="text-[40px] text-white" />
            </div>
            <div class="flex-1 ml-[24px] min-w-0">
              <div class="text-[30px] font-semibold text-[#333] mb-[8px] truncate">{{ doc.name }}</div>
              <div class="flex items-center gap-[16px] text-[24px] text-[#999]">
                <span class="px-[12px] py-[4px] bg-[#0052D9]/10 text-[#0052D9] rounded-[8px]">{{ getCategoryName(doc.categoryId) }}</span>
                <span>{{ formatFileSize(doc.fileSize) }}</span>
              </div>
              <div v-if="doc.tags?.length" class="flex flex-wrap gap-[8px] mt-[12px]">
                <span v-for="tag in doc.tags.slice(0, 3)" :key="tag" class="px-[12px] py-[4px] bg-[#f5f7fa] text-[#666] rounded-[8px] text-[20px]">{{ tag }}</span>
              </div>
            </div>
          </div>
          <div class="flex border-t border-[#f0f0f0]">
            <div class="flex-1 py-[16px] text-center text-[26px] text-[#0052D9] font-medium" @click.stop="handlePreview(doc)">
              预览
            </div>
            <div class="w-[1px] bg-[#f0f0f0]"></div>
            <div class="flex-1 py-[16px] text-center text-[26px] text-[#666] font-medium" @click.stop="handleDownload(doc)">
              下载
            </div>
          </div>
        </div>
      </div>
    </div>
  </Root>
</template>

<script setup>
import { FolderIcon, FileIcon, TimeIcon, ChevronRightIcon, TimeFilledIcon } from "tdesign-icons-vue-next"
import { StarFilledIcon } from "tdesign-icons-vue-next"
import { documentRepo, documentCategoryRepo, documentViewLogRepo, searchHistoryRepo } from "@/db/repositories"
import { useUserStore } from "@/store"
import { showToast } from "@/utils/common/tools"
import dayjs from "dayjs"

const userStore = useUserStore()

const documents = ref([])
const categories = ref([])
const searchKeyword = ref("")
const activeCategory = ref(null)
const recentDocuments = ref([])
const frequentDocuments = ref([])
const hotKeywords = ref([])
const searchSuggestions = ref([])
const showSuggestions = ref(false)

// 文档缓存（用于显示名称）
const documentCache = ref({})

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + " B"
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
  return (bytes / (1024 * 1024)).toFixed(1) + " MB"
}

const getCategoryName = (categoryId) => categories.value.find(c => c.id === categoryId)?.name || "未分类"

const formatViewTime = (date) => {
  const d = dayjs(date)
  const today = dayjs()
  if (d.isSame(today, 'day')) return '今天'
  if (d.isSame(today.subtract(1, 'day'), 'day')) return '昨天'
  return d.format('MM/DD')
}

const getDocumentById = (id) => documentCache.value[id]
const getDocumentName = (id) => documentCache.value[id]?.name || '未知文档'

// 加载分类
const loadCategories = async () => {
  categories.value = await documentCategoryRepo.findAllOrdered()
}

// 加载文档
const loadDocuments = async () => {
  let docs
  if (searchKeyword.value) {
    docs = await documentRepo.search(searchKeyword.value)
  } else {
    docs = await documentRepo.getList(activeCategory.value)
  }
  documents.value = docs

  // 缓存文档
  docs.forEach(doc => {
    documentCache.value[doc.id] = doc
  })
}

// 加载最近浏览
const loadRecentDocuments = async () => {
  recentDocuments.value = await documentViewLogRepo.getRecentViewed(userStore.userId, 5)
}

// 加载常用文档
const loadFrequentDocuments = async () => {
  frequentDocuments.value = await documentViewLogRepo.getFrequentlyViewed(userStore.userId, 5)
}

// 加载热门搜索
const loadHotKeywords = async () => {
  hotKeywords.value = await searchHistoryRepo.getHotKeywords(6)
}

// 搜索输入处理
const handleSearchInput = () => {
  if (searchKeyword.value.length > 0) {
    generateSuggestions()
    showSuggestions.value = true
  } else {
    showSuggestions.value = false
  }
}

// 生成搜索建议
const generateSuggestions = async () => {
  const suggestions = []
  const history = await searchHistoryRepo.getSearchHistory(userStore.userId, 5)
  const keyword = searchKeyword.value.toLowerCase()
  history.forEach(h => {
    if (h.toLowerCase().includes(keyword) && !suggestions.includes(h)) {
      suggestions.push(h)
    }
  })
  documents.value.forEach(doc => {
    doc.tags?.forEach(tag => {
      if (tag.toLowerCase().includes(keyword) && !suggestions.includes(tag)) {
        suggestions.push(tag)
      }
    })
  })
  searchSuggestions.value = suggestions.slice(0, 5)
}

// 应用搜索建议
const applySuggestion = (keyword) => {
  searchKeyword.value = keyword
  showSuggestions.value = false
  handleSearch()
}

// 执行搜索
const handleSearch = async () => {
  showSuggestions.value = false
  if (searchKeyword.value.trim()) {
    await searchHistoryRepo.recordSearch(userStore.userId, searchKeyword.value.trim())
  }
  loadDocuments()
}

// 清空搜索
const clearSearch = () => {
  searchKeyword.value = ''
  showSuggestions.value = false
  loadDocuments()
}

// 点击文档
const handleDocumentClick = async (doc) => {
  await documentViewLogRepo.logView(userStore.userId, doc.id)
}

// 预览文档
const handlePreview = async (doc) => {
  if (!doc) return
  try {
    const fullDoc = await documentRepo.findById(doc.id)
    if (!fullDoc?.fileBlob) { showToast("文档不存在"); return }
    await documentViewLogRepo.logView(userStore.userId, doc.id)
    window.open(URL.createObjectURL(fullDoc.fileBlob), "_blank")
  } catch (error) { showToast("预览失败") }
}

// 下载文档
const handleDownload = async (doc) => {
  try {
    const fullDoc = await documentRepo.findById(doc.id)
    if (!fullDoc?.fileBlob) { showToast("文档不存在"); return }
    await documentViewLogRepo.logView(userStore.userId, doc.id)
    const url = URL.createObjectURL(fullDoc.fileBlob)
    const a = document.createElement("a"); a.href = url; a.download = fullDoc.name; a.click()
    URL.revokeObjectURL(url)
    showToast("下载成功")
  } catch (error) { showToast("下载失败") }
}

watch(activeCategory, () => loadDocuments())

onMounted(async () => {
  await loadCategories()
  await loadDocuments()
  await loadRecentDocuments()
  await loadFrequentDocuments()
  await loadHotKeywords()
})
</script>

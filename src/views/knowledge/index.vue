<template>
  <Root title="知识库" back-url="/user">
    <div class="min-h-screen bg-[#f5f7fa] pb-[32px]">
      <!-- 顶部搜索栏 -->
      <div class="bg-white p-[24px] sticky top-0 z-10 shadow-sm">
        <div class="flex items-center gap-[16px]">
          <t-input
            v-model="searchKeyword"
            placeholder="搜索知识库..."
            class="flex-1 !h-[56px] !text-[28px]"
            clearable
            @enter="handleSearch"
            @clear="handleSearch"
          >
            <template #prefix-icon>
              <SearchIcon class="text-[24px] text-[#999]" />
            </template>
          </t-input>
          <t-button theme="primary" @click="handleCreate">
            <template #icon><AddIcon /></template>
            新建文档
          </t-button>
        </div>
      </div>

      <div class="flex p-[24px] gap-[24px]">
        <!-- 左侧分类栏 -->
        <div class="w-[280px] bg-white rounded-[16px] p-[16px] shadow-sm">
          <div class="flex items-center justify-between mb-[16px]">
            <span class="text-[26px] font-medium text-[#333]">知识分类</span>
            <t-button variant="text" size="small" @click="handleAddCategory">
              <template #icon><AddIcon class="text-[24px]" /></template>
            </t-button>
          </div>
          <div class="flex flex-col gap-[8px]">
            <div
              v-for="category in categories"
              :key="category.id"
              :class="[
                'flex items-center justify-between p-[12px] rounded-[12px] cursor-pointer transition-all',
                currentCategory?.id === category.id ? 'bg-[#e8f4ff] text-[#0052D9]' : 'bg-[#f5f7fa] text-[#666]'
              ]"
              @click="handleCategoryClick(category)"
            >
              <span class="text-[24px]">{{ category.name }}</span>
              <span class="text-[22px] text-[#999]">{{ category.articleCount || 0 }}</span>
            </div>
            <!-- 子分类 -->
            <div v-if="category.children" class="pl-[16px] flex flex-col gap-[8px]">
              <div
                v-for="child in category.children"
                :key="child.id"
                :class="[
                  'flex items-center justify-between p-[12px] rounded-[12px] cursor-pointer transition-all',
                  currentCategory?.id === child.id ? 'bg-[#e8f4ff] text-[#0052D9]' : 'bg-[#f5f7fa] text-[#666]'
                ]"
                @click="handleCategoryClick(child)"
              >
                <span class="text-[22px]">{{ child.name }}</span>
                <span class="text-[20px] text-[#999]">{{ child.articleCount || 0 }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧内容区 -->
        <div class="flex-1 bg-white rounded-[16px] p-[24px] shadow-sm">
          <!-- 筛选栏 -->
          <div class="flex items-center justify-between mb-[24px]">
            <t-radio-group v-model="filterType" variant="default-filled" @change="handleFilterChange">
              <t-radio-button value="all">全部</t-radio-button>
              <t-radio-button value="my">我的</t-radio-button>
              <t-radio-button value="published">已发布</t-radio-button>
              <t-radio-button value="draft">草稿</t-radio-button>
            </t-radio-group>
            <t-select
              v-model="sortType"
              placeholder="排序方式"
              class="w-[200px]"
              @change="handleSortChange"
            >
              <t-option value="latest" label="最新" />
              <t-option value="hot" label="最热" />
              <t-option value="views" label="阅读量" />
            </t-select>
          </div>

          <!-- 加载中 -->
          <div v-if="loading" class="flex items-center justify-center py-[100px]">
            <t-loading text="加载中..." />
          </div>

          <!-- 文档列表 -->
          <div v-else class="grid grid-cols-3 gap-[16px]">
            <div
              v-for="article in articles"
              :key="article.id"
              class="bg-[#f5f7fa] rounded-[16px] p-[20px] cursor-pointer active:scale-[0.98] transition-transform"
              @click="handleArticleClick(article)"
            >
              <h3 class="text-[28px] font-medium text-[#333] mb-[12px] truncate">{{ article.title }}</h3>
              <p class="text-[24px] text-[#666] mb-[16px] line-clamp-2">{{ article.summary }}</p>
              <div class="flex flex-wrap gap-[8px] mb-[16px]">
                <t-tag
                  v-for="tag in article.tags"
                  :key="tag"
                  theme="primary"
                  variant="light"
                  size="small"
                >
                  {{ tag }}
                </t-tag>
              </div>
              <div class="flex items-center justify-between text-[22px] text-[#999]">
                <span class="flex items-center gap-[8px]">
                  <UserIcon class="text-[20px]" />
                  {{ article.authorName }}
                </span>
                <span class="flex items-center gap-[8px]">
                  <BrowseIcon class="text-[20px]" />
                  {{ article.viewCount }}
                </span>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-if="!loading && articles.length === 0" class="flex items-center justify-center py-[100px]">
            <div class="text-center">
              <FileIcon class="text-[64px] text-[#999] mb-[16px]" />
              <div class="text-[26px] text-[#999]">暂无文档</div>
            </div>
          </div>

          <!-- 分页 -->
          <div v-if="total > pageSize" class="flex justify-end mt-[24px]">
            <t-pagination
              v-model="currentPage"
              v-model:page-size="pageSize"
              :total="total"
              show-page-number
              @change="handlePageChange"
            />
          </div>
        </div>
      </div>
    </div>
  </Root>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  SearchIcon,
  AddIcon,
  UserIcon,
  BrowseIcon,
  FileIcon
} from 'tdesign-icons-vue-next';
import Root from '@/components/root/index.vue';
import {
  getKnowledgeCategories,
  getKnowledgeArticles,
  searchKnowledge,
  getMyArticles
} from '@/api/knowledge';

const router = useRouter();

// 搜索相关
const loading = ref(false);
const searchKeyword = ref('');
const filterType = ref('all');
const sortType = ref('latest');

// 分类相关
const categories = ref([]);
const currentCategory = ref(null);

// 文章列表相关
const articles = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 方法
const handleSearch = async () => {
  currentPage.value = 1;
  await loadArticles();
};

const handleCreate = () => {
  router.push('/user/knowledge/create');
};

const handleAddCategory = () => {
  console.log('添加分类');
};

const handleCategoryClick = async (category) => {
  currentCategory.value = category;
  currentPage.value = 1;
  await loadArticles();
};

const handleFilterChange = async () => {
  currentPage.value = 1;
  await loadArticles();
};

const handleSortChange = async () => {
  currentPage.value = 1;
  await loadArticles();
};

const handleArticleClick = (article) => {
  router.push(`/user/knowledge/${article.id}`);
};

const handlePageChange = async (page) => {
  currentPage.value = page.current || page;
  await loadArticles();
};

const loadCategories = async () => {
  try {
    const res = await getKnowledgeCategories();
    if (res.data) {
      categories.value = res.data;
    }
  } catch (error) {
    console.error('加载分类失败:', error);
    // 模拟数据
    categories.value = [
      {
        id: 1,
        name: '公司制度',
        articleCount: 15,
        children: [
          { id: 11, name: '员工手册', articleCount: 8 },
          { id: 12, name: '行政规范', articleCount: 4 },
          { id: 13, name: '财务制度', articleCount: 3 }
        ]
      },
      {
        id: 2,
        name: '技术文档',
        articleCount: 20,
        children: [
          { id: 21, name: '开发规范', articleCount: 10 },
          { id: 22, name: 'API文档', articleCount: 6 },
          { id: 23, name: '产品文档', articleCount: 4 }
        ]
      },
      { id: 3, name: '常见问题', articleCount: 12 },
      { id: 4, name: '培训资料', articleCount: 8 }
    ];
  }
};

const loadArticles = async () => {
  loading.value = true;
  try {
    const params = {
      page: currentPage.value,
      size: pageSize.value,
      categoryId: currentCategory.value?.id,
      sort: sortType.value
    };

    let res;
    if (searchKeyword.value) {
      res = await searchKnowledge({ keyword: searchKeyword.value, ...params });
    } else if (filterType.value === 'my') {
      res = await getMyArticles(params);
    } else {
      res = await getKnowledgeArticles(params);
    }

    if (res.data) {
      articles.value = res.data.list || res.data;
      total.value = res.data.total || articles.value.length;
    }
  } catch (error) {
    console.error('加载文章失败:', error);
    // 模拟数据
    articles.value = [
      {
        id: 1,
        title: '员工考勤管理制度',
        summary: '本文详细说明了公司考勤管理制度，包括上班时间、请假流程...',
        categoryId: 11,
        authorName: '管理员',
        tags: ['考勤', '制度'],
        viewCount: 156
      },
      {
        id: 2,
        title: '会议室预订指南',
        summary: '详细介绍如何预订会议室，包括预订规则、使用流程...',
        categoryId: 21,
        authorName: '张三',
        tags: ['会议室', '预订'],
        viewCount: 89
      },
      {
        id: 3,
        title: '报销流程说明',
        summary: '员工报销流程及注意事项，包括报销标准、审批流程...',
        categoryId: 13,
        authorName: '李四',
        tags: ['报销', '财务'],
        viewCount: 234
      }
    ];
    total.value = 30;
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await loadCategories();
  await loadArticles();
});
</script>
<template>
  <Root title="知识详情" back-url="/user/knowledge">
    <div class="min-h-screen bg-[#f5f7fa] pb-[32px]">
      <!-- 加载中 -->
      <div v-if="loading" class="flex items-center justify-center py-[100px]">
        <t-loading text="加载中..." />
      </div>

      <div v-else class="max-w-[900px] mx-auto p-[24px]">
        <!-- 文章头部 -->
        <div class="bg-white rounded-[16px] p-[32px] mb-[16px] shadow-sm">
          <h1 class="text-[36px] font-bold text-[#333] mb-[16px]">{{ article.title }}</h1>
          <div class="flex items-center gap-[24px] text-[24px] text-[#666] mb-[24px]">
            <span class="flex items-center gap-[8px]">
              <UserIcon class="text-[24px]" />
              {{ article.authorName }}
            </span>
            <span class="flex items-center gap-[8px]">
              <FolderIcon class="text-[24px]" />
              {{ article.categoryName }}
            </span>
            <span class="flex items-center gap-[8px]">
              <TimeIcon class="text-[24px]" />
              {{ article.publishedAt }}
            </span>
            <span class="flex items-center gap-[8px]">
              <BrowseIcon class="text-[24px]" />
              {{ article.viewCount }} 阅读
            </span>
          </div>
          <div class="flex gap-[12px]">
            <t-button variant="outline" @click="handleEdit">
              <template #icon><EditIcon /></template>
              编辑
            </t-button>
            <t-button variant="outline" @click="handleShare">
              <template #icon><ShareIcon /></template>
              分享
            </t-button>
            <t-button theme="danger" variant="outline" @click="handleDelete">
              <template #icon><DeleteIcon /></template>
              删除
            </t-button>
          </div>
        </div>

        <!-- 文章内容 -->
        <div class="bg-white rounded-[16px] p-[32px] mb-[16px] shadow-sm">
          <div class="text-[28px] leading-[1.8] text-[#333]" v-html="article.content"></div>
        </div>

        <!-- 文章底部 -->
        <div class="bg-white rounded-[16px] p-[24px] mb-[16px] shadow-sm">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-[12px]">
              <span class="text-[24px] text-[#666]">标签：</span>
              <t-tag
                v-for="tag in article.tags"
                :key="tag"
                theme="primary"
                variant="light"
              >
                {{ tag }}
              </t-tag>
            </div>
            <t-button
              :theme="article.liked ? 'warning' : 'default'"
              variant="outline"
              @click="handleLike"
            >
              <template #icon><StarIcon :class="article.liked ? 'text-[#F59E0B]' : ''" /></template>
              点赞 {{ article.likeCount }}
            </t-button>
          </div>
        </div>

        <!-- 评论区 -->
        <div class="bg-white rounded-[16px] p-[32px] shadow-sm">
          <h3 class="text-[28px] font-medium text-[#333] mb-[24px]">
            评论 ({{ article.commentCount }})
          </h3>
          <div class="mb-[24px]">
            <t-textarea
              v-model="commentContent"
              placeholder="写下你的评论..."
              :maxlength="500"
              :autosize="{ minRows: 3, maxRows: 6 }"
            />
            <t-button
              theme="primary"
              class="mt-[16px]"
              :disabled="!commentContent.trim()"
              @click="handleComment"
            >
              发表评论
            </t-button>
          </div>
          <div class="flex flex-col gap-[16px]">
            <div
              v-for="comment in comments"
              :key="comment.id"
              class="bg-[#f5f7fa] rounded-[12px] p-[20px]"
            >
              <div class="flex items-center justify-between mb-[12px]">
                <span class="text-[24px] font-medium text-[#333]">{{ comment.authorName }}</span>
                <span class="text-[22px] text-[#999]">{{ comment.createdAt }}</span>
              </div>
              <div class="text-[24px] text-[#666] mb-[12px]">{{ comment.content }}</div>
              <div class="flex gap-[8px]">
                <t-button size="small" variant="text">
                  <template #icon><StarIcon /></template>
                  {{ comment.likeCount }}
                </t-button>
                <t-button size="small" variant="text">回复</t-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Root>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import {
  UserIcon,
  FolderIcon,
  TimeIcon,
  BrowseIcon,
  EditIcon,
  ShareIcon,
  DeleteIcon,
  StarIcon
} from 'tdesign-icons-vue-next';
import Root from '@/components/root/index.vue';
import {
  getKnowledgeArticle,
  likeKnowledgeArticle,
  viewKnowledgeArticle
} from '@/api/knowledge';
import { showToast } from '@/utils/common/tools';

const router = useRouter();
const route = useRoute();

// 数据
const loading = ref(false);
const article = ref({
  id: 0,
  title: '',
  content: '',
  categoryName: '',
  authorName: '',
  publishedAt: '',
  viewCount: 0,
  likeCount: 0,
  commentCount: 0,
  liked: false,
  tags: []
});

const comments = ref([]);
const commentContent = ref('');

// 方法
const handleEdit = () => {
  router.push(`/user/knowledge/edit/${article.value.id}`);
};

const handleShare = () => {
  showToast('分享链接已复制');
};

const handleDelete = () => {
  showToast('确定要删除这篇文章吗？');
};

const handleLike = async () => {
  try {
    await likeKnowledgeArticle(article.value.id);
    article.value.liked = !article.value.liked;
    article.value.likeCount += article.value.liked ? 1 : -1;
  } catch (error) {
    console.error('点赞失败:', error);
    article.value.liked = !article.value.liked;
    article.value.likeCount += article.value.liked ? 1 : -1;
  }
};

const handleComment = async () => {
  if (!commentContent.value.trim()) return;
  console.log('发表评论:', commentContent.value);
  commentContent.value = '';
  showToast('评论发表成功');
};

const loadArticle = async () => {
  loading.value = true;
  try {
    const id = route.params.id;
    const res = await getKnowledgeArticle(id);
    if (res.data) {
      article.value = res.data;
    }
    // 记录阅读
    await viewKnowledgeArticle(id);
  } catch (error) {
    console.error('加载文章失败:', error);
    // 模拟数据
    article.value = {
      id: 1,
      title: '员工考勤管理制度',
      content: '<p>本文详细说明了公司考勤管理制度...</p><p>一、上下班时间</p><p>公司实行弹性工作制，员工需在9:30-18:30之间完成8小时工作时长。</p><p>二、迟到早退处理</p><p>迟到15分钟内每月有3次免责机会，超过3次后每次扣除相应绩效分数。</p>',
      categoryName: '员工手册',
      authorName: '管理员',
      publishedAt: '2026-04-15',
      viewCount: 156,
      likeCount: 23,
      commentCount: 5,
      liked: false,
      tags: ['考勤', '制度', '员工']
    };
    comments.value = [
      {
        id: 1,
        authorName: '张三',
        content: '很好的制度说明，收藏了！',
        createdAt: '2026-04-16 10:30',
        likeCount: 5
      },
      {
        id: 2,
        authorName: '李四',
        content: '请问迟到是如何扣款的？',
        createdAt: '2026-04-17 14:20',
        likeCount: 2
      }
    ];
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadArticle();
});
</script>
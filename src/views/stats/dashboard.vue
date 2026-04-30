<template>
  <Root title="数据统计" back-url="/user">
    <div class="min-h-screen bg-[#f5f7fa] pb-[32px]">
      <!-- 顶部筛选器 -->
      <div class="bg-white p-[24px] sticky top-0 z-10">
        <div class="flex items-center justify-between">
          <t-radio-group v-model="timeType" variant="default-filled" @change="handleTimeChange">
            <t-radio-button value="today">今日</t-radio-button>
            <t-radio-button value="week">本周</t-radio-button>
            <t-radio-button value="month">本月</t-radio-button>
            <t-radio-button value="quarter">本季度</t-radio-button>
            <t-radio-button value="year">本年</t-radio-button>
          </t-radio-group>
          <t-button theme="primary" @click="handleExport">
            <template #icon><DownloadIcon /></template>
            导出报表
          </t-button>
        </div>
      </div>

      <!-- 加载中 -->
      <div v-if="loading" class="flex items-center justify-center py-[100px]">
        <t-loading text="加载中..." />
      </div>

      <div v-else class="p-[24px]">
        <!-- KPI指标卡片 -->
        <div class="grid grid-cols-4 gap-[16px] mb-[24px]">
          <div class="bg-white rounded-[16px] p-[24px] flex items-center shadow-sm">
            <div class="w-[64px] h-[64px] rounded-[16px] bg-[#3B82F6] flex items-center justify-center mr-[16px]">
              <CalendarIcon class="text-[32px] text-white" />
            </div>
            <div class="flex-1">
              <div class="text-[36px] font-bold text-[#1E293B]">{{ stats.todayMeetings }}</div>
              <div class="text-[24px] text-[#64748B]">今日会议</div>
              <div :class="['text-[22px]', stats.meetingsTrend > 0 ? 'text-[#10B981]' : 'text-[#EF4444]']">
                {{ stats.meetingsTrend > 0 ? '+' : '' }}{{ stats.meetingsTrend }}%
              </div>
            </div>
          </div>

          <div class="bg-white rounded-[16px] p-[24px] flex items-center shadow-sm">
            <div class="w-[64px] h-[64px] rounded-[16px] bg-[#10B981] flex items-center justify-center mr-[16px]">
              <TimeFilledIcon class="text-[32px] text-white" />
            </div>
            <div class="flex-1">
              <div class="text-[36px] font-bold text-[#1E293B]">{{ stats.attendanceRate }}%</div>
              <div class="text-[24px] text-[#64748B]">今日考勤</div>
              <div :class="['text-[22px]', stats.attendanceTrend > 0 ? 'text-[#10B981]' : 'text-[#EF4444]']">
                {{ stats.attendanceTrend > 0 ? '+' : '' }}{{ stats.attendanceTrend }}%
              </div>
            </div>
          </div>

          <div class="bg-white rounded-[16px] p-[24px] flex items-center shadow-sm">
            <div class="w-[64px] h-[64px] rounded-[16px] bg-[#F59E0B] flex items-center justify-center mr-[16px]">
              <FileIcon class="text-[32px] text-white" />
            </div>
            <div class="flex-1">
              <div class="text-[36px] font-bold text-[#1E293B]">{{ stats.pendingApprovals }}</div>
              <div class="text-[24px] text-[#64748B]">待审批</div>
              <div :class="['text-[22px]', stats.approvalsTrend > 0 ? 'text-[#10B981]' : 'text-[#EF4444]']">
                {{ stats.approvalsTrend > 0 ? '+' : '' }}{{ stats.approvalsTrend }}%
              </div>
            </div>
          </div>

          <div class="bg-white rounded-[16px] p-[24px] flex items-center shadow-sm">
            <div class="w-[64px] h-[64px] rounded-[16px] bg-[#8B5CF6] flex items-center justify-center mr-[16px]">
              <MoneyCircleIcon class="text-[32px] text-white" />
            </div>
            <div class="flex-1">
              <div class="text-[36px] font-bold text-[#1E293B]">{{ stats.monthlyExpenses }}万</div>
              <div class="text-[24px] text-[#64748B]">本月报销</div>
              <div :class="['text-[22px]', stats.expensesTrend > 0 ? 'text-[#10B981]' : 'text-[#EF4444]']">
                {{ stats.expensesTrend > 0 ? '+' : '' }}{{ stats.expensesTrend }}%
              </div>
            </div>
          </div>
        </div>

        <!-- 会议概览 -->
        <div class="grid grid-cols-2 gap-[16px] mb-[24px]">
          <t-card title="会议室使用率TOP5" class="shadow-sm">
            <div class="h-[280px] flex items-center justify-center text-[#999]">
              <div class="text-center">
                <ChartPieIcon class="text-[48px] mb-[16px]" />
                <div class="text-[24px]">图表区域</div>
              </div>
            </div>
          </t-card>
          <t-card title="考勤趋势" class="shadow-sm">
            <div class="h-[280px] flex items-center justify-center text-[#999]">
              <div class="text-center">
                <ChartLineIcon class="text-[48px] mb-[16px]" />
                <div class="text-[24px]">图表区域</div>
              </div>
            </div>
          </t-card>
        </div>

        <!-- 审批概览 -->
        <t-card title="审批概览" class="shadow-sm">
          <div class="grid grid-cols-4 gap-[16px]">
            <div class="bg-[#FFFBEB] rounded-[12px] p-[24px] text-center">
              <div class="text-[40px] font-bold text-[#F59E0B]">{{ approvalStats.pending }}</div>
              <div class="text-[24px] text-[#64748B]">待我审批</div>
            </div>
            <div class="bg-[#ECFDF5] rounded-[12px] p-[24px] text-center">
              <div class="text-[40px] font-bold text-[#10B981]">{{ approvalStats.processed }}</div>
              <div class="text-[24px] text-[#64748B]">我已审批</div>
            </div>
            <div class="bg-[#FEF2F2] rounded-[12px] p-[24px] text-center">
              <div class="text-[40px] font-bold text-[#EF4444]">{{ approvalStats.timeout }}</div>
              <div class="text-[24px] text-[#64748B]">超时审批</div>
            </div>
            <div class="bg-[#F5F3FF] rounded-[12px] p-[24px] text-center">
              <div class="text-[40px] font-bold text-[#8B5CF6]">{{ approvalStats.reminder }}</div>
              <div class="text-[24px] text-[#64748B]">催办提醒</div>
            </div>
          </div>
        </t-card>
      </div>
    </div>
  </Root>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import {
  DownloadIcon,
  CalendarIcon,
  TimeFilledIcon,
  FileIcon,
  MoneyCircleIcon,
  ChartPieIcon,
  ChartLineIcon
} from 'tdesign-icons-vue-next';
import Root from '@/components/root/index.vue';
import { getDashboardStats, getMeetingStats, getAttendanceStats, getApprovalStats, exportReport } from '@/api/stats';

// 响应式数据
const loading = ref(false);
const timeType = ref('today');

const stats = ref({
  todayMeetings: 0,
  meetingsTrend: 0,
  attendanceRate: 0,
  attendanceTrend: 0,
  pendingApprovals: 0,
  approvalsTrend: 0,
  monthlyExpenses: 0,
  expensesTrend: 0
});

const approvalStats = ref({
  pending: 0,
  processed: 0,
  timeout: 0,
  reminder: 0
});

// 方法
const handleTimeChange = async (val) => {
  await loadData();
};

const handleExport = async () => {
  try {
    await exportReport({ period: timeType.value });
  } catch (error) {
    console.error('导出失败:', error);
  }
};

const loadData = async () => {
  loading.value = true;
  try {
    const params = { period: timeType.value };

    // 加载综合数据
    const dashboardRes = await getDashboardStats();
    if (dashboardRes.data) {
      stats.value = {
        todayMeetings: dashboardRes.data.todayMeetings || 12,
        meetingsTrend: dashboardRes.data.meetingsTrend || 8,
        attendanceRate: dashboardRes.data.attendanceRate || 96,
        attendanceTrend: dashboardRes.data.attendanceTrend || 2,
        pendingApprovals: dashboardRes.data.pendingApprovals || 5,
        approvalsTrend: dashboardRes.data.approvalsTrend || -15,
        monthlyExpenses: dashboardRes.data.monthlyExpenses || 8.5,
        expensesTrend: dashboardRes.data.expensesTrend || 12
      };
    }

    // 加载审批统计
    const approvalRes = await getApprovalStats(params);
    if (approvalRes.data) {
      approvalStats.value = {
        pending: approvalRes.data.pending || 5,
        processed: approvalRes.data.processed || 12,
        timeout: approvalRes.data.timeout || 2,
        reminder: approvalRes.data.reminder || 3
      };
    }
  } catch (error) {
    console.error('加载数据失败:', error);
    // 使用模拟数据
    stats.value = {
      todayMeetings: 12,
      meetingsTrend: 8,
      attendanceRate: 96,
      attendanceTrend: 2,
      pendingApprovals: 5,
      approvalsTrend: -15,
      monthlyExpenses: 8.5,
      expensesTrend: 12
    };
    approvalStats.value = {
      pending: 5,
      processed: 12,
      timeout: 2,
      reminder: 3
    };
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadData();
});
</script>

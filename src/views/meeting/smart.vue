<template>
  <Root title="智能推荐" back-url="/user/meeting">
    <div class="min-h-screen bg-[#f5f7fa] pb-[32px]">
      <div class="flex p-[24px] gap-[24px]">
        <!-- 左侧：智能推荐 -->
        <div class="flex-1">
          <!-- 卡片容器 -->
          <div class="bg-white rounded-[16px] shadow-sm mb-[24px] overflow-hidden">
            <!-- 卡片标题 -->
            <div class="flex items-center justify-between px-[24px] py-[16px] border-b border-[#eee]">
              <span class="text-[28px] font-medium text-[#333]">智能推荐会议室</span>
              <t-button variant="text" size="small" @click="handleRefresh">
                <template #icon><RefreshIcon /></template>
                重新推荐
              </t-button>
            </div>

            <!-- 推荐条件 -->
            <div class="p-[24px]">
              <div class="grid grid-cols-2 gap-[16px]">
                <div>
                  <div class="text-[24px] text-[#666] mb-[8px]">参会人数</div>
                  <t-stepper
                    v-model="form.attendees"
                    :min="1"
                    :max="50"
                    theme="filled"
                  />
                </div>
                <div>
                  <div class="text-[24px] text-[#666] mb-[8px]">会议时长</div>
                  <div
                    class="flex items-center justify-between p-[12px] bg-[#f5f7fa] rounded-[8px] cursor-pointer"
                    @click="showDurationPicker = true"
                  >
                    <span class="text-[24px]">{{ durationOptions.find(o => o.value === form.duration)?.label }}</span>
                    <ChevronDownIcon class="text-[32px] text-[#999]" />
                  </div>
                </div>
                <div>
                  <div class="text-[24px] text-[#666] mb-[8px]">会议日期</div>
                  <div
                    class="flex items-center justify-between p-[12px] bg-[#f5f7fa] rounded-[8px] cursor-pointer"
                    @click="showDatePicker = true"
                  >
                    <span class="text-[24px]">{{ formatDate(form.date) }}</span>
                    <CalendarIcon class="text-[32px] text-[#999]" />
                  </div>
                </div>
                <div>
                  <div class="text-[24px] text-[#666] mb-[8px]">会议设备</div>
                  <t-checkbox-group v-model="form.equipment" class="flex flex-wrap gap-[12px]">
                    <t-checkbox value="projector">投影仪</t-checkbox>
                    <t-checkbox value="whiteboard">白板</t-checkbox>
                    <t-checkbox value="video_conference">视频会议</t-checkbox>
                    <t-checkbox value="microphone">麦克风</t-checkbox>
                  </t-checkbox-group>
                </div>
              </div>
              <t-button
                theme="primary"
                class="mt-[24px]"
                :loading="recommending"
                @click="handleRecommend"
              >
                开始推荐
              </t-button>
            </div>

            <!-- 推荐结果 -->
            <div v-if="recommendations.length > 0" class="flex flex-col gap-[12px] px-[24px] pb-[24px]">
              <div
                v-for="(item, index) in recommendations"
                :key="index"
                :class="[
                  'flex items-center p-[20px] rounded-[16px] cursor-pointer transition-all border-[2px]',
                  selectedRoom === index
                    ? 'border-[#0052D9] bg-[#e8f4ff]'
                    : 'border-transparent bg-[#f5f7fa]'
                ]"
                @click="handleSelectRoom(index)"
              >
                <div class="flex-1">
                  <div class="text-[28px] font-medium text-[#333] mb-[8px]">{{ item.room.name }}</div>
                  <div class="text-[22px] text-[#666]">
                    {{ item.room.floor }} · 容量 {{ item.room.capacity }}人
                  </div>
                </div>
                <div class="text-center mr-[24px]">
                  <div class="text-[36px] font-bold text-[#0052D9]">{{ item.score }}</div>
                  <div class="text-[22px] text-[#666]">推荐指数</div>
                </div>
                <div class="flex flex-wrap gap-[8px]">
                  <t-tag
                    v-for="reason in item.reasons"
                    :key="reason"
                    theme="primary"
                    variant="light"
                    size="small"
                  >
                    {{ reason }}
                  </t-tag>
                </div>
              </div>
            </div>

            <!-- 无推荐结果 -->
            <div v-else class="flex items-center justify-center py-[60px]">
              <div class="text-center">
                <LightbulbIcon class="text-[64px] text-[#999] mb-[16px]" />
                <div class="text-[26px] text-[#999]">请输入推荐条件开始推荐</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：可用时段 -->
        <div class="w-[360px]">
          <!-- 可用时段卡片 -->
          <div class="bg-white rounded-[16px] shadow-sm mb-[24px] overflow-hidden">
            <div class="px-[24px] py-[16px] border-b border-[#eee]">
              <span class="text-[28px] font-medium text-[#333]">可用时段</span>
            </div>
            <div class="p-[24px]">
              <div v-if="selectedRoom !== null" class="grid grid-cols-2 gap-[8px]">
                <div
                  v-for="slot in recommendations[selectedRoom]?.availableSlots || []"
                  :key="slot.start"
                  :class="[
                    'flex flex-col items-center justify-center p-[16px] rounded-[12px] cursor-pointer transition-all',
                    slot.available
                      ? 'bg-[#ECFDF5] text-[#10B981]'
                      : 'bg-[#f5f7fa] text-[#999] cursor-not-allowed'
                  ]"
                  @click="slot.available && handleSelectTime(slot)"
                >
                  <span class="text-[24px] font-medium">{{ slot.start }}-{{ slot.end }}</span>
                  <span class="text-[20px]">{{ slot.available ? '可预约' : '已占用' }}</span>
                </div>
              </div>
              <div v-else class="flex items-center justify-center py-[60px]">
                <div class="text-center text-[#999]">
                  <TimeIcon class="text-[48px] mb-[16px]" />
                  <div class="text-[24px]">请先选择会议室</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 今日会议安排卡片 -->
          <div class="bg-white rounded-[16px] shadow-sm overflow-hidden">
            <div class="px-[24px] py-[16px] border-b border-[#eee]">
              <span class="text-[28px] font-medium text-[#333]">今日会议安排</span>
            </div>
            <div class="p-[24px]">
              <div class="flex flex-col gap-[12px]">
                <div
                  v-for="meeting in todayMeetings"
                  :key="meeting.id"
                  class="flex gap-[16px] p-[16px] bg-[#f5f7fa] rounded-[12px] border-l-[4px] border-[#0052D9]"
                >
                  <div class="text-[24px] font-medium text-[#0052D9] min-w-[60px]">{{ meeting.time }}</div>
                  <div>
                    <div class="text-[24px] font-medium text-[#333]">{{ meeting.title }}</div>
                    <div class="text-[22px] text-[#666]">{{ meeting.room }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 时长选择器弹窗 -->
    <t-picker
      v-model:visible="showDurationPicker"
      :columns="[durationOptions]"
      :default-value="[form.duration]"
      @confirm="handleDurationConfirm"
    />

    <!-- 日期选择器弹窗 -->
    <t-date-time-picker
      v-model:visible="showDatePicker"
      v-model="form.date"
      mode="date"
      title="选择会议日期"
      @confirm="handleDateConfirm"
    />
  </Root>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import {
  RefreshIcon,
  LightbulbIcon,
  TimeIcon,
  ChevronDownIcon,
  CalendarIcon
} from 'tdesign-icons-vue-next';
import Root from '@/components/root/index.vue';
import {
  recommendMeetingRooms,
  getAvailableSlots,
  getMeetingRooms
} from '@/api/schedule';

// 时长选项
const durationOptions = [
  { label: '30分钟', value: 30 },
  { label: '1小时', value: 60 },
  { label: '1.5小时', value: 90 },
  { label: '2小时', value: 120 }
];

// 表单数据
const form = ref({
  attendees: 5,
  duration: 60,
  date: new Date(),
  equipment: []
});

const showDurationPicker = ref(false);
const showDatePicker = ref(false);

const recommending = ref(false);
const recommendations = ref([]);
const selectedRoom = ref(null);
const selectedTime = ref(null);

// 今日会议
const todayMeetings = ref([
  { id: 1, time: '10:00', title: '部门例会', room: '第一会议室' },
  { id: 2, time: '14:00', title: '项目评审', room: '第三会议室' },
  { id: 3, time: '16:00', title: '周报会议', room: '第一会议室' }
]);

// 格式化日期
const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// 方法
const handleDurationConfirm = (value) => {
  form.value.duration = value[0];
  showDurationPicker.value = false;
};

const handleDateConfirm = () => {
  showDatePicker.value = false;
};

const handleRecommend = async () => {
  recommending.value = true;
  try {
    const res = await recommendMeetingRooms({
      attendees: form.value.attendees,
      duration: form.value.duration,
      date: form.value.date,
      equipment: form.value.equipment
    });
    if (res.data) {
      recommendations.value = res.data;
      selectedRoom.value = null;
    }
  } catch (error) {
    console.error('推荐失败:', error);
    // 模拟数据
    recommendations.value = [
      {
        room: {
          id: 1,
          name: '第一会议室',
          floor: '1楼',
          capacity: 10
        },
        score: 95,
        reasons: ['容量合适', '设备齐全', '距离最近'],
        availableSlots: [
          { start: '09:00', end: '10:00', available: true },
          { start: '10:00', end: '11:00', available: true },
          { start: '14:00', end: '15:00', available: true },
          { start: '15:00', end: '16:00', available: false }
        ]
      },
      {
        room: {
          id: 2,
          name: '第二会议室',
          floor: '1楼',
          capacity: 6
        },
        score: 85,
        reasons: ['容量合适', '空闲时间多'],
        availableSlots: [
          { start: '09:00', end: '10:00', available: true },
          { start: '10:00', end: '11:00', available: true },
          { start: '11:00', end: '12:00', available: true },
          { start: '14:00', end: '15:00', available: true }
        ]
      }
    ];
    selectedRoom.value = null;
  } finally {
    recommending.value = false;
  }
};

const handleRefresh = () => {
  handleRecommend();
};

const handleSelectRoom = (index) => {
  selectedRoom.value = index;
};

const handleSelectTime = (slot) => {
  selectedTime.value = slot;
  console.log('选择时间:', slot);
};

onMounted(() => {
  // 初始化加载
});
</script>

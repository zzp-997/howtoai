<template>
  <Root title="智能推荐" back-url="/user/meeting">
    <div class="min-h-screen bg-[#f5f7fa] pb-[32px]">
      <div class="flex p-[24px] gap-[24px]">
        <!-- 左侧：智能推荐 -->
        <div class="flex-1">
          <t-card title="智能推荐会议室" class="shadow-sm mb-[24px]">
            <template #actions>
              <t-button variant="text" @click="handleRefresh">
                <template #icon><RefreshIcon /></template>
                重新推荐
              </t-button>
            </template>

            <!-- 推荐条件 -->
            <div class="mb-[24px]">
              <div class="grid grid-cols-2 gap-[16px]">
                <div>
                  <div class="text-[24px] text-[#666] mb-[8px]">参会人数</div>
                  <t-input-number
                    v-model="form.attendees"
                    :min="1"
                    :max="50"
                    class="w-full"
                  />
                </div>
                <div>
                  <div class="text-[24px] text-[#666] mb-[8px]">会议时长</div>
                  <t-select v-model="form.duration" class="w-full">
                    <t-option :value="30" label="30分钟" />
                    <t-option :value="60" label="1小时" />
                    <t-option :value="90" label="1.5小时" />
                    <t-option :value="120" label="2小时" />
                  </t-select>
                </div>
                <div>
                  <div class="text-[24px] text-[#666] mb-[8px]">会议日期</div>
                  <t-date-picker
                    v-model="form.date"
                    enable-time-picker
                    class="w-full"
                    :disable-date="disabledDate"
                  />
                </div>
                <div>
                  <div class="text-[24px] text-[#666] mb-[8px]">会议设备</div>
                  <div class="flex flex-wrap gap-[12px]">
                    <t-checkbox v-model="form.equipment" value="projector">投影仪</t-checkbox>
                    <t-checkbox v-model="form.equipment" value="whiteboard">白板</t-checkbox>
                    <t-checkbox v-model="form.equipment" value="video_conference">视频会议</t-checkbox>
                    <t-checkbox v-model="form.equipment" value="microphone">麦克风</t-checkbox>
                  </div>
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
            <div v-if="recommendations.length > 0" class="flex flex-col gap-[12px]">
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
          </t-card>
        </div>

        <!-- 右侧：可用时段 -->
        <div class="w-[360px]">
          <t-card title="可用时段" class="shadow-sm mb-[24px]">
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
          </t-card>

          <!-- 今日会议安排 -->
          <t-card title="今日会议安排" class="shadow-sm">
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
          </t-card>
        </div>
      </div>
    </div>
  </Root>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import {
  RefreshIcon,
  LightbulbIcon,
  TimeIcon
} from 'tdesign-icons-vue-next';
import Root from '@/components/root/index.vue';
import {
  recommendMeetingRooms,
  getAvailableSlots,
  getMeetingRooms
} from '@/api/schedule';

// 表单数据
const form = ref({
  attendees: 5,
  duration: 60,
  date: new Date(),
  equipment: []
});

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

// 方法
const disabledDate = (date) => {
  return date < new Date();
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
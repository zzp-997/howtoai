<template>
  <Root title="新建预定" back-url="/user/meeting">
    <div class="min-h-screen bg-[#f5f7fa] pb-[160px]">
      <!-- 会议室信息 -->
      <div class="flex items-center gap-[20px] bg-gradient-to-br from-[#0052D9] to-[#266FE8] p-[32px] text-white">
        <div class="w-[80px] h-[80px] bg-white/20 rounded-[24px] flex items-center justify-center">
          <CalendarIcon class="text-[40px]" />
        </div>
        <div>
          <div class="text-[32px] font-semibold mb-[8px]">{{ roomName }}</div>
          <div class="text-[26px] opacity-80">{{ formData.date }}</div>
        </div>
      </div>

      <!-- 表单区域 -->
      <div class="p-[24px] px-[32px]">
        <div class="bg-white rounded-[24px] mb-[16px] overflow-hidden shadow-sm">
          <div class="flex justify-between items-center p-[24px] border-b border-[#f0f0f0]" @click="showStartPicker = true">
            <div class="text-[28px] text-[#333]">开始时间</div>
            <div class="flex items-center text-[28px]">
              <span :class="formData.startTime ? 'text-[#0052D9] font-medium' : 'text-[#999]'">{{ formData.startTime || '请选择' }}</span>
              <ChevronRightIcon class="text-[28px] text-[#ccc] ml-[8px]" />
            </div>
          </div>
          <div class="flex justify-between items-center p-[24px]" @click="showEndPicker = true">
            <div class="text-[28px] text-[#333]">结束时间</div>
            <div class="flex items-center text-[28px]">
              <span :class="formData.endTime ? 'text-[#0052D9] font-medium' : 'text-[#999]'">{{ formData.endTime || '请选择' }}</span>
              <ChevronRightIcon class="text-[28px] text-[#ccc] ml-[8px]" />
            </div>
          </div>
        </div>

        <div class="bg-white rounded-[24px] p-[24px] shadow-sm">
          <div class="text-[28px] text-[#333] mb-[16px]">会议主题</div>
          <t-input v-model="formData.subject" placeholder="请输入会议主题" :bordered="false" class="bg-[#f5f7fa] rounded-[12px] p-[20px]" />
        </div>

        <!-- 加入待办选项 -->
        <div class="bg-white rounded-[24px] p-[24px] shadow-sm mt-[16px]">
          <div class="flex justify-between items-center">
            <div>
              <div class="text-[28px] text-[#333]">加入待办</div>
              <div class="text-[24px] text-[#999]">将会议添加到待办列表</div>
            </div>
            <t-switch v-model="formData.addToTodo" size="large" />
          </div>
        </div>
      </div>

      <!-- 时间预览 -->
      <div v-if="formData.startTime && formData.endTime" class="mx-[32px] p-[24px] bg-gradient-to-br from-[#00A870] to-[#2BA471] rounded-[24px] text-white text-center">
        <div class="text-[24px] opacity-80 mb-[12px]">预定时段</div>
        <div class="text-[36px] font-semibold mb-[8px]">{{ formData.startTime }} - {{ formData.endTime }}</div>
        <div class="text-[26px] opacity-80">共 {{ calculateDuration() }} 分钟</div>
      </div>

      <!-- 底部操作栏 -->
      <div class="fixed bottom-0 left-0 right-0 px-[32px] py-[24px] pb-safe bg-white shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
        <t-button theme="primary" block size="large" :loading="loading" class="h-[88px] text-[30px] rounded-[16px] !bg-gradient-to-br !from-[#0052D9] !to-[#266FE8]" @click="handleSubmit">
          确认预定
        </t-button>
      </div>
    </div>

    <!-- 开始时间选择弹窗 -->
    <t-popup v-model="showStartPicker" placement="bottom" round>
      <t-picker :columns="timeColumns" title="选择开始时间" @confirm="handleStartConfirm" @cancel="showStartPicker = false" />
    </t-popup>
    <!-- 结束时间选择弹窗 -->
    <t-popup v-model="showEndPicker" placement="bottom" round>
      <t-picker :columns="timeColumns" title="选择结束时间" @confirm="handleEndConfirm" @cancel="showEndPicker = false" />
    </t-popup>
  </Root>
</template>

<script setup>
import { CalendarIcon, ChevronRightIcon } from "tdesign-icons-vue-next"
import { createReservation, checkReservationConflict, createTodo } from "@/api"
import { useUserStore } from "@/store"
import { showToast, showErrorDialog } from "@/utils/common/tools"
import dayjs from "dayjs"
import { useRoute, useRouter } from "vue-router"

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const roomId = Number(route.query.roomId)
const roomName = route.query.roomName || ''
const date = route.query.date || ''

const formData = reactive({ date, startTime: '', endTime: '', subject: '', addToTodo: true })
const loading = ref(false)
const showStartPicker = ref(false)
const showEndPicker = ref(false)

const timeColumns = computed(() => {
  const times = []
  for (let h = 8; h <= 20; h++) {
    times.push(`${h.toString().padStart(2, '0')}:00`, `${h.toString().padStart(2, '0')}:30`)
  }
  return [times.map(t => ({ label: t, value: t }))]
})

const calculateDuration = () => {
  if (!formData.startTime || !formData.endTime) return 0
  const [sh, sm] = formData.startTime.split(':').map(Number)
  const [eh, em] = formData.endTime.split(':').map(Number)
  return (eh * 60 + em) - (sh * 60 + sm)
}

const handleStartConfirm = (value) => { formData.startTime = value.join(''); showStartPicker.value = false }
const handleEndConfirm = (value) => { formData.endTime = value.join(''); showEndPicker.value = false }

const handleSubmit = async () => {
  if (!formData.startTime) { showToast('请选择开始时间'); return }
  if (!formData.endTime) { showToast('请选择结束时间'); return }
  if (formData.startTime >= formData.endTime) { showToast('结束时间必须大于开始时间'); return }
  if (!formData.subject.trim()) { showToast('请输入会议主题'); return }

  loading.value = true
  try {
    const start = `${formData.date} ${formData.startTime}`
    const end = `${formData.date} ${formData.endTime}`

    // 检查冲突
    const conflictRes = await checkReservationConflict({ roomId, start, end })
    if (conflictRes.data?.hasConflict) {
      const conflict = conflictRes.data.conflict
      showErrorDialog(`该时段已被预定：${conflict.subject}（${conflict.start.split(' ')[1]}-${conflict.end.split(' ')[1]}）`)
      return
    }

    // 创建预定
    const res = await createReservation({ roomId, title: formData.subject, start, end })
    const reservationId = res.data?.id

    // 如果选择加入待办
    if (formData.addToTodo) {
      await createTodo({
        title: `会议：${formData.subject}`,
        taskDate: formData.date,
        dueDate: formData.date,
        priority: 2,
        relatedType: 'meeting',
        relatedId: reservationId
      })
    }

    showToast('预定成功')
    router.back()
  } catch (error) {
    showErrorDialog(error.message || '预定失败')
  } finally {
    loading.value = false
  }
}
</script>

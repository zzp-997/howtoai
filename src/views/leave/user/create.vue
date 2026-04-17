<template>
  <Root title="新建请假申请" back-url="/user/leave">
    <div class="min-h-screen bg-[#f5f7fa] pb-[160px]">
      <!-- 假期余额提示 -->
      <div class="flex items-center justify-center p-[24px] px-[32px] bg-gradient-to-br from-[#0052D9] to-[#266FE8]">
        <div class="text-center">
          <div class="text-[24px] text-white/80 mb-[8px]">年假余额</div>
          <div class="text-[36px] font-bold text-white">{{ userStore.annualLeaveBalance }} 天</div>
        </div>
        <div class="w-[1px] h-[50px] bg-white/30 mx-[48px]"></div>
        <div class="text-center">
          <div class="text-[24px] text-white/80 mb-[8px]">病假余额</div>
          <div class="text-[36px] font-bold text-white">{{ userStore.sickLeaveBalance }} 天</div>
        </div>
      </div>

      <!-- 表单区域 -->
      <div class="p-[24px] px-[32px]">
        <div class="bg-white rounded-[24px] p-[24px] mb-[16px] shadow-sm">
          <div class="text-[28px] font-semibold text-[#333] mb-[20px]">假别类型</div>
          <div class="flex gap-[16px]">
            <div v-for="type in leaveTypes" :key="type.value"
              :class="['flex-1 text-center py-[24px] rounded-[24px] transition-all', form.leaveType === type.value ? 'bg-[rgba(0,82,217,0.1)] border-[2px] border-[#0052D9]' : 'bg-[#f5f7fa]']"
              @click="form.leaveType = type.value">
              <div :class="['w-[64px] h-[64px] mx-auto mb-[12px] rounded-[24px] flex items-center justify-center text-[28px] font-semibold text-white transition-transform', form.leaveType === type.value ? 'scale-110' : '', type.bgClass]">
                {{ type.icon }}
              </div>
              <div class="text-[28px] text-[#333]">{{ type.label }}</div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-[24px] mb-[16px] shadow-sm">
          <t-cell-group theme="card">
            <t-cell title="开始日期" @click="showStartPicker = true">
              <template #note>
                <span :class="form.startDate ? 'text-[#0052D9]' : 'text-[#999]'">{{ form.startDate || '请选择' }}</span>
                <ChevronRightIcon class="text-[#ccc] ml-[8px]" />
              </template>
            </t-cell>
            <t-cell title="结束日期" @click="showEndPicker = true">
              <template #note>
                <span :class="form.endDate ? 'text-[#0052D9]' : 'text-[#999]'">{{ form.endDate || '请选择' }}</span>
                <ChevronRightIcon class="text-[#ccc] ml-[8px]" />
              </template>
            </t-cell>
          </t-cell-group>
          <div v-if="calculatedDays > 0" class="flex justify-between items-center p-[20px] px-[28px] border-t border-[#f0f0f0] mt-[16px]">
            <span class="text-[28px] text-[#666]">请假天数</span>
            <span class="text-[36px] font-bold text-[#0052D9]">{{ calculatedDays }} 天</span>
          </div>
        </div>

        <div class="bg-white rounded-[24px] p-[24px] mb-[16px] shadow-sm">
          <div class="text-[28px] font-semibold text-[#333] mb-[16px]">请假事由</div>
          <t-textarea v-model="form.reason" placeholder="请输入请假事由" :maxlength="200" :autosize="{ minRows: 3, maxRows: 5 }" />
        </div>

        <div v-if="balanceWarning" class="flex items-center gap-[12px] p-[20px] px-[24px] bg-[#FFF3E0] rounded-[24px] text-[26px] text-[#E34D59]">
          <ErrorCircleIcon class="text-[32px] flex-shrink-0" />
          <span>{{ balanceWarning }}</span>
        </div>
      </div>

      <!-- 底部操作栏 -->
      <div class="fixed bottom-0 left-0 right-0 px-[32px] py-[24px] pb-safe bg-white shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
        <t-button theme="primary" block size="large" :loading="loading" class="h-[88px] text-[30px] rounded-[24px] !bg-gradient-to-br !from-[#0052D9] !to-[#266FE8]" @click="handleSubmit">提交申请</t-button>
      </div>
    </div>

    <!-- 开始日期选择弹窗 -->
    <t-popup v-model="showStartPicker" placement="bottom" round>
      <t-date-time-picker mode="date" format="YYYY-MM-DD" title="选择开始日期" @confirm="v => { form.startDate = v; showStartPicker = false }" @cancel="showStartPicker = false" />
    </t-popup>
    <!-- 结束日期选择弹窗 -->
    <t-popup v-model="showEndPicker" placement="bottom" round>
      <t-date-time-picker mode="date" format="YYYY-MM-DD" title="选择结束日期" @confirm="v => { form.endDate = v; showEndPicker = false }" @cancel="showEndPicker = false" />
    </t-popup>
  </Root>
</template>

<script setup>
import { ChevronRightIcon, ErrorCircleIcon } from "tdesign-icons-vue-next"
import { createLeave } from "@/api/leaves"
import { useUserStore } from "@/store"
import { showToast, showErrorDialog } from "@/utils/common/tools"
import { useRouter } from "vue-router"
import dayjs from "dayjs"

const router = useRouter()
const userStore = useUserStore()
const leaveTypes = [
  { label: '年假', value: 'annual', icon: '年', bgClass: 'bg-gradient-to-br from-[#0052D9] to-[#266FE8]' },
  { label: '病假', value: 'sick', icon: '病', bgClass: 'bg-gradient-to-br from-[#00A870] to-[#2BA471]' },
  { label: '事假', value: 'personal', icon: '事', bgClass: 'bg-gradient-to-br from-[#ED7B2F] to-[#F09143]' }
]
const form = reactive({ leaveType: 'annual', startDate: '', endDate: '', reason: '' })
const loading = ref(false)
const showStartPicker = ref(false)
const showEndPicker = ref(false)

// 计算请假天数
const calculatedDays = computed(() => {
  if (!form.startDate || !form.endDate) return 0
  return dayjs(form.endDate).diff(dayjs(form.startDate), 'day') + 1
})

const balanceWarning = computed(() => {
  if (form.leaveType === 'personal') return ''
  if (form.leaveType === 'annual' && calculatedDays.value > userStore.annualLeaveBalance) return `年假余额不足，当前余额 ${userStore.annualLeaveBalance} 天`
  if (form.leaveType === 'sick' && calculatedDays.value > userStore.sickLeaveBalance) return `病假余额不足，当前余额 ${userStore.sickLeaveBalance} 天`
  return ''
})

const handleSubmit = async () => {
  if (!form.startDate) { showToast('请选择开始日期'); return }
  if (!form.endDate) { showToast('请选择结束日期'); return }
  if (form.startDate > form.endDate) { showToast('结束日期不能早于开始日期'); return }
  if (!form.reason.trim()) { showToast('请输入请假事由'); return }
  if (balanceWarning.value) { showToast(balanceWarning.value); return }

  loading.value = true
  try {
    await createLeave({
      leaveType: form.leaveType,
      startDate: form.startDate,
      endDate: form.endDate,
      reason: form.reason.trim()
    })
    showToast('提交成功')
    router.back()
  } catch (error) {
    showErrorDialog(error.message || '提交失败')
  } finally {
    loading.value = false
  }
}
</script>

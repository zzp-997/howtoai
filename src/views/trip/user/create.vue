<template>
  <Root title="新建差旅申请" back-url="/user/trip">
    <div class="min-h-screen bg-[#f5f7fa] pb-[160px]">
      <!-- 表单区域 -->
      <div class="p-[24px] px-[32px]">
        <!-- 基本信息 -->
        <div class="bg-white rounded-[24px] mb-[16px] overflow-hidden shadow-sm">
          <div class="p-[24px] pb-[20px] border-b border-[#f0f0f0]">
            <div class="text-[28px] font-semibold text-[#333]">基本信息</div>
          </div>
          <div class="p-[24px] pt-[20px]">
            <!-- 出差事由 -->
            <div class="mb-[28px]">
              <div class="text-[26px] text-[#666] mb-[12px]">出差事由</div>
              <t-input v-model="form.reason" placeholder="请输入出差事由" :bordered="false" class="bg-[#f5f7fa] rounded-[12px] px-[20px] py-[16px]" />
            </div>
            <!-- 目的地 -->
            <div class="mb-[28px]">
              <div class="text-[26px] text-[#666] mb-[12px]">目的地</div>
              <t-input v-model="form.destination" placeholder="请输入目的地" :bordered="false" class="bg-[#f5f7fa] rounded-[12px] px-[20px] py-[16px]" />
            </div>
            <!-- 日期选择 -->
            <div class="flex gap-[16px]">
              <div class="flex-1">
                <div class="text-[26px] text-[#666] mb-[12px]">开始日期</div>
                <div class="bg-[#f5f7fa] rounded-[12px] px-[20px] py-[16px] flex items-center justify-between" @click="showStartPicker = true">
                  <span :class="['text-[28px]', form.startDate ? 'text-[#333]' : 'text-[#999]']">{{ form.startDate || '请选择' }}</span>
                  <ChevronRightIcon class="text-[24px] text-[#ccc]" />
                </div>
              </div>
              <div class="flex-1">
                <div class="text-[26px] text-[#666] mb-[12px]">结束日期</div>
                <div class="bg-[#f5f7fa] rounded-[12px] px-[20px] py-[16px] flex items-center justify-between" @click="showEndPicker = true">
                  <span :class="['text-[28px]', form.endDate ? 'text-[#333]' : 'text-[#999]']">{{ form.endDate || '请选择' }}</span>
                  <ChevronRightIcon class="text-[24px] text-[#ccc]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 预估费用 -->
        <div class="bg-white rounded-[24px] mb-[16px] shadow-sm">
          <div class="p-[24px] pb-[20px] border-b border-[#f0f0f0]">
            <div class="text-[28px] font-semibold text-[#333]">预估费用</div>
          </div>
          <div class="p-[24px] pt-[20px]">
            <!-- 交通费 -->
            <div class="mb-[28px]">
              <div class="text-[26px] text-[#666] mb-[12px]">交通费</div>
              <div class="bg-[#f5f7fa] rounded-[12px] px-[20px] py-[16px] flex items-center">
                <span class="text-[26px] text-[#999] mr-[8px]">¥</span>
                <t-input v-model.number="form.estTransportFee" placeholder="0" type="number" :bordered="false" class="flex-1" />
              </div>
            </div>
            <!-- 住宿费 -->
            <div class="mb-[20px]">
              <div class="text-[26px] text-[#666] mb-[12px]">住宿费</div>
              <div class="bg-[#f5f7fa] rounded-[12px] px-[20px] py-[16px] flex items-center">
                <span class="text-[26px] text-[#999] mr-[8px]">¥</span>
                <t-input v-model.number="form.estAccomFee" placeholder="0" type="number" :bordered="false" class="flex-1" />
              </div>
            </div>
            <!-- 总计 -->
            <div class="flex justify-between items-center p-[20px] bg-gradient-to-br from-[#0052D9]/10 to-[#266FE8]/10 rounded-[12px]">
              <span class="text-[28px] text-[#666]">预估总计</span>
              <span class="text-[36px] font-bold text-[#0052D9]">¥{{ totalFee }}</span>
            </div>
          </div>
        </div>

        <!-- 附件 -->
        <div class="bg-white rounded-[24px] p-[24px] shadow-sm">
          <div class="text-[28px] font-semibold text-[#333] mb-[16px]">附件（可选）</div>
          <t-upload v-model="form.attachments" :max="3" :size-limit="{ size: 20, unit: 'MB' }" />
        </div>
      </div>

      <!-- 底部操作栏 -->
      <div class="fixed bottom-0 left-0 right-0 px-[32px] py-[24px] pb-safe bg-white shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
        <t-button theme="primary" block size="large" :loading="loading" class="h-[88px] text-[30px] rounded-[16px] !bg-gradient-to-br !from-[#0052D9] !to-[#266FE8]" @click="handleSubmit">提交申请</t-button>
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
import { ChevronRightIcon } from "tdesign-icons-vue-next"
import { tripRepo } from "@/db/repositories"
import { useUserStore } from "@/store"
import { showToast, showErrorDialog } from "@/utils/common/tools"
import { useRouter } from "vue-router"

const router = useRouter()
const userStore = useUserStore()
const form = reactive({ reason: '', destination: '', startDate: '', endDate: '', estTransportFee: 0, estAccomFee: 0, attachments: [] })
const loading = ref(false)
const showStartPicker = ref(false)
const showEndPicker = ref(false)
const totalFee = computed(() => (Number(form.estTransportFee) || 0) + (Number(form.estAccomFee) || 0))

const handleSubmit = async () => {
  if (!form.reason.trim()) { showToast('请输入出差事由'); return }
  if (!form.destination.trim()) { showToast('请输入目的地'); return }
  if (!form.startDate) { showToast('请选择开始日期'); return }
  if (!form.endDate) { showToast('请选择结束日期'); return }
  if (form.startDate > form.endDate) { showToast('结束日期不能早于开始日期'); return }

  loading.value = true
  try {
    const attachments = await Promise.all(form.attachments.map(async (file) => {
      if (file.raw) {
        const blob = await file.raw.arrayBuffer()
        return { name: file.name, blob: new Blob([blob], { type: file.raw.type }) }
      }
      return null
    })).then(arr => arr.filter(Boolean))

    await tripRepo.create({
      userId: userStore.userId, reason: form.reason, destination: form.destination, startDate: form.startDate, endDate: form.endDate,
      estTransportFee: Number(form.estTransportFee) || 0, estAccomFee: Number(form.estAccomFee) || 0, attachments, status: 'pending', createdAt: new Date()
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

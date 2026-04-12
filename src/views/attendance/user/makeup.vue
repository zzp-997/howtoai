<template>
  <Root title="补卡申请" back-url="/user/attendance">
    <div class="min-h-screen bg-[#f5f7fa]">
      <!-- 新增按钮 -->
      <div class="p-[24px] px-[32px]">
        <t-button theme="primary" block size="large" class="h-[88px] text-[30px] rounded-[24px] !bg-gradient-to-br !from-[#0052D9] !to-[#266FE8]" @click="showDialog = true">
          <template #icon><AddIcon /></template>
          新建补卡申请
        </t-button>
      </div>

      <!-- 申请列表 -->
      <div class="px-[32px]">
        <div v-if="makeUps.length === 0" class="text-center py-[80px]">
          <TimeIcon class="text-[80px] text-[#ddd] mb-[20px]" />
          <div class="text-[28px] text-[#999]">暂无补卡申请</div>
        </div>

        <div v-for="makeup in makeUps" :key="makeup.id" class="bg-white rounded-[24px] mb-[16px] overflow-hidden shadow-sm">
          <div class="flex justify-between items-center p-[24px] bg-[#f9fafb]">
            <div class="flex items-center gap-[16px]">
              <div :class="['w-[56px] h-[56px] rounded-[14px] flex items-center justify-center text-[28px] font-semibold text-white', makeup.type === 'checkIn' ? 'bg-gradient-to-br from-[#0052D9] to-[#266FE8]' : 'bg-gradient-to-br from-[#ED7B2F] to-[#F09143]']">
                {{ makeup.type === 'checkIn' ? '上' : '下' }}
              </div>
              <div>
                <div class="text-[30px] font-semibold text-[#333]">{{ makeup.type === 'checkIn' ? '上班' : '下班' }}补卡</div>
                <div class="text-[24px] text-[#999] mt-[6px]">{{ makeup.date }}</div>
              </div>
            </div>
            <div :class="['px-[16px] py-[8px] rounded-[8px] text-[24px]', {
              'bg-[#FFF3E0] text-[#ED7B2F]': makeup.status === 'pending',
              'bg-[#E8F5E9] text-[#00A870]': makeup.status === 'approved',
              'bg-[#FFEBEE] text-[#E34D59]': makeup.status === 'rejected'
            }]">{{ getStatusLabel(makeup.status) }}</div>
          </div>
          <div class="p-[24px] px-[24px] text-[26px] text-[#666]">原因：{{ makeup.reason }}</div>
          <div v-if="makeup.approvalComment" class="px-[24px] py-[16px] bg-[#fff8e1] text-[24px] text-[#666]">审批意见：{{ makeup.approvalComment }}</div>
        </div>
      </div>
    </div>

    <!-- 新建补卡弹窗 -->
    <t-dialog v-model:visible="showDialog" title="新建补卡申请" :confirm-btn="{ content: '提交', theme: 'primary' }" @confirm="handleSubmit">
      <div class="p-[24px]">
        <t-cell-group theme="card">
          <t-cell title="补卡日期" @click="showDatePicker = true">
            <template #note>
              <span :class="form.date ? 'text-[#0052D9]' : 'text-[#999]'">{{ form.date || '请选择' }}</span>
              <ChevronRightIcon class="text-[#ccc] ml-[8px]" />
            </template>
          </t-cell>
        </t-cell-group>
        <div class="p-[24px]">
          <div class="text-[28px] text-[#333] mb-[16px]">补卡类型</div>
          <div class="flex gap-[16px]">
            <div :class="['flex-1 py-[20px] text-center rounded-[12px] text-[28px] transition-all', form.type === 'checkIn' ? 'bg-[rgba(0,82,217,0.1)] text-[#0052D9] border-[2px] border-[#0052D9]' : 'bg-[#f5f7fa] text-[#666]']" @click="form.type = 'checkIn'">上班打卡</div>
            <div :class="['flex-1 py-[20px] text-center rounded-[12px] text-[28px] transition-all', form.type === 'checkOut' ? 'bg-[rgba(0,82,217,0.1)] text-[#0052D9] border-[2px] border-[#0052D9]' : 'bg-[#f5f7fa] text-[#666]']" @click="form.type = 'checkOut'">下班打卡</div>
          </div>
        </div>
        <t-input v-model="form.reason" placeholder="请输入补卡原因" class="mt-[20px]" />
      </div>
    </t-dialog>

    <!-- 日期选择弹窗 -->
    <t-popup v-model="showDatePicker" placement="bottom" round>
      <t-date-time-picker mode="date" format="YYYY-MM-DD" title="选择日期" @confirm="v => { form.date = v; showDatePicker = false }" @cancel="showDatePicker = false" />
    </t-popup>
  </Root>
</template>

<script setup>
import { AddIcon, TimeIcon, ChevronRightIcon } from "tdesign-icons-vue-next"
import { makeUpRequestRepo } from "@/db/repositories"
import { useUserStore } from "@/store"
import { showToast } from "@/utils/common/tools"
import dayjs from "dayjs"

const userStore = useUserStore()
const makeUps = ref([])
const showDialog = ref(false)
const showDatePicker = ref(false)
const form = reactive({ date: '', type: 'checkIn', reason: '' })

const getStatusLabel = (status) => ({ pending: '待审批', approved: '已通过', rejected: '已拒绝' }[status] || status)

const handleSubmit = async () => {
  if (!form.date) { showToast('请选择补卡日期'); return }
  if (!form.reason.trim()) { showToast('请输入补卡原因'); return }
  await makeUpRequestRepo.create({ userId: userStore.userId, date: form.date, type: form.type, reason: form.reason.trim(), status: 'pending', createdAt: new Date() })
  showToast('提交成功')
  showDialog.value = false
  form.date = ''; form.reason = ''
  loadData()
}

const loadData = async () => { makeUps.value = await makeUpRequestRepo.findByUserIdOrdered(userStore.userId) }

onMounted(() => loadData())
</script>

<template>
  <Root :title="isEditMode ? '编辑报销单' : '填写报销单'" back-url="/user/trip">
    <div class="min-h-screen bg-[#f5f7fa] pb-[180px]">
      <!-- 基本信息卡片 -->
      <div class="bg-gradient-to-br from-[#00A870] to-[#2BA471] p-[32px] text-white">
        <div class="flex items-center gap-[16px] mb-[16px]">
          <div class="w-[60px] h-[60px] bg-white/20 rounded-[18px] flex items-center justify-center">
            <LocationIcon class="text-[32px] text-white" />
          </div>
          <div>
            <div class="text-[32px] font-semibold">{{ expenseData.destination }}</div>
            <div class="text-[22px] opacity-80">{{ expenseData.startDate }} 至 {{ expenseData.endDate }}</div>
          </div>
        </div>
        <div class="text-[24px] opacity-80">{{ expenseData.reason }}</div>
      </div>

      <!-- 费用明细 -->
      <div class="p-[32px]">
        <div class="bg-white rounded-[24px] shadow-sm overflow-hidden">
          <div class="p-[24px] border-b border-[#f0f0f0]">
            <div class="flex items-center gap-[12px]">
              <div class="w-[40px] h-[40px] bg-gradient-to-br from-[#00A870]/10 to-[#2BA471]/10 rounded-[10px] flex items-center justify-center">
                <MoneyIcon class="text-[22px] text-[#00A870]" />
              </div>
              <div class="text-[28px] font-semibold text-[#333]">费用明细</div>
            </div>
          </div>

          <div class="p-[24px]">
            <div
              v-for="(expense, idx) in expenseData.expenses"
              :key="idx"
              class="mb-[20px] last:mb-0"
            >
              <div class="flex items-center justify-between mb-[12px]">
                <div class="text-[26px] font-medium text-[#333]">{{ expense.category }}</div>
                <div v-if="expense.estimated > 0" class="text-[22px] text-[#999]">
                  预估：¥{{ expense.estimated }}-{{ expense.estimatedMax }}
                </div>
              </div>
              <div class="flex items-center bg-[#f5f7fa] rounded-[16px] px-[20px] py-[16px]">
                <span class="text-[30px] text-[#333]">¥</span>
                <t-input
                  v-model="expense.actual"
                  type="number"
                  placeholder="请输入实际金额"
                  :bordered="false"
                  class="flex-1 text-[30px] text-[#333] ml-[8px]"
                />
              </div>
            </div>

            <!-- 费用汇总 -->
            <div class="mt-[24px] pt-[24px] border-t border-[#f0f0f0]">
              <div class="flex items-center justify-between">
                <div class="text-[28px] font-semibold text-[#333]">费用汇总</div>
                <div class="text-[36px] font-bold text-[#00A870]">
                  ¥{{ totalActual }}
                </div>
              </div>
              <div v-if="expenseData.totalEstimated > 0" class="text-[22px] text-[#999] mt-[8px]">
                预估范围：¥{{ expenseData.totalEstimated }} - {{ expenseData.totalEstimatedMax }}
              </div>
            </div>
          </div>
        </div>

        <!-- 备注 -->
        <div class="bg-white rounded-[24px] p-[24px] mt-[16px] shadow-sm">
          <div class="text-[26px] font-medium text-[#333] mb-[12px]">备注</div>
          <t-textarea
            v-model="expenseData.remark"
            placeholder="可选，填写补充说明"
            :bordered="false"
            class="bg-[#f5f7fa] rounded-[16px] p-[16px]"
            :maxlength="200"
          />
        </div>
      </div>

      <!-- 底部操作栏 -->
      <div class="fixed bottom-0 left-0 right-0 px-[32px] py-[24px] pb-safe bg-white shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
        <div class="flex gap-[16px]">
          <t-button
            theme="default"
            size="large"
            class="flex-1 h-[88px] text-[28px] rounded-[16px]"
            :loading="savingDraft"
            @click="handleSaveDraft"
          >
            保存草稿
          </t-button>
          <t-button
            theme="primary"
            size="large"
            class="flex-1 h-[88px] text-[28px] rounded-[16px] !bg-gradient-to-br !from-[#00A870] !to-[#2BA471]"
            :loading="submitting"
            @click="handleSubmit"
          >
            提交报销
          </t-button>
        </div>
      </div>
    </div>
  </Root>
</template>

<script setup>
import { LocationIcon, MoneyIcon } from "tdesign-icons-vue-next"
import { expenseClaimRepo } from "@/db/repositories"
import { generateExpenseFromTrip } from "@/utils/smartRecommend"
import { useUserStore } from "@/store"
import { showToast, showErrorDialog } from "@/utils/common/tools"
import { useRoute, useRouter } from "vue-router"

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const tripId = Number(route.query.tripId)
const editingId = route.query.editId ? Number(route.query.editId) : null
const isEditMode = !!editingId

const expenseData = ref({
  tripId,
  reason: '',
  destination: '',
  startDate: '',
  endDate: '',
  expenses: [],
  totalEstimated: 0,
  totalEstimatedMax: 0,
  totalActual: 0,
  remark: ''
})

const savingDraft = ref(false)
const submitting = ref(false)

// 计算总金额
const totalActual = computed(() => {
  return expenseData.value.expenses.reduce((sum, e) => sum + (Number(e.actual) || 0), 0)
})

// 加载数据
const loadData = async () => {
  if (isEditMode) {
    // 编辑模式：加载已有报销单
    const claim = await expenseClaimRepo.findById(editingId)
    if (claim) {
      expenseData.value = {
        ...claim,
        remark: claim.remark || ''
      }
    }
  } else if (tripId) {
    // 新建模式：从差旅生成预填数据
    // 先检查是否已有报销单
    const existing = await expenseClaimRepo.findByTripId(tripId)
    if (existing) {
      expenseData.value = {
        ...existing,
        remark: existing.remark || ''
      }
      return
    }

    // 获取差旅信息并生成预填数据
    const { tripRepo } = await import('@/db/repositories')
    const trip = await tripRepo.findById(tripId)
    if (trip) {
      const generated = await generateExpenseFromTrip(trip)
      expenseData.value = {
        ...generated,
        remark: ''
      }
    }
  }
}

// 保存草稿
const handleSaveDraft = async () => {
  savingDraft.value = true
  try {
    const data = {
      tripId: expenseData.value.tripId,
      userId: userStore.userId,
      reason: expenseData.value.reason,
      destination: expenseData.value.destination,
      startDate: expenseData.value.startDate,
      endDate: expenseData.value.endDate,
      expenses: expenseData.value.expenses,
      totalEstimated: expenseData.value.totalEstimated,
      totalEstimatedMax: expenseData.value.totalEstimatedMax,
      totalActual: totalActual.value,
      remark: expenseData.value.remark,
      status: 'draft'
    }

    if (isEditMode) {
      await expenseClaimRepo.updateClaim(editingId, data)
    } else {
      await expenseClaimRepo.createClaim(data)
    }

    showToast('已保存草稿')
    router.back()
  } catch (error) {
    showErrorDialog(error.message || '保存失败')
  } finally {
    savingDraft.value = false
  }
}

// 提交报销
const handleSubmit = async () => {
  if (totalActual.value <= 0) {
    showToast('请至少填写一项费用')
    return
  }

  submitting.value = true
  try {
    const data = {
      tripId: expenseData.value.tripId,
      userId: userStore.userId,
      reason: expenseData.value.reason,
      destination: expenseData.value.destination,
      startDate: expenseData.value.startDate,
      endDate: expenseData.value.endDate,
      expenses: expenseData.value.expenses,
      totalEstimated: expenseData.value.totalEstimated,
      totalEstimatedMax: expenseData.value.totalEstimatedMax,
      totalActual: totalActual.value,
      remark: expenseData.value.remark,
      status: 'submitted',
      submittedAt: new Date()
    }

    if (isEditMode) {
      await expenseClaimRepo.updateClaim(editingId, data)
    } else {
      // 检查是否已有草稿
      const existing = await expenseClaimRepo.findByTripId(tripId)
      if (existing) {
        await expenseClaimRepo.updateClaim(existing.id, data)
      } else {
        await expenseClaimRepo.createClaim(data)
      }
    }

    showToast('报销单已提交')
    router.back()
  } catch (error) {
    showErrorDialog(error.message || '提交失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

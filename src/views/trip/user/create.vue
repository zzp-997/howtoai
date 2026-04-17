<template>
  <Root :title="isEditMode ? '编辑差旅申请' : '新建差旅申请'" back-url="/user/trip">
    <div class="min-h-screen bg-[#f5f7fa] pb-[160px]">
      <!-- 表单区域 -->
      <div class="p-[24px] px-[32px]">
        <!-- 快捷模板 -->
        <div v-if="!isEditMode && tripTemplates.length > 0" class="bg-white rounded-[24px] mb-[16px] overflow-hidden shadow-sm">
          <div class="p-[24px] pb-[20px] border-b border-[#f0f0f0]">
            <div class="flex items-center justify-between">
              <div class="text-[28px] font-semibold text-[#333]">快速模板</div>
              <div class="text-[24px] text-[#0052D9]" @click="showTemplateManager = true">管理模板</div>
            </div>
          </div>
          <div class="p-[20px] pt-[16px] flex gap-[12px] overflow-x-auto [scrollbar-width:none]">
            <div
              v-for="tpl in tripTemplates"
              :key="tpl.id"
              class="flex-shrink-0 px-[20px] py-[14px] bg-gradient-to-br from-[#0052D9]/10 to-[#266FE8]/10 rounded-[16px] border border-[#0052D9]/20"
              @click="applyTemplate(tpl)"
            >
              <div class="text-[26px] text-[#0052D9] font-medium">{{ tpl.name }}</div>
              <div class="text-[22px] text-[#999] mt-[4px]">{{ tpl.destination }}</div>
            </div>
            <div
              class="flex-shrink-0 px-[20px] py-[14px] bg-[#f5f7fa] rounded-[16px] border border-dashed border-[#ddd]"
              @click="showSaveTemplate = true"
            >
              <div class="text-[26px] text-[#999]">+ 保存为模板</div>
            </div>
          </div>
        </div>

        <!-- 智能目的地推荐 -->
        <div class="bg-white rounded-[24px] mb-[16px] overflow-hidden shadow-sm">
          <div class="p-[24px] pb-[20px] border-b border-[#f0f0f0]">
            <div class="flex items-center gap-[12px]">
              <div class="w-[40px] h-[40px] bg-gradient-to-br from-[#00A870] to-[#2BA471] rounded-[10px] flex items-center justify-center">
                <LightbulbIcon class="text-[22px] text-white" />
              </div>
              <div>
                <div class="text-[28px] font-semibold text-[#333]">智能推荐</div>
                <div class="text-[22px] text-[#999]">选择目的地获取费用预估</div>
              </div>
            </div>
          </div>
          <div class="p-[20px] pt-[16px]">
            <!-- 目的地选择 -->
            <div class="mb-[20px]">
              <div class="text-[26px] text-[#666] mb-[12px]">目的地城市</div>
              <div class="flex flex-wrap gap-[10px]">
                <div
                  v-for="city in popularCities"
                  :key="city.name"
                  :class="['px-[20px] py-[12px] rounded-[14px] text-[24px] cursor-pointer transition-all',
                    form.destination === city.name ? 'bg-gradient-to-br from-[#0052D9] to-[#266FE8] text-white' : 'bg-[#f5f7fa] text-[#666]']"
                  @click="selectCity(city)"
                >
                  {{ city.name }}
                </div>
              </div>
              <div class="mt-[16px]">
                <t-input v-model="form.destination" placeholder="或手动输入其他城市" :bordered="false" class="bg-[#f5f7fa] rounded-[12px] px-[20px] py-[16px]" @change="onDestinationChange" />
              </div>
            </div>

            <!-- 城市信息卡片 -->
            <div v-if="selectedCityInfo" class="p-[20px] bg-gradient-to-br from-[#00A870]/10 to-[#2BA471]/10 rounded-[16px] border border-[#00A870]/20">
              <div class="flex items-center gap-[10px] mb-[12px]">
                <LocationIcon class="text-[28px] text-[#00A870]" />
                <span class="text-[28px] font-semibold text-[#333]">{{ selectedCityInfo.name }}</span>
                <span class="text-[22px] text-[#999]">{{ selectedCityInfo.region }}</span>
              </div>
              <div class="text-[24px] text-[#666] mb-[12px]">{{ selectedCityInfo.weatherTips }}</div>
              <div class="flex gap-[20px]">
                <div class="flex items-center gap-[8px]">
                  <span class="text-[22px] text-[#999]">预估交通：</span>
                  <span class="text-[26px] font-semibold text-[#00A870]">¥{{ costEstimate.transportFee.min }}-{{ costEstimate.transportFee.max }}</span>
                </div>
                <div class="flex items-center gap-[8px]">
                  <span class="text-[22px] text-[#999]">预估住宿：</span>
                  <span class="text-[26px] font-semibold text-[#00A870]">¥{{ costEstimate.accommodationFee.min }}-{{ costEstimate.accommodationFee.max }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

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
            <!-- 出差天数 -->
            <div v-if="tripDays > 0" class="mt-[16px] text-center py-[12px] bg-[#0052D9]/10 rounded-[12px]">
              <span class="text-[26px] text-[#0052D9]">共 {{ tripDays }} 天</span>
            </div>
          </div>
        </div>

        <!-- 预估费用 -->
        <div class="bg-white rounded-[24px] mb-[16px] shadow-sm">
          <div class="p-[24px] pb-[20px] border-b border-[#f0f0f0]">
            <div class="flex items-center justify-between">
              <div class="text-[28px] font-semibold text-[#333]">预估费用</div>
              <div v-if="costEstimate" class="text-[24px] text-[#00A870]" @click="applyEstimate">使用推荐值</div>
            </div>
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

    <!-- 保存为模板弹窗 -->
    <t-popup v-model="showSaveTemplate" placement="bottom" round>
      <div class="bg-white rounded-t-[24px] p-[32px]">
        <div class="text-[32px] font-semibold text-[#333] mb-[24px]">保存为模板</div>
        <div class="mb-[24px]">
          <div class="text-[26px] text-[#666] mb-[12px]">模板名称</div>
          <t-input v-model="templateName" placeholder="如：上海总部出差" :bordered="false" class="bg-[#f5f7fa] rounded-[12px] px-[20px] py-[16px]" />
        </div>
        <div class="flex gap-[16px]">
          <t-button theme="default" class="flex-1 h-[80px] text-[28px] rounded-[14px]" @click="showSaveTemplate = false">取消</t-button>
          <t-button theme="primary" class="flex-1 h-[80px] text-[28px] rounded-[14px]" @click="saveAsTemplate">保存</t-button>
        </div>
      </div>
    </t-popup>

    <!-- 模板管理弹窗 -->
    <t-popup v-model="showTemplateManager" placement="bottom" round>
      <div class="bg-white rounded-t-[24px] p-[32px] max-h-[60vh] overflow-y-auto">
        <div class="text-[32px] font-semibold text-[#333] mb-[24px]">管理模板</div>
        <div v-if="tripTemplates.length === 0" class="text-center py-[40px] text-[#999]">暂无保存的模板</div>
        <div v-for="tpl in tripTemplates" :key="tpl.id" class="flex items-center justify-between p-[20px] bg-[#f5f7fa] rounded-[16px] mb-[12px]">
          <div>
            <div class="text-[28px] font-medium text-[#333]">{{ tpl.name }}</div>
            <div class="text-[24px] text-[#999]">{{ tpl.destination }}</div>
          </div>
          <div class="w-[48px] h-[48px] flex items-center justify-center" @click="deleteTemplate(tpl.id)">
            <DeleteIcon class="text-[28px] text-[#E34D59]" />
          </div>
        </div>
        <t-button theme="default" block class="h-[80px] text-[28px] rounded-[14px] mt-[16px]" @click="showTemplateManager = false">关闭</t-button>
      </div>
    </t-popup>
  </Root>
</template>

<script setup>
import { ChevronRightIcon, LocationIcon, LightbulbIcon, DeleteIcon } from "tdesign-icons-vue-next"
import { getTrips, createTrip, updateTrip, getTrip } from "@/api/trips"
import { getTripTemplates, createTripTemplate, deleteTripTemplate, getCityConfigs } from "@/api/configs"
import { useUserStore } from "@/store"
import { showToast, showErrorDialog } from "@/utils/common/tools"
import { useRouter, useRoute } from "vue-router"
import dayjs from "dayjs"

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 编辑模式检测
const editId = computed(() => route.query.id ? Number(route.query.id) : null)
const isEditMode = computed(() => !!editId.value)

const form = reactive({
  reason: '',
  destination: '',
  startDate: '',
  endDate: '',
  estTransportFee: 0,
  estAccomFee: 0,
  attachments: []
})

const loading = ref(false)
const showStartPicker = ref(false)
const showEndPicker = ref(false)
const showSaveTemplate = ref(false)
const showTemplateManager = ref(false)
const templateName = ref('')

// 模板和城市数据
const tripTemplates = ref([])
const selectedCityInfo = ref(null)
const costEstimate = ref(null)
const cityConfigs = ref([])

// 热门城市（从城市配置加载）
const popularCities = computed(() => cityConfigs.value.slice(0, 8))

// 费用总计
const totalFee = computed(() => (Number(form.estTransportFee) || 0) + (Number(form.estAccomFee) || 0))

// 出差天数
const tripDays = computed(() => {
  if (!form.startDate || !form.endDate) return 0
  return dayjs(form.endDate).diff(dayjs(form.startDate), 'day') + 1
})

// 加载模板
const loadTemplates = async () => {
  const res = await getTripTemplates()
  tripTemplates.value = res.data || []
}

// 加载城市配置
const loadCityConfigs = async () => {
  const res = await getCityConfigs()
  cityConfigs.value = res.data || []
}

// 加载编辑数据
const loadEditData = async () => {
  if (!editId.value) return
  const res = await getTrip(editId.value)
  const trip = res.data
  if (trip) {
    form.reason = trip.reason || ''
    form.destination = trip.destination || ''
    form.startDate = trip.startDate || ''
    form.endDate = trip.endDate || ''
    form.estTransportFee = trip.estTransportFee || 0
    form.estAccomFee = trip.estAccomFee || 0
    form.attachments = trip.attachments || []
  }
}

// 选择城市
const selectCity = async (city) => {
  form.destination = city.name
  selectedCityInfo.value = city
  // 简化实现：使用城市的基础费用作为估算
  costEstimate.value = {
    transportFee: { min: city.transportFeeBase * 0.8, max: city.transportFeeBase * 1.2 },
    accommodationFee: { min: city.accomFeeBase * 0.8, max: city.accomFeeBase * 1.2 }
  }
}

// 目的地变化时查询城市信息
const onDestinationChange = async () => {
  if (form.destination) {
    const city = cityConfigs.value.find(c => c.name === form.destination)
    selectedCityInfo.value = city
    if (city) {
      costEstimate.value = {
        transportFee: { min: city.transportFeeBase * 0.8, max: city.transportFeeBase * 1.2 },
        accommodationFee: { min: city.accomFeeBase * 0.8, max: city.accomFeeBase * 1.2 }
      }
    }
  }
}

// 应用推荐费用
const applyEstimate = () => {
  if (costEstimate.value) {
    form.estTransportFee = Math.round(costEstimate.value.transportFee.min + costEstimate.value.transportFee.max) / 2
    form.estAccomFee = Math.round(costEstimate.value.accommodationFee.min + costEstimate.value.accommodationFee.max) / 2 * (tripDays.value || 1)
  }
}

// 应用模板
const applyTemplate = async (tpl) => {
  form.reason = tpl.reason || form.reason
  form.destination = tpl.destination || form.destination
  form.estTransportFee = tpl.estTransportFee || form.estTransportFee
  form.estAccomFee = tpl.estAccomFee || form.estAccomFee

  // 更新城市信息
  onDestinationChange()
  showToast('已应用模板')
}

// 保存为模板
const saveAsTemplate = async () => {
  if (!templateName.value.trim()) {
    showToast('请输入模板名称')
    return
  }
  if (!form.destination) {
    showToast('请先填写目的地')
    return
  }

  await createTripTemplate({
    name: templateName.value.trim(),
    destination: form.destination,
    reason: form.reason,
    estTransportFee: form.estTransportFee,
    estAccomFee: form.estAccomFee
  })

  templateName.value = ''
  showSaveTemplate.value = false
  showToast('模板已保存')
  loadTemplates()
}

// 删除模板
const deleteTemplate = async (id) => {
  try {
    await showConfirmDialog({ content: '确定删除该模板吗？' })
    await deleteTripTemplate(id)
    showToast('已删除')
    loadTemplates()
  } catch (e) {
    // 用户取消操作
  }
}

const handleSubmit = async () => {
  if (!form.reason.trim()) { showToast('请输入出差事由'); return }
  if (!form.destination.trim()) { showToast('请输入目的地'); return }
  if (!form.startDate) { showToast('请选择开始日期'); return }
  if (!form.endDate) { showToast('请选择结束日期'); return }
  if (form.startDate > form.endDate) { showToast('结束日期不能早于开始日期'); return }

  loading.value = true
  try {
    const data = {
      reason: form.reason,
      destination: form.destination,
      startDate: form.startDate,
      endDate: form.endDate,
      estTransportFee: Number(form.estTransportFee) || 0,
      estAccomFee: Number(form.estAccomFee) || 0
    }

    if (isEditMode.value) {
      // 编辑模式：更新数据
      await updateTrip(editId.value, data)
      showToast('修改成功')
    } else {
      // 新建模式：创建数据
      await createTrip(data)
      showToast('提交成功')
    }
    router.back()
  } catch (error) {
    showErrorDialog(error.message || '提交失败')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadCityConfigs()
  await loadTemplates()
  if (isEditMode.value) {
    await loadEditData()
  }
})
</script>

<template>
  <Root title="考勤管理" back-url="/admin">
    <div class="min-h-screen bg-[#f5f7fa]">
      <!-- 考勤规则配置 -->
      <div class="mx-[32px] mt-[24px] bg-white rounded-[24px] p-[24px] mb-[20px] shadow-sm">
        <div class="text-[28px] font-semibold text-[#333] mb-[20px]">考勤规则</div>
        <div class="divide-y divide-[#f0f0f0]">
          <div class="flex justify-between items-center py-[16px]">
            <span class="text-[26px] text-[#333]">上班时间</span>
            <span class="text-[#0052D9] text-[26px]" @click="editConfig('workStartTime')">{{ config.workStartTime || '09:00' }}</span>
          </div>
          <div class="flex justify-between items-center py-[16px]">
            <span class="text-[26px] text-[#333]">下班时间</span>
            <span class="text-[#0052D9] text-[26px]" @click="editConfig('workEndTime')">{{ config.workEndTime || '18:00' }}</span>
          </div>
          <div class="flex justify-between items-center py-[16px]">
            <span class="text-[26px] text-[#333]">迟到宽限（分钟）</span>
            <span class="text-[#0052D9] text-[26px]" @click="editConfig('lateThresholdMinutes')">{{ config.lateThresholdMinutes || '0' }}</span>
          </div>
          <div class="flex justify-between items-center py-[16px]">
            <span class="text-[26px] text-[#333]">允许补卡</span>
            <t-switch v-model="config.allowMakeUp" @change="saveConfig" />
          </div>
        </div>
      </div>

      <!-- 用户假期管理 -->
      <div class="mx-[32px] bg-white rounded-[24px] p-[24px] mb-[20px] shadow-sm">
        <div class="text-[28px] font-semibold text-[#333] mb-[20px]">假期余额管理</div>
        <div v-if="users.filter(u => u.role === 'user').length === 0" class="text-center py-[40px] text-[#999]">暂无用户</div>
        <div v-for="user in users.filter(u => u.role === 'user')" :key="user.id" class="flex justify-between items-center py-[20px] border-b border-[#eee] last:border-b-0">
          <div>
            <div class="text-[28px] text-[#333]">{{ user.name }}</div>
            <div class="text-[24px] text-[#999]">{{ user.username }}</div>
          </div>
          <div class="flex items-center gap-[20px]">
            <div class="text-center">
              <div class="text-[26px] font-bold text-[#0052D9]">{{ user.annualLeaveBalance }}</div>
              <div class="text-[22px] text-[#999]">年假</div>
            </div>
            <div class="text-center">
              <div class="text-[26px] font-bold text-[#00A870]">{{ user.sickLeaveBalance }}</div>
              <div class="text-[22px] text-[#999]">病假</div>
            </div>
            <t-button theme="primary" size="small" @click="editLeaveBalance(user)">调整</t-button>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="mx-[32px] grid grid-cols-2 gap-[20px]">
        <t-button theme="primary" block class="h-[80px] text-[28px] rounded-[24px]" @click="router.push('/admin/attendance/report')">考勤报表</t-button>
        <t-button theme="default" block class="h-[80px] text-[28px] rounded-[24px]" @click="router.push('/admin/approval/leave')">请假审批</t-button>
      </div>
    </div>

    <!-- 配置编辑弹窗 -->
    <t-dialog v-model:visible="showConfigDialog" :title="configDialogTitle" :confirm-btn="{ content: '保存', theme: 'primary' }" @confirm="saveConfigValue">
      <div class="p-[20px]">
        <t-input v-model="configValue" placeholder="请输入新值" />
      </div>
    </t-dialog>

    <!-- 假期余额调整弹窗 -->
    <t-dialog v-model:visible="showLeaveDialog" :title="`调整 ${editUser?.name} 假期余额`" :confirm-btn="{ content: '保存', theme: 'primary' }" @confirm="saveLeaveBalance">
      <div class="p-[20px]">
        <t-input v-model.number="leaveForm.annualLeaveBalance" label="年假余额" type="number" class="mb-[20px]" />
        <t-input v-model.number="leaveForm.sickLeaveBalance" label="病假余额" type="number" />
      </div>
    </t-dialog>
  </Root>
</template>

<script setup>
import { attendanceConfigRepo, userRepo } from "@/db/repositories"
import { useRouter } from "vue-router"
import { showToast } from "@/utils/common/tools"

const router = useRouter()
const config = reactive({ workStartTime: "09:00", workEndTime: "18:00", lateThresholdMinutes: "0", allowMakeUp: true })
const users = ref([])
const showConfigDialog = ref(false)
const configDialogTitle = ref("")
const configKey = ref("")
const configValue = ref("")
const showLeaveDialog = ref(false)
const editUser = ref(null)
const leaveForm = reactive({ annualLeaveBalance: 0, sickLeaveBalance: 0 })

const loadConfig = async () => {
  const data = await attendanceConfigRepo.getAllConfig()
  config.workStartTime = data.workStartTime || "09:00"
  config.workEndTime = data.workEndTime || "18:00"
  config.lateThresholdMinutes = data.lateThresholdMinutes || "0"
  config.allowMakeUp = data.allowMakeUp === "true"
}

const loadUsers = async () => { users.value = await userRepo.findAll() }

const editConfig = (key) => {
  configKey.value = key
  const titles = { workStartTime: "上班时间", workEndTime: "下班时间", lateThresholdMinutes: "迟到宽限（分钟）" }
  configDialogTitle.value = titles[key]
  configValue.value = config[key]
  showConfigDialog.value = true
}

const saveConfigValue = async () => {
  await attendanceConfigRepo.setValue(configKey.value, configValue.value)
  config[configKey.value] = configValue.value
  showToast("已保存")
  showConfigDialog.value = false
}

const saveConfig = async () => {
  await attendanceConfigRepo.setValue("allowMakeUp", config.allowMakeUp.toString())
}

const editLeaveBalance = (user) => {
  editUser.value = user
  leaveForm.annualLeaveBalance = user.annualLeaveBalance
  leaveForm.sickLeaveBalance = user.sickLeaveBalance
  showLeaveDialog.value = true
}

const saveLeaveBalance = async () => {
  if (!editUser.value) return
  await userRepo.update(editUser.value.id, { annualLeaveBalance: Math.max(0, leaveForm.annualLeaveBalance), sickLeaveBalance: Math.max(0, leaveForm.sickLeaveBalance) })
  showToast("已保存")
  showLeaveDialog.value = false
  loadUsers()
}

onMounted(async () => { await loadConfig(); await loadUsers() })
</script>

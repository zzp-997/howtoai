<template>
  <Root title="修改密码" back-url="/user/settings">
    <div class="min-h-screen bg-[var(--bg-secondary)] pb-[150px]">
      <!-- 密码修改表单 -->
      <div class="p-[32px]">
        <div class="bg-[var(--bg-primary)] rounded-[24px] p-[32px] shadow-sm">
          <!-- 旧密码 -->
          <div class="mb-[24px]">
            <div class="text-[26px] text-[var(--text-primary)] mb-[12px]">当前密码</div>
            <t-input
              v-model="formData.oldPassword"
              type="password"
              placeholder="请输入当前密码"
              clearable
              class="text-[28px]"
            />
          </div>

          <!-- 新密码 -->
          <div class="mb-[24px]">
            <div class="text-[26px] text-[var(--text-primary)] mb-[12px]">新密码</div>
            <t-input
              v-model="formData.newPassword"
              type="password"
              placeholder="请输入新密码"
              clearable
              @input="handlePasswordChange"
              class="text-[28px]"
            />

            <!-- 密码强度指示器 -->
            <div v-if="formData.newPassword" class="mt-[16px]">
              <!-- 强度进度条 -->
              <div class="flex items-center gap-[12px] mb-[8px]">
                <div class="flex-1 h-[8px] bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                  <div
                    class="h-full transition-all duration-300 rounded-full"
                    :class="strengthBarClass"
                    :style="{ width: strengthPercent + '%' }"
                  ></div>
                </div>
                <div class="text-[24px] font-medium" :class="strengthTextClass">
                  {{ strengthLabel }}
                </div>
              </div>

              <!-- 密码要求列表 -->
              <div class="bg-[var(--bg-secondary)] rounded-[12px] p-[16px]">
                <div class="text-[24px] text-[var(--text-tertiary)] mb-[12px]">密码要求:</div>
                <div v-for="rule in passwordRules" :key="rule.key" class="flex items-center gap-[8px] mb-[8px]">
                  <CheckCircleFilledIcon
                    v-if="rule.valid"
                    class="text-[20px] text-[#00A870]"
                  />
                  <CloseCircleFilledIcon
                    v-else
                    class="text-[20px] text-[var(--text-tertiary)]"
                  />
                  <span class="text-[24px]" :class="rule.valid ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'">
                    {{ rule.label }}
                  </span>
                </div>
              </div>

              <!-- 错误提示 -->
              <div v-if="validationErrors.length > 0" class="mt-[12px]">
                <div v-for="error in validationErrors" :key="error" class="text-[24px] text-[#E34D59] mb-[4px]">
                  {{ error }}
                </div>
              </div>
            </div>
          </div>

          <!-- 确认新密码 -->
          <div class="mb-[32px]">
            <div class="text-[26px] text-[var(--text-primary)] mb-[12px]">确认新密码</div>
            <t-input
              v-model="formData.confirmPassword"
              type="password"
              placeholder="请再次输入新密码"
              clearable
              class="text-[28px]"
            />
            <div v-if="formData.confirmPassword && !isPasswordMatch" class="mt-[8px] text-[24px] text-[#E34D59]">
              两次输入的密码不一致
            </div>
          </div>

          <!-- 提交按钮 -->
          <t-button
            theme="primary"
            block
            size="large"
            :loading="loading"
            :disabled="!canSubmit"
            class="h-[80px] text-[30px] font-medium rounded-[16px]"
            @click="handleSubmit"
          >
            确认修改
          </t-button>
        </div>

        <!-- 密码建议 -->
        <div class="mt-[24px]">
          <div class="text-[26px] text-[var(--text-tertiary)] mb-[16px]">密码安全建议</div>
          <div class="bg-[var(--bg-primary)] rounded-[24px] p-[24px] shadow-sm">
            <div v-for="suggestion in passwordSuggestions" :key="suggestion" class="flex items-start gap-[12px] mb-[12px]">
              <InfoCircleIcon class="text-[24px] text-[#0052D9] flex-shrink-0 mt-[4px]" />
              <span class="text-[24px] text-[var(--text-secondary)]">{{ suggestion }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Root>
</template>

<script setup>
import { CheckCircleFilledIcon, CloseCircleFilledIcon, InfoCircleIcon } from "tdesign-icons-vue-next"
import { changePassword, validatePasswordStrength, getPasswordSuggestions } from "@/api/auth"
import { showToast, showSuccessToast, showErrorToast, showConfirmDialog } from "@/utils/common/tools"
import { useRouter } from "vue-router"
import { useUserStore } from "@/store"

const router = useRouter()
const userStore = useUserStore()

// 表单数据
const formData = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const loading = ref(false)

// 密码强度相关状态
const strengthLevel = ref(0) // 0-4 对应 弱、中、强、非常强
const validationErrors = ref([])
const passwordSuggestions = ref([
  '建议使用大小写字母、数字和特殊字符的组合',
  '密码长度至少8位，建议12位以上',
  '避免使用生日、电话号码等个人信息',
  '不要使用与其他网站相同的密码'
])

// 弱密码黑名单列表
const WEAK_PASSWORDS = [
  '123456', 'password', '12345678', 'qwerty', 'abc123', 'monkey', '1234567',
  'letmein', 'trustno1', 'dragon', 'baseball', 'iloveyou', 'master', 'sunshine',
  'ashley', 'bailey', 'passw0rd', 'shadow', '123123', '654321', 'superman',
  'qazwsx', 'michael', 'football', 'password1', 'password123', 'welcome',
  'admin', 'login', 'pass', 'test', 'guest'
]

/**
 * 检查是否为弱密码
 * @param {string} password - 待检查的密码
 * @returns {boolean} - 是否为弱密码
 */
function isWeakPassword(password) {
  if (!password) return false
  const lower = password.toLowerCase()
  return WEAK_PASSWORDS.some(weak => lower.includes(weak))
}

// 密码规则校验状态
const passwordRules = computed(() => [
  { key: 'length', label: '至少8个字符', valid: formData.newPassword.length >= 8 },
  { key: 'uppercase', label: '包含大写字母', valid: /[A-Z]/.test(formData.newPassword) },
  { key: 'lowercase', label: '包含小写字母', valid: /[a-z]/.test(formData.newPassword) },
  { key: 'number', label: '包含数字', valid: /[0-9]/.test(formData.newPassword) },
  { key: 'special', label: '包含特殊字符', valid: /[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword) },
  // 新增规则
  {
    key: 'noUsername',
    label: '不包含用户名',
    valid: !formData.newPassword.toLowerCase().includes((userStore.username || '').toLowerCase())
  },
  {
    key: 'notWeak',
    label: '非常见弱密码',
    valid: !isWeakPassword(formData.newPassword)
  }
])

// 强度标签
const strengthLabel = computed(() => {
  const labels = ['弱', '中', '强', '非常强']
  return labels[strengthLevel.value] || ''
})

// 强度百分比
const strengthPercent = computed(() => {
  return ((strengthLevel.value + 1) / 4) * 100
})

// 强度条样式
const strengthBarClass = computed(() => {
  const classes = ['bg-[#E34D59]', 'bg-[#ED7B2F]', 'bg-[#0052D9]', 'bg-[#00A870]']
  return classes[strengthLevel.value] || 'bg-[#E34D59]'
})

// 强度文字样式
const strengthTextClass = computed(() => {
  const classes = ['text-[#E34D59]', 'text-[#ED7B2F]', 'text-[#0052D9]', 'text-[#00A870]']
  return classes[strengthLevel.value] || 'text-[#E34D59]'
})

// 密码是否匹配
const isPasswordMatch = computed(() => {
  return formData.newPassword === formData.confirmPassword
})

// 是否可以提交
const canSubmit = computed(() => {
  return formData.oldPassword &&
         formData.newPassword &&
         formData.confirmPassword &&
         isPasswordMatch.value &&
         strengthLevel.value >= 1 &&
         validationErrors.value.length === 0 &&
         passwordRules.value.every(rule => rule.valid) // 所有规则都必须通过
})

// 防抖定时器
let debounceTimer = null

/**
 * 处理密码变化，实时校验强度
 */
const handlePasswordChange = async () => {
  // 清除之前的定时器
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  // 如果密码为空，重置状态
  if (!formData.newPassword) {
    strengthLevel.value = 0
    validationErrors.value = []
    return
  }

  // 防抖300ms
  debounceTimer = setTimeout(async () => {
    try {
      // 调用后端密码强度校验接口
      const res = await validatePasswordStrength(formData.newPassword)

      if (res && res.data) {
        strengthLevel.value = res.data.level || 0
        validationErrors.value = res.data.errors || []
      }
    } catch (error) {
      // 如果后端接口不可用，使用本地校验
      calculateLocalStrength()
    }
  }, 300)
}

/**
 * 本地计算密码强度（备用方案）
 */
const calculateLocalStrength = () => {
  let score = 0
  const password = formData.newPassword

  // 长度加分
  if (password.length >= 8) score++
  if (password.length >= 12) score++

  // 包含大写字母
  if (/[A-Z]/.test(password)) score++

  // 包含小写字母
  if (/[a-z]/.test(password)) score++

  // 包含数字
  if (/[0-9]/.test(password)) score++

  // 包含特殊字符
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++

  // 计算强度等级
  if (score <= 2) {
    strengthLevel.value = 0 // 弱
  } else if (score <= 4) {
    strengthLevel.value = 1 // 中
  } else if (score <= 5) {
    strengthLevel.value = 2 // 强
  } else {
    strengthLevel.value = 3 // 非常强
  }
}

/**
 * 提交密码修改
 */
const handleSubmit = async () => {
  // 前置校验
  if (!formData.oldPassword) {
    showErrorToast('请输入当前密码')
    return
  }

  if (!formData.newPassword) {
    showErrorToast('请输入新密码')
    return
  }

  if (!isPasswordMatch.value) {
    showErrorToast('两次输入的密码不一致')
    return
  }

  if (strengthLevel.value < 1) {
    showErrorToast('密码强度不足，请设置更强的密码')
    return
  }

  // 检查密码是否包含用户名
  if (userStore.username && formData.newPassword.toLowerCase().includes(userStore.username.toLowerCase())) {
    showErrorToast('密码不能包含用户名')
    return
  }

  // 检查是否为弱密码
  if (isWeakPassword(formData.newPassword)) {
    showErrorToast('密码过于简单，请使用更复杂的密码')
    return
  }

  // 检查密码历史（需要后端接口支持，此处预留）
  // TODO: 调用后端接口检查新密码是否与最近5次密码相同
  // const passwordHistory = await checkPasswordHistory(formData.newPassword)
  // if (passwordHistory.isDuplicate) {
  //   showErrorToast('新密码不能与最近5次使用的密码相同')
  //   return
  // }

  try {
    await showConfirmDialog({
      title: '确认修改',
      content: '确定要修改密码吗？修改后需要重新登录。',
      confirmBtn: '确认修改',
      cancelBtn: '取消'
    })

    loading.value = true

    await changePassword({
      oldPassword: formData.oldPassword,
      newPassword: formData.newPassword
    })

    showSuccessToast('密码修改成功，请重新登录')

    // 清除登录状态，跳转登录页
    await userStore.logout()
    router.push('/login')

  } catch (error) {
    if (error) {
      showErrorToast(error.message || '密码修改失败')
    }
  } finally {
    loading.value = false
  }
}

// 获取密码建议
onMounted(async () => {
  try {
    const res = await getPasswordSuggestions()
    if (res && res.data && res.data.suggestions) {
      passwordSuggestions.value = res.data.suggestions
    }
  } catch (error) {
    // 使用默认建议
  }
})
</script>

<style scoped>
:deep(.t-input) {
  background: var(--bg-secondary) !important;
  border-radius: 12px !important;
}

:deep(.t-input__inner) {
  font-size: 28px !important;
}
</style>

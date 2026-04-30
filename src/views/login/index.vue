<template>
  <div class="login-page min-h-screen flex flex-col relative overflow-hidden" @mousemove="handleMouseMove">
    <!-- 动态背景 -->
    <div class="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#1a2a4a] to-[#0d1b2a]"></div>

    <!-- 波浪动画 - 精简为单层 -->
    <div class="waves absolute bottom-0 left-0 right-0 h-[60px]">
      <div class="wave"></div>
    </div>

    <!-- Canvas 粒子效果 -->
    <canvas ref="particleCanvas" class="absolute inset-0 pointer-events-none"></canvas>

    <!-- 鼠标跟随光晕 -->
    <div class="glow-effect" :style="{ left: mouseX + 'px', top: mouseY + 'px' }"></div>

    <!-- 主内容区 -->
    <div class="flex-1 px-[32px] relative z-10 flex flex-col items-center justify-center">
      <!-- Logo 区域 -->
      <div class="text-center mb-[48px]">
        <div class="logo-container inline-block">
          <div class="logo-ring"></div>
          <div class="logo-ring ring2"></div>
          <div class="logo-ring ring3"></div>
          <div class="inline-flex items-center justify-center w-[110px] h-[110px] bg-gradient-to-br from-[#0052D9] to-[#266FE8] rounded-[28px] shadow-xl shadow-[#0052D9]/50 relative z-10 overflow-hidden">
            <img src="@/assets/image/image.png" alt="Logo" class="w-full h-full object-cover" />
          </div>
        </div>
        <h1 class="text-[40px] font-bold text-white mt-[24px] mb-[8px] tracking-wide">极智协同</h1>
        <p class="text-[20px] text-white/60 tracking-widest">高效协同 · 智慧办公</p>
      </div>

      <!-- 登录卡片 -->
      <div class="login-card bg-white/10 backdrop-blur-xl rounded-[28px] p-[36px] shadow-2xl border border-white/15 max-w-[580px] w-full relative overflow-hidden">
        <!-- 卡片内部装饰 -->
        <div class="absolute top-0 right-0 w-[180px] h-[180px] bg-gradient-to-br from-[#0052D9]/12 to-transparent rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div class="absolute bottom-0 left-0 w-[160px] h-[160px] bg-gradient-to-tl from-[#266FE8]/12 to-transparent rounded-full translate-y-1/2 -translate-x-1/2"></div>

        <!-- 角色切换 -->
        <div class="flex bg-white/10 rounded-[14px] p-[5px] mb-[24px] border border-white/10 relative z-10">
          <div
            :class="[
              'flex-1 flex items-center justify-center gap-[10px] py-[18px] rounded-[12px] text-[28px] transition-all duration-300 cursor-pointer relative',
              selectedRole === 'user'
                ? 'bg-gradient-to-br from-[#0052D9] to-[#266FE8] text-white shadow-lg'
                : 'text-white/60 hover:text-white/80'
            ]"
            @click="selectedRole = 'user'"
          >
            <UserIcon class="text-[28px]" />
            <span>用户端</span>
          </div>
          <div
            :class="[
              'flex-1 flex items-center justify-center gap-[10px] py-[18px] rounded-[12px] text-[28px] transition-all duration-300 cursor-pointer relative',
              selectedRole === 'admin'
                ? 'bg-gradient-to-br from-[#0052D9] to-[#266FE8] text-white shadow-lg'
                : 'text-white/60 hover:text-white/80'
            ]"
            @click="selectedRole = 'admin'"
          >
            <UserTalkIcon class="text-[28px]" />
            <span>管理员端</span>
          </div>
        </div>

        <!-- Alert警告提示组件 -->
        <Transition name="shake">
          <div
            v-if="showAlert"
            class="alert-box mb-[20px] p-[16px] rounded-[12px] relative z-10"
            :class="isLockAlert ? 'lock-alert' : 'error-alert'"
          >
            <div class="flex items-start gap-[12px]">
              <div class="alert-icon flex-shrink-0 w-[24px] h-[24px] flex items-center justify-center">
                <t-icon v-if="isLockAlert" name="lock-on" class="text-[20px]" />
                <t-icon v-else name="error-circle" class="text-[20px]" />
              </div>
              <div class="flex-1">
                <p class="alert-message text-[16px] leading-[1.6]">{{ alertMessage }}</p>
                <!-- 锁定期间显示倒计时 -->
                <div v-if="isLockAlert" class="countdown-timer mt-[12px] flex items-center gap-[16px]">
                  <span class="text-[18px] font-medium">{{ formattedLockTime }}</span>
                </div>
                <!-- 联系管理员链接 -->
                <div v-if="isLockAlert" class="mt-[12px]">
                  <a href="javascript:void(0)" class="text-[14px] underline hover:no-underline text-white/70 hover:text-white transition-colors">
                    联系管理员解锁
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Transition>

        <!-- 剩余尝试次数指示器 -->
        <div v-if="showAttemptsIndicator" class="attempts-indicator mb-[16px] relative z-10">
          <div class="flex items-center justify-center gap-[10px]">
            <span class="text-[14px] text-white/50 mr-[8px]">剩余尝试:</span>
            <div class="flex gap-[8px]">
              <span
                v-for="i in 5"
                :key="i"
                class="attempt-dot w-[12px] h-[12px] rounded-full transition-all duration-300"
                :class="i <= remainingAttempts ? 'bg-[#4dd9a0] dot-active' : 'bg-[#e34d59] dot-used'"
              ></span>
            </div>
            <span class="text-[14px] ml-[8px]" :class="remainingAttempts <= 1 ? 'text-[#e34d59]' : 'text-white/50'">
              {{ remainingAttempts }}/5
            </span>
          </div>
        </div>

        <!-- 表单区域 -->
        <div class="mb-[24px] relative z-10">
          <div class="input-wrapper flex items-center bg-white/8 rounded-[12px] px-[20px] py-[12px] mb-[12px] border border-white/10 transition-all duration-300 hover:border-[#0052D9]/40 hover:bg-white/12 group">
            <div class="w-[40px] h-[40px] bg-gradient-to-br from-[#0052D9]/25 to-[#266FE8]/25 rounded-[10px] flex items-center justify-center mr-[14px] group-hover:from-[#0052D9]/35 group-hover:to-[#266FE8]/35 transition-all">
              <UserIcon class="text-[22px] text-[#6ba3e8]" />
            </div>
            <t-input
              v-model="formData.username"
              placeholder="请输入用户名"
              :bordered="false"
              clearable
              class="flex-1 text-white placeholder:text-white/40 h-[32px]"
            />
          </div>
          <div class="input-wrapper flex items-center bg-white/8 rounded-[12px] px-[20px] py-[12px] border border-white/10 transition-all duration-300 hover:border-[#0052D9]/40 hover:bg-white/12 group">
            <div class="w-[40px] h-[40px] bg-gradient-to-br from-[#0052D9]/25 to-[#266FE8]/25 rounded-[10px] flex items-center justify-center mr-[14px] group-hover:from-[#0052D9]/35 group-hover:to-[#266FE8]/35 transition-all">
              <LockOnIcon class="text-[22px] text-[#6ba3e8]" />
            </div>
            <t-input
              v-model="formData.password"
              type="password"
              placeholder="请输入密码"
              :bordered="false"
              clearable
              class="flex-1 text-white placeholder:text-white/40 h-[32px]"
            />
          </div>
        </div>

        <!-- 登录按钮 -->
        <t-button
          theme="primary"
          block
          size="large"
          :loading="loading"
          :disabled="isLocked"
          class="login-btn h-[72px] text-[30px] font-medium rounded-[14px] !bg-gradient-to-br !from-[#0052D9] !to-[#266FE8] shadow-lg shadow-[#0052D9]/40 relative mb-[18px]"
          @click="handleLogin"
        >
          <span v-if="isLocked" class="relative z-10 flex items-center justify-center gap-[8px]">
            <t-icon name="lock-on" class="text-[24px]" />
            账户锁定中 ({{ formattedLockTime }})
          </span>
          <span v-else class="relative z-10">登 录</span>
        </t-button>

        <!-- 测试账号提示 -->
        <div class="text-center relative z-10">
          <div class="text-[24px] text-white/35 mb-[10px]">测试账号</div>
          <div class="inline-flex items-center gap-[20px] text-[20px] text-white/50">
            <span class="flex items-center gap-[6px]">
              <span class="text-[#6ba3e8] font-medium text-[20px]">admin</span>
              <span class="text-white/30">/</span>
              <span class="text-[20px]">123456</span>
            </span>
            <span class="w-[1px] h-[12px] bg-white/20"></span>
            <span class="flex items-center gap-[6px]">
              <span class="text-[#4dd9a0] font-medium text-[20px]">user</span>
              <span class="text-white/30">/</span>
              <span class="text-[20px]">123456</span>
            </span>
          </div>
        </div>
      </div>

      <!-- 底部版权 -->
      <div class="mt-[24px] text-center text-[16px] text-white/30 relative z-10">
        极智协同 v1.0.0
      </div>
    </div>
  </div>
</template>

<script setup>
import { UserIcon, LockOnIcon, UserTalkIcon, ErrorCircleIcon } from "tdesign-icons-vue-next"
import { useUserStore } from "@/store"
import { showToast, showErrorDialog, showErrorToast, showConfirmDialog } from "@/utils/common/tools"
import { useRouter } from "vue-router"

const router = useRouter()
const userStore = useUserStore()

const selectedRole = ref('user')

const formData = reactive({
  username: '',
  password: ''
})

const loading = ref(false)

// 账户锁定状态
const isLocked = ref(false)
const lockSeconds = ref(0)
const remainingAttempts = ref(5)

// Alert警告提示状态
const showAlert = ref(false)
const alertMessage = ref('')
const isLockAlert = ref(false)

// 显示剩余次数指示器
const showAttemptsIndicator = computed(() => {
  return remainingAttempts.value !== null && remainingAttempts.value >= 0 && remainingAttempts.value < 5
})

// 格式化锁定时间 (mm:ss)
const formattedLockTime = computed(() => {
  const minutes = Math.floor(lockSeconds.value / 60)
  const seconds = lockSeconds.value % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

// 倒计时定时器
let lockTimer = null

/**
 * 启动锁定倒计时
 * @param {number} seconds - 锁定秒数
 */
const startLockCountdown = (seconds) => {
  // 清除现有定时器
  if (lockTimer) {
    clearInterval(lockTimer)
  }

  lockSeconds.value = seconds
  isLocked.value = true
  remainingAttempts.value = 0

  // 显示锁定Alert
  const minutes = Math.ceil(seconds / 60)
  alertMessage.value = `账户已锁定，请${minutes}分钟后重试`
  isLockAlert.value = true
  showAlert.value = true

  // 每秒更新一次
  lockTimer = setInterval(() => {
    lockSeconds.value -= 1

    // 倒计时结束，解锁
    if (lockSeconds.value <= 0) {
      clearInterval(lockTimer)
      lockTimer = null
      isLocked.value = false
      lockSeconds.value = 0
      remainingAttempts.value = 5
      showAlert.value = false
    }
  }, 1000)
}

/**
 * 停止锁定倒计时
 */
const stopLockCountdown = () => {
  if (lockTimer) {
    clearInterval(lockTimer)
    lockTimer = null
  }
  isLocked.value = false
  lockSeconds.value = 0
  remainingAttempts.value = 5
  showAlert.value = false
}

/**
 * 显示错误Alert
 * @param {string} message - 错误消息
 * @param {boolean} isLock - 是否是锁定状态
 */
const showErrorAlert = (message, isLock = false) => {
  alertMessage.value = message
  isLockAlert.value = isLock
  showAlert.value = true
}

/**
 * 隐藏错误Alert
 */
const hideErrorAlert = () => {
  showAlert.value = false
}

// 鼠标位置
const mouseX = ref(0)
const mouseY = ref(0)

// Canvas 粒子
const particleCanvas = ref(null)
let animationId = null

// 初始化粒子
const initParticles = () => {
  const canvas = particleCanvas.value
  if (!canvas) return

  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  const ctx = canvas.getContext('2d')
  const particles = []

  // 生成 20 个粒子
  for (let i = 0; i < 20; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 4 + 2,
      speedY: Math.random() * 0.5 + 0.3,
      speedX: (Math.random() - 0.5) * 0.2,
      opacity: Math.random() * 0.5 + 0.3
    })
  }

  // 动画循环
  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    particles.forEach(p => {
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(0, 82, 217, ${p.opacity})`
      ctx.fill()

      // 上升动画
      p.y -= p.speedY
      p.x += p.speedX

      // 超出边界时重置
      if (p.y < -p.size) {
        p.y = canvas.height + p.size
        p.x = Math.random() * canvas.width
      }
    })

    animationId = requestAnimationFrame(animate)
  }

  animate()
}

// 鼠标移动处理
const handleMouseMove = (e) => {
  mouseX.value = e.clientX - 150
  mouseY.value = e.clientY - 150
}

const handleLogin = async () => {
  if (!formData.username) {
    showToast('请输入用户名')
    return
  }
  if (!formData.password) {
    showToast('请输入密码')
    return
  }

  // 检查账户是否被锁定
  if (isLocked.value && lockSeconds.value > 0) {
    showErrorToast(`账户已锁定，请${formattedLockTime.value}后再试`)
    return
  }

  loading.value = true
  try {
    const loginResult = await userStore.login(formData.username, formData.password, selectedRole.value)
    showToast('登录成功')

    // 重置锁定状态
    stopLockCountdown()
    remainingAttempts.value = 5

    // 检查密码过期状态
    if (loginResult && loginResult.passwordExpiry) {
      handlePasswordExpiry(loginResult.passwordExpiry)
    } else {
      // 没有过期提醒，直接跳转
      navigateAfterLogin()
    }
  } catch (error) {
    // 解析后端返回的错误详情
    handleLoginError(error)
  } finally {
    loading.value = false
  }
}

/**
 * 处理密码过期状态
 * @param {Object} passwordExpiry - 密码过期信息
 */
const handlePasswordExpiry = (passwordExpiry) => {
  const { isExpired, daysRemaining, isExpiringSoon } = passwordExpiry

  // 密码已过期，必须修改
  if (isExpired) {
    showErrorDialog('您的密码已过期，请修改密码后继续使用。\n\n为了账户安全，请设置新密码。').then(() => {
      router.push('/user/settings/password')
    })
    return
  }

  // 密码即将过期（7天内），提醒用户
  if (isExpiringSoon || daysRemaining <= 7) {
    showConfirmDialog({
      title: '密码即将过期',
      content: `您的密码将在 ${daysRemaining} 天后过期。\n\n为了不影响正常使用，建议您尽快修改密码。`,
      confirmBtn: '立即修改',
      cancelBtn: '稍后提醒'
    }).then(() => {
      router.push('/user/settings/password')
    }).catch(() => {
      navigateAfterLogin()
    })
    return
  }

  // 密码正常，直接跳转
  navigateAfterLogin()
}

/**
 * 登录成功后跳转
 */
const navigateAfterLogin = () => {
  if (selectedRole.value === 'admin') {
    router.push('/admin')
  } else {
    router.push('/user')
  }
}

/**
 * 处理登录错误
 * 解析后端返回的错误详情并展示相应提示
 * 根据测试用例要求显示不同错误信息
 */
const handleLoginError = (error) => {
  const errorData = error.response?.data || error.data || {}
  const errorCode = errorData.code || error.code
  const errorMessage = errorData.message || error.message || '登录失败，请重试'

  // 检查是否是账户锁定状态
  if (errorData.locked || errorCode === 'ACCOUNT_LOCKED' || errorCode === 423) {
    const remainingSeconds = errorData.remainingSeconds || errorData.lock_duration || errorData.lockDuration || 900 // 15分钟 = 900秒
    // 启动倒计时
    startLockCountdown(remainingSeconds)
    return
  }

  // 检查是否是密码错误，显示剩余尝试次数
  if (errorData.remainingAttempts !== undefined) {
    remainingAttempts.value = errorData.remainingAttempts

    // 根据测试用例显示不同的错误信息
    if (remainingAttempts.value <= 0) {
      // 第5次失败（锁定）
      const lockDuration = errorData.lockDuration || 900 // 默认15分钟
      startLockCountdown(lockDuration)
    } else {
      // 第1-4次失败，显示对应错误信息
      const attempts = remainingAttempts.value
      let message = ''

      switch (attempts) {
        case 4:
          message = '用户名或密码错误，还剩4次尝试机会'
          break
        case 3:
          message = '用户名或密码错误，还剩3次尝试机会'
          break
        case 2:
          message = '用户名或密码错误，还剩2次尝试机会'
          break
        case 1:
          message = '用户名或密码错误，还剩1次尝试机会'
          break
        default:
          message = `用户名或密码错误，还剩${attempts}次尝试机会`
      }

      showErrorAlert(message, false)

      // 延迟隐藏Alert
      setTimeout(() => {
        hideErrorAlert()
      }, 3000)
    }
    return
  }

  // 其他错误情况
  showErrorToast(errorMessage)
}

onMounted(() => {
  initParticles()
  window.addEventListener('resize', initParticles)
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  // 清除锁定倒计时定时器
  stopLockCountdown()
  window.removeEventListener('resize', initParticles)
})
</script>

<style scoped>
/* 波浪动画 - 单层 */
.waves {
  overflow: hidden;
}

.wave {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 200%;
  height: 60px;
  background: linear-gradient(90deg, transparent 0%, rgba(0, 82, 217, 0.25) 50%, transparent 100%);
  animation: wave-move 12s linear infinite;
}

@keyframes wave-move {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

/* 鼠标光晕 */
.glow-effect {
  position: fixed;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(0, 82, 217, 0.15) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
  transition: left 0.1s ease-out, top 0.1s ease-out;
  z-index: 1;
}

/* Logo 旋转光环 */
.logo-container {
  position: relative;
}

.logo-ring {
  position: absolute;
  inset: -24px;
  border: 2px solid rgba(0, 82, 217, 0.35);
  border-radius: 32px;
  animation: ring-rotate 4s linear infinite;
}

.ring2 {
  inset: -36px;
  border-color: rgba(38, 111, 232, 0.25);
  animation-duration: 6s;
  animation-direction: reverse;
}

.ring3 {
  inset: -48px;
  border-color: rgba(0, 168, 112, 0.15);
  animation-duration: 8s;
}

@keyframes ring-rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 登录按钮样式 - 保持闪光效果同时显示loading */
.login-btn {
  position: relative !important;
}

/* loading 时隐藏闪光效果 */
.login-btn.t-button--loading::before {
  display: none !important;
}

.login-btn :deep(.t-button__content) {
  border-radius: 14px;
}

/* 完全替换loading图标样式 - 显示完整旋转圆圈 */
.login-btn :deep(.t-button__loading) {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.login-btn :deep(.t-loading__spinner) {
  /* 使用自定义完整圆圈 */
  display: inline-block !important;
  width: 24px !important;
  height: 24px !important;
  border: 3px solid rgba(255, 255, 255, 0.3) !important;
  border-top-color: white !important;
  border-radius: 50% !important;
  animation: custom-spin 0.8s linear infinite !important;
  box-sizing: border-box !important;
}

/* 隐藏原始svg */
.login-btn :deep(.t-loading__spinner svg) {
  display: none !important;
}

@keyframes custom-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 登录按钮特效 */
.login-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.25) 50%, transparent 100%);
  animation: btn-shine 3s ease-in-out infinite;
  border-radius: 14px;
}

@keyframes btn-shine {
  0% { left: -100%; }
  50%, 100% { left: 100%; }
}

/* 输入框聚焦效果 */
.input-wrapper:focus-within {
  border-color: rgba(0, 82, 217, 0.5) !important;
  background: rgba(255, 255, 255, 0.12) !important;
  box-shadow: 0 0 10px rgba(0, 82, 217, 0.15);
}

.input-wrapper:focus-within .bg-gradient-to-br {
  background: linear-gradient(to bottom right, rgba(0, 82, 217, 0.35), rgba(38, 111, 232, 0.35)) !important;
}

/* TDesign 输入框样式覆盖 */
:deep(.t-input) {
  background: transparent !important;
}

:deep(.t-input__inner) {
  color: white !important;
  font-size: 16px !important;
}

:deep(.t-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.4) !important;
  font-size: 16px !important;
}

:deep(.t-input__clear) {
  color: rgba(255, 255, 255, 0.5) !important;
}

/* 强制输入框聚焦和输入状态字体大小不变 */
:deep(.t-input__inner:focus),
:deep(.t-input__inner:focus-within),
:deep(.t-input--focused .t-input__inner),
:deep(.t-input:focus-within .t-input__inner) {
  font-size: 16px !important;
}

/* 自动填充状态 */
:deep(.t-input__inner:-webkit-autofill),
:deep(.t-input__inner:-webkit-autofill:hover),
:deep(.t-input__inner:-webkit-autofill:focus),
:deep(.t-input__inner:-webkit-autofill:active) {
  font-size: 16px !important;
  -webkit-text-fill-color: white !important;
  transition: background-color 5000s ease-in-out 0s;
}

/* 夜间模式适配 */
[data-theme="dark"] .login-page {
  /* 背景保持深色 */
}

[data-theme="dark"] .login-card {
  background: rgba(30, 41, 59, 0.6) !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
}

[data-theme="dark"] .input-wrapper {
  background: rgba(30, 41, 59, 0.4) !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
}

/* Alert警告框样式 */
.alert-box {
  background: rgba(227, 77, 89, 0.15);
  border: 1px solid rgba(227, 77, 89, 0.3);
  border-radius: 12px;
}

.alert-box .alert-icon {
  color: #e34d59;
}

.alert-message {
  color: rgba(255, 255, 255, 0.9);
}

/* 锁定Alert样式 */
.lock-alert {
  background: rgba(227, 77, 89, 0.2);
  border-color: rgba(227, 77, 89, 0.4);
}

/* 错误Alert样式 */
.error-alert {
  background: rgba(227, 77, 89, 0.15);
  border-color: rgba(227, 77, 89, 0.3);
}

/* 抖动动画 */
.shake-enter-active {
  animation: shake 0.5s ease-in-out;
}

.shake-leave-active {
  animation: shake 0.3s ease-in-out reverse;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
  20%, 40%, 60%, 80% { transform: translateX(4px); }
}

/* 剩余尝试次数指示器 */
.attempts-indicator {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.attempt-dot {
  display: inline-block;
}

.dot-active {
  background: #4dd9a0;
  box-shadow: 0 0 8px rgba(77, 217, 160, 0.5);
}

.dot-used {
  background: #e34d59;
  box-shadow: 0 0 8px rgba(227, 77, 89, 0.5);
  opacity: 0.8;
}

/* 倒计时样式 */
.countdown-timer {
  font-family: 'Courier New', monospace;
  color: #e34d59;
}
</style>

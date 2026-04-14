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
          class="login-btn h-[72px] text-[30px] font-medium rounded-[14px] !bg-gradient-to-br !from-[#0052D9] !to-[#266FE8] shadow-lg shadow-[#0052D9]/40 relative overflow-hidden mb-[18px]"
          @click="handleLogin"
        >
          <span class="relative z-10">登 录</span>
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
import { UserIcon, LockOnIcon, UserTalkIcon } from "tdesign-icons-vue-next"
import { useUserStore } from "@/store"
import { showToast, showErrorDialog } from "@/utils/common/tools"
import { useRouter } from "vue-router"

const router = useRouter()
const userStore = useUserStore()

const selectedRole = ref('user')

const formData = reactive({
  username: '',
  password: ''
})

const loading = ref(false)

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

  loading.value = true
  try {
    await userStore.login(formData.username, formData.password, selectedRole.value)
    showToast('登录成功')

    if (selectedRole.value === 'admin') {
      router.push('/admin')
    } else {
      router.push('/user')
    }
  } catch (error) {
    showErrorDialog(error.message || '登录失败，请重试')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  initParticles()
  window.addEventListener('resize', initParticles)
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
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
</style>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col relative overflow-hidden">
    <!-- 顶部装饰 -->
    <div class="absolute -top-[200px] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-br from-[#0052D9] to-[#266FE8] rounded-full opacity-90"></div>

    <!-- 主内容区 -->
    <div class="flex-1 pt-[100px] px-[32px] relative z-10">
      <!-- Logo 区域 -->
      <div class="text-center mb-[48px]">
        <div class="inline-flex items-center justify-center w-[88px] h-[88px] bg-gradient-to-br from-[#0052D9] to-[#266FE8] rounded-[24px] shadow-lg shadow-[#0052D9]/30 mb-[24px]">
          <BuildingIcon class="text-white text-[48px]" />
        </div>
        <h1 class="text-[36px] font-semibold text-white drop-shadow mb-[12px]">极智协同</h1>
        <p class="text-[26px] text-white/85">高效协同 · 智慧办公</p>
      </div>

      <!-- 登录卡片 -->
      <div class="bg-white rounded-[24px] p-[32px] shadow-xl">
        <!-- 角色切换 -->
        <div class="flex bg-[#f5f7fa] rounded-[16px] p-[6px] mb-[32px]">
          <div
            :class="[
              'flex-1 flex items-center justify-center gap-[8px] py-[20px] rounded-[12px] text-[28px] transition-all cursor-pointer',
              selectedRole === 'user'
                ? 'bg-gradient-to-br from-[#0052D9] to-[#266FE8] text-white shadow-md shadow-[#0052D9]/30'
                : 'text-[#666]'
            ]"
            @click="selectedRole = 'user'"
          >
            <UserIcon class="text-[32px]" />
            <span>用户端</span>
          </div>
          <div
            :class="[
              'flex-1 flex items-center justify-center gap-[8px] py-[20px] rounded-[12px] text-[28px] transition-all cursor-pointer',
              selectedRole === 'admin'
                ? 'bg-gradient-to-br from-[#0052D9] to-[#266FE8] text-white shadow-md shadow-[#0052D9]/30'
                : 'text-[#666]'
            ]"
            @click="selectedRole = 'admin'"
          >
            <UserTalkIcon class="text-[32px]" />
            <span>管理员端</span>
          </div>
        </div>

        <!-- 表单区域 -->
        <div class="mb-[32px]">
          <div class="flex items-center bg-[#f9fafb] rounded-[16px] px-[32px] py-[24px] mb-[16px]">
            <UserIcon class="text-[#0052D9] text-[36px] mr-[16px]" />
            <t-input
              v-model="formData.username"
              placeholder="请输入用户名"
              :bordered="false"
              clearable
              class="flex-1"
            />
          </div>
          <div class="flex items-center bg-[#f9fafb] rounded-[16px] px-[32px] py-[24px]">
            <LockOnIcon class="text-[#0052D9] text-[36px] mr-[16px]" />
            <t-input
              v-model="formData.password"
              type="password"
              placeholder="请输入密码"
              :bordered="false"
              clearable
              class="flex-1"
            />
          </div>
        </div>

        <!-- 登录按钮 -->
        <t-button
          theme="primary"
          block
          size="large"
          :loading="loading"
          class="h-[96px] text-[32px] font-medium rounded-[16px] !bg-gradient-to-br !from-[#0052D9] !to-[#266FE8] shadow-md shadow-[#0052D9]/30"
          @click="handleLogin"
        >
          登 录
        </t-button>

        <!-- 测试账号提示 -->
        <div class="mt-[32px] pt-[24px] border-t border-[#eee] text-center">
          <div class="text-[24px] text-[#999] mb-[12px]">测试账号</div>
          <div class="flex flex-col gap-[8px] text-[24px] text-[#666]">
            <span>管理员：admin / 123456</span>
            <span>用户：user / 123456</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部版权 -->
    <div class="py-[24px] text-center text-[22px] text-[#999]">
      Version 1.0.0
    </div>
  </div>
</template>

<script setup>
import { UserIcon, LockOnIcon, UserTalkIcon, BuildingIcon } from "tdesign-icons-vue-next"
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
</script>

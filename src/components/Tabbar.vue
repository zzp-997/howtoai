<template>
  <div class="fixed bottom-0 left-0 right-0 z-50">
    <div class="bg-white safe-area-bottom">
      <!-- Tabbar 主体 -->
      <div class="grid grid-cols-5 h-[120px]">
        <!-- 首页 -->
        <div
          :class="['flex flex-col items-center justify-center cursor-pointer transition-all', isActive('/user') ? 'text-[#0052D9]' : 'text-[#999]']"
          @click="handleTabClick({ path: '/user' })"
        >
          <HomeIcon :class="['text-[32px] mb-[8px]']" />
          <span class="text-[22px] font-medium">首页</span>
        </div>

        <!-- 待办 -->
        <div
          :class="['flex flex-col items-center justify-center cursor-pointer transition-all', isActive('/user/todo') ? 'text-[#0052D9]' : 'text-[#999]']"
          @click="handleTabClick({ path: '/user/todo' })"
        >
          <Edit1Icon :class="['text-[32px] mb-[8px]']" />
          <span class="text-[22px] font-medium">待办</span>
        </div>

        <!-- 会议 - 中间突出 -->
        <div class="flex flex-col items-center justify-end relative">
          <div
            :class="[
              'absolute -top-[30px] w-[80px] h-[80px] rounded-[22px] flex flex-col items-center justify-center cursor-pointer transition-all shadow-lg',
              isActive('/user/meeting')
                ? 'bg-gradient-to-br from-[#0052D9] to-[#266FE8] shadow-[#0052D9]/40'
                : 'bg-gradient-to-br from-[#0052D9] to-[#266FE8] shadow-[#0052D9]/30'
            ]"
            @click="handleTabClick({ path: '/user/meeting' })"
          >
            <CalendarIcon class="text-[36px] text-white mb-[4px]" />
            <span class="text-[20px] text-white font-medium">会议</span>
          </div>
          <div class="h-[20px]"></div>
        </div>

        <!-- 公告 -->
        <div
          :class="['flex flex-col items-center justify-center cursor-pointer transition-all', isActive('/user/announcement') ? 'text-[#0052D9]' : 'text-[#999]']"
          @click="handleTabClick({ path: '/user/announcement' })"
        >
          <NotificationIcon :class="['text-[32px] mb-[8px]']" />
          <span class="text-[22px] font-medium">公告</span>
        </div>

        <!-- 我的 -->
        <div
          :class="['flex flex-col items-center justify-center cursor-pointer transition-all', isActive('/user/settings') ? 'text-[#0052D9]' : 'text-[#999]']"
          @click="handleTabClick({ path: '/user/settings' })"
        >
          <UserIcon :class="['text-[32px] mb-[8px]']" />
          <span class="text-[22px] font-medium">我的</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { HomeIcon, CalendarIcon, UserIcon, Edit1Icon, NotificationIcon } from "tdesign-icons-vue-next"
import { useRoute, useRouter } from "vue-router"

const route = useRoute()
const router = useRouter()

const isActive = (path) => {
  if (path === '/user') {
    return route.path === path
  }
  return route.path.startsWith(path)
}

const handleTabClick = (item) => {
  if (!isActive(item.path)) {
    router.push(item.path)
  }
}
</script>

<style scoped>
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>

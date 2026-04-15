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
          <!-- 光环容器 -->
          <div
            :class="['meeting-btn-wrapper absolute -top-[35px]', isActive('/user/meeting') ? 'active' : '']"
            @click="handleTabClick({ path: '/user/meeting' })"
          >
            <div class="meeting-btn flex flex-col items-center justify-center cursor-pointer">
              <CalendarIcon class="text-[36px] text-white mb-[4px]" />
              <span class="text-[20px] text-white font-medium">会议</span>
            </div>
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

/* 会议按钮包装器 */
.meeting-btn-wrapper {
  width: 90px;
  height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

/* 会议按钮本体 */
.meeting-btn {
  width: 80px;
  height: 80px;
  border-radius: 22px;
  background: linear-gradient(135deg, #0052D9, #266FE8);
  box-shadow: 0 4px 15px rgba(0, 82, 217, 0.3);
  position: relative;
  z-index: 1;
  transition: all 0.3s ease;
}

/* 底部弧形指示条 */
.meeting-btn-wrapper.active::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 4px;
  background: linear-gradient(90deg, #00D9FF, #0052D9);
  border-radius: 2px;
  animation: indicator-in 0.3s ease-out;
}

/* 指示条入场动画 */
@keyframes indicator-in {
  from {
    width: 0;
    opacity: 0;
  }
  to {
    width: 40px;
    opacity: 1;
  }
}

/* 选中时按钮轻微上移 */
.meeting-btn-wrapper.active .meeting-btn {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 82, 217, 0.4);
}
</style>

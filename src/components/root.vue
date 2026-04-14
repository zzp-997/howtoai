<template>
  <div class="w-full h-full flex flex-col">
    <t-navbar v-if="showNavbar" :fixed="false" :title-max-length="20" :title="navbarTitle" class="!bg-[var(--bg-primary)]">
      <template #left>
        <div v-if="isHome" class="flex items-center" @click="handleLogout()">
          <t-avatar :image="userStore.userInfo?.avatar || defaultAvatar" size="48px" />
          <div class="ml-[8px] font-[500] text-[28px] text-[var(--text-primary)] leading-[40px]">
            {{ userStore.name || '用户' }}
          </div>
        </div>
        <ChevronLeftIcon v-else class="text-[48px] text-[var(--text-primary)]" @click="goBack" />
      </template>
    </t-navbar>
    <div class="flex-1 overflow-auto h-full">
      <slot></slot>
    </div>
    <!-- 全局 Tabbar -->
    <Tabbar v-if="showTabbar" />
  </div>
</template>

<script setup>
import { ChevronLeftIcon } from "tdesign-icons-vue-next"
import { Dialog } from "tdesign-mobile-vue"
import { useRoute, useRouter } from "vue-router"
import { useUserStore } from "@/store"
import Tabbar from "./Tabbar.vue"

const props = defineProps({
  title: {
    type: [String, Boolean],
    default: "",
  },
  showBack: {
    type: Boolean,
    default: true,
  },
  backUrl: {
    type: String,
    default: "",
  },
})

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const defaultAvatar = 'https://tdesign.gtimg.com/site/avatar.jpg'

const goBack = () => {
  if (props.backUrl) {
    router.push(props.backUrl)
  } else {
    router.go(-1)
  }
}

const handleLogout = () => {
  Dialog.confirm({
    title: "提示",
    content: "确定要退出登录吗？",
    buttonLayout: "vertical",
    confirmBtn: {
      content: "退出",
      theme: "danger",
      variant: "outline",
    },
    cancelBtn: { content: "返回", variant: "text", block: true },
    onConfirm() {
      userStore.logout()
      router.push("/login")
    },
    zIndex: 90000,
  })
}

const isHome = computed(() => {
  return route.path === "/user" || route.path === "/admin"
})

const showNavbar = computed(() => {
  return props.title !== false
})

const navbarTitle = computed(() => {
  if (props.title === false) return ""
  return props.title || route.meta?.title || ""
})

// 显示 Tabbar 的页面（只在主要导航页面显示，内页不显示）
const showTabbar = computed(() => {
  const exactPages = [
    '/user',              // 首页
    '/admin',             // 管理员首页
    '/user/todo',         // 待办列表
    '/user/announcement', // 公告列表
    '/user/meeting',      // 会议预定
    '/user/settings'      // 设置页
  ]
  return exactPages.includes(route.path)
})
</script>

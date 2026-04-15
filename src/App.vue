<template>
  <div class="page-container">
    <router-view v-slot="{ Component, route }">
      <transition :css="false" @before-enter="onBeforeEnter" @enter="onEnter" @leave="onLeave">
        <component :is="Component" :key="route.path" class="page-item" />
      </transition>
    </router-view>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { useRouter, useRoute } from "vue-router"
import gsap from "gsap"

const router = useRouter()
const route = useRoute()

// 记录来源路由
const fromRoute = ref(null)

router.beforeEach((to, from, next) => {
  fromRoute.value = from
  next()
})

// 判断动画方向
const getDirection = () => {
  const fromLevel = fromRoute.value?.meta?.level ?? 1
  const toLevel = route.meta?.level ?? 1

  // 同级切换：淡入淡出
  if (fromLevel === toLevel) return 'fade'
  // 进入深层：前进
  if (toLevel > fromLevel) return 'forward'
  // 返回浅层：后退
  return 'backward'
}

// 进入前设置初始状态
const onBeforeEnter = (el) => {
  const direction = getDirection()

  if (direction === 'forward') {
    // 新页面从右侧开始，在上层
    gsap.set(el, { x: '100%', zIndex: 10 })
  } else if (direction === 'fade') {
    gsap.set(el, { opacity: 0, zIndex: 10 })
  } else {
    // 返回时新页面在下层
    gsap.set(el, { zIndex: 1 })
  }
}

// 进入动画
const onEnter = (el, done) => {
  const direction = getDirection()

  if (direction === 'forward') {
    // 新页面从右侧滑入覆盖
    gsap.to(el, { x: '0%', duration: 0.5, ease: 'power3.out', onComplete: done })
  } else if (direction === 'fade') {
    gsap.to(el, { opacity: 1, duration: 0.35, ease: 'power2.out', onComplete: done })
  } else {
    // 返回时新页面不动，直接完成
    done()
  }
}

// 离开动画
const onLeave = (el, done) => {
  const direction = getDirection()

  if (direction === 'forward') {
    // 旧页面完全不动，在下层
    gsap.set(el, { zIndex: 1 })
    gsap.to(el, { duration: 0.5, onComplete: done })
  } else if (direction === 'fade') {
    gsap.to(el, { opacity: 0, duration: 0.35, ease: 'power2.in', onComplete: done })
  } else {
    // 返回时旧页面向右滑出
    gsap.to(el, { x: '100%', duration: 0.5, ease: 'power3.in', onComplete: done })
  }
}
</script>

<style>
#app {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.page-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.page-item {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
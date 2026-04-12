<template>
  <div class="w-full h-full flex flex-col items-center justify-center bg-[#f5f5f5]">
    <div class="text-[120px] font-bold text-[#0052D9] mb-[40px]">404</div>
    <div class="text-[32px] text-[#666] mb-[60px]">页面不存在</div>
    <t-button theme="primary" size="large" @click="goHome">
      返回首页
    </t-button>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router"

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

# 设计文档：修复待办FAB遮挡问题并添加页面切换动画

## 变更名称
`fix-fab-and-add-page-transition`

---

## 一、FAB 按钮遮挡修复

### 1.1 问题分析

**当前布局：**
```
┌─────────────────────────────────────────────────────────────┐
│                      待办页面布局                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │              待办列表内容                            │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
│                                        ┌──────────────┐     │
│                                        │  新建按钮   │ ← FAB: fixed bottom-[32px]
│                                        └──────────────┘     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│   ┌─────┬─────┬─────┬─────┬─────┐                          │
│   │首页 │待办 │会议 │公告 │我的 │  ← Tabbar: 120px + 安全区│
│   └─────┴─────┴─────┴─────┴─────┘                          │
└─────────────────────────────────────────────────────────────┘
```

**解决方案：** 将 `bottom-[32px]` 改为 `bottom-[152px]`（120px Tabbar + 32px 间距）

### 1.2 代码修改

**文件**：`src/views/todo/index.vue:78`

```diff
- <div class="fixed bottom-[32px] right-[32px]">
+ <div class="fixed bottom-[152px] right-[32px]">
```

---

## 二、路由层级定义

### 2.1 层级规划

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          路由层级定义                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  层级 0 ──────────────────────────────────────────────────────────────  │
│    /login                       登录页                                  │
│                                                                         │
│  层级 1 ─────────────────────── Tabbar 主页面 ──────────────────────   │
│    /user                        首页                                    │
│    /user/todo                   待办列表                                │
│    /user/meeting                会议预定                                │
│    /user/announcement           公告通知                                │
│    /user/settings               设置                                    │
│    /admin                       管理员首页                              │
│                                                                         │
│  层级 2 ─────────────────────── 列表/详情页 ────────────────────────   │
│    /user/todo/create            新建待办                                │
│    /user/meeting/create         新建预定                                │
│    /user/meeting/my             我的预定                                │
│    /user/announcement/:id       公告详情                                │
│    /user/trip                   我的差旅                                │
│    /user/trip/create            新建差旅                                │
│    /user/leave                  我的请假                                │
│    /user/leave/create           新建请假                                │
│    /user/attendance             考勤打卡                                │
│    /user/attendance/calendar    打卡日历                               │
│    /user/makeup                 补卡申请                                │
│    /user/document               文档查询                                │
│    /user/expense/create         填写报销                                │
│    /admin/*                     所有管理员二级页面                       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 路由配置修改

**文件**：`src/router/index.js`

```javascript
// 示例：为每个路由添加 level 字段
{
  path: "/user",
  name: "userHome",
  component: () => import("@/views/home/index.vue"),
  meta: {
    title: "首页",
    requiresAuth: true,
    role: "user",
    level: 1  // 新增
  }
},
{
  path: "/user/todo/create",
  name: "userTodoCreate",
  component: () => import("@/views/todo/create.vue"),
  meta: {
    title: "新建待办",
    requiresAuth: true,
    role: "user",
    level: 2  // 新增
  }
}
```

---

## 三、全局过渡动画

### 3.1 动画规则

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          动画方向规则                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  场景                      │  动画效果            │  示例               │
│  ──────────────────────────┼──────────────────────┼─────────────────── │
│  层级相同（Level = Level）  │  淡入淡出            │  首页↔待办↔会议    │
│                            │                      │                    │
│  层级变深（Level → Level+1）│  从右滑入            │  待办 → 新建待办    │
│                            │  ────────────────▶   │  公告 → 公告详情   │
│                            │                      │                    │
│  层级变浅（Level+1 → Level）│  向右滑出            │  新建待办 → 待办   │
│                            │  ◀────────────────  │  （返回操作）       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.2 App.vue 实现

```vue
<template>
  <router-view v-slot="{ Component, route }">
    <transition :name="transitionName" mode="out-in">
      <component :is="Component" :key="route.path" />
    </transition>
  </router-view>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const fromRoute = ref(null)

// 记录来源路由
router.beforeEach((to, from, next) => {
  fromRoute.value = from
  next()
})

// 计算过渡动画名称
const transitionName = computed(() => {
  const fromLevel = fromRoute.value?.meta?.level ?? 1
  const toLevel = route.meta?.level ?? 1

  if (fromLevel === toLevel) return 'fade'
  if (toLevel > fromLevel) return 'slide-left'   // 进入深层
  return 'slide-right'  // 返回浅层
})
</script>

<style>
/* 淡入淡出 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 从右滑入（进入深层） */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.3s ease;
}
.slide-left-enter-from {
  opacity: 0;
  transform: translateX(30px);
}
.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* 向右滑出（返回浅层） */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s ease;
}
.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}
.slide-right-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
```

### 3.3 动画效果示意

```
进入深层（slide-left）：
┌────────────┐    ┌────────────┐    ┌────────────┐
│   旧页面   │ →  │   交叉过渡  │ →  │   新页面   │
│    ←←←    │    │ ←旧 新→   │    │    →→→    │
└────────────┘    └────────────┘    └────────────┘

返回浅层（slide-right）：
┌────────────┐    ┌────────────┐    ┌────────────┐
│   旧页面   │ →  │   交叉过渡  │ →  │   新页面   │
│    →→→    │    │ ←旧 新→   │    │    ←←←    │
└────────────┘    └────────────┘    └────────────┘

同级切换（fade）：
┌────────────┐    ┌────────────┐    ┌────────────┐
│   旧页面   │ →  │   交叉过渡  │ →  │   新页面   │
│   (淡出)   │    │  透明交叉   │    │   (淡入)   │
└────────────┘    └────────────┘    └────────────┘
```

---

## 四、文件变更清单

### 修改文件

| 文件 | 变更内容 |
|------|----------|
| `src/views/todo/index.vue` | FAB 按钮 `bottom-[32px]` → `bottom-[152px]` |
| `src/router/index.js` | 所有路由 meta 新增 `level` 字段 |
| `src/App.vue` | 添加 `<transition>` 组件、路由监听、动画样式 |

---

## 五、测试要点

| 功能 | 测试项 |
|------|--------|
| FAB 按钮 | 按钮完全可见，点击区域正常 |
| Tabbar 切换 | 首页↔待办↔会议 切换时淡入淡出 |
| 进入详情 | 待办→新建待办 时从右滑入 |
| 返回操作 | 新建待办→待办 时向右滑出 |
| 动画性能 | 低端设备动画流畅，无卡顿 |

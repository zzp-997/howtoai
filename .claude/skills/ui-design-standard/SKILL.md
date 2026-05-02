---
name: howtoai-ui-design
description: HowToAI 企业协作应用 UI 设计规范 - 基于40个页面全面审查的设计规范
---

# HowToAI UI 设计规范技能

> 本规范基于项目全部40个Vue页面审查总结，用于指导后期迭代需求的 UI 代码生成。

---

## 目录

1. [设计原则](#1-设计原则)
2. [颜色系统](#2-颜色系统)
3. [字体系统](#3-字体系统)
4. [圆角系统](#4-圆角系统)
5. [间距系统](#5-间距系统)
6. [阴影系统](#6-阴影系统)
7. [首页设计](#7-首页设计)
8. [列表页设计](#8-列表页设计)
9. [表单页设计](#9-表单页设计)
10. [详情页设计](#10-详情页设计)
11. [弹窗与交互](#11-弹窗与交互)
12. [登录页设计](#12-登录页设计)
13. [动画规范](#13-动画规范)
14. [夜间模式](#14-夜间模式)
15. [图标规范](#15-图标规范)
16. [组件规范](#16-组件规范)
17. [模板代码](#17-模板代码)
18. [检查清单](#18-检查清单)

---

## 1. 设计原则

### 1.1 核心原则
- **移动端优先**: 面向企业员工的移动端应用，触摸操作为主
- **卡片式设计**: 所有内容区域使用卡片承载，清晰分区
- **渐变与圆角**: 营造现代、温暖的视觉体验
- **状态可视化**: 通过颜色、图标清晰表达状态

### 1.2 布局原则
```vue
<!-- 标准页面结构 -->
<Root :title="页面标题" back-url="/user">
  <div class="min-h-screen bg-[#f5f7fa] pb-[150px]">
    <!-- 内容区域，适配底部Tabbar -->
  </div>
</Root>
```

### 1.3 底部适配
```vue
<!-- 列表/内容页 -->
<div class="pb-[150px]">

<!-- 表单页（底部有操作栏） -->
<div class="pb-[200px]">

<!-- 固定底部操作栏 -->
<div class="fixed bottom-0 left-0 right-0 px-[32px] py-[24px] bg-white shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
```

---

## 2. 颜色系统

### 2.1 主色调渐变

| 用途 | 起始色 | 结束色 | Tailwind写法 |
|------|--------|--------|-------------|
| 主色-默认 | `#0052D9` | `#266FE8` | `from-[#0052D9] to-[#266FE8]` |
| 主色-日间 | `#0052D9` | `#266FE8` | `from-[#0052D9] to-[#266FE8]` |
| 主色-夜间 | `#3b82f6` | `#60a5fa` | `from-[#3b82f6] to-[#60a5fa]` |

### 2.2 辅助色渐变

| 用途 | 起始色 | 结束色 | 使用场景 |
|------|--------|--------|----------|
| 成功 | `#00A870` | `#2BA471` | 完成状态、已打卡 |
| 警告 | `#ED7B2F` | `#F09143` | 中优先级、进行中 |
| 危险 | `#E34D59` | `#F06956` | 高优先级、错误、删除 |
| 紫色 | `#7B61FF` | `#9B8AFF` | 推荐、智能功能 |
| 浅红 | `#FF7D7D` | `#FFA8A8` | 公告通知 |

### 2.3 功能色

| 色值 | Hex | 使用场景 |
|------|-----|----------|
| 背景灰 | `#f5f7fa` | 页面背景、输入框背景 |
| 卡片白 | `#ffffff` | 卡片背景 |
| 标题黑 | `#1e293b` | 重要标题 |
| 正文灰 | `#333333` | 正文文字 |
| 次要灰 | `#666666` | 次要文字 |
| 占位灰 | `#999999` | placeholder、禁用态 |
| 边框灰 | `#e8ecf0` | 分割线、边框 |

### 2.4 状态色映射

#### 任务状态
```javascript
TODO:        { bg: 'from-[#64748b] to-[#94a3b8]', text: '待处理' }
IN_PROGRESS: { bg: 'from-[#0052D9] to-[#266FE8]', text: '进行中' }
DONE:        { bg: 'from-[#00A870] to-[#2BA471]', text: '已完成' }
CLOSED:      { bg: 'from-[#94a3b8] to-[#cbd5e1]', text: '已关闭' }
```

#### 反馈状态
```javascript
PENDING:     { bg: 'from-[#ED7B2F] to-[#F09143]', text: '待处理' }
PROCESSING:  { bg: 'from-[#0052D9] to-[#266FE8]', text: '处理中' }
REPLIED:     { bg: 'from-[#00A870] to-[#2BA471]', text: '已回复' }
CLOSED:      { bg: 'from-[#94a3b8] to-[#cbd5e1]', text: '已关闭' }
```

#### 考勤状态
```javascript
正常: { bg: 'bg-[#E8F5E9]', text: '#00A870' }
迟到: { bg: 'bg-[#FFF3E0]', text: '#ED7B2F' }
早退: { bg: 'bg-[#FFF3E0]', text: '#ED7B2F' }
缺卡: { bg: 'bg-[#FFEBEE]', text: '#E34D59' }
请假: { bg: 'bg-[#E3F2FD]', text: '#0052D9' }
```

#### 优先级
```javascript
高: { bg: 'from-[#FFEBEE] to-[#FFCDD2]', text: '#E34D59', dot: '#E34D59' }
中: { bg: 'from-[#FFF3E0] to-[#FFE0B2]', text: '#ED7B2F', dot: '#ED7B2F' }
低: { bg: 'from-[#E8F5E9] to-[#C8E6C9]', text: '#00A870', dot: '#00A870' }
```

### 2.5 渐变背景使用场景

```vue
<!-- 顶部大标题区 -->
<div class="bg-gradient-to-br from-[#0052D9] to-[#266FE8] p-[32px] text-white">

<!-- 提醒卡片（行程/报销） -->
<div class="bg-gradient-to-br from-[#00A870] to-[#2BA471] rounded-[20px] text-white">

<!-- 智能推荐卡片 -->
<div class="bg-gradient-to-br from-[#7B61FF]/10 to-[#9B8AFF]/10 rounded-[24px]">

<!-- 警告卡片 -->
<div class="bg-gradient-to-r from-[#FFEBEE] to-[#FCE4EC] rounded-[20px] border border-[#E34D59]/20">
```

---

## 3. 字体系统

### 3.1 字体大小（移动端大字体设计）

| 名称 | 大小 | 使用场景 | 示例 |
|------|------|----------|------|
| 超大标题 | 36-44px | 页面主标题、Logo | `text-[36px]` |
| 大标题 | 30-32px | 弹窗标题、卡片标题 | `text-[30px]` |
| 标题 | 28px | 区块标题 | `text-[28px]` |
| 大正文 | 26px | 重要正文、表单标签 | `text-[26px]` |
| 正文 | 24px | 标准正文、列表内容 | `text-[24px]` |
| 小正文 | 22px | 次要信息、辅助说明 | `text-[22px]` |
| 描述 | 20px | 标签文字、时间显示 | `text-[20px]` |
| 最小 | 18px | 角标、标签内文字 | `text-[18px]` |
| 角标 | 14-16px | 数字角标、徽章 | `text-[14px]` |

### 3.2 字体重量

```vue
<!-- 粗体 - 标题、重要数字 -->
<div class="text-[28px] font-bold">

<!-- 半粗 - 卡片标题、按钮文字 -->
<div class="text-[24px] font-semibold">

<!-- 中等 - 标签、分隔标签 -->
<div class="text-[20px] font-medium">

<!-- 常规 - 正文内容 -->
<div class="text-[24px] font-normal">
```

### 3.3 文字颜色

```vue
<!-- 标题黑 -->
<div class="text-[#1e293b]">标题</div>

<!-- 正文灰 -->
<div class="text-[#333333]">正文</div>

<!-- 次要灰 -->
<div class="text-[#666666]">次要信息</div>

<!-- 占位灰 -->
<div class="text-[#999999]">placeholder</div>

<!-- 主题蓝 -->
<div class="text-[#0052D9]">链接、强调</div>

<!-- 成功绿 -->
<div class="text-[#00A870]">成功状态</div>

<!-- 警告橙 -->
<div class="text-[#ED7B2F]">警告状态</div>

<!-- 危险红 -->
<div class="text-[#E34D59]">危险、错误</div>
```

---

## 4. 圆角系统

### 4.1 圆角层级

| 层级 | 大小 | 使用元素 |
|------|------|----------|
| L1-页面容器 | 24px | 页面主卡片、弹窗 |
| L2-大卡片 | 20-24px | 列表卡片、详情卡片 |
| L3-中卡片 | 16-20px | 内嵌卡片、输入框容器 |
| L4-按钮 | 12-16px | 按钮、内联卡片 |
| L5-小组件 | 8-12px | 标签、筛选器、头像 |
| L6-圆形 | full | 头像、角标、勾选框 |

### 4.2 圆角速查表

```vue
<!-- 页面主卡片 - 24px -->
<div class="bg-white rounded-[24px] p-[24px]">

<!-- 列表卡片 - 20-24px -->
<div class="bg-white rounded-[20px] p-[20px]">
<div class="bg-white rounded-[24px] shadow-lg">

<!-- 按钮 - 12-16px -->
<button class="h-[72px] rounded-[16px]">
<t-button class="!rounded-[14px]">

<!-- 输入框 - 12-16px -->
<input class="!rounded-[12px] !rounded-[16px]">

<!-- 标签/徽章 - 6-12px -->
<span class="px-[12px] py-[4px] rounded-[8px]">
<div class="rounded-[6px]">

<!-- 头像 - 28px 或 full -->
<div class="w-[100px] h-[100px] rounded-[28px]">
<div class="w-[48px] h-[48px] rounded-full">

<!-- 角标 - full -->
<div class="min-w-[24px] h-[24px] rounded-full">
```

### 4.3 渐变头部的圆角

```vue
<!-- 卡片顶部渐变条 -->
<div class="h-[8px] bg-gradient-to-r from-[#0052D9] via-[#7B61FF] to-[#00A870] rounded-t-[24px]">

<!-- 弹窗顶部圆角 -->
<div class="bg-white rounded-t-[32px]">

<!-- 胶囊标签 -->
<div class="px-[20px] h-[52px] rounded-full">
```

---

## 5. 间距系统

### 5.1 页面级间距

```vue
<!-- 页面水平边距 -->
<div class="px-[32px]">
<div class="px-[24px]">

<!-- 区块垂直间距 -->
<div class="mb-[24px]">
<div class="mb-[32px]">

<!-- 页面底部留白（适配Tabbar） -->
<div class="pb-[150px]">
```

### 5.2 卡片级间距

```vue
<!-- 大卡片内边距 -->
<div class="p-[24px]">
<div class="p-[20px]">

<!-- 卡片内元素间距 -->
<div class="gap-[16px]">
<div class="gap-[12px]">

<!-- 卡片外边距 -->
<div class="mb-[16px]">
<div class="mb-[20px]">
```

### 5.3 间距速查表

| 名称 | 大小 | 使用场景 |
|------|------|----------|
| 页面边距 | 32px / 24px | `px-[32px]` / `px-[24px]` |
| 卡片内边距 | 24px / 20px | `p-[24px]` / `p-[20px]` |
| 大间距 | 24px / 20px | `gap-[24px]` / `gap-[20px]` |
| 中间距 | 16px / 12px | `gap-[16px]` / `gap-[12px]` |
| 小间距 | 8px | `gap-[8px]` |
| 底部适配 | 150px | `pb-[150px]` (Tabbar) |

### 5.4 元素垂直排列

```vue
<!-- 标题与内容间距 -->
<div class="text-[28px] font-bold mb-[16px]">标题</div>
<div class="text-[24px] text-[#666]">内容</div>

<!-- 表单标签与输入框 -->
<div class="text-[26px] font-medium text-[#333] mb-[14px]">标签</div>
<t-input />

<!-- 列表项间距 -->
<div class="space-y-[16px]">
  <div class="p-[20px]">列表项1</div>
  <div class="p-[20px]">列表项2</div>
</div>
```

---

## 6. 阴影系统

### 6.1 阴影层级

| 层级 | 写法 | 使用场景 |
|------|------|----------|
| 轻阴影 | `shadow-sm` | 分割线、细微层级 |
| 中阴影 | `shadow-lg shadow-slate-200/50` | 卡片默认阴影 |
| 重阴影 | `shadow-xl` / `shadow-2xl` | 弹窗、浮层 |
| 悬停阴影 | `hover:shadow-xl` | 可交互卡片悬停 |

### 6.2 主题色阴影

```vue
<!-- 主色阴影 - 按钮、激活态 -->
<div class="shadow-lg shadow-[#0052D9]/30">
<div class="shadow-xl shadow-[#0052D9]/25">

<!-- 成功色阴影 -->
<div class="shadow-lg shadow-[#00A870]/20">

<!-- 危险色阴影 -->
<div class="shadow-lg shadow-[#E34D59]/30">

<!-- 紫色阴影 -->
<div class="shadow-lg shadow-[#7B61FF]/20">
```

### 6.3 阴影使用场景

```vue
<!-- 卡片阴影 - 日间模式 -->
<div class="bg-white rounded-[24px] shadow-lg shadow-slate-200/50 border border-slate-100">

<!-- 卡片阴影 - 悬停 -->
<div class="hover:shadow-xl transition-shadow cursor-pointer">

<!-- 按钮阴影 -->
<t-button class="shadow-lg shadow-[#0052D9]/30">

<!-- 头像阴影 -->
<div class="shadow-xl shadow-[#0052D9]/25">

<!-- 角标阴影 -->
<div class="shadow-lg shadow-[#E34D59]/30">
```

### 6.4 日间/夜间阴影差异

```css
/* 日间模式 */
.shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); }

/* 夜间模式 (在 [data-theme="dark"] 中) */
[data-theme="dark"] .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3); }
[data-theme="dark"] .shadow-xl { box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3); }
```

---

## 7. 首页设计

### 7.1 首页布局结构

```
┌─────────────────────────────────────┐
│  背景装饰 (blur-xl渐变圆形)          │
├─────────────────────────────────────┤
│  顶部欢迎区 (pt-[60px])              │
│  ├── 头像容器 (100px, rounded-[28px])│
│  ├── 用户信息 + 角色标签              │
│  └── 日期信息栏                       │
├─────────────────────────────────────┤
│  公告轮播卡片 (可选)                  │
├─────────────────────────────────────┤
│  考勤状态卡片 (可选)                  │
│  ├── 左侧渐变指示条                   │
│  └── 上班/下班双列打卡                │
├─────────────────────────────────────┤
│  提醒卡片 (行程/报销) (可选)         │
│  └── 渐变背景 + 装饰圆形              │
├─────────────────────────────────────┤
│  待办事项模块 (可选)                  │
│  ├── 超期预警                        │
│  └── 待办列表                        │
├─────────────────────────────────────┤
│  智能推荐模块 (可选)                  │
│  └── 轮播卡片                        │
├─────────────────────────────────────┤
│  功能入口网格 (2列)                   │
└─────────────────────────────────────┘
```

### 7.2 头像容器

```vue
<div class="avatar-container relative">
  <!-- 主头像 -->
  <div class="w-[100px] h-[100px] bg-gradient-to-br from-[#0052D9] to-[#266FE8] rounded-[28px] flex items-center justify-center text-[44px] font-bold text-white shadow-xl shadow-[#0052D9]/25">
    {{ userName?.charAt(0) || 'U' }}
  </div>

  <!-- 状态指示点（可选） -->
  <div class="absolute -bottom-[4px] -right-[4px] w-[32px] h-[32px] bg-gradient-to-br from-[#00A870] to-[#2BA471] rounded-full flex items-center justify-center shadow-lg shadow-[#00A870]/30">
    <CheckCircleIcon class="text-[18px] text-white" />
  </div>

  <!-- 数字角标（可选） -->
  <div v-if="count > 0" class="absolute -top-[4px] -right-[4px] min-w-[28px] h-[28px] bg-gradient-to-br from-[#E34D59] to-[#F06956] rounded-full flex items-center justify-center px-[6px] shadow-lg animate-bounce-subtle">
    <span class="text-[16px] text-white font-bold">{{ count > 9 ? '9+' : count }}</span>
  </div>
</div>
```

### 7.3 欢迎语样式

```vue
<!-- 问候语 - 36px粗体 -->
<div class="text-[36px] font-bold text-[#1e293b] tracking-tight">
  {{ getGreeting() }}
</div>

<!-- 用户名 + 角色标签 -->
<div class="text-[26px] text-[#64748b] mt-[4px] flex items-center gap-[8px]">
  <span>{{ userName }}</span>
  <span class="w-[1px] h-[18px] bg-[#cbd5e1]"></span>
  <span class="px-[10px] py-[2px] bg-gradient-to-r from-[#0052D9]/10 to-[#266FE8]/10 rounded-[6px] text-[#0052D9] font-medium">
    {{ isAdmin ? '管理员' : '员工' }}
  </span>
</div>
```

### 7.4 考勤状态卡片

```vue
<div class="attendance-card bg-white rounded-[20px] shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden">
  <div class="flex items-center">
    <!-- 左侧渐变指示条 -->
    <div class="w-[8px] h-full bg-gradient-to-b from-[#0052D9] to-[#266FE8] self-stretch"></div>

    <div class="flex-1 p-[16px]">
      <!-- 标题区 -->
      <div class="flex items-center justify-between mb-[10px]">
        <div class="flex items-center gap-[10px]">
          <div class="w-[36px] h-[36px] bg-gradient-to-br from-[#0052D9]/10 to-[#266FE8]/10 rounded-[10px] flex items-center justify-center">
            <TimeFilledIcon class="text-[20px] text-[#0052D9]" />
          </div>
          <span class="text-[24px] font-semibold text-[#1e293b]">今日考勤</span>
        </div>
        <span class="text-[20px] text-[#94a3b8]">详情 ›</span>
      </div>

      <!-- 上班/下班双列 -->
      <div class="flex items-center gap-[16px]">
        <!-- 上班打卡 -->
        <div class="flex-1 flex items-center gap-[12px] py-[8px] px-[12px] rounded-[12px] transition-all cursor-pointer hover:bg-slate-50">
          <div :class="['w-[32px] h-[32px] rounded-[10px] flex items-center justify-center', isCheckedIn ? 'bg-[#00A870]/10' : 'bg-slate-100']">
            <LoginIcon :class="['text-[18px]', isCheckedIn ? 'text-[#00A870]' : 'text-slate-400']" />
          </div>
          <div>
            <div class="text-[16px] text-[#94a3b8]">上班</div>
            <div class="text-[24px] font-bold text-[#1e293b]">{{ checkInTime || '--:--' }}</div>
          </div>
          <div v-if="isLate" class="px-[8px] py-[2px] bg-[#FFEBEE] text-[#E34D59] text-[14px] rounded-[4px]">迟到</div>
        </div>

        <div class="w-[1px] h-[40px] bg-slate-200"></div>

        <!-- 下班打卡 -->
        <div class="flex-1 flex items-center gap-[12px] py-[8px] px-[12px] rounded-[12px] transition-all cursor-pointer hover:bg-slate-50">
          <!-- 类似结构 -->
        </div>
      </div>
    </div>
  </div>
</div>
```

### 7.5 提醒卡片（渐变背景）

```vue
<div class="trip-reminder-card bg-gradient-to-br from-[#00A870] to-[#2BA471] rounded-[20px] p-[20px] text-white relative overflow-hidden">
  <!-- 装饰背景 -->
  <div class="absolute -top-[20px] -right-[20px] w-[120px] h-[120px] bg-white/10 rounded-full"></div>

  <div class="flex items-start justify-between relative z-10">
    <div class="flex-1">
      <!-- 图标 + 标题 -->
      <div class="flex items-center gap-[10px] mb-[12px]">
        <div class="w-[40px] h-[40px] bg-white/20 rounded-[12px] flex items-center justify-center">
          <LocationIcon class="text-[22px] text-white" />
        </div>
        <div>
          <div class="text-[18px] opacity-80">明天出发</div>
          <div class="text-[28px] font-semibold">{{ destination }}</div>
        </div>
      </div>

      <!-- 信息行 -->
      <div class="flex items-center gap-[20px] text-[22px] opacity-90 mb-[12px]">
        <span>{{ startDate }}</span>
        <span class="w-[1px] h-[16px] bg-white/30"></span>
        <span>{{ reason }}</span>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="flex flex-col gap-[10px]">
      <t-button theme="primary" size="small" class="h-[56px] px-[20px] bg-white text-[#00A870] border-0 rounded-[12px]">
        详情
      </t-button>
    </div>
  </div>
</div>
```

### 7.6 功能入口网格

```vue
<div class="grid grid-cols-2 gap-[16px]">
  <div
    v-for="item in menuList"
    :key="item.id"
    class="menu-card relative bg-white rounded-[20px] p-[20px] shadow-lg shadow-slate-200/50 overflow-hidden active:scale-[0.97] transition-all cursor-pointer group border border-slate-100"
  >
    <!-- 背景装饰图标 -->
    <div class="absolute top-[-10px] right-[-10px] w-[80px] h-[80px] opacity-[0.03] transform translate-x-[10px] -translate-y-[10px]">
      <component :is="item.icon" class="text-[100px]" :style="{ color: item.color }" />
    </div>

    <!-- 数字角标（可选） -->
    <div v-if="item.showBadge && item.badgeCount > 0" class="absolute top-[8px] right-[8px] min-w-[24px] h-[24px] bg-gradient-to-br from-[#E34D59] to-[#F06956] rounded-full flex items-center justify-center px-[6px] shadow-lg z-20">
      <span class="text-[14px] text-white font-bold">{{ item.badgeCount }}</span>
    </div>

    <!-- 图标容器 - 渐变背景 + 阴影 -->
    <div
      class="w-[48px] h-[48px] rounded-[14px] flex items-center justify-center mb-[12px] relative z-10"
      :style="{ background: item.gradient, boxShadow: `0 8px 24px ${item.color}25` }"
    >
      <component :is="item.icon" class="text-[24px] text-white" />
    </div>

    <!-- 文字 -->
    <div class="text-[24px] font-semibold text-[#1e293b] mb-[4px] relative z-10">{{ item.title }}</div>
    <div class="text-[20px] text-[#94a3b8] leading-[1.4] relative z-10">{{ item.desc }}</div>

    <!-- 箭头 -->
    <ChevronRightIcon class="absolute bottom-[16px] right-[12px] text-[20px] text-slate-300" />
  </div>
</div>
```

### 7.7 待办事项模块

```vue
<!-- 超期预警 -->
<div v-if="overdueCount > 0" class="warning-card bg-gradient-to-r from-[#FFEBEE] to-[#FCE4EC] rounded-[20px] p-[20px] mb-[16px] border border-[#E34D59]/20">
  <div class="flex items-center gap-[10px] text-[#E34D59] text-[24px] font-medium mb-[12px]">
    <div class="w-[28px] h-[28px] bg-[#E34D59] rounded-[8px] flex items-center justify-center">
      <ErrorCircleIcon class="text-[18px] text-white" />
    </div>
    <span>您有 {{ overdueCount }} 项待办已超期</span>
  </div>
  <div class="flex flex-wrap gap-[12px]">
    <div v-for="todo in overdueTodos.slice(0, 3)" :key="todo.id" class="bg-white px-[18px] py-[10px] rounded-[14px] text-[22px] text-[#475569] cursor-pointer shadow-sm hover:shadow-md transition-shadow">
      {{ todo.title }}
    </div>
  </div>
</div>

<!-- 待办列表 -->
<div class="todo-list bg-white rounded-[24px] shadow-lg shadow-slate-200/50 overflow-hidden border border-slate-100">
  <div v-for="todo in displayTodos" :key="todo.id" class="todo-item flex items-center gap-[16px] p-[20px] border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 transition-colors">
    <!-- 完成勾选 -->
    <div
      :class="['w-[36px] h-[36px] rounded-full flex items-center justify-center flex-shrink-0 transition-all cursor-pointer border-2',
        todo.completed ? 'bg-[#00A870] border-[#00A870]' : 'border-slate-300 hover:border-[#0052D9]']"
    >
      <CheckIcon v-if="todo.completed" class="text-[20px] text-white" />
    </div>

    <!-- 内容 -->
    <div class="flex-1 min-w-0">
      <div :class="['text-[26px] truncate font-medium', todo.completed ? 'line-through text-[#999]' : 'text-[#1e293b]']">
        {{ todo.title }}
      </div>
      <div class="flex items-center gap-[10px] mt-[6px]">
        <span class="text-[20px] font-medium" :style="{ color: getPriorityColor(todo.priority) }">
          {{ getPriorityLabel(todo.priority) }}
        </span>
        <span v-if="todo.dueDate" class="text-[20px] text-[#0052D9]">
          {{ formatDueDate(todo.dueDate) }}
        </span>
      </div>
    </div>
  </div>

  <!-- 添加按钮 -->
  <div class="p-[16px] border-t border-slate-100">
    <div class="flex items-center justify-center gap-[10px] py-[14px] bg-gradient-to-r from-[#7B61FF]/10 via-[#8B7AFF]/10 to-[#9B8AFF]/10 rounded-[16px] cursor-pointer hover:from-[#7B61FF]/20 hover:via-[#8B7AFF]/20 hover:to-[#9B8AFF]/20 transition-all group">
      <div class="w-[32px] h-[32px] bg-gradient-to-br from-[#7B61FF] to-[#9B8AFF] rounded-[10px] flex items-center justify-center shadow-md shadow-[#7B61FF]/20 group-hover:shadow-lg group-hover:scale-110 transition-all">
        <AddIcon class="text-[20px] text-white" />
      </div>
      <span class="text-[24px] text-[#7B61FF] font-semibold">添加待办</span>
    </div>
  </div>
</div>
```

### 7.8 空状态设计

```vue
<div class="text-center py-[80px]">
  <!-- 插图容器 -->
  <div class="w-[160px] h-[160px] mx-auto bg-gradient-to-br from-[#f0f7ff] to-[#e0e7ff] rounded-full flex items-center justify-center mb-[24px] shadow-lg">
    <div class="w-[120px] h-[120px] bg-white rounded-full flex items-center justify-center">
      <FileIcon class="text-[64px] text-[#7B61FF]" />
    </div>
  </div>

  <!-- 文字 -->
  <div class="text-[30px] font-semibold text-[#64748b] mb-[8px]">暂无数据</div>
  <div class="text-[24px] text-[#94a3b8] mb-[24px]">去其他地方看看吧</div>

  <!-- 操作按钮 -->
  <div
    class="mt-[24px] inline-flex items-center gap-[8px] px-[24px] py-[12px] bg-gradient-to-r from-[#0052D9] to-[#266FE8] text-white rounded-full text-[24px] font-medium cursor-pointer active:scale-95 transition-all shadow-lg shadow-[#0052D9]/20"
    @click="handleAction"
  >
    <AddIcon class="text-[24px]" />
    立即创建
  </div>
</div>
```

---

## 8. 列表页设计

### 8.1 标准列表页结构

```
┌─────────────────────────────────────┐
│  Navbar / 页面标题                   │
├─────────────────────────────────────┤
│  顶部操作栏 (Sticky)                 │
│  ├── 搜索框                          │
│  └── 筛选标签                        │
├─────────────────────────────────────┤
│  内容列表                            │
│  ├── 列表卡片 1                       │
│  ├── 列表卡片 2                       │
│  ├── 列表卡片 3                       │
│  └── ...                            │
├─────────────────────────────────────┤
│  空状态（无数据时）                   │
└─────────────────────────────────────┘
```

### 8.2 顶部搜索栏

```vue
<div class="bg-white sticky top-0 z-10 shadow-sm px-[24px] pt-[16px] pb-[12px]">
  <!-- 搜索框 -->
  <div class="flex gap-[12px] mb-[16px]">
    <t-input
      v-model="searchKeyword"
      placeholder="搜索..."
      class="flex-1 !h-[72px] !bg-[#f5f7fa] !rounded-[16px]"
      clearable
    >
      <template #prefix-icon>
        <SearchIcon class="text-[28px] text-[#999]" />
      </template>
    </t-input>
    <t-button
      theme="primary"
      size="large"
      class="!w-[88px] !h-[72px] !rounded-[16px] !bg-gradient-to-r !from-[#0052D9] !to-[#266FE8] shadow-lg shadow-[#0052D9]/30"
      @click="router.push('/create')"
    >
      <template #icon><AddIcon class="text-[32px]" /></template>
    </t-button>
  </div>

  <!-- 筛选标签 -->
  <div class="flex gap-[12px] overflow-x-auto [scrollbar-width:none]">
    <div
      v-for="filter in filters"
      :key="filter.value"
      :class="[
        'flex-shrink-0 px-[20px] h-[52px] rounded-full text-[24px] font-medium transition-all cursor-pointer flex items-center gap-[8px]',
        activeFilter === filter.value
          ? 'bg-gradient-to-r from-[#0052D9] to-[#266FE8] text-white shadow-lg shadow-[#0052D9]/20'
          : 'bg-[#f5f7fa] text-[#666] hover:bg-[#e8ecf0]'
      ]"
      @click="activeFilter = filter.value"
    >
      <FilterIcon v-if="activeFilter === filter.value" class="text-[22px]" />
      {{ filter.label }}
    </div>
  </div>
</div>
```

### 8.3 列表卡片

```vue
<div
  v-for="(item, index) in list"
  :key="item.id"
  class="bg-white rounded-[20px] shadow-sm overflow-hidden cursor-pointer active:scale-[0.99] transition-all hover:shadow-lg"
  :style="{ animationDelay: `${index * 60}ms` }"
  @click="goToDetail(item)"
>
  <!-- 状态头部（可选） -->
  <div :class="['px-[20px] py-[14px] flex items-center justify-between', getStatusBg(item.status)]">
    <div class="flex items-center gap-[10px]">
      <div :class="['w-[8px] h-[8px] rounded-full', item.isUrgent ? 'bg-white animate-pulse' : 'bg-white/80']"></div>
      <span class="text-[24px] text-white/90">{{ item.type }}</span>
    </div>
    <div class="px-[12px] py-[4px] bg-white/20 rounded-[8px] text-[20px] text-white">
      {{ getStatusText(item.status) }}
    </div>
  </div>

  <!-- 内容区 -->
  <div class="p-[20px]">
    <!-- 标题 -->
    <div class="text-[28px] font-semibold text-[#1e293b] mb-[10px] line-clamp-1">
      {{ item.title }}
    </div>

    <!-- 内容预览 -->
    <div class="text-[24px] text-[#64748b] mb-[16px] line-clamp-2 leading-relaxed">
      {{ item.content }}
    </div>

    <!-- 图片预览（可选） -->
    <div v-if="item.images?.length > 0" class="flex gap-[10px] mb-[16px]">
      <img
        v-for="(img, idx) in item.images.slice(0, 4)"
        :key="idx"
        :src="img"
        class="w-[90px] h-[90px] rounded-[14px] object-cover shadow-sm"
      />
      <div v-if="item.images.length > 4" class="w-[90px] h-[90px] rounded-[14px] bg-[#f5f7fa] flex items-center justify-center text-[24px] text-[#666] font-medium">
        +{{ item.images.length - 4 }}
      </div>
    </div>

    <!-- 底部信息栏 -->
    <div class="flex items-center justify-between pt-[14px] border-t border-[#f0f0f0]">
      <div class="flex items-center gap-[6px] text-[22px] text-[#94a3b8]">
        <TimeIcon class="text-[20px]" />
        {{ formatDate(item.createdAt) }}
      </div>
      <div v-if="item.replyCount > 0" class="flex items-center gap-[6px] text-[#0052D9] text-[24px] font-medium">
        <ChatIcon class="text-[22px]" />
        {{ item.replyCount }} 条回复
        <ChevronRightIcon class="text-[20px]" />
      </div>
      <div v-else class="text-[22px] text-[#cbd5e1]">
        点击查看详情
      </div>
    </div>
  </div>
</div>
```

### 8.4 状态筛选Tab

```vue
<!-- 胶囊标签式 -->
<div class="flex gap-[12px] overflow-x-auto [scrollbar-width:none]">
  <div
    v-for="tab in tabs"
    :key="tab.value"
    :class="[
      'flex-shrink-0 px-[20px] h-[52px] rounded-full text-[24px] font-medium transition-all cursor-pointer flex items-center gap-[8px]',
      activeTab === tab.value
        ? 'bg-gradient-to-r from-[#0052D9] to-[#266FE8] text-white shadow-lg shadow-[#0052D9]/20'
        : 'bg-white text-[#666] shadow-sm'
    ]"
  >
    <span>{{ tab.label }}</span>
    <span v-if="tab.count > 0" :class="['px-[8px] py-[2px] rounded-full text-[20px]', activeTab === tab.value ? 'bg-white/20' : 'bg-[#f0f0f0]']">
      {{ tab.count }}
    </span>
  </div>
</div>

<!-- 填充式Tab -->
<div class="flex bg-white rounded-[24px] p-[8px]">
  <div
    v-for="tab in tabs"
    :key="tab.value"
    :class="[
      'flex-1 py-[16px] rounded-[16px] text-[26px] font-semibold text-center transition-all cursor-pointer',
      activeTab === tab.value
        ? 'bg-gradient-to-r from-[#0052D9] to-[#266FE8] text-white shadow-lg shadow-[#0052D9]/30'
        : 'text-[#666]'
    ]"
  >
    {{ tab.label }}
  </div>
</div>
```

### 8.5 列表卡片入场动画

```vue
<style scoped>
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.bg-white.rounded-\[20px\] {
  animation: slideInUp 0.3s ease-out forwards;
}

/* 交错延迟 - 最多5个 */
.bg-white.rounded-\[20px\]:nth-child(1) { animation-delay: 0ms; }
.bg-white.rounded-\[20px\]:nth-child(2) { animation-delay: 60ms; }
.bg-white.rounded-\[20px\]:nth-child(3) { animation-delay: 120ms; }
.bg-white.rounded-\[20px\]:nth-child(4) { animation-delay: 180ms; }
.bg-white.rounded-\[20px\]:nth-child(5) { animation-delay: 240ms; }
</style>
```

---

## 9. 表单页设计

### 9.1 标准表单页结构

```
┌─────────────────────────────────────┐
│  Navbar / 页面标题                   │
├─────────────────────────────────────┤
│  表单卡片                            │
│  ├── 装饰条（可选）                   │
│  ├── 区块标题                         │
│  └── 表单项                           │
│      ├── 输入框                       │
│      ├── 选择器                       │
│      ├── 日期选择                     │
│      ├── 图片上传                    │
│      └── ...                         │
├─────────────────────────────────────┤
│  底部固定操作栏（可选）               │
│  └── 提交按钮                        │
└─────────────────────────────────────┘
```

### 9.2 表单卡片容器

```vue
<div class="bg-white rounded-[24px] shadow-lg shadow-slate-200/50 overflow-hidden">
  <!-- 顶部彩虹装饰条 -->
  <div class="h-[8px] bg-gradient-to-r from-[#0052D9] via-[#7B61FF] to-[#00A870]"></div>

  <div class="p-[28px]">
    <!-- 区块标题 -->
    <div class="text-[30px] font-bold text-[#1e293b] mb-[24px] flex items-center gap-[12px]">
      <div class="w-[8px] h-[32px] rounded-[4px] bg-gradient-to-b from-[#0052D9] to-[#266FE8]"></div>
      基本信息
    </div>

    <t-form :data="formData" :rules="formRules" ref="formRef">
      <!-- 表单项 -->
    </t-form>
  </div>
</div>
```

### 9.3 输入框

```vue
<!-- 标准输入框 -->
<div class="mb-[28px]">
  <div class="text-[26px] font-medium text-[#333] mb-[14px]">
    标题 <span class="text-[#E34D59]">*</span>
  </div>
  <t-input
    v-model="formData.title"
    placeholder="请输入简明扼要的问题描述..."
    :maxlength="50"
    show-limit-number
    clearable
    class="!h-[80px] !text-[26px] !bg-[#f8fafc] !rounded-[16px] !border !border-[#e8ecf0] focus:!border-[#0052D9]"
  />
</div>

<!-- 搜索框样式 -->
<t-input
  v-model="keyword"
  placeholder="搜索..."
  class="!h-[72px] !bg-[#f5f7fa] !rounded-[16px]"
>
  <template #prefix-icon>
    <SearchIcon class="text-[24px] text-[#999]" />
  </template>
</t-input>
```

### 9.4 文本域

```vue
<div class="mb-[28px]">
  <div class="text-[26px] font-medium text-[#333] mb-[14px]">
    详细描述 <span class="text-[#E34D59]">*</span>
  </div>
  <t-textarea
    v-model="formData.content"
    placeholder="请详细描述..."
    :maxlength="500"
    :autosize="{ minRows: 5, maxRows: 10 }"
    indicator
    class="!text-[26px] !bg-[#f8fafc] !rounded-[16px] !border !border-[#e8ecf0] focus:!border-[#0052D9]"
  />
</div>
```

### 9.5 选择器卡片

```vue
<!-- 类型选择 -->
<div class="mb-[28px]">
  <div class="text-[26px] font-medium text-[#333] mb-[14px]">
    反馈类型 <span class="text-[#E34D59]">*</span>
  </div>
  <div class="grid grid-cols-3 gap-[12px]">
    <div
      v-for="option in options"
      :key="option.value"
      :class="[
        'py-[16px] px-[12px] rounded-[16px] text-center text-[24px] font-medium cursor-pointer transition-all border-2',
        formData.type === option.value
          ? 'border-[#0052D9] bg-gradient-to-b from-[#EEF4FF] to-[#dbeafe] text-[#0052D9] shadow-md'
          : 'border-[#e8ecf0] bg-[#f8fafc] text-[#666] hover:border-[#0052D9]/30'
      ]"
      @click="formData.type = option.value"
    >
      <div :class="['text-[32px] mb-[6px]', formData.type === option.value ? 'scale-110' : 'grayscale']">
        {{ option.icon }}
      </div>
      <div>{{ option.label }}</div>
    </div>
  </div>
</div>

<!-- 下拉选择触发器 -->
<div
  class="w-full h-[80px] bg-[#f8fafc] rounded-[16px] px-[20px] flex items-center justify-between cursor-pointer border border-[#e8ecf0]"
  @click="showPicker = true"
>
  <span :class="['text-[26px]', formData.type ? 'text-[#333]' : 'text-[#999]']">
    {{ formData.type || '请选择' }}
  </span>
  <ChevronDownIcon class="text-[24px] text-[#999]" />
</div>
```

### 9.6 图片上传

```vue
<div class="mb-[32px]">
  <div class="text-[26px] font-medium text-[#333] mb-[14px] flex items-center gap-[8px]">
    上传图片
    <span class="text-[22px] text-[#999] font-normal">(最多5张)</span>
  </div>

  <div class="flex flex-wrap gap-[16px]">
    <!-- 已上传图片 -->
    <div
      v-for="(file, index) in fileList"
      :key="index"
      class="relative w-[150px] h-[150px] rounded-[20px] overflow-hidden shadow-lg group"
    >
      <img :src="file.url" class="w-full h-full object-cover" />

      <!-- 删除按钮 - hover显示 -->
      <div
        class="absolute top-[8px] right-[8px] w-[36px] h-[36px] bg-[#E34D59] rounded-full flex items-center justify-center shadow-lg cursor-pointer opacity-0 group-hover:opacity-100 transition-all active:scale-95"
        @click.stop="removeFile(index)"
      >
        <CloseIcon class="text-[20px] text-white" />
      </div>

      <!-- 图片索引 -->
      <div class="absolute bottom-[8px] left-[8px] px-[10px] py-[4px] bg-black/50 rounded-[8px] text-[20px] text-white">
        {{ index + 1 }}
      </div>
    </div>

    <!-- 添加按钮 -->
    <div
      v-if="fileList.length < 5"
      class="w-[150px] h-[150px] rounded-[20px] bg-[#f8fafc] border-2 border-dashed border-[#d1d5db] flex flex-col items-center justify-center cursor-pointer hover:border-[#0052D9] hover:bg-[#f0f7ff] transition-all active:scale-95"
      @click="triggerUpload"
    >
      <div class="w-[64px] h-[64px] bg-[#e8ecf0] rounded-full flex items-center justify-center mb-[8px]">
        <AddIcon class="text-[36px] text-[#666]" />
      </div>
      <span class="text-[22px] text-[#666]">添加图片</span>
    </div>
  </div>

  <div class="text-[22px] text-[#999] mt-[12px] flex items-center gap-[6px]">
    <InfoCircleIcon class="text-[20px]" />
    每张图片不超过5MB，支持JPG、PNG格式
  </div>
</div>

<!-- 隐藏的 file input -->
<input ref="fileInput" type="file" accept="image/*" multiple class="hidden" @change="handleFileChange" />
```

### 9.7 提交按钮

```vue
<!-- 主要提交按钮 -->
<t-button
  theme="primary"
  size="large"
  block
  :loading="submitting"
  :disabled="!isValid"
  class="!h-[88px] !text-[28px] !rounded-[20px] !bg-gradient-to-r !from-[#0052D9] !to-[#266FE8] shadow-xl shadow-[#0052D9]/30 active:scale-[0.98] transition-transform"
  @click="handleSubmit"
>
  <template #icon>
    <SendIcon class="text-[28px]" />
  </template>
  提交反馈
</t-button>

<!-- 底部固定操作栏 -->
<div class="fixed bottom-0 left-0 right-0 px-[32px] py-[24px] bg-white shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
  <t-button
    theme="primary"
    size="large"
    block
    :loading="submitting"
    class="!h-[88px] !text-[28px] !rounded-[20px]"
  >
    提交
  </t-button>
</div>
```

---

## 10. 详情页设计

### 10.1 详情页布局

```
┌─────────────────────────────────────┐
│  Navbar / 返回按钮                   │
├─────────────────────────────────────┤
│  状态/类型标签                       │
│  标题                               │
│  元信息（时间、作者等）               │
├─────────────────────────────────────┤
│  正文内容                            │
│  （可包含图片、附件等）               │
├─────────────────────────────────────┤
│  关联信息区                         │
│  （回复、评论、操作记录等）            │
└─────────────────────────────────────┘
```

### 10.2 详情卡片

```vue
<div class="bg-white rounded-[24px] shadow-lg shadow-slate-200/50 overflow-hidden">
  <!-- 顶部装饰条 -->
  <div class="h-[8px] bg-gradient-to-r from-[#0052D9] via-[#7B61FF] to-[#00A870]"></div>

  <div class="p-[28px]">
    <!-- 状态和类型 -->
    <div class="flex items-center gap-[12px] mb-[20px]">
      <div :class="['px-[16px] py-[8px] rounded-[12px] text-[24px] text-white flex items-center gap-[8px]', getStatusBg(item.status)]">
        <div class="w-[8px] h-[8px] rounded-full bg-white/80"></div>
        {{ getStatusText(item.status) }}
      </div>
      <span class="text-[24px] text-[#64748b]">{{ item.type }}</span>
    </div>

    <!-- 标题 -->
    <div class="text-[32px] font-bold text-[#1e293b] mb-[16px] leading-tight">
      {{ item.title }}
    </div>

    <!-- 提交时间 -->
    <div class="flex items-center gap-[8px] text-[22px] text-[#94a3b8] mb-[24px]">
      <TimeIcon class="text-[20px]" />
      提交于 {{ formatDate(item.createdAt) }}
    </div>

    <!-- 内容 -->
    <div class="bg-[#f8fafc] rounded-[20px] p-[20px] mb-[24px]">
      <div class="text-[26px] text-[#334155] leading-[1.8] whitespace-pre-wrap">
        {{ item.content }}
      </div>
    </div>

    <!-- 图片网格 -->
    <div v-if="item.images?.length > 0" class="mb-[28px]">
      <div class="text-[24px] font-medium text-[#333] mb-[12px]">
        附件图片 ({{ item.images.length }})
      </div>
      <div class="flex flex-wrap gap-[12px]">
        <img
          v-for="(img, idx) in item.images"
          :key="idx"
          :src="img"
          class="w-[140px] h-[140px] rounded-[16px] object-cover shadow-sm cursor-pointer active:scale-95 transition-all"
          @click="previewImage(img)"
        />
      </div>
    </div>

    <!-- 回复列表 -->
    <div v-if="replies.length > 0" class="border-t border-[#f0f0f0] pt-[24px]">
      <div class="text-[26px] font-bold text-[#1e293b] mb-[20px] flex items-center gap-[10px]">
        <div class="w-[6px] h-[24px] rounded-[3px] bg-gradient-to-b from-[#7B61FF] to-[#9B8AFF]"></div>
        回复记录 ({{ replies.length }})
      </div>

      <div class="space-y-[16px]">
        <div
          v-for="reply in replies"
          :key="reply.id"
          class="bg-gradient-to-br from-[#f8fafc] to-[#f0f7ff] rounded-[20px] p-[20px]"
        >
          <div class="flex items-center gap-[12px] mb-[12px]">
            <t-avatar :image="reply.userAvatar" size="48px" class="shadow-sm">
              {{ reply.userName?.charAt(0) }}
            </t-avatar>
            <div class="flex-1">
              <div class="flex items-center gap-[8px]">
                <span class="text-[26px] text-[#333] font-medium">{{ reply.userName }}</span>
                <t-tag v-if="reply.isAdmin" theme="primary" size="small" class="!rounded-[8px] !text-[20px] !px-[10px]">
                  官方
                </t-tag>
              </div>
              <div class="text-[20px] text-[#94a3b8]">{{ formatDate(reply.createdAt) }}</div>
            </div>
          </div>
          <div class="text-[24px] text-[#475569] leading-[1.7] pl-[60px]">
            {{ reply.content }}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

---

## 11. 弹窗与交互

### 11.1 底部弹出弹窗

```vue
<t-popup v-model="showPopup" placement="bottom" round>
  <div class="bg-white rounded-t-[32px] p-[32px] pb-[48px]">
    <!-- 标题栏 -->
    <div class="flex items-center justify-between mb-[24px]">
      <div class="text-[32px] font-bold text-[#1e293b]">弹窗标题</div>
      <div
        class="w-[48px] h-[48px] bg-[#f5f7fa] rounded-full flex items-center justify-center cursor-pointer active:scale-95 transition-all hover:bg-[#e8ecf0]"
        @click="showPopup = false"
      >
        <CloseIcon class="text-[24px] text-[#666]" />
      </div>
    </div>

    <!-- 内容 -->

    <!-- 底部操作 -->
    <div class="flex gap-[12px] mt-[24px]">
      <t-button
        theme="default"
        size="large"
        class="flex-1 !h-[72px] !text-[26px] !rounded-[16px]"
        @click="showPopup = false"
      >
        取消
      </t-button>
      <t-button
        theme="primary"
        size="large"
        class="flex-1 !h-[72px] !text-[26px] !rounded-[16px] !bg-gradient-to-r !from-[#0052D9] !to-[#266FE8] shadow-lg shadow-[#0052D9]/20"
        @click="handleConfirm"
      >
        确认
      </t-button>
    </div>
  </div>
</t-popup>
```

### 11.2 ActionSheet 选择器

```vue
<t-action-sheet
  v-model="showSheet"
  :items="options"
  @selected="handleSelect"
/>

<!-- options 格式 -->
<script>
const options = [
  { label: '选项1', value: 'option1' },
  { label: '选项2', value: 'option2' },
  { label: '选项3', value: 'option3' }
]

const handleSelect = (index) => {
  selected.value = options[index].value
}
</script>
```

### 11.3 确认对话框

```vue
<t-dialog
  v-model="showDialog"
  title="确认操作"
  content="确定要执行此操作吗？此操作无法撤销。"
  confirm-btn="确定"
  cancel-btn="取消"
  @confirm="handleConfirm"
  @cancel="showDialog = false"
/>

<!-- 自定义按钮文字 -->
<t-dialog
  v-model="showDialog"
  :confirm-btn="{ content: '确定删除', theme: 'danger' }"
  :cancel-btn="{ content: '取消' }"
>
  <div class="p-[24px]">确定要删除这条数据吗？</div>
</t-dialog>
```

### 11.4 日期时间选择

```vue
<!-- 日期选择 -->
<t-date-picker
  v-model="selectedDate"
  :visible="showDatePicker"
  mode="date"
  @confirm="handleDateConfirm"
  @cancel="showDatePicker = false"
/>

<!-- 时间选择 -->
<t-time-picker
  v-model="selectedTime"
  :visible="showTimePicker"
  format="HH:mm"
  @confirm="handleTimeConfirm"
/>

<!-- 日期时间选择 -->
<t-date-time-picker
  v-model="selectedDateTime"
  :visible="showDateTimePicker"
  @confirm="handleDateTimeConfirm"
/>
```

### 11.5 图片预览

```vue
<t-image-viewer
  v-model:visible="showViewer"
  :images="imageList"
  :initial-index="currentIndex"
/>

<script>
const showViewer = ref(false)
const currentIndex = ref(0)
const imageList = ref(['url1', 'url2', 'url3'])

const previewImage = (images, index) => {
  imageList.value = images
  currentIndex.value = index
  showViewer.value = true
}
</script>
```

---

## 12. 登录页设计

### 12.1 登录页布局

```vue
<div class="login-page min-h-screen relative flex items-center justify-center overflow-hidden">
  <!-- 波浪背景 -->
  <div class="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#1a2a4a] to-[#0d1b2a]">
    <!-- 波浪动画 -->
    <div class="absolute bottom-0 left-0 w-full wave wave1"></div>
    <div class="absolute bottom-0 left-0 w-full wave wave2"></div>
    <div class="absolute bottom-0 left-0 w-full wave wave3"></div>
  </div>

  <!-- 鼠标跟随光晕 -->
  <div class="glow-effect absolute w-[400px] h-[400px] rounded-full pointer-events-none"></div>

  <!-- 登录卡片 -->
  <div class="login-card relative z-10 w-[600px] max-w-[90vw] bg-white/10 backdrop-blur-xl rounded-[28px] p-[36px] border border-white/10 shadow-2xl">
    <!-- Logo区域 -->
    <div class="text-center mb-[40px]">
      <div class="relative inline-block">
        <!-- Logo主体 -->
        <div class="w-[100px] h-[100px] mx-auto bg-gradient-to-br from-[#0052D9] to-[#266FE8] rounded-[28px] flex items-center justify-center shadow-xl shadow-[#0052D9]/50">
          <span class="text-[44px] font-bold text-white">H</span>
        </div>
        <!-- 旋转光环 -->
        <div class="absolute inset-[-10px] rounded-[38px] border-2 border-dashed border-white/20 logo-ring"></div>
        <div class="absolute inset-[-20px] rounded-[48px] border border-white/10 ring2"></div>
      </div>
    </div>

    <!-- 表单 -->
    <div class="space-y-[16px]">
      <!-- 用户名输入 -->
      <div class="input-wrapper flex items-center bg-white/8 rounded-[12px] px-[20px] py-[16px] border border-white/10 transition-all hover:border-[#0052D9]/40 focus-within:border-[#0052D9]">
        <UserIcon class="text-[24px] text-white/60 mr-[12px]" />
        <t-input
          v-model="form.username"
          placeholder="请输入用户名"
          :bordered="false"
          class="flex-1 text-white placeholder-white/40"
        />
      </div>

      <!-- 密码输入 -->
      <div class="input-wrapper flex items-center bg-white/8 rounded-[12px] px-[20px] py-[16px] border border-white/10 transition-all hover:border-[#0052D9]/40 focus-within:border-[#0052D9]">
        <LockOnIcon class="text-[24px] text-white/60 mr-[12px]" />
        <t-input
          v-model="form.password"
          type="password"
          placeholder="请输入密码"
          :bordered="false"
          class="flex-1 text-white placeholder-white/40"
        />
      </div>
    </div>

    <!-- 登录按钮 -->
    <div class="mt-[32px]">
      <t-button
        theme="primary"
        size="large"
        block
        :loading="loading"
        class="!h-[88px] !text-[30px] !rounded-[14px] !bg-gradient-to-r !from-[#0052D9] !to-[#266FE8] shadow-xl btn-blink"
        @click="handleLogin"
      >
        登录
      </t-button>
    </div>
  </div>
</div>
```

### 12.2 登录页动画

```css
/* 波浪动画 */
.wave {
  height: 200px;
  animation: wave 12s linear infinite;
}
.wave1 { background: linear-gradient(90deg, transparent 0%, rgba(0, 82, 217, 0.15) 50%, transparent 100%); }
.wave2 { animation-duration: 10s; opacity: 0.5; }
.wave3 { animation-duration: 14s; opacity: 0.3; }

@keyframes wave {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

/* 鼠标跟随光晕 */
.glow-effect {
  background: radial-gradient(circle, rgba(0, 82, 217, 0.2) 0%, transparent 70%);
  transform: translate(-50%, -50%);
  transition: left 0.1s, top 0.1s;
}

/* 按钮闪光效果 */
.btn-blink::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  animation: btn-blink 3s infinite;
}

@keyframes btn-blink {
  0% { left: -100%; }
  50%, 100% { left: 100%; }
}

/* Logo旋转光环 */
.logo-ring {
  animation: logo-spin 4s linear infinite;
}
.ring2 {
  animation: logo-spin 6s linear infinite reverse;
}

@keyframes logo-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

---

## 13. 动画规范

### 13.1 触摸反馈

```vue
<!-- 点击缩放反馈 -->
<div class="active:scale-[0.97] transition-all cursor-pointer">

<!-- 按下状态 -->
<div class="active:scale-95 transition-transform">

<!-- 悬停效果 (PC端) -->
<div class="hover:shadow-xl hover:scale-105 transition-all">
```

### 13.2 列表卡片入场动画

```vue
<style scoped>
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.list-card {
  animation: slideInUp 0.3s ease-out forwards;
}

/* 交错延迟 */
.list-card:nth-child(1) { animation-delay: 0ms; }
.list-card:nth-child(2) { animation-delay: 60ms; }
.list-card:nth-child(3) { animation-delay: 120ms; }
.list-card:nth-child(4) { animation-delay: 180ms; }
.list-card:nth-child(5) { animation-delay: 240ms; }
</style>
```

### 13.3 脉冲动画

```vue
<!-- 状态指示点脉冲 -->
<div class="w-[10px] h-[10px] rounded-full bg-white/80 animate-pulse"></div>

<style scoped>
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>
```

### 13.4 角标跳动动画

```vue
<div class="animate-bounce-subtle">
  <!-- 角标内容 -->
</div>

<style scoped>
.animate-bounce-subtle {
  animation: bounce-subtle 2s ease-in-out infinite;
}

@keyframes bounce-subtle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}
</style>
```

### 13.5 过渡动画

```vue
<!-- 淡入淡出 -->
<transition name="fade" mode="out-in">
  <div :key="currentIndex">内容</div>
</transition>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 滑动过渡 */
.slide-fade-enter-active {
  transition: all 0.3s ease;
}
.slide-fade-leave-active {
  transition: all 0.3s ease;
}
.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
```

### 13.6 动画性能原则

| 原则 | 说明 |
|------|------|
| 使用 transform/opacity | 只动画这两个属性，避免触发重排 |
| 避免布局抖动 | 动画不要导致 CLS (布局位移) |
| 控制动画时长 | 微交互 150-300ms，复杂过渡 ≤400ms |
| 提供减少动画选项 | 尊重 `prefers-reduced-motion` |

---

## 14. 夜间模式

### 14.1 模式切换

项目通过 `data-theme="dark"` 属性控制夜间模式，定义在 `src/style/index.less` 中。

### 14.2 夜间模式CSS变量

```less
[data-theme="dark"] {
  --bg-primary: #1a1a1a;
  --bg-secondary: #242424;
  --bg-tertiary: #2c2c2c;
  --text-primary: #e0e0e0;
  --text-secondary: #b0b0b0;
  --text-tertiary: #808080;
  --border-color: #3a3a3a;
  --shadow-color: rgba(0, 0, 0, 0.3);
}
```

### 14.3 夜间模式覆盖规则

```css
[data-theme="dark"] {
  /* 背景色 */
  .bg-white { background-color: var(--bg-primary) !important; }
  .bg-\[\#f5f7fa\] { background-color: var(--bg-secondary) !important; }

  /* 文字色 */
  .text-\[\#333\] { color: var(--text-primary) !important; }
  .text-\[\#666\] { color: var(--text-secondary) !important; }
  .text-\[\#999\] { color: var(--text-tertiary) !important; }

  /* 边框 */
  .border-\[\#eee\] { border-color: var(--border-color) !important; }

  /* 阴影 */
  .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3) !important; }

  /* 主题色 - 保持原始色但适当调亮 */
  .text-\[\#0052D9\]:not(.text-white) { color: #6ba3e8 !important; }
  .text-\[\#00A870\]:not(.text-white) { color: #4dd9a0 !important; }
}
```

### 14.4 组件夜间模式适配

```vue
<style scoped>
/* 首页卡片 */
[data-theme="dark"] .menu-card {
  background: var(--bg-primary);
  border-color: var(--border-color);
}

[data-theme="dark"] .todo-list,
[data-theme="dark"] .empty-card {
  background: var(--bg-primary);
  border-color: var(--border-color);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

[data-theme="dark"] .attendance-card {
  background: var(--bg-primary);
  border-color: var(--border-color);
}

[data-theme="dark"] .warning-card {
  background: linear-gradient(90deg, rgba(242, 123, 133, 0.15), rgba(242, 123, 133, 0.1));
  border-color: rgba(242, 123, 133, 0.2);
}

/* 背景渐变 */
[data-theme="dark"] .animated-bg {
  background: linear-gradient(135deg, #1f2937 0%, #16213e 50%, #0f172a 100%);
}
</style>
```

---

## 15. 图标规范

### 15.1 可用图标完整清单

**基础操作**
```
AddIcon, CloseIcon, CheckIcon, ClearIcon, SearchIcon
```

**导航方向**
```
ChevronRightIcon, ChevronLeftIcon, ChevronDownIcon
ArrowRightIcon, ArrowLeftIcon
```

**时间日期**
```
TimeIcon, TimeFilledIcon, CalendarIcon, ClockIcon
```

**用户相关**
```
UserIcon, UserTalkIcon, UserCircleIcon, AvatarIcon
```

**状态指示**
```
CheckCircleIcon, CheckCircleFilledIcon
ErrorCircleIcon, ErrorFilledIcon
InfoCircleIcon, WarningCircleIcon
```

**业务功能**
```
EditIcon, Edit1Icon, DeleteIcon, ShareIcon
StarIcon, StarFilledIcon
FolderIcon, FileIcon, MailIcon
```

**设备位置**
```
LocationIcon, MoneyIcon, SettingIcon
FilterIcon, FlagIcon, PoweroffIcon
LoginIcon, LogoutIcon
```

**通知提醒**
```
NotificationIcon, ChatIcon, MessageIcon
BellIcon
```

**智能功能**
```
LightbulbIcon, RobotIcon
```

### 15.2 图标使用示例

```vue
import { AddIcon, SearchIcon, ChevronRightIcon, CheckCircleIcon } from 'tdesign-icons-vue-next'

<!-- 图标在按钮中 -->
<t-button>
  <template #icon><AddIcon class="text-[24px]" /></template>
</t-button>

<!-- 图标在输入框前缀 -->
<t-input>
  <template #prefix-icon>
    <SearchIcon class="text-[24px] text-[#999]" />
  </template>
</t-input>

<!-- 图标独立使用 -->
<div class="w-[48px] h-[48px] bg-[#f5f7fa] rounded-full flex items-center justify-center">
  <ChevronRightIcon class="text-[24px] text-[#666]" />
</div>
```

### 15.3 图标大小规范

| 场景 | 大小 | 示例 |
|------|------|------|
| 按钮内图标 | 24px | `text-[24px]` |
| 输入框前缀 | 24-28px | `text-[28px]` |
| 卡片内图标 | 22-32px | `text-[22px]` |
| 大功能图标 | 40-64px | `text-[64px]` |
| Tabbar图标 | 32px | `text-[32px]` |

---

## 16. 组件规范

### 16.1 TDesign 按钮

```vue
<!-- 主要按钮 -->
<t-button
  theme="primary"
  size="large"
  block
  :loading="loading"
  :disabled="disabled"
  class="!h-[88px] !text-[28px] !rounded-[20px] !bg-gradient-to-r !from-[#0052D9] !to-[#266FE8] shadow-xl shadow-[#0052D9]/30"
>
  提交
</t-button>

<!-- 次要按钮 -->
<t-button
  theme="default"
  variant="outline"
  size="large"
  class="!h-[72px] !text-[26px] !rounded-[16px]"
>
  取消
</t-button>

<!-- 危险按钮 -->
<t-button
  theme="danger"
  variant="outline"
  class="!rounded-[16px]"
>
  删除
</t-button>

<!-- 文字按钮 -->
<t-button variant="text" class="text-[#666]">
  查看更多
</t-button>
```

### 16.2 TDesign 输入框

```vue
<!-- 标准输入框 -->
<t-input
  v-model="value"
  placeholder="请输入..."
  :maxlength="50"
  show-limit-number
  clearable
  class="!h-[80px] !text-[26px] !bg-[#f8fafc] !rounded-[16px] !border !border-[#e8ecf0]"
/>

<!-- 搜索框 -->
<t-input
  v-model="keyword"
  placeholder="搜索..."
  class="!h-[72px] !bg-[#f5f7fa] !rounded-[16px]"
>
  <template #prefix-icon>
    <SearchIcon class="text-[28px] text-[#999]" />
  </template>
</t-input>

<!-- 密码输入框 -->
<t-input
  v-model="password"
  type="password"
  placeholder="请输入密码"
  :bordered="false"
  class="flex-1"
/>

<!-- 文本域 -->
<t-textarea
  v-model="content"
  placeholder="请输入..."
  :maxlength="500"
  :autosize="{ minRows: 4, maxRows: 8 }"
  indicator
  class="!text-[26px] !bg-[#f8fafc] !rounded-[16px]"
/>
```

### 16.3 TDesign 弹出层

```vue
<!-- 底部弹出 -->
<t-popup v-model="show" placement="bottom" round>
  <div class="bg-white rounded-t-[32px] p-[32px]">内容</div>
</t-popup>

<!-- 居中弹窗 -->
<t-popup v-model="showCenter" placement="center">
  <div class="bg-white rounded-[24px] p-[32px] w-[600px]">内容</div>
</t-popup>

<!-- ActionSheet -->
<t-action-sheet v-model="showSheet" :items="items" @selected="onSelect" />

<!-- 对话框 -->
<t-dialog v-model="showDialog" title="标题" :confirm-btn="{}" :cancel-btn="{}">
  <div class="p-[24px]">内容</div>
</t-dialog>
```

### 16.4 TDesign 标签

```vue
<!-- 轻量标签 -->
<t-tag theme="primary" variant="light" size="medium">
  标签
</t-tag>

<!-- 填充标签 -->
<t-tag theme="success" size="medium">
  成功
</t-tag>

<!-- 轮廓标签 -->
<t-tag theme="warning" variant="outline" size="small">
  警告
</t-tag>
```

### 16.5 TDesign 头像

```vue
<!-- 图片头像 -->
<t-avatar :image="avatarUrl" size="48px" />

<!-- 文字头像 -->
<t-avatar size="48px">{{ name?.charAt(0) }}</t-avatar>

<!-- 头像组 -->
<div class="flex -space-x-2">
  <t-avatar v-for="user in users" :key="user.id" :image="user.avatar" size="36px" class="border-2 border-white">
    {{ user.name?.charAt(0) }}
  </t-avatar>
</div>
```

---

## 17. 模板代码

### 17.1 标准列表页模板

```vue
<template>
  <Root title="页面标题" back-url="/user">
    <div class="min-h-screen bg-[#f5f7fa] pb-[150px]">
      <!-- 顶部操作栏 -->
      <div class="bg-white sticky top-0 z-10 shadow-sm px-[24px] pt-[16px] pb-[12px]">
        <!-- 搜索框 -->
        <div class="flex gap-[12px] mb-[16px]">
          <t-input
            v-model="searchKeyword"
            placeholder="搜索..."
            class="flex-1 !h-[72px] !bg-[#f5f7fa] !rounded-[16px]"
            clearable
          >
            <template #prefix-icon>
              <SearchIcon class="text-[28px] text-[#999]" />
            </template>
          </t-input>
          <t-button theme="primary" class="!w-[88px] !h-[72px] !rounded-[16px]" @click="router.push('/create')">
            <template #icon><AddIcon class="text-[32px]" /></template>
          </t-button>
        </div>

        <!-- 筛选标签 -->
        <div class="flex gap-[12px] overflow-x-auto [scrollbar-width:none]">
          <div
            v-for="filter in filters"
            :key="filter.value"
            :class="[
              'flex-shrink-0 px-[20px] h-[52px] rounded-full text-[24px] font-medium transition-all cursor-pointer',
              activeFilter === filter.value
                ? 'bg-gradient-to-r from-[#0052D9] to-[#266FE8] text-white shadow-lg shadow-[#0052D9]/20'
                : 'bg-[#f5f7fa] text-[#666]'
            ]"
            @click="activeFilter = filter.value"
          >
            {{ filter.label }}
          </div>
        </div>
      </div>

      <!-- 内容列表 -->
      <div class="p-[24px] space-y-[16px]">
        <div
          v-for="(item, index) in filteredList"
          :key="item.id"
          class="bg-white rounded-[20px] shadow-sm overflow-hidden cursor-pointer active:scale-[0.99] transition-all hover:shadow-lg"
          :style="{ animationDelay: `${index * 60}ms` }"
          @click="goToDetail(item)"
        >
          <!-- 卡片内容 -->
        </div>

        <!-- 空状态 -->
        <div v-if="filteredList.length === 0" class="text-center py-[80px]">
          <div class="w-[120px] h-[120px] mx-auto bg-[#f5f7fa] rounded-full flex items-center justify-center mb-[24px]">
            <FileIcon class="text-[60px] text-[#999]" />
          </div>
          <div class="text-[28px] text-[#999]">暂无数据</div>
        </div>
      </div>
    </div>
  </Root>
</template>

<script setup>
import { SearchIcon, AddIcon, FileIcon } from 'tdesign-icons-vue-next'

const searchKeyword = ref('')
const activeFilter = ref('all')
const list = ref([])

const filters = [
  { label: '全部', value: 'all' },
  { label: '待处理', value: 'pending' },
  { label: '已完成', value: 'done' }
]

const filteredList = computed(() => {
  let result = list.value
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(item => item.title.toLowerCase().includes(keyword))
  }
  if (activeFilter.value !== 'all') {
    result = result.filter(item => item.status === activeFilter.value)
  }
  return result
})
</script>

<style scoped>
.bg-white.rounded-\[20px\] {
  animation: slideInUp 0.3s ease-out forwards;
}

@keyframes slideInUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
```

### 17.2 标准表单页模板

```vue
<template>
  <Root title="表单标题" back-url="/user">
    <div class="min-h-screen bg-[#f5f7fa] p-[24px] pb-[200px]">
      <!-- 表单卡片 -->
      <div class="bg-white rounded-[24px] shadow-lg shadow-slate-200/50 overflow-hidden">
        <div class="h-[8px] bg-gradient-to-r from-[#0052D9] via-[#7B61FF] to-[#00A870]"></div>

        <div class="p-[28px]">
          <div class="text-[30px] font-bold text-[#1e293b] mb-[24px] flex items-center gap-[12px]">
            <div class="w-[8px] h-[32px] rounded-[4px] bg-gradient-to-b from-[#0052D9] to-[#266FE8]"></div>
            基本信息
          </div>

          <t-form :data="formData" :rules="formRules" ref="formRef">
            <!-- 输入框 -->
            <div class="mb-[28px]">
              <div class="text-[26px] font-medium text-[#333] mb-[14px]">
                标题 <span class="text-[#E34D59]">*</span>
              </div>
              <t-input
                v-model="formData.title"
                placeholder="请输入"
                :maxlength="50"
                class="!h-[80px] !text-[26px] !bg-[#f8fafc] !rounded-[16px] !border !border-[#e8ecf0]"
              />
            </div>

            <!-- 选择器 -->
            <div class="mb-[28px]">
              <div class="text-[26px] font-medium text-[#333] mb-[14px]">类型</div>
              <div
                class="w-full h-[80px] bg-[#f8fafc] rounded-[16px] px-[20px] flex items-center justify-between cursor-pointer border border-[#e8ecf0]"
                @click="showPicker = true"
              >
                <span :class="['text-[26px]', formData.type ? 'text-[#333]' : 'text-[#999]']">
                  {{ formData.type || '请选择' }}
                </span>
                <ChevronDownIcon class="text-[24px] text-[#999]" />
              </div>
            </div>

            <!-- 文本域 -->
            <div class="mb-[32px]">
              <div class="text-[26px] font-medium text-[#333] mb-[14px]">描述</div>
              <t-textarea
                v-model="formData.description"
                placeholder="请输入"
                :maxlength="500"
                :autosize="{ minRows: 4, maxRows: 8 }"
                indicator
                class="!text-[26px] !bg-[#f8fafc] !rounded-[16px] !border !border-[#e8ecf0]"
              />
            </div>
          </t-form>
        </div>
      </div>

      <!-- 底部固定操作栏 -->
      <div class="fixed bottom-0 left-0 right-0 px-[32px] py-[24px] bg-white shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
        <t-button
          theme="primary"
          size="large"
          block
          :loading="submitting"
          :disabled="!isValid"
          class="!h-[88px] !text-[28px] !rounded-[20px] !bg-gradient-to-r !from-[#0052D9] !to-[#266FE8] shadow-xl"
          @click="handleSubmit"
        >
          提交
        </t-button>
      </div>

      <t-action-sheet v-model="showPicker" :items="typeOptions" @selected="handleTypeSelect" />
    </div>
  </Root>
</template>

<script setup>
import { ChevronDownIcon } from 'tdesign-icons-vue-next'

const formRef = ref(null)
const formData = ref({
  title: '',
  type: '',
  description: ''
})

const formRules = {
  title: [
    { required: true, message: '请输入标题' },
    { min: 2, max: 50, message: '标题长度为2-50个字符' }
  ]
}

const typeOptions = [
  { label: '类型一', value: 'type1' },
  { label: '类型二', value: 'type2' }
]

const handleTypeSelect = (index) => {
  formData.value.type = typeOptions[index]?.value || ''
}
</script>
```

---

## 18. 检查清单

### 18.1 布局检查

- [ ] 页面容器使用 `min-h-screen`
- [ ] 底部适配 `pb-[150px]` (Tabbar) 或 `pb-[200px]` (底部操作栏)
- [ ] 页面水平边距 `px-[24px]` 或 `px-[32px]`
- [ ] 卡片使用 `rounded-[20px]` 或 `rounded-[24px]`
- [ ] 组件使用 Sticky 定位时添加 `z-10`

### 18.2 颜色检查

- [ ] 使用项目的颜色变量而非硬编码
- [ ] 状态颜色遵循项目定义的状态色映射
- [ ] 渐变使用 `from-[#xxx] to-[#xxx]` 格式
- [ ] 文字颜色使用 `#333`/`#666`/`#999` 层级

### 18.3 圆角检查

- [ ] 页面主卡片：`rounded-[24px]`
- [ ] 列表卡片：`rounded-[20px]`
- [ ] 按钮：`rounded-[16px]`
- [ ] 输入框：`rounded-[12-16px]`
- [ ] 标签：`rounded-[8-12px]` 或 `rounded-full`

### 18.4 阴影检查

- [ ] 卡片阴影：`shadow-lg shadow-slate-200/50`
- [ ] 按钮/渐变元素阴影：`shadow-lg shadow-[#主题色]/20-30`
- [ ] 悬停效果：`hover:shadow-xl`
- [ ] 日间/夜间阴影适配

### 18.5 夜间模式检查

- [ ] 背景色使用 CSS 变量或工具类覆盖
- [ ] 文字色使用项目定义的暗色变量
- [ ] 边框色适配夜间模式
- [ ] 测试夜间模式下的显示效果

### 18.6 图标检查

- [ ] 只使用 tdesign-icons-vue-next 中的图标
- [ ] 图标大小遵循 20-32px 范围
- [ ] 图标颜色使用主题色或灰色

### 18.7 动画检查

- [ ] 使用 `transform` 和 `opacity` 制作动画
- [ ] 避免动画导致布局抖动 (CLS)
- [ ] 触摸反馈使用 `active:scale`
- [ ] 列表卡片入场动画使用 `slideInUp`

### 18.8 交互检查

- [ ] 可点击元素添加 `cursor-pointer`
- [ ] 可交互元素提供视觉反馈
- [ ] 禁用状态使用 `disabled` 属性
- [ ] 加载状态使用 `loading` 属性

---

## 附录 A：CSS 变量完整列表

```less
:root {
  /* 背景色 */
  --bg-primary: #ffffff;
  --bg-secondary: #f5f7fa;
  --bg-tertiary: #e8ecf0;

  /* 文字色 */
  --text-primary: #333333;
  --text-secondary: #666666;
  --text-tertiary: #999999;
  --border-color: #e5e5e5;
  --shadow-color: rgba(0, 0, 0, 0.08);

  /* 主题色 */
  --color-primary: #0052D9;
  --color-primary-light: #266FE8;
  --color-success: #00A870;
  --color-success-light: #2BA471;
  --color-warning: #ED7B2F;
  --color-warning-light: #F09143;
  --color-danger: #E34D59;
  --color-danger-light: #F06956;

  /* 间距 */
  --spacing-page: 32px;
  --spacing-section: 32px;
  --spacing-card: 24px;
  --spacing-item: 16px;
  --spacing-element: 12px;

  /* 圆角 */
  --radius-card: 24px;
  --radius-button: 16px;
  --radius-tag: 8px;

  /* 字体 */
  --font-title-lg: 36px;
  --font-title: 30px;
  --font-card-title: 28px;
  --font-text-lg: 26px;
  --font-text: 24px;
  --font-text-sm: 22px;
}
```

## 附录 B：常用样式速查表

| 元素 | 圆角 | 阴影 | 间距 |
|------|------|------|------|
| 页面主卡片 | 24px | shadow-lg | p-24 |
| 列表卡片 | 20px | shadow-sm | p-20 |
| 按钮 | 16px | shadow-lg | h-72~88 |
| 输入框 | 12-16px | - | h-72~80 |
| 标签 | 8px/full | - | px-12 py-4 |
| 头像 | 28px/full | shadow-xl | w-48~100 |

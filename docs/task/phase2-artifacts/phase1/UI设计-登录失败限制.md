# 极智协同 - 登录失败限制 UI 设计稿

## 文档信息

| 项目 | 内容 |
|------|------|
| 任务ID | 1.1.3 |
| 版本 | 1.0 |
| 创建日期 | 2026-04-30 |
| 负责人 | UI设计师 |
| 状态 | 待评审 |

---

## 一、设计规范

### 1.1 颜色系统

#### 品牌色

| 色值 | 名称 | 用途 | CSS变量 |
|------|------|------|---------|
| `#0052D9` | 品牌主色 | 主按钮、强调元素 | `--color-brand` |
| `#266FE8` | 品牌辅色 | 渐变终点、辅助强调 | `--color-brand-light` |
| `#6ba3e8` | 品牌浅色 | 图标、次要强调 | `--color-brand-hover` |

#### 功能色

| 色值 | 名称 | 用途 | CSS变量 |
|------|------|------|---------|
| `#E34D59` | 错误色 | 错误提示、危险操作 | `--color-error` |
| `#ED7B2F` | 警告色 | 警告提示、过期提醒 | `--color-warning` |
| `#00A870` | 成功色 | 成功提示、安全状态 | `--color-success` |
| `#0052D9` | 信息色 | 信息提示、帮助说明 | `--color-info` |

#### 中性色（深色主题）

| 色值 | 名称 | 用途 | CSS变量 |
|------|------|------|---------|
| `#0a1628` | 背景主色 | 页面背景起点 | `--bg-color-primary` |
| `#1a2a4a` | 背景辅色 | 页面背景中间 | `--bg-color-secondary` |
| `#0d1b2a` | 背景终点 | 页面背景终点 | `--bg-color-tertiary` |
| `rgba(255,255,255,0.1)` | 卡片背景 | 毛玻璃卡片 | `--bg-card` |
| `rgba(255,255,255,0.08)` | 输入框背景 | 输入区域 | `--bg-input` |
| `#FFFFFF` | 主要文字 | 标题、重要文字 | `--text-color-primary` |
| `rgba(255,255,255,0.6)` | 次要文字 | 描述、辅助信息 | `--text-color-secondary` |
| `rgba(255,255,255,0.4)` | 占位文字 | 输入框提示 | `--text-color-placeholder` |
| `rgba(255,255,255,0.35)` | 禁用文字 | 禁用状态文字 | `--text-color-disabled` |

#### 状态色

| 状态 | 背景色 | 边框色 | 文字色 |
|------|--------|--------|--------|
| 错误提示框 | `rgba(227, 77, 89, 0.15)` | `rgba(227, 77, 89, 0.3)` | `#E34D59` |
| 锁定提示框 | `rgba(227, 77, 89, 0.15)` | `rgba(227, 77, 89, 0.3)` | `#E34D59` |
| 输入错误 | `rgba(227, 77, 89, 0.1)` | `#E34D59` | - |
| 按钮禁用 | `rgba(255,255,255,0.08)` | `transparent` | `rgba(255,255,255,0.35)` |

### 1.2 字体规范

#### 字体家族

```css
/* 主字体 */
--font-family-primary: 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;

/* 数字字体（用于倒计时） */
--font-family-number: 'DIN Alternate', 'SF Pro Display', monospace;
```

#### 字号层级

| 元素 | 字号 | 行高 | 字重 | Tailwind类 |
|------|------|------|------|------------|
| 主标题 | 40px | 1.2 | 700 (bold) | `text-[40px] font-bold` |
| 副标题 | 20px | 1.4 | 400 (regular) | `text-[20px]` |
| Tab选项 | 28px | 1.4 | 500 (medium) | `text-[28px] font-medium` |
| 按钮文字 | 30px | 1.4 | 500 (medium) | `text-[30px] font-medium` |
| 输入框 | 16px | 1.5 | 400 (regular) | `text-[16px]` |
| 提示文字 | 14px | 1.5 | 400 (regular) | `text-[14px]` |
| 辅助文字 | 12px | 1.5 | 400 (regular) | `text-[12px]` |
| 倒计时数字 | 24px | 1.3 | 600 (semibold) | `text-[24px] font-semibold` |

### 1.3 间距规范

#### 基础间距（8px网格）

| Token | 数值 | 用途 |
|-------|------|------|
| `--space-xs` | 4px | 图标与文字间距 |
| `--space-sm` | 8px | 紧凑元素间距 |
| `--space-md` | 12px | 输入框内边距 |
| `--space-lg` | 16px | 列表项间距 |
| `--space-xl` | 20px | 卡片内边距 |
| `--space-2xl` | 24px | 模块间距 |
| `--space-3xl` | 32px | 区块间距 |
| `--space-4xl` | 36px | 卡片内边距 |
| `--space-5xl` | 48px | 大模块间距 |

#### 组件内间距

| 组件 | 内边距 | 说明 |
|------|--------|------|
| 登录卡片 | `padding: 36px` | 四周内边距 |
| 输入框区域 | `padding: 12px 20px` | 上下12px，左右20px |
| 提示框 | `padding: 14px 16px` | 上下14px，左右16px |
| 按钮 | `padding: 18px 24px` | 大尺寸按钮 |

### 1.4 圆角规范

| Token | 数值 | 用途 |
|-------|------|------|
| `--radius-sm` | 8px | 小标签、徽章 |
| `--radius-md` | 10px | 图标容器 |
| `--radius-lg` | 12px | 输入框、小按钮 |
| `--radius-xl` | 14px | 大按钮、Tab栏 |
| `--radius-2xl` | 28px | 卡片、Logo容器 |

### 1.5 阴影规范

| 类型 | 样式 | 用途 |
|------|------|------|
| 卡片阴影 | `0 25px 50px -12px rgba(0, 0, 0, 0.25)` | 登录卡片 |
| 按钮阴影 | `0 10px 15px -3px rgba(0, 82, 217, 0.4)` | 主按钮 |
| 输入聚焦 | `0 0 10px rgba(0, 82, 217, 0.15)` | 输入框聚焦 |

### 1.6 动效规范

| 动效 | 时长 | 缓动函数 | 用途 |
|------|------|----------|------|
| 快速过渡 | 150ms | `ease-out` | hover状态 |
| 常规过渡 | 300ms | `ease-in-out` | 展开/收起 |
| 慢速过渡 | 500ms | `ease-in-out` | 页面切换 |
| 提示消失 | 5000ms | - | Toast自动消失 |
| 倒计时更新 | 1000ms | - | 每秒更新 |

---

## 二、各状态 UI 设计

### 2.1 正常状态（初始状态）

#### 视觉描述

登录页面初始加载时，不显示任何警告或错误信息。用户可以正常输入用户名和密码。

#### 布局结构

```
+--------------------------------------------------------------+
|                    [动态渐变背景]                             |
|                 [粒子动画 Canvas]                            |
+--------------------------------------------------------------+
|                                                              |
|                      [Logo + 标题]                           |
|                                                              |
+--------------------------------------------------------------+
|                                                              |
|  +--------------------------------------------------------+  |
|  |                    [登录卡片]                          |  |
|  |  +--------------------------------------------------+  |  |
|  |  |  [用户端]     |     [管理员端]                    |  |  |
|  |  +--------------------------------------------------+  |  |
|  |                                                        |  |
|  |  +--------------------------------------------------+  |  |
|  |  | [用户图标]  请输入用户名                    [清除] |  |  |
|  |  +--------------------------------------------------+  |  |
|  |                                                        |  |
|  |  +--------------------------------------------------+  |  |
|  |  | [锁图标]    请输入密码                  [显示/隐藏]|  |  |
|  |  +--------------------------------------------------+  |  |
|  |                                                        |  |
|  |  +--------------------------------------------------+  |  |
|  |  |                    登 录                         |  |  |
|  |  +--------------------------------------------------+  |  |
|  |                                                        |  |
|  |               [测试账号提示信息]                       |  |
|  +--------------------------------------------------------+  |
|                                                              |
+--------------------------------------------------------------+
```

#### 样式规范

| 元素 | 样式 |
|------|------|
| 页面背景 | 深色渐变 `#0a1628 → #1a2a4a → #0d1b2a` |
| 登录卡片 | `bg-white/10 backdrop-blur-xl rounded-[28px] p-[36px]` |
| Tab栏 | `bg-white/10 rounded-[14px] p-[5px]` |
| 输入框容器 | `bg-white/8 rounded-[12px] border-white/10` |
| 登录按钮 | 渐变 `#0052D9 → #266FE8`，带扫光动画 |

---

### 2.2 登录失败提示状态（1-4次失败）

#### 视觉描述

当用户输入错误的用户名或密码时（第1-4次），在登录卡片顶部显示红色警告提示框，显示剩余尝试次数。密码输入框边框变为错误色。

#### 布局结构

```
+--------------------------------------------------------------+
|                      [Logo + 标题]                           |
+--------------------------------------------------------------+
|                                                              |
|  +--------------------------------------------------------+  |
|  |  +--------------------------------------------------+  |  |
|  |  | [!] 用户名或密码错误，还剩 3 次尝试机会           |  |  |
|  |  +--------------------------------------------------+  |  |
|  |                                                        |  |
|  |  +--------------------------------------------------+  |  |
|  |  | [用户图标]  zhangsan                        [清除] |  |  |
|  |  +--------------------------------------------------+  |  |
|  |                                                        |  |
|  |  +--------------------------------------------------+  |  |
|  |  | [锁图标]    ••••••••                  [显示/隐藏] |  |  |
|  |  +--------------------------------------------------+  |  |
|  |                    ^^^^^ 红色边框                       |  |
|  |                                                        |  |
|  |  +--------------------------------------------------+  |  |
|  |  |                    登 录                         |  |  |
|  |  +--------------------------------------------------+  |  |
|  |                                                        |  |
|  |               [测试账号提示信息]                       |  |
|  +--------------------------------------------------------+  |
|                                                              |
+--------------------------------------------------------------+
```

#### 警告提示框样式

```css
/* 警告提示框容器 */
.alert-error {
  background: rgba(227, 77, 89, 0.15);
  border: 1px solid rgba(227, 77, 89, 0.3);
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  animation: alert-shake 0.4s ease-in-out;
}

/* 警告图标 */
.alert-error__icon {
  width: 20px;
  height: 20px;
  color: #E34D59;
  flex-shrink: 0;
}

/* 警告文字 */
.alert-error__text {
  font-size: 14px;
  line-height: 1.5;
  color: #E34D59;
}

/* 抖动动画 */
@keyframes alert-shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-8px); }
  40% { transform: translateX(8px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(4px); }
}
```

#### 输入框错误状态样式

```css
/* 密码输入框错误状态 */
.input-wrapper--error {
  border-color: #E34D59 !important;
  background: rgba(227, 77, 89, 0.1) !important;
  animation: input-error-pulse 0.3s ease-in-out;
}

@keyframes input-error-pulse {
  0% { box-shadow: 0 0 0 0 rgba(227, 77, 89, 0.4); }
  100% { box-shadow: 0 0 0 4px rgba(227, 77, 89, 0); }
}
```

#### 文案规范

| 失败次数 | 提示文案 |
|----------|----------|
| 第1次 | "用户名或密码错误，还剩 4 次尝试机会" |
| 第2次 | "用户名或密码错误，还剩 3 次尝试机会" |
| 第3次 | "用户名或密码错误，还剩 2 次尝试机会" |
| 第4次 | "用户名或密码错误，还剩 1 次尝试机会" |

---

### 2.3 账户锁定状态（第5次失败触发锁定）

#### 视觉描述

当用户连续第5次登录失败后，账户被锁定15分钟。显示锁定提示框，登录按钮变为禁用状态，下方显示倒计时，增加"联系管理员解锁"入口。

#### 布局结构

```
+--------------------------------------------------------------+
|                      [Logo + 标题]                           |
+--------------------------------------------------------------+
|                                                              |
|  +--------------------------------------------------------+  |
|  |  +--------------------------------------------------+  |  |
|  |  | [锁] 账户已锁定，请 15 分钟后重试                 |  |  |
|  |  +--------------------------------------------------+  |  |
|  |                                                        |  |
|  |  +--------------------------------------------------+  |  |
|  |  | [用户图标]  zhangsan                        [清除] |  |  |
|  |  +--------------------------------------------------+  |  |
|  |                                                        |  |
|  |  +--------------------------------------------------+  |  |
|  |  | [锁图标]    ••••••••                  [显示/隐藏] |  |  |
|  |  +--------------------------------------------------+  |  |
|  |                                                        |  |
|  |  +--------------------------------------------------+  |  |
|  |  |              登录（禁用状态）                     |  |  |
|  |  +--------------------------------------------------+  |  |
|  |                                                        |  |
|  |  +--------------------------------------------------+  |  |
|  |  |              倒计时: 14:58                        |  |  |
|  |  +--------------------------------------------------+  |  |
|  |                                                        |  |
|  |        忘记密码？  |  联系管理员解锁                  |  |
|  +--------------------------------------------------------+  |
|                                                              |
+--------------------------------------------------------------+
```

#### 锁定提示框样式

```css
/* 锁定提示框容器 */
.alert-locked {
  background: rgba(227, 77, 89, 0.15);
  border: 1px solid rgba(227, 77, 89, 0.3);
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  animation: alert-locked-appear 0.3s ease-out;
}

/* 锁定图标 */
.alert-locked__icon {
  width: 20px;
  height: 20px;
  color: #E34D59;
  flex-shrink: 0;
}

/* 锁定文字 */
.alert-locked__text {
  font-size: 14px;
  line-height: 1.5;
  color: #E34D59;
  font-weight: 500;
}

/* 入场动画 */
@keyframes alert-locked-appear {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

#### 禁用按钮样式

```css
/* 登录按钮禁用状态 */
.login-btn--disabled {
  background: rgba(255, 255, 255, 0.08) !important;
  color: rgba(255, 255, 255, 0.35) !important;
  cursor: not-allowed;
  box-shadow: none;
}

/* 移除扫光动画 */
.login-btn--disabled::before {
  display: none;
}
```

#### 倒计时组件样式

```css
/* 倒计时容器 */
.countdown-container {
  background: rgba(227, 77, 89, 0.1);
  border: 1px solid rgba(227, 77, 89, 0.2);
  border-radius: 12px;
  padding: 12px 16px;
  margin-top: 16px;
  text-align: center;
}

/* 倒计时标签 */
.countdown-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 4px;
}

/* 倒计时数字 */
.countdown-timer {
  font-family: 'DIN Alternate', monospace;
  font-size: 24px;
  font-weight: 600;
  color: #E34D59;
  letter-spacing: 2px;
}

/* 倒计时呼吸动画 */
.countdown-timer--active {
  animation: countdown-pulse 1s ease-in-out infinite;
}

@keyframes countdown-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
```

#### 辅助链接样式

```css
/* 辅助链接容器 */
.login-links {
  margin-top: 16px;
  text-align: center;
  font-size: 14px;
}

/* 链接文字 */
.login-links__item {
  color: rgba(255, 255, 255, 0.5);
  text-decoration: none;
  transition: color 0.2s ease;
}

.login-links__item:hover {
  color: #6ba3e8;
}

/* 分隔符 */
.login-links__divider {
  display: inline-block;
  width: 1px;
  height: 12px;
  background: rgba(255, 255, 255, 0.2);
  margin: 0 16px;
  vertical-align: middle;
}
```

---

### 2.4 锁定期间尝试登录状态

#### 视觉描述

在账户锁定期间，如果用户再次尝试登录，提示框显示动态的剩余锁定时间。登录按钮保持可用状态，允许用户在解锁后立即尝试。

#### 布局结构

```
+--------------------------------------------------------------+
|                      [Logo + 标题]                           |
+--------------------------------------------------------------+
|                                                              |
|  +--------------------------------------------------------+  |
|  |  +--------------------------------------------------+  |  |
|  |  | [锁] 账户已锁定，请 12 分钟后重试                 |  |  |
|  |  +--------------------------------------------------+  |  |
|  |                                                        |  |
|  |  +--------------------------------------------------+  |  |
|  |  | [用户图标]  zhangsan                        [清除] |  |  |
|  |  +--------------------------------------------------+  |  |
|  |                                                        |  |
|  |  +--------------------------------------------------+  |  |
|  |  | [锁图标]    ••••••••                  [显示/隐藏] |  |  |
|  |  +--------------------------------------------------+  |  |
|  |                                                        |  |
|  |  +--------------------------------------------------+  |  |
|  |  |                    登 录                         |  |  |
|  |  +--------------------------------------------------+  |  |
|  |                                                        |  |
|  |  +--------------------------------------------------+  |  |
|  |  |  [i] 提示：解锁后可立即尝试登录                   |  |  |
|  |  +--------------------------------------------------+  |  |
|  |                                                        |  |
|  |        忘记密码？  |  联系管理员解锁                  |  |
|  +--------------------------------------------------------+  |
|                                                              |
+--------------------------------------------------------------+
```

#### 动态时间提示样式

```css
/* 动态提示框 */
.alert-locked--dynamic {
  /* 与静态锁定提示相同，但时间文字需要动态更新 */
}

/* 动态时间文字 */
.alert-locked__time {
  font-weight: 600;
  color: #E34D59;
}
```

#### 解锁提示样式

```css
/* 解锁提示容器 */
.unlock-hint {
  background: rgba(0, 82, 217, 0.1);
  border: 1px solid rgba(0, 82, 217, 0.2);
  border-radius: 10px;
  padding: 10px 14px;
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 解锁提示图标 */
.unlock-hint__icon {
  width: 16px;
  height: 16px;
  color: #6ba3e8;
}

/* 解锁提示文字 */
.unlock-hint__text {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
}
```

---

### 2.5 解锁成功状态

#### 视觉描述

锁定时间到期后，页面自动恢复正常登录状态，失败计数器重置，用户可以正常登录。

#### 视觉表现

1. 锁定提示框自动消失（淡出动画，300ms）
2. 倒计时组件消失
3. 登录按钮恢复可点击状态
4. 可选：显示轻量级提示"账户已解锁，请重新登录"（3秒后自动消失）

#### 解锁成功提示样式

```css
/* 解锁成功 Toast */
.toast-unlocked {
  background: rgba(0, 168, 112, 0.15);
  border: 1px solid rgba(0, 168, 112, 0.3);
  border-radius: 12px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  animation: toast-slide-in 0.3s ease-out;
}

.toast-unlocked__icon {
  width: 18px;
  height: 18px;
  color: #00A870;
}

.toast-unlocked__text {
  font-size: 14px;
  color: #00A870;
}

@keyframes toast-slide-in {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

## 三、组件设计说明

### 3.1 Alert 警告提示组件

#### 组件定义

```vue
<!-- Alert.vue -->
<template>
  <div
    :class="[
      'alert',
      `alert--${type}`,
      { 'alert--closable': closable }
    ]"
    v-if="visible"
  >
    <component :is="iconComponent" class="alert__icon" />
    <span class="alert__text">
      <slot>{{ message }}</slot>
    </span>
    <CloseIcon
      v-if="closable"
      class="alert__close"
      @click="handleClose"
    />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import {
  CloseIcon,
  ErrorCircleIcon,
  InfoCircleIcon,
  LockOnIcon
} from 'tdesign-icons-vue-next'

const props = defineProps({
  type: {
    type: String,
    default: 'error',
    validator: (v) => ['error', 'warning', 'info', 'success'].includes(v)
  },
  message: String,
  closable: {
    type: Boolean,
    default: false
  },
  duration: {
    type: Number,
    default: 0 // 0 表示不自动关闭
  }
})

const emit = defineEmits(['close'])

const visible = ref(true)

const iconComponent = computed(() => {
  const icons = {
    error: ErrorCircleIcon,
    warning: ErrorCircleIcon,
    info: InfoCircleIcon,
    success: ErrorCircleIcon,
    locked: LockOnIcon
  }
  return icons[props.type] || ErrorCircleIcon
})

const handleClose = () => {
  visible.value = false
  emit('close')
}

// 自动关闭
onMounted(() => {
  if (props.duration > 0) {
    setTimeout(() => {
      handleClose()
    }, props.duration)
  }
})
</script>
```

#### 样式定义

```css
.alert {
  border-radius: 12px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  animation: alert-appear 0.3s ease-out;
}

.alert--error {
  background: rgba(227, 77, 89, 0.15);
  border: 1px solid rgba(227, 77, 89, 0.3);
}

.alert--warning {
  background: rgba(237, 123, 47, 0.15);
  border: 1px solid rgba(237, 123, 47, 0.3);
}

.alert--info {
  background: rgba(0, 82, 217, 0.15);
  border: 1px solid rgba(0, 82, 217, 0.3);
}

.alert--success {
  background: rgba(0, 168, 112, 0.15);
  border: 1px solid rgba(0, 168, 112, 0.3);
}

.alert__icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.alert--error .alert__icon { color: #E34D59; }
.alert--warning .alert__icon { color: #ED7B2F; }
.alert--info .alert__icon { color: #0052D9; }
.alert--success .alert__icon { color: #00A870; }

.alert__text {
  font-size: 14px;
  line-height: 1.5;
  flex: 1;
}

.alert--error .alert__text { color: #E34D59; }
.alert--warning .alert__text { color: #ED7B2F; }
.alert--info .alert__text { color: #6ba3e8; }
.alert--success .alert__text { color: #00A870; }

.alert__close {
  width: 16px;
  height: 16px;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.alert__close:hover {
  opacity: 1;
}

@keyframes alert-appear {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

#### Props API

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| type | `error` \| `warning` \| `info` \| `success` | `error` | 提示类型 |
| message | `string` | - | 提示文案 |
| closable | `boolean` | `false` | 是否可关闭 |
| duration | `number` | `0` | 自动关闭时间(ms)，0为不自动关闭 |

---

### 3.2 CountdownTimer 倒计时组件

#### 组件定义

```vue
<!-- CountdownTimer.vue -->
<template>
  <div class="countdown">
    <span class="countdown__label">{{ label }}</span>
    <span :class="['countdown__timer', { 'countdown__timer--active': active }]">
      {{ formattedTime }}
    </span>
  </div>
</template>

<script setup>
import { computed, onUnmounted, ref, watch } from 'vue'

const props = defineProps({
  targetTime: {
    type: Date,
    required: true
  },
  label: {
    type: String,
    default: '倒计时: '
  },
  format: {
    type: String,
    default: 'mm:ss', // 'mm:ss' | 'minutes' | 'seconds'
    validator: (v) => ['mm:ss', 'minutes', 'seconds'].includes(v)
  }
})

const emit = defineEmits(['end'])

const remainingMs = ref(0)
const active = ref(true)
let timer = null

// 格式化时间显示
const formattedTime = computed(() => {
  const minutes = Math.floor(remainingMs.value / 60000)
  const seconds = Math.floor((remainingMs.value % 60000) / 1000)

  switch (props.format) {
    case 'minutes':
      return `${minutes} 分钟`
    case 'seconds':
      return `${remainingMs.value / 1000} 秒`
    default:
      return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }
})

// 更新倒计时
const updateCountdown = () => {
  remainingMs.value = Math.max(0, props.targetTime.getTime() - Date.now())

  if (remainingMs.value <= 0) {
    active.value = false
    clearInterval(timer)
    emit('end')
  }
}

// 启动倒计时
const startCountdown = () => {
  updateCountdown()
  timer = setInterval(updateCountdown, 1000)
}

watch(() => props.targetTime, () => {
  if (timer) clearInterval(timer)
  active.value = true
  startCountdown()
}, { immediate: true })

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>
```

#### 样式定义

```css
.countdown {
  background: rgba(227, 77, 89, 0.1);
  border: 1px solid rgba(227, 77, 89, 0.2);
  border-radius: 12px;
  padding: 12px 16px;
  text-align: center;
}

.countdown__label {
  display: block;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 4px;
}

.countdown__timer {
  font-family: 'DIN Alternate', 'SF Pro Display', monospace;
  font-size: 24px;
  font-weight: 600;
  color: #E34D59;
  letter-spacing: 2px;
}

.countdown__timer--active {
  animation: countdown-pulse 1s ease-in-out infinite;
}

@keyframes countdown-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
```

#### Props API

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| targetTime | `Date` | 必填 | 目标解锁时间 |
| label | `string` | `'倒计时: '` | 标签文案 |
| format | `'mm:ss'` \| `'minutes'` \| `'seconds'` | `'mm:ss'` | 时间格式 |

#### Events

| 事件 | 参数 | 说明 |
|------|------|------|
| end | - | 倒计时结束时触发 |

---

### 3.3 LoginAttemptsIndicator 剩余次数指示器

#### 组件定义

```vue
<!-- LoginAttemptsIndicator.vue -->
<template>
  <div v-if="show" class="attempts-indicator">
    <div class="attempts-indicator__dots">
      <span
        v-for="i in maxAttempts"
        :key="i"
        :class="[
          'attempts-indicator__dot',
          { 'attempts-indicator__dot--used': i <= usedAttempts }
        ]"
      />
    </div>
    <span class="attempts-indicator__text">
      剩余 {{ remainAttempts }} 次尝试机会
    </span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  maxAttempts: {
    type: Number,
    default: 5
  },
  usedAttempts: {
    type: Number,
    default: 0
  },
  show: {
    type: Boolean,
    default: true
  }
})

const remainAttempts = computed(() => {
  return Math.max(0, props.maxAttempts - props.usedAttempts)
})
</script>
```

#### 样式定义

```css
.attempts-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 8px;
}

.attempts-indicator__dots {
  display: flex;
  gap: 4px;
}

.attempts-indicator__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.attempts-indicator__dot--used {
  background: #E34D59;
}

.attempts-indicator__text {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
}
```

---

## 四、交互流程说明

### 4.1 状态流转图

```
                    +-------------------+
                    |    初始状态       |
                    +---------+---------+
                              |
                              v
                    +---------+---------+
                    |  用户输入凭据     |
                    +---------+---------+
                              |
                              v
              +---------------+---------------+
              |                               |
              v                               v
    +---------+---------+          +---------+---------+
    |    登录成功       |          |    登录失败       |
    +---------+---------+          +---------+---------+
              |                               |
              v                               v
    +---------+---------+          +---------+---------+
    |    跳转首页       |          |  判断失败次数     |
    +-------------------+          +---------+---------+
                                            |
                          +-----------------+-----------------+
                          |                 |                 |
                          v                 v                 v
                  +-------+-------+ +-------+-------+ +-------+-------+
                  |   次数 < 5    | |   次数 = 5    | |  账户已锁定   |
                  +-------+-------+ +-------+-------+ +-------+-------+
                          |                 |                 |
                          v                 v                 v
                  +-------+-------+ +-------+-------+ +-------+-------+
                  | 显示剩余次数   | |   锁定账户   | | 显示剩余时间   |
                  +---------------+ +-------+-------+ +---------------+
                                            |
                                            v
                                    +-------+-------+
                                    | 显示倒计时    |
                                    +-------+-------+
                                            |
                                            v
                                    +-------+-------+
                                    | 15分钟后解锁  |
                                    +---------------+
```

### 4.2 键盘交互

| 按键 | 功能 |
|------|------|
| `Enter` | 在输入框焦点时提交登录 |
| `Tab` | 切换输入焦点 |
| `Escape` | 关闭提示框（如果可关闭） |

### 4.3 触摸交互

| 手势 | 功能 |
|------|------|
| 点击输入框 | 激活输入，弹出键盘 |
| 点击眼睛图标 | 切换密码显示/隐藏 |
| 点击清除图标 | 清空输入内容 |
| 点击登录按钮 | 提交登录请求 |

---

## 五、响应式适配

### 5.1 设计稿基准

- **设计基准**: 375px (iPhone SE / iPhone 13 mini)
- **最大宽度**: 580px
- **适配范围**: 320px - 580px

### 5.2 断点适配

| 断点 | 宽度范围 | 适配策略 |
|------|----------|----------|
| 小屏 | 320px - 374px | 字号缩小10%，间距缩小20% |
| 标准 | 375px - 413px | 基准设计 |
| 大屏 | 414px - 580px | 保持基准，卡片宽度最大580px |
| 超大屏 | > 580px | 卡片居中，最大宽度580px |

### 5.3 字号缩放规则

```css
/* 小屏适配 */
@media (max-width: 374px) {
  .login-card h1 { font-size: 36px; }
  .login-card .text-20px { font-size: 18px; }
  .login-card .text-28px { font-size: 25px; }
  .countdown-timer { font-size: 20px; }
}

/* 大屏适配 */
@media (min-width: 414px) {
  .login-card { max-width: 580px; }
}
```

---

## 六、无障碍设计

### 6.1 ARIA 属性

| 元素 | ARIA属性 | 说明 |
|------|----------|------|
| 错误提示框 | `role="alert"` `aria-live="assertive"` | 立即朗读给用户 |
| 锁定提示框 | `role="alert"` `aria-live="assertive"` | 立即朗读给用户 |
| 倒计时 | `aria-live="polite"` `aria-atomic="true"` | 更新时通知用户 |
| 禁用按钮 | `aria-disabled="true"` | 标记禁用状态 |
| 输入框错误 | `aria-invalid="true"` `aria-describedby` | 标记错误状态并关联错误信息 |

### 6.2 语义化 HTML

```html
<!-- 错误提示 -->
<div role="alert" aria-live="assertive" class="alert alert--error">
  <span class="alert__text">用户名或密码错误，还剩 3 次尝试机会</span>
</div>

<!-- 锁定提示 -->
<div role="alert" aria-live="assertive" class="alert alert--locked">
  <span class="alert__text">账户已锁定，请 15 分钟后重试</span>
</div>

<!-- 倒计时 -->
<div aria-live="polite" aria-atomic="true" class="countdown">
  <span class="countdown__timer">14:58</span>
</div>

<!-- 禁用按钮 -->
<button aria-disabled="true" disabled class="login-btn login-btn--disabled">
  登录
</button>

<!-- 错误输入框 -->
<input
  aria-invalid="true"
  aria-describedby="password-error"
  class="input--error"
/>
<div id="password-error" role="alert">密码错误</div>
```

### 6.3 焦点管理

1. 页面加载时，焦点自动定位到用户名输入框
2. 错误提示出现时，焦点不移动（允许用户继续修改）
3. 账户锁定时，焦点移动到提示框或倒计时区域
4. 解锁成功时，焦点自动回到用户名输入框

---

## 七、动效规范

### 7.1 入场动效

| 元素 | 动效 | 时长 | 缓动 |
|------|------|------|------|
| 提示框 | 从上淡入 | 300ms | `ease-out` |
| 锁定提示 | 从上淡入 + 微移 | 300ms | `ease-out` |

### 7.2 退出动效

| 元素 | 动效 | 时长 | 缓动 |
|------|------|------|------|
| 提示框 | 淡出 | 200ms | `ease-in` |
| Toast | 向上淡出 | 300ms | `ease-in` |

### 7.3 状态转换动效

| 状态变化 | 动效 | 时长 |
|----------|------|------|
| 输入错误 | 边框颜色 + 抖动 | 300ms |
| 按钮禁用 | 颜色渐变 | 150ms |
| 倒计时更新 | 数字跳动 | 100ms |

### 7.4 减少动效偏好

```css
/* 尊重用户的减少动效偏好 */
@media (prefers-reduced-motion: reduce) {
  .alert,
  .countdown-timer,
  .login-btn {
    animation: none !important;
    transition: none !important;
  }
}
```

---

## 八、异常场景处理

### 8.1 网络异常

| 场景 | UI 处理 |
|------|---------|
| 登录请求超时 | 显示"网络异常，请检查网络连接后重试"，保留用户输入 |
| 网络断开 | 显示"网络连接已断开，请检查网络" |

### 8.2 服务端异常

| 场景 | UI 处理 |
|------|---------|
| 服务端返回500 | 显示"系统繁忙，请稍后重试" |
| 服务端返回401 | 显示"用户名或密码错误" |
| 服务端返回403 | 根据具体错误显示锁定或禁用提示 |

### 8.3 边界情况

| 场景 | UI 处理 |
|------|---------|
| 倒计时结束时用户正在操作 | 显示解锁成功提示，允许继续操作 |
| 页面刷新后 | 重新从服务端获取锁定状态，恢复相应UI |
| 多设备同时登录失败 | 提示信息一致，锁定状态共享 |

---

## 九、设计交付清单

### 9.1 设计资源

| 资源 | 格式 | 说明 |
|------|------|------|
| 设计稿 | Figma/Sketch | 完整页面设计 |
| 图标资源 | SVG | 所有图标矢量资源 |
| 切图资源 | PNG @2x/@3x | 适配不同屏幕密度 |

### 9.2 组件清单

| 组件名 | 用途 | 优先级 |
|--------|------|--------|
| Alert | 警告提示 | P0 |
| CountdownTimer | 倒计时显示 | P0 |
| LoginAttemptsIndicator | 剩余次数指示 | P1 |
| UnlockHint | 解锁提示 | P1 |

### 9.3 开发注意事项

1. **状态管理**: 使用 Pinia 管理登录状态和锁定信息
2. **接口对接**: 对接安全需求文档中定义的接口响应格式
3. **本地缓存**: 可考虑将锁定结束时间缓存到本地，优化用户体验
4. **错误边界**: 捕获所有异常，保证页面不崩溃

---

## 文档版本历史

| 版本 | 日期 | 修改人 | 修改内容 |
|------|------|--------|----------|
| 1.0 | 2026-04-30 | UI设计师 | 初版创建 |

---

## 附录：相关文档

- 安全需求文档: `docs/task/phase2-artifacts/phase1/安全需求文档.md`
- 安全原型图: `docs/task/phase2-artifacts/phase1/安全原型图.md`
- TDesign Mobile Vue 文档: https://tdesign.tencent.com/mobile-vue/overview

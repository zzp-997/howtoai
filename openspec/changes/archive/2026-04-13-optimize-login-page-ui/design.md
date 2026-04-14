# 设计文档：登录页 UI/特效/排版优化

## 变更名称
`optimize-login-page-ui`

## 技术方案

### 一、特效优化

#### 1.1 移除卡片入场动画

**当前实现**：
```css
.login-card {
  animation: card-appear 0.6s ease-out;
}

@keyframes card-appear {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
```

**优化方案**：删除上述 CSS，卡片加载即呈现最终状态。

#### 1.2 移除标题逐字动画

**当前实现**：
```vue
<h1>
  <span class="title-char" v-for="(char, i) in '极智协同'" :key="i"
        :style="{ animationDelay: i * 0.1 + 's' }">{{ char }}</span>
</h1>
```

**优化方案**：
```vue
<h1>极智协同</h1>
```

删除 `.title-char` 相关 CSS。

#### 1.3 精简波浪动画

**当前实现**：3个 `.wave` div，各 200% 宽度，不同高度。

**优化方案**：只保留 1 层波浪：
```vue
<div class="waves absolute bottom-0 left-0 right-0 h-[60px]">
  <div class="wave"></div>
</div>
```

```css
.wave {
  position: absolute;
  bottom: 0;
  width: 200%;
  height: 60px;
  background: linear-gradient(90deg,
    transparent 0%, rgba(0, 82, 217, 0.25) 50%, transparent 100%);
  animation: wave-move 12s linear infinite;
}

@keyframes wave-move {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
```

删除 `.wave2`、`.wave3` 及相关 CSS。

#### 1.4 Canvas 粒子实现

**当前实现**：30个 DOM 元素 + CSS 动画。

**优化方案**：使用 Canvas 绑定：

```vue
<canvas ref="particleCanvas" class="absolute inset-0 pointer-events-none"></canvas>
```

```javascript
// 粒子数据
const particles = ref([])
const particleCanvas = ref(null)
let animationId = null

// 初始化粒子
const initParticles = () => {
  const canvas = particleCanvas.value
  if (!canvas) return

  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  // 生成 20 个粒子
  particles.value = Array.from({ length: 20 }, (_, i) => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 6 + 2,
    speedY: Math.random() * 0.5 + 0.3,
    opacity: Math.random() * 0.5 + 0.3
  }))

  animateParticles()
}

// 动画循环
const animateParticles = () => {
  const canvas = particleCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  particles.value.forEach(p => {
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(0, 82, 217, ${p.opacity})`
    ctx.fill()

    // 上升动画
    p.y -= p.speedY
    if (p.y < -p.size) {
      p.y = canvas.height + p.size
      p.x = Math.random() * canvas.width
    }
  })

  animationId = requestAnimationFrame(animateParticles)
}

// 清理
onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
})

onMounted(() => {
  initParticles()
  // 窗口 resize 时重新初始化
  window.addEventListener('resize', initParticles)
})
```

删除原有 `particles` v-for 渲染和 `.particle` CSS。

---

### 二、布局优化

#### 2.1 间距调整

修改副标题与卡片之间的间距：

```vue
<!-- Logo 区域 -->
<div class="text-center mb-[36px]">
  ...
</div>

<!-- 登录卡片 -->
<!-- 将 mt-[36px] 相关调整，改为更大的间距 -->
```

具体修改：
- Logo 区域 `mb-[36px]` 保持不变
- 副标题与卡片的间距从隐含的间距调整为明确的 48px

---

### 三、字体层级优化

#### 3.1 字号调整

| 元素 | 当前 | 优化后 | Tailwind 类 |
|------|------|--------|-------------|
| 主标题 | 38px | 40px | `text-[40px]` |
| 副标题 | 22px | 20px | `text-[20px]` |
| Tab 选项 | 26px | 28px | `text-[28px]` |
| 输入框 placeholder | 14px | 16px | 覆盖 TDesign 样式 |
| 测试账号标题 | 14px | 14px | 保持 `text-[14px]` |
| 测试账号内容 | 18px | 14px | `text-[14px]` |

---

### 四、代码清理

需要删除的代码：
- `generateParticles()` 函数（改为 Canvas 实现）
- `particles` v-for 渲染
- `.particle` CSS 动画样式
- `.wave2`、`.wave3` DOM 和 CSS
- `.title-char` CSS 动画样式
- `.login-card` 的 `animation` 属性
- 卡片入场 `@keyframes card-appear`

---

## 测试策略

### 测试项

| 测试项 | 方法 |
|--------|------|
| 粒子动画正常 | 视觉检查，Canvas 绘制正确 |
| 波浪动画正常 | 视觉检查，单层波浪流畅 |
| 旋转环正常 | 视觉检查，3层旋转 |
| 按钮闪光正常 | 视觉检查，扫光效果 |
| 输入框交互正常 | 点击测试，hover/focus 效果 |
| 登录功能正常 | 输入账号密码，点击登录 |
| 真机流畅度 | 在真机上测试，观察是否有卡顿 |
| 日夜模式 | 切换主题，检查效果 |

---

## 变更文件清单

| 文件 | 变更类型 |
|------|----------|
| `src/views/login/index.vue` | 模板、脚本、样式重构 |
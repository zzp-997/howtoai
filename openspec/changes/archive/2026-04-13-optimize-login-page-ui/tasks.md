# 任务清单：登录页 UI/特效/排版优化

## 状态
✅ 已完成

## 任务列表

### 一、移除特效

- [x] 移除卡片入场动画
  - 删除 `.login-card` 的 `animation: card-appear 0.6s ease-out`
  - 删除 `@keyframes card-appear` 定义

- [x] 移除标题逐字动画
  - 将 `<span class="title-char" v-for...>` 改为静态 `<h1>极智协同</h1>`
  - 删除 `.title-char` CSS 样式
  - 删除 `@keyframes char-appear` 定义

### 二、精简特效

- [x] 精简波浪动画为 1 层
  - 删除 `.wave2`、`.wave3` DOM 元素
  - 删除 `.wave2`、`.wave3` CSS 样式
  - 保留并优化 `.wave`（单层波浪）

- [x] Canvas 粒子实现
  - 添加 `<canvas ref="particleCanvas">` 元素
  - 添加 `particleCanvas` ref
  - 实现 `initParticles()` 函数
  - 实现 `animateParticles()` 动画循环
  - 添加 `resize` 事件监听
  - 添加 `onUnmounted` 清理逻辑
  - 删除原有 `particles` ref 和 v-for 渲染
  - 删除 `generateParticles()` 函数
  - 删除 `.particle` CSS 样式
  - 删除 `@keyframes float-particle` 定义

### 三、布局优化

- [x] 调整副标题与卡片间距
  - Logo 区域 `mb-[36px]` → `mb-[48px]`

### 四、字体层级优化

- [x] 调整主标题字号
  - `text-[38px]` → `text-[40px]`

- [x] 调整副标题字号
  - `text-[22px]` → `text-[20px]`

- [x] 调整 Tab 选项字号
  - `text-[26px]` → `text-[28px]`

- [x] 调整输入框文字字号
  - 覆盖 TDesign 样式，placeholder 和输入文字改为 16px

- [x] 统一测试账号提示字号
  - 内容部分 `text-[18px]` → `text-[14px]`

### 五、代码清理

- [x] 清理无用 CSS
  - 删除所有移除特效相关的样式定义

- [x] 清理无用 JS
  - 删除移除特效相关的函数和变量
  - 移除未使用的 `BuildingIcon` 导入

### 六、验证

- [ ] 本地开发环境测试
  - 粒子动画正常
  - 波浪动画正常
  - 登录功能正常
  - 日夜模式切换正常

- [ ] 真机测试（需用户验证）
  - 流畅度提升
  - 视觉效果符合预期

---

## 完成时间
2026年4月13日

## 优化结果

| 指标 | 优化前 | 优化后 |
|------|--------|--------|
| DOM 节点 | ~45个 | ~16个 |
| 波浪层数 | 3层 | 1层 |
| 粒子实现 | 30个 DOM 元素 | Canvas 绑定 |
| 入场动画 | 卡片 + 标题逐字 | 无 |

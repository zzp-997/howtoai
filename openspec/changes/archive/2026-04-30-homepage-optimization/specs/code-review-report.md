# 代码重复项报告

> 生成时间: 2026-04-30
> 扫描范围: src/views/, src/style/, src/utils/

---

## 一、重复 HTML 结构

| 文件路径 | 重复结构类型 | 出现次数 | 建议处理方式 |
|---------|-------------|---------|-------------|
| 多个列表页面 | 卡片布局结构 | 14+ 处 | 提取 `BaseCard` 组件 |
| 多个列表页面 | 状态切换 Tab | 7+ 处 | 提取 `StatusTabs` 组件 |
| 多个表单页面 | 表单分组结构 | 7+ 处 | 提取 `FormGroup` 组件 |
| 多个表单页面 | 底部操作栏 | 6+ 处 | 提取 `BottomActionBar` 组件 |
| 多个审批页面 | 状态标签样式 | 5+ 处 | 提取 `StatusLabel` 组件 |
| 多个表单页面 | 日期选择弹窗 | 5+ 处 | 提取 `DatePickerPopup` 组件 |

**优先处理顺序**：BaseCard → StatusTabs → BottomActionBar → FormGroup

---

## 二、重复 CSS 样式

| 样式类型 | 重复次数 | 具体内容 | 建议处理方式 |
|---------|---------|---------|-------------|
| 主色渐变 | 15+ 处 | `bg-gradient-to-br from-[#0052D9] to-[#266FE8]` | 创建 `.gradient-primary` 类 |
| 成功色渐变 | 5+ 处 | `bg-gradient-to-br from-[#00A870] to-[#2BA471]` | 创建 `.gradient-success` 类 |
| 紫色渐变 | 5+ 处 | `bg-gradient-to-br from-[#7B61FF] to-[#9B8AFF]` | 创建 `.gradient-purple` 类 |
| 警告色渐变 | 4+ 处 | `bg-gradient-to-br from-[#ED7B2F] to-[#F09143]` | 创建 `.gradient-warning` 类 |
| 危险色渐变 | 3+ 处 | `bg-gradient-to-br from-[#E34D59] to-[#F06956]` | 创建 `.gradient-danger` 类 |
| 卡片阴影 | 10+ 处 | `shadow-lg shadow-slate-200/50` | 创建 `.card-shadow` 类 |
| 主题色阴影 | 5+ 处 | `shadow-lg shadow-[#0052D9]/30` | 创建 `.shadow-primary` 类 |
| 危险标签 | 8+ 处 | `bg-[#FFEBEE] text-[#E34D59]` | 创建 `.tag-danger` 类 |
| 成功标签 | 8+ 处 | `bg-[#E8F5E9] text-[#00A870]` | 创建 `.tag-success` 类 |
| 警告标签 | 6+ 处 | `bg-[#FFF3E0] text-[#ED7B2F]` | 创建 `.tag-warning` 类 |
| 卡片圆角 | 15+ 处 | `rounded-[24px]` | 使用 CSS 变量 `--radius-card` |
| 页面边距 | 10+ 处 | `px-[32px]` | 使用 CSS 变量 `--spacing-page` |
| 动画定义 | 6+ 处 | 各组件 scoped @keyframes | 抽取到全局 CSS |

**注意**：`index.less` 已定义设计变量，但组件中大量使用硬编码值，未充分利用。

---

## 三、重复 JS 逻辑

| 逻辑类型 | 重复位置 | 建议处理方式 |
|---------|---------|-------------|
| 日期格式化 | todo/index.vue, home/index.vue, announcement/index.vue, meeting/index.vue, attendance/index.vue | 创建 `src/utils/date.js` |
| 优先级标签 | todo/index.vue, todo/create.vue, home/index.vue (完全重复) | 创建 `src/constants/priority.js` |
| 状态标签 | trip/index.vue, leave/index.vue, approval/index.vue | 创建 `src/constants/status.js` |
| 智能推荐算法 | meeting/index.vue 与 smartRecommend.js (完全重复) | 删除组件内实现，改用 utils |
| 表单提交模式 | trip/create.vue, leave/create.vue, expense/create.vue, todo/create.vue | 创建 `useFormSubmit` composable |
| 撤销操作 | trip/index.vue, leave/index.vue (完全相同) | 创建 `useCancel` composable |
| 打卡逻辑 | home/index.vue, attendance/index.vue | 创建 `useAttendance` composable |
| 编辑模式检测 | trip/create.vue, expense/create.vue | 创建 `useEditMode` composable |

---

## 四、处理建议

### 立即处理（高优先级）

1. **删除 meeting/index.vue 中的重复推荐算法** - 与 smartRecommend.js 完全重复
2. **统一日期格式化函数** - 创建 `src/utils/date.js`
3. **统一优先级/状态常量** - 创建 `src/constants/` 目录

### 近期处理（中优先级）

4. **提取 BaseCard 组件** - 统一卡片样式
5. **提取 BottomActionBar 组件** - 统一底部操作栏
6. **创建 CSS 渐变类** - 减少硬编码渐变值

### 后续优化（低优先级）

7. **创建表单 composables** - useFormSubmit, useCancel, useEditMode
8. **将动画抽取到全局 CSS**
9. **统一使用 CSS 变量** 替代硬编码间距/圆角

---

## 五、涉及文件清单

- `src/views/home/index.vue`
- `src/views/todo/index.vue`
- `src/views/todo/create.vue`
- `src/views/meeting/user/index.vue`
- `src/views/meeting/user/create.vue`
- `src/views/trip/user/index.vue`
- `src/views/trip/user/create.vue`
- `src/views/leave/user/index.vue`
- `src/views/leave/user/create.vue`
- `src/views/attendance/user/index.vue`
- `src/views/announcement/user/index.vue`
- `src/views/document/user/index.vue`
- `src/views/expense/create.vue`
- `src/views/approval/index.vue`
- `src/views/login/index.vue`
- `src/utils/smartRecommend.js`
- `src/style/index.less`
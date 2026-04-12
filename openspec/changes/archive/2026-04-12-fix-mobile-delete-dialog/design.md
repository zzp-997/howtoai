# 设计文档：修复移动端删除确认弹窗

## 技术方案

### 问题根因

```
┌─────────────────────────────────────────────────────────────┐
│                    移动端 confirm() 问题                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. UI 被系统浏览器接管，可能被阻止                           │
│                                                             │
│  2. WebView 中行为不一致（微信/钉钉/企业微信）                │
│                                                             │
│  3. 与 Vue 响应式/异步入栈冲突                               │
│                                                             │
│  4. 触摸事件可能无法正确传递                                 │
│                                                             │
│  5. zoom: 1.2 放大后，原生对话框定位可能异常                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 解决方案

使用项目已有的 `showConfirmDialog()` 工具函数，基于 TDesign Mobile Vue 的 Dialog 组件封装。

#### 现有实现

```javascript
// src/utils/common/tools.js

export function showConfirmDialog({
  title = "提示",
  content = "内容",
  confirmBtn = "确定",
  cancelBtn = "取消"
} = {}) {
  return new Promise((resolve, reject) => {
    Dialog.confirm({
      title,
      content,
      buttonLayout: "vertical",  // 移动端优化布局
      confirmBtn: { content: confirmBtn, theme: 'primary' },
      cancelBtn: { content: cancelBtn, variant: "text" },
      onConfirm: resolve,
      onCancel: reject
    });
  })
}
```

### 代码变更模式

#### Before（问题代码）

```javascript
const handleDelete = async (item) => {
  if (confirm('确定删除吗？')) {
    await repo.delete(item.id)
    showToast('已删除')
    loadData()
  }
}
```

#### After（修复后）

```javascript
import { showToast, showConfirmDialog } from "@/utils/common/tools"

const handleDelete = async (item) => {
  try {
    await showConfirmDialog({ content: '确定删除吗？' })
    await repo.delete(item.id)
    showToast('已删除')
    loadData()
  } catch (e) {
    // 用户取消操作
  }
}
```

### 变更要点

1. **导入声明**：添加 `showConfirmDialog` 导入
2. **异步模式**：使用 `try/catch` 替代 `if` 条件判断
3. **Promise 风格**：`showConfirmDialog()` 返回 Promise

### 为什么选择 TDesign Dialog

| 特性 | 原生 confirm | TDesign Dialog |
|------|-------------|----------------|
| 移动端兼容 | ❌ 不稳定 | ✅ 完美支持 |
| 触摸友好 | ❌ 差 | ✅ 好 |
| 可定制 | ❌ 不可定制 | ✅ 可定制 |
| 与 zoom 兼容 | ❌ 可能异常 | ✅ 正常 |
| 主题一致性 | ❌ 系统风格 | ✅ 应用风格 |

## 文档更新设计

### 快速访问区块

在项目设计文档开头添加「快速访问」区块：

```
┌─────────────────────────────────────────────────┐
│  🚀 快速访问                                     │
├─────────────────────────────────────────────────┤
│  前端地址：https://ai.coderzzp.top/#/login       │
│                                                 │
│  预置账号：                                      │
│  ┌──────────┬──────────┬──────────┐            │
│  │   角色   │  用户名  │   密码   │            │
│  ├──────────┼──────────┼──────────┤            │
│  │  管理员  │  admin   │  123456  │            │
│  │ 普通用户 │   user   │  123456  │            │
│  └──────────┴──────────┴──────────┘            │
└─────────────────────────────────────────────────┘
```

### 设计理由

- 用户打开文档即可看到访问入口
- 无需翻阅到附录查找账号信息
- 降低使用门槛

## 测试验证

### 测试环境
- iOS Safari
- Android Chrome
- 微信内置浏览器
- 钉钉内置浏览器

### 测试用例
- [ ] 会议预定取消
- [ ] 会议预定删除（管理员）
- [ ] 会议室删除（管理员）
- [ ] 差旅申请撤销
- [ ] 差旅模板删除
- [ ] 请假申请撤销
- [ ] 待办任务删除
- [ ] 公告删除（管理员）
- [ ] 文档删除（管理员）
- [ ] 文档分类删除（管理员）

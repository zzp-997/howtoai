# 变更提案：修复移动端删除确认弹窗不可用问题

## 变更名称
`fix-mobile-delete-dialog`

## 状态
✅ 已完成

## 背景

### 问题描述
项目中 10 处删除/撤销操作使用了浏览器原生 `confirm()` 弹窗，在移动端真机上无法正常触发，导致用户无法完成删除操作。

PC 端模拟器表现正常，但真机测试时点击删除按钮无响应。

### 影响范围
- 会议预定取消
- 会议预定删除（管理员）
- 会议室删除（管理员）
- 差旅申请撤销
- 差旅模板删除
- 请假申请撤销
- 待办任务删除
- 公告删除（管理员）
- 文档删除（管理员）
- 文档分类删除（管理员）

## 动机

原生 `confirm()` 在移动端存在以下问题：
1. UI 被系统浏览器接管，可能被阻止
2. WebView 中行为不一致（微信/钉钉/企业微信）
3. 与 Vue 响应式/异步入栈冲突
4. 触摸事件可能无法正确传递
5. 项目使用了 `zoom: 1.2` 放大，原生对话框定位可能异常

项目中已有 `showConfirmDialog()` 工具函数，基于 TDesign Dialog 组件封装，移动端友好。

## 目标

将所有 `confirm()` 调用替换为 `showConfirmDialog()`，确保移动端删除操作正常工作。

## 非目标

- 不修改确认弹窗的视觉样式
- 不修改业务逻辑

## 范围

### 修改的文件（共 10 处）

| 文件 | 操作 |
|------|------|
| `src/views/meeting/user/my.vue` | 取消预定 |
| `src/views/meeting/admin/index.vue` | 删除预定 |
| `src/views/meeting/admin/rooms.vue` | 删除会议室 |
| `src/views/trip/user/index.vue` | 撤销申请 |
| `src/views/trip/user/create.vue` | 删除模板 |
| `src/views/leave/user/index.vue` | 撤销请假 |
| `src/views/todo/index.vue` | 删除待办 |
| `src/views/announcement/admin/index.vue` | 删除公告 |
| `src/views/document/admin/index.vue` | 删除文档 |
| `src/views/document/admin/category.vue` | 删除分类 |

## 附：文档更新

同时更新了项目设计文档，在开头添加「快速访问」区块：
- 前端地址：https://ai.coderzzp.top/#/login
- 预置账号信息

更新的文档文件：
- `docs/项目设计文档.md`
- `docs/项目设计文档.html`

## 风险评估

- **风险**：低
- **原因**：仅替换确认弹窗实现，不改变业务逻辑
- **测试**：需要在真机上验证所有删除操作

## 完成时间
2026年4月12日

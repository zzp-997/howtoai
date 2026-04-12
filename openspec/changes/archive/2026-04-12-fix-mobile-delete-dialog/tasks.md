# 任务清单：修复移动端删除确认弹窗

## 状态：✅ 已完成

## 任务列表

### 一、代码修复（共 10 处）

#### 会议模块
- [x] `src/views/meeting/user/my.vue` - 取消预定
  - 导入 `showConfirmDialog`
  - 替换 `confirm()` 为 `showConfirmDialog()`

- [x] `src/views/meeting/admin/index.vue` - 删除预定
  - 导入 `showConfirmDialog`
  - 替换 `confirm()` 为 `showConfirmDialog()`

- [x] `src/views/meeting/admin/rooms.vue` - 删除会议室
  - 导入 `showConfirmDialog`
  - 替换 `confirm()` 为 `showConfirmDialog()`

#### 差旅模块
- [x] `src/views/trip/user/index.vue` - 撤销申请
  - 导入 `showConfirmDialog`
  - 替换 `confirm()` 为 `showConfirmDialog()`

- [x] `src/views/trip/user/create.vue` - 删除模板
  - 已有 `showErrorDialog` 导入
  - 替换 `confirm()` 为 `showConfirmDialog()`

#### 请假模块
- [x] `src/views/leave/user/index.vue` - 撤销请假
  - 导入 `showConfirmDialog`
  - 替换 `confirm()` 为 `showConfirmDialog()`

#### 待办模块
- [x] `src/views/todo/index.vue` - 删除待办
  - 导入 `showConfirmDialog`
  - 替换 `confirm()` 为 `showConfirmDialog()`

#### 公告模块
- [x] `src/views/announcement/admin/index.vue` - 删除公告
  - 导入 `showConfirmDialog`
  - 替换 `confirm()` 为 `showConfirmDialog()`

#### 文档模块
- [x] `src/views/document/admin/index.vue` - 删除文档
  - 导入 `showConfirmDialog`
  - 替换 `confirm()` 为 `showConfirmDialog()`

- [x] `src/views/document/admin/category.vue` - 删除分类
  - 导入 `showConfirmDialog`
  - 替换 `confirm()` 为 `showConfirmDialog()`

### 二、文档更新

- [x] `docs/项目设计文档.md` - 添加快速访问区块
- [x] `docs/项目设计文档.md` - 添加「九、变更管理规范」章节
- [x] `docs/项目设计文档.html` - 添加快速访问区块
- [x] `docs/项目设计文档.html` - 添加「九、变更管理规范」章节
- [ ] `docs/项目设计文档.docx` - Word 格式需手动更新（可选）

### 三、验证

- [x] 检查代码中是否还有遗漏的 `confirm()` 调用
- [ ] 真机测试所有删除操作（需用户验证）

## 完成时间
2026年4月12日

## 备注
- 所有代码修改已完成
- 建议在真机上测试验证

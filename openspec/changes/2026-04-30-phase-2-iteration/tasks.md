# 二期迭代实施任务

## 变更名称
`phase-2-iteration`

---

## 第一阶段：安全加固

### 1.1 数据库设计

| 任务ID | 任务名称 | 文件路径 | 预估时间 |
|--------|----------|----------|----------|
| 1.2.1 | 登录日志表设计 | `docs/database/login_logs.sql` | 15min |
| 1.2.2 | 操作日志表设计 | `docs/database/operation_logs.sql` | 15min |
| 1.2.3 | 用户表扩展设计 | `docs/database/users_extension.sql` | 15min |
| 1.2.4 | 数据库变更SQL脚本 | `migrations/001_security_extension.sql` | 30min |

### 1.2 后端开发

| 任务ID | 任务名称 | 文件路径 | 预估时间 | 依赖 |
|--------|----------|----------|----------|------|
| 1.3.1 | 登录失败计数逻辑 | `app/utils/security.py` | 30min | 1.2.3 |
| 1.3.2 | 账户锁定与解锁逻辑 | `app/utils/security.py` | 30min | 1.3.1 |
| 1.3.3 | Flask-Limiter限流中间件 | `app/middleware/rate_limiter.py` | 30min | - |
| 1.3.4 | 操作日志拦截器 | `app/middleware/operation_log.py` | 30min | 1.2.2 |
| 1.3.5 | Token刷新接口 | `app/routes/auth.py` | 30min | - |
| 1.3.6 | 密码强度校验逻辑 | `app/utils/password.py` | 30min | - |
| 1.3.7 | 密码过期检测与提醒 | `app/utils/password.py` | 30min | 1.3.6 |

### 1.3 前端开发

| 任务ID | 任务名称 | 文件路径 | 预估时间 | 依赖 |
|--------|----------|----------|----------|------|
| 1.4.1 | 登录页错误提示优化 | `src/views/login/index.vue` | 20min | - |
| 1.4.2 | 账户锁定倒计时显示 | `src/views/login/index.vue` | 20min | 1.3.2 |
| 1.4.3 | 429状态码处理 | `src/utils/request.js` | 15min | 1.3.3 |
| 1.4.4 | Token自动刷新机制 | `src/utils/auth.js` | 30min | 1.3.5 |
| 1.4.5 | 密码强度实时校验UI | `src/views/settings/password.vue` | 20min | 1.3.6 |
| 1.4.6 | 密码过期提醒弹窗 | `src/App.vue` | 20min | 1.3.7 |

### 1.4 测试

| 任务ID | 任务名称 | 预估时间 | 依赖 |
|--------|----------|----------|------|
| 1.5.1 | 安全测试用例编写 | 60min | - |
| 1.5.2 | 登录保护功能测试 | 30min | 1.4.2 |
| 1.5.3 | 限流功能测试 | 30min | 1.4.3 |
| 1.5.4 | 操作日志验证 | 30min | 1.3.4 |
| 1.5.5 | Token刷新测试 | 30min | 1.4.4 |
| 1.5.6 | 密码策略测试 | 30min | 1.4.5 |
| 1.5.7 | 第一阶段回归测试 | 60min | 1.5.2-1.5.6 |

---

## 第二阶段：审批增强 + 意见反馈

### 2.1 需求与设计

| 任务ID | 任务名称 | 文件路径 | 预估时间 |
|--------|----------|----------|----------|
| 2.1.1 | 审批增强需求文档 | `docs/requirements/approval_enhancement.md` | 30min |
| 2.1.2 | 意见反馈需求文档 | `docs/requirements/feedback.md` | 30min |
| 2.1.3 | 审批链配置页设计稿 | `design/approval-chain-config.sketch` | 60min |
| 2.1.4 | 消息中心页设计稿 | `design/message-center.sketch` | 60min |
| 2.1.5 | 意见反馈页设计稿 | `design/feedback.sketch` | 60min |

### 2.2 数据库设计

| 任务ID | 任务名称 | 文件路径 | 预估时间 |
|--------|----------|----------|----------|
| 2.2.1 | 审批链配置表设计 | `docs/database/approval_chains.sql` | 15min |
| 2.2.2 | 审批记录表设计 | `docs/database/approval_records.sql` | 15min |
| 2.2.3 | 消息表设计 | `docs/database/messages.sql` | 15min |
| 2.2.4 | 意见反馈表设计 | `docs/database/feedbacks.sql` | 15min |
| 2.2.5 | 数据库变更SQL脚本 | `migrations/002_approval_feedback.sql` | 30min |

### 2.3 后端开发

| 任务ID | 任务名称 | 文件路径 | 预估时间 | 依赖 |
|--------|----------|----------|----------|------|
| 2.3.1 | 审批链配置CRUD接口 | `app/routes/approval_chain.py` | 60min | 2.2.1 |
| 2.3.2 | 多级审批流程引擎 | `app/services/approval_engine.py` | 120min | 2.3.1 |
| 2.3.3 | 批量审批接口 | `app/routes/approval.py` | 60min | 2.3.2 |
| 2.3.4 | 消息推送服务 | `app/services/message.py` | 60min | 2.2.3 |
| 2.3.5 | 审批进度查询接口 | `app/routes/approval.py` | 30min | 2.3.2 |
| 2.3.6 | 催办提醒定时任务 | `app/tasks/reminder.py` | 60min | 2.3.4 |
| 2.3.7 | 意见反馈CRUD接口 | `app/routes/feedback.py` | 60min | 2.2.4 |
| 2.3.8 | 反馈回复接口 | `app/routes/feedback.py` | 30min | 2.3.7 |

### 2.4 前端开发

| 任务ID | 任务名称 | 文件路径 | 预估时间 | 依赖 |
|--------|----------|----------|----------|------|
| 2.4.1 | 审批链配置页 | `src/views/approval/chain-config.vue` | 60min | 2.1.3 |
| 2.4.2 | 批量审批操作栏 | `src/views/approval/list.vue` | 60min | 2.3.3 |
| 2.4.3 | 消息中心页 | `src/views/message/index.vue` | 60min | 2.1.4 |
| 2.4.4 | 未读消息角标 | `src/components/Tabbar.vue` | 20min | 2.4.3 |
| 2.4.5 | 审批进度节点图 | `src/views/approval/detail.vue` | 60min | 2.3.5 |
| 2.4.6 | 催办按钮交互 | `src/views/approval/detail.vue` | 30min | 2.3.6 |
| 2.4.7 | 意见反馈提交页 | `src/views/feedback/create.vue` | 60min | 2.1.5 |
| 2.4.8 | 反馈进度查询页 | `src/views/feedback/list.vue` | 60min | 2.3.7 |

### 2.5 测试

| 任务ID | 任务名称 | 预估时间 | 依赖 |
|--------|----------|----------|------|
| 2.5.1 | 审批功能测试 | 60min | 2.4.2 |
| 2.5.2 | 多级审批流程测试 | 60min | 2.3.2 |
| 2.5.3 | 批量审批测试 | 30min | 2.3.3 |
| 2.5.4 | 消息通知测试 | 30min | 2.3.4 |
| 2.5.5 | 意见反馈测试 | 30min | 2.4.7 |
| 2.5.6 | 第二阶段回归测试 | 60min | 2.5.1-2.5.5 |

---

## 第三阶段：数据可视化 + 知识库 + 会议智能调度

### 3.1 需求与设计

| 任务ID | 任务名称 | 文件路径 | 预估时间 |
|--------|----------|----------|----------|
| 3.1.1 | 数据报表需求文档 | `docs/requirements/reports.md` | 30min |
| 3.1.2 | 知识库需求文档 | `docs/requirements/knowledge.md` | 30min |
| 3.1.3 | 会议报表设计稿 | `design/meeting-report.sketch` | 60min |
| 3.1.4 | 考勤报表设计稿 | `design/attendance-report.sketch` | 60min |
| 3.1.5 | 知识库设计稿 | `design/knowledge-base.sketch` | 60min |

### 3.2 数据库设计

| 任务ID | 任务名称 | 文件路径 | 预估时间 |
|--------|----------|----------|----------|
| 3.2.1 | 知识分类表设计 | `docs/database/knowledge_categories.sql` | 15min |
| 3.2.2 | 知识内容表设计 | `docs/database/knowledges.sql` | 15min |
| 3.2.3 | 数据库变更SQL脚本 | `migrations/003_knowledge_reports.sql` | 30min |

### 3.3 后端开发

| 任务ID | 任务名称 | 文件路径 | 预估时间 | 依赖 |
|--------|----------|----------|----------|------|
| 3.3.1 | 会议使用率统计接口 | `app/routes/stats/meeting.py` | 60min | - |
| 3.3.2 | 考勤分析统计接口 | `app/routes/stats/attendance.py` | 60min | - |
| 3.3.3 | 审批统计接口 | `app/routes/stats/approval.py` | 60min | - |
| 3.3.4 | 综合大屏聚合接口 | `app/routes/stats/dashboard.py` | 60min | 3.3.1-3.3.3 |
| 3.3.5 | 知识库CRUD接口 | `app/routes/knowledge.py` | 60min | 3.2.2 |
| 3.3.6 | 知识搜索接口 | `app/routes/knowledge.py` | 60min | 3.3.5 |
| 3.3.7 | 知识权限控制 | `app/services/knowledge_permission.py` | 60min | 3.3.5 |
| 3.3.8 | 智能推荐算法优化 | `app/services/smart_recommend.py` | 120min | - |
| 3.3.9 | 自动排程算法 | `app/services/meeting_scheduler.py` | 120min | - |

### 3.4 前端开发

| 任务ID | 任务名称 | 文件路径 | 预估时间 | 依赖 |
|--------|----------|----------|----------|------|
| 3.4.1 | 会议报表页 | `src/views/report/meeting.vue` | 90min | 3.1.3 |
| 3.4.2 | 考勤报表页 | `src/views/report/attendance.vue` | 90min | 3.1.4 |
| 3.4.3 | 综合数据大屏 | `src/views/report/dashboard.vue` | 90min | 3.3.4 |
| 3.4.4 | 知识库列表页 | `src/views/knowledge/list.vue` | 60min | 3.1.5 |
| 3.4.5 | 知识详情页 | `src/views/knowledge/detail.vue` | 60min | 3.4.4 |
| 3.4.6 | 知识搜索页 | `src/views/knowledge/search.vue` | 60min | 3.3.6 |
| 3.4.7 | 智能推荐增强 | `src/utils/smartRecommend.js` | 60min | 3.3.8 |

### 3.5 测试

| 任务ID | 任务名称 | 预估时间 | 依赖 |
|--------|----------|----------|------|
| 3.5.1 | 报表功能测试 | 60min | 3.4.3 |
| 3.5.2 | 知识库功能测试 | 60min | 3.4.5 |
| 3.5.3 | 智能推荐测试 | 60min | 3.4.7 |
| 3.5.4 | 性能测试 | 120min | - |
| 3.5.5 | 第三阶段回归测试 | 60min | 3.5.1-3.5.3 |

---

## 第四阶段：任务协作

### 4.1 需求与设计

| 任务ID | 任务名称 | 文件路径 | 预估时间 |
|--------|----------|----------|----------|
| 4.1.1 | 任务协作需求文档 | `docs/requirements/task_collaboration.md` | 30min |
| 4.1.2 | 任务看板原型设计 | `design/task-board.sketch` | 60min |
| 4.1.3 | 任务看板设计稿 | `design/task-board-ui.sketch` | 60min |

### 4.2 数据库设计

| 任务ID | 任务名称 | 文件路径 | 预估时间 |
|--------|----------|----------|----------|
| 4.2.1 | 任务表扩展设计 | `docs/database/tasks_extension.sql` | 15min |
| 4.2.2 | 子任务表设计 | `docs/database/subtasks.sql` | 15min |
| 4.2.3 | 任务评论表设计 | `docs/database/task_comments.sql` | 15min |
| 4.2.4 | 任务动态表设计 | `docs/database/task_activities.sql` | 15min |
| 4.2.5 | 数据库变更SQL脚本 | `migrations/004_task_collaboration.sql` | 30min |

### 4.3 后端开发

| 任务ID | 任务名称 | 文件路径 | 预估时间 | 依赖 |
|--------|----------|----------|----------|------|
| 4.3.1 | 任务CRUD扩展接口 | `app/routes/task.py` | 60min | 4.2.1 |
| 4.3.2 | 任务分配接口 | `app/routes/task.py` | 30min | 4.3.1 |
| 4.3.3 | 子任务接口 | `app/routes/task.py` | 60min | 4.2.2 |
| 4.3.4 | 任务评论接口 | `app/routes/task_comment.py` | 60min | 4.2.3 |
| 4.3.5 | 任务动态记录 | `app/services/task_activity.py` | 60min | 4.2.4 |
| 4.3.6 | 任务权限控制 | `app/services/task_permission.py` | 60min | 4.3.1 |
| 4.3.7 | 任务通知集成 | `app/services/task_notification.py` | 60min | 4.3.5 |

### 4.4 前端开发

| 任务ID | 任务名称 | 文件路径 | 预估时间 | 依赖 |
|--------|----------|----------|----------|------|
| 4.4.1 | 任务看板页 | `src/views/task/board.vue` | 90min | 4.1.3 |
| 4.4.2 | 任务详情页 | `src/views/task/detail.vue` | 90min | 4.4.1 |
| 4.4.3 | 任务分配交互 | `src/views/task/detail.vue` | 30min | 4.3.2 |
| 4.4.4 | 子任务列表 | `src/views/task/detail.vue` | 60min | 4.3.3 |
| 4.4.5 | 任务评论区 | `src/views/task/detail.vue` | 60min | 4.3.4 |
| 4.4.6 | 任务动态展示 | `src/views/task/detail.vue` | 60min | 4.3.5 |

### 4.5 测试

| 任务ID | 任务名称 | 预估时间 | 依赖 |
|--------|----------|----------|------|
| 4.5.1 | 任务协作测试 | 60min | 4.4.1 |
| 4.5.2 | 任务看板测试 | 60min | 4.4.1 |
| 4.5.3 | 任务分配测试 | 30min | 4.4.3 |
| 4.5.4 | 评论和子任务测试 | 60min | 4.4.4-4.4.5 |
| 4.5.5 | 第四阶段回归测试 | 60min | 4.5.1-4.5.4 |

---

## 全量回归

| 任务ID | 任务名称 | 预估时间 | 依赖 |
|--------|----------|----------|------|
| 5.1 | 全量功能回归测试 | 120min | 所有阶段完成 |
| 5.2 | 性能压测 | 120min | - |
| 5.3 | 安全渗透测试 | 120min | 第一阶段完成 |
| 5.4 | 验收报告输出 | 60min | 5.1-5.3 |

---

## 任务统计

| 阶段 | 后端任务 | 前端任务 | 数据库任务 | 测试任务 | 总计 |
|------|----------|----------|------------|----------|------|
| 第一阶段 | 7 | 6 | 4 | 7 | 24 |
| 第二阶段 | 8 | 8 | 5 | 6 | 27 |
| 第三阶段 | 9 | 7 | 3 | 4 | 23 |
| 第四阶段 | 7 | 6 | 5 | 5 | 23 |
| 回归测试 | - | - | - | 4 | 4 |
| **总计** | **31** | **27** | **17** | **26** | **101** |

---

## 实施顺序建议

1. **并行**：数据库设计（所有阶段）
2. **第一阶段**：安全模块优先上线
3. **第二阶段**：审批增强 + 消息通知
4. **第三阶段**：数据可视化 + 知识库
5. **第四阶段**：任务协作
6. **最终**：全量回归测试

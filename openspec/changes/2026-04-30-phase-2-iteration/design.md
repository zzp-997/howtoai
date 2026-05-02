# 二期迭代技术设计文档

## 变更名称
`phase-2-iteration`

## 技术架构概览

```
┌─────────────────────────────────────────────────────────────┐
│                      前端 (Vue 3 + TDesign)                  │
├─────────────────────────────────────────────────────────────┤
│  用户端页面    │  管理端页面    │  公共组件                   │
│  - 任务协作   │  - 审批配置   │  - 消息中心                 │
│  - 意见反馈   │  - 数据报表   │  - Token刷新                │
│  - 知识库     │  - 知识库管理 │  - 限流提示                 │
└───────────────┴───────────────┴─────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      后端 (Flask + MySQL)                   │
├─────────────────────────────────────────────────────────────┤
│  安全模块      │  审批引擎      │  业务模块                   │
│  - 登录限制   │  - 审批链     │  - 消息服务                 │
│  - 频率限制   │  - 批量审批   │  - 知识库API                │
│  - 操作日志   │  - 审批统计   │  - 任务管理                 │
│  - Token管理  │  - 催办任务   │  - 反馈处理                 │
└───────────────┴───────────────┴─────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      数据存储 (MySQL + Redis)                │
├─────────────────────────────────────────────────────────────┤
│  业务数据      │  会话数据      │  缓存数据                   │
│  - approval_* │  - login_logs │  - rate_limit              │
│  - messages   │  - operation  │  - token                   │
│  - feedbacks  │  - users扩展  │                            │
│  - knowledges│               │                            │
└───────────────┴───────────────┴─────────────────────────────┘
```

---

## 第一阶段：安全加固

### 1.1 技术方案

#### 登录失败限制
- **实现方式**：用户表扩展字段 `login_fail_count`、`locked_until`
- **锁定逻辑**：连续失败5次后设置 `locked_until = NOW() + 15分钟`
- **解锁方式**：定时任务检查自动解锁 / 管理员手动解锁

#### 请求频率限制
- **技术选型**：Flask-Limiter 中间件
- **存储方式**：Redis（如无 Redis 则降级为内存存储）
- **配置项**：
  ```python
  limiter = Limiter(
      key_func=get_remote_address,
      storage_uri="redis://localhost:6379"
  )
  limiter.limit("1000/minute")  # 全局IP限制
  limiter.limit("100/minute", scope="user")  # 用户级限制
  limiter.limit("10/minute", scope="login")  # 登录接口
  ```

#### 操作日志审计
- **实现方式**：Flask 装饰器 `@operation_log`
- **记录内容**：用户ID、操作类型、资源类型、资源ID、详情、IP、UA

#### Token双机制
- **Access Token**：有效期2小时，用于接口访问
- **Refresh Token**：有效期7天，用于刷新Access Token
- **刷新策略**：Access Token 过期前5分钟自动刷新

#### 密码安全策略
- **复杂度规则**：8位以上 + 至少包含大小写字母、数字、特殊字符中的3种
- **过期机制**：90天过期，提前7天提醒
- **历史记录**：存储最近5次密码哈希

### 1.2 数据库设计

```sql
-- 登录日志表
CREATE TABLE login_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  ip_address VARCHAR(45),
  status ENUM('success', 'failed') NOT NULL,
  failure_reason VARCHAR(100),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_status (user_id, status, created_at)
);

-- 操作日志表
CREATE TABLE operation_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  action VARCHAR(50) NOT NULL,
  resource_type VARCHAR(50),
  resource_id BIGINT,
  detail JSON,
  ip_address VARCHAR(45),
  user_agent VARCHAR(500),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_action (user_id, action, created_at),
  INDEX idx_resource (resource_type, resource_id)
);

-- 用户表扩展
ALTER TABLE users ADD COLUMN login_fail_count INT DEFAULT 0;
ALTER TABLE users ADD COLUMN locked_until DATETIME NULL;
ALTER TABLE users ADD COLUMN password_changed_at DATETIME;
ALTER TABLE users ADD COLUMN password_history JSON;
```

### 1.3 API 接口设计

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/auth/login` | POST | 登录（含失败计数） |
| `/api/auth/refresh` | POST | 刷新Token |
| `/api/auth/unlock` | POST | 管理员解锁 |
| `/api/logs/operations` | GET | 操作日志查询 |

### 1.4 前端设计

- **UI组件**：TDesign Mobile
- **登录页**：错误提示优化、锁定倒计时显示
- **全局**：429状态码处理、Token自动刷新

---

## 第二阶段：审批增强 + 意见反馈

### 2.1 技术方案

#### 多级审批引擎
- **审批链配置**：支持角色、用户、部门多种审批人类型
- **审批模式**：`or`（任一审批）/ `and`（全部审批）
- **状态流转**：待审批 → 审批中 → 已通过 / 已拒绝

#### 消息通知服务
- **推送机制**：轮询 + WebSocket（可选）
- **消息类型**：审批通知、系统通知、任务通知

#### 意见反馈系统
- **状态流转**：待处理 → 处理中 → 已回复 → 已关闭

### 2.2 数据库设计

```sql
-- 审批链配置表
CREATE TABLE approval_chains (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  type VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  nodes JSON NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 审批记录表
CREATE TABLE approval_records (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  application_type VARCHAR(50) NOT NULL,
  application_id BIGINT NOT NULL,
  node_order INT NOT NULL,
  approver_id BIGINT NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  comment TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  processed_at DATETIME,
  INDEX idx_app (application_type, application_id)
);

-- 消息表
CREATE TABLE messages (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT,
  link VARCHAR(200),
  is_read BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_read (user_id, is_read)
);

-- 意见反馈表
CREATE TABLE feedbacks (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  images JSON,
  status ENUM('pending', 'processing', 'replied', 'closed') DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 反馈回复表
CREATE TABLE feedback_replies (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  feedback_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 2.3 API 接口设计

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/approval/chains` | CRUD | 审批链配置 |
| `/api/approval/apply` | POST | 提交审批 |
| `/api/approval/batch` | POST | 批量审批 |
| `/api/messages` | GET/POST | 消息列表/标记已读 |
| `/api/feedbacks` | CRUD | 意见反馈 |
| `/api/feedbacks/{id}/reply` | POST | 回复反馈 |

### 2.4 前端设计

- **UI组件**：TDesign Mobile
- **审批链配置页**：表单配置审批节点
- **批量审批**：checkbox多选 + 底部操作栏
- **消息中心**：列表页 + 详情页 + 角标
- **意见反馈**：表单提交 + 进度查询

---

## 第三阶段：数据可视化 + 知识库 + 会议智能调度

### 3.1 技术方案

#### 数据报表
- **图表库**：ECharts（Vue-ECharts）
- **统计维度**：会议使用率、考勤分析、审批统计

#### 知识库
- **搜索**：MySQL FULLTEXT 全文索引
- **权限控制**：public / department / custom

#### 会议智能调度
- **推荐算法**：基于历史数据 + 冲突检测
- **优化目标**：时间利用率最大化

### 3.2 数据库设计

```sql
-- 知识分类表
CREATE TABLE knowledge_categories (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  parent_id BIGINT NULL,
  sort_order INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 知识内容表
CREATE TABLE knowledges (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  category_id BIGINT,
  author_id BIGINT NOT NULL,
  tags JSON,
  visibility ENUM('public', 'department', 'custom') DEFAULT 'public',
  view_count INT DEFAULT 0,
  status ENUM('draft', 'published') DEFAULT 'draft',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FULLTEXT INDEX ft_title_content (title, content)
);
```

### 3.3 API 接口设计

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/stats/meetings` | GET | 会议统计 |
| `/api/stats/attendance` | GET | 考勤统计 |
| `/api/stats/approvals` | GET | 审批统计 |
| `/api/knowledges` | CRUD | 知识库 |
| `/api/knowledges/search` | GET | 知识搜索 |
| `/api/meetings/recommend` | GET | 会议推荐 |

### 3.4 前端设计

- **UI组件**：TDesign Mobile + ECharts
- **数据大屏**：ECharts 仪表盘
- **知识库**：列表 + 详情 + 搜索

---

## 第四阶段：任务协作

### 4.1 技术方案

#### 任务管理
- **看板视图**：待处理 / 进行中 / 已完成
- **子任务**：嵌套任务支持
- **权限控制**：创建者/负责人/关注者

### 4.2 数据库设计

```sql
-- 扩展任务表
ALTER TABLE tasks ADD COLUMN assignees JSON;
ALTER TABLE tasks ADD COLUMN watchers JSON;
ALTER TABLE tasks ADD COLUMN due_date DATE;
ALTER TABLE tasks ADD COLUMN priority ENUM('low', 'medium', 'high');

-- 子任务表
CREATE TABLE subtasks (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  task_id BIGINT NOT NULL,
  title VARCHAR(200) NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  assignee_id BIGINT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 任务评论表
CREATE TABLE task_comments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  task_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  content TEXT NOT NULL,
  mention_users JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 任务动态表
CREATE TABLE task_activities (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  task_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  action VARCHAR(50) NOT NULL,
  detail JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 4.3 API 接口设计

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/tasks` | GET | 任务列表（含看板） |
| `/api/tasks/{id}` | PUT | 任务更新 |
| `/api/tasks/{id}/subtasks` | CRUD | 子任务 |
| `/api/tasks/{id}/comments` | CRUD | 任务评论 |
| `/api/tasks/{id}/assign` | POST | 分配任务 |

### 4.4 前端设计

- **UI组件**：TDesign Mobile
- **任务看板**：Kanban 布局
- **任务详情**：Tab 切换（详情/评论/动态）

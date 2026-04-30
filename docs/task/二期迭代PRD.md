# 极智协同二期迭代 PRD

## 文档信息

| 项目 | 内容 |
|------|------|
| 版本 | 1.1 |
| 创建日期 | 2026-04-30 |
| 负责人 | 产品经理 |
| 状态 | 待开发 |

---

## 一、概述

### 1.1 项目背景

「极智协同」是一款移动端企业OA办公应用，一期已完成核心功能开发：会议预定、差旅申请、请假管理、考勤打卡、文档查询、待办事项、公告通知、报销申请等模块。

### 1.2 二期目标

- **安全加固**：提升系统安全性，防止恶意攻击
- **审批增强**：完善审批流程，提升审批效率
- **数据可视化**：提供直观的数据报表，辅助管理决策
- **新功能扩展**：任务协作、意见反馈、知识库、会议智能调度

### 1.3 整体排期

| 阶段 | 主题 | 预估周期 |
|------|------|----------|
| 第一阶段 | 安全加固 | 1-2周 |
| 第二阶段 | 审批增强 + 意见反馈 | 2-3周 |
| 第三阶段 | 数据可视化 + 知识库 + 会议智能调度 | 2-3周 |
| 第四阶段 | 任务协作 | 2周 |

---

## 二、团队角色与智能体映射

### 2.1 角色智能体映射表

| 角色 | 智能体名称 | 智能体ID | 职责范围 |
|------|-----------|----------|----------|
| **产品经理** | Product Manager | `product-manager` | 需求细化、原型设计、验收标准、用户调研 |
| **UI设计师** | UI Designer | `ui-designer` | 界面设计、交互规范、视觉规范、设计稿交付 |
| **前端工程师** | Frontend Developer | `frontend-developer` | Vue3 页面开发、图表集成、交互实现 |
| **后端工程师** | Backend Architect | `backend-architect` | Flask API 开发、安全机制、定时任务 |
| **架构师** | Software Architect | `software-architect` | 数据库设计、技术方案评审、性能优化、代码审查 |
| **数据库专家** | Database Optimizer | `database-optimizer` | 数据库表设计、索引优化、SQL审核 |
| **安全工程师** | Security Engineer | `security-engineer` | 安全方案设计、安全测试、漏洞修复 |
| **测试工程师** | API Tester | `api-tester` | 功能测试、接口测试、回归测试 |
| **性能测试** | Performance Benchmarker | `performance-benchmarker` | 性能测试、压力测试、性能报告 |
| **Team Leader** | Senior Project Manager | `senior-project-manager` | 任务分发、进度监控、阻塞处理、自动流转 |

### 2.2 智能体协作流程

```
┌─────────────────────────────────────────────────────────────────┐
│                     Team Leader (senior-project-manager)         │
│                     自动驱动执行、任务分发、进度监控               │
└─────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
        ┌───────────────┐  ┌───────────────┐  ┌───────────────┐
        │  产品经理      │  │  架构师        │  │  UI设计师      │
        │ product-manager│  │software-architect│  │  ui-designer  │
        │               │  │               │  │               │
        │ 需求文档      │  │ 技术方案      │  │ 设计稿        │
        │ 原型设计      │  │ 数据库设计    │  │ 交互规范      │
        └───────┬───────┘  └───────┬───────┘  └───────┬───────┘
                │                  │                  │
                └──────────────────┼──────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
                    ▼                             ▼
        ┌───────────────┐               ┌───────────────┐
        │  前端工程师    │               │  后端工程师   │
        │frontend-dev    │               │backend-architect│
        │               │               │               │
        │ 页面开发      │               │ API开发       │
        │ 组件实现      │               │ 安全机制      │
        └───────┬───────┘               └───────┬───────┘
                │                                 │
                └─────────────────┬───────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │        测试工程师        │
                    │       api-tester         │
                    │                          │
                    │  功能测试  接口测试      │
                    │  安全测试  性能测试      │
                    └─────────────────────────┘
```

---

## 三、第一阶段：安全加固

### 3.1 任务与智能体分配

| 任务ID | 任务名称 | 智能体 | 产出物 |
|--------|----------|--------|--------|
| 1.1.1 | 安全需求细化文档 | `product-manager` | 需求文档 |
| 1.1.2 | 安全功能原型设计 | `product-manager` | 原型图 |
| 1.1.3 | 登录失败限制设计稿 | `ui-designer` | UI设计稿 |
| 1.1.4 | 密码强度指示设计稿 | `ui-designer` | UI设计稿 |
| 1.2.1 | 登录日志表设计 | `database-optimizer` | 表结构设计 |
| 1.2.2 | 操作日志表设计 | `database-optimizer` | 表结构设计 |
| 1.2.3 | 用户表扩展设计 | `database-optimizer` | 表结构设计 |
| 1.2.4 | 数据库变更SQL脚本 | `database-optimizer` | SQL迁移脚本 |
| 1.2.5 | 安全方案技术评审 | `software-architect` | 技术评审报告 |
| 1.3.1 | 登录失败计数逻辑 | `backend-architect` | 后端代码 |
| 1.3.2 | 账户锁定与解锁逻辑 | `backend-architect` | 后端代码 |
| 1.3.3 | Flask-Limiter限流中间件 | `backend-architect` | 后端代码 |
| 1.3.4 | 操作日志拦截器 | `backend-architect` | 后端代码 |
| 1.3.5 | Token刷新接口 | `backend-architect` | API接口 |
| 1.3.6 | 密码强度校验逻辑 | `backend-architect` | 后端代码 |
| 1.3.7 | 密码过期检测与提醒 | `backend-architect` | 后端代码 |
| 1.4.1 | 登录页错误提示优化 | `frontend-developer` | 前端代码 |
| 1.4.2 | 账户锁定倒计时显示 | `frontend-developer` | 前端代码 |
| 1.4.3 | 429状态码处理 | `frontend-developer` | 前端代码 |
| 1.4.4 | Token自动刷新机制 | `frontend-developer` | 前端代码 |
| 1.4.5 | 密码强度实时校验UI | `frontend-developer` | 前端代码 |
| 1.4.6 | 密码过期提醒弹窗 | `frontend-developer` | 前端代码 |
| 1.5.1 | 安全测试用例编写 | `security-engineer` | 测试用例 |
| 1.5.2 | 登录保护功能测试 | `api-tester` | 测试报告 |
| 1.5.3 | 限流功能测试 | `api-tester` | 测试报告 |
| 1.5.4 | 操作日志验证 | `api-tester` | 测试报告 |
| 1.5.5 | Token刷新测试 | `api-tester` | 测试报告 |
| 1.5.6 | 密码策略测试 | `api-tester` | 测试报告 |
| 1.5.7 | 第一阶段回归测试 | `api-tester` | 回归测试报告 |

### 3.2 功能详细需求

#### 3.2.1 登录失败限制

**功能描述**：防止暴力破解攻击，连续登录失败后锁定账户。

**业务规则**：
| 规则 | 配置 |
|------|------|
| 连续失败次数阈值 | 5 次 |
| 锁定时长 | 15 分钟 |
| 锁定范围 | 用户账户 |
| 解锁方式 | 自动解锁 / 管理员手动解锁 |

**交互设计**：
1. 登录失败时，提示"用户名或密码错误，还剩 X 次尝试机会"
2. 达到阈值时，提示"账户已锁定，请 15 分钟后重试"
3. 锁定期间登录，提示"账户已锁定，请 X 分钟后重试"（显示剩余时间）

**数据库设计**：
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

-- 用户表扩展
ALTER TABLE users ADD COLUMN login_fail_count INT DEFAULT 0;
ALTER TABLE users ADD COLUMN locked_until DATETIME NULL;
```

---

#### 3.2.2 请求频率限制

**功能描述**：限制接口调用频率，防止恶意刷接口或 DDoS 攻击。

**业务规则**：
| 限制类型 | 阈值 |
|----------|------|
| 全局 IP 限制 | 1000 次/分钟 |
| 用户级限制 | 100 次/分钟 |
| 登录接口限制 | 10 次/分钟 |
| 敏感操作限制 | 20 次/小时 |

**技术方案**：
- 使用 Flask-Limiter 中间件
- Redis 存储计数器（如无可降级为内存存储）
- 配置文件可调整阈值

---

#### 3.2.3 操作日志审计

**功能描述**：记录用户关键操作，便于安全审计和问题追溯。

**记录范围**：
| 操作类型 | 具体操作 |
|----------|----------|
| 认证操作 | 登录、登出、Token刷新 |
| 审批操作 | 提交申请、审批通过、审批拒绝、撤销申请 |
| 数据变更 | 创建、修改、删除核心业务数据 |
| 权限操作 | 角色变更、权限调整 |

**数据库设计**：
```sql
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
```

---

#### 3.2.4 Token刷新机制

**功能描述**：采用双Token机制，提升安全性，减少用户重复登录。

**业务规则**：
| Token类型 | 有效期 | 用途 |
|-----------|--------|------|
| Access Token | 2小时 | 访问接口 |
| Refresh Token | 7天 | 刷新Access Token |

**技术方案**：
1. 登录成功返回 `accessToken` 和 `refreshToken`
2. `accessToken` 过期前5分钟，前端自动调用刷新接口
3. 刷新接口验证 `refreshToken`，颁发新的 `accessToken`
4. `refreshToken` 过期或失效，需重新登录

---

#### 3.2.5 密码安全策略

**功能描述**：强制密码安全规则，降低账户被盗风险。

**业务规则**：
| 规则 | 配置 |
|------|------|
| 最小长度 | 8位 |
| 复杂度要求 | 至少包含大小写字母、数字、特殊字符中的3种 |
| 密码过期 | 90天 |
| 过期提醒 | 提前7天提醒 |
| 历史密码 | 不能与最近5次密码相同 |

**数据库设计**：
```sql
ALTER TABLE users ADD COLUMN password_changed_at DATETIME;
ALTER TABLE users ADD COLUMN password_history JSON;
```

---

## 四、第二阶段：审批增强 + 意见反馈

### 4.1 任务与智能体分配

| 任务ID | 任务名称 | 智能体 | 产出物 |
|--------|----------|--------|--------|
| 2.1.1 | 审批增强需求文档 | `product-manager` | 需求文档 |
| 2.1.2 | 意见反馈需求文档 | `product-manager` | 需求文档 |
| 2.1.3 | 审批流程原型设计 | `product-manager` | 原型图 |
| 2.1.4 | 审批链配置页设计稿 | `ui-designer` | UI设计稿 |
| 2.1.5 | 批量审批交互设计稿 | `ui-designer` | UI设计稿 |
| 2.1.6 | 消息中心页设计稿 | `ui-designer` | UI设计稿 |
| 2.1.7 | 审批进度可视化设计稿 | `ui-designer` | UI设计稿 |
| 2.1.8 | 意见反馈页设计稿 | `ui-designer` | UI设计稿 |
| 2.2.1 | 审批链配置表设计 | `database-optimizer` | 表结构设计 |
| 2.2.2 | 审批记录表设计 | `database-optimizer` | 表结构设计 |
| 2.2.3 | 消息表设计 | `database-optimizer` | 表结构设计 |
| 2.2.4 | 意见反馈表设计 | `database-optimizer` | 表结构设计 |
| 2.2.5 | 数据库变更SQL脚本 | `database-optimizer` | SQL迁移脚本 |
| 2.2.6 | 审批引擎架构设计 | `software-architect` | 架构设计文档 |
| 2.3.1 | 审批链配置CRUD接口 | `backend-architect` | API接口 |
| 2.3.2 | 多级审批流程引擎 | `backend-architect` | 后端代码 |
| 2.3.3 | 批量审批接口 | `backend-architect` | API接口 |
| 2.3.4 | 消息推送服务 | `backend-architect` | 后端代码 |
| 2.3.5 | 审批进度查询接口 | `backend-architect` | API接口 |
| 2.3.6 | 催办提醒定时任务 | `backend-architect` | 后端代码 |
| 2.3.7 | 意见反馈CRUD接口 | `backend-architect` | API接口 |
| 2.3.8 | 反馈回复接口 | `backend-architect` | API接口 |
| 2.4.1 | 审批链配置页 | `frontend-developer` | 前端代码 |
| 2.4.2 | 批量审批操作栏 | `frontend-developer` | 前端代码 |
| 2.4.3 | 消息中心页 | `frontend-developer` | 前端代码 |
| 2.4.4 | 未读消息角标 | `frontend-developer` | 前端代码 |
| 2.4.5 | 审批进度节点图 | `frontend-developer` | 前端代码 |
| 2.4.6 | 催办按钮交互 | `frontend-developer` | 前端代码 |
| 2.4.7 | 意见反馈提交页 | `frontend-developer` | 前端代码 |
| 2.4.8 | 反馈进度查询页 | `frontend-developer` | 前端代码 |
| 2.5.1 | 审批功能测试 | `api-tester` | 测试报告 |
| 2.5.2 | 多级审批流程测试 | `api-tester` | 测试报告 |
| 2.5.3 | 批量审批测试 | `api-tester` | 测试报告 |
| 2.5.4 | 消息通知测试 | `api-tester` | 测试报告 |
| 2.5.5 | 意见反馈测试 | `api-tester` | 测试报告 |
| 2.5.6 | 第二阶段回归测试 | `api-tester` | 回归测试报告 |

### 4.2 功能详细需求

#### 4.2.1 多级审批

**功能描述**：支持配置多级审批链，实现分级审批流程。

**审批链配置示例**：
```json
{
  "type": "trip",
  "name": "差旅申请审批链",
  "nodes": [
    { "order": 1, "type": "role", "value": "department_manager", "mode": "or" },
    { "order": 2, "type": "user", "value": [1, 2], "mode": "and" },
    { "order": 3, "type": "role", "value": "finance_director", "mode": "or" }
  ]
}
```

**数据库设计**：
```sql
CREATE TABLE approval_chains (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  type VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  nodes JSON NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE approval_records (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  application_type VARCHAR(50) NOT NULL,
  application_id BIGINT NOT NULL,
  node_order INT NOT NULL,
  approver_id BIGINT NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  comment TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  processed_at DATETIME
);
```

---

#### 4.2.2 消息通知

**消息类型**：
| 类型 | 说明 |
|------|------|
| 审批通知 | 申请提交、审批通过、审批拒绝、催办提醒 |
| 系统通知 | 公告发布、密码过期提醒 |
| 任务通知 | 任务分配、任务评论、任务截止提醒 |

**数据库设计**：
```sql
CREATE TABLE messages (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT,
  link VARCHAR(200),
  is_read BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

#### 4.2.3 意见反馈

**状态流转**：
```
待处理 → 处理中 → 已回复 → 已关闭
                ↘ 已关闭
```

**数据库设计**：
```sql
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

CREATE TABLE feedback_replies (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  feedback_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 五、第三阶段：数据可视化 + 知识库 + 会议智能调度

### 5.1 任务与智能体分配

| 任务ID | 任务名称 | 智能体 | 产出物 |
|--------|----------|--------|--------|
| 3.1.1 | 数据报表需求文档 | `product-manager` | 需求文档 |
| 3.1.2 | 知识库需求文档 | `product-manager` | 需求文档 |
| 3.1.3 | 智能调度需求文档 | `product-manager` | 需求文档 |
| 3.1.4 | 会议报表设计稿 | `ui-designer` | UI设计稿 |
| 3.1.5 | 考勤报表设计稿 | `ui-designer` | UI设计稿 |
| 3.1.6 | 综合大屏设计稿 | `ui-designer` | UI设计稿 |
| 3.1.7 | 知识库设计稿 | `ui-designer` | UI设计稿 |
| 3.2.1 | 知识分类表设计 | `database-optimizer` | 表结构设计 |
| 3.2.2 | 知识内容表设计 | `database-optimizer` | 表结构设计 |
| 3.2.3 | 数据库变更SQL脚本 | `database-optimizer` | SQL迁移脚本 |
| 3.2.4 | 报表架构设计 | `software-architect` | 架构设计文档 |
| 3.3.1 | 会议使用率统计接口 | `backend-architect` | API接口 |
| 3.3.2 | 考勤分析统计接口 | `backend-architect` | API接口 |
| 3.3.3 | 审批统计接口 | `backend-architect` | API接口 |
| 3.3.4 | 综合大屏聚合接口 | `backend-architect` | API接口 |
| 3.3.5 | 知识库CRUD接口 | `backend-architect` | API接口 |
| 3.3.6 | 知识搜索接口 | `backend-architect` | API接口 |
| 3.3.7 | 知识权限控制 | `backend-architect` | 后端代码 |
| 3.3.8 | 智能推荐算法优化 | `backend-architect` | 后端代码 |
| 3.3.9 | 自动排程算法 | `backend-architect` | 后端代码 |
| 3.4.1 | 会议报表页（图表组件） | `frontend-developer` | 前端代码 |
| 3.4.2 | 考勤报表页 | `frontend-developer` | 前端代码 |
| 3.4.3 | 综合数据大屏 | `frontend-developer` | 前端代码 |
| 3.4.4 | 知识库列表页 | `frontend-developer` | 前端代码 |
| 3.4.5 | 知识详情页 | `frontend-developer` | 前端代码 |
| 3.4.6 | 知识搜索页 | `frontend-developer` | 前端代码 |
| 3.4.7 | 智能推荐增强 | `frontend-developer` | 前端代码 |
| 3.5.1 | 报表功能测试 | `api-tester` | 测试报告 |
| 3.5.2 | 知识库功能测试 | `api-tester` | 测试报告 |
| 3.5.3 | 智能推荐测试 | `api-tester` | 测试报告 |
| 3.5.4 | 性能测试 | `performance-benchmarker` | 性能报告 |
| 3.5.5 | 第三阶段回归测试 | `api-tester` | 回归测试报告 |

### 5.2 功能详细需求

#### 5.2.1 知识库

**数据库设计**：
```sql
CREATE TABLE knowledge_categories (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  parent_id BIGINT NULL,
  sort_order INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

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

---

## 六、第四阶段：任务协作

### 6.1 任务与智能体分配

| 任务ID | 任务名称 | 智能体 | 产出物 |
|--------|----------|--------|--------|
| 4.1.1 | 任务协作需求文档 | `product-manager` | 需求文档 |
| 4.1.2 | 任务看板原型设计 | `product-manager` | 原型图 |
| 4.1.3 | 任务看板设计稿 | `ui-designer` | UI设计稿 |
| 4.1.4 | 任务详情页设计稿 | `ui-designer` | UI设计稿 |
| 4.2.1 | 任务表扩展设计 | `database-optimizer` | 表结构设计 |
| 4.2.2 | 子任务表设计 | `database-optimizer` | 表结构设计 |
| 4.2.3 | 任务评论表设计 | `database-optimizer` | 表结构设计 |
| 4.2.4 | 任务动态表设计 | `database-optimizer` | 表结构设计 |
| 4.2.5 | 数据库变更SQL脚本 | `database-optimizer` | SQL迁移脚本 |
| 4.2.6 | 任务权限模型设计 | `software-architect` | 架构设计文档 |
| 4.3.1 | 任务CRUD扩展接口 | `backend-architect` | API接口 |
| 4.3.2 | 任务分配接口 | `backend-architect` | API接口 |
| 4.3.3 | 子任务接口 | `backend-architect` | API接口 |
| 4.3.4 | 任务评论接口 | `backend-architect` | API接口 |
| 4.3.5 | 任务动态记录 | `backend-architect` | 后端代码 |
| 4.3.6 | 任务权限控制 | `backend-architect` | 后端代码 |
| 4.3.7 | 任务通知集成 | `backend-architect` | 后端代码 |
| 4.4.1 | 任务看板页 | `frontend-developer` | 前端代码 |
| 4.4.2 | 任务详情页 | `frontend-developer` | 前端代码 |
| 4.4.3 | 任务分配交互 | `frontend-developer` | 前端代码 |
| 4.4.4 | 子任务列表 | `frontend-developer` | 前端代码 |
| 4.4.5 | 任务评论区 | `frontend-developer` | 前端代码 |
| 4.4.6 | 任务动态展示 | `frontend-developer` | 前端代码 |
| 4.5.1 | 任务协作测试 | `api-tester` | 测试报告 |
| 4.5.2 | 任务看板测试 | `api-tester` | 测试报告 |
| 4.5.3 | 任务分配测试 | `api-tester` | 测试报告 |
| 4.5.4 | 评论和子任务测试 | `api-tester` | 测试报告 |
| 4.5.5 | 第四阶段回归测试 | `api-tester` | 回归测试报告 |

### 6.2 数据库设计

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

---

## 七、全量回归

| 任务ID | 任务名称 | 智能体 | 产出物 |
|--------|----------|--------|--------|
| 5.1 | 全量功能回归测试 | `api-tester` | 回归测试报告 |
| 5.2 | 性能压测 | `performance-benchmarker` | 性能测试报告 |
| 5.3 | 安全渗透测试 | `security-engineer` | 安全测试报告 |
| 5.4 | 验收报告输出 | `api-tester` | 验收报告 |

---

## 八、验收标准

### 8.1 功能验收

| 阶段 | 验收项 | 验收标准 |
|------|--------|----------|
| 第一阶段 | 登录保护 | 连续失败5次锁定，15分钟后自动解锁 |
| 第一阶段 | 频率限制 | 超过阈值返回429，正常请求不受影响 |
| 第一阶段 | 操作日志 | 关键操作完整记录，可查询追溯 |
| 第一阶段 | Token刷新 | Token过期前自动刷新，用户无感知 |
| 第一阶段 | 密码策略 | 弱密码无法提交，过期提醒正常 |
| 第二阶段 | 多级审批 | 审批链配置正常，按序流转 |
| 第二阶段 | 批量审批 | 批量操作正常，结果准确 |
| 第二阶段 | 消息通知 | 实时推送，未读角标准确 |
| 第二阶段 | 意见反馈 | 提交、处理、回复流程完整 |
| 第三阶段 | 数据报表 | 数据准确，图表展示正常 |
| 第三阶段 | 知识库 | 分类、搜索、权限控制正常 |
| 第四阶段 | 任务协作 | 任务分配、评论、子任务功能正常 |

### 8.2 性能验收

| 指标 | 标准 |
|------|------|
| 接口响应时间 | < 500ms (P95) |
| 页面加载时间 | < 3s (首屏) |
| 并发支持 | 100 QPS |

---

## 九、附录

### 9.1 智能体调用方式

Team Leader 在执行任务时，将使用以下方式调用对应智能体：

```
Agent({
  subagent_type: "<智能体ID>",
  prompt: "<任务描述和上下文>",
  description: "<任务简介>"
})
```

### 9.2 智能体文件路径

| 智能体 | 文件路径 |
|--------|----------|
| product-manager | `product/product-manager.md` |
| ui-designer | `design/design-ui-designer.md` |
| frontend-developer | `engineering/engineering-frontend-developer.md` |
| backend-architect | `engineering/engineering-backend-architect.md` |
| software-architect | `engineering/engineering-software-architect.md` |
| database-optimizer | `engineering/engineering-database-optimizer.md` |
| security-engineer | `engineering/engineering-security-engineer.md` |
| api-tester | `testing/api-tester.md` |
| performance-benchmarker | `testing/performance-benchmarker.md` |
| senior-project-manager | `project-management/senior-project-manager.md` |

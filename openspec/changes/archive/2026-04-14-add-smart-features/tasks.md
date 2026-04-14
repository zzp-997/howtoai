# 任务清单：会议预定与差旅出行智能化功能

## 状态
✅ 已完成

---

## 阶段一：会议预定智能化（P1）

### 1.1 智能推荐算法
- [x] 创建 `src/utils/smartRecommend.js`
  - [x] 实现 `getMeetingRecommendations()` 函数
  - [x] 实现 `calculateScore()` 评分算法
  - [x] 实现 `calculateAvailability()` 空闲计算
  - [x] 实现缓存机制（30分钟过期）

### 1.2 首页推荐卡片
- [x] 修改 `src/views/home/index.vue`
  - [x] 新增"智能推荐"区块
  - [x] 实现 2 卡片轮播组件
  - [x] 实现"换一批"刷新功能
  - [x] 实现"一键预定"功能
  - [x] 添加缓存逻辑（30分钟过期）

### 1.3 预定页悬浮推荐
- [x] 修改 `src/views/meeting/user/index.vue`
  - [x] 新增右下角悬浮按钮
  - [x] 实现推荐弹窗组件
  - [x] 实现即时计算推荐
  - [x] 实现从弹窗直接预定

---

## 阶段二：差旅行程提醒（P2）

### 2.1 行程提醒功能
- [x] 扩展 `src/utils/smartRecommend.js`
  - [x] 实现 `getTripReminders()` 函数
  - [x] 实现建议携带物品规则 `generatePackingSuggestions()`

- [x] 修改 `src/views/home/index.vue`
  - [x] 新增行程提醒卡片
  - [x] 实现提醒显示逻辑（出发前1天）
  - [x] 实现"我知道了"状态记录

---

## 阶段三：差旅智能报销（P2）

### 3.1 数据层
- [x] 修改 `src/db/index.js`
  - [x] 新增 `expense_claims` 表定义

- [x] 创建 `src/db/repositories/expenseClaimRepo.js`
  - [x] 实现 `findByUserId()`
  - [x] 实现 `findByTripId()`
  - [x] 实现 `generateFromTrip()` 预填生成
  - [x] 实现 `calculateTotal()` 总额计算

- [x] 修改 `src/db/repositories/index.js`
  - [x] 导出 expenseClaimRepo

### 3.2 报销单页面
- [x] 创建 `src/views/expense/create.vue`
  - [x] 实现基本信息展示（自动填充）
  - [x] 实现费用明细表单
  - [x] 实现预估金额显示
  - [x] 实现实际金额输入
  - [x] 实现总额自动计算
  - [x] 实现"保存草稿"功能
  - [x] 实现"提交报销"功能

### 3.3 路由配置
- [x] 修改 `src/router/index.js`
  - [x] 新增 `/user/expense/create` 路由

### 3.4 差旅详情入口
- [x] 修改 `src/views/trip/user/index.vue`
  - [x] 新增"生成报销单"按钮（差旅结束后显示）

### 3.5 首页报销提醒
- [x] 修改 `src/views/home/index.vue`
  - [x] 新增报销提醒卡片
  - [x] 实现差旅结束当天提醒逻辑

---

## 验证清单

### 会议预定
- [ ] 首页推荐卡片正常显示
- [ ] 卡片轮播功能正常
- [ ] "换一批"刷新推荐
- [ ] "一键预定"成功创建预定
- [ ] 预定页悬浮按钮点击弹出推荐
- [ ] 推荐结果准确匹配用户偏好

### 差旅行程提醒
- [ ] 出发前1天显示提醒卡片
- [ ] 天气提示正确显示
- [ ] 建议携带物品正确生成
- [ ] "我知道了"后卡片消失

### 智能报销
- [ ] 差旅结束后显示报销提醒
- [ ] 报销单预填数据正确
- [ ] 费用计算准确
- [ ] 保存草稿功能正常
- [ ] 提交报销功能正常

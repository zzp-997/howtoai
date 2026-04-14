# 设计文档：会议预定与差旅出行智能化功能

## 变更名称
`add-smart-features`

---

## 一、会议预定智能化

### 1.1 首页推荐卡片

**位置**：首页"我的待办"区块下方

**布局**：
```
┌─────────────────────────────────────────────────────────┐
│  🎯 智能推荐                              换一批 ›       │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐  ┌─────────────────────┐      │
│  │ 会议室A             │  │ 会议室B             │      │
│  │ 容纳 10人           │  │ 容纳 6人            │      │
│  │ 今天 14:00-15:00    │  │ 今天 15:00-16:00    │      │
│  │ 📊投影 📝白板        │  │ 📊投影              │      │
│  │ [一键预定]          │  │ [一键预定]          │      │
│  └─────────────────────┘  └─────────────────────┘      │
│  ← 滑动切换 →                                          │
└─────────────────────────────────────────────────────────┘
```

**交互**：
- 卡片左右滑动切换，指示器显示当前位置
- "换一批"刷新推荐结果
- "一键预定"直接预定，跳过选择流程
- 点击卡片展开详情，显示推荐理由

**数据策略**：
- 缓存推荐结果，30分钟过期
- 进入首页时从缓存读取，后台异步更新
- 点击"换一批"强制重新计算

### 1.2 预定页悬浮按钮

**位置**：会议室列表页右下角固定悬浮

**弹窗设计**：
```
┌─────────────────────────────────────────────────────────┐
│  🎯 为您推荐以下会议室                                   │
│  ─────────────────────────────────────────────────────  │
│  ① 会议室A（推荐指数 ⭐⭐⭐⭐）                           │
│     • 您最常用的会议室                                   │
│     • 今日 14:00-16:00 空闲                             │
│     • 容纳 10人，有投影、白板                            │
│  ─────────────────────────────────────────────────────  │
│  ② 会议室C（推荐指数 ⭐⭐⭐）                             │
│     • 今日全天空闲                                      │
│     • 容纳 20人，适合大型会议                            │
│  ─────────────────────────────────────────────────────  │
│  [预定会议室A]    [预定会议室C]    [取消]                │
└─────────────────────────────────────────────────────────┘
```

### 1.3 推荐算法

```javascript
// src/utils/smartRecommend.js

/**
 * 获取会议推荐
 * @param {number} userId 用户ID
 * @param {Object} options 可选参数（人数、设备需求）
 * @returns {Array} 推荐列表（最多2个）
 */
async function getMeetingRecommendations(userId, options = {}) {
  // 1. 获取用户偏好（常用会议室、常用时段）
  const preference = await userPreferenceRepo.findByUserId(userId)

  // 2. 获取所有会议室
  const rooms = await meetingRoomRepo.findAll()

  // 3. 获取今日预定情况
  const today = dayjs().format('YYYY-MM-DD')
  const reservations = await reservationRepo.findByDate(today)

  // 4. 计算每个会议室的空闲时段
  const roomAvailability = calculateAvailability(rooms, reservations)

  // 5. 评分排序
  const scored = rooms.map(room => ({
    room,
    score: calculateScore(room, preference, roomAvailability, options)
  })).sort((a, b) => b.score - a.score)

  // 6. 返回 Top 2
  return scored.slice(0, 2)
}

/**
 * 计算推荐分数
 */
function calculateScore(room, preference, availability, options) {
  let score = 0

  // 常用会议室加分（权重 40%）
  if (preference.frequentRooms.includes(room.id)) {
    score += 40
  }

  // 当前时段空闲加分（权重 30%）
  const now = dayjs()
  const currentHour = now.hour()
  if (isAvailable(availability[room.id], currentHour)) {
    score += 30
  }

  // 人数匹配（权重 15%）
  if (options.capacity && room.capacity >= options.capacity) {
    score += 15
  }

  // 设备匹配（权重 15%）
  if (options.equipment) {
    const matched = options.equipment.filter(e => room.equipment?.includes(e))
    score += (matched.length / options.equipment.length) * 15
  }

  return score
}
```

---

## 二、差旅出行智能化

### 2.1 行程提醒

**触发时机**：差旅开始日期前 1 天

**位置**：首页公告轮播区下方

**卡片设计**：
```
┌─────────────────────────────────────────────────────────┐
│  ✈️ 明天出发提醒                                         │
│  ─────────────────────────────────────────────────────  │
│  目的地：上海                                            │
│  出发日期：2026-04-15                                    │
│                                                         │
│  🌤️ 天气：多云 18-25°C                                   │
│  💡 提示：梅雨季节注意带伞                               │
│                                                         │
│  📋 建议携带：                                           │
│  ☂️ 雨伞  👔 正装  💻 笔记本电脑                         │
│                                                         │
│                           [查看详情]  [我知道了]          │
└─────────────────────────────────────────────────────────┘
```

**建议携带规则**：
```javascript
const SUGGESTION_RULES = [
  { condition: '雨季', items: ['雨伞'] },
  { condition: '正式会议', items: ['正装', '名片'] },
  { condition: '多日出差', items: ['充电器', '洗漱用品'] },
  { condition: '远途', items: ['笔记本电脑', '电源适配器'] }
]
```

### 2.2 智能报销

**触发时机**：
- 自动提醒：差旅结束日期当天
- 手动入口：差旅详情页底部按钮

**报销单预填页**：
```
┌─────────────────────────────────────────────────────────┐
│  报销单填写                                              │
│  ─────────────────────────────────────────────────────  │
│  基本信息（自动填充）                                    │
│  ├── 差旅事由：上海总部项目对接                          │
│  ├── 出发日期：2026-04-15                               │
│  └── 返回日期：2026-04-17                               │
│                                                         │
│  费用明细（请填写实际金额）                              │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 交通费      预估 ¥800-1000   实际 ¥_______      │   │
│  ├─────────────────────────────────────────────────┤   │
│  │ 住宿费      预估 ¥1200-1500  实际 ¥_______      │   │
│  ├─────────────────────────────────────────────────┤   │
│  │ 餐饮费      预估 ¥200-300    实际 ¥_______      │   │
│  ├─────────────────────────────────────────────────┤   │
│  │ 其他费用                          实际 ¥_______      │   │
│  └─────────────────────────────────────────────────┘   │
│  费用汇总：¥_______                                      │
│                                                         │
│  [提交报销]                    [保存草稿]               │
└─────────────────────────────────────────────────────────┘
```

---

## 三、数据结构设计

### 3.1 新增表：expense_claims（报销单）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Number | 主键 |
| userId | Number | 用户ID |
| tripId | Number | 关联差旅申请ID |
| reason | String | 差旅事由 |
| startDate | String | 出发日期 |
| endDate | String | 返回日期 |
| destination | String | 目的地 |
| expenses | Array | 费用明细 |
| totalEstimated | Number | 预估总额 |
| totalActual | Number | 实际总额 |
| status | String | 状态：draft/submitted/approved |
| createdAt | Date | 创建时间 |
| submittedAt | Date | 提交时间 |

**费用明细结构**：
```javascript
{
  category: '交通',      // 类别
  estimated: 800,        // 预估金额
  estimatedMax: 1000,    // 预估上限
  actual: 0              // 实际金额
}
```

### 3.2 expenseClaimRepo 方法

```javascript
class ExpenseClaimRepository extends BaseRepository {
  // 根据用户ID查询
  findByUserId(userId)

  // 根据差旅ID查询
  findByTripId(tripId)

  // 根据状态查询
  findByStatus(status)

  // 根据报销单预填数据
  generateFromTrip(tripId)

  // 计算总额
  calculateTotal(expenseClaimId)
}
```

---

## 四、文件变更清单

### 新增文件

| 文件 | 说明 |
|------|------|
| `src/db/repositories/expenseClaimRepo.js` | 报销单数据访问层 |
| `src/views/expense/create.vue` | 报销单填写页面 |
| `src/utils/smartRecommend.js` | 智能推荐算法 |

### 修改文件

| 文件 | 变更内容 |
|------|----------|
| `src/db/index.js` | 新增 expense_claims 表定义 |
| `src/db/repositories/index.js` | 导出 expenseClaimRepo |
| `src/views/home/index.vue` | 新增推荐卡片、提醒卡片 |
| `src/views/meeting/user/index.vue` | 新增悬浮推荐按钮 |
| `src/views/trip/user/index.vue` | 新增报销入口 |
| `src/router/index.js` | 新增报销单路由 |

---

## 五、测试要点

| 功能 | 测试项 |
|------|--------|
| 首页推荐 | 缓存生效、换一批刷新、一键预定成功 |
| 预定页推荐 | 悬浮按钮弹出、即时计算、推荐准确 |
| 行程提醒 | 提醒时机正确、内容显示完整 |
| 智能报销 | 预填数据正确、金额计算准确、保存草稿 |

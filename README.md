# 极智协同

一款基于 Vue 3 的移动端企业 OA 办公应用，提供会议预定、差旅申请、请假打卡、文档查询、待办事项、公告通知等功能，支持普通员工和管理员两种角色。

## 技术栈

| 类型 | 技术 |
|------|------|
| 框架 | Vue 3 + Composition API |
| 构建工具 | Vite 6 |
| 路由 | Vue Router 4 |
| 状态管理 | Pinia + pinia-plugin-persistedstate |
| UI 组件库 | TDesign Mobile Vue + Vant 4 |
| 图标 | TDesign Icons Vue Next |
| 样式 | Tailwind CSS + Less |
| HTTP 请求 | Axios |
| 数据存储 | IndexedDB (本地存储) |
| 日期处理 | Day.js |
| 响应式方案 | postcss-px-to-viewport |

## 功能模块

### 用户端

| 模块 | 功能 |
|------|------|
| 首页 | 工作台入口 |
| 会议预定 | 会议室查询、预定、我的预定管理 |
| 差旅出行 | 差旅申请、申请记录查看 |
| 请假打卡 | 请假申请、上下班打卡、补卡申请、打卡日历 |
| 文档查询 | 公司文档浏览与搜索 |
| 待办事项 | 我的待办、新建待办 |
| 公告通知 | 公告列表、公告详情 |
| 设置 | 个人设置（主题、字体大小等） |

### 管理端

| 模块 | 功能 |
|------|------|
| 首页 | 管理工作台 |
| 会议管理 | 会议室配置、预定查看与管理 |
| 审批中心 | 差旅审批、请假审批、补卡审批 |
| 文档管理 | 文档上传、分类管理 |
| 考勤管理 | 员工考勤数据查看、报表导出 |
| 公告管理 | 公告发布与管理 |

## 目录结构

```
src/
├── api/                  # API 接口层
│   ├── index.js          # API 统一导出
│   └── mock/             # Mock 数据（开发环境）
├── components/           # 公共组件
│   └── root.vue          # 页面根组件（标题栏、返回按钮）
├── db/                   # 数据库层
│   ├── index.js          # IndexedDB 初始化
│   ├── seed.js           # 初始数据填充
│   └── repositories/     # 数据访问层
│       ├── userRepo.js
│       ├── meetingRoomRepo.js
│       ├── reservationRepo.js
│       ├── tripRepo.js
│       ├── leaveRepo.js
│       ├── attendanceRepo.js
│       ├── makeUpRequestRepo.js
│       ├── documentRepo.js
│       ├── documentCategoryRepo.js
│       ├── attendanceConfigRepo.js
│       ├── todoRepo.js
│       └── announcementRepo.js
├── directives/           # 自定义指令
├── router/               # 路由配置
├── store/                # Pinia 状态管理
│   ├── index.js          # Store 入口
│   └── modules/
│       ├── user.js       # 用户状态
│       ├── permission.js # 权限状态
│       └── settings.js   # 设置状态
├── style/                # 全局样式
├── types/                # TypeScript 类型定义
│   └── auto-imports.d.ts # 自动导入类型
├── utils/                # 工具函数
│   ├── common/           # 全局工具方法（自动导入）
│   │   └── tools.js
│   └── request/          # Axios 封装
│       ├── index.js
│       ├── Axios.js
│       ├── utils.js
│       └── contentTypeEnum.js
├── views/                # 页面组件
│   ├── home/             # 首页
│   ├── login/            # 登录
│   ├── meeting/          # 会议模块
│   │   ├── user/         # 用户端会议
│   │   └── admin/        # 管理端会议
│   ├── trip/             # 差旅模块
│   ├── leave/            # 请假模块
│   ├── attendance/       # 考勤模块
│   │   ├── user/         # 用户端考勤
│   │   └── admin/        # 管理端考勤
│   ├── approval/         # 审批模块
│   ├── document/         # 文档模块
│   │   ├── user/         # 用户端文档
│   │   └── admin/        # 管理端文档
│   ├── todo/             # 待办模块
│   ├── announcement/     # 公告模块
│   │   ├── user/         # 用户端公告
│   │   └── admin/        # 管理端公告
│   ├── settings/         # 设置模块
│   └── 404.vue           # 404 页面
├── App.vue               # 根组件
├── main.js               # 入口文件
└── permission.js         # 路由权限控制
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 生产构建

```bash
npm run build
```

### 预览构建

```bash
npm run preview
```

## 默认账号

系统内置测试账号，首次运行自动初始化：

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | 123456 |
| 员工 | 张三 | 123456 |
| 员工 | 李四 | 123456 |
| 员工 | 王五 | 123456 |

## 数据存储

本项目使用 IndexedDB 作为本地数据库，数据存储在浏览器本地，适合演示和原型开发。

### 数据表

| 表名 | 说明 |
|------|------|
| users | 用户信息 |
| meetingRooms | 会议室 |
| reservations | 会议预定 |
| trips | 差旅申请 |
| leaves | 请假申请 |
| attendances | 考勤记录 |
| makeUpRequests | 补卡申请 |
| documents | 文档 |
| documentCategories | 文档分类 |
| attendanceConfig | 考勤配置 |

## 权限控制

- 路由层面：通过 `meta.role` 区分用户端和管理端路由
- 登录验证：`permission.js` 统一拦截未登录访问
- 角色判断：`userStore.isAdmin` 判断用户角色

## 样式规范

- 使用 Tailwind CSS 原子化样式
- 支持任意值写法：`text-[28px]`、`p-[24px]`
- 使用 `postcss-px-to-viewport` 自动转换 px 为 vw
- 主题色：`#0052D9`（蓝色）、`#00A870`（绿色）、`#ED7B2F`（橙色）、`#E34D59`（红色）

## 公用组件

| 组件 | 说明 |
|------|------|
| `Root` | 根组件，自带 TabBar 标题栏，无需注册直接使用 |
| `popup` | 弹出层组件，默认高度 1029px |
| `pagingView` | 分页组件，支持下拉刷新和上拉加载 |

## 开发注意事项

### 自动导入

通过 `unplugin-auto-import` 实现以下自动导入：

- **Vue 相关**：ref、reactive、computed、watch 等无需手动引入
- **路由相关**：useRouter、useRoute 等无需手动引入
- **Pinia 相关**：defineStore、storeToRefs 等无需手动引入
- **组件**：TDesign 和 Vant 组件无需手动注册
- **工具方法**：`src/utils/common` 目录下的方法全局可用

```javascript
// 无需这样写
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'

// 直接使用即可
const count = ref(0)
const router = useRouter()
```

### 样式单位

- 直接使用设计图的 px 尺寸，会自动转换为 vw
- 使用 TailwindCSS 时推荐 px 写法：`w-[300px]` 表示宽度 300px
- 好处：可直接对照 UI 设计图，提高代码可读性和可维护性

### 全局工具方法

`src/utils/common/tools.js` 下的方法可直接调用：

```javascript
// 直接使用，无需 import
isEmpty(value)      // 判断是否为空
notEmpty(value)     // 判断是否非空
showToast(msg)      // 显示提示
showErrorDialog(msg) // 显示错误弹窗
```

## 浏览器支持

- Chrome >= 最新版
- Firefox >= 最新版
- Safari >= 最新版
- 不支持 IE

## License

MIT

# 极智协同 - 前端

![Deploy](https://github.com/zzp-997/howtoai/actions/workflows/deploy.yml/badge.svg)

移动端企业 OA 办公应用，支持员工和管理员两种角色，提供会议预定、差旅申请、请假打卡、文档查询、待办事项、公告通知等功能。

## 技术栈

Vue 3 · Vite 6 · Pinia · TDesign Mobile · Vant 4 · Tailwind CSS · Axios

## 功能模块

| 模块 | 员工 | 管理员 |
|------|------|--------|
| 会议 | 预定会议室 | 管理会议室与预定 |
| 差旅 | 提交申请 | 审批申请 |
| 请假 | 提交申请 | 审批申请 |
| 考勤 | 打卡、补卡 | 查看考勤报表 |
| 文档 | 浏览文档 | 上传管理文档 |
| 待办 | 创建管理待办 | - |
| 公告 | 查看公告 | 发布管理公告 |
| 报销 | 提交报销 | 审批报销 |

## 快速开始

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 生产构建
npm run build
```

## 部署

推送 `master` 分支自动触发 GitHub Actions 部署。

## License

MIT

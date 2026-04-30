import { createRouter, createWebHashHistory } from "vue-router";

// 基础路由
const baseRoutes = [
  {
    path: "/login",
    name: "login",
    component: () => import("@/views/login/index.vue"),
    meta: {
      title: "登录",
      requiresAuth: false,
      level: 0
    }
  },
  {
    path: "/404",
    name: "404",
    component: () => import("@/views/404.vue"),
    meta: {
      title: "页面不存在",
      level: 0
    }
  }
];

// 用户端路由
const userRoutes = [
  {
    path: "/user",
    name: "userHome",
    component: () => import("@/views/home/index.vue"),
    meta: {
      title: "首页",
      requiresAuth: true,
      role: "user",
      level: 1
    }
  },
  // 会议模块
  {
    path: "/user/meeting",
    name: "userMeeting",
    component: () => import("@/views/meeting/user/index.vue"),
    meta: {
      title: "会议预定",
      requiresAuth: true,
      role: "user",
      level: 1
    }
  },
  {
    path: "/user/meeting/create",
    name: "userMeetingCreate",
    component: () => import("@/views/meeting/user/create.vue"),
    meta: {
      title: "新建预定",
      requiresAuth: true,
      role: "user",
      level: 2
    }
  },
  {
    path: "/user/meeting/my",
    name: "userMeetingMy",
    component: () => import("@/views/meeting/user/my.vue"),
    meta: {
      title: "我的预定",
      requiresAuth: true,
      role: "user",
      level: 2
    }
  },
  // 差旅模块
  {
    path: "/user/trip",
    name: "userTrip",
    component: () => import("@/views/trip/user/index.vue"),
    meta: {
      title: "我的差旅",
      requiresAuth: true,
      role: "user",
      level: 2
    }
  },
  {
    path: "/user/trip/create",
    name: "userTripCreate",
    component: () => import("@/views/trip/user/create.vue"),
    meta: {
      title: "新建差旅",
      requiresAuth: true,
      role: "user",
      level: 2
    }
  },
  // 报销模块
  {
    path: "/user/expense/create",
    name: "userExpenseCreate",
    component: () => import("@/views/expense/create.vue"),
    meta: {
      title: "填写报销单",
      requiresAuth: true,
      role: "user",
      level: 2
    }
  },
  // 请假模块
  {
    path: "/user/leave",
    name: "userLeave",
    component: () => import("@/views/leave/user/index.vue"),
    meta: {
      title: "我的请假",
      requiresAuth: true,
      role: "user",
      level: 2
    }
  },
  {
    path: "/user/leave/create",
    name: "userLeaveCreate",
    component: () => import("@/views/leave/user/create.vue"),
    meta: {
      title: "新建请假",
      requiresAuth: true,
      role: "user",
      level: 2
    }
  },
  // 打卡模块
  {
    path: "/user/attendance",
    name: "userAttendance",
    component: () => import("@/views/attendance/user/index.vue"),
    meta: {
      title: "考勤打卡",
      requiresAuth: true,
      role: "user",
      level: 2
    }
  },
  {
    path: "/user/attendance/calendar",
    name: "userAttendanceCalendar",
    component: () => import("@/views/attendance/user/calendar.vue"),
    meta: {
      title: "打卡日历",
      requiresAuth: true,
      role: "user",
      level: 2
    }
  },
  {
    path: "/user/makeup",
    name: "userMakeUp",
    component: () => import("@/views/attendance/user/makeup.vue"),
    meta: {
      title: "补卡申请",
      requiresAuth: true,
      role: "user",
      level: 2
    }
  },
  // 文档模块
  {
    path: "/user/document",
    name: "userDocument",
    component: () => import("@/views/document/user/index.vue"),
    meta: {
      title: "文档查询",
      requiresAuth: true,
      role: "user",
      level: 2
    }
  },
  // 待办模块
  {
    path: "/user/todo",
    name: "userTodo",
    component: () => import("@/views/todo/index.vue"),
    meta: {
      title: "我的待办",
      requiresAuth: true,
      role: "user",
      level: 1
    }
  },
  {
    path: "/user/todo/create",
    name: "userTodoCreate",
    component: () => import("@/views/todo/create.vue"),
    meta: {
      title: "新建待办",
      requiresAuth: true,
      role: "user",
      level: 2
    }
  },
  // 公告模块
  {
    path: "/user/announcement",
    name: "userAnnouncement",
    component: () => import("@/views/announcement/user/index.vue"),
    meta: {
      title: "公告通知",
      requiresAuth: true,
      role: "user",
      level: 1
    }
  },
  {
    path: "/user/announcement/:id",
    name: "userAnnouncementDetail",
    component: () => import("@/views/announcement/user/detail.vue"),
    meta: {
      title: "公告详情",
      requiresAuth: true,
      role: "user",
      level: 2
    }
  },
  // 设置模块
  {
    path: "/user/settings",
    name: "userSettings",
    component: () => import("@/views/settings/index.vue"),
    meta: {
      title: "设置",
      requiresAuth: true,
      role: "user",
      level: 1
    }
  },
  {
    path: "/user/settings/password",
    name: "userPassword",
    component: () => import("@/views/settings/password.vue"),
    meta: {
      title: "修改密码",
      requiresAuth: true,
      role: "user",
      level: 2
    }
  },
  // 消息中心
  {
    path: "/user/message",
    name: "userMessage",
    component: () => import("@/views/message/index.vue"),
    meta: {
      title: "消息中心",
      requiresAuth: true,
      role: "user",
      level: 1
    }
  },
  // 意见反馈
  {
    path: "/user/feedback",
    name: "userFeedback",
    component: () => import("@/views/feedback/index.vue"),
    meta: {
      title: "意见反馈",
      requiresAuth: true,
      role: "user",
      level: 2
    }
  },
  // 数据统计
  {
    path: "/user/stats",
    name: "userStats",
    component: () => import("@/views/stats/dashboard.vue"),
    meta: {
      title: "数据统计",
      requiresAuth: true,
      role: "user",
      level: 2
    }
  },
  // 知识库
  {
    path: "/user/knowledge",
    name: "userKnowledge",
    component: () => import("@/views/knowledge/index.vue"),
    meta: {
      title: "知识库",
      requiresAuth: true,
      role: "user",
      level: 1
    }
  },
  {
    path: "/user/knowledge/:id",
    name: "userKnowledgeDetail",
    component: () => import("@/views/knowledge/detail.vue"),
    meta: {
      title: "知识详情",
      requiresAuth: true,
      role: "user",
      level: 2
    }
  },
  // 会议智能推荐
  {
    path: "/user/meeting/smart",
    name: "userMeetingSmart",
    component: () => import("@/views/meeting/smart.vue"),
    meta: {
      title: "智能推荐",
      requiresAuth: true,
      role: "user",
      level: 2
    }
  },
  // 任务看板
  {
    path: "/user/task/board",
    name: "userTaskBoard",
    component: () => import("@/views/task/board.vue"),
    meta: {
      title: "任务看板",
      requiresAuth: true,
      role: "user",
      level: 1
    }
  },
  {
    path: "/user/task/create",
    name: "userTaskCreate",
    component: () => import("@/views/task/create.vue"),
    meta: {
      title: "新建任务",
      requiresAuth: true,
      role: "user",
      level: 2
    }
  },
  {
    path: "/user/task/:id",
    name: "userTaskDetail",
    component: () => import("@/views/task/detail.vue"),
    meta: {
      title: "任务详情",
      requiresAuth: true,
      role: "user",
      level: 2
    }
  }
];

// 管理员端路由
const adminRoutes = [
  {
    path: "/admin",
    name: "adminHome",
    component: () => import("@/views/home/index.vue"),
    meta: {
      title: "首页",
      requiresAuth: true,
      role: "admin",
      level: 1
    }
  },
  // 会议管理
  {
    path: "/admin/meeting",
    name: "adminMeeting",
    component: () => import("@/views/meeting/admin/index.vue"),
    meta: {
      title: "会议管理",
      requiresAuth: true,
      role: "admin",
      level: 2
    }
  },
  {
    path: "/admin/meeting/rooms",
    name: "adminMeetingRooms",
    component: () => import("@/views/meeting/admin/rooms.vue"),
    meta: {
      title: "会议室管理",
      requiresAuth: true,
      role: "admin",
      level: 2
    }
  },
  // 审批中心
  {
    path: "/admin/approval",
    name: "adminApproval",
    component: () => import("@/views/approval/index.vue"),
    meta: {
      title: "审批中心",
      requiresAuth: true,
      role: "admin",
      level: 2
    }
  },
  {
    path: "/admin/approval/trip",
    name: "adminApprovalTrip",
    component: () => import("@/views/approval/trip.vue"),
    meta: {
      title: "差旅审批",
      requiresAuth: true,
      role: "admin",
      level: 2
    }
  },
  {
    path: "/admin/approval/leave",
    name: "adminApprovalLeave",
    component: () => import("@/views/approval/leave.vue"),
    meta: {
      title: "请假审批",
      requiresAuth: true,
      role: "admin",
      level: 2
    }
  },
  {
    path: "/admin/approval/makeup",
    name: "adminApprovalMakeup",
    component: () => import("@/views/approval/makeup.vue"),
    meta: {
      title: "补卡审批",
      requiresAuth: true,
      role: "admin",
      level: 2
    }
  },
  // 文档管理
  {
    path: "/admin/document",
    name: "adminDocument",
    component: () => import("@/views/document/admin/index.vue"),
    meta: {
      title: "文档管理",
      requiresAuth: true,
      role: "admin",
      level: 2
    }
  },
  {
    path: "/admin/document/category",
    name: "adminDocumentCategory",
    component: () => import("@/views/document/admin/category.vue"),
    meta: {
      title: "分类管理",
      requiresAuth: true,
      role: "admin",
      level: 2
    }
  },
  // 考勤管理
  {
    path: "/admin/attendance",
    name: "adminAttendance",
    component: () => import("@/views/attendance/admin/index.vue"),
    meta: {
      title: "考勤管理",
      requiresAuth: true,
      role: "admin",
      level: 2
    }
  },
  {
    path: "/admin/attendance/report",
    name: "adminAttendanceReport",
    component: () => import("@/views/attendance/admin/report.vue"),
    meta: {
      title: "考勤报表",
      requiresAuth: true,
      role: "admin",
      level: 2
    }
  },
  // 公告管理
  {
    path: "/admin/announcement",
    name: "adminAnnouncement",
    component: () => import("@/views/announcement/admin/index.vue"),
    meta: {
      title: "公告管理",
      requiresAuth: true,
      role: "admin",
      level: 2
    }
  },
  {
    path: "/admin/announcement/create",
    name: "adminAnnouncementCreate",
    component: () => import("@/views/announcement/admin/create.vue"),
    meta: {
      title: "发布公告",
      requiresAuth: true,
      role: "admin",
      level: 2
    }
  }
];

// 合并所有路由
export const allRoutes = [
  ...baseRoutes,
  ...userRoutes,
  ...adminRoutes,
  {
    path: "/",
    redirect: "/login"
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/404"
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes: allRoutes,
  scrollBehavior() {
    return {
      el: "#app",
      top: 0,
      behavior: "smooth"
    };
  }
});

export default router;

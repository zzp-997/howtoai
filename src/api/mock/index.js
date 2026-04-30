import Mock from 'mockjs';

// 设置延迟响应
Mock.setup({
  timeout: '200-500'
});

// ==================== 安全相关状态 ====================
const loginFailCount = { admin: 0, user: 0 };
const loginFailTimes = {}; // 记录失败时间戳，用于超时重置
const lockedAccounts = {};
const LOCK_THRESHOLD = 5;
const LOCK_DURATION = 900; // 15分钟 = 900秒
const FAIL_COUNT_EXPIRE = 30 * 60 * 1000; // 失败计数30分钟后失效

// IP白名单
const IP_WHITELIST = ['10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16', '127.0.0.1'];

// 密码过期状态模拟
const passwordExpiryState = {
  admin: { isExpired: false, daysRemaining: 45, isExpiringSoon: false, requireChange: false },
  user: { isExpired: false, daysRemaining: 3, isExpiringSoon: true, requireChange: false }
};

// 密码历史（用于防止重复使用最近5次密码）
const passwordHistory = {
  admin: [],
  user: []
};

// 弱密码黑名单
const WEAK_PASSWORDS = [
  '123456', 'password', '12345678', 'qwerty', 'abc123', 'monkey', '1234567',
  'letmein', 'trustno1', 'dragon', 'baseball', 'iloveyou', 'master', 'sunshine',
  'ashley', 'bailey', 'passw0rd', 'shadow', '123123', '654321', 'superman',
  'qazwsx', 'michael', 'football', 'password1', 'password123', 'welcome'
];

// 限流计数器 - 使用真实IP
const rateLimitCounters = {};
const RATE_LIMITS = {
  global: { max: 1000, window: 60 },
  user: { max: 100, window: 60 },
  login: { max: 10, window: 60 },
  sensitive: { max: 20, window: 3600 },
  sms: { max: 5, window: 3600 }
};

// Token黑名单
const tokenBlacklist = new Set();

// 设备Token映射（单设备登录）
const deviceTokens = {}; // { userId: token }

// 当前登录用户
const currentLoginUser = {};

// 操作日志存储
const operationLogs = [];

/**
 * 添加操作日志
 * @param {Object} log 日志对象
 */
function addOperationLog(log) {
  operationLogs.unshift({
    id: operationLogs.length + 1,
    user_id: log.user_id || null,
    username: log.username || null,
    action: log.action,
    module: log.module,
    detail: log.detail || null,
    ip_address: log.ip_address || '127.0.0.1',
    user_agent: log.user_agent || 'Mozilla/5.0',
    status: log.status,
    created_at: new Date().toISOString()
  });
}

/**
 * 从请求中获取真实IP
 */
function getRealIP(options) {
  // 优先从请求头获取
  const headers = options.headers || {};
  const forwarded = headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIP = headers['x-real-ip'];
  if (realIP) {
    return realIP;
  }
  // 降级使用随机IP（开发环境）
  return '127.0.0.1';
}

/**
 * 获取用户Token
 */
function getAuthToken(options) {
  const headers = options.headers || {};
  const auth = headers['authorization'] || headers['Authorization'];
  if (auth && auth.startsWith('Bearer ')) {
    return auth.substring(7);
  }
  return null;
}

/**
 * 检查Token是否在黑名单
 */
function isTokenBlacklisted(token) {
  return tokenBlacklist.has(token);
}

/**
 * 检查限流
 */
function checkRateLimit(key, limit) {
  const now = Date.now();
  if (!rateLimitCounters[key]) {
    rateLimitCounters[key] = { count: 0, resetAt: now + limit.window * 1000 };
  }
  const counter = rateLimitCounters[key];
  if (now > counter.resetAt) {
    counter.count = 0;
    counter.resetAt = now + limit.window * 1000;
  }
  counter.count++;
  return counter.count > limit.max;
}

/**
 * 获取限流响应头信息
 */
function getRateLimitHeaders(key, limit) {
  const counter = rateLimitCounters[key];
  if (!counter) {
    return {
      'X-RateLimit-Limit': limit.max,
      'X-RateLimit-Remaining': limit.max,
      'X-RateLimit-Reset': Math.ceil((Date.now() + limit.window * 1000) / 1000)
    };
  }
  return {
    'X-RateLimit-Limit': limit.max,
    'X-RateLimit-Remaining': Math.max(0, limit.max - counter.count),
    'X-RateLimit-Reset': Math.ceil(counter.resetAt / 1000)
  };
}

/**
 * 获取限流剩余秒数
 */
function getRateLimitRetryAfter(key) {
  const counter = rateLimitCounters[key];
  if (!counter) return 60;
  return Math.max(1, Math.ceil((counter.resetAt - Date.now()) / 1000));
}

/**
 * 检查IP是否在白名单中
 */
function isIPWhitelisted(ip) {
  return IP_WHITELIST.some(white => {
    if (white.includes('/')) {
      // 简化处理：CIDR格式暂不支持精确匹配，仅用于提示
      return false;
    }
    return white === ip;
  });
}

// ==================== 登录接口 ====================
Mock.mock(/\/api\/v1\/auth\/login/, 'post', (options) => {
  // 获取真实IP用于限流
  const clientIP = getRealIP(options);

  // 检查IP是否在白名单中，跳过限流检查
  const isWhitelisted = isIPWhitelisted(clientIP);

  // 检查全局限流 - 使用真实IP（白名单IP跳过）
  const globalKey = 'global_' + clientIP;
  if (!isWhitelisted && checkRateLimit(globalKey, RATE_LIMITS.global)) {
    const rateLimitHeaders = getRateLimitHeaders(globalKey, RATE_LIMITS.global);
    const retryAfter = getRateLimitRetryAfter(globalKey);
    return {
      code: 429,
      message: '请求过于频繁，请稍后再试',
      headers: {
        'X-RateLimit-Limit': rateLimitHeaders['X-RateLimit-Limit'],
        'X-RateLimit-Remaining': rateLimitHeaders['X-RateLimit-Remaining'],
        'X-RateLimit-Reset': rateLimitHeaders['X-RateLimit-Reset'],
        'Retry-After': retryAfter
      },
      data: {
        retryAfter,
        limit_type: 'global_per_minute',
        current_count: rateLimitCounters[globalKey]?.count || 0,
        limit: RATE_LIMITS.global.max,
        // 标准限流响应头
        'X-RateLimit-Limit': rateLimitHeaders['X-RateLimit-Limit'],
        'X-RateLimit-Remaining': rateLimitHeaders['X-RateLimit-Remaining'],
        'X-RateLimit-Reset': rateLimitHeaders['X-RateLimit-Reset']
      }
    };
  }

  // 检查登录接口限流 - 使用真实IP（白名单IP跳过）
  const loginKey = 'login_' + clientIP;
  if (!isWhitelisted && checkRateLimit(loginKey, RATE_LIMITS.login)) {
    const rateLimitHeaders = getRateLimitHeaders(loginKey, RATE_LIMITS.login);
    const retryAfter = getRateLimitRetryAfter(loginKey);
    return {
      code: 429,
      message: '登录尝试过于频繁，请稍后再试',
      headers: {
        'X-RateLimit-Limit': rateLimitHeaders['X-RateLimit-Limit'],
        'X-RateLimit-Remaining': rateLimitHeaders['X-RateLimit-Remaining'],
        'X-RateLimit-Reset': rateLimitHeaders['X-RateLimit-Reset'],
        'Retry-After': retryAfter
      },
      data: {
        retryAfter,
        limit_type: 'login_per_minute',
        current_count: rateLimitCounters[loginKey]?.count || 0,
        limit: RATE_LIMITS.login.max,
        // 标准限流响应头
        'X-RateLimit-Limit': rateLimitHeaders['X-RateLimit-Limit'],
        'X-RateLimit-Remaining': rateLimitHeaders['X-RateLimit-Remaining'],
        'X-RateLimit-Reset': rateLimitHeaders['X-RateLimit-Reset']
      }
    };
  }

  const body = JSON.parse(options.body);
  const { username, password } = body;

  // 检查失败计数是否超时（30分钟），超时则重置
  const lastFailTime = loginFailTimes[username];
  if (lastFailTime && (Date.now() - lastFailTime > FAIL_COUNT_EXPIRE)) {
    loginFailCount[username] = 0;
    delete loginFailTimes[username];
  }

  // 检查账户是否被锁定
  if (lockedAccounts[username]) {
    const lockInfo = lockedAccounts[username];
    const remainingSeconds = Math.max(0, Math.ceil((lockInfo.lockedUntil - Date.now()) / 1000));
    const remainingMinutes = Math.ceil(remainingSeconds / 60);

    if (remainingSeconds > 0) {
      return {
        code: 403,
        message: `账户已锁定，请${remainingMinutes}分钟后重试`,
        data: {
          is_locked: true,
          locked_minutes: remainingMinutes,
          remainingSeconds,
          lockDuration: LOCK_DURATION
        }
      };
    } else {
      // 锁定已过期，自动解锁
      delete lockedAccounts[username];
      loginFailCount[username] = 0;
    }
  }

  // 模拟登录验证
  const validUsers = {
    admin: { password: '123456', role: 'admin', id: 1, name: '管理员', department: '技术部', position: '技术总监', avatar: 'https://tdesign.gtimg.com/site/avatar.jpg', annualLeaveBalance: 10, sickLeaveBalance: 5 },
    user: { password: '123456', role: 'user', id: 2, name: '普通用户', department: '产品部', position: '产品经理', avatar: 'https://tdesign.gtimg.com/site/avatar.jpg', annualLeaveBalance: 7, sickLeaveBalance: 3 }
  };

  const user = validUsers[username];

  if (user && user.password === password) {
    // 登录成功，重置失败计数
    loginFailCount[username] = 0;

    // 生成Token
    const token = Mock.Random.guid() + Mock.Random.guid();
    const refreshToken = Mock.Random.guid() + Mock.Random.guid();

    // 单设备登录：踢掉之前的设备
    if (deviceTokens[user.id]) {
      const oldToken = deviceTokens[user.id];
      tokenBlacklist.add(oldToken);
    }
    deviceTokens[user.id] = token;

    // 记录当前登录用户
    currentLoginUser[token] = { ...user, username };

    // 记录登录成功操作日志
    addOperationLog({
      user_id: user.id,
      username: username,
      action: 'login',
      module: 'auth',
      detail: { method: 'password', role: user.role },
      ip_address: clientIP,
      status: 'success'
    });

    return {
      code: 200,
      message: '登录成功',
      data: {
        token,
        refreshToken,
        tokenType: 'Bearer',
        expiresIn: 7200,
        refreshExpiresIn: 604800,
        user: {
          id: user.id,
          username,
          name: user.name,
          role: user.role,
          department: user.department,
          position: user.position,
          avatar: user.avatar,
          annualLeaveBalance: user.annualLeaveBalance,
          sickLeaveBalance: user.sickLeaveBalance
        },
        passwordStatus: passwordExpiryState[username] || { isExpired: false, daysRemaining: 90, isExpiringSoon: false, requireChange: false }
      }
    };
  }

  // 登录失败，增加计数并记录时间戳
  loginFailCount[username] = (loginFailCount[username] || 0) + 1;
  loginFailTimes[username] = Date.now();
  const remaining = LOCK_THRESHOLD - loginFailCount[username];

  if (remaining <= 0) {
    // 锁定账户
    lockedAccounts[username] = {
      lockedUntil: Date.now() + LOCK_DURATION * 1000,
      failCount: loginFailCount[username]
    };

    // 记录账户被锁定日志
    addOperationLog({
      user_id: null,
      username: username,
      action: 'login',
      module: 'auth',
      detail: { reason: 'account_locked', failCount: loginFailCount[username] },
      ip_address: clientIP,
      status: 'failed'
    });

    return {
      code: 403,
      message: '账户已锁定，请15分钟后重试',
      data: {
        is_locked: true,
        locked_minutes: 15,
        remainingSeconds: LOCK_DURATION,
        lockDuration: LOCK_DURATION
      }
    };
  }

  // 记录登录失败日志（用户名或密码错误）
  addOperationLog({
    user_id: null,
    username: username,
    action: 'login',
    module: 'auth',
    detail: { reason: 'invalid_password', remain_attempts: remaining },
    ip_address: clientIP,
    status: 'failed'
  });

  return {
    code: 401,
    message: `用户名或密码错误，还剩${remaining}次尝试机会`,
    data: {
      remain_attempts: remaining
    }
  };
});

// ==================== Token刷新接口 ====================
Mock.mock(/\/api\/v1\/auth\/refresh/, 'post', (options) => {
  const body = JSON.parse(options.body);
  const { refreshToken } = body;

  if (!refreshToken) {
    return {
      code: 401,
      message: '无效的刷新令牌',
      error_code: 'INVALID_REFRESH_TOKEN',
      data: null
    };
  }

  // 检查Token是否在黑名单
  if (isTokenBlacklisted(refreshToken)) {
    return {
      code: 401,
      message: '登录已过期，请重新登录',
      error_code: 'TOKEN_REVOKED',
      data: null
    };
  }

  // 生成新Token
  const newToken = Mock.Random.guid() + Mock.Random.guid();
  const newRefreshToken = Mock.Random.guid() + Mock.Random.guid();

  // 将旧refreshToken加入黑名单（Token轮换）
  tokenBlacklist.add(refreshToken);

  // 模拟：根据refreshToken获取用户信息（实际应该从token解析）
  const userId = 1; // 简化处理
  if (deviceTokens[userId]) {
    const oldToken = deviceTokens[userId];
    tokenBlacklist.add(oldToken);
  }
  deviceTokens[userId] = newToken;

  return {
    code: 200,
    message: '刷新成功',
    data: {
      token: newToken,
      refreshToken: newRefreshToken,
      tokenType: 'Bearer',
      expiresIn: 7200,
      refreshExpiresIn: 604800
    }
  };
});

// ==================== 获取用户信息 ====================
Mock.mock(/\/api\/v1\/auth\/me/, 'get', () => {
  return {
    code: 200,
    message: '获取成功',
    data: {
      id: 1,
      username: 'admin',
      name: '管理员',
      role: 'admin',
      department: '技术部',
      position: '技术总监',
      avatar: 'https://tdesign.gtimg.com/site/avatar.jpg',
      annualLeaveBalance: 10,
      sickLeaveBalance: 5
    }
  };
});

// ==================== 登出接口 ====================
Mock.mock(/\/api\/v1\/auth\/logout/, 'post', () => {
  return {
    code: 200,
    message: '登出成功',
    data: null
  };
});

// ==================== 密码强度校验 ====================
Mock.mock(/\/api\/v1\/auth\/password\/validate/, 'post', (options) => {
  const body = JSON.parse(options.body);
  const { password } = body;

  if (!password) {
    return {
      code: 400,
      message: '密码不能为空',
      data: null
    };
  }

  const errors = [];
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };

  if (!checks.length) errors.push('密码长度至少8位');
  if (!checks.uppercase) errors.push('需包含大写字母');
  if (!checks.lowercase) errors.push('需包含小写字母');
  if (!checks.number) errors.push('需包含数字');

  // 计算强度等级
  const passedCount = Object.values(checks).filter(Boolean).length;
  let level = 0;
  if (passedCount >= 4 && checks.length) level = 1;
  if (passedCount >= 4 && checks.length && (checks.uppercase && checks.lowercase) && (checks.number || checks.special)) level = 2;
  if (passedCount === 5 && checks.length) level = 3;

  return {
    code: 200,
    message: '校验完成',
    data: {
      level,
      checks,
      errors,
      score: passedCount
    }
  };
});

// ==================== 密码过期状态 ====================
Mock.mock(/\/api\/v1\/auth\/password\/expiry/, 'get', () => {
  return {
    code: 200,
    message: '获取成功',
    data: {
      isExpired: false,
      daysRemaining: 45,
      isExpiringSoon: false,
      lastChangedAt: '2026-02-01T00:00:00Z'
    }
  };
});

// ==================== 密码建议 ====================
Mock.mock(/\/api\/v1\/auth\/password\/suggestions/, 'get', () => {
  return {
    code: 200,
    message: '获取成功',
    data: {
      suggestions: [
        '建议使用大小写字母、数字和特殊字符的组合',
        '密码长度至少8位，建议12位以上',
        '避免使用生日、电话号码等个人信息',
        '不要使用与其他网站相同的密码',
        '定期更换密码，建议每90天更换一次'
      ]
    }
  };
});

// ==================== 修改密码 ====================
Mock.mock(/\/api\/v1\/auth\/password\/change/, 'post', (options) => {
  const body = JSON.parse(options.body);
  const { oldPassword, newPassword } = body;

  if (!oldPassword || !newPassword) {
    return {
      code: 400,
      message: '请填写完整信息',
      data: null
    };
  }

  // 校验旧密码
  if (oldPassword !== '123456') {
    return {
      code: 400,
      message: '当前密码不正确',
      data: null
    };
  }

  // 校验新密码强度
  if (newPassword.length < 8) {
    return {
      code: 400,
      message: '新密码长度至少8位',
      data: null
    };
  }

  // 校验是否与历史密码相同
  if (passwordHistory.admin.includes(newPassword) || passwordHistory.user.includes(newPassword)) {
    return {
      code: 400,
      message: '新密码不能与最近5次密码相同',
      data: null
    };
  }

  // 记录密码历史
  const username = 'admin'; // mock 环境
  if (!passwordHistory[username]) passwordHistory[username] = [];
  passwordHistory[username].unshift(newPassword);
  if (passwordHistory[username].length > 5) passwordHistory[username].pop();

  return {
    code: 200,
    message: '密码修改成功',
    data: null
  };
});

// ==================== 操作日志查询接口 ====================
Mock.mock(/\/api\/v1\/operation-logs/, 'get', (options) => {
  // 解析URL参数
  const url = options.url || '';
  const params = {};
  if (url.includes('?')) {
    const queryString = url.split('?')[1];
    queryString.split('&').forEach(param => {
      const [key, value] = param.split('=');
      params[key] = decodeURIComponent(value || '');
    });
  }

  const { page = 1, size = 20, user_id, action, module, start_date, end_date } = params;

  let filtered = [...operationLogs];

  // 筛选条件
  if (user_id) {
    filtered = filtered.filter(log => String(log.user_id) === String(user_id));
  }
  if (action) {
    filtered = filtered.filter(log => log.action === action);
  }
  if (module) {
    filtered = filtered.filter(log => log.module === module);
  }
  if (start_date) {
    filtered = filtered.filter(log => log.created_at >= start_date);
  }
  if (end_date) {
    filtered = filtered.filter(log => log.created_at <= end_date);
  }

  const total = filtered.length;
  const pageNum = parseInt(page) || 1;
  const pageSize = parseInt(size) || 20;
  const list = filtered.slice((pageNum - 1) * pageSize, pageNum * pageSize);

  return {
    code: 200,
    message: '获取成功',
    data: {
      list,
      total,
      page: pageNum,
      size: pageSize
    }
  };
});

// ==================== 管理员解锁账户接口 ====================
Mock.mock(/\/api\/v1\/auth\/unlock/, 'post', (options) => {
  const body = JSON.parse(options.body);
  const { username } = body;

  if (!username) {
    return {
      code: 400,
      message: '用户名不能为空',
      data: null
    };
  }

  // 检查账户是否被锁定
  if (lockedAccounts[username]) {
    delete lockedAccounts[username];
    loginFailCount[username] = 0;
    delete loginFailTimes[username];

    // 记录解锁操作日志
    addOperationLog({
      user_id: 1, // 管理员ID
      username: 'admin',
      action: 'unlock',
      module: 'auth',
      detail: { target_user: username, reason: 'admin_manual_unlock' },
      ip_address: '127.0.0.1',
      status: 'success'
    });

    return {
      code: 200,
      message: '账户已解锁',
      data: null
    };
  }

  return {
    code: 400,
    message: '账户未被锁定',
    data: null
  };
});

// ==================== 短信验证码相关 ====================
const smsCodeCounters = {}; // { phone: { count: 0, resetAt: timestamp } }
const SMS_CODE_EXPIRE = 5 * 60 * 1000; // 5分钟有效期
const SMS_CODE_MAX_PER_HOUR = 5; // 每小时最多发送5次

// 验证码存储（实际应该存储加密后的验证码）
const smsCodes = {}; // { phone: { code: '123456', expiresAt: timestamp } }

// 短信验证码发送接口
Mock.mock(/\/api\/v1\/auth\/sms\/send/, 'post', (options) => {
  const body = JSON.parse(options.body);
  const { phone } = body;

  if (!phone) {
    return {
      code: 400,
      message: '手机号不能为空',
      data: null
    };
  }

  // 简单手机号格式校验
  if (!/^1[3-9]\d{9}$/.test(phone)) {
    return {
      code: 400,
      message: '手机号格式不正确',
      data: null
    };
  }

  // 检查频率限制
  const now = Date.now();
  if (!smsCodeCounters[phone]) {
    smsCodeCounters[phone] = { count: 0, resetAt: now + 3600 * 1000 };
  }

  const counter = smsCodeCounters[phone];
  if (now > counter.resetAt) {
    counter.count = 0;
    counter.resetAt = now + 3600 * 1000;
  }

  if (counter.count >= SMS_CODE_MAX_PER_HOUR) {
    return {
      code: 429,
      message: '验证码获取次数已达上限，请1小时后再试',
      data: { retryAfter: Math.ceil((counter.resetAt - now) / 1000) }
    };
  }

  counter.count++;

  // 生成6位验证码
  const code = '123456';
  smsCodes[phone] = {
    code: code,
    expiresAt: now + SMS_CODE_EXPIRE
  };

  // 模拟发送验证码（实际会调用短信服务）
  console.log(`[SMS] 验证码发送到 ${phone}: ${code}`);

  // 记录发送日志
  addOperationLog({
    user_id: null,
    username: phone,
    action: 'sms_send',
    module: 'auth',
    detail: { phone, purpose: 'verification' },
    ip_address: '127.0.0.1',
    status: 'success'
  });

  return {
    code: 200,
    message: '验证码已发送',
    data: { expireIn: 300 }
  };
});

// 短信验证码验证接口
Mock.mock(/\/api\/v1\/auth\/sms\/verify/, 'post', (options) => {
  const body = JSON.parse(options.body);
  const { phone, code } = body;

  if (!phone || !code) {
    return {
      code: 400,
      message: '手机号和验证码不能为空',
      data: null
    };
  }

  const stored = smsCodes[phone];

  if (!stored) {
    return {
      code: 400,
      message: '请先获取验证码',
      data: null
    };
  }

  // 检查是否过期
  if (Date.now() > stored.expiresAt) {
    delete smsCodes[phone];
    return {
      code: 400,
      message: '验证码已过期，请重新获取',
      data: null
    };
  }

  // 验证验证码（简化处理：接受123456）
  if (code === stored.code) {
    // 验证成功后删除验证码（一次性使用）
    delete smsCodes[phone];

    return {
      code: 200,
      message: '验证成功',
      data: null
    };
  }

  return {
    code: 400,
    message: '验证码错误',
    data: null
  };
});

// ==================== 审批链配置Mock数据 ====================
const approvalChains = [
  { id: 1, type: 'trip', name: '差旅申请审批链', nodes: [{ order: 1, type: 'role', value: 'department_manager', mode: 'or' }, { order: 2, type: 'role', value: 'finance_director', mode: 'or' }], created_at: '2026-04-01T00:00:00Z', updated_at: '2026-04-01T00:00:00Z' },
  { id: 2, type: 'leave', name: '请假申请审批链', nodes: [{ order: 1, type: 'role', value: 'department_manager', mode: 'or' }, { order: 2, type: 'role', value: 'hr_manager', mode: 'or' }], created_at: '2026-04-01T00:00:00Z', updated_at: '2026-04-01T00:00:00Z' },
  { id: 3, type: 'expense', name: '报销申请审批链', nodes: [{ order: 1, type: 'role', value: 'department_manager', mode: 'or' }, { order: 2, type: 'role', value: 'finance_director', mode: 'or' }, { order: 3, type: 'role', value: 'cashier', mode: 'or' }], created_at: '2026-04-01T00:00:00Z', updated_at: '2026-04-01T00:00:00Z' }
];

// ==================== 审批记录Mock数据 ====================
const approvalRecords = [
  { id: 1, type: 'trip', title: '北京出差申请', applicant_id: 2, applicant_name: '普通用户', status: 'pending', current_node: 1, chain_id: 1, amount: 5000, created_at: '2026-04-30T10:00:00Z', updated_at: '2026-04-30T10:00:00Z' },
  { id: 2, type: 'leave', title: '年假申请', applicant_id: 2, applicant_name: '普通用户', status: 'approved', current_node: 2, chain_id: 2, days: 3, created_at: '2026-04-29T10:00:00Z', updated_at: '2026-04-30T10:00:00Z' },
  { id: 3, type: 'trip', title: '上海出差申请', applicant_id: 2, applicant_name: '普通用户', status: 'rejected', current_node: 1, chain_id: 1, amount: 3000, reject_reason: '预算超标', created_at: '2026-04-28T10:00:00Z', updated_at: '2026-04-29T10:00:00Z' },
  { id: 4, type: 'expense', title: '办公用品报销', applicant_id: 1, applicant_name: '管理员', status: 'pending', current_node: 1, chain_id: 3, amount: 1500, created_at: '2026-04-30T11:00:00Z', updated_at: '2026-04-30T11:00:00Z' },
  { id: 5, type: 'leave', title: '病假申请', applicant_id: 1, applicant_name: '管理员', status: 'approved', current_node: 2, chain_id: 2, days: 1, created_at: '2026-04-27T10:00:00Z', updated_at: '2026-04-28T10:00:00Z' }
];

// 审批节点记录
const approvalNodes = [
  { id: 1, approval_id: 1, node_order: 1, status: 'pending', approver_id: null, approver_name: null, comment: null, acted_at: null },
  { id: 2, approval_id: 2, node_order: 1, status: 'approved', approver_id: 1, approver_name: '管理员', comment: '同意', acted_at: '2026-04-29T14:00:00Z' },
  { id: 3, approval_id: 2, node_order: 2, status: 'approved', approver_id: 1, approver_name: '管理员', comment: '已备案', acted_at: '2026-04-30T10:00:00Z' },
  { id: 4, approval_id: 3, node_order: 1, status: 'rejected', approver_id: 1, approver_name: '管理员', comment: '预算超标', acted_at: '2026-04-29T10:00:00Z' }
];

// 催办记录
const reminders = [];

// ==================== 消息通知Mock数据 ====================
const messages = [
  { id: 1, user_id: 1, type: 'approval', title: '新的差旅审批', content: '您有一个新的差旅申请需要审批', is_read: false, related_id: 1, related_type: 'trip', created_at: '2026-04-30T10:00:00Z' },
  { id: 2, user_id: 1, type: 'approval', title: '审批通过', content: '您的请假申请已通过审批', is_read: true, related_id: 2, related_type: 'leave', created_at: '2026-04-30T10:00:00Z' },
  { id: 3, user_id: 1, type: 'approval', title: '审批被拒绝', content: '您的差旅申请被拒绝', is_read: true, related_id: 3, related_type: 'trip', created_at: '2026-04-29T10:00:00Z' },
  { id: 4, user_id: 2, type: 'system', title: '系统公告', content: '五一劳动节放假安排', is_read: false, related_id: null, related_type: null, created_at: '2026-04-30T09:00:00Z' },
  { id: 5, user_id: 1, type: 'reminder', title: '审批催办', content: '申请人催促您尽快审批', is_read: false, related_id: 1, related_type: 'trip', created_at: '2026-04-30T11:00:00Z' }
];

// ==================== 意见反馈Mock数据 ====================
// 状态流转：待处理(pending) → 处理中(processing) → 已回复(replied) → 已关闭(closed)
// 反馈类型：功能建议 / 问题反馈 / 其他
const feedbacks = [
  {
    id: 1,
    userId: 2,
    userName: '普通用户',
    type: '功能建议',
    title: '建议优化审批流程',
    content: '希望审批流程可以更简洁一些，增加批量审批功能',
    images: '[]',
    status: 'pending',
    createdAt: '2026-04-28T10:00:00Z',
    updatedAt: '2026-04-28T10:00:00Z'
  },
  {
    id: 2,
    userId: 2,
    userName: '普通用户',
    type: '问题反馈',
    title: '系统反应慢',
    content: '页面加载速度较慢，尤其是在审批列表页面',
    images: '["https://example.com/image1.png"]',
    status: 'processing',
    createdAt: '2026-04-27T10:00:00Z',
    updatedAt: '2026-04-29T10:00:00Z'
  },
  {
    id: 3,
    userId: 1,
    userName: '管理员',
    type: '功能建议',
    title: '增加批量操作功能',
    content: '希望增加批量操作功能，提高工作效率',
    images: '[]',
    status: 'replied',
    createdAt: '2026-04-25T10:00:00Z',
    updatedAt: '2026-04-26T10:00:00Z'
  },
  {
    id: 4,
    userId: 2,
    userName: '普通用户',
    type: '其他',
    title: '界面优化建议',
    content: '建议首页布局调整一下',
    images: '[]',
    status: 'closed',
    createdAt: '2026-04-20T10:00:00Z',
    updatedAt: '2026-04-22T10:00:00Z'
  }
];

// 反馈回复数据
const feedbackReplies = [
  { id: 1, feedbackId: 3, userId: 1, userName: '管理员', content: '感谢您的建议，我们会在下个版本中实现此功能。', createdAt: '2026-04-26T10:00:00Z' },
  { id: 2, feedbackId: 4, userId: 1, userName: '管理员', content: '已关闭，感谢反馈。', createdAt: '2026-04-22T10:00:00Z' }
];

// ==================== 审批链配置接口 ====================
Mock.mock(/\/api\/v1\/approval-chains/, 'get', () => {
  return { code: 200, message: '获取成功', data: { list: approvalChains, total: approvalChains.length } };
});

Mock.mock(/\/api\/v1\/approval-chains\/(\d+)/, 'get', (options) => {
  const id = parseInt(options.url.match(/\/api\/v1\/approval-chains\/(\d+)/)[1]);
  const chain = approvalChains.find(c => c.id === id);
  return chain ? { code: 200, message: '获取成功', data: chain } : { code: 404, message: '审批链不存在', data: null };
});

Mock.mock(/\/api\/v1\/approval-chains/, 'post', (options) => {
  const body = JSON.parse(options.body);
  const newChain = { id: approvalChains.length + 1, ...body, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
  approvalChains.push(newChain);
  return { code: 200, message: '创建成功', data: newChain };
});

Mock.mock(/\/api\/v1\/approval-chains\/(\d+)/, 'put', (options) => {
  const id = parseInt(options.url.match(/\/api\/v1\/approval-chains\/(\d+)/)[1]);
  const body = JSON.parse(options.body);
  const index = approvalChains.findIndex(c => c.id === id);
  if (index !== -1) { approvalChains[index] = { ...approvalChains[index], ...body, updated_at: new Date().toISOString() }; return { code: 200, message: '更新成功', data: approvalChains[index] }; }
  return { code: 404, message: '审批链不存在', data: null };
});

Mock.mock(/\/api\/v1\/approval-chains\/(\d+)/, 'delete', (options) => {
  const id = parseInt(options.url.match(/\/api\/v1\/approval-chains\/(\d+)/)[1]);
  const index = approvalChains.findIndex(c => c.id === id);
  if (index !== -1) { approvalChains.splice(index, 1); return { code: 200, message: '删除成功', data: null }; }
  return { code: 404, message: '审批链不存在', data: null };
});

// ==================== 审批记录接口 ====================
Mock.mock(/\/api\/v1\/approvals/, 'get', (options) => {
  const url = options.url || ''; const params = {}; let filtered = [...approvalRecords];
  if (url.includes('?')) { const queryString = url.split('?')[1]; queryString.split('&').forEach(p => { const [k, v] = p.split('='); params[k] = decodeURIComponent(v || ''); }); }
  const { type, status, page = 1, size = 20 } = params;
  if (type) filtered = filtered.filter(r => r.type === type);
  if (status) filtered = filtered.filter(r => r.status === status);
  const total = filtered.length;
  const list = filtered.slice((parseInt(page) - 1) * parseInt(size), parseInt(page) * parseInt(size));
  return { code: 200, message: '获取成功', data: { list, total, page: parseInt(page), size: parseInt(size) } };
});

Mock.mock(/\/api\/v1\/approvals\/pending/, 'get', () => {
  const pending = approvalRecords.filter(r => r.status === 'pending');
  return { code: 200, message: '获取成功', data: { list: pending, total: pending.length } };
});

Mock.mock(/\/api\/v1\/approvals\/(\d+)/, 'get', (options) => {
  const id = parseInt(options.url.match(/\/api\/v1\/approvals\/(\d+)/)[1]);
  const record = approvalRecords.find(r => r.id === id);
  if (!record) return { code: 404, message: '审批记录不存在', data: null };
  const nodes = approvalNodes.filter(n => n.approval_id === id);
  return { code: 200, message: '获取成功', data: { ...record, nodes } };
});

// 审批操作接口
Mock.mock(/\/api\/v1\/approvals\/(\d+)\/approve/, 'post', (options) => {
  const id = parseInt(options.url.match(/\/api\/v1\/approvals\/(\d+)\/approve/)[1]);
  const body = JSON.parse(options.body);
  const record = approvalRecords.find(r => r.id === id);
  if (!record) return { code: 404, message: '审批记录不存在', data: null };
  record.status = 'approved'; record.updated_at = new Date().toISOString();
  // 添加节点记录
  approvalNodes.push({ id: approvalNodes.length + 1, approval_id: id, node_order: record.current_node, status: 'approved', approver_id: 1, approver_name: '管理员', comment: body.comment, acted_at: new Date().toISOString() });
  // 发送消息通知
  messages.unshift({ id: messages.length + 1, user_id: record.applicant_id, type: 'approval', title: '审批通过', content: `您的${record.title}已通过审批`, is_read: false, related_id: record.id, related_type: record.type, created_at: new Date().toISOString() });
  return { code: 200, message: '审批通过', data: record };
});

Mock.mock(/\/api\/v1\/approvals\/(\d+)\/reject/, 'post', (options) => {
  const id = parseInt(options.url.match(/\/api\/v1\/approvals\/(\d+)\/reject/)[1]);
  const body = JSON.parse(options.body);
  const record = approvalRecords.find(r => r.id === id);
  if (!record) return { code: 404, message: '审批记录不存在', data: null };
  record.status = 'rejected'; record.reject_reason = body.reason; record.updated_at = new Date().toISOString();
  approvalNodes.push({ id: approvalNodes.length + 1, approval_id: id, node_order: record.current_node, status: 'rejected', approver_id: 1, approver_name: '管理员', comment: body.reason, acted_at: new Date().toISOString() });
  messages.unshift({ id: messages.length + 1, user_id: record.applicant_id, type: 'approval', title: '审批被拒绝', content: `您的${record.title}被拒绝`, is_read: false, related_id: record.id, related_type: record.type, created_at: new Date().toISOString() });
  return { code: 200, message: '审批拒绝', data: record };
});

// 批量审批接口
Mock.mock(/\/api\/v1\/approvals\/batch-approve/, 'post', (options) => {
  const body = JSON.parse(options.body);
  const { ids, comment } = body;
  const results = [];
  ids.forEach(id => {
    const record = approvalRecords.find(r => r.id === id);
    if (record && record.status === 'pending') { record.status = 'approved'; record.updated_at = new Date().toISOString(); results.push({ id, status: 'approved' }); }
    else results.push({ id, status: 'failed', reason: '记录不存在或已处理' });
  });
  return { code: 200, message: `成功审批${results.filter(r => r.status === 'approved').length}条`, data: { results } };
});

Mock.mock(/\/api\/v1\/approvals\/batch-reject/, 'post', (options) => {
  const body = JSON.parse(options.body);
  const { ids, reason } = body;
  const results = [];
  ids.forEach(id => {
    const record = approvalRecords.find(r => r.id === id);
    if (record && record.status === 'pending') { record.status = 'rejected'; record.reject_reason = reason; record.updated_at = new Date().toISOString(); results.push({ id, status: 'rejected' }); }
    else results.push({ id, status: 'failed', reason: '记录不存在或已处理' });
  });
  return { code: 200, message: `成功拒绝${results.filter(r => r.status === 'rejected').length}条`, data: { results } };
});

// 催办接口
Mock.mock(/\/api\/v1\/approvals\/(\d+)\/remind/, 'post', (options) => {
  const id = parseInt(options.url.match(/\/api\/v1\/approvals\/(\d+)\/remind/)[1]);
  const record = approvalRecords.find(r => r.id === id);
  if (!record) return { code: 404, message: '审批记录不存在', data: null };
  // 检查催办频率
  const existingReminders = reminders.filter(r => r.approval_id === id && Date.now() - new Date(r.created_at).getTime() < 4 * 60 * 60 * 1000);
  if (existingReminders.length >= 3) return { code: 400, message: '催办次数已达上限', data: null };
  reminders.push({ id: reminders.length + 1, approval_id: id, created_at: new Date().toISOString() });
  messages.unshift({ id: messages.length + 1, user_id: 1, type: 'reminder', title: '审批催办', content: `申请人催促您尽快审批：${record.title}`, is_read: false, related_id: record.id, related_type: record.type, created_at: new Date().toISOString() });
  return { code: 200, message: '催办成功', data: null };
});

// ==================== 消息通知接口 ====================
Mock.mock(/\/api\/v1\/messages/, 'get', (options) => {
  const url = options.url || ''; const params = {}; let filtered = [...messages];
  if (url.includes('?')) { const queryString = url.split('?')[1]; queryString.split('&').forEach(p => { const [k, v] = p.split('='); params[k] = decodeURIComponent(v || ''); }); }
  const { type, is_read, page = 1, size = 20, user_id } = params;
  if (user_id) filtered = filtered.filter(m => m.user_id === parseInt(user_id));
  if (type) filtered = filtered.filter(m => m.type === type);
  if (is_read !== undefined) filtered = filtered.filter(m => String(m.is_read) === is_read);
  const total = filtered.length;
  const list = filtered.slice((parseInt(page) - 1) * parseInt(size), parseInt(page) * parseInt(size));
  return { code: 200, message: '获取成功', data: { list, total, page: parseInt(page), size: parseInt(size) } };
});

Mock.mock(/\/api\/v1\/messages\/unread-count/, 'get', () => {
  const count = messages.filter(m => !m.is_read && m.user_id === 1).length;
  return { code: 200, message: '获取成功', data: { count } };
});

Mock.mock(/\/api\/v1\/messages\/(\d+)\/read/, 'post', (options) => {
  const id = parseInt(options.url.match(/\/api\/v1\/messages\/(\d+)\/read/)[1]);
  const msg = messages.find(m => m.id === id);
  if (msg) { msg.is_read = true; return { code: 200, message: '标记已读', data: null }; }
  return { code: 404, message: '消息不存在', data: null };
});

Mock.mock(/\/api\/v1\/messages\/read-all/, 'post', () => {
  messages.filter(m => m.user_id === 1).forEach(m => m.is_read = true);
  return { code: 200, message: '全部已读', data: null };
});

// ==================== 意见反馈接口 ====================
// 获取我的反馈列表
Mock.mock(/\/api\/v1\/feedbacks\?/, 'get', (options) => {
  const url = options.url || '';
  const params = {};
  let filtered = [...feedbacks];

  if (url.includes('?')) {
    const queryString = url.split('?')[1];
    queryString.split('&').forEach(p => {
      const [k, v] = p.split('=');
      params[k] = decodeURIComponent(v || '');
    });
  }

  const { status, type, page = 1, size = 20 } = params;

  // 筛选条件
  if (status) {
    filtered = filtered.filter(f => f.status === status);
  }
  if (type) {
    filtered = filtered.filter(f => f.type === type);
  }

  const total = filtered.length;
  const list = filtered.slice((parseInt(page) - 1) * parseInt(size), parseInt(page) * parseInt(size));

  return {
    code: 200,
    message: '获取成功',
    data: {
      list,
      total,
      page: parseInt(page),
      size: parseInt(size)
    }
  };
});

// 获取反馈详情
Mock.mock(/\/api\/v1\/feedbacks\/(\d+)\/?$/, 'get', (options) => {
  const match = options.url.match(/\/api\/v1\/feedbacks\/(\d+)/);
  const id = parseInt(match[1]);
  const feedback = feedbacks.find(f => f.id === id);

  if (!feedback) {
    return { code: 404, message: '反馈不存在', data: null };
  }

  return { code: 200, message: '获取成功', data: feedback };
});

// 提交反馈
Mock.mock(/\/api\/v1\/feedbacks/, 'post', (options) => {
  const body = JSON.parse(options.body);
  const { type, title, content, images } = body;

  if (!type || !title || !content) {
    return { code: 400, message: '请填写完整信息', data: null };
  }

  const newFeedback = {
    id: feedbacks.length + 1,
    userId: 2,
    userName: '普通用户',
    type,
    title,
    content,
    images: images || '[]',
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  feedbacks.unshift(newFeedback);

  return { code: 200, message: '提交成功', data: newFeedback };
});

// 获取反馈回复列表
Mock.mock(/\/api\/v1\/feedbacks\/(\d+)\/replies/, 'get', (options) => {
  const match = options.url.match(/\/api\/v1\/feedbacks\/(\d+)\/replies/);
  const feedbackId = parseInt(match[1]);

  const url = options.url || '';
  const params = {};
  if (url.includes('?')) {
    const queryString = url.split('?')[1];
    queryString.split('&').forEach(p => {
      const [k, v] = p.split('=');
      params[k] = decodeURIComponent(v || '');
    });
  }

  const { page = 1, size = 20 } = params;
  const filtered = feedbackReplies.filter(r => r.feedbackId === feedbackId);
  const total = filtered.length;
  const list = filtered.slice((parseInt(page) - 1) * parseInt(size), parseInt(page) * parseInt(size));

  return {
    code: 200,
    message: '获取成功',
    data: {
      list,
      total,
      page: parseInt(page),
      size: parseInt(size)
    }
  };
});

// 添加回复
Mock.mock(/\/api\/v1\/feedbacks\/(\d+)\/replies/, 'post', (options) => {
  const match = options.url.match(/\/api\/v1\/feedbacks\/(\d+)\/replies/);
  const feedbackId = parseInt(match[1]);
  const body = JSON.parse(options.body);
  const { content } = body;

  if (!content) {
    return { code: 400, message: '回复内容不能为空', data: null };
  }

  const feedback = feedbacks.find(f => f.id === feedbackId);
  if (!feedback) {
    return { code: 404, message: '反馈不存在', data: null };
  }

  const newReply = {
    id: feedbackReplies.length + 1,
    feedbackId,
    userId: 1,
    userName: '管理员',
    content,
    createdAt: new Date().toISOString()
  };

  feedbackReplies.push(newReply);

  // 更新反馈状态为已回复
  feedback.status = 'replied';
  feedback.updatedAt = new Date().toISOString();

  return { code: 200, message: '回复成功', data: newReply };
});

// 更新反馈状态
Mock.mock(/\/api\/v1\/feedbacks\/(\d+)\/status/, 'patch', (options) => {
  const match = options.url.match(/\/api\/v1\/feedbacks\/(\d+)\/status/);
  const id = parseInt(match[1]);
  const body = JSON.parse(options.body);
  const { status } = body;

  const validStatuses = ['pending', 'processing', 'replied', 'closed'];
  if (!status || !validStatuses.includes(status)) {
    return { code: 400, message: '无效的状态值', data: null };
  }

  const feedback = feedbacks.find(f => f.id === id);
  if (!feedback) {
    return { code: 404, message: '反馈不存在', data: null };
  }

  feedback.status = status;
  feedback.updatedAt = new Date().toISOString();

  return { code: 200, message: '状态更新成功', data: feedback };
});

// 删除反馈
Mock.mock(/\/api\/v1\/feedbacks\/(\d+)\/?$/, 'delete', (options) => {
  const match = options.url.match(/\/api\/v1\/feedbacks\/(\d+)/);
  const id = parseInt(match[1]);

  const index = feedbacks.findIndex(f => f.id === id);
  if (index === -1) {
    return { code: 404, message: '反馈不存在', data: null };
  }

  feedbacks.splice(index, 1);

  return { code: 200, message: '删除成功', data: null };
});

// 获取反馈统计数据
Mock.mock(/\/api\/v1\/feedbacks\/stats/, 'get', () => {
  const stats = {
    total: feedbacks.length,
    pending: feedbacks.filter(f => f.status === 'pending').length,
    processing: feedbacks.filter(f => f.status === 'processing').length,
    replied: feedbacks.filter(f => f.status === 'replied').length,
    closed: feedbacks.filter(f => f.status === 'closed').length,
    byType: {
      '功能建议': feedbacks.filter(f => f.type === '功能建议').length,
      '问题反馈': feedbacks.filter(f => f.type === '问题反馈').length,
      '其他': feedbacks.filter(f => f.type === '其他').length
    }
  };

  return { code: 200, message: '获取成功', data: stats };
});

// ==================== 审批进度查询接口 ====================
Mock.mock(/\/api\/v1\/approvals\/progress/, 'get', (options) => {
  const url = options.url || '';
  const params = {};
  if (url.includes('?')) {
    const queryString = url.split('?')[1];
    queryString.split('&').forEach(p => {
      const [k, v] = p.split('=');
      params[k] = decodeURIComponent(v || '');
    });
  }

  const approval_id = parseInt(params.id);
  const record = approvalRecords.find(r => r.id === approval_id);

  if (!record) {
    return { code: 404, message: '审批记录不存在', data: null };
  }

  // 获取审批链配置
  const chain = approvalChains.find(c => c.id === record.chain_id);
  const nodes = chain ? chain.nodes : [];

  // 构建进度节点
  const progressNodes = nodes.map((node, index) => {
    const order = index + 1;
    const nodeRecord = approvalNodes.find(n => n.approval_id === approval_id && n.node_order === order);

    let status = 'waiting';
    let approver = '';
    let result = '';
    let actedAt = '';

    if (order < record.current_node) {
      status = nodeRecord ? nodeRecord.status : 'approved';
      approver = nodeRecord ? nodeRecord.approver_name : '审批人' + order;
      result = nodeRecord ? (nodeRecord.status === 'approved' ? '通过' : '拒绝') : '通过';
      actedAt = nodeRecord ? nodeRecord.acted_at : '';
    } else if (order === record.current_node) {
      status = record.status === 'pending' ? 'pending' : record.status;
      approver = nodeRecord ? nodeRecord.approver_name : '待审批';
      result = nodeRecord ? (nodeRecord.comment || '') : '';
      actedAt = nodeRecord ? nodeRecord.acted_at : '';
    }

    return {
      order,
      status,
      approver,
      result,
      acted_at: actedAt
    };
  });

  return {
    code: 200,
    message: '获取成功',
    data: {
      approval_id: record.id,
      title: record.title,
      type: record.type,
      applicant_name: record.applicant_name,
      current_node: record.current_node,
      total_nodes: nodes.length,
      status: record.status,
      nodes: progressNodes
    }
  };
});

// ==================== 统一审批操作接口（批准/拒绝） ====================
Mock.mock(/\/api\/v1\/approvals\/(\d+)\/process/, 'post', (options) => {
  const id = parseInt(options.url.match(/\/api\/v1\/approvals\/(\d+)\/process/)[1]);
  const body = JSON.parse(options.body);
  const { action, comment } = body; // action: approve/reject

  const record = approvalRecords.find(r => r.id === id);
  if (!record) {
    return { code: 404, message: '审批记录不存在', data: null };
  }

  if (record.status !== 'pending') {
    return { code: 400, message: '该审批已处理', data: null };
  }

  if (action === 'approve') {
    record.status = 'approved';
    record.updated_at = new Date().toISOString();
    approvalNodes.push({
      id: approvalNodes.length + 1,
      approval_id: id,
      node_order: record.current_node,
      status: 'approved',
      approver_id: 1,
      approver_name: '管理员',
      comment: comment || '同意',
      acted_at: new Date().toISOString()
    });
    messages.unshift({
      id: messages.length + 1,
      user_id: record.applicant_id,
      type: 'approval',
      title: '审批通过',
      content: `您的${record.title}已通过审批`,
      is_read: false,
      related_id: record.id,
      related_type: record.type,
      created_at: new Date().toISOString()
    });
    return { code: 200, message: '审批通过', data: record };
  } else if (action === 'reject') {
    record.status = 'rejected';
    record.reject_reason = comment || '拒绝';
    record.updated_at = new Date().toISOString();
    approvalNodes.push({
      id: approvalNodes.length + 1,
      approval_id: id,
      node_order: record.current_node,
      status: 'rejected',
      approver_id: 1,
      approver_name: '管理员',
      comment: comment || '拒绝',
      acted_at: new Date().toISOString()
    });
    messages.unshift({
      id: messages.length + 1,
      user_id: record.applicant_id,
      type: 'approval',
      title: '审批被拒绝',
      content: `您的${record.title}被拒绝`,
      is_read: false,
      related_id: record.id,
      related_type: record.type,
      created_at: new Date().toISOString()
    });
    return { code: 200, message: '审批已拒绝', data: record };
  }

  return { code: 400, message: '无效的操作类型', data: null };
});

// ==================== 统一批量审批接口 ====================
Mock.mock(/\/api\/v1\/approvals\/batch/, 'post', (options) => {
  const body = JSON.parse(options.body);
  const { ids, action, comment } = body; // action: approve/reject

  let success = 0;
  let failed = 0;
  const results = [];

  ids.forEach(id => {
    const record = approvalRecords.find(r => r.id === id);
    if (!record) {
      failed++;
      results.push({ id, status: 'failed', reason: '记录不存在' });
      return;
    }

    if (record.status !== 'pending') {
      failed++;
      results.push({ id, status: 'failed', reason: '该审批已处理' });
      return;
    }

    if (action === 'approve') {
      record.status = 'approved';
      record.updated_at = new Date().toISOString();
      approvalNodes.push({
        id: approvalNodes.length + 1,
        approval_id: id,
        node_order: record.current_node,
        status: 'approved',
        approver_id: 1,
        approver_name: '管理员',
        comment: comment || '批量通过',
        acted_at: new Date().toISOString()
      });
      messages.unshift({
        id: messages.length + 1,
        user_id: record.applicant_id,
        type: 'approval',
        title: '审批通过',
        content: `您的${record.title}已通过审批`,
        is_read: false,
        related_id: record.id,
        related_type: record.type,
        created_at: new Date().toISOString()
      });
      success++;
      results.push({ id, status: 'approved' });
    } else if (action === 'reject') {
      record.status = 'rejected';
      record.reject_reason = comment || '批量拒绝';
      record.updated_at = new Date().toISOString();
      approvalNodes.push({
        id: approvalNodes.length + 1,
        approval_id: id,
        node_order: record.current_node,
        status: 'rejected',
        approver_id: 1,
        approver_name: '管理员',
        comment: comment || '批量拒绝',
        acted_at: new Date().toISOString()
      });
      messages.unshift({
        id: messages.length + 1,
        user_id: record.applicant_id,
        type: 'approval',
        title: '审批被拒绝',
        content: `您的${record.title}被拒绝`,
        is_read: false,
        related_id: record.id,
        related_type: record.type,
        created_at: new Date().toISOString()
      });
      success++;
      results.push({ id, status: 'rejected' });
    } else {
      failed++;
      results.push({ id, status: 'failed', reason: '无效操作类型' });
    }
  });

  return {
    code: 200,
    message: `批量操作成功，成功${success}条，失败${failed}条`,
    data: { success, failed, results }
  };
});

// ==================== 统一消息标记已读接口 ====================
Mock.mock(/\/api\/v1\/messages\/read/, 'post', (options) => {
  const body = JSON.parse(options.body);
  const { ids } = body;

  if (ids && Array.isArray(ids)) {
    // 批量标记已读
    let count = 0;
    ids.forEach(id => {
      const msg = messages.find(m => m.id === id);
      if (msg && !msg.is_read) {
        msg.is_read = true;
        count++;
      }
    });
    return { code: 200, message: `标记成功${count}条`, data: { count } };
  }

  return { code: 400, message: '请提供消息ID列表', data: null };
});

// ==================== 任务协作Mock数据 ====================
// 任务状态：todo（待处理）、in_progress（进行中）、done（已完成）、closed（已关闭）
// 任务优先级：low（低）、medium（中）、high（高）
const tasks = [
  {
    id: 1,
    title: '完成项目需求文档',
    description: '整理并完善项目的需求文档，包括功能需求、非功能需求和用户故事',
    status: 'in_progress',
    priority: 'high',
    assignees: [{ id: 1, name: '管理员', avatar: 'https://tdesign.gtimg.com/site/avatar.jpg' }],
    watchers: [{ id: 2, name: '普通用户', avatar: 'https://tdesign.gtimg.com/site/avatar.jpg' }],
    dueDate: '2026-05-15T00:00:00Z',
    parentId: null,
    createdBy: { id: 1, name: '管理员' },
    createdAt: '2026-04-25T10:00:00Z',
    updatedAt: '2026-04-30T09:00:00Z',
    completedAt: null,
    subtaskCount: 3,
    completedSubtaskCount: 1,
    commentCount: 2
  },
  {
    id: 2,
    title: '设计系统架构方案',
    description: '基于需求文档设计系统架构，输出技术方案文档',
    status: 'todo',
    priority: 'high',
    assignees: [{ id: 1, name: '管理员', avatar: 'https://tdesign.gtimg.com/site/avatar.jpg' }],
    watchers: [],
    dueDate: '2026-05-20T00:00:00Z',
    parentId: null,
    createdBy: { id: 1, name: '管理员' },
    createdAt: '2026-04-26T10:00:00Z',
    updatedAt: '2026-04-26T10:00:00Z',
    completedAt: null,
    subtaskCount: 0,
    completedSubtaskCount: 0,
    commentCount: 0
  },
  {
    id: 3,
    title: '用户反馈收集与分析',
    description: '收集用户反馈，整理常见问题和改进建议',
    status: 'done',
    priority: 'medium',
    assignees: [{ id: 2, name: '普通用户', avatar: 'https://tdesign.gtimg.com/site/avatar.jpg' }],
    watchers: [{ id: 1, name: '管理员', avatar: 'https://tdesign.gtimg.com/site/avatar.jpg' }],
    dueDate: '2026-04-28T00:00:00Z',
    parentId: null,
    createdBy: { id: 2, name: '普通用户' },
    createdAt: '2026-04-20T10:00:00Z',
    updatedAt: '2026-04-28T16:00:00Z',
    completedAt: '2026-04-28T16:00:00Z',
    subtaskCount: 2,
    completedSubtaskCount: 2,
    commentCount: 5
  },
  {
    id: 4,
    title: '编写单元测试用例',
    description: '为核心模块编写单元测试，覆盖率达到80%',
    status: 'todo',
    priority: 'medium',
    assignees: [{ id: 1, name: '管理员', avatar: 'https://tdesign.gtimg.com/site/avatar.jpg' }, { id: 2, name: '普通用户', avatar: 'https://tdesign.gtimg.com/site/avatar.jpg' }],
    watchers: [],
    dueDate: '2026-05-25T00:00:00Z',
    parentId: null,
    createdBy: { id: 1, name: '管理员' },
    createdAt: '2026-04-28T10:00:00Z',
    updatedAt: '2026-04-28T10:00:00Z',
    completedAt: null,
    subtaskCount: 0,
    completedSubtaskCount: 0,
    commentCount: 1
  },
  {
    id: 5,
    title: '修复登录页面Bug',
    description: '修复用户反馈的登录页面样式错位问题',
    status: 'closed',
    priority: 'low',
    assignees: [{ id: 2, name: '普通用户', avatar: 'https://tdesign.gtimg.com/site/avatar.jpg' }],
    watchers: [],
    dueDate: '2026-04-25T00:00:00Z',
    parentId: null,
    createdBy: { id: 2, name: '普通用户' },
    createdAt: '2026-04-22T10:00:00Z',
    updatedAt: '2026-04-24T10:00:00Z',
    completedAt: '2026-04-24T10:00:00Z',
    subtaskCount: 0,
    completedSubtaskCount: 0,
    commentCount: 3
  },
  {
    id: 6,
    title: '优化首页加载速度',
    description: '分析首页加载性能，优化资源加载和渲染速度',
    status: 'in_progress',
    priority: 'high',
    assignees: [{ id: 1, name: '管理员', avatar: 'https://tdesign.gtimg.com/site/avatar.jpg' }],
    watchers: [{ id: 2, name: '普通用户', avatar: 'https://tdesign.gtimg.com/site/avatar.jpg' }],
    dueDate: '2026-05-10T00:00:00Z',
    parentId: null,
    createdBy: { id: 1, name: '管理员' },
    createdAt: '2026-04-29T10:00:00Z',
    updatedAt: '2026-04-30T08:00:00Z',
    completedAt: null,
    subtaskCount: 4,
    completedSubtaskCount: 2,
    commentCount: 1
  }
];

// 子任务数据
const subtasks = [
  { id: 1, taskId: 1, title: '收集功能需求', completed: true, assigneeId: 1, assigneeName: '管理员', createdAt: '2026-04-25T10:00:00Z' },
  { id: 2, taskId: 1, title: '编写需求文档', completed: false, assigneeId: 1, assigneeName: '管理员', createdAt: '2026-04-25T10:00:00Z' },
  { id: 3, taskId: 1, title: '需求评审', completed: false, assigneeId: 2, assigneeName: '普通用户', createdAt: '2026-04-26T10:00:00Z' },
  { id: 4, taskId: 3, title: '收集反馈', completed: true, assigneeId: 2, assigneeName: '普通用户', createdAt: '2026-04-20T10:00:00Z' },
  { id: 5, taskId: 3, title: '整理分析报告', completed: true, assigneeId: 2, assigneeName: '普通用户', createdAt: '2026-04-22T10:00:00Z' },
  { id: 6, taskId: 6, title: '性能分析', completed: true, assigneeId: 1, assigneeName: '管理员', createdAt: '2026-04-29T10:00:00Z' },
  { id: 7, taskId: 6, title: '资源优化', completed: true, assigneeId: 1, assigneeName: '管理员', createdAt: '2026-04-29T10:00:00Z' },
  { id: 8, taskId: 6, title: '懒加载实现', completed: false, assigneeId: 1, assigneeName: '管理员', createdAt: '2026-04-30T08:00:00Z' },
  { id: 9, taskId: 6, title: '测试验证', completed: false, assigneeId: 2, assigneeName: '普通用户', createdAt: '2026-04-30T08:00:00Z' }
];

// 任务评论数据
const taskComments = [
  { id: 1, taskId: 1, userId: 2, userName: '普通用户', userAvatar: 'https://tdesign.gtimg.com/site/avatar.jpg', content: '需求文档的格式可以参考之前的模板', mentionUsers: [], createdAt: '2026-04-26T14:00:00Z' },
  { id: 2, taskId: 1, userId: 1, userName: '管理员', userAvatar: 'https://tdesign.gtimg.com/site/avatar.jpg', content: '好的，@普通用户 麻烦帮忙审核一下', mentionUsers: [{ id: 2, name: '普通用户' }], createdAt: '2026-04-27T10:00:00Z' },
  { id: 3, taskId: 3, userId: 1, userName: '管理员', userAvatar: 'https://tdesign.gtimg.com/site/avatar.jpg', content: '分析报告写得很详细，辛苦了', mentionUsers: [], createdAt: '2026-04-28T16:00:00Z' },
  { id: 4, taskId: 4, userId: 2, userName: '普通用户', userAvatar: 'https://tdesign.gtimg.com/site/avatar.jpg', content: '我来负责认证模块的测试用例', mentionUsers: [], createdAt: '2026-04-29T10:00:00Z' },
  { id: 5, taskId: 5, userId: 1, userName: '管理员', userAvatar: 'https://tdesign.gtimg.com/site/avatar.jpg', content: '已验证，修复有效', mentionUsers: [], createdAt: '2026-04-24T10:00:00Z' },
  { id: 6, taskId: 6, userId: 2, userName: '普通用户', userAvatar: 'https://tdesign.gtimg.com/site/avatar.jpg', content: '加载速度确实提升明显', mentionUsers: [], createdAt: '2026-04-30T09:00:00Z' }
];

// 任务活动数据
const taskActivities = [
  { id: 1, taskId: 1, type: 'create', userId: 1, userName: '管理员', content: '创建了任务', detail: {}, createdAt: '2026-04-25T10:00:00Z' },
  { id: 2, taskId: 1, type: 'subtask', userId: 1, userName: '管理员', content: '添加了子任务"收集功能需求"', detail: { subtaskId: 1 }, createdAt: '2026-04-25T10:00:00Z' },
  { id: 3, taskId: 1, type: 'status_change', userId: 1, userName: '管理员', content: '将状态从"待处理"改为"进行中"', detail: { from: 'todo', to: 'in_progress' }, createdAt: '2026-04-26T09:00:00Z' },
  { id: 4, taskId: 1, type: 'comment', userId: 2, userName: '普通用户', content: '发表了评论', detail: { commentId: 1 }, createdAt: '2026-04-26T14:00:00Z' },
  { id: 5, taskId: 1, type: 'subtask', userId: 1, userName: '管理员', content: '完成了子任务"收集功能需求"', detail: { subtaskId: 1 }, createdAt: '2026-04-27T10:00:00Z' },
  { id: 6, taskId: 3, type: 'create', userId: 2, userName: '普通用户', content: '创建了任务', detail: {}, createdAt: '2026-04-20T10:00:00Z' },
  { id: 7, taskId: 3, type: 'status_change', userId: 2, userName: '普通用户', content: '将状态从"进行中"改为"已完成"', detail: { from: 'in_progress', to: 'done' }, createdAt: '2026-04-28T16:00:00Z' },
  { id: 8, taskId: 6, type: 'create', userId: 1, userName: '管理员', content: '创建了任务', detail: {}, createdAt: '2026-04-29T10:00:00Z' },
  { id: 9, taskId: 6, type: 'assign', userId: 1, userName: '管理员', content: '将任务分配给自己', detail: { assignees: [{ id: 1, name: '管理员' }] }, createdAt: '2026-04-29T10:00:00Z' },
  { id: 10, taskId: 6, type: 'status_change', userId: 1, userName: '管理员', content: '将状态从"待处理"改为"进行中"', detail: { from: 'todo', to: 'in_progress' }, createdAt: '2026-04-30T08:00:00Z' }
];

// ==================== 任务CRUD接口 ====================
Mock.mock(/\/api\/v1\/tasks\/?$/, 'get', (options) => {
  const url = options.url || '';
  const params = {};
  if (url.includes('?')) {
    const queryString = url.split('?')[1];
    queryString.split('&').forEach(p => {
      const [k, v] = p.split('=');
      params[k] = decodeURIComponent(v || '');
    });
  }

  const { status, assigneeId, priority, keyword, page = 1, size = 20 } = params;
  let filtered = [...tasks];

  // 状态筛选
  if (status) {
    filtered = filtered.filter(t => t.status === status);
  }
  // 负责人筛选
  if (assigneeId) {
    filtered = filtered.filter(t => t.assignees.some(a => a.id === parseInt(assigneeId)));
  }
  // 优先级筛选
  if (priority) {
    filtered = filtered.filter(t => t.priority === priority);
  }
  // 关键词搜索
  if (keyword) {
    const kw = keyword.toLowerCase();
    filtered = filtered.filter(t => t.title.toLowerCase().includes(kw) || t.description.toLowerCase().includes(kw));
  }

  const total = filtered.length;
  const list = filtered.slice((parseInt(page) - 1) * parseInt(size), parseInt(page) * parseInt(size));

  return {
    code: 200,
    message: '获取成功',
    data: {
      list,
      total,
      page: parseInt(page),
      size: parseInt(size)
    }
  };
});

// 获取任务详情
Mock.mock(/\/api\/v1\/tasks\/(\d+)\/?$/, 'get', (options) => {
  const match = options.url.match(/\/api\/v1\/tasks\/(\d+)/);
  const id = parseInt(match[1]);
  const task = tasks.find(t => t.id === id);

  if (!task) {
    return { code: 404, message: '任务不存在', data: null };
  }

  // 获取子任务
  const taskSubtasks = subtasks.filter(s => s.taskId === id);

  return {
    code: 200,
    message: '获取成功',
    data: {
      ...task,
      subtasks: taskSubtasks
    }
  };
});

// 创建任务
Mock.mock(/\/api\/v1\/tasks/, 'post', (options) => {
  const body = JSON.parse(options.body);
  const { title, description, priority, assignees, watchers, dueDate, parentId, subtasks: inputSubtasks } = body;

  if (!title) {
    return { code: 400, message: '任务标题不能为空', data: null };
  }

  const newTask = {
    id: tasks.length + 1,
    title,
    description: description || '',
    status: 'todo',
    priority: priority || 'medium',
    assignees: assignees || [],
    watchers: watchers || [],
    dueDate: dueDate || null,
    parentId: parentId || null,
    createdBy: { id: 1, name: '管理员' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: null,
    subtaskCount: inputSubtasks ? inputSubtasks.length : 0,
    completedSubtaskCount: 0,
    commentCount: 0
  };

  tasks.unshift(newTask);

  // 添加子任务
  if (inputSubtasks && inputSubtasks.length > 0) {
    inputSubtasks.forEach((st, index) => {
      subtasks.push({
        id: subtasks.length + 1,
        taskId: newTask.id,
        title: st.title,
        completed: false,
        assigneeId: st.assigneeId || null,
        assigneeName: st.assigneeId ? (st.assigneeId === 1 ? '管理员' : '普通用户') : null,
        createdAt: new Date().toISOString()
      });
    });
  }

  // 添加活动记录
  taskActivities.unshift({
    id: taskActivities.length + 1,
    taskId: newTask.id,
    type: 'create',
    userId: 1,
    userName: '管理员',
    content: '创建了任务',
    detail: {},
    createdAt: new Date().toISOString()
  });

  return {
    code: 200,
    message: '创建成功',
    data: newTask
  };
});

// 更新任务
Mock.mock(/\/api\/v1\/tasks\/(\d+)\/?$/, 'put', (options) => {
  const match = options.url.match(/\/api\/v1\/tasks\/(\d+)/);
  const id = parseInt(match[1]);
  const body = JSON.parse(options.body);

  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) {
    return { code: 404, message: '任务不存在', data: null };
  }

  tasks[index] = {
    ...tasks[index],
    ...body,
    updatedAt: new Date().toISOString()
  };

  // 添加活动记录
  taskActivities.unshift({
    id: taskActivities.length + 1,
    taskId: id,
    type: 'update',
    userId: 1,
    userName: '管理员',
    content: '更新了任务信息',
    detail: body,
    createdAt: new Date().toISOString()
  });

  return {
    code: 200,
    message: '更新成功',
    data: tasks[index]
  };
});

// 更新任务状态
Mock.mock(/\/api\/v1\/tasks\/(\d+)\/status/, 'patch', (options) => {
  const match = options.url.match(/\/api\/v1\/tasks\/(\d+)\/status/);
  const id = parseInt(match[1]);
  const body = JSON.parse(options.body);
  const { status } = body;

  const validStatuses = ['todo', 'in_progress', 'done', 'closed'];
  if (!status || !validStatuses.includes(status)) {
    return { code: 400, message: '无效的状态值', data: null };
  }

  const task = tasks.find(t => t.id === id);
  if (!task) {
    return { code: 404, message: '任务不存在', data: null };
  }

  const oldStatus = task.status;
  task.status = status;
  task.updatedAt = new Date().toISOString();

  if (status === 'done' || status === 'closed') {
    task.completedAt = new Date().toISOString();
  }

  // 添加活动记录
  const statusLabels = { todo: '待处理', in_progress: '进行中', done: '已完成', closed: '已关闭' };
  taskActivities.unshift({
    id: taskActivities.length + 1,
    taskId: id,
    type: 'status_change',
    userId: 1,
    userName: '管理员',
    content: `将状态从"${statusLabels[oldStatus]}"改为"${statusLabels[status]}"`,
    detail: { from: oldStatus, to: status },
    createdAt: new Date().toISOString()
  });

  return {
    code: 200,
    message: '状态更新成功',
    data: task
  };
});

// 删除任务
Mock.mock(/\/api\/v1\/tasks\/(\d+)\/?$/, 'delete', (options) => {
  const match = options.url.match(/\/api\/v1\/tasks\/(\d+)/);
  const id = parseInt(match[1]);

  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) {
    return { code: 404, message: '任务不存在', data: null };
  }

  tasks.splice(index, 1);
  // 删除相关子任务
  const subtaskIndices = subtasks.map((s, i) => s.taskId === id ? i : -1).filter(i => i !== -1).reverse();
  subtaskIndices.forEach(i => subtasks.splice(i, 1));
  // 删除相关评论
  const commentIndices = taskComments.map((c, i) => c.taskId === id ? i : -1).filter(i => i !== -1).reverse();
  commentIndices.forEach(i => taskComments.splice(i, 1));

  return {
    code: 200,
    message: '删除成功',
    data: null
  };
});

// ==================== 子任务接口 ====================
// 获取子任务列表
Mock.mock(/\/api\/v1\/tasks\/(\d+)\/subtasks/, 'get', (options) => {
  const match = options.url.match(/\/api\/v1\/tasks\/(\d+)\/subtasks/);
  const taskId = parseInt(match[1]);

  const taskSubtasks = subtasks.filter(s => s.taskId === taskId);

  return {
    code: 200,
    message: '获取成功',
    data: {
      list: taskSubtasks,
      total: taskSubtasks.length
    }
  };
});

// 创建子任务
Mock.mock(/\/api\/v1\/tasks\/(\d+)\/subtasks/, 'post', (options) => {
  const match = options.url.match(/\/api\/v1\/tasks\/(\d+)\/subtasks/);
  const taskId = parseInt(match[1]);
  const body = JSON.parse(options.body);
  const { title, assigneeId } = body;

  if (!title) {
    return { code: 400, message: '子任务标题不能为空', data: null };
  }

  const task = tasks.find(t => t.id === taskId);
  if (!task) {
    return { code: 404, message: '任务不存在', data: null };
  }

  const newSubtask = {
    id: subtasks.length + 1,
    taskId,
    title,
    completed: false,
    assigneeId: assigneeId || null,
    assigneeName: assigneeId ? (assigneeId === 1 ? '管理员' : '普通用户') : null,
    createdAt: new Date().toISOString()
  };

  subtasks.push(newSubtask);
  task.subtaskCount = (task.subtaskCount || 0) + 1;
  task.updatedAt = new Date().toISOString();

  // 添加活动记录
  taskActivities.unshift({
    id: taskActivities.length + 1,
    taskId,
    type: 'subtask',
    userId: 1,
    userName: '管理员',
    content: `添加了子任务"${title}"`,
    detail: { subtaskId: newSubtask.id, action: 'create' },
    createdAt: new Date().toISOString()
  });

  return {
    code: 200,
    message: '创建成功',
    data: newSubtask
  };
});

// 更新子任务
Mock.mock(/\/api\/v1\/tasks\/(\d+)\/subtasks\/(\d+)\/?$/, 'put', (options) => {
  const matches = options.url.match(/\/api\/v1\/tasks\/(\d+)\/subtasks\/(\d+)/);
  const taskId = parseInt(matches[1]);
  const subtaskId = parseInt(matches[2]);
  const body = JSON.parse(options.body);

  const subtask = subtasks.find(s => s.taskId === taskId && s.id === subtaskId);
  if (!subtask) {
    return { code: 404, message: '子任务不存在', data: null };
  }

  Object.assign(subtask, body, { updatedAt: new Date().toISOString() });

  return {
    code: 200,
    message: '更新成功',
    data: subtask
  };
});

// 删除子任务
Mock.mock(/\/api\/v1\/tasks\/(\d+)\/subtasks\/(\d+)\/?$/, 'delete', (options) => {
  const matches = options.url.match(/\/api\/v1\/tasks\/(\d+)\/subtasks\/(\d+)/);
  const taskId = parseInt(matches[1]);
  const subtaskId = parseInt(matches[2]);

  const index = subtasks.findIndex(s => s.taskId === taskId && s.id === subtaskId);
  if (index === -1) {
    return { code: 404, message: '子任务不存在', data: null };
  }

  const removed = subtasks[index];
  subtasks.splice(index, 1);

  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.subtaskCount = Math.max(0, (task.subtaskCount || 0) - 1);
    if (removed.completed) {
      task.completedSubtaskCount = Math.max(0, (task.completedSubtaskCount || 0) - 1);
    }
    task.updatedAt = new Date().toISOString();
  }

  return {
    code: 200,
    message: '删除成功',
    data: null
  };
});

// 切换子任务完成状态
Mock.mock(/\/api\/v1\/tasks\/(\d+)\/subtasks\/(\d+)\/toggle/, 'post', (options) => {
  const matches = options.url.match(/\/api\/v1\/tasks\/(\d+)\/subtasks\/(\d+)\/toggle/);
  const taskId = parseInt(matches[1]);
  const subtaskId = parseInt(matches[2]);

  const subtask = subtasks.find(s => s.taskId === taskId && s.id === subtaskId);
  if (!subtask) {
    return { code: 404, message: '子任务不存在', data: null };
  }

  subtask.completed = !subtask.completed;

  const task = tasks.find(t => t.id === taskId);
  if (task) {
    if (subtask.completed) {
      task.completedSubtaskCount = (task.completedSubtaskCount || 0) + 1;
    } else {
      task.completedSubtaskCount = Math.max(0, (task.completedSubtaskCount || 0) - 1);
    }
    task.updatedAt = new Date().toISOString();
  }

  // 添加活动记录
  taskActivities.unshift({
    id: taskActivities.length + 1,
    taskId,
    type: 'subtask',
    userId: 1,
    userName: '管理员',
    content: subtask.completed ? `完成了子任务"${subtask.title}"` : `取消了子任务"${subtask.title}"的完成状态`,
    detail: { subtaskId, action: subtask.completed ? 'complete' : 'uncomplete' },
    createdAt: new Date().toISOString()
  });

  return {
    code: 200,
    message: subtask.completed ? '已完成' : '已取消完成',
    data: subtask
  };
});

// ==================== 任务评论接口 ====================
// 获取评论列表
Mock.mock(/\/api\/v1\/tasks\/(\d+)\/comments/, 'get', (options) => {
  const match = options.url.match(/\/api\/v1\/tasks\/(\d+)\/comments/);
  const taskId = parseInt(match[1]);

  const url = options.url || '';
  const params = {};
  if (url.includes('?')) {
    const queryString = url.split('?')[1];
    queryString.split('&').forEach(p => {
      const [k, v] = p.split('=');
      params[k] = decodeURIComponent(v || '');
    });
  }

  const { page = 1, size = 20 } = params;
  const taskCommentList = taskComments.filter(c => c.taskId === taskId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const total = taskCommentList.length;
  const list = taskCommentList.slice((parseInt(page) - 1) * parseInt(size), parseInt(page) * parseInt(size));

  return {
    code: 200,
    message: '获取成功',
    data: {
      list,
      total,
      page: parseInt(page),
      size: parseInt(size)
    }
  };
});

// 发表评论
Mock.mock(/\/api\/v1\/tasks\/(\d+)\/comments/, 'post', (options) => {
  const match = options.url.match(/\/api\/v1\/tasks\/(\d+)\/comments/);
  const taskId = parseInt(match[1]);
  const body = JSON.parse(options.body);
  const { content, mentionUsers } = body;

  if (!content) {
    return { code: 400, message: '评论内容不能为空', data: null };
  }

  const task = tasks.find(t => t.id === taskId);
  if (!task) {
    return { code: 404, message: '任务不存在', data: null };
  }

  const newComment = {
    id: taskComments.length + 1,
    taskId,
    userId: 1,
    userName: '管理员',
    userAvatar: 'https://tdesign.gtimg.com/site/avatar.jpg',
    content,
    mentionUsers: mentionUsers || [],
    createdAt: new Date().toISOString()
  };

  taskComments.push(newComment);
  task.commentCount = (task.commentCount || 0) + 1;
  task.updatedAt = new Date().toISOString();

  // 添加活动记录
  taskActivities.unshift({
    id: taskActivities.length + 1,
    taskId,
    type: 'comment',
    userId: 1,
    userName: '管理员',
    content: '发表了评论',
    detail: { commentId: newComment.id },
    createdAt: new Date().toISOString()
  });

  return {
    code: 200,
    message: '评论成功',
    data: newComment
  };
});

// 更新评论
Mock.mock(/\/api\/v1\/tasks\/(\d+)\/comments\/(\d+)\/?$/, 'put', (options) => {
  const matches = options.url.match(/\/api\/v1\/tasks\/(\d+)\/comments\/(\d+)/);
  const taskId = parseInt(matches[1]);
  const commentId = parseInt(matches[2]);
  const body = JSON.parse(options.body);

  const comment = taskComments.find(c => c.taskId === taskId && c.id === commentId);
  if (!comment) {
    return { code: 404, message: '评论不存在', data: null };
  }

  if (comment.userId !== 1) {
    return { code: 403, message: '无权修改此评论', data: null };
  }

  comment.content = body.content || comment.content;
  comment.updatedAt = new Date().toISOString();

  return {
    code: 200,
    message: '更新成功',
    data: comment
  };
});

// 删除评论
Mock.mock(/\/api\/v1\/tasks\/(\d+)\/comments\/(\d+)\/?$/, 'delete', (options) => {
  const matches = options.url.match(/\/api\/v1\/tasks\/(\d+)\/comments\/(\d+)/);
  const taskId = parseInt(matches[1]);
  const commentId = parseInt(matches[2]);

  const index = taskComments.findIndex(c => c.taskId === taskId && c.id === commentId);
  if (index === -1) {
    return { code: 404, message: '评论不存在', data: null };
  }

  const comment = taskComments[index];
  if (comment.userId !== 1) {
    return { code: 403, message: '无权删除此评论', data: null };
  }

  taskComments.splice(index, 1);

  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.commentCount = Math.max(0, (task.commentCount || 0) - 1);
    task.updatedAt = new Date().toISOString();
  }

  return {
    code: 200,
    message: '删除成功',
    data: null
  };
});

// ==================== 任务动态接口 ====================
// 获取任务动态
Mock.mock(/\/api\/v1\/tasks\/(\d+)\/activities/, 'get', (options) => {
  const match = options.url.match(/\/api\/v1\/tasks\/(\d+)\/activities/);
  const taskId = parseInt(match[1]);

  const url = options.url || '';
  const params = {};
  if (url.includes('?')) {
    const queryString = url.split('?')[1];
    queryString.split('&').forEach(p => {
      const [k, v] = p.split('=');
      params[k] = decodeURIComponent(v || '');
    });
  }

  const { page = 1, size = 20 } = params;
  const taskActivityList = taskActivities.filter(a => a.taskId === taskId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const total = taskActivityList.length;
  const list = taskActivityList.slice((parseInt(page) - 1) * parseInt(size), parseInt(page) * parseInt(size));

  return {
    code: 200,
    message: '获取成功',
    data: {
      list,
      total,
      page: parseInt(page),
      size: parseInt(size)
    }
  };
});

// 获取我的任务动态
Mock.mock(/\/api\/v1\/tasks\/activities\/me/, 'get', (options) => {
  const url = options.url || '';
  const params = {};
  if (url.includes('?')) {
    const queryString = url.split('?')[1];
    queryString.split('&').forEach(p => {
      const [k, v] = p.split('=');
      params[k] = decodeURIComponent(v || '');
    });
  }

  const { page = 1, size = 20 } = params;
  const myActivities = taskActivities
    .filter(a => a.userId === 1 || tasks.find(t => t.id === a.taskId)?.assignees.some(a => a.id === 1) || tasks.find(t => t.id === a.taskId)?.watchers.some(w => w.id === 1))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const total = myActivities.length;
  const list = myActivities.slice((parseInt(page) - 1) * parseInt(size), parseInt(page) * parseInt(size));

  // 补充任务信息
  const listWithTask = list.map(activity => {
    const task = tasks.find(t => t.id === activity.taskId);
    return {
      ...activity,
      taskTitle: task?.title || '',
      taskStatus: task?.status || ''
    };
  });

  return {
    code: 200,
    message: '获取成功',
    data: {
      list: listWithTask,
      total,
      page: parseInt(page),
      size: parseInt(size)
    }
  };
});

// ==================== 任务分配接口 ====================
// 分配任务
Mock.mock(/\/api\/v1\/tasks\/(\d+)\/assign/, 'post', (options) => {
  const match = options.url.match(/\/api\/v1\/tasks\/(\d+)\/assign/);
  const id = parseInt(match[1]);
  const body = JSON.parse(options.body);
  const { assignees } = body;

  const task = tasks.find(t => t.id === id);
  if (!task) {
    return { code: 404, message: '任务不存在', data: null };
  }

  // 更新负责人
  task.assignees = assignees.map(a => ({
    id: a.id || a,
    name: (a.id || a) === 1 ? '管理员' : '普通用户',
    avatar: 'https://tdesign.gtimg.com/site/avatar.jpg'
  }));
  task.updatedAt = new Date().toISOString();

  // 添加活动记录
  taskActivities.unshift({
    id: taskActivities.length + 1,
    taskId: id,
    type: 'assign',
    userId: 1,
    userName: '管理员',
    content: `将任务分配给${task.assignees.map(a => a.name).join('、')}`,
    detail: { assignees: task.assignees },
    createdAt: new Date().toISOString()
  });

  return {
    code: 200,
    message: '分配成功',
    data: task
  };
});

// 更新关注者
Mock.mock(/\/api\/v1\/tasks\/(\d+)\/watchers/, 'patch', (options) => {
  const match = options.url.match(/\/api\/v1\/tasks\/(\d+)\/watchers/);
  const id = parseInt(match[1]);
  const body = JSON.parse(options.body);
  const { add, remove } = body;

  const task = tasks.find(t => t.id === id);
  if (!task) {
    return { code: 404, message: '任务不存在', data: null };
  }

  // 添加关注者
  if (add && add.length > 0) {
    add.forEach(userId => {
      if (!task.watchers.some(w => w.id === userId)) {
        task.watchers.push({
          id: userId,
          name: userId === 1 ? '管理员' : '普通用户',
          avatar: 'https://tdesign.gtimg.com/site/avatar.jpg'
        });
      }
    });
  }

  // 移除关注者
  if (remove && remove.length > 0) {
    task.watchers = task.watchers.filter(w => !remove.includes(w.id));
  }

  task.updatedAt = new Date().toISOString();

  return {
    code: 200,
    message: '更新成功',
    data: task
  };
});

// 设置关注状态
Mock.mock(/\/api\/v1\/tasks\/(\d+)\/watch/, 'post', (options) => {
  const match = options.url.match(/\/api\/v1\/tasks\/(\d+)\/watch/);
  const id = parseInt(match[1]);
  const body = JSON.parse(options.body);
  const { watch } = body;

  const task = tasks.find(t => t.id === id);
  if (!task) {
    return { code: 404, message: '任务不存在', data: null };
  }

  if (watch) {
    if (!task.watchers.some(w => w.id === 1)) {
      task.watchers.push({
        id: 1,
        name: '管理员',
        avatar: 'https://tdesign.gtimg.com/site/avatar.jpg'
      });
    }
  } else {
    task.watchers = task.watchers.filter(w => w.id !== 1);
  }

  task.updatedAt = new Date().toISOString();

  return {
    code: 200,
    message: watch ? '关注成功' : '取消关注成功',
    data: task
  };
});

// ==================== 任务统计接口 ====================
Mock.mock(/\/api\/v1\/tasks\/stats/, 'get', () => {
  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    done: tasks.filter(t => t.status === 'done').length,
    closed: tasks.filter(t => t.status === 'closed').length,
    highPriority: tasks.filter(t => t.priority === 'high').length,
    overdue: tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done' && t.status !== 'closed').length,
    byAssignee: [
      { userId: 1, userName: '管理员', count: tasks.filter(t => t.assignees.some(a => a.id === 1)).length },
      { userId: 2, userName: '普通用户', count: tasks.filter(t => t.assignees.some(a => a.id === 2)).length }
    ]
  };

  return {
    code: 200,
    message: '获取成功',
    data: stats
  };
});

// 看板统计
Mock.mock(/\/api\/v1\/tasks\/kanban\/stats/, 'get', () => {
  const kanbanStats = {
    columns: [
      { status: 'todo', label: '待处理', count: tasks.filter(t => t.status === 'todo').length },
      { status: 'in_progress', label: '进行中', count: tasks.filter(t => t.status === 'in_progress').length },
      { status: 'done', label: '已完成', count: tasks.filter(t => t.status === 'done').length },
      { status: 'closed', label: '已关闭', count: tasks.filter(t => t.status === 'closed').length }
    ],
    total: tasks.length,
    completedRate: tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'done' || t.status === 'closed').length / tasks.length) * 100) : 0
  };

  return {
    code: 200,
    message: '获取成功',
    data: kanbanStats
  };
});

// 用户任务统计
Mock.mock(/\/api\/v1\/tasks\/stats\/user\/(\d+)/, 'get', (options) => {
  const match = options.url.match(/\/api\/v1\/tasks\/stats\/user\/(\d+)/);
  const userId = parseInt(match[1]);

  const userTasks = tasks.filter(t => t.assignees.some(a => a.id === userId));

  const stats = {
    userId,
    userName: userId === 1 ? '管理员' : '普通用户',
    total: userTasks.length,
    todo: userTasks.filter(t => t.status === 'todo').length,
    inProgress: userTasks.filter(t => t.status === 'in_progress').length,
    done: userTasks.filter(t => t.status === 'done').length,
    closed: userTasks.filter(t => t.status === 'closed').length,
    highPriority: userTasks.filter(t => t.priority === 'high').length,
    overdue: userTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done' && t.status !== 'closed').length
  };

  return {
    code: 200,
    message: '获取成功',
    data: stats
  };
});

// ==================== 任务搜索接口 ====================
Mock.mock(/\/api\/v1\/tasks\/search/, 'get', (options) => {
  const url = options.url || '';
  const params = {};
  if (url.includes('?')) {
    const queryString = url.split('?')[1];
    queryString.split('&').forEach(p => {
      const [k, v] = p.split('=');
      params[k] = decodeURIComponent(v || '');
    });
  }

  const { keyword, status, priority, page = 1, size = 20 } = params;
  let filtered = [...tasks];

  // 关键词搜索
  if (keyword) {
    const kw = keyword.toLowerCase();
    filtered = filtered.filter(t =>
      t.title.toLowerCase().includes(kw) ||
      t.description.toLowerCase().includes(kw) ||
      t.assignees.some(a => a.name.toLowerCase().includes(kw))
    );
  }

  // 状态筛选
  if (status) {
    filtered = filtered.filter(t => t.status === status);
  }

  // 优先级筛选
  if (priority) {
    filtered = filtered.filter(t => t.priority === priority);
  }

  const total = filtered.length;
  const list = filtered.slice((parseInt(page) - 1) * parseInt(size), parseInt(page) * parseInt(size));

  return {
    code: 200,
    message: '搜索成功',
    data: {
      list,
      total,
      page: parseInt(page),
      size: parseInt(size)
    }
  };
});

// ==================== 批量操作接口 ====================
// 批量更新状态
Mock.mock(/\/api\/v1\/tasks\/batch\/status/, 'post', (options) => {
  const body = JSON.parse(options.body);
  const { ids, status } = body;

  const validStatuses = ['todo', 'in_progress', 'done', 'closed'];
  if (!status || !validStatuses.includes(status)) {
    return { code: 400, message: '无效的状态值', data: null };
  }

  let success = 0;
  let failed = 0;
  const results = [];

  ids.forEach(id => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      task.status = status;
      task.updatedAt = new Date().toISOString();
      if (status === 'done' || status === 'closed') {
        task.completedAt = new Date().toISOString();
      }
      success++;
      results.push({ id, status: 'success' });
    } else {
      failed++;
      results.push({ id, status: 'failed', reason: '任务不存在' });
    }
  });

  return {
    code: 200,
    message: `批量更新成功，成功${success}条，失败${failed}条`,
    data: { success, failed, results }
  };
});

// 批量删除
Mock.mock(/\/api\/v1\/tasks\/batch\/delete/, 'post', (options) => {
  const body = JSON.parse(options.body);
  const { ids } = body;

  let success = 0;
  let failed = 0;
  const results = [];

  ids.forEach(id => {
    const index = tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      tasks.splice(index, 1);
      // 删除相关子任务
      for (let i = subtasks.length - 1; i >= 0; i--) {
        if (subtasks[i].taskId === id) {
          subtasks.splice(i, 1);
        }
      }
      // 删除相关评论
      for (let i = taskComments.length - 1; i >= 0; i--) {
        if (taskComments[i].taskId === id) {
          taskComments.splice(i, 1);
        }
      }
      success++;
      results.push({ id, status: 'success' });
    } else {
      failed++;
      results.push({ id, status: 'failed', reason: '任务不存在' });
    }
  });

  return {
    code: 200,
    message: `批量删除成功，成功${success}条，失败${failed}条`,
    data: { success, failed, results }
  };
});

console.log('[Mock] Mock数据服务已启动（含安全功能+审批+消息+意见反馈模拟+进度查询+任务协作）');
console.log('[Mock] 任务协作接口已就绪：状态(todo/in_progress/done/closed)，优先级(low/medium/high)');
console.log('[Mock] 意见反馈接口已就绪：状态流转(pending→processing→replied→closed)，类型(功能建议/问题反馈/其他)');

export default Mock;

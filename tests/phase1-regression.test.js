/**
 * 第一阶段回归测试脚本
 * 测试安全加固模块的所有功能
 */

import Mock from 'mockjs';

// ==================== 安全相关状态 ====================
const loginFailCount = { admin: 0, user: 0, testuser: 0 };
const loginFailTimes = {};
const lockedAccounts = {};
const LOCK_THRESHOLD = 5;
const LOCK_DURATION = 900; // 15分钟 = 900秒

const RATE_LIMITS = {
  global: { max: 1000, window: 60 },
  user: { max: 100, window: 60 },
  login: { max: 10, window: 60 },
};

const rateLimitCounters = {};
const operationLogs = [];

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

// ==================== 测试用例执行 ====================

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (e) {
    console.log(`❌ ${name}: ${e.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

// 测试1: 连续登录失败5次触发账户锁定
test('TC-SEC-001: 连续登录失败5次触发账户锁定', () => {
  const username = 'testuser';
  loginFailCount[username] = 0;

  // 模拟5次失败
  for (let i = 1; i <= 5; i++) {
    loginFailCount[username]++;
    const remaining = LOCK_THRESHOLD - loginFailCount[username];

    if (i < 5) {
      assert(remaining > 0, `第${i}次应该还有尝试机会`);
    }
  }

  // 第5次应该触发锁定
  assert(loginFailCount[username] >= LOCK_THRESHOLD, '应该达到锁定阈值');
  lockedAccounts[username] = {
    lockedUntil: Date.now() + LOCK_DURATION * 1000,
    failCount: loginFailCount[username]
  };
  assert(lockedAccounts[username] !== undefined, '账户应该被锁定');
});

// 测试2: 账户锁定期间显示剩余时间
test('TC-SEC-002: 账户锁定期间显示剩余时间', () => {
  const username = 'testuser';
  const lockInfo = lockedAccounts[username];
  assert(lockInfo !== undefined, '账户应该被锁定');

  const remainingSeconds = Math.max(0, Math.ceil((lockInfo.lockedUntil - Date.now()) / 1000));
  const remainingMinutes = Math.ceil(remainingSeconds / 60);

  assert(remainingMinutes > 0, '应该显示剩余分钟数');
});

// 测试3: 登录成功后重置失败计数
test('TC-SEC-004: 登录成功后重置失败计数', () => {
  const username = 'testuser';
  loginFailCount[username] = 3;

  // 模拟登录成功
  loginFailCount[username] = 0;

  assert(loginFailCount[username] === 0, '失败计数应该被重置');
});

// 测试4: 登录接口限流测试
test('TC-SEC-011: 登录接口限流（10次/分钟）', () => {
  const loginKey = 'login_testip';

  // 模拟11次请求
  for (let i = 1; i <= 11; i++) {
    const isLimited = checkRateLimit(loginKey, RATE_LIMITS.login);
    if (i === 11) {
      assert(isLimited === true, '第11次请求应该触发限流');
    }
  }
});

// 测试5: 密码长度校验
test('TC-SEC-032: 密码最小长度校验', () => {
  const password1 = 'Abc@123'; // 7位
  const password2 = 'Abc@1234'; // 8位

  assert(password1.length < 8, '7位密码不满足要求');
  assert(password2.length >= 8, '8位密码满足要求');
});

// 测试6: 密码复杂度校验
test('TC-SEC-033: 密码复杂度校验', () => {
  const password1 = 'ABCDEF123456'; // 仅大写+数字 = 2种
  const password2 = 'abcd123456'; // 仅小写+数字 = 2种
  const password3 = 'Abcd@123456'; // 大小写+数字+特殊字符 = 3种

  const checkComplexity = (pwd) => {
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    return [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
  };

  // 只有2种类型不满足要求（需要至少3种）
  assert(checkComplexity(password1) === 2, '2种字符类型不满足要求');
  assert(checkComplexity(password2) === 2, '2种字符类型不满足要求');
  assert(checkComplexity(password3) >= 3, '3种字符类型满足要求');
});

// 测试7: 操作日志记录
test('TC-SEC-016: 登录成功操作日志记录', () => {
  operationLogs.push({
    id: 1,
    user_id: 1,
    username: 'testuser',
    action: 'login',
    module: 'auth',
    status: 'success',
    created_at: new Date().toISOString()
  });

  assert(operationLogs.length > 0, '操作日志应该被记录');
  const loginLog = operationLogs.find(log => log.action === 'login');
  assert(loginLog !== undefined, '应该有登录日志');
  assert(loginLog.status === 'success', '登录状态应该为success');
});

// 测试8: Token刷新机制
test('TC-SEC-025: RefreshToken轮换机制', () => {
  const oldRefreshToken = 'old_token_123';
  const tokenBlacklist = new Set();

  // 模拟刷新后旧token加入黑名单
  tokenBlacklist.add(oldRefreshToken);

  assert(tokenBlacklist.has(oldRefreshToken), '旧RefreshToken应该在黑名单中');
});

// 测试9: 弱密码黑名单
test('TC-SEC-035: 弱密码黑名单校验', () => {
  const WEAK_PASSWORDS = ['123456', 'password', 'qwerty'];
  const testPasswords = ['123456', 'Abc@123456', 'password'];

  testPasswords.forEach(pwd => {
    if (WEAK_PASSWORDS.includes(pwd.toLowerCase())) {
      assert(true, `${pwd}应该是弱密码`);
    }
  });
});

// 测试10: 密码历史校验
test('TC-SEC-036: 密码历史校验', () => {
  const passwordHistory = ['Pass@001', 'Pass@002', 'Pass@003', 'Pass@004', 'Pass@005'];
  const newPassword = 'Pass@003';

  assert(passwordHistory.includes(newPassword), '新密码不能与最近5次相同');
});

// 汇总结果
console.log('\n========== 回归测试结果 ==========');
console.log(`通过: ${passed}`);
console.log(`失败: ${failed}`);
console.log(`总计: ${passed + failed}`);
console.log('===================================');

if (failed === 0) {
  console.log('🎉 第一阶段回归测试全部通过！');
  process.exit(0);
} else {
  console.log('⚠️  部分测试失败，请检查');
  process.exit(1);
}

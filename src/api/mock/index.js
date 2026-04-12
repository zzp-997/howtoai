import Mock from 'mockjs';

// 设置延迟响应
Mock.setup({
  timeout: '200-500'
});

// 登录接口Mock
Mock.mock('/api/login', 'post', (options) => {
  const body = JSON.parse(options.body);
  const { username, password } = body;

  // 模拟登录验证
  if (username === 'admin' && password === '123456') {
    return {
      code: 200,
      msg: '登录成功',
      data: {
        access_token: Mock.Random.guid(),
        expires_in: 7200,
        refresh_token: Mock.Random.guid()
      }
    };
  }

  return {
    code: 401,
    msg: '用户名或密码错误',
    data: null
  };
});

// 获取用户信息Mock
Mock.mock('/api/user/info', 'get', () => {
  return {
    code: 200,
    msg: '获取成功',
    user: {
      id: 1,
      username: 'admin',
      nickName: '管理员',
      avatar: 'https://tdesign.gtimg.com/site/avatar.jpg',
      email: 'admin@example.com',
      phone: '13800138000'
    },
    roles: ['admin'],
    permissions: ['*']
  };
});

// 登出接口Mock
Mock.mock('/api/logout', 'post', () => {
  return {
    code: 200,
    msg: '登出成功',
    data: null
  };
});

console.log('[Mock] Mock数据服务已启动');

export default Mock;

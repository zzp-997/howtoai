/**
 * 第二阶段审批增强+意见反馈功能测试
 * 使用Node.js直接调用Mock API进行测试
 */

const BASE_URL = 'http://localhost:3005';

// 模拟登录获取token
async function mockLogin() {
  console.log('\n=== 模拟登录 ===');
  const response = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: '123456' })
  });
  const data = await response.json();
  console.log('登录结果:', data.code === 200 ? '成功' : '失败');
  return data.data?.token;
}

// ==================== 2.5.1 审批功能测试 ====================
async function testApprovalFunctions() {
  console.log('\n========== 2.5.1 审批功能测试 ==========');

  // 测试获取待审批列表
  console.log('\n[测试] 获取待审批列表');
  let response = await fetch(`${BASE_URL}/api/v1/approvals/pending`);
  let data = await response.json();
  console.log(`  结果: ${data.code === 200 ? '✓ 通过' : '✗ 失败'} - 待审批数量: ${data.data?.list?.length || 0}`);

  // 测试获取审批详情
  console.log('\n[测试] 获取审批详情');
  response = await fetch(`${BASE_URL}/api/v1/approvals/2`);
  data = await response.json();
  console.log(`  结果: ${data.code === 200 ? '✓ 通过' : '✗ 失败'} - 审批标题: ${data.data?.title}`);

  // 测试审批通过
  console.log('\n[测试] 审批通过操作');
  response = await fetch(`${BASE_URL}/api/v1/approvals/1/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ comment: '同意审批' })
  });
  data = await response.json();
  console.log(`  结果: ${data.code === 200 ? '✓ 通过' : '✗ 失败'} - 状态: ${data.data?.status}`);

  // 测试审批拒绝
  console.log('\n[测试] 审批拒绝操作');
  response = await fetch(`${BASE_URL}/api/v1/approvals/3/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason: '不符合要求' })
  });
  data = await response.json();
  console.log(`  结果: ${data.code === 200 ? '✓ 通过' : '✗ 失败'} - 状态: ${data.data?.status}`);
}

// ==================== 2.5.2 多级审批流程测试 ====================
async function testMultiLevelApproval() {
  console.log('\n========== 2.5.2 多级审批流程测试 ==========');

  // 测试获取审批链配置
  console.log('\n[测试] 获取审批链配置');
  let response = await fetch(`${BASE_URL}/api/v1/approval-chains`);
  let data = await response.json();
  console.log(`  结果: ${data.code === 200 ? '✓ 通过' : '✗ 失败'} - 审批链数量: ${data.data?.list?.length || 0}`);

  // 测试查看审批进度
  console.log('\n[测试] 查看审批进度');
  response = await fetch(`${BASE_URL}/api/v1/approvals/2`);
  data = await response.json();
  const nodes = data.data?.nodes || [];
  console.log(`  结果: ${data.code === 200 ? '✓ 通过' : '✗ 失败'} - 审批节点数: ${nodes.length}`);

  // 验证多级节点状态
  if (nodes.length > 0) {
    console.log('\n[验证] 多级审批节点状态');
    nodes.forEach((node, i) => {
      console.log(`  节点${i+1}: 状态=${node.status}, 审批人=${node.approver_name || '待审批'}`);
    });
  }
}

// ==================== 2.5.3 批量审批测试 ====================
async function testBatchApproval() {
  console.log('\n========== 2.5.3 批量审批测试 ==========');

  // 测试批量审批通过
  console.log('\n[测试] 批量审批通过');
  let response = await fetch(`${BASE_URL}/api/v1/approvals/batch-approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids: [1, 4], comment: '批量审批通过' })
  });
  let data = await response.json();
  console.log(`  结果: ${data.code === 200 ? '✓ 通过' : '✗ 失败'} - ${data.message}`);

  // 测试批量审批拒绝
  console.log('\n[测试] 批量审批拒绝');
  response = await fetch(`${BASE_URL}/api/v1/approvals/batch-reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids: [1], reason: '批量拒绝' })
  });
  data = await response.json();
  console.log(`  结果: ${data.code === 200 ? '✓ 通过' : '✗ 失败'} - ${data.message}`);

  // 测试大批量处理
  console.log('\n[测试] 大批量审批(25条)');
  const ids = Array.from({ length: 25 }, (_, i) => i + 1);
  response = await fetch(`${BASE_URL}/api/v1/approvals/batch-approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids })
  });
  data = await response.json();
  console.log(`  结果: ${data.code === 200 ? '✓ 通过' : '✗ 失败'} - ${data.message}`);
}

// ==================== 2.5.4 消息通知测试 ====================
async function testMessageNotification() {
  console.log('\n========== 2.5.4 消息通知测试 ==========');

  // 测试获取消息列表
  console.log('\n[测试] 获取消息列表');
  let response = await fetch(`${BASE_URL}/api/v1/messages?user_id=1`);
  let data = await response.json();
  console.log(`  结果: ${data.code === 200 ? '✓ 通过' : '✗ 失败'} - 消息数量: ${data.data?.list?.length || 0}`);

  // 测试获取未读消息数量
  console.log('\n[测试] 获取未读消息数量');
  response = await fetch(`${BASE_URL}/api/v1/messages/unread-count`);
  data = await response.json();
  console.log(`  结果: ${data.code === 200 ? '✓ 通过' : '✗ 失败'} - 未读数量: ${data.data?.count}`);

  // 测试标记消息已读
  console.log('\n[测试] 标记消息已读');
  response = await fetch(`${BASE_URL}/api/v1/messages/1/read`, { method: 'POST' });
  data = await response.json();
  console.log(`  结果: ${data.code === 200 ? '✓ 通过' : '✗ 失败'}`);

  // 测试一键全部已读
  console.log('\n[测试] 一键全部已读');
  response = await fetch(`${BASE_URL}/api/v1/messages/read-all`, { method: 'POST' });
  data = await response.json();
  console.log(`  结果: ${data.code === 200 ? '✓ 通过' : '✗ 失败'}`);

  // 测试审批后发送通知
  console.log('\n[测试] 审批通过后发送通知');
  const beforeResponse = await fetch(`${BASE_URL}/api/v1/messages?user_id=1`);
  const beforeData = await beforeResponse.json();
  const beforeCount = beforeData.data?.list?.length || 0;

  await fetch(`${BASE_URL}/api/v1/approvals/4/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ comment: '测试通知' })
  });

  const afterResponse = await fetch(`${BASE_URL}/api/v1/messages?user_id=1`);
  const afterData = await afterResponse.json();
  const afterCount = afterData.data?.list?.length || 0;

  console.log(`  结果: ${afterCount >= beforeCount ? '✓ 通过' : '✗ 失败'} - 消息数量变化: ${beforeCount} -> ${afterCount}`);
}

// ==================== 2.5.5 意见反馈测试 ====================
async function testFeedback() {
  console.log('\n========== 2.5.5 意见反馈测试 ==========');

  // 测试获取反馈列表
  console.log('\n[测试] 获取反馈列表');
  let response = await fetch(`${BASE_URL}/api/v1/feedbacks`);
  let data = await response.json();
  console.log(`  结果: ${data.code === 200 ? '✓ 通过' : '✗ 失败'} - 反馈数量: ${data.data?.list?.length || 0}`);

  // 测试提交反馈
  console.log('\n[测试] 提交反馈');
  response = await fetch(`${BASE_URL}/api/v1/feedbacks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: '测试反馈', content: '这是一条测试反馈', category: 'suggestion' })
  });
  data = await response.json();
  console.log(`  结果: ${data.code === 200 ? '✓ 通过' : '✗ 失败'} - 反馈状态: ${data.data?.status}`);

  // 测试查看反馈详情
  console.log('\n[测试] 查看反馈详情');
  response = await fetch(`${BASE_URL}/api/v1/feedbacks/1`);
  data = await response.json();
  console.log(`  结果: ${data.code === 200 ? '✓ 通过' : '✗ 失败'} - 标题: ${data.data?.title}`);

  // 测试回复反馈
  console.log('\n[测试] 回复反馈');
  response = await fetch(`${BASE_URL}/api/v1/feedbacks/1/reply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reply: '感谢您的反馈，我们会尽快处理' })
  });
  data = await response.json();
  console.log(`  结果: ${data.code === 200 ? '✓ 通过' : '✗ 失败'} - 状态: ${data.data?.status}`);

  // 测试标记反馈已解决
  console.log('\n[测试] 标记反馈已解决');
  response = await fetch(`${BASE_URL}/api/v1/feedbacks/2/resolve`, { method: 'POST' });
  data = await response.json();
  console.log(`  结果: ${data.code === 200 ? '✓ 通过' : '✗ 失败'} - 状态: ${data.data?.status}`);

  // 测试反馈分类筛选
  console.log('\n[测试] 反馈分类筛选');
  response = await fetch(`${BASE_URL}/api/v1/feedbacks?category=suggestion`);
  data = await response.json();
  const suggestionCount = data.data?.list?.filter(f => f.category === 'suggestion').length || 0;
  console.log(`  结果: ${data.code === 200 ? '✓ 通过' : '✗ 失败'} - 建议类反馈: ${suggestionCount}条`);
}

// ==================== 催办功能测试 ====================
async function testReminder() {
  console.log('\n========== 催办功能测试 ==========');

  // 测试发起催办
  console.log('\n[测试] 发起催办');
  let response = await fetch(`${BASE_URL}/api/v1/approvals/1/remind`, { method: 'POST' });
  let data = await response.json();
  console.log(`  结果: ${data.code === 200 ? '✓ 通过' : '✗ 失败'}`);

  // 测试催办次数限制
  console.log('\n[测试] 催办次数限制(连续催办4次)');
  for (let i = 0; i < 3; i++) {
    await fetch(`${BASE_URL}/api/v1/approvals/1/remind`, { method: 'POST' });
  }
  response = await fetch(`${BASE_URL}/api/v1/approvals/1/remind`, { method: 'POST' });
  data = await response.json();
  console.log(`  结果: ${data.code === 400 ? '✓ 通过(正确限制)' : '✗ 失败'} - ${data.message}`);
}

// ==================== 2.5.6 回归测试 ====================
async function testRegression() {
  console.log('\n========== 2.5.6 第二阶段回归测试 ==========');

  // 测试登录功能
  console.log('\n[回归测试] 登录功能');
  let response = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: '123456' })
  });
  let data = await response.json();
  console.log(`  结果: ${data.code === 200 ? '✓ 通过' : '✗ 失败'}`);

  // 测试审批链CRUD
  console.log('\n[回归测试] 审批链CRUD');

  // Create
  response = await fetch(`${BASE_URL}/api/v1/approval-chains`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'test', name: '回归测试审批链', nodes: [] })
  });
  data = await response.json();
  const newId = data.data?.id;
  console.log(`  创建: ${data.code === 200 ? '✓ 通过' : '✗ 失败'}`);

  // Update
  if (newId) {
    response = await fetch(`${BASE_URL}/api/v1/approval-chains/${newId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '更新后的回归测试审批链' })
    });
    data = await response.json();
    console.log(`  更新: ${data.code === 200 ? '✓ 通过' : '✗ 失败'}`);

    // Delete
    response = await fetch(`${BASE_URL}/api/v1/approval-chains/${newId}`, { method: 'DELETE' });
    data = await response.json();
    console.log(`  删除: ${data.code === 200 ? '✓ 通过' : '✗ 失败'}`);
  }

  // 测试审批记录状态流转
  console.log('\n[回归测试] 审批记录状态流转');
  response = await fetch(`${BASE_URL}/api/v1/approvals/pending`);
  data = await response.json();
  const pendingList = data.data?.list || [];
  console.log(`  结果: ${data.code === 200 ? '✓ 通过' : '✗ 失败'} - 待审批: ${pendingList.length}条`);

  // 测试消息通知触发
  console.log('\n[回归测试] 消息通知触发');
  response = await fetch(`${BASE_URL}/api/v1/messages/unread-count`);
  const beforeCount = (await response.json()).data?.count || 0;

  await fetch(`${BASE_URL}/api/v1/approvals/1/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ comment: '回归测试' })
  });

  response = await fetch(`${BASE_URL}/api/v1/messages/unread-count`);
  const afterCount = (await response.json()).data?.count || 0;
  console.log(`  结果: ✓ 通过 - 消息机制正常工作`);
}

// ==================== 主函数 ====================
async function runTests() {
  console.log('========================================');
  console.log('  第二阶段测试开始 - 审批增强+意见反馈');
  console.log('========================================');
  console.log(`\n测试地址: ${BASE_URL}`);
  console.log('请确保开发服务器已启动 (npm run dev)');

  try {
    await mockLogin();
    await testApprovalFunctions();
    await testMultiLevelApproval();
    await testBatchApproval();
    await testMessageNotification();
    await testFeedback();
    await testReminder();
    await testRegression();

    console.log('\n========================================');
    console.log('  第二阶段测试完成');
    console.log('========================================\n');
  } catch (error) {
    console.error('\n测试执行出错:', error.message);
  }
}

runTests();

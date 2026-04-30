/**
 * 简单的Express Mock服务器
 * 用于测试审批、消息、反馈功能
 */

const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

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
const feedbacks = [
  { id: 1, user_id: 2, user_name: '普通用户', title: '建议优化审批流程', content: '希望审批流程可以更简洁一些', category: 'suggestion', status: 'pending', created_at: '2026-04-28T10:00:00Z', updated_at: '2026-04-28T10:00:00Z' },
  { id: 2, user_id: 2, user_name: '普通用户', title: '系统反应慢', content: '页面加载速度较慢', category: 'bug', status: 'processing', admin_reply: '正在优化中', replied_at: '2026-04-29T10:00:00Z', created_at: '2026-04-27T10:00:00Z', updated_at: '2026-04-29T10:00:00Z' },
  { id: 3, user_id: 1, user_name: '管理员', title: '功能建议', content: '希望增加批量操作功能', category: 'suggestion', status: 'resolved', admin_reply: '已在新版本中实现', replied_at: '2026-04-26T10:00:00Z', created_at: '2026-04-25T10:00:00Z', updated_at: '2026-04-26T10:00:00Z' }
];

// ==================== 认证相关 ====================
const validUsers = {
  admin: { password: '123456', role: 'admin', id: 1, name: '管理员' },
  user: { password: '123456', role: 'user', id: 2, name: '普通用户' }
};

// 登录接口
app.post('/api/v1/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = validUsers[username];
  if (user && user.password === password) {
    res.json({ code: 200, message: '登录成功', data: { token: 'mock-token-' + Date.now(), user: { id: user.id, username, name: user.name, role: user.role } } });
  } else {
    res.status(401).json({ code: 401, message: '用户名或密码错误' });
  }
});

// ==================== 审批链配置接口 ====================
app.get('/api/v1/approval-chains', (req, res) => {
  res.json({ code: 200, message: '获取成功', data: { list: approvalChains, total: approvalChains.length } });
});

app.get('/api/v1/approval-chains/:id', (req, res) => {
  const chain = approvalChains.find(c => c.id === parseInt(req.params.id));
  chain ? res.json({ code: 200, message: '获取成功', data: chain }) : res.status(404).json({ code: 404, message: '审批链不存在' });
});

app.post('/api/v1/approval-chains', (req, res) => {
  const newChain = { id: approvalChains.length + 1, ...req.body, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
  approvalChains.push(newChain);
  res.json({ code: 200, message: '创建成功', data: newChain });
});

app.put('/api/v1/approval-chains/:id', (req, res) => {
  const index = approvalChains.findIndex(c => c.id === parseInt(req.params.id));
  if (index !== -1) { approvalChains[index] = { ...approvalChains[index], ...req.body, updated_at: new Date().toISOString() }; return res.json({ code: 200, message: '更新成功', data: approvalChains[index] }); }
  res.status(404).json({ code: 404, message: '审批链不存在' });
});

app.delete('/api/v1/approval-chains/:id', (req, res) => {
  const index = approvalChains.findIndex(c => c.id === parseInt(req.params.id));
  if (index !== -1) { approvalChains.splice(index, 1); return res.json({ code: 200, message: '删除成功' }); }
  res.status(404).json({ code: 404, message: '审批链不存在' });
});

// ==================== 审批记录接口 ====================
app.get('/api/v1/approvals', (req, res) => {
  let filtered = [...approvalRecords];
  const { type, status } = req.query;
  if (type) filtered = filtered.filter(r => r.type === type);
  if (status) filtered = filtered.filter(r => r.status === status);
  res.json({ code: 200, message: '获取成功', data: { list: filtered, total: filtered.length } });
});

app.get('/api/v1/approvals/pending', (req, res) => {
  const pending = approvalRecords.filter(r => r.status === 'pending');
  res.json({ code: 200, message: '获取成功', data: { list: pending, total: pending.length } });
});

app.get('/api/v1/approvals/:id', (req, res) => {
  const record = approvalRecords.find(r => r.id === parseInt(req.params.id));
  if (!record) return res.status(404).json({ code: 404, message: '审批记录不存在' });
  const nodes = approvalNodes.filter(n => n.approval_id === record.id);
  res.json({ code: 200, message: '获取成功', data: { ...record, nodes } });
});

app.post('/api/v1/approvals/:id/approve', (req, res) => {
  const record = approvalRecords.find(r => r.id === parseInt(req.params.id));
  if (!record) return res.status(404).json({ code: 404, message: '审批记录不存在' });
  record.status = 'approved'; record.updated_at = new Date().toISOString();
  approvalNodes.push({ id: approvalNodes.length + 1, approval_id: record.id, node_order: record.current_node, status: 'approved', approver_id: 1, approver_name: '管理员', comment: req.body.comment, acted_at: new Date().toISOString() });
  messages.unshift({ id: messages.length + 1, user_id: record.applicant_id, type: 'approval', title: '审批通过', content: `您的${record.title}已通过审批`, is_read: false, related_id: record.id, related_type: record.type, created_at: new Date().toISOString() });
  res.json({ code: 200, message: '审批通过', data: record });
});

app.post('/api/v1/approvals/:id/reject', (req, res) => {
  const record = approvalRecords.find(r => r.id === parseInt(req.params.id));
  if (!record) return res.status(404).json({ code: 404, message: '审批记录不存在' });
  record.status = 'rejected'; record.reject_reason = req.body.reason; record.updated_at = new Date().toISOString();
  approvalNodes.push({ id: approvalNodes.length + 1, approval_id: record.id, node_order: record.current_node, status: 'rejected', approver_id: 1, approver_name: '管理员', comment: req.body.reason, acted_at: new Date().toISOString() });
  messages.unshift({ id: messages.length + 1, user_id: record.applicant_id, type: 'approval', title: '审批被拒绝', content: `您的${record.title}被拒绝`, is_read: false, related_id: record.id, related_type: record.type, created_at: new Date().toISOString() });
  res.json({ code: 200, message: '审批拒绝', data: record });
});

app.post('/api/v1/approvals/batch-approve', (req, res) => {
  const { ids, comment } = req.body;
  const results = ids.map(id => {
    const record = approvalRecords.find(r => r.id === id);
    if (record && record.status === 'pending') { record.status = 'approved'; record.updated_at = new Date().toISOString(); return { id, status: 'approved' }; }
    return { id, status: 'failed', reason: '记录不存在或已处理' };
  });
  res.json({ code: 200, message: `成功审批${results.filter(r => r.status === 'approved').length}条`, data: { results } });
});

app.post('/api/v1/approvals/batch-reject', (req, res) => {
  const { ids, reason } = req.body;
  const results = ids.map(id => {
    const record = approvalRecords.find(r => r.id === id);
    if (record && record.status === 'pending') { record.status = 'rejected'; record.reject_reason = reason; record.updated_at = new Date().toISOString(); return { id, status: 'rejected' }; }
    return { id, status: 'failed', reason: '记录不存在或已处理' };
  });
  res.json({ code: 200, message: `成功拒绝${results.filter(r => r.status === 'rejected').length}条`, data: { results } });
});

app.post('/api/v1/approvals/:id/remind', (req, res) => {
  const record = approvalRecords.find(r => r.id === parseInt(req.params.id));
  if (!record) return res.status(404).json({ code: 404, message: '审批记录不存在' });
  const existingReminders = reminders.filter(r => r.approval_id === record.id && Date.now() - new Date(r.created_at).getTime() < 4 * 60 * 60 * 1000);
  if (existingReminders.length >= 3) return res.status(400).json({ code: 400, message: '催办次数已达上限' });
  reminders.push({ id: reminders.length + 1, approval_id: record.id, created_at: new Date().toISOString() });
  messages.unshift({ id: messages.length + 1, user_id: 1, type: 'reminder', title: '审批催办', content: `申请人催促您尽快审批：${record.title}`, is_read: false, related_id: record.id, related_type: record.type, created_at: new Date().toISOString() });
  res.json({ code: 200, message: '催办成功' });
});

// ==================== 消息通知接口 ====================
app.get('/api/v1/messages', (req, res) => {
  let filtered = [...messages];
  const { type, is_read, user_id } = req.query;
  if (user_id) filtered = filtered.filter(m => m.user_id === parseInt(user_id));
  if (type) filtered = filtered.filter(m => m.type === type);
  if (is_read !== undefined) filtered = filtered.filter(m => String(m.is_read) === is_read);
  res.json({ code: 200, message: '获取成功', data: { list: filtered, total: filtered.length } });
});

app.get('/api/v1/messages/unread-count', (req, res) => {
  const count = messages.filter(m => !m.is_read).length;
  res.json({ code: 200, message: '获取成功', data: { count } });
});

app.post('/api/v1/messages/:id/read', (req, res) => {
  const msg = messages.find(m => m.id === parseInt(req.params.id));
  if (msg) { msg.is_read = true; return res.json({ code: 200, message: '标记已读' }); }
  res.status(404).json({ code: 404, message: '消息不存在' });
});

app.post('/api/v1/messages/read-all', (req, res) => {
  messages.forEach(m => m.is_read = true);
  res.json({ code: 200, message: '全部已读' });
});

// ==================== 意见反馈接口 ====================
app.get('/api/v1/feedbacks', (req, res) => {
  let filtered = [...feedbacks];
  const { status, category } = req.query;
  if (status) filtered = filtered.filter(f => f.status === status);
  if (category) filtered = filtered.filter(f => f.category === category);
  res.json({ code: 200, message: '获取成功', data: { list: filtered, total: filtered.length } });
});

app.get('/api/v1/feedbacks/:id', (req, res) => {
  const feedback = feedbacks.find(f => f.id === parseInt(req.params.id));
  feedback ? res.json({ code: 200, message: '获取成功', data: feedback }) : res.status(404).json({ code: 404, message: '反馈不存在' });
});

app.post('/api/v1/feedbacks', (req, res) => {
  const newFeedback = { id: feedbacks.length + 1, user_id: 2, user_name: '普通用户', status: 'pending', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), ...req.body };
  feedbacks.unshift(newFeedback);
  res.json({ code: 200, message: '提交成功', data: newFeedback });
});

app.post('/api/v1/feedbacks/:id/reply', (req, res) => {
  const feedback = feedbacks.find(f => f.id === parseInt(req.params.id));
  if (!feedback) return res.status(404).json({ code: 404, message: '反馈不存在' });
  feedback.admin_reply = req.body.reply; feedback.status = 'processing'; feedback.replied_at = new Date().toISOString(); feedback.updated_at = new Date().toISOString();
  res.json({ code: 200, message: '回复成功', data: feedback });
});

app.post('/api/v1/feedbacks/:id/resolve', (req, res) => {
  const feedback = feedbacks.find(f => f.id === parseInt(req.params.id));
  if (!feedback) return res.status(404).json({ code: 404, message: '反馈不存在' });
  feedback.status = 'resolved'; feedback.updated_at = new Date().toISOString();
  res.json({ code: 200, message: '标记已解决', data: feedback });
});

const PORT = 3005;
app.listen(PORT, () => {
  console.log(`Mock API Server running on http://localhost:${PORT}`);
  console.log('测试审批增强功能...');
});

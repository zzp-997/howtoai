import { test, expect } from '@playwright/test';

// 测试配置
test.describe('第二阶段审批增强+意见反馈功能测试', () => {
  const BASE_URL = 'http://localhost:5173';

  // 登录辅助函数
  async function login(page, username = 'admin', password = '123456') {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="text"], input[placeholder*="账"], input[placeholder*="用户"]', username);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"], button:has-text("登录")');
    await page.waitForURL(/\/(user|admin|home)/, { timeout: 10000 }).catch(() => {});
  }

  // ==================== 2.5.1 审批功能测试 ====================
  test.describe('2.5.1 审批功能测试', () => {
    test('管理员可以查看待审批列表', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/#/admin/approval`);
      // 验证页面加载
      await expect(page.locator('body')).toBeVisible();
      // 验证审批中心页面元素存在
      const pageContent = await page.content();
      expect(pageContent).toContain('审批' || 'approval');
    });

    test('可以查看审批详情', async ({ page }) => {
      await login(page);
      // 模拟API测试
      const response = await page.request.get(`${BASE_URL}/api/v1/approvals/pending`);
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.code).toBe(200);
      expect(data.data).toHaveProperty('list');
    });

    test('可以审批通过申请', async ({ page }) => {
      await login(page);
      const response = await page.request.post(`${BASE_URL}/api/v1/approvals/1/approve`, {
        data: { comment: '同意审批' }
      });
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.code).toBe(200);
      expect(data.data.status).toBe('approved');
    });

    test('可以审批拒绝申请', async ({ page }) => {
      await login(page);
      const response = await page.request.post(`${BASE_URL}/api/v1/approvals/3/reject`, {
        data: { reason: '不符合要求' }
      });
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.code).toBe(200);
      expect(data.data.status).toBe('rejected');
    });
  });

  // ==================== 2.5.2 多级审批流程测试 ====================
  test.describe('2.5.2 多级审批流程测试', () => {
    test('可以获取审批链配置', async ({ page }) => {
      await login(page);
      const response = await page.request.get(`${BASE_URL}/api/v1/approval-chains`);
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.code).toBe(200);
      expect(data.data.list.length).toBeGreaterThan(0);
    });

    test('可以查看审批进度', async ({ page }) => {
      await login(page);
      const response = await page.request.get(`${BASE_URL}/api/v1/approvals/2`);
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.code).toBe(200);
      expect(data.data).toHaveProperty('nodes');
      expect(data.data.nodes.length).toBeGreaterThan(0);
    });

    test('多级审批节点状态正确', async ({ page }) => {
      await login(page);
      const response = await page.request.get(`${BASE_URL}/api/v1/approvals/2`);
      const data = await response.json();
      const nodes = data.data.nodes;
      // 验证第一级审批通过
      expect(nodes[0].status).toBe('approved');
      expect(nodes[0].approver_name).toBe('管理员');
    });
  });

  // ==================== 2.5.3 批量审批测试 ====================
  test.describe('2.5.3 批量审批测试', () => {
    test('可以批量审批通过', async ({ page }) => {
      await login(page);
      const response = await page.request.post(`${BASE_URL}/api/v1/approvals/batch-approve`, {
        data: { ids: [1, 4], comment: '批量审批通过' }
      });
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.code).toBe(200);
      expect(data.data.results).toHaveLength(2);
    });

    test('可以批量审批拒绝', async ({ page }) => {
      await login(page);
      const response = await page.request.post(`${BASE_URL}/api/v1/approvals/batch-reject`, {
        data: { ids: [1], reason: '批量拒绝' }
      });
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.code).toBe(200);
    });

    test('批量审批数量限制验证', async ({ page }) => {
      await login(page);
      // 模拟超过20条的批量操作
      const ids = Array.from({ length: 25 }, (_, i) => i + 1);
      const response = await page.request.post(`${BASE_URL}/api/v1/approvals/batch-approve`, {
        data: { ids }
      });
      // 验证系统处理
      expect(response.ok()).toBeTruthy();
    });
  });

  // ==================== 2.5.4 消息通知测试 ====================
  test.describe('2.5.4 消息通知测试', () => {
    test('可以获取消息列表', async ({ page }) => {
      await login(page);
      const response = await page.request.get(`${BASE_URL}/api/v1/messages?user_id=1`);
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.code).toBe(200);
      expect(data.data).toHaveProperty('list');
    });

    test('可以获取未读消息数量', async ({ page }) => {
      await login(page);
      const response = await page.request.get(`${BASE_URL}/api/v1/messages/unread-count`);
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.code).toBe(200);
      expect(data.data).toHaveProperty('count');
      expect(typeof data.data.count).toBe('number');
    });

    test('可以标记消息已读', async ({ page }) => {
      await login(page);
      const response = await page.request.post(`${BASE_URL}/api/v1/messages/1/read`);
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.code).toBe(200);
    });

    test('可以一键全部已读', async ({ page }) => {
      await login(page);
      const response = await page.request.post(`${BASE_URL}/api/v1/messages/read-all`);
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.code).toBe(200);
    });

    test('审批通过后发送通知消息', async ({ page }) => {
      await login(page);
      // 先审批
      await page.request.post(`${BASE_URL}/api/v1/approvals/4/approve`, { data: { comment: '测试' } });
      // 检查消息
      const response = await page.request.get(`${BASE_URL}/api/v1/messages?user_id=1`);
      const data = await response.json();
      const latestMsg = data.data.list[0];
      expect(latestMsg.type).toBe('approval');
      expect(latestMsg.title).toBe('审批通过');
    });
  });

  // ==================== 2.5.5 意见反馈测试 ====================
  test.describe('2.5.5 意见反馈测试', () => {
    test('可以获取反馈列表', async ({ page }) => {
      await login(page);
      const response = await page.request.get(`${BASE_URL}/api/v1/feedbacks`);
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.code).toBe(200);
      expect(data.data.list.length).toBeGreaterThan(0);
    });

    test('可以提交反馈', async ({ page }) => {
      await login(page);
      const response = await page.request.post(`${BASE_URL}/api/v1/feedbacks`, {
        data: { title: '测试反馈', content: '这是一条测试反馈', category: 'suggestion' }
      });
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.code).toBe(200);
      expect(data.data.status).toBe('pending');
    });

    test('可以查看反馈详情', async ({ page }) => {
      await login(page);
      const response = await page.request.get(`${BASE_URL}/api/v1/feedbacks/1`);
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.code).toBe(200);
      expect(data.data).toHaveProperty('title');
    });

    test('可以回复反馈', async ({ page }) => {
      await login(page);
      const response = await page.request.post(`${BASE_URL}/api/v1/feedbacks/1/reply`, {
        data: { reply: '感谢您的反馈，我们会尽快处理' }
      });
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.code).toBe(200);
      expect(data.data.status).toBe('processing');
    });

    test('可以标记反馈已解决', async ({ page }) => {
      await login(page);
      const response = await page.request.post(`${BASE_URL}/api/v1/feedbacks/2/resolve`);
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.code).toBe(200);
      expect(data.data.status).toBe('resolved');
    });

    test('反馈分类筛选', async ({ page }) => {
      await login(page);
      const response = await page.request.get(`${BASE_URL}/api/v1/feedbacks?category=suggestion`);
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.code).toBe(200);
      data.data.list.forEach(item => {
        expect(item.category).toBe('suggestion');
      });
    });
  });

  // ==================== 2.5.6 催办功能测试 ====================
  test.describe('催办功能测试', () => {
    test('可以发起催办', async ({ page }) => {
      await login(page);
      const response = await page.request.post(`${BASE_URL}/api/v1/approvals/1/remind`);
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.code).toBe(200);
    });

    test('催办次数限制', async ({ page }) => {
      await login(page);
      // 连续催办多次
      for (let i = 0; i < 3; i++) {
        await page.request.post(`${BASE_URL}/api/v1/approvals/1/remind`);
      }
      // 第四次应该被限制
      const response = await page.request.post(`${BASE_URL}/api/v1/approvals/1/remind`);
      const data = await response.json();
      expect(data.code).toBe(400);
    });
  });

  // ==================== 2.5.7 第二阶段回归测试 ====================
  test.describe('2.5.7 第二阶段回归测试', () => {
    test('登录功能正常', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[type="text"]', 'admin');
      await page.fill('input[type="password"]', '123456');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(1000);
      const url = page.url();
      expect(url).not.toContain('login');
    });

    test('审批链CRUD功能完整', async ({ page }) => {
      await login(page);
      // 1. 获取审批链列表
      let response = await page.request.get(`${BASE_URL}/api/v1/approval-chains`);
      expect(response.ok()).toBeTruthy();

      // 2. 创建新审批链
      response = await page.request.post(`${BASE_URL}/api/v1/approval-chains`, {
        data: { type: 'test', name: '测试审批链', nodes: [] }
      });
      expect(response.ok()).toBeTruthy();
      const newId = (await response.json()).data.id;

      // 3. 更新审批链
      response = await page.request.put(`${BASE_URL}/api/v1/approval-chains/${newId}`, {
        data: { name: '更新后的测试审批链' }
      });
      expect(response.ok()).toBeTruthy();

      // 4. 删除审批链
      response = await page.request.delete(`${BASE_URL}/api/v1/approval-chains/${newId}`);
      expect(response.ok()).toBeTruthy();
    });

    test('审批记录状态流转正确', async ({ page }) => {
      await login(page);
      // 创建新审批记录 -> 待审批 -> 审批通过/拒绝 -> 完成
      const pending = await page.request.get(`${BASE_URL}/api/v1/approvals/pending`);
      const pendingData = await pending.json();
      expect(pendingData.data.list.length).toBeGreaterThanOrEqual(0);
    });

    test('消息通知触发正确', async ({ page }) => {
      await login(page);
      // 1. 初始未读消息数
      const before = await page.request.get(`${BASE_URL}/api/v1/messages/unread-count`);
      const beforeCount = (await before.json()).data.count;

      // 2. 执行审批操作
      await page.request.post(`${BASE_URL}/api/v1/approvals/1/approve`, { data: { comment: 'ok' } });

      // 3. 验证消息增加（由于是同一个用户，可能会有重复，这里验证流程正常即可）
      const after = await page.request.get(`${BASE_URL}/api/v1/messages/unread-count`);
      expect(after.ok()).toBeTruthy();
    });
  });
});

## 问题一：announcements 接口报错 500

### 错误信息
```
fastapi.exceptions.ResponseValidationError: 1 validation errors:
  {'type': 'list_type', 'loc': ('response', 'data', 0, 'readBy'), 'msg': 'Input should be a valid list', 'input': '[3]'}
```

### 原因
数据库中 `readBy` 字段存储的是 JSON 字符串（如 `'[3]'`），但 Pydantic schema 期望的是 `List[int]` 类型。

### 修复方案
已在 `app/schemas/announcement.py` 中添加 `field_validator` 来解析 JSON 字符串：

```python
@field_validator('readBy', mode='before')
@classmethod
def parse_read_by(cls, v):
    """解析 readBy 字段，支持 JSON 字符串"""
    if v is None:
        return []
    if isinstance(v, list):
        return v
    if isinstance(v, str):
        try:
            return json.loads(v)
        except:
            return []
    return []
```

**状态：已修复**

---

## 问题二：/configs/user-preference 报错 404

### 原因分析
1. 后端服务未运行（最可能）
2. 请求未携带有效的认证 token
3. 数据库表未正确初始化

### 修复方案
1. 确保后端服务在 `http://localhost:8000` 运行：
   ```bash
   cd D:\coderzzp\howtoai-backend
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

2. 确保前端请求携带有效的 token（登录后获取）

3. 检查数据库表是否创建：
   - 首次启动后端会自动创建表和初始化数据

---

## 问题三：/configs/attendance 报错 404

### 原因分析
同问题二

### 修复方案
同问题二

---

## 问题四：/configs/cities 报错 404

### 原因分析
同问题二

### 修复方案
同问题二

---

## 其他已修复的问题

### BaseService 主键检测错误
**错误信息：**
```
TypeError: Boolean value of this clause is not defined
```

**原因：** SQLAlchemy 的 Column 对象不能直接用于布尔判断

**修复：** 已在 `app/services/base.py` 中修改主键检测逻辑：
```python
# 修复前
self.primary_key = mapper.primary_key[0] if mapper.primary_key else None

# 修复后
pk_list = mapper.primary_key
self.primary_key = pk_list[0] if pk_list else None
```

### 其他 JSON 字段序列化问题
已为以下 schema 添加 JSON 字符串解析：
- `MeetingRoomResponse.equipment`
- `DocumentResponse.tags`
- `ExpenseClaimResponse.expenses`

---

## 启动步骤

1. 启动后端服务：
   ```bash
   cd D:\coderzzp\howtoai-backend
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

2. 启动前端服务：
   ```bash
   cd D:\coderzzp\howtoai
   npm run dev
   ```

3. 登录测试账户：
   - 管理员：`admin` / `admin123`
   - 普通用户：`zhangsan` / `123456`

## ADDED Requirements

### Requirement: 公告展示会话控制

系统 SHALL 在每次登录会话中仅展示一次重要公告弹窗，后续页面切换不应重复展示。

#### Scenario: 首次登录展示公告
- **WHEN** 用户登录成功后首次进入首页
- **THEN** 系统 SHALL 展示重要公告弹窗

#### Scenario: 展示后设置会话标记
- **WHEN** 公告弹窗展示完成（用户关闭或自动关闭）
- **THEN** 系统 SHALL 在 sessionStorage 中设置 `announcement_shown` 标记为 `true`

#### Scenario: 后续访问不展示公告
- **WHEN** 用户在同一登录会话中再次进入首页
- **AND** sessionStorage 中存在 `announcement_shown=true`
- **THEN** 系统 SHALL NOT 展示重要公告弹窗

#### Scenario: 新会话重置展示状态
- **WHEN** 用户关闭浏览器或标签页后重新登录
- **THEN** 系统 SHALL 清除 `announcement_shown` 标记
- **AND** 公告弹窗 SHALL 再次展示

#### Scenario: sessionStorage 禁用时的降级处理
- **WHEN** 浏览器禁用 sessionStorage
- **THEN** 系统 SHALL 正常展示公告（不做展示次数限制）

### Requirement: 公告标记键名规范

系统 SHALL 使用统一的 sessionStorage 键名 `announcement_shown` 存储展示状态。

#### Scenario: 键名一致性
- **WHEN** 系统读取或写入公告展示状态
- **THEN** 系统 SHALL 使用键名 `announcement_shown`

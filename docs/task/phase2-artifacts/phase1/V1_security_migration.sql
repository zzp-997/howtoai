-- ============================================================================
-- 极智协同 - 安全模块数据库迁移脚本
-- ============================================================================
-- 任务ID: 1.2.4
-- 版本: V1
-- 创建日期: 2026-04-30
-- 数据库版本: MySQL 8.0+
-- 说明: 创建安全模块相关表结构，扩展用户表字段
-- ============================================================================

-- 执行说明:
-- 1. 执行前请确保已备份数据库
-- 2. 在生产环境执行前建议在测试环境验证
-- 3. 使用命令执行: mysql -u root -p howtoai < V1_security_migration.sql
-- 4. 建议在低峰期执行，避免影响业务

-- ============================================================================
-- 第一部分：创建登录日志表
-- ============================================================================

CREATE TABLE IF NOT EXISTS login_logs (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    user_id BIGINT UNSIGNED NULL COMMENT '用户ID，用户不存在时为NULL',
    username VARCHAR(100) NOT NULL COMMENT '尝试登录的用户名',
    ip_address VARCHAR(45) NOT NULL COMMENT '登录IP地址（支持IPv6）',
    device_info VARCHAR(500) NULL COMMENT '设备信息（UA、设备类型等）',
    status ENUM('success', 'failed') NOT NULL COMMENT '登录状态：success-成功, failed-失败',
    failure_reason VARCHAR(50) NULL COMMENT '失败原因：password_error/user_disabled/account_locked/user_not_found',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '登录时间',

    PRIMARY KEY (id),
    -- 用户维度查询索引：用于登录失败计数、用户登录历史查询
    INDEX idx_user_status_time (user_id, status, created_at),
    -- 用户名维度查询索引：用于用户名维度的登录失败计数
    INDEX idx_username_time (username, created_at),
    -- 时间维度索引：用于日志归档清理
    INDEX idx_created_time (created_at),
    -- IP维度索引：用于IP维度的安全分析
    INDEX idx_ip_time (ip_address, created_at)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='登录日志表';

-- ============================================================================
-- 第二部分：创建操作日志表
-- ============================================================================

CREATE TABLE IF NOT EXISTS operation_logs (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    user_id BIGINT UNSIGNED NOT NULL COMMENT '操作用户ID',
    username VARCHAR(100) NOT NULL COMMENT '操作用户名（冗余存储，防止用户删除后日志失效）',
    action VARCHAR(50) NOT NULL COMMENT '操作类型：login/logout/create/update/delete/approve/reject等',
    module VARCHAR(50) NOT NULL COMMENT '操作模块：auth/attendance/approval/meeting/trip等',
    resource_type VARCHAR(50) NULL COMMENT '资源类型：user/meeting/trip/leave等',
    resource_id BIGINT UNSIGNED NULL COMMENT '资源ID',
    detail JSON NULL COMMENT '操作详情，JSON格式存储变更前后数据',
    ip_address VARCHAR(45) NOT NULL COMMENT '客户端IP地址',
    user_agent VARCHAR(500) NULL COMMENT '客户端UA信息',
    request_id VARCHAR(50) NULL COMMENT '请求唯一标识（用于追踪）',
    status ENUM('success', 'failed') NOT NULL DEFAULT 'success' COMMENT '操作结果',
    error_message TEXT NULL COMMENT '失败时的错误信息',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',

    PRIMARY KEY (id),
    -- 用户维度查询索引：用于查询某用户的操作历史
    INDEX idx_user_action_time (user_id, action, created_at),
    -- 模块维度查询索引：用于按模块筛选日志
    INDEX idx_module_time (module, created_at),
    -- 资源维度查询索引：用于查询某资源的所有操作记录
    INDEX idx_resource (resource_type, resource_id),
    -- 时间维度索引：用于日志归档清理
    INDEX idx_created_time (created_at),
    -- 请求ID索引：用于请求追踪
    INDEX idx_request_id (request_id)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='操作日志表';

-- ============================================================================
-- 第三部分：创建密码历史表
-- ============================================================================

CREATE TABLE IF NOT EXISTS password_history (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    user_id BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希值',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',

    PRIMARY KEY (id),
    -- 用户维度索引：查询用户密码历史
    INDEX idx_user_created (user_id, created_at)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='密码历史记录表';

-- ============================================================================
-- 第四部分：扩展用户表字段
-- 注意：MySQL 8.0 支持 ADD COLUMN ... INSTANT 算法，不锁表
-- ============================================================================

-- 添加登录失败计数字段
ALTER TABLE users
ADD COLUMN IF NOT EXISTS login_fail_count INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '连续登录失败次数';

-- 添加账户锁定截止时间字段
ALTER TABLE users
ADD COLUMN IF NOT EXISTS locked_until DATETIME NULL COMMENT '账户锁定截止时间，NULL表示未锁定';

-- 添加最近登录尝试时间字段
ALTER TABLE users
ADD COLUMN IF NOT EXISTS last_login_attempt DATETIME NULL COMMENT '最近一次登录尝试时间';

-- 添加密码修改时间字段
ALTER TABLE users
ADD COLUMN IF NOT EXISTS password_changed_at DATETIME NULL COMMENT '密码最后修改时间';

-- 添加密码有效期字段（天）
ALTER TABLE users
ADD COLUMN IF NOT EXISTS password_expire_days INT UNSIGNED DEFAULT 90 COMMENT '密码有效期（天），0表示永不过期';

-- 添加强制修改密码标记字段
ALTER TABLE users
ADD COLUMN IF NOT EXISTS require_password_change TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否需要强制修改密码（首次登录等场景）';

-- ============================================================================
-- 第五部分：添加用户表索引
-- 使用存储过程实现"如果不存在则添加"逻辑
-- ============================================================================

DELIMITER //

-- 创建添加索引的存储过程
DROP PROCEDURE IF EXISTS sp_add_security_indexes//

CREATE PROCEDURE sp_add_security_indexes()
BEGIN
    -- 添加 idx_locked_until 索引（用于登录时检查锁定状态）
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.statistics
        WHERE table_schema = DATABASE()
          AND table_name = 'users'
          AND index_name = 'idx_locked_until'
    ) THEN
        ALTER TABLE users ADD INDEX idx_locked_until (locked_until);
    END IF;

    -- 添加 idx_password_changed 索引（用于定时任务检测即将过期的密码）
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.statistics
        WHERE table_schema = DATABASE()
          AND table_name = 'users'
          AND index_name = 'idx_password_changed'
    ) THEN
        ALTER TABLE users ADD INDEX idx_password_changed (password_changed_at);
    END IF;

END//

DELIMITER ;

-- 执行存储过程
CALL sp_add_security_indexes();

-- 删除存储过程
DROP PROCEDURE IF EXISTS sp_add_security_indexes;

-- ============================================================================
-- 第六部分：初始化现有用户数据
-- ============================================================================

-- 初始化现有用户的密码修改时间为当前时间
-- 确保所有现有用户都有密码修改时间记录
UPDATE users
SET password_changed_at = NOW()
WHERE password_changed_at IS NULL;

-- ============================================================================
-- 第七部分：验证脚本
-- 执行后可运行以下SQL验证迁移结果
-- ============================================================================

-- 验证表是否创建成功
-- SELECT table_name, table_rows, data_length, index_length
-- FROM information_schema.tables
-- WHERE table_schema = DATABASE()
--   AND table_name IN ('login_logs', 'operation_logs', 'password_history');

-- 验证字段是否添加成功
-- SELECT column_name, data_type, is_nullable, column_default, column_comment
-- FROM information_schema.columns
-- WHERE table_schema = DATABASE()
--   AND table_name = 'users'
--   AND column_name IN (
--       'login_fail_count', 'locked_until', 'last_login_attempt',
--       'password_changed_at', 'password_expire_days', 'require_password_change'
--   );

-- 验证索引是否创建成功
-- SELECT index_name, column_name, seq_in_index
-- FROM information_schema.statistics
-- WHERE table_schema = DATABASE()
--   AND table_name IN ('login_logs', 'operation_logs', 'password_history', 'users')
-- ORDER BY table_name, index_name, seq_in_index;

-- ============================================================================
-- 执行完成提示
-- ============================================================================
-- 迁移脚本执行完成！
-- 请运行验证SQL确认所有表、字段、索引创建成功
-- ============================================================================

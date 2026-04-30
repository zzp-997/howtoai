-- ============================================================================
-- 极智协同 - 安全模块数据库回滚脚本
-- ============================================================================
-- 任务ID: 1.2.4
-- 版本: V1
-- 创建日期: 2026-04-30
-- 数据库版本: MySQL 8.0+
-- 说明: 回滚安全模块相关的数据库变更
-- ============================================================================

-- 警告说明:
-- 1. 执行此脚本将删除安全模块相关的所有表和数据
-- 2. 用户表扩展字段将被删除
-- 3. 执行前请确保已备份数据库
-- 4. 建议在测试环境验证后再在生产环境执行
-- 5. 使用命令执行: mysql -u root -p howtoai < V1_security_migration_rollback.sql

-- ============================================================================
-- 开始事务
-- ============================================================================

START TRANSACTION;

-- ============================================================================
-- 第一部分：删除用户表扩展字段
-- 注意顺序：先删除索引，再删除字段
-- ============================================================================

-- 使用存储过程实现"如果存在则删除"逻辑
DELIMITER //

DROP PROCEDURE IF EXISTS sp_drop_security_indexes//

CREATE PROCEDURE sp_drop_security_indexes()
BEGIN
    -- 删除 idx_locked_until 索引
    IF EXISTS (
        SELECT 1 FROM information_schema.statistics
        WHERE table_schema = DATABASE()
          AND table_name = 'users'
          AND index_name = 'idx_locked_until'
    ) THEN
        ALTER TABLE users DROP INDEX idx_locked_until;
    END IF;

    -- 删除 idx_password_changed 索引
    IF EXISTS (
        SELECT 1 FROM information_schema.statistics
        WHERE table_schema = DATABASE()
          AND table_name = 'users'
          AND index_name = 'idx_password_changed'
    ) THEN
        ALTER TABLE users DROP INDEX idx_password_changed;
    END IF;

END//

DELIMITER ;

-- 执行删除索引存储过程
CALL sp_drop_security_indexes();

-- 删除存储过程
DROP PROCEDURE IF EXISTS sp_drop_security_indexes;

-- 删除用户表扩展字段（使用 IF EXISTS 语法，MySQL 8.0 支持）
-- 注意：如果 MySQL 版本不支持 DROP COLUMN IF EXISTS，需要逐个判断

-- 创建删除字段的存储过程
DELIMITER //

DROP PROCEDURE IF EXISTS sp_drop_security_columns//

CREATE PROCEDURE sp_drop_security_columns()
BEGIN
    -- 声明变量
    DECLARE col_exists INT;

    -- 删除 login_fail_count 字段
    SELECT COUNT(*) INTO col_exists
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'users'
      AND column_name = 'login_fail_count';

    IF col_exists > 0 THEN
        ALTER TABLE users DROP COLUMN login_fail_count;
    END IF;

    -- 删除 locked_until 字段
    SELECT COUNT(*) INTO col_exists
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'users'
      AND column_name = 'locked_until';

    IF col_exists > 0 THEN
        ALTER TABLE users DROP COLUMN locked_until;
    END IF;

    -- 删除 last_login_attempt 字段
    SELECT COUNT(*) INTO col_exists
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'users'
      AND column_name = 'last_login_attempt';

    IF col_exists > 0 THEN
        ALTER TABLE users DROP COLUMN last_login_attempt;
    END IF;

    -- 删除 password_changed_at 字段
    SELECT COUNT(*) INTO col_exists
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'users'
      AND column_name = 'password_changed_at';

    IF col_exists > 0 THEN
        ALTER TABLE users DROP COLUMN password_changed_at;
    END IF;

    -- 删除 password_expire_days 字段
    SELECT COUNT(*) INTO col_exists
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'users'
      AND column_name = 'password_expire_days';

    IF col_exists > 0 THEN
        ALTER TABLE users DROP COLUMN password_expire_days;
    END IF;

    -- 删除 require_password_change 字段
    SELECT COUNT(*) INTO col_exists
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'users'
      AND column_name = 'require_password_change';

    IF col_exists > 0 THEN
        ALTER TABLE users DROP COLUMN require_password_change;
    END IF;

END//

DELIMITER ;

-- 执行删除字段存储过程
CALL sp_drop_security_columns();

-- 删除存储过程
DROP PROCEDURE IF EXISTS sp_drop_security_columns;

-- ============================================================================
-- 第二部分：删除新增表
-- 注意顺序：先删除可能存在外键依赖的表
-- ============================================================================

-- 删除密码历史表
DROP TABLE IF EXISTS password_history;

-- 删除操作日志表
DROP TABLE IF EXISTS operation_logs;

-- 删除登录日志表
DROP TABLE IF EXISTS login_logs;

-- ============================================================================
-- 提交事务
-- ============================================================================

COMMIT;

-- ============================================================================
-- 验证回滚结果
-- 执行后可运行以下SQL验证回滚是否成功
-- ============================================================================

-- 验证表是否删除成功（应该返回空结果）
-- SELECT table_name
-- FROM information_schema.tables
-- WHERE table_schema = DATABASE()
--   AND table_name IN ('login_logs', 'operation_logs', 'password_history');

-- 验证字段是否删除成功（应该返回空结果）
-- SELECT column_name
-- FROM information_schema.columns
-- WHERE table_schema = DATABASE()
--   AND table_name = 'users'
--   AND column_name IN (
--       'login_fail_count', 'locked_until', 'last_login_attempt',
--       'password_changed_at', 'password_expire_days', 'require_password_change'
--   );

-- 验证索引是否删除成功（应该返回空结果）
-- SELECT index_name
-- FROM information_schema.statistics
-- WHERE table_schema = DATABASE()
--   AND table_name = 'users'
--   AND index_name IN ('idx_locked_until', 'idx_password_changed');

-- ============================================================================
-- 执行完成提示
-- ============================================================================
-- 回滚脚本执行完成！
-- 请运行验证SQL确认所有表、字段、索引已正确删除
-- ============================================================================

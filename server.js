// 吕祖灵签摇签应用后端服务器
// 用于实现跨设备统计功能

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// 启用CORS
app.use(cors());

// 解析JSON请求
app.use(express.json());

// 连接到SQLite数据库
const db = new sqlite3.Database('./statistics.db', (err) => {
    if (err) {
        console.error('数据库连接失败:', err.message);
    } else {
        console.log('成功连接到SQLite数据库');
        // 创建统计数据表
        db.run(`CREATE TABLE IF NOT EXISTS statistics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                console.error('创建表失败:', err.message);
            } else {
                console.log('统计数据表已创建或已存在');
            }
        });
    }
});

// API接口：获取全局统计数据
app.get('/api/get-stats', (req, res) => {
    // 获取总使用次数
    const getTotalUses = () => {
        return new Promise((resolve, reject) => {
            db.get('SELECT COUNT(*) AS total FROM statistics', (err, row) => {
                if (err) reject(err);
                else resolve(row.total || 0);
            });
        });
    };

    // 获取总使用人数（唯一用户数）
    const getTotalUsers = () => {
        return new Promise((resolve, reject) => {
            db.get('SELECT COUNT(DISTINCT user_id) AS unique_users FROM statistics', (err, row) => {
                if (err) reject(err);
                else resolve(row.unique_users || 0);
            });
        });
    };

    // 并行获取统计数据
    Promise.all([getTotalUses(), getTotalUsers()])
        .then(([totalUses, totalUsers]) => {
            res.json({
                success: true,
                data: {
                    totalUses,
                    totalUsers
                }
            });
        })
        .catch(err => {
            console.error('获取统计数据失败:', err);
            res.status(500).json({
                success: false,
                message: '获取统计数据失败'
            });
        });
});

// API接口：更新统计数据
app.post('/api/update-stats', (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({
            success: false,
            message: '缺少用户ID'
        });
    }

    // 插入新的使用记录
    db.run(`INSERT INTO statistics (user_id) VALUES (?)`, [userId], function(err) {
        if (err) {
            console.error('插入统计数据失败:', err);
            res.status(500).json({
                success: false,
                message: '更新统计数据失败'
            });
        } else {
            // 插入成功后返回最新的统计数据
            db.get('SELECT COUNT(*) AS total FROM statistics', (err, row) => {
                if (err) {
                    console.error('获取总使用次数失败:', err);
                    res.status(500).json({
                        success: false,
                        message: '更新统计数据失败'
                    });
                } else {
                    const totalUses = row.total || 0;
                    // 获取总用户数
                    db.get('SELECT COUNT(DISTINCT user_id) AS unique_users FROM statistics', (err, row) => {
                        if (err) {
                            console.error('获取总用户数失败:', err);
                            res.status(500).json({
                                success: false,
                                message: '更新统计数据失败'
                            });
                        } else {
                            const totalUsers = row.unique_users || 0;
                            res.json({
                                success: true,
                                data: {
                                    totalUses,
                                    totalUsers
                                }
                            });
                        }
                    });
                }
            });
        }
    });
});

// 静态文件服务（可选，用于测试前端）
app.use(express.static(__dirname));

// 启动服务器
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    console.log('API接口:');
    console.log('  GET  /api/get-stats    - 获取全局统计数据');
    console.log('  POST /api/update-stats - 更新统计数据');
});

// 关闭数据库连接
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('关闭数据库连接失败:', err.message);
        } else {
            console.log('\n数据库连接已关闭');
        }
        process.exit(0);
    });
});
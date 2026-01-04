// 吕祖灵签摇签应用后端服务器

const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// 静态文件服务（用于测试前端）
app.use(express.static(__dirname));

// 启动服务器
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
});
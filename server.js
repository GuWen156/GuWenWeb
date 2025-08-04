const fs = require('fs');
const path = require('path');
const http = require('http');
const filesystem = require('fs');

// 服务器配置
const PORT = 5501;
const HOST = '127.0.0.1';
const PUBLIC_DIR = path.join(__dirname, '.');
const CACHE_MAX_AGE = 31536000; // 1年，单位秒

// MIME类型映射
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.mp4': 'video/mp4',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.json': 'application/json',
    '.txt': 'text/plain'
};

/**
 * 记录请求日志
 */
function logRequest(req) {
    const date = new Date().toISOString();
    console.log(`[${date}] ${req.method} ${req.url} ${req.headers['user-agent']}`);
}

/**
 * 处理静态文件请求
 */
function handleStaticFileRequest(req, res) {
    // 获取请求的文件路径
    let filePath = path.join(PUBLIC_DIR, req.url === '/' ? 'index.html' : req.url);

    // 防止路径遍历攻击
    if (!filePath.startsWith(PUBLIC_DIR)) {
        res.writeHead(403);
        res.end('403 Forbidden');
        return;
    }

    // 检查文件是否存在
    filesystem.stat(filePath, (err, stats) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // 文件不存在
                res.writeHead(404);
                res.end('404 Not Found');
            } else {
                // 服务器错误
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`);
            }
            return;
        }

        // 如果是目录，尝试加载目录下的index.html
        if (stats.isDirectory()) {
            filePath = path.join(filePath, 'index.html');
            filesystem.stat(filePath, (err2) => {
                if (err2) {
                    res.writeHead(404);
                    res.end('404 Not Found');
                    return;
                }
                serveFile(filePath, req, res);
            });
            return;
        }

        // 提供文件
        serveFile(filePath, req, res);
    });
}

/**
 * 提供文件内容
 */
function serveFile(filePath, req, res) {
    // 获取文件扩展名
    const extname = path.extname(filePath).toLowerCase();

    // 设置内容类型
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';

    // 获取文件状态
    filesystem.stat(filePath, (err, stats) => {
        if (err) {
            res.writeHead(500);
            res.end(`Server Error: ${err.code}`);
            return;
        }

        // 处理范围请求
        const range = req.headers.range;
        if (range && extname === '.mp4') {
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
            const chunkSize = (end - start) + 1;

            const file = filesystem.createReadStream(filePath, { start, end });
            const headers = {
                'Content-Range': `bytes ${start}-${end}/${stats.size}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunkSize,
                'Content-Type': contentType,
                'Cache-Control': `public, max-age=${CACHE_MAX_AGE}`
            };

            res.writeHead(206, headers);
            file.pipe(res);
        } else {
            // 普通请求
            const headers = {
                'Content-Type': contentType,
                'Content-Length': stats.size,
                'Cache-Control': `public, max-age=${CACHE_MAX_AGE}`
            };

            res.writeHead(200, headers);
            filesystem.createReadStream(filePath).pipe(res);
        }
    });
}

// 创建HTTP服务器
const server = http.createServer((req, res) => {
    logRequest(req);
    handleStaticFileRequest(req, res);
});

// 错误处理
server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
        console.error(`端口 ${PORT} 已被占用，请关闭占用该端口的程序或使用其他端口。`);
    } else {
        console.error('服务器错误:', e);
    }
});

// 启动服务器
server.listen(PORT, HOST, () => {
    console.log(`服务器运行在 http://127.0.0.1:5501/index.html`);
    console.log(`请在浏览器中访问 http://127.0.0.1:5501/index.html 来查看网站`);
    console.log(`提示：要使用自定义域名'guwen114514'访问，请在hosts文件中添加: 127.0.0.1 guwen114514`);
    console.log(`然后修改server.js文件中的HOST常量为'guwen114514'并重启服务器`);
});

// 优雅关闭
process.on('SIGINT', () => {
    console.log('正在关闭服务器...');
    server.close(() => {
        console.log('服务器已关闭');
        process.exit(0);
    });
});
#!/usr/bin/env node

/**
 * 转换精选 Markdown 为 HTML
 */

const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const featuredDir = path.join(__dirname, '..', 'featured');
const outputDir = featuredDir;

const date = new Date().toISOString().split('T')[0];
const mdPath = path.join(featuredDir, `featured_${date}.md`);

if (!fs.existsSync(mdPath)) {
    console.log('❌ 未找到精选文件');
    process.exit(1);
}

const mdContent = fs.readFileSync(mdPath, 'utf-8');
const htmlContent = marked(mdContent);

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${date} arXiv 每日精选 TOP 5 论文">
    <title>每日精选 TOP 5 | arXiv AI 论文每日精选</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
    <header>
        <div class="header-content">
            <h1>📚 arXiv AI 论文每日精选</h1>
            <p class="subtitle">${date} 精选 TOP 5</p>
        </div>
    </header>

    <nav>
        <ul>
            <li><a href="../index.html">🏠 首页</a></li>
            <li><a href="#" class="active">⭐ 精选论文</a></li>
            <li><a href="../all-papers.html">📚 全部论文</a></li>
            <li><a href="https://github.com/2992638402-art/arxiv-papers-site" target="_blank">💻 GitHub</a></li>
        </ul>
    </nav>

    <main>
        <div class="paper-content">
            ${htmlContent}
        </div>

        <div style="margin-top: 2rem; text-align: center;">
            <a href="../index.html" class="btn btn-secondary">← 返回首页</a>
            <a href="../all-papers.html" class="btn">浏览全部 150 篇 →</a>
        </div>
    </main>

    <footer>
        <p>© 2026 arXiv AI 论文每日精选 | 数据来源：<a href="https://arxiv.org" target="_blank">arXiv.org</a></p>
    </footer>

    <script src="../js/main.js"></script>
</body>
</html>`;

const outputPath = path.join(outputDir, `featured_${date}.html`);
fs.writeFileSync(outputPath, html);
console.log(`✅ 精选页面已生成: ${outputPath}`);

#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

// Configure marked
marked.setOptions({
    gfm: true,
    breaks: true,
    headerIds: true,
    mangle: false
});

// Template for paper pages
function createPaperPage(title, content, arxivId, date) {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${title} - arXiv ${arxivId} 论文总结">
    <title>${title} | arXiv AI 论文每日精选</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
    <header>
        <div class="header-content">
            <h1>📚 arXiv AI 论文每日精选</h1>
            <p class="subtitle">精选 AI/ML 前沿论文，深度解读，助你把握研究动态</p>
        </div>
    </header>

    <nav>
        <ul>
            <li><a href="../index.html">🏠 首页</a></li>
            <li><a href="../daily/${date}.html">📅 每日总结</a></li>
            <li><a href="#categories">🏷️ 分类浏览</a></li>
            <li><a href="https://github.com" target="_blank">💻 GitHub</a></li>
        </ul>
    </nav>

    <main>
        <div class="paper-content">
            ${content}
        </div>

        <div style="margin-top: 2rem; text-align: center;">
            <a href="../index.html" class="btn btn-secondary">← 返回首页</a>
            <a href="https://arxiv.org/abs/${arxivId}" class="btn" target="_blank">📄 查看 arXiv 原文</a>
        </div>
    </main>

    <footer>
        <p>© 2026 arXiv AI 论文每日精选 | 数据来源：<a href="https://arxiv.org" target="_blank">arXiv.org</a></p>
    </footer>

    <script src="../js/main.js"></script>
</body>
</html>`;
}

// Template for daily summary page
function createDailyPage(date, content) {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${date} arXiv 论文每日总结">
    <title>${date} 每日总结 | arXiv AI 论文每日精选</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
    <header>
        <div class="header-content">
            <h1>📚 arXiv AI 论文每日精选</h1>
            <p class="subtitle">${date} 每日总结</p>
        </div>
    </header>

    <nav>
        <ul>
            <li><a href="../index.html">🏠 首页</a></li>
            <li><a href="#" class="active">📅 每日总结</a></li>
            <li><a href="#categories">🏷️ 分类浏览</a></li>
            <li><a href="https://github.com" target="_blank">💻 GitHub</a></li>
        </ul>
    </nav>

    <main>
        <div class="paper-content">
            ${content}
        </div>

        <div style="margin-top: 2rem; text-align: center;">
            <a href="../index.html" class="btn btn-secondary">← 返回首页</a>
        </div>
    </main>

    <footer>
        <p>© 2026 arXiv AI 论文每日精选 | 数据来源：<a href="https://arxiv.org" target="_blank">arXiv.org</a></p>
    </footer>

    <script src="../js/main.js"></script>
</body>
</html>`;
}

// Convert markdown file to HTML
function convertMarkdownToHTML(mdFilePath, outputDir, type, metadata = {}) {
    const mdContent = fs.readFileSync(mdFilePath, 'utf-8');
    const htmlContent = marked(mdContent);

    let finalHTML;
    const fileName = path.basename(mdFilePath, '.md') + '.html';

    if (type === 'paper') {
        finalHTML = createPaperPage(
            metadata.title || 'Paper Summary',
            htmlContent,
            metadata.arxivId || 'unknown',
            metadata.date || '2026-02-28'
        );
    } else if (type === 'daily') {
        finalHTML = createDailyPage(
            metadata.date || '2026-02-28',
            htmlContent
        );
    }

    const outputPath = path.join(outputDir, fileName);
    fs.writeFileSync(outputPath, finalHTML, 'utf-8');
    console.log(`✅ Generated: ${outputPath}`);
}

// Main conversion process
const knowledgeDir = path.join(__dirname, '..', 'knowledge');
const siteDir = __dirname;

// Convert paper summaries
console.log('Converting paper summaries...');
convertMarkdownToHTML(
    path.join(knowledgeDir, 'summary_model_agreement.md'),
    path.join(siteDir, 'papers'),
    'paper',
    {
        title: 'Model Agreement via Anchoring',
        arxivId: '2602.23360',
        date: '2026-02-28'
    }
);

convertMarkdownToHTML(
    path.join(knowledgeDir, 'summary_vision_language_alignment.md'),
    path.join(siteDir, 'papers'),
    'paper',
    {
        title: 'SOTAlign: Semi-Supervised Vision-Language Alignment',
        arxivId: '2602.23353',
        date: '2026-02-28'
    }
);

// Convert daily summary
console.log('Converting daily summary...');
convertMarkdownToHTML(
    path.join(knowledgeDir, 'arxiv_daily_2026-02-28.md'),
    path.join(siteDir, 'daily'),
    'daily',
    {
        date: '2026-02-28'
    }
);

console.log('✨ All files converted successfully!');

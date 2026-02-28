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
const knowledgeDir = path.join(__dirname, 'knowledge');
const siteDir = __dirname;

// Ensure output directories exist
const papersDir = path.join(siteDir, 'papers');
const dailyDir = path.join(siteDir, 'daily');
if (!fs.existsSync(papersDir)) fs.mkdirSync(papersDir, { recursive: true });
if (!fs.existsSync(dailyDir)) fs.mkdirSync(dailyDir, { recursive: true });

// Convert all paper summaries
console.log('Converting paper summaries...');
if (fs.existsSync(knowledgeDir)) {
    const files = fs.readdirSync(knowledgeDir);

    files.forEach(file => {
        if (file.startsWith('summary_') && file.endsWith('.md')) {
            const mdPath = path.join(knowledgeDir, file);
            const mdContent = fs.readFileSync(mdPath, 'utf-8');

            // Extract title and arxivId from markdown
            const titleMatch = mdContent.match(/^#\s+(.+)$/m);
            const arxivMatch = mdContent.match(/\*\*arXiv ID:\*\*\s+(\S+)/);

            const title = titleMatch ? titleMatch[1] : 'Paper Summary';
            const arxivId = arxivMatch ? arxivMatch[1] : 'unknown';

            convertMarkdownToHTML(
                mdPath,
                papersDir,
                'paper',
                {
                    title,
                    arxivId,
                    date: '2026-02-28'
                }
            );
        }
    });

    // Convert daily summaries
    console.log('\nConverting daily summaries...');
    files.forEach(file => {
        if (file.startsWith('arxiv_daily_') && file.endsWith('.md')) {
            const dateMatch = file.match(/arxiv_daily_(\d{4}-\d{2}-\d{2})\.md/);
            const date = dateMatch ? dateMatch[1] : '2026-02-28';

            convertMarkdownToHTML(
                path.join(knowledgeDir, file),
                dailyDir,
                'daily',
                { date }
            );
        }
    });
} else {
    console.log('⚠️  Knowledge directory not found');
}

console.log('\n✨ All files converted successfully!');

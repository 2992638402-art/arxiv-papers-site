#!/usr/bin/env node

/**
 * 生成全部论文列表页面
 */

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const outputFile = path.join(__dirname, '..', 'all-papers.html');

const today = new Date().toISOString().split('T')[0];
const papersFile = path.join(dataDir, `papers_to_summarize_${today}.json`);

if (!fs.existsSync(papersFile)) {
    console.log('❌ 未找到论文数据');
    process.exit(1);
}

const data = JSON.parse(fs.readFileSync(papersFile, 'utf8'));
const papers = data.papers || [];

// 按分类分组
const byCategory = {
    'robotics': [],
    'multimodal': [],
    'ml-theory': [],
    'other': []
};

papers.forEach(p => {
    byCategory[p.category].push(p);
});

const categoryNames = {
    'robotics': '🤖 机器人',
    'multimodal': '🎨 多模态学习',
    'ml-theory': '🧮 机器学习理论',
    'other': '🔬 其他'
};

function generatePaperItem(paper, index) {
    const shortId = paper.id.replace(/v\d+$/, '');
    return `
    <div class="paper-item">
        <div class="paper-number">${index + 1}</div>
        <div class="paper-info">
            <h3><a href="papers/summary_${paper.id.replace(/\./g, '_')}.html">${paper.title}</a></h3>
            <p class="paper-meta">
                <span>📄 <a href="https://arxiv.org/abs/${shortId}" target="_blank">${shortId}</a></span>
                <span>📅 ${paper.published.split('T')[0]}</span>
                <span class="tag ${paper.category}">${categoryNames[paper.category]}</span>
            </p>
        </div>
    </div>`;
}

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>全部论文 | arXiv AI 论文每日精选</title>
    <link rel="stylesheet" href="css/style.css">
    <style>
        .paper-item {
            display: flex;
            gap: 1rem;
            padding: 1rem;
            margin-bottom: 0.5rem;
            background: white;
            border-radius: 8px;
            transition: all 0.2s;
        }
        .paper-item:hover {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            transform: translateX(4px);
        }
        .paper-number {
            font-size: 1.2rem;
            font-weight: bold;
            color: #cbd5e1;
            min-width: 40px;
        }
        .paper-info {
            flex: 1;
        }
        .paper-info h3 {
            font-size: 1rem;
            margin: 0 0 0.5rem 0;
        }
        .paper-info h3 a {
            color: #1e40af;
            text-decoration: none;
        }
        .paper-info h3 a:hover {
            text-decoration: underline;
        }
        .paper-meta {
            font-size: 0.875rem;
            color: #64748b;
            margin: 0;
        }
        .paper-meta span {
            margin-right: 1rem;
        }
        .category-section {
            margin-bottom: 3rem;
        }
        .category-section h2 {
            border-bottom: 3px solid #667eea;
            padding-bottom: 0.5rem;
            margin-bottom: 1.5rem;
        }
        .filter-tabs {
            display: flex;
            gap: 1rem;
            margin-bottom: 2rem;
            flex-wrap: wrap;
        }
        .filter-tabs button {
            padding: 0.5rem 1rem;
            border: 2px solid #e2e8f0;
            background: white;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
        }
        .filter-tabs button:hover,
        .filter-tabs button.active {
            background: #667eea;
            color: white;
            border-color: #667eea;
        }
    </style>
</head>
<body>
    <header>
        <div class="header-content">
            <h1>📚 arXiv AI 论文每日精选</h1>
            <p class="subtitle">全部 ${papers.length} 篇论文</p>
        </div>
    </header>

    <nav>
        <ul>
            <li><a href="index.html">🏠 首页</a></li>
            <li><a href="featured/featured_${today}.html">⭐ 精选论文</a></li>
            <li><a href="all-papers.html" class="active">📚 全部论文</a></li>
            <li><a href="https://github.com/2992638402-art/arxiv-papers-site" target="_blank">💻 GitHub</a></li>
        </ul>
    </nav>

    <main>
        <div class="filter-tabs">
            <button class="active" onclick="filterCategory('all')">全部 (${papers.length})</button>
            <button onclick="filterCategory('multimodal')">🎨 多模态 (${byCategory.multimodal.length})</button>
            <button onclick="filterCategory('ml-theory')">🧮 ML理论 (${byCategory['ml-theory'].length})</button>
            <button onclick="filterCategory('robotics')">🤖 机器人 (${byCategory.robotics.length})</button>
            <button onclick="filterCategory('other')">🔬 其他 (${byCategory.other.length})</button>
        </div>

        <div id="all-papers-list" class="category-section">
            <h2>全部论文</h2>
            ${papers.map((p, i) => generatePaperItem(p, i)).join('')}
        </div>

        ${Object.entries(byCategory).map(([cat, catPapers]) => `
        <div id="${cat}-list" class="category-section" style="display: none;">
            <h2>${categoryNames[cat]} (${catPapers.length} 篇)</h2>
            ${catPapers.map((p, i) => generatePaperItem(p, i)).join('')}
        </div>
        `).join('')}
    </main>

    <footer>
        <p>© 2026 arXiv AI 论文每日精选 | 数据来源：<a href="https://arxiv.org" target="_blank">arXiv.org</a></p>
    </footer>

    <script>
        function filterCategory(category) {
            // Update button states
            document.querySelectorAll('.filter-tabs button').forEach(btn => {
                btn.classList.remove('active');
            });
            event.target.classList.add('active');

            // Show/hide sections
            const sections = {
                'all': 'all-papers-list',
                'multimodal': 'multimodal-list',
                'ml-theory': 'ml-theory-list',
                'robotics': 'robotics-list',
                'other': 'other-list'
            };

            Object.values(sections).forEach(id => {
                const el = document.getElementById(id);
                if (el) el.style.display = 'none';
            });

            const targetId = sections[category];
            if (targetId) {
                document.getElementById(targetId).style.display = 'block';
            }
        }
    </script>
    <script src="js/main.js"></script>
</body>
</html>`;

fs.writeFileSync(outputFile, html);
console.log(`✅ 全部论文页面已生成: ${outputFile}`);
console.log(`📊 共 ${papers.length} 篇论文`);

#!/usr/bin/env node

/**
 * 动态生成 index.html
 */

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const featuredDir = path.join(__dirname, '..', 'featured');
const outputFile = path.join(__dirname, '..', 'index.html');

// 获取精选5篇论文（如果有的话）
const today = new Date().toISOString().split('T')[0];
const featuredFile = path.join(featuredDir, `featured_${today}.json`);

let papers = [];
let isFeatured = false;

if (fs.existsSync(featuredFile)) {
    // 使用精选论文
    const featuredData = JSON.parse(fs.readFileSync(featuredFile, 'utf8'));
    papers = featuredData.papers || [];
    isFeatured = true;
    console.log(`📌 使用精选论文: ${papers.length} 篇`);
} else {
    // 降级：使用所有论文
    const papersFile = path.join(dataDir, `papers_to_summarize_${today}.json`);
    if (fs.existsSync(papersFile)) {
        const data = JSON.parse(fs.readFileSync(papersFile, 'utf8'));
        papers = (data.papers || []).slice(0, 5); // 最多显示5篇
        console.log(`📚 使用前5篇论文`);
    }
}

// 分类统计
const categoryStats = {};
papers.forEach(p => {
    categoryStats[p.category] = (categoryStats[p.category] || 0) + 1;
});

const categoryNames = {
    'robotics': '机器人',
    'multimodal': '多模态学习',
    'ml-theory': '机器学习理论',
    'other': '其他'
};

const categoriesText = Object.entries(categoryStats)
    .map(([cat, count]) => `<strong>${categoryNames[cat] || cat}</strong>`)
    .join('、');

// 生成论文卡片
function generatePaperCard(paper, index) {
    const shortId = paper.id.replace(/v\d+$/, '');
    const categoryClass = {
        'robotics': 'robotics',
        'multimodal': 'multimodal',
        'ml-theory': 'theory',
        'other': 'other'
    }[paper.category] || 'other';

    const categoryTag = categoryNames[paper.category] || '其他';

    // 截断摘要
    const summary = paper.summary.substring(0, 300) + '...';

    return `
            <!-- Paper ${index + 1} -->
            <article class="paper-card">
                <div class="paper-header">
                    <div>
                        <h3 class="paper-title">
                            <a href="papers/summary_${paper.id.replace(/\./g, '_')}.html">${paper.title}</a>
                        </h3>
                        <div class="paper-meta">
                            <span>📅 ${paper.published.split('T')[0]}</span>
                            <span>📄 arXiv:${shortId}</span>
                        </div>
                        <div>
                            <span class="tag ${categoryClass}">${categoryTag}</span>
                            ${paper.categories.map(c => `<span class="tag">${c}</span>`).join('')}
                        </div>
                    </div>
                </div>

                <div class="paper-summary">
                    <p>${summary}</p>
                </div>

                <div class="paper-links">
                    <a href="papers/summary_${paper.id.replace(/\./g, '_')}.html" class="btn">📖 阅读详细总结</a>
                    <a href="https://arxiv.org/abs/${shortId}" class="btn btn-secondary" target="_blank">🔗 arXiv 原文</a>
                </div>
            </article>`;
}

// 生成完整的 HTML
const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="每日精选 arXiv AI/ML 论文总结，关注机器人、多模态学习、机器学习理论等前沿研究">
    <title>arXiv AI 论文每日精选</title>
    <link rel="stylesheet" href="css/style.css">
    <style>
        .refresh-btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.5rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            text-decoration: none;
            transition: all 0.3s ease;
            box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);
        }
        .refresh-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(102, 126, 234, 0.4);
        }
        .refresh-btn svg {
            width: 20px;
            height: 20px;
        }
        .refresh-section {
            text-align: center;
            padding: 2rem;
            background: linear-gradient(135deg, #667eea10 0%, #764ba210 100%);
            border-radius: 12px;
            margin-bottom: 2rem;
        }
        .refresh-section h3 {
            margin-bottom: 1rem;
            color: #2d3748;
        }
        .refresh-section p {
            color: #718096;
            margin-bottom: 1.5rem;
        }
    </style>
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
            <li><a href="index.html" class="active">🏠 首页</a></li>
            <li><a href="daily/arxiv_daily_${today}.html">📅 每日总结</a></li>
            <li><a href="#categories">🏷️ 分类浏览</a></li>
            <li><a href="https://github.com/2992638402-art/arxiv-papers-site" target="_blank">💻 GitHub</a></li>
        </ul>
    </nav>

    <main>
        <!-- Manual Refresh Section -->
        <section class="refresh-section">
            <h3>🔄 手动刷新论文</h3>
            <p>点击下方按钮手动触发最新论文抓取和 AI 总结</p>
            <button onclick="triggerWorkflow()" class="refresh-btn" id="refreshBtn">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span id="refreshText">手动刷新论文</span>
            </button>
            <p id="refreshStatus" style="margin-top: 1rem; font-size: 0.9rem; color: #a0aec0;">
                自动抓取 150+ 篇论文，AI 精选 5 篇深度解读
            </p>
        </section>

        <!-- Hero Section -->
        <section class="daily-section">
            <h2>🔥 每日精选 TOP ${papers.length} (${today})</h2>
            <p>${isFeatured ? '从 150+ 篇论文中' : ''}精选 <strong>${papers.length} 篇</strong>最有价值的 AI/ML 研究${categoriesText ? '，涵盖' + categoriesText + '等方向' : ''}。</p>
            <p>
                <a href="featured/featured_${today}.html" class="btn">查看精选总结 →</a>
                <a href="#all-papers" class="btn btn-secondary" style="margin-left: 1rem;">浏览全部 150 篇 →</a>
            </p>
        </section>

        <!-- Today's Papers -->
        <section id="today-papers">
            <h2 style="margin-bottom: 1.5rem;">🌟 今日精选论文</h2>
            ${papers.map((p, i) => generatePaperCard(p, i)).join('\n')}
        </section>

        <!-- All Papers Link -->
        <section id="all-papers" style="text-align: center; padding: 3rem 0; background: #f8fafc; border-radius: 12px; margin-top: 3rem;">
            <h2>📚 全部论文</h2>
            <p style="margin: 1rem 0; color: #64748b;">共抓取 150+ 篇最新 AI/ML 论文</p>
            <a href="all-papers.html" class="btn" style="margin-right: 1rem;">浏览全部论文 →</a>
            <a href="https://github.com/2992638402-art/arxiv-papers-site/tree/main/papers" target="_blank" class="btn btn-secondary">查看源文件 →</a>
        </section>

        <!-- Categories Section -->
        <section id="categories" class="categories-section">
            <h2>🏷️ 按分类浏览</h2>
            <div class="category-grid">
                <a href="categories/robotics.html" class="category-card robotics">
                    <h3>🤖 机器人</h3>
                    <p>机器人学习、控制、具身智能</p>
                    <span class="count">${categoryStats.robotics || 0} 篇</span>
                </a>
                <a href="categories/multimodal.html" class="category-card multimodal">
                    <h3>🎨 多模态学习</h3>
                    <p>视觉-语言模型、跨模态对齐</p>
                    <span class="count">${categoryStats.multimodal || 0} 篇</span>
                </a>
                <a href="categories/ml-theory.html" class="category-card theory">
                    <h3>🧮 机器学习理论</h3>
                    <p>优化、泛化、理论分析</p>
                    <span class="count">${categoryStats['ml-theory'] || 0} 篇</span>
                </a>
            </div>
        </section>

        <!-- Daily Archive -->
        <section id="daily" class="archive-section">
            <h2>📅 每日归档</h2>
            <div class="archive-grid">
                <a href="daily/arxiv_daily_${today}.html" class="archive-card">
                    <div class="date">${today}</div>
                    <div class="count">${papers.length} 篇论文</div>
                </a>
            </div>
        </section>
    </main>

    <footer>
        <p>© 2026 arXiv AI 论文每日精选 | 数据来源：<a href="https://arxiv.org" target="_blank">arXiv.org</a></p>
        <p style="margin-top: 0.5rem; font-size: 0.9rem;">
            🤖 由 Claude AI 自动生成总结 |
            <a href="https://github.com/2992638402-art/arxiv-papers-site" target="_blank">GitHub 仓库</a>
        </p>
    </footer>

    <script>
        async function triggerWorkflow() {
            const btn = document.getElementById('refreshBtn');
            const text = document.getElementById('refreshText');
            const status = document.getElementById('refreshStatus');

            // 禁用按钮
            btn.disabled = true;
            btn.style.opacity = '0.6';
            btn.style.cursor = 'not-allowed';
            text.textContent = '正在触发...';

            try {
                // 使用GitHub Actions workflow dispatch API
                const response = await fetch('https://api.github.com/repos/2992638402-art/arxiv-papers-site/actions/workflows/daily-update.yml/dispatches', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/vnd.github+json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ref: 'main'
                    })
                });

                if (response.status === 204 || response.status === 200) {
                    text.textContent = '✅ 已触发！';
                    status.innerHTML = '✅ 更新任务已启动！预计 3-5 分钟后完成。<br><a href="https://github.com/2992638402-art/arxiv-papers-site/actions" target="_blank" style="color: #667eea;">查看进度 →</a>';
                    status.style.color = '#10b981';

                    setTimeout(() => {
                        btn.disabled = false;
                        btn.style.opacity = '1';
                        btn.style.cursor = 'pointer';
                        text.textContent = '手动刷新论文';
                        status.innerHTML = '自动抓取 150+ 篇论文，AI 精选 5 篇深度解读';
                        status.style.color = '#a0aec0';
                    }, 5000);
                } else {
                    throw new Error('触发失败');
                }
            } catch (error) {
                text.textContent = '触发失败';
                status.innerHTML = '❌ 自动触发暂不可用，请<a href="https://github.com/2992638402-art/arxiv-papers-site/actions/workflows/daily-update.yml" target="_blank" style="color: #667eea;">手动触发 →</a>';
                status.style.color = '#ef4444';

                setTimeout(() => {
                    btn.disabled = false;
                    btn.style.opacity = '1';
                    btn.style.cursor = 'pointer';
                    text.textContent = '手动刷新论文';
                    status.innerHTML = '自动抓取 150+ 篇论文，AI 精选 5 篇深度解读';
                    status.style.color = '#a0aec0';
                }, 5000);
            }
        }
    </script>
    <script src="js/main.js"></script>
</body>
</html>`;

fs.writeFileSync(outputFile, html);
console.log(`✅ 首页已更新: ${outputFile}`);
console.log(`📊 共展示 ${papers.length} 篇论文`);

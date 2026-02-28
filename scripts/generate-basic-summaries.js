#!/usr/bin/env node

/**
 * 为没有 AI 总结的论文生成基础 markdown 文件
 */

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const knowledgeDir = path.join(__dirname, '..', 'knowledge');

// 读取今天的论文
const today = new Date().toISOString().split('T')[0];
const papersFile = path.join(dataDir, `papers_to_summarize_${today}.json`);

if (!fs.existsSync(papersFile)) {
    console.log('❌ 没有找到今天的论文数据');
    process.exit(1);
}

const data = JSON.parse(fs.readFileSync(papersFile, 'utf8'));
const papers = data.papers || [];

console.log(`📚 共有 ${papers.length} 篇论文\n`);

// 为每篇论文生成 markdown
papers.forEach((paper, index) => {
    const filename = path.join(knowledgeDir, `summary_${paper.id.replace(/\./g, '_')}.md`);

    // 提取简短 ID（去掉版本号）
    const shortId = paper.id.replace(/v\d+$/, '');

    const markdown = `# ${paper.title}

> **arXiv ID:** ${shortId}
> **分类:** ${paper.categories.join(', ')}
> **发布时间:** ${paper.published.split('T')[0]}

## 📄 论文信息

- **作者:** ${paper.authors.join(', ')}
- **PDF:** [下载](https://arxiv.org/pdf/${shortId})
- **arXiv 链接:** [查看](https://arxiv.org/abs/${shortId})

## 📝 摘要

${paper.summary}

## 🏷️ 标签

${getCategoryTags(paper.category)}

---

**注意：** 本总结基于 arXiv 原始摘要。AI 深度解读正在生成中...

`;

    fs.writeFileSync(filename, markdown);
    console.log(`✅ ${index + 1}. ${paper.title.substring(0, 60)}...`);
});

// 生成每日总结
const dailyFilename = path.join(knowledgeDir, `arxiv_daily_${today}.md`);
const dailyMarkdown = `# arXiv AI 每日精选 - ${today}

> 今日为您精选 ${papers.length} 篇高质量 AI/ML 论文

## 📊 今日概览

${papers.map((p, i) => `
### ${i + 1}. ${p.title}

**arXiv:** [${p.id.replace(/v\d+$/, '')}](https://arxiv.org/abs/${p.id.replace(/v\d+$/, '')})
**分类:** ${p.category} | ${p.categories.join(', ')}

**核心内容:** ${p.summary.substring(0, 200)}...

[查看详细总结 →](summary_${p.id.replace(/\./g, '_')}.html)

---
`).join('\n')}

## 📈 分类统计

${getCategoryStats(papers)}

---

**生成时间:** ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}

`;

fs.writeFileSync(dailyFilename, dailyMarkdown);
console.log(`\n✅ 每日总结已生成: ${dailyFilename}`);

function getCategoryTags(category) {
    const tags = {
        'robotics': '`机器人` `控制` `具身智能`',
        'multimodal': '`多模态` `视觉语言` `VLM`',
        'ml-theory': '`机器学习` `理论` `优化`',
        'other': '`AI` `机器学习`'
    };
    return tags[category] || tags.other;
}

function getCategoryStats(papers) {
    const stats = {};
    papers.forEach(p => {
        stats[p.category] = (stats[p.category] || 0) + 1;
    });

    const categoryNames = {
        'robotics': '🤖 机器人',
        'multimodal': '🎨 多模态',
        'ml-theory': '🧮 机器学习理论',
        'other': '🔬 其他'
    };

    return Object.entries(stats)
        .map(([cat, count]) => `- ${categoryNames[cat] || cat}: ${count} 篇`)
        .join('\n');
}

console.log('\n✨ 完成！');

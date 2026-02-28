#!/usr/bin/env node

/**
 * 每日精选生成器
 * 从所有论文中选出5篇最有价值的，生成深度AI总结
 */

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const outputDir = path.join(__dirname, '..', 'featured');

// 确保输出目录存在
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

/**
 * 从所有论文中选出5篇最精华的
 */
function selectFeaturedPapers(allPapers) {
    // 计算每篇论文的综合得分
    const scored = allPapers.map(paper => ({
        paper,
        score: calculateComprehensiveScore(paper)
    }));

    // 按分数排序
    scored.sort((a, b) => b.score - a.score);

    // 返回前5篇
    return scored.slice(0, 5).map(s => s.paper);
}

/**
 * 综合评分算法（更严格，只选最精华的）
 */
function calculateComprehensiveScore(paper) {
    let score = 0;

    const title = paper.title.toLowerCase();
    const summary = paper.summary.toLowerCase();

    // 超热门关键词（高权重）
    const ultraHotKeywords = [
        'llm', 'large language model', 'gpt', 'claude', 'gemini',
        'multimodal', 'vision-language', 'diffusion',
        'reinforcement learning', 'rl', 'rlhf',
        'agent', 'multi-agent', 'autonomous',
        'world model', 'embodied',
    ];

    ultraHotKeywords.forEach(keyword => {
        if (title.includes(keyword)) score += 5;
        if (summary.includes(keyword)) score += 2;
    });

    // 创新性指标
    const innovationKeywords = [
        'novel', 'first', 'breakthrough', 'state-of-the-art', 'sota',
        'outperform', 'surpass', 'achieve', 'propose', 'introduce',
    ];

    innovationKeywords.forEach(keyword => {
        if (summary.includes(keyword)) score += 1;
    });

    // 实用性指标
    const practicalKeywords = [
        'efficient', 'fast', 'scalable', 'practical',
        'real-world', 'application', 'deployment',
        'open-source', 'available',
    ];

    practicalKeywords.forEach(keyword => {
        if (summary.includes(keyword)) score += 1;
    });

    // 研究深度（摘要长度）
    score += Math.min(paper.summary.length / 1000, 3);

    // 作者数量（大团队通常是重要工作）
    score += Math.min(paper.authors.length / 3, 2);

    return score;
}

/**
 * 生成精选论文列表（Markdown）
 */
function generateFeaturedMarkdown(featured, date) {
    let md = `# 🌟 arXiv 每日精选 TOP 5 - ${date}\n\n`;
    md += `> 从 150+ 篇最新论文中精选出 5 篇最有价值的研究\n\n`;
    md += `---\n\n`;

    featured.forEach((paper, index) => {
        const shortId = paper.id.replace(/v\d+$/, '');
        md += `## ${index + 1}. ${paper.title}\n\n`;
        md += `**arXiv:** [${shortId}](https://arxiv.org/abs/${shortId})\n`;
        md += `**分类:** ${paper.categories.join(', ')}\n`;
        md += `**作者:** ${paper.authors.slice(0, 5).join(', ')}${paper.authors.length > 5 ? ' et al.' : ''}\n\n`;
        md += `### 📄 论文摘要\n\n`;
        md += `${paper.summary}\n\n`;
        md += `### 🔗 资源链接\n\n`;
        md += `- [arXiv 原文](https://arxiv.org/abs/${shortId})\n`;
        md += `- [PDF 下载](https://arxiv.org/pdf/${shortId})\n\n`;

        // 添加占位符，等待AI总结
        md += `### 🤖 AI 深度解读\n\n`;
        md += `> ⏳ AI 总结生成中...\n`;
        md += `> \n`;
        md += `> 充值 Anthropic API 后，这里将显示 Claude AI 生成的深度解读，包括：\n`;
        md += `> - TL;DR（核心要点）\n`;
        md += `> - 核心创新点\n`;
        md += `> - 技术细节分析\n`;
        md += `> - 实践启示\n`;
        md += `> - 相关工作对比\n\n`;
        md += `---\n\n`;
    });

    md += `\n**生成时间:** ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}\n`;

    return md;
}

/**
 * 主函数
 */
async function main() {
    console.log('🌟 生成每日精选 TOP 5...\n');

    const date = new Date().toISOString().split('T')[0];
    const papersFile = path.join(dataDir, `papers_to_summarize_${date}.json`);

    if (!fs.existsSync(papersFile)) {
        console.log('❌ 未找到论文数据');
        process.exit(1);
    }

    const data = JSON.parse(fs.readFileSync(papersFile, 'utf8'));
    const allPapers = data.papers || [];

    console.log(`📚 共有 ${allPapers.length} 篇论文`);

    // 选出精选5篇
    const featured = selectFeaturedPapers(allPapers);
    console.log(`\n✨ 精选出 5 篇最有价值的论文:\n`);
    featured.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.title}`);
    });

    // 生成 Markdown
    const markdown = generateFeaturedMarkdown(featured, date);
    const mdPath = path.join(outputDir, `featured_${date}.md`);
    fs.writeFileSync(mdPath, markdown);
    console.log(`\n✅ 精选列表已生成: ${mdPath}`);

    // 保存精选论文ID列表
    const featuredIds = featured.map(p => p.id);
    const jsonPath = path.join(outputDir, `featured_${date}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify({ date, papers: featured, ids: featuredIds }, null, 2));
    console.log(`✅ 精选数据已保存: ${jsonPath}`);

    console.log('\n💡 下一步: 使用 AI 为精选论文生成深度总结');
    console.log('   运行: npm run summarize-featured');
}

main().catch(err => {
    console.error('❌ 错误:', err);
    process.exit(1);
});

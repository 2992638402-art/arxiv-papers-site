#!/usr/bin/env node

/**
 * arXiv 论文爬虫
 * 自动抓取指定分类的最新论文
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
    categories: [
        'cs.AI',      // 人工智能
        'cs.LG',      // 机器学习
        'cs.CL',      // 计算语言学
        'cs.CV',      // 计算机视觉
        'cs.RO',      // 机器人
    ],
    maxResults: 10,  // 每个分类抓取的论文数
    outputDir: path.join(__dirname, '..', 'data'),
};

/**
 * 从 arxiv API 获取论文
 */
function fetchArxivPapers(category, maxResults = 10) {
    return new Promise((resolve, reject) => {
        const query = encodeURIComponent(`cat:${category}`);
        const url = `https://export.arxiv.org/api/query?search_query=${query}&sortBy=submittedDate&sortOrder=descending&max_results=${maxResults}`;

        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const papers = parseArxivXML(data);
                    resolve(papers);
                } catch (err) {
                    reject(err);
                }
            });
        }).on('error', reject);
    });
}

/**
 * 解析 arxiv XML 响应
 */
function parseArxivXML(xml) {
    const papers = [];
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    let match;

    while ((match = entryRegex.exec(xml)) !== null) {
        const entry = match[1];

        const paper = {
            id: extractTag(entry, 'id').replace('http://arxiv.org/abs/', ''),
            title: extractTag(entry, 'title').replace(/\s+/g, ' ').trim(),
            summary: extractTag(entry, 'summary').replace(/\s+/g, ' ').trim(),
            authors: extractAuthors(entry),
            published: extractTag(entry, 'published'),
            updated: extractTag(entry, 'updated'),
            categories: extractCategories(entry),
            pdfUrl: extractTag(entry, 'id').replace('/abs/', '/pdf/') + '.pdf',
        };

        papers.push(paper);
    }

    return papers;
}

/**
 * 提取 XML 标签内容
 */
function extractTag(xml, tagName) {
    const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)</${tagName}>`, 'i');
    const match = xml.match(regex);
    return match ? match[1].trim() : '';
}

/**
 * 提取作者列表
 */
function extractAuthors(xml) {
    const authors = [];
    const authorRegex = /<author>\s*<name>(.*?)<\/name>/g;
    let match;

    while ((match = authorRegex.exec(xml)) !== null) {
        authors.push(match[1].trim());
    }

    return authors;
}

/**
 * 提取分类标签
 */
function extractCategories(xml) {
    const categories = [];
    const categoryRegex = /<category[^>]*term="([^"]+)"/g;
    let match;

    while ((match = categoryRegex.exec(xml)) !== null) {
        categories.push(match[1]);
    }

    return categories;
}

/**
 * 论文分类
 */
function categorizePaper(paper) {
    const categories = paper.categories.join(',').toLowerCase();

    if (categories.includes('cs.ro') ||
        paper.title.toLowerCase().includes('robot') ||
        paper.summary.toLowerCase().includes('robotic')) {
        return 'robotics';
    }

    if (categories.includes('cs.cv') || categories.includes('cs.cl') ||
        paper.title.toLowerCase().includes('vision') ||
        paper.title.toLowerCase().includes('language') ||
        paper.title.toLowerCase().includes('multimodal')) {
        return 'multimodal';
    }

    if (categories.includes('cs.lg') || categories.includes('cs.ai')) {
        return 'ml-theory';
    }

    return 'other';
}

/**
 * 保存论文数据
 */
function savePapers(papers, date) {
    // 确保输出目录存在
    if (!fs.existsSync(CONFIG.outputDir)) {
        fs.mkdirSync(CONFIG.outputDir, { recursive: true });
    }

    const filename = path.join(CONFIG.outputDir, `arxiv_${date}.json`);

    // 按分类组织论文
    const categorized = {
        date,
        total: papers.length,
        papers: papers.map(p => ({
            ...p,
            category: categorizePaper(p)
        })),
        byCategory: {
            robotics: [],
            multimodal: [],
            'ml-theory': [],
            other: []
        }
    };

    categorized.papers.forEach(paper => {
        categorized.byCategory[paper.category].push(paper);
    });

    fs.writeFileSync(filename, JSON.stringify(categorized, null, 2));
    console.log(`✅ 已保存 ${papers.length} 篇论文到 ${filename}`);

    return categorized;
}

/**
 * 选择最有趣的论文
 */
function selectTopPapers(categorized, count = 3) {
    const allPapers = categorized.papers;

    // 简单的评分系统
    const scored = allPapers.map(paper => ({
        paper,
        score: calculateInterestScore(paper)
    }));

    // 按分数排序
    scored.sort((a, b) => b.score - a.score);

    // 返回前 N 篇
    return scored.slice(0, count).map(s => s.paper);
}

/**
 * 计算论文的"有趣度"分数
 */
function calculateInterestScore(paper) {
    let score = 0;

    const title = paper.title.toLowerCase();
    const summary = paper.summary.toLowerCase();

    // 热门关键词加分
    const hotKeywords = [
        'llm', 'large language model', 'gpt', 'transformer',
        'multimodal', 'vision-language', 'clip',
        'robot', 'reinforcement learning', 'rl',
        'diffusion', 'generation', 'gan',
        'efficient', 'optimization', 'scaling'
    ];

    hotKeywords.forEach(keyword => {
        if (title.includes(keyword)) score += 3;
        if (summary.includes(keyword)) score += 1;
    });

    // 作者数量（更多作者可能表示更重要的工作）
    score += Math.min(paper.authors.length / 2, 3);

    // 摘要长度（更详细的摘要可能更有价值）
    score += Math.min(paper.summary.length / 500, 2);

    return score;
}

/**
 * 生成论文列表的 Markdown
 */
function generateMarkdown(topPapers, date) {
    let markdown = `# arXiv 每日精选 - ${date}\n\n`;
    markdown += `> 今日为您精选 ${topPapers.length} 篇高质量 AI/ML 论文\n\n`;

    topPapers.forEach((paper, index) => {
        markdown += `## ${index + 1}. ${paper.title}\n\n`;
        markdown += `**arXiv ID:** [${paper.id}](https://arxiv.org/abs/${paper.id})\n\n`;
        markdown += `**作者:** ${paper.authors.slice(0, 5).join(', ')}${paper.authors.length > 5 ? ' et al.' : ''}\n\n`;
        markdown += `**分类:** ${paper.categories.join(', ')}\n\n`;
        markdown += `**摘要:**\n\n${paper.summary}\n\n`;
        markdown += `**PDF:** [下载](${paper.pdfUrl})\n\n`;
        markdown += `---\n\n`;
    });

    return markdown;
}

/**
 * 主函数
 */
async function main() {
    console.log('🚀 开始抓取 arXiv 论文...\n');

    const date = new Date().toISOString().split('T')[0];
    const allPapers = [];

    // 抓取各分类的论文
    for (const category of CONFIG.categories) {
        console.log(`📚 正在抓取 ${category}...`);
        try {
            const papers = await fetchArxivPapers(category, CONFIG.maxResults);
            allPapers.push(...papers);
            console.log(`   ✅ 获取 ${papers.length} 篇论文`);
        } catch (err) {
            console.error(`   ❌ 抓取失败: ${err.message}`);
        }
    }

    // 去重（基于 arxiv ID）
    const uniquePapers = Array.from(
        new Map(allPapers.map(p => [p.id, p])).values()
    );

    console.log(`\n📊 共获取 ${uniquePapers.length} 篇不重复的论文`);

    // 保存所有论文
    const categorized = savePapers(uniquePapers, date);

    // 选择最有趣的论文
    const topPapers = selectTopPapers(categorized, 5);
    console.log(`\n🌟 选出 ${topPapers.length} 篇最有趣的论文:`);
    topPapers.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.title.substring(0, 60)}...`);
    });

    // 生成 Markdown
    const markdown = generateMarkdown(topPapers, date);
    const mdFilename = path.join(CONFIG.outputDir, `papers_${date}.md`);
    fs.writeFileSync(mdFilename, markdown);
    console.log(`\n✅ 已生成 Markdown: ${mdFilename}`);

    // 输出待总结的论文 ID
    const paperIds = topPapers.map(p => p.id);
    console.log(`\n📝 待总结的论文 ID:`);
    console.log(JSON.stringify(paperIds, null, 2));

    // 保存到文件供下一步使用
    fs.writeFileSync(
        path.join(CONFIG.outputDir, `papers_to_summarize_${date}.json`),
        JSON.stringify({ date, papers: topPapers }, null, 2)
    );

    console.log('\n✨ 完成！');
    return topPapers;
}

// 运行
if (require.main === module) {
    main().catch(err => {
        console.error('❌ 错误:', err);
        process.exit(1);
    });
}

module.exports = { fetchArxivPapers, categorizePaper, selectTopPapers };

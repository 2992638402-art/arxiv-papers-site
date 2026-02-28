#!/usr/bin/env node

/**
 * AI 论文自动总结器
 * 使用 Claude API 自动生成论文总结
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    model: 'claude-3-5-sonnet-20241022',
    dataDir: path.join(__dirname, '..', 'data'),
    knowledgeDir: path.join(__dirname, '..', 'knowledge'),
};

/**
 * 调用 Claude API
 */
async function callClaudeAPI(prompt, systemPrompt) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            model: CONFIG.model,
            max_tokens: 4096,
            system: systemPrompt,
            messages: [{
                role: 'user',
                content: prompt
            }]
        });

        const options = {
            hostname: 'api.anthropic.com',
            port: 443,
            path: '/v1/messages',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': CONFIG.apiKey,
                'anthropic-version': '2023-06-01',
                'Content-Length': data.length
            }
        };

        const req = https.request(options, (res) => {
            let responseData = '';
            res.on('data', chunk => responseData += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(responseData);
                    if (parsed.content && parsed.content[0]) {
                        resolve(parsed.content[0].text);
                    } else {
                        reject(new Error('Invalid API response'));
                    }
                } catch (err) {
                    reject(err);
                }
            });
        });

        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

/**
 * 生成单篇论文总结的系统提示词
 */
function getSystemPrompt() {
    return `你是一个专业的 AI/ML 论文分析专家。你的任务是为 arXiv 论文生成高质量的中文总结。

总结要求：
1. 使用 Markdown 格式
2. 包含以下部分：
   - 标题（中文翻译）
   - TL;DR（3-5 句话的核心要点）
   - 核心创新（列出 2-3 个关键创新点）
   - 技术细节（简要说明方法）
   - 实验结果（如果有）
   - 实践启示（对实际应用的意义）
   - 相关工作（与哪些研究相关）
3. 语言风格：专业但易懂，避免过于学术化
4. 长度：800-1200 字

参考示例风格（来自 karpathy 的 nanochat skill）：
- 清晰的结构（问题 → 方法 → 结果 → 启示）
- 技术深度与实践建议并重
- 连接到实际应用场景
- 提供可操作的 insights`;
}

/**
 * 生成论文总结
 */
async function summarizePaper(paper) {
    console.log(`\n📝 正在总结论文: ${paper.title}`);

    const prompt = `请为以下 arXiv 论文生成详细的中文总结：

**标题:** ${paper.title}

**作者:** ${paper.authors.join(', ')}

**arXiv ID:** ${paper.id}

**摘要:**
${paper.summary}

**分类:** ${paper.categories.join(', ')}

请生成一个专业且易懂的总结，包含 TL;DR、核心创新、技术细节、实践启示等部分。`;

    try {
        const summary = await callClaudeAPI(prompt, getSystemPrompt());
        console.log(`   ✅ 总结完成 (${summary.length} 字符)`);
        return summary;
    } catch (err) {
        console.error(`   ❌ 总结失败: ${err.message}`);
        return null;
    }
}

/**
 * 生成每日汇总
 */
async function generateDailySummary(papers, date) {
    console.log(`\n📊 正在生成每日汇总...`);

    const papersList = papers.map((p, i) =>
        `${i + 1}. **${p.title}** (${p.id})`
    ).join('\n');

    const prompt = `请为今日(${date})的 arXiv 精选论文生成一个汇总。

今日共精选 ${papers.length} 篇论文：

${papersList}

请生成一个简短的汇总介绍（200-300字），包括：
1. 今日论文的整体主题和趋势
2. 最值得关注的 2-3 个研究方向
3. 这些论文对 AI/ML 领域的意义

使用友好、专业的语气。`;

    try {
        const summary = await callClaudeAPI(
            prompt,
            '你是一个 AI/ML 领域的研究观察者，擅长发现和总结研究趋势。'
        );
        console.log(`   ✅ 每日汇总完成`);
        return summary;
    } catch (err) {
        console.error(`   ❌ 每日汇总失败: ${err.message}`);
        return null;
    }
}

/**
 * 保存总结到文件
 */
function saveSummary(paper, summary, date) {
    const filename = path.join(
        CONFIG.knowledgeDir,
        `summary_${paper.id.replace('/', '_')}.md`
    );

    const content = `# ${paper.title}

**arXiv ID:** [${paper.id}](https://arxiv.org/abs/${paper.id})
**作者:** ${paper.authors.join(', ')}
**日期:** ${date}

---

${summary}

---

**原文链接:** https://arxiv.org/abs/${paper.id}
**PDF 下载:** https://arxiv.org/pdf/${paper.id}.pdf
`;

    fs.writeFileSync(filename, content, 'utf-8');
    console.log(`   💾 已保存到 ${filename}`);
}

/**
 * 主函数
 */
async function main() {
    console.log('🤖 开始 AI 自动总结...\n');

    // 检查 API Key
    if (!CONFIG.apiKey) {
        console.error('❌ 错误: 未设置 ANTHROPIC_API_KEY 环境变量');
        console.log('\n请设置 API Key:');
        console.log('  export ANTHROPIC_API_KEY="your-api-key-here"');
        console.log('\n或者在 GitHub Secrets 中设置 ANTHROPIC_API_KEY');
        process.exit(1);
    }

    // 确保目录存在
    if (!fs.existsSync(CONFIG.knowledgeDir)) {
        fs.mkdirSync(CONFIG.knowledgeDir, { recursive: true });
    }

    // 读取待总结的论文
    const date = new Date().toISOString().split('T')[0];
    const inputFile = path.join(CONFIG.dataDir, `papers_to_summarize_${date}.json`);

    if (!fs.existsSync(inputFile)) {
        console.error(`❌ 找不到输入文件: ${inputFile}`);
        console.log('\n请先运行: node scripts/fetch-arxiv.js');
        process.exit(1);
    }

    const data = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));
    const papers = data.papers;

    console.log(`📚 共有 ${papers.length} 篇论文待总结\n`);

    // 总结每篇论文
    const summaries = [];
    for (const paper of papers) {
        const summary = await summarizePaper(paper);
        if (summary) {
            saveSummary(paper, summary, date);
            summaries.push({ paper, summary });
        }
        // 避免 API 速率限制
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log(`\n✅ 完成 ${summaries.length}/${papers.length} 篇论文的总结`);

    // 生成每日汇总
    const dailySummary = await generateDailySummary(papers, date);
    if (dailySummary) {
        const dailyFile = path.join(CONFIG.knowledgeDir, `arxiv_daily_${date}.md`);
        const dailyContent = `# arXiv 每日精选 - ${date}

${dailySummary}

---

## 今日论文

${summaries.map((s, i) => `### ${i + 1}. ${s.paper.title}

**arXiv:** [${s.paper.id}](https://arxiv.org/abs/${s.paper.id})

${s.summary.split('\n').slice(0, 3).join('\n')}

[阅读完整总结 →](./summary_${s.paper.id.replace('/', '_')}.md)

---

`).join('\n')}

**数据来源:** [arXiv.org](https://arxiv.org)
`;
        fs.writeFileSync(dailyFile, dailyContent);
        console.log(`\n📅 已生成每日汇总: ${dailyFile}`);
    }

    // 保存元数据
    const metaFile = path.join(CONFIG.dataDir, `summaries_${date}.json`);
    fs.writeFileSync(metaFile, JSON.stringify({
        date,
        count: summaries.length,
        papers: summaries.map(s => ({
            id: s.paper.id,
            title: s.paper.title,
            category: s.paper.category || 'other'
        }))
    }, null, 2));

    console.log('\n✨ 所有总结完成！');
}

// 运行
if (require.main === module) {
    main().catch(err => {
        console.error('❌ 错误:', err);
        process.exit(1);
    });
}

module.exports = { summarizePaper, generateDailySummary };

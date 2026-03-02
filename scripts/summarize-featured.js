#!/usr/bin/env node

/**
 * 精选论文 AI 深度总结生成器
 * 使用 Claude API 为精选的 5 篇论文生成 karpathy 风格的深度解读
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    model: 'claude-3-5-sonnet-20241022',
    featuredDir: path.join(__dirname, '..', 'featured'),
    knowledgeDir: path.join(__dirname, '..', 'knowledge'),
};

/**
 * 调用 Claude API
 */
async function callClaudeAPI(prompt, systemPrompt) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            model: CONFIG.model,
            max_tokens: 8000,
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
                        reject(new Error('Invalid API response: ' + responseData));
                    }
                } catch (err) {
                    reject(new Error('Parse error: ' + err.message + ', response: ' + responseData));
                }
            });
        });

        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

/**
 * 生成系统提示词（karpathy 风格）
 */
function getSystemPrompt() {
    return `你是一个世界级的 AI/ML 研究专家，擅长将复杂的学术论文转化为深入浅出的技术解读。

你的总结风格参考 Andrej Karpathy 的 nanochat skill：
- 技术深度与实践建议并重
- 清晰的结构：问题 → 方法 → 结果 → 启示
- 连接到实际应用场景
- 提供可操作的 insights

总结要求：
1. 使用 Markdown 格式
2. 必须包含以下部分：
   - **TL;DR** - 3-5 句话的核心要点，突出创新性
   - **The Problem** - 问题背景和动机
   - **The Core Technique** - 核心技术方法（带数学公式或伪代码）
   - **Applications & Results** - 具体应用场景和实验结果
   - **Why This Matters for Practice** - 实践意义和影响
   - **Practical Recommendations** - 可操作的实践建议
   - **Technical Details** - 重要的技术细节（可选）
   - **Related Work** - 相关工作对比（可选）

3. 语言风格：
   - 专业但易懂，避免过度学术化
   - 使用具体的数字和例子
   - 突出"为什么重要"而不只是"是什么"
   - 连接到实际的工程实践

4. 长度：1200-1800 字
5. 使用中文写作

参考示例：
---
# Model Agreement via Anchoring

## TL;DR

This paper tackles **model disagreement** — when two ML models trained independently on the same distribution make wildly different predictions. The authors introduce a **"midpoint anchoring"** technique that proves strong disagreement bounds for popular algorithms (stacking, gradient boosting, neural networks, regression trees) **without needing any realizability assumptions**. Key insight: you can achieve high agreement even with high error, as long as the learning curve flattens out.

## The Problem

When you train two models independently on data from the same distribution, they often disagree significantly in their predictions — even if both models have similar accuracy. This creates:
- **Ambiguity** in decision-making (which prediction to trust?)
- **Model churn** in production (disrupts downstream systems)
- **Fairness concerns** (arbitrary decisions in high-stakes settings)

## The Core Technique: Midpoint Anchoring

[技术细节...]

## Why This Matters for Practice

### Actionable Insights
1. **Monitor your learning curves:** When the curve flattens, you have both accuracy and stability.
2. **No tradeoff between accuracy and stability:** Optimize for one, get the other for free.

[更多实践建议...]
---

请按照这个风格和深度为给定的论文生成总结。`;
}

/**
 * 为单篇论文生成总结
 */
async function summarizePaper(paper) {
    const prompt = `请为以下 arXiv 论文生成深度技术总结：

**标题：** ${paper.title}

**作者：** ${paper.authors.join(', ')}

**摘要：**
${paper.summary}

**arXiv ID：** ${paper.id}

请按照系统提示中的格式和风格，生成一篇完整的技术解读。重点关注：
1. 论文解决的核心问题
2. 创新的技术方法
3. 实验结果和性能
4. 对实际工程的启示
5. 可操作的实践建议`;

    const systemPrompt = getSystemPrompt();

    console.log(`\n📝 正在为论文生成总结: ${paper.title.substring(0, 60)}...`);

    try {
        const summary = await callClaudeAPI(prompt, systemPrompt);
        console.log(`   ✅ 总结完成 (${summary.length} 字)`);
        return summary;
    } catch (err) {
        console.error(`   ❌ 总结失败: ${err.message}`);
        return null;
    }
}

/**
 * 生成精选论文的完整 Markdown
 */
function generateFeaturedMarkdown(papers, summaries, date) {
    let md = `# 🌟 arXiv 每日精选 TOP 5 - ${date}\n\n`;
    md += `> 从 150+ 篇最新论文中精选出 5 篇最有价值的研究，并提供深度 AI 解读\n\n`;
    md += `---\n\n`;

    papers.forEach((paper, index) => {
        const shortId = paper.id.replace(/v\d+$/, '');
        const summary = summaries[index];

        md += `# ${index + 1}. ${paper.title}\n\n`;
        md += `**arXiv:** [${shortId}](https://arxiv.org/abs/${shortId}) | `;
        md += `**PDF:** [下载](https://arxiv.org/pdf/${shortId})\n\n`;
        md += `**作者:** ${paper.authors.slice(0, 5).join(', ')}${paper.authors.length > 5 ? ' et al.' : ''}\n\n`;
        md += `**分类:** ${paper.categories.join(', ')}\n\n`;
        md += `---\n\n`;

        if (summary) {
            md += summary + '\n\n';
        } else {
            md += `## 摘要\n\n${paper.summary}\n\n`;
            md += `> ⚠️ AI 总结生成失败，显示原始摘要\n\n`;
        }

        md += `---\n\n`;
    });

    md += `\n**生成时间:** ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}\n`;
    md += `**AI 模型:** Claude 3.5 Sonnet\n`;

    return md;
}

/**
 * 主函数
 */
async function main() {
    if (!CONFIG.apiKey) {
        console.log('❌ 未设置 ANTHROPIC_API_KEY 环境变量');
        console.log('💡 设置方法: export ANTHROPIC_API_KEY="your-key"');
        process.exit(1);
    }

    console.log('🤖 开始生成精选论文 AI 总结...\n');

    const date = new Date().toISOString().split('T')[0];
    const featuredFile = path.join(CONFIG.featuredDir, `featured_${date}.json`);

    if (!fs.existsSync(featuredFile)) {
        console.log('❌ 未找到精选论文数据');
        console.log('💡 请先运行: npm run featured');
        process.exit(1);
    }

    const data = JSON.parse(fs.readFileSync(featuredFile, 'utf8'));
    const papers = data.papers || [];

    console.log(`📚 共有 ${papers.length} 篇精选论文待总结\n`);

    // 为每篇论文生成总结
    const summaries = [];
    for (const paper of papers) {
        const summary = await summarizePaper(paper);
        summaries.push(summary);

        // 等待 2 秒，避免 API rate limit
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // 统计成功率
    const successCount = summaries.filter(s => s !== null).length;
    console.log(`\n✅ 完成 ${successCount}/${papers.length} 篇论文的总结`);

    // 生成完整的 Markdown
    console.log('\n📊 正在生成完整的精选总结...');
    const markdown = generateFeaturedMarkdown(papers, summaries, date);
    const mdPath = path.join(CONFIG.featuredDir, `featured_${date}.md`);
    fs.writeFileSync(mdPath, markdown);
    console.log(`✅ 精选总结已生成: ${mdPath}`);

    // 保存到 knowledge 目录（供后续使用）
    const knowledgePath = path.join(CONFIG.knowledgeDir, `featured_summary_${date}.md`);
    fs.writeFileSync(knowledgePath, markdown);
    console.log(`✅ 已备份到: ${knowledgePath}`);

    console.log('\n💡 下一步:');
    console.log('   1. 运行 npm run convert-featured 生成 HTML');
    console.log('   2. 运行 npm run update 更新网站');
    console.log('   3. 提交并推送到 GitHub');
}

// 运行
if (require.main === module) {
    main().catch(err => {
        console.error('❌ 错误:', err);
        process.exit(1);
    });
}

module.exports = { summarizePaper, callClaudeAPI };

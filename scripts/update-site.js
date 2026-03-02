#!/usr/bin/env node

/**
 * 网站更新器
 * 自动更新网站内容（首页、分类页、每日总结）
 */

const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const CONFIG = {
    dataDir: path.join(__dirname, '..', 'data'),
    knowledgeDir: path.join(__dirname, '..', 'knowledge'),
    siteDir: path.join(__dirname, '..'),
    dailyDir: path.join(__dirname, '..', 'daily'),
    papersDir: path.join(__dirname, '..', 'papers'),
    categoriesDir: path.join(__dirname, '..', 'categories'),
};

/**
 * 读取今日论文数据
 */
function loadTodayPapers() {
    const date = new Date().toISOString().split('T')[0];
    const metaFile = path.join(CONFIG.dataDir, `summaries_${date}.json`);

    if (!fs.existsSync(metaFile)) {
        console.log(`⚠️  未找到今日数据: ${metaFile}`);
        return null;
    }

    return JSON.parse(fs.readFileSync(metaFile, 'utf-8'));
}

/**
 * 转换 Markdown 为 HTML（论文详情页）
 */
function convertPaperToHTML(mdPath, arxivId, date) {
    const mdContent = fs.readFileSync(mdPath, 'utf-8');
    const htmlContent = marked(mdContent);

    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="arXiv ${arxivId} 论文总结">
    <title>${arxivId} | arXiv AI 论文每日精选</title>
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
            <li><a href="../index.html#categories">🏷️ 分类浏览</a></li>
        </ul>
    </nav>

    <main>
        <div class="paper-content">
            ${htmlContent}
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

    const outputPath = path.join(CONFIG.papersDir, `${arxivId.replace('/', '_')}.html`);
    fs.writeFileSync(outputPath, html);
    console.log(`   ✅ ${arxivId}.html`);
}

/**
 * 转换每日总结为 HTML
 */
function convertDailySummaryToHTML(date) {
    const mdPath = path.join(CONFIG.knowledgeDir, `arxiv_daily_${date}.md`);

    if (!fs.existsSync(mdPath)) {
        console.log(`⚠️  未找到每日总结: ${mdPath}`);
        return;
    }

    const mdContent = fs.readFileSync(mdPath, 'utf-8');
    const htmlContent = marked(mdContent);

    const html = `<!DOCTYPE html>
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
            <li><a href="../index.html#categories">🏷️ 分类浏览</a></li>
        </ul>
    </nav>

    <main>
        <div class="paper-content">
            ${htmlContent}
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

    const outputPath = path.join(CONFIG.dailyDir, `${date}.html`);
    fs.writeFileSync(outputPath, html);
    console.log(`   ✅ daily/${date}.html`);
}

/**
 * 更新首页
 */
function updateIndexPage(todayData) {
    // 这里简化处理，实际应该读取现有首页并更新
    console.log(`   ℹ️  首页更新需要手动处理或使用模板引擎`);
    console.log(`   💡 提示: 可以使用 node convert.js 重新生成所有页面`);
}

/**
 * 主函数
 */
async function main() {
    console.log('🔄 开始更新网站...\n');

    const date = new Date().toISOString().split('T')[0];

    // 1. 生成基础 markdown（如果还没有 AI 总结）
    console.log('📝 生成基础论文信息...');
    const { execSync } = require('child_process');
    try {
        execSync('node scripts/generate-basic-summaries.js', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
    } catch (err) {
        console.log('⚠️  基础信息生成失败，继续...');
    }

    // 2. 生成精选5篇
    console.log('\n⭐ 生成精选论文...');
    try {
        execSync('node scripts/generate-featured.js', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
    } catch (err) {
        console.log('⚠️  精选生成失败，继续...');
    }

    // 2.5. AI 总结精选论文（如果有 API key）
    if (process.env.ANTHROPIC_API_KEY) {
        console.log('\n🤖 AI 总结精选论文...');
        try {
            execSync('node scripts/summarize-featured.js', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
        } catch (err) {
            console.log('⚠️  AI 总结失败，继续...');
        }
    } else {
        console.log('\n⚠️  未设置 ANTHROPIC_API_KEY，跳过 AI 总结');
    }

    // 3. 转换 markdown 为 HTML
    console.log('\n📄 转换 markdown 为 HTML...');
    try {
        execSync('node convert.js', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
    } catch (err) {
        console.log('⚠️  HTML 转换失败，继续...');
    }

    // 4. 转换精选页面
    console.log('\n⭐ 生成精选HTML页面...');
    try {
        execSync('node scripts/convert-featured.js', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
    } catch (err) {
        console.log('⚠️  精选页面生成失败，继续...');
    }

    // 5. 生成全部论文页面
    console.log('\n📚 生成全部论文页面...');
    try {
        execSync('node scripts/generate-all-papers.js', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
    } catch (err) {
        console.log('⚠️  全部论文页面生成失败，继续...');
    }

    // 6. 更新首页
    console.log('\n🏠 更新首页...');
    try {
        execSync('node scripts/update-index.js', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
    } catch (err) {
        console.log('⚠️  首页更新失败，继续...');
    }

    console.log('\n✨ 网站更新完成！');
    console.log('\n💡 下一步:');
    console.log('   1. 检查生成的 HTML 文件');
    console.log('   2. 提交更改: git add . && git commit -m "Daily update"');
    console.log('   3. 推送到 GitHub: git push origin main');
}

// 运行
if (require.main === module) {
    main().catch(err => {
        console.error('❌ 错误:', err);
        process.exit(1);
    });
}

module.exports = { updateIndexPage, convertPaperToHTML, convertDailySummaryToHTML };

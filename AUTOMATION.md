# 🤖 自动化功能使用指南

## 概述

你的 arXiv 论文网站现在支持**完全自动化**的每日更新！系统会自动：

1. 📚 **抓取** arXiv 最新论文
2. 🤖 **AI 总结** 使用 Claude API 生成深度解读
3. 🌐 **更新网站** 自动生成 HTML 页面
4. 📤 **发布** 推送到 GitHub，网站自动部署

---

## 快速开始

### 方法 1: 使用 GitHub Actions（推荐）

**完全自动化，每天自动运行！**

#### 1. 设置 API Key

在 GitHub 仓库设置中添加 Secret：

1. 访问：https://github.com/2992638402-art/arxiv-papers-site/settings/secrets/actions
2. 点击 "New repository secret"
3. Name: `ANTHROPIC_API_KEY`
4. Value: 你的 Anthropic API Key
5. 点击 "Add secret"

#### 2. 启用 GitHub Actions

GitHub Actions 已经配置好，会在**每天北京时间早上 8:00** 自动运行！

#### 3. 手动触发（可选）

访问：https://github.com/2992638402-art/arxiv-papers-site/actions

点击 "Daily arXiv Papers Update" → "Run workflow"

---

### 方法 2: 本地运行

**用于测试或手动运行**

#### 前置要求

```bash
# 1. 设置 API Key
export ANTHROPIC_API_KEY="your-api-key-here"

# 2. 安装依赖（如果还没有）
cd ~/clawd/arxiv-papers-site
npm install
```

#### 运行完整流程

```bash
# 运行主脚本（推荐）
chmod +x scripts/run-daily-update.sh
./scripts/run-daily-update.sh
```

或者分步运行：

```bash
# 步骤 1: 抓取论文
node scripts/fetch-arxiv.js

# 步骤 2: AI 总结
node scripts/summarize-papers.js

# 步骤 3: 更新网站
node scripts/update-site.js

# 步骤 4: 提交和推送
git add .
git commit -m "Daily update $(date +'%Y-%m-%d')"
git push origin main
```

---

## 获取 Anthropic API Key

### 1. 注册账号

访问：https://console.anthropic.com

### 2. 创建 API Key

1. 登录后点击 "API Keys"
2. 点击 "Create Key"
3. 复制 Key（格式：`sk-ant-api03-...`）

### 3. API 定价

Claude API 按使用量计费：

- **Claude 3.5 Sonnet**: ~$3 / 百万 tokens
- **每篇论文总结**: ~2000 tokens（输入）+ 1500 tokens（输出）
- **每天 5 篇论文**: 约 $0.02 / 天，每月 ~$0.60

💡 **免费额度**: 新用户通常有 $5 免费额度

---

## 配置选项

### 修改抓取设置

编辑 `scripts/fetch-arxiv.js`:

```javascript
const CONFIG = {
    categories: [
        'cs.AI',      // 人工智能
        'cs.LG',      // 机器学习
        'cs.CL',      // 计算语言学（NLP）
        'cs.CV',      // 计算机视觉
        'cs.RO',      // 机器人
    ],
    maxResults: 10,  // 每个分类抓取的论文数
};
```

### 修改总结模型

编辑 `scripts/summarize-papers.js`:

```javascript
const CONFIG = {
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: 'claude-3-5-sonnet-20241022',  // 或 'claude-3-opus-20240229'
};
```

### 修改运行时间

编辑 `.github/workflows/daily-update.yml`:

```yaml
on:
  schedule:
    # cron 格式: 分 时 日 月 周
    # 0 0 = UTC 0:00 = 北京时间 8:00
    - cron: '0 0 * * *'
```

常用时间：
- `0 0 * * *` - 北京时间 8:00
- `0 16 * * *` - 北京时间 0:00（午夜）
- `0 8 * * *` - 北京时间 16:00（下午 4点）

---

## 文件结构

```
arxiv-papers-site/
├── .github/workflows/
│   └── daily-update.yml          # GitHub Actions 配置
├── scripts/
│   ├── fetch-arxiv.js            # 论文爬虫
│   ├── summarize-papers.js       # AI 总结器
│   ├── update-site.js            # 网站更新器
│   └── run-daily-update.sh       # 主运行脚本
├── data/                         # 抓取的原始数据
│   ├── arxiv_YYYY-MM-DD.json    # 当日论文数据
│   └── papers_to_summarize_*.json
├── knowledge/                    # 生成的总结
│   ├── summary_*.md             # 单篇论文总结
│   └── arxiv_daily_*.md         # 每日汇总
├── daily/                        # 每日总结 HTML
├── papers/                       # 论文详情 HTML
└── ...
```

---

## 工作流程详解

### 1. 抓取阶段（fetch-arxiv.js）

- 从 arXiv API 获取最新论文
- 支持多个分类（AI, ML, CV, NLP, Robotics）
- 自动去重和分类
- 智能筛选最有趣的论文
- 输出：`data/arxiv_YYYY-MM-DD.json`

### 2. 总结阶段（summarize-papers.js）

- 使用 Claude API 生成专业总结
- 每篇论文包含：
  - TL;DR（3-5 句核心要点）
  - 核心创新
  - 技术细节
  - 实践启示
- 生成每日汇总
- 输出：`knowledge/summary_*.md`

### 3. 更新阶段（update-site.js）

- 将 Markdown 转换为 HTML
- 更新首页论文列表
- 更新分类页面
- 生成每日归档页
- 输出：`papers/*.html`, `daily/*.html`

### 4. 发布阶段

- Git 提交所有更改
- 推送到 GitHub
- GitHub Pages 自动部署（1-2 分钟）

---

## 故障排除

### 问题：API Key 无效

```bash
❌ 错误: The specified token is not valid
```

**解决方法：**
1. 检查 API Key 是否正确
2. 确保 Key 以 `sk-ant-` 开头
3. 检查 Key 是否过期
4. 重新生成并设置新的 Key

### 问题：GitHub Actions 失败

**解决方法：**
1. 检查 Secrets 是否正确设置
2. 查看 Actions 日志：https://github.com/2992638402-art/arxiv-papers-site/actions
3. 确认 workflow 文件格式正确

### 问题：论文抓取失败

```bash
❌ 抓取失败: ECONNREFUSED
```

**解决方法：**
1. 检查网络连接
2. arXiv API 可能暂时不可用，稍后重试
3. 减少 `maxResults` 参数

### 问题：网站更新没有生效

**解决方法：**
1. 清除浏览器缓存（Ctrl+Shift+R）
2. 等待 2-3 分钟让 GitHub Pages 重新构建
3. 检查 GitHub Pages 设置是否启用

---

## 高级功能

### 自定义总结模板

编辑 `scripts/summarize-papers.js` 中的 `getSystemPrompt()` 函数。

### 添加新的分类

1. 修改 `scripts/fetch-arxiv.js` 的 `categorizePaper()` 函数
2. 创建新的分类页面模板
3. 更新首页的分类列表

### 邮件通知

添加邮件通知功能（需要配置 SendGrid 或类似服务）：

```yaml
# 在 .github/workflows/daily-update.yml 添加
- name: Send email notification
  uses: dawidd6/action-send-mail@v3
  with:
    server_address: smtp.gmail.com
    server_port: 465
    username: ${{ secrets.EMAIL_USERNAME }}
    password: ${{ secrets.EMAIL_PASSWORD }}
    subject: Daily arXiv Update
    body: Check out today's papers!
```

### RSS 订阅

添加 RSS feed 生成脚本。

---

## 监控和日志

### 查看 GitHub Actions 日志

https://github.com/2992638402-art/arxiv-papers-site/actions

### 本地调试日志

所有脚本都会输出详细的日志信息。

---

## 成本估算

### 每日运行成本

| 项目 | 成本 |
|------|------|
| GitHub Actions | 免费（2000分钟/月）|
| GitHub Pages | 免费 |
| Claude API (5篇) | ~$0.02/天 |
| **月总成本** | **~$0.60/月** |

### 优化建议

1. **减少论文数量**: 改为每天 3 篇
2. **使用更便宜的模型**: Claude 3 Haiku（$0.25/百万 tokens）
3. **本地总结**: 使用开源模型（Ollama + Llama）

---

## 下一步优化

1. ✅ **完成**: 基础自动化流程
2. 🔄 **进行中**: 首页自动更新
3. 📋 **待办**:
   - [ ] RSS 订阅功能
   - [ ] 搜索功能
   - [ ] 邮件订阅
   - [ ] 统计分析
   - [ ] 本地 LLM 支持

---

## 联系和反馈

- **GitHub Issues**: https://github.com/2992638402-art/arxiv-papers-site/issues
- **网站**: https://2992638402-art.github.io/arxiv-papers-site/

---

**🎉 享受你的自动化 arXiv 论文网站吧！**

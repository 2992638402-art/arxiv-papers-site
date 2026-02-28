# 📤 手动上传自动化文件指南

由于 GitHub 账户权限问题，我们使用网页界面手动上传文件。

## 步骤 1: 创建 .github/workflows 目录

1. 访问：https://github.com/2992638402-art/arxiv-papers-site
2. 点击 "Add file" → "Create new file"
3. 在文件名输入框中输入：`.github/workflows/daily-update.yml`
4. 复制以下内容到编辑器：

```yaml
name: Daily arXiv Papers Update

on:
  schedule:
    # 每天 UTC 0:00 运行（北京时间 8:00）
    - cron: '0 0 * * *'
  workflow_dispatch:  # 允许手动触发

jobs:
  update-papers:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Fetch arXiv papers
        run: node scripts/fetch-arxiv.js

      - name: Summarize papers with AI
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: node scripts/summarize-papers.js

      - name: Update website
        run: node scripts/update-site.js

      - name: Commit and push changes
        run: |
          git config --local user.email "github-actions[bot]@users.noreply.github.com"
          git config --local user.name "github-actions[bot]"
          git add .
          git diff --quiet && git diff --staged --quiet || (git commit -m "🤖 Auto-update: Daily arXiv papers $(date +%Y-%m-%d)" && git push)
```

5. 点击 "Commit new file"

## 步骤 2: 上传 scripts 目录文件

### 2.1 上传 fetch-arxiv.js

1. 访问：https://github.com/2992638402-art/arxiv-papers-site/upload/main/scripts
2. 将 `~/clawd/arxiv-papers-site/scripts/fetch-arxiv.js` 拖拽到上传区域
3. 或点击 "choose your files" 选择文件
4. 点击 "Commit changes"

### 2.2 上传 summarize-papers.js

1. 访问：https://github.com/2992638402-art/arxiv-papers-site/upload/main/scripts
2. 上传 `~/clawd/arxiv-papers-site/scripts/summarize-papers.js`
3. 点击 "Commit changes"

### 2.3 上传 update-site.js

1. 访问：https://github.com/2992638402-art/arxiv-papers-site/upload/main/scripts
2. 上传 `~/clawd/arxiv-papers-site/scripts/update-site.js`
3. 点击 "Commit changes"

### 2.4 上传 run-daily-update.sh

1. 访问：https://github.com/2992638402-art/arxiv-papers-site/upload/main/scripts
2. 上传 `~/clawd/arxiv-papers-site/scripts/run-daily-update.sh`
3. 点击 "Commit changes"

## 步骤 3: 上传文档文件

1. 访问：https://github.com/2992638402-art/arxiv-papers-site/upload/main
2. 上传以下文件：
   - `AUTOMATION.md`
   - `AUTOMATION_COMPLETE.md`
3. 点击 "Commit changes"

## 步骤 4: 设置 Anthropic API Key

1. 访问：https://github.com/2992638402-art/arxiv-papers-site/settings/secrets/actions
2. 点击 "New repository secret"
3. Name: `ANTHROPIC_API_KEY`
4. Value: 你的 API Key（格式：`sk-ant-api03-...`）
5. 点击 "Add secret"

### 获取 API Key

如果还没有 API Key：
1. 访问：https://console.anthropic.com/settings/keys
2. 点击 "Create Key"
3. 复制生成的 Key

**注意：新用户通常有 $5 免费额度！**

## 步骤 5: 测试自动化

### 方式 1: 手动触发（推荐）

1. 访问：https://github.com/2992638402-art/arxiv-papers-site/actions
2. 点击左侧 "Daily arXiv Papers Update"
3. 点击右侧 "Run workflow"
4. 点击绿色 "Run workflow" 按钮
5. 等待几分钟，查看运行结果

### 方式 2: 等待自动运行

每天北京时间早上 8:00 会自动运行

## 验证成功

成功后你应该看到：

1. **GitHub Actions 显示绿色勾号** ✅
2. **网站自动更新**：https://2992638402-art.github.io/arxiv-papers-site/
3. **新的 commit**：标题为 "🤖 Auto-update: Daily arXiv papers YYYY-MM-DD"
4. **data 目录**：包含新的论文数据和总结

## 快速上传脚本（可选）

如果你想通过命令行上传（需要先解决账户问题）：

```bash
cd ~/clawd/arxiv-papers-site

# 方法 1: 重新认证为正确的账户
gh auth logout
gh auth login -s workflow
# 选择 2992638402-art 账户

# 方法 2: 或者切换到正确的账户
gh auth switch

# 然后推送
git push origin main
```

## 完成后的效果

✅ 每天早上 8:00 自动抓取论文
✅ AI 自动生成深度总结
✅ 网站自动更新并发布
✅ 完全无需人工干预

**网站地址：** https://2992638402-art.github.io/arxiv-papers-site/
**仓库地址：** https://github.com/2992638402-art/arxiv-papers-site

## 成本估算

- **GitHub Actions**: 免费（2000分钟/月）
- **GitHub Pages**: 免费
- **Claude API**: ~$0.02/天（新用户 $5 额度可用 8 个月）

## 故障排除

### 问题：Actions 失败显示 "ANTHROPIC_API_KEY not found"

**解决方案：**
确认已在 Settings → Secrets and variables → Actions 中添加了 ANTHROPIC_API_KEY

### 问题：fetch-arxiv.js 失败

**解决方案：**
可能是 arXiv API 暂时不可用，等待几分钟后重试

### 问题：无法访问仓库设置

**解决方案：**
确认你使用 2992638402-art 账户登录 GitHub

---

**🎉 祝贺！完成后你将拥有一个全自动的 AI 论文总结网站！**

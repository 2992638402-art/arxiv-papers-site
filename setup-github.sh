#!/bin/bash

# GitHub Repository Setup Script for arXiv Papers Site

echo "🚀 GitHub 仓库创建脚本"
echo "======================================"
echo ""

# Step 1: Login to GitHub
echo "📝 步骤 1/4: 登录 GitHub CLI"
echo "运行命令: gh auth login"
echo ""
gh auth login

if [ $? -ne 0 ]; then
    echo "❌ GitHub 登录失败，请重试"
    exit 1
fi

echo ""
echo "✅ GitHub 登录成功！"
echo ""

# Step 2: Create repository
echo "📦 步骤 2/4: 创建 GitHub 仓库"
echo "仓库名称: arxiv-papers-site"
echo "描述: 每日精选 arXiv AI/ML 论文，深度解读前沿研究"
echo ""

cd ~/clawd/arxiv-papers-site

gh repo create arxiv-papers-site \
    --public \
    --description "每日精选 arXiv AI/ML 论文，深度解读前沿研究" \
    --homepage "https://arxiv.org" \
    --source=. \
    --push

if [ $? -ne 0 ]; then
    echo "❌ 仓库创建失败"
    exit 1
fi

echo ""
echo "✅ 仓库创建成功！"
echo ""

# Step 3: View repository
echo "🌐 步骤 3/4: 查看仓库信息"
REPO_URL=$(gh repo view --json url -q .url)
echo "仓库 URL: $REPO_URL"
echo ""

# Step 4: Instructions
echo "🎉 步骤 4/4: 下一步操作"
echo "======================================"
echo ""
echo "✅ 代码已成功推送到 GitHub！"
echo ""
echo "📌 接下来你可以："
echo ""
echo "1️⃣  部署到 Vercel (推荐)"
echo "   - 访问: https://vercel.com"
echo "   - 点击 'New Project'"
echo "   - 导入你的 GitHub 仓库"
echo "   - 点击 'Deploy'"
echo "   ⏱️  部署时间: ~2 分钟"
echo ""
echo "2️⃣  启用 GitHub Pages"
echo "   - 访问: $REPO_URL/settings/pages"
echo "   - Source 选择 'main' branch"
echo "   - 点击 'Save'"
echo "   🌐 访问地址: https://$(gh api user -q .login).github.io/arxiv-papers-site/"
echo "   ⏱️  生效时间: ~5 分钟"
echo ""
echo "3️⃣  部署到 Netlify"
echo "   - 访问: https://netlify.com"
echo "   - 'Add new site' → 'Import from Git'"
echo "   - 选择你的 GitHub 仓库"
echo "   - 点击 'Deploy site'"
echo "   ⏱️  部署时间: ~2 分钟"
echo ""
echo "======================================"
echo "📚 仓库地址: $REPO_URL"
echo "👀 在浏览器中查看: gh repo view --web"
echo ""

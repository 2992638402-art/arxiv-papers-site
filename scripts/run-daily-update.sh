#!/bin/bash

# arXiv 论文自动化流程主脚本
# 完整流程: 抓取 → 总结 → 更新网站 → 提交

set -e  # 遇到错误立即退出

echo "🚀 开始 arXiv 论文自动化流程"
echo "======================================"
echo ""

# 检查依赖
echo "📦 检查依赖..."
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未安装 Node.js"
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo "📥 安装 npm 依赖..."
    npm install
fi

# 检查 API Key
if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo "⚠️  警告: 未设置 ANTHROPIC_API_KEY"
    echo "   AI 总结功能将无法使用"
    echo ""
    echo "   设置方法:"
    echo "   export ANTHROPIC_API_KEY='your-api-key'"
    echo ""
    read -p "是否继续（仅抓取论文）？(y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
    SKIP_SUMMARIZE=true
fi

echo ""
echo "======================================"
echo "步骤 1/4: 抓取 arXiv 论文"
echo "======================================"
echo ""

node scripts/fetch-arxiv.js

if [ $? -ne 0 ]; then
    echo "❌ 论文抓取失败"
    exit 1
fi

if [ "$SKIP_SUMMARIZE" != "true" ]; then
    echo ""
    echo "======================================"
    echo "步骤 2/4: AI 自动总结"
    echo "======================================"
    echo ""

    node scripts/summarize-papers.js

    if [ $? -ne 0 ]; then
        echo "❌ 论文总结失败"
        exit 1
    fi

    echo ""
    echo "======================================"
    echo "步骤 3/4: 更新网站"
    echo "======================================"
    echo ""

    node scripts/update-site.js

    if [ $? -ne 0 ]; then
        echo "❌ 网站更新失败"
        exit 1
    fi
else
    echo ""
    echo "⏭️  跳过总结和网站更新步骤"
fi

echo ""
echo "======================================"
echo "步骤 4/4: Git 操作"
echo "======================================"
echo ""

# 检查是否有更改
if git diff --quiet && git diff --staged --quiet; then
    echo "ℹ️  没有更改需要提交"
else
    DATE=$(date +'%Y-%m-%d')
    echo "📝 提交更改..."

    git add .
    git commit -m "🤖 Auto-update: Daily papers $DATE"

    echo ""
    read -p "是否推送到 GitHub？(Y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]] || [[ -z $REPLY ]]; then
        echo "📤 推送到 GitHub..."
        git push origin main
        echo "✅ 推送成功！"
        echo ""
        echo "🌐 网站将在 1-2 分钟后更新:"
        echo "   https://2992638402-art.github.io/arxiv-papers-site/"
    else
        echo "⏸️  跳过推送"
        echo ""
        echo "💡 稍后手动推送:"
        echo "   git push origin main"
    fi
fi

echo ""
echo "======================================"
echo "✨ 完成！"
echo "======================================"
echo ""
echo "📊 操作汇总:"
echo "   ✅ 抓取论文"
if [ "$SKIP_SUMMARIZE" != "true" ]; then
    echo "   ✅ AI 总结"
    echo "   ✅ 更新网站"
else
    echo "   ⏭️  跳过 AI 总结"
    echo "   ⏭️  跳过网站更新"
fi
echo "   ✅ Git 提交"
echo ""
echo "🔗 快速链接:"
echo "   📦 本地预览: http://localhost:8080"
echo "   🌐 在线网站: https://2992638402-art.github.io/arxiv-papers-site/"
echo "   📁 GitHub: https://github.com/2992638402-art/arxiv-papers-site"
echo ""

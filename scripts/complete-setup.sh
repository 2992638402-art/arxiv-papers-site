#!/bin/bash

# 自动化最后步骤完成脚本

echo "🚀 完成最后两步 - 自动化设置"
echo "======================================"
echo ""

# 步骤 1: GitHub 授权
echo "📝 步骤 1/2: GitHub 授权（添加 workflow 权限）"
echo "======================================"
echo ""
echo "一次性验证码: 6F7F-C06C"
echo ""
echo "请执行以下操作:"
echo ""
echo "1. 在浏览器中打开: https://github.com/login/device"
echo "2. 输入验证码: 6F7F-C06C"
echo "3. 点击 'Continue'"
echo "4. 授权 GitHub CLI"
echo "5. 确认授权（确保包含 'workflow' 权限）"
echo ""
echo "⏳ 等待授权完成..."
echo ""
echo "按 Enter 继续..."
read

# 步骤 2: 推送代码
echo ""
echo "📤 步骤 2/2: 推送代码到 GitHub"
echo "======================================"
echo ""

cd ~/clawd/arxiv-papers-site

# 检查是否有未提交的更改
if [ -f "AUTOMATION_COMPLETE.md" ]; then
    git add AUTOMATION_COMPLETE.md
    git commit -m "📚 Add automation complete guide"
fi

echo "正在推送到 GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 代码推送成功！"
    echo ""
    echo "======================================"
    echo "🎉 步骤 1 完成！"
    echo "======================================"
    echo ""
    echo "📋 下一步: 设置 API Key"
    echo ""
    echo "方式 1: 在浏览器中设置（推荐）"
    echo "----------------------------------------"
    echo "1. 访问: https://console.anthropic.com/settings/keys"
    echo "2. 创建新的 API Key（如果还没有）"
    echo "3. 复制 API Key（格式: sk-ant-api03-...）"
    echo ""
    echo "4. 访问: https://github.com/2992638402-art/arxiv-papers-site/settings/secrets/actions"
    echo "5. 点击 'New repository secret'"
    echo "6. Name: ANTHROPIC_API_KEY"
    echo "7. Value: 粘贴你的 API Key"
    echo "8. 点击 'Add secret'"
    echo ""
    echo "方式 2: 使用命令行设置"
    echo "----------------------------------------"
    echo "如果你已经有 API Key，运行:"
    echo ""
    echo "  gh secret set ANTHROPIC_API_KEY"
    echo ""
    echo "然后粘贴你的 API Key 并按 Enter"
    echo ""
    echo "======================================"
    echo "📊 完成后的效果"
    echo "======================================"
    echo ""
    echo "✅ 每天早上 8:00 自动抓取论文"
    echo "✅ AI 自动生成深度总结"
    echo "✅ 网站自动更新并发布"
    echo ""
    echo "🌐 网站地址: https://2992638402-art.github.io/arxiv-papers-site/"
    echo "📦 仓库地址: https://github.com/2992638402-art/arxiv-papers-site"
    echo ""
    echo "💡 测试自动化:"
    echo "   访问: https://github.com/2992638402-art/arxiv-papers-site/actions"
    echo "   点击 'Daily arXiv Papers Update' → 'Run workflow'"
    echo ""
else
    echo ""
    echo "❌ 推送失败"
    echo ""
    echo "可能的原因:"
    echo "1. 授权未完成 - 请确认已完成浏览器授权"
    echo "2. 网络问题 - 检查网络连接"
    echo ""
    echo "重试命令:"
    echo "  cd ~/clawd/arxiv-papers-site"
    echo "  git push origin main"
fi

echo ""
echo "======================================"
echo "📚 相关文档"
echo "======================================"
echo ""
echo "- AUTOMATION.md - 完整使用指南"
echo "- AUTOMATION_COMPLETE.md - 完成总结"
echo ""

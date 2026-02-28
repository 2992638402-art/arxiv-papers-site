# 部署指南

## 网站已创建完成！ 🎉

您的 arXiv 论文网站已经创建完成并可以在本地预览。

## 📍 本地预览

网站已启动在：**http://localhost:8080**

在浏览器中打开此链接即可预览网站。

## 🚀 部署到公共网站

### 方法 1: 使用 Vercel（推荐，最简单）

1. **安装并登录 Vercel CLI**
   ```bash
   cd ~/clawd/arxiv-papers-site
   vercel login
   ```

2. **部署**
   ```bash
   vercel --prod
   ```

3. 完成！Vercel 会给你一个公共 URL（类似 https://arxiv-papers-site.vercel.app）

### 方法 2: 使用 GitHub + Vercel（推荐，自动部署）

1. **在 GitHub 创建新仓库**
   - 访问 https://github.com/new
   - 仓库名：`arxiv-papers-site`
   - 设为 Public

2. **推送代码到 GitHub**
   ```bash
   cd ~/clawd/arxiv-papers-site
   git remote add origin https://github.com/你的用户名/arxiv-papers-site.git
   git branch -M main
   git push -u origin main
   ```

3. **连接 Vercel**
   - 访问 https://vercel.com
   - 点击 "New Project"
   - Import 你的 GitHub 仓库
   - 点击 "Deploy"

4. 完成！Vercel 会自动部署，并在每次 push 到 GitHub 时自动更新

### 方法 3: 使用 Netlify

1. **推送代码到 GitHub**（同方法 2 的步骤 1-2）

2. **连接 Netlify**
   - 访问 https://netlify.com
   - 点击 "Add new site" > "Import an existing project"
   - 选择你的 GitHub 仓库
   - 构建设置保持默认
   - 点击 "Deploy"

3. 完成！Netlify 会自动部署

### 方法 4: 使用 GitHub Pages

1. **推送代码到 GitHub**（同方法 2 的步骤 1-2）

2. **启用 GitHub Pages**
   - 在 GitHub 仓库页面，点击 "Settings"
   - 左侧菜单找到 "Pages"
   - Source 选择 "Deploy from a branch"
   - Branch 选择 "main"，文件夹选择 "/ (root)"
   - 点击 "Save"

3. 几分钟后访问：`https://你的用户名.github.io/arxiv-papers-site/`

## 📁 项目结构

```
arxiv-papers-site/
├── index.html              # 首页 ✅
├── daily/                  # 每日总结
│   └── 2026-02-28.html    ✅
├── categories/             # 分类浏览
│   ├── robotics.html      ✅
│   ├── multimodal.html    ✅
│   └── ml-theory.html     ✅
├── papers/                 # 单篇论文
│   ├── summary_model_agreement.html          ✅
│   └── summary_vision_language_alignment.html ✅
├── css/style.css          ✅
├── js/main.js             ✅
└── convert.js             ✅ (Markdown 转 HTML 工具)
```

## 🔄 添加新论文

每天添加新论文的流程：

1. **创建论文总结 Markdown**
   ```bash
   cd ~/clawd/knowledge
   # 创建新的论文总结 markdown 文件
   ```

2. **编辑转换脚本**
   编辑 `convert.js`，添加新论文的转换配置

3. **运行转换**
   ```bash
   cd ~/clawd/arxiv-papers-site
   node convert.js
   ```

4. **更新首页**
   编辑 `index.html`，添加新论文卡片

5. **提交并推送**
   ```bash
   git add .
   git commit -m "Add new papers for YYYY-MM-DD"
   git push origin main
   ```

6. 如果使用 Vercel/Netlify/GitHub Pages，会自动重新部署

## 🎨 自定义样式

编辑 `css/style.css` 来修改：
- 颜色主题（修改 `:root` 中的 CSS 变量）
- 字体
- 布局
- 动画效果

## 📊 网站特性

✅ 响应式设计（支持手机、平板、电脑）
✅ 现代化 UI
✅ SEO 友好
✅ 快速加载
✅ 分类浏览
✅ 每日归档
✅ 平滑滚动
✅ 代码高亮

## 🐛 故障排除

### 本地预览显示不正确？
```bash
# 重启本地服务器
pkill -f "python3 -m http.server"
cd ~/clawd/arxiv-papers-site
python3 -m http.server 8080
```

### 样式没有加载？
检查文件路径是否正确，CSS 和 JS 文件是否存在

### Vercel 部署失败？
- 确保已登录：`vercel login`
- 检查 `vercel.json` 配置是否正确
- 查看错误日志：`vercel logs`

## 📞 需要帮助？

查看完整 README：`~/clawd/arxiv-papers-site/README.md`

---

🎉 **恭喜！你的 arXiv 论文网站已经准备好了！**

现在就去部署到公共网站，开始分享你的论文总结吧！

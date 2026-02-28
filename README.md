# arXiv AI 论文每日精选

> 每日精选 arXiv AI/ML 前沿论文，深度解读，助你把握研究动态

## 特性

- 📅 每日更新最新 arXiv 论文总结
- 🏷️ 按主题分类浏览（机器人、多模态学习、机器学习理论等）
- 📖 深度解读论文核心创新和实践启示
- 🎨 现代化响应式设计
- 🚀 快速加载，SEO 友好

## 分类

- 🤖 **机器人相关** - 机器人学习、操控、导航、具身智能
- 🎨 **多模态学习** - 视觉-语言模型、跨模态对齐、多模态融合
- 📊 **机器学习理论** - 学习理论、优化、泛化、模型分析

## 技术栈

- 纯静态 HTML/CSS/JavaScript
- Marked.js 用于 Markdown 渲染
- 响应式设计，支持移动端
- 部署在 Vercel

## 本地开发

```bash
# 克隆仓库
git clone https://github.com/your-username/arxiv-papers-site.git
cd arxiv-papers-site

# 安装依赖
npm install

# 转换 Markdown 文件为 HTML
node convert.js

# 使用本地服务器预览
npx serve .
# 或者
python3 -m http.server 8000
```

然后访问 http://localhost:8000

## 添加新论文

1. 将论文总结 Markdown 文件放到 `../knowledge/` 目录
2. 编辑 `convert.js` 添加新的转换配置
3. 运行 `node convert.js` 生成 HTML
4. 更新 `index.html` 添加新论文卡片
5. 提交并推送到 GitHub，Vercel 会自动部署

## 部署

### 使用 Vercel（推荐）

1. Fork 此仓库
2. 在 [Vercel](https://vercel.com) 导入项目
3. 点击 Deploy，完成！

### 使用 Netlify

1. Fork 此仓库
2. 在 [Netlify](https://netlify.com) 导入项目
3. 构建设置保持默认
4. 点击 Deploy，完成！

### 使用 GitHub Pages

1. Fork 此仓库
2. 在仓库设置中启用 GitHub Pages
3. 选择 main 分支作为源
4. 访问 `https://your-username.github.io/arxiv-papers-site/`

## 文件结构

```
arxiv-papers-site/
├── index.html              # 首页
├── daily/                  # 每日总结
│   └── 2026-02-28.html
├── categories/             # 分类浏览
│   ├── robotics.html
│   ├── multimodal.html
│   └── ml-theory.html
├── papers/                 # 单篇论文详情
│   ├── summary_model_agreement.html
│   └── summary_vision_language_alignment.html
├── css/
│   └── style.css          # 样式文件
├── js/
│   └── main.js            # 交互脚本
├── convert.js             # Markdown 转 HTML 脚本
└── package.json           # NPM 配置
```

## 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建新分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启 Pull Request

## 许可证

MIT License

## 致谢

- 论文来源：[arXiv.org](https://arxiv.org)
- 由 Claude Code 自动生成
- Markdown 渲染：[Marked.js](https://marked.js.org)

---

**欢迎 Star ⭐ 和 Fork 🍴**

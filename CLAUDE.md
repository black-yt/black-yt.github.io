# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此仓库中工作时提供指导。

## 项目概述

这是徐望瀚的学术个人主页，上海交通大学博士生。基于 Jekyll 构建并托管于 GitHub Pages，通过 GitHub Actions 自动更新 Google Scholar 引用数。

## 本地开发

启动带热重载的本地服务器：
```bash
bash run_server.sh
# 等价于：bundle exec jekyll liveserve
# 访问地址：http://localhost:4000
```

本项目未定义测试或代码检查命令。

## 架构

### 内容结构
主页（`_pages/about.md`）通过 `include_relative` 组合各模块化 Markdown 片段：
- `_pages/includes/intro.md` — 简介/个人介绍
- `_pages/includes/pub.md` — 论文列表
- `_pages/includes/news.md` — 最新动态
- `_pages/includes/honors.md` — 荣誉奖项
- `_pages/includes/talks.md` — 受邀报告
- `_pages/includes/services.md` — 学术服务
- `_pages/includes/others.md` — 其他信息

更新内容时应编辑各独立 include 文件，而非直接修改 `about.md`。

### 配置
- `_config.yml` — 全站配置：作者信息、社交链接、SEO 密钥、Google Analytics
- `_data/navigation.yml` — 顶部导航菜单项

### Google Scholar 引用集成
引用数由 GitHub Actions 工作流（`.github/workflows/google_scholar_crawler.yaml`）每日 UTC 08:00 自动更新。Python 脚本 `google_scholar_crawler/main.py` 使用 `scholarly` 库抓取引用数据，将结果以 `gs_data.json` 存储在独立 git 分支中。前端 JavaScript 获取该 JSON 并通过 `data` 属性将引用数注入对应 HTML 元素。

如需手动触发更新，在 Actions 页面手动运行对应工作流即可。

### 布局与模板
- `_layouts/default.html` — 唯一主布局（使用 compress 压缩 HTML）
- `_includes/author-profile.html` — 侧边栏社交链接（通过 Liquid 支持 40+ 平台）
- `_includes/head.html`、`masthead.html` — 页面 head 与顶部导航

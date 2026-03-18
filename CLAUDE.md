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
- `_sass/_config.scss` — **字体/尺寸集中配置**（所有排版变量在此修改，无需改动其他文件）

### Google Scholar 引用集成
引用数由 GitHub Actions 工作流（`.github/workflows/google_scholar_crawler.yaml`）每日 UTC 08:00 自动更新。Python 脚本 `google_scholar_crawler/main.py` 使用 `scholarly` 库抓取引用数据，将结果以 `gs_data.json` 存储在独立 git 分支中。前端 JavaScript 获取该 JSON 并通过 `data` 属性将引用数注入对应 HTML 元素。

如需手动触发更新，在 Actions 页面手动运行对应工作流即可。

### 布局与模板
- `_layouts/default.html` — 唯一主布局（使用 compress 压缩 HTML）
- `_includes/author-profile.html` — 侧边栏社交链接（通过 Liquid 支持 40+ 平台）
- `_includes/head.html`、`masthead.html` — 页面 head 与顶部导航

## CSS 架构经验

### 主题 CSS 的已知陷阱

**`_page.scss` 对段落硬编码字号：**
```scss
.page__content p, li, dl { font-size: 16px; }
```
这条规则使 `.page__content` 容器上的 `font-size` 对段落/列表文字无效（`<div>` 等非 p/li/dl 元素不受影响）。必须用 `!important` 显式覆盖：
```scss
.page__content p, .page__content li, .page__content dl {
    font-size: $content-p-size !important;
}
```

**`_sidebar.scss` 的 `.sidebar p, li` 选择器权重问题：**
```scss
.sidebar p, li { font-size: $type-size-6; }  /* 权重 (0,1,1) */
```
该选择器权重高于 `.author__direction`（权重 `(0,1,0)`），会覆盖研究方向的字号设置。解决方案：对 `.author__direction` 加 `!important`。

**`_sidebar.scss` 对 author__name 设置了 breakpoint 字号：**
```scss
.sidebar .author__name {
    font-size: $type-size-4;                    /* 基础 */
    @include breakpoint($medium) { font-size: $type-size-3; }  /* 中屏放大 */
}
```
自定义覆盖时需用 `.sidebar .author__name { font-size: ... !important; }` 才能在所有断点生效。

**`_base.scss` 对 h1 设置了相对字号：**
```scss
h1 { font-size: $type-size-3; }  /* = 1.4em，相对于父容器 */
```
若父容器（`.page__content`）字号变化，h1 也随之缩放。如需固定，用 `px` 单位并加 `!important` 覆盖。

### 选择器权重速查
- `.class` = `(0,1,0)`
- `.parent .child` = `(0,2,0)`
- `.parent p` = `(0,1,1)`（元素选择器 +1）
- 同权重时后声明者胜出；`!important` 无视权重

### 自定义导航（masthead）
已完全替换主题的 greedy-nav 为自定义 `.site-nav`。关键点：
- `overflow-x: auto` 只能放在 `.site-nav`（滚动容器），`<ul>` 用 `width: max-content; min-width: 100%` 确保窄屏时只向右溢出
- 悬停效果用 `@media (hover: hover) and (pointer: fine)` 包裹，防止触屏设备点击后残留悬停样式
- `target="_self"` 写在 `<a>` 上，避免 `<base target="_blank">` 在 JS 挂载前导致新标签跳转

### 移动端背景 canvas 抖动
canvas resize 事件在 iOS 上会被地址栏出现/消失触发（高度变化约 44–88px），导致 canvas 被清空一帧出现闪烁。解决：宽度不变且高度变化 ≤ 90px 时跳过 resize；同时给 canvas 加 `backface-visibility: hidden` 锁定 GPU 合成层。

### About Me 点击返回顶部
jQuery 的 `smoothScroll` 在冒泡阶段处理锚点跳转。自定义 click handler 须用 `{ capture: true }` + `e.stopImmediatePropagation()` 在捕获阶段拦截，才能阻止 jQuery 的行为，改为 `window.scrollTo({ top: 0, behavior: 'smooth' })`。

### 深色模式文字选中
浏览器默认选中色在深色背景下不可见。在 `[data-theme="dark"]` 块内加：
```scss
::selection      { background: rgba(160, 180, 220, 0.35); color: #ffffff; }
::-moz-selection { background: rgba(160, 180, 220, 0.35); color: #ffffff; }
```

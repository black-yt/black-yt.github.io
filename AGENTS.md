# AGENTS.md

本文件是本仓库面向后续代理、维护者与未来自己的长期工作记录。目标不是重复 README，而是把已经确认过的结构、经验、决策、坑点和最近改动整理清楚，减少重复试错。

## 1. 项目定位

这是徐望瀚的学术个人主页仓库，线上站点为 `https://black-yt.github.io`。

- 技术栈：Jekyll + GitHub Pages
- 主题基础：Minimal Mistakes
- 站点类型：静态个人学术主页
- 主要内容：个人介绍、论文、动态、荣誉、报告、服务、其他信息、CV PDF
- 额外交互：主题切换、卡片样式、新闻展开收起、Google Scholar 引用数自动更新

## 2. 仓库结构速览

### 2.1 内容入口

主页主入口是 `_pages/about.md`，但实际内容主要分散在 `_pages/includes/` 下，各模块通过 `include_relative` 组合。

- `_pages/includes/intro.md`：个人简介、My Apps、Ask Me Anything 按钮
- `_pages/includes/pub.md`：论文列表
- `_pages/includes/news.md`：新闻动态
- `_pages/includes/honors.md`：荣誉奖项
- `_pages/includes/talks.md`：报告
- `_pages/includes/services.md`：学术服务
- `_pages/includes/others.md`：其他信息

更新内容时，优先直接修改这些 include 文件，而不是去改 `about.md`。

### 2.2 样式与脚本

- `assets/css/main.scss`：本项目的大部分自定义样式都在这里，包含主题变量、按钮、卡片、交互样式等
- `assets/js/custom-scripts.js`：主题切换、界面交互等自定义脚本
- `_sass/_config.scss`：字体、尺寸等集中配置入口
- `_sass/` 其他文件：继承自主题并带有定制覆盖

### 2.3 配置与资源

- `_config.yml`：站点标题、作者信息、插件配置、时区等
- `_data/navigation.yml`：导航菜单
- `pdfs/WanghanXu.pdf`：线上 CV 下载文件
- `images/`：论文配图、头像、favicon 等

## 3. 本地开发与环境说明

### 3.1 启动方式

常规本地开发命令：

```bash
bash run_server.sh
```

等价于：

```bash
bundle exec jekyll liveserve
```

### 3.2 当前已知环境差异

在当前这台机器上，曾出现过 `bundle` 指向 Windows Ruby 路径、而当前环境实际在 WSL 中运行的情况。表现为：

- `bundle exec jekyll build` 可能失败
- 报错原因不是仓库代码本身，而是 Ruby/Bundler 路径不匹配

结论：

- 如果是在 WSL 中工作，先确认 `ruby`、`bundle` 是否来自 WSL 环境
- 这属于本地环境问题，不应直接归因到仓库改动

### 3.3 本项目当前没有可靠的自动化测试

本仓库没有现成的单元测试或 lint 流程。每次改动后，至少做下面两类检查：

1. `git diff --check`
2. 本地打开页面，确认视觉和链接行为

## 4. 内容维护经验

### 4.1 字体与尺寸调整

如果要统一调整字号、间距、导航大小、卡片标题字号等，优先改 `_sass/_config.scss`，不要分散去改多个文件。

### 4.2 论文区更新

论文列表维护在 `_pages/includes/pub.md`。

更新时建议注意三件事：

1. 标题文本是否与落地页一致
2. 标题链接、Arxiv 链接、Code 链接是否各自指向正确位置
3. 若保留旧标题但链接改到新页面，需要明确这是有意为之

### 4.3 App 卡片区更新

App 卡片维护在 `_pages/includes/intro.md` 的 `My Apps` 区域。

每个卡片是一个 `<a class="app-card">`，外层链接负责点击区域，内层 `.app-card__inner` 负责视觉层和动画。

这个结构很重要：

- 不要轻易把位移动画加在外层 `<a>` 上
- 交互高亮优先改 `.app-card__inner`
- 可以减少边缘抖动和点击区域漂移

## 5. 已确认的样式与前端经验

### 5.1 主题全局链接焦点样式

主题默认对全局链接 `a:focus` 应用了黄色系 `outline`。来源如下：

- `_sass/_mixins.scss`
- `_sass/_reset.scss`
- `_sass/_base.scss`

其中 `$warning-color` 是偏黄橙色，因此链接点击后出现黄色外轮廓属于主题原生行为，不是浏览器偶发 bug。

### 5.2 App 卡片焦点态已做局部覆盖

为了避免 `Deep Research`、`Wanghan-Pro` 等项目卡片点击后出现突兀的黄色轮廓，已经只对 `.app-card` 做了最小必要覆盖，位置在：

- `assets/css/main.scss`

当前策略：

- 不动全局 `a:focus`
- 仅对 `.app-card:focus` 去掉黄色 `outline`
- 用与卡片 hover 风格一致的边框高亮与 `box-shadow` 替代

这样影响范围只限项目卡片，不会误伤站内其他普通链接。

### 5.3 主题 CSS 已知权重坑

这些经验来自此前实际调整：

1. `_page.scss` 会对 `.page__content p, li, dl` 写死字号，导致容器级别字体设置不一定能传导到正文元素。
2. `_sidebar.scss` 某些选择器权重较高，可能覆盖研究方向或作者名的局部字号设置。
3. `h1` 使用相对字号，父容器字号变化可能连带放大缩小标题。

因此，涉及局部尺寸修正时，需要先看选择器权重，再决定是否需要更具体选择器或 `!important`。

## 6. Git 与换行符经验

### 6.1 本仓库已经补充 `.gitattributes`

已新增：

- `.gitattributes`

当前规则核心是：

```gitattributes
* text=auto eol=lf
```

并对常见二进制文件（如 `png`、`jpg`、`pdf`、字体文件等）标记为 `binary`。

### 6.2 这样做的原因

此前仓库曾出现大批文本文件从 `LF` 被改成 `CRLF` 的情况，导致：

- `git status` 出现大量无意义修改
- `git diff --check` 报出海量 trailing whitespace
- review 成本显著上升
- 更容易引发 merge 冲突

所以后续不要随意整仓库改换行符；如果在 Windows / WSL 混合环境中工作，更要依赖 `.gitattributes` 维持一致性。

### 6.3 当前忽略项

`.gitignore` 已增加：

- `.codex`

这用于忽略本地 Codex 相关目录，属于合理的本地工作区清理项。

## 7. 本轮已完成的重要更新记录

以下内容是在最近几轮维护中已经实际完成并推送的改动。

### 7.1 个人简介与联系信息

文件：

- `_pages/includes/intro.md`

已完成：

- 邮箱链接由错误的主页链接修正为 `mailto:xu_wanghan@sjtu.edu.cn`
- 文案中补充了 `auto research` 表述
- `My Apps` 区域新增 `AutoR`
- `ResearchClaw` 描述改为更贴近 `auto research`

### 7.2 论文链接更新

文件：

- `_pages/includes/pub.md`

已完成：

- `Eigen-Agent` 标题与 OpenReview 页面标题对齐
- `EarthSE` 增加 ICLR / OpenReview 链接
- `Earth-Agent` 增加 ICLR / OpenReview 链接
- `Omni-Weather` 链接改为 ICLR / OpenReview，但标题按要求保留原文案

特别说明：

- `Omni-Weather` 当前是“标题保留原版本、链接指向 OpenReview”的有意状态
- 这不是遗漏，而是经过明确确认后的保留策略

### 7.3 CV 更新

文件：

- `pdfs/WanghanXu.pdf`

说明：

- 该 PDF 改动是手动更新并明确要求保留、提交、推送的
- 它不是无意的二进制漂移

### 7.4 App 卡片点击高亮修正

文件：

- `assets/css/main.scss`

已完成：

- 去掉项目卡片点击后的黄色 `outline`
- 改为与卡片本身视觉风格一致的边框和阴影高亮
- 仅修改 `.app-card`，保持改动面最小

## 8. 后续维护建议

### 8.1 每次改动后优先做的事情

1. 看 `git diff --stat`
2. 跑 `git diff --check`
3. 如果涉及链接，至少手点一遍关键链接
4. 如果涉及卡片、按钮、导航、焦点态，至少手点一遍桌面端交互

### 8.2 修改论文、简介、CV 时的建议

- 简介、App、联系信息：改 `_pages/includes/intro.md`
- 论文：改 `_pages/includes/pub.md`
- CV：替换 `pdfs/WanghanXu.pdf`
- 需要维持链接样式统一时，优先复用现有卡片和按钮样式，不要新造一套视觉体系

### 8.3 修改样式时的建议

- 小改动优先放 `assets/css/main.scss`
- 只在必要时再下沉到 `_sass/` 的主题文件
- 如果只想修某个局部交互，不要贸然改全局 `a:focus`、`button`、`p`、`h1` 等基础规则

## 9. 一句话总结

这是一个已经定制较深的 Jekyll 学术主页仓库。后续维护时，优先尊重现有结构和视觉系统，谨慎处理全局样式、换行符和二进制文件，改动尽量局部、清晰、可追踪。

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
- `_pages/includes/blogs.md`：博客标题列表（自动从 `_blogs/` 收集）
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
2. 标题链接、arXiv 链接、Code 链接是否各自指向正确位置
3. 若保留旧标题但链接改到新页面，需要明确这是有意为之

### 4.3 App 卡片区更新

App 卡片维护在 `_pages/includes/intro.md` 的 `My Apps` 区域。

每个卡片是一个 `<a class="app-card">`，外层链接负责点击区域，内层 `.app-card__inner` 负责视觉层和动画。

这个结构很重要：

- 不要轻易把位移动画加在外层 `<a>` 上
- 交互高亮优先改 `.app-card__inner`
- 可以减少边缘抖动和点击区域漂移

### 4.4 博客维护（2026-10-08 新增）

主页 Blogs 位于 Honors and Awards 与 Invited Talks 之间，沿用现有一级标题和普通列表样式，仅展示文章标题。文章页由 `_layouts/blog.html` 渲染，继承主页布局、字体、侧栏、主题切换和动态背景。

新增文章只需添加两份 Markdown，无需修改主页或导航：

1. `_blogs/<slug>.en.md`：英文正文，`lang: en`，会自动加入主页标题列表，按日期倒序。
2. `_blogs/<slug>.zh.md`：预先翻译好的中文正文，`lang: zh`。
3. 两份文件使用相同且唯一的 `translation_key` 和相同的发布日期，各自设置标题、描述与独立链接。语言切换由 Jekyll 构建时自动配对，不依赖在线翻译服务。

英文 front matter 示例（中文文件相应改为 `lang: zh`、中文标题/描述与 `/blogs/<slug>/zh/`）：

```yaml
---
title: "Article title"
date: 2026-10-08
lang: en
translation_key: my-article
permalink: /blogs/my-article/
description: "A short description of this article."
---
```

- 作者默认是 `Wanghan Xu (徐望瀚)`，需要时可在 front matter 中通过 `author` 覆盖。
- 正文从二级标题 `##` 开始，文章标题、日期、作者由布局生成。支持 Markdown 段落、列表、引用块 `>`、链接、代码、图片和 Kramdown 脚注（`[^ref]` 与 `[^ref]: ...`）。
- 站内图片使用根路径（例如 `/images/example.png`）。博客页的链接默认在当前页面打开，脚注跳转与返回引用不会新开标签页。
- 图片推荐写为 `![说明文字]({{ '/images/example.png' | relative_url }})`；正文图片自动适配容器宽度，不会拉伸比例。
- 普通 Markdown 图片自动复用主页的 Magnific Popup 点击放大、关闭和多图切换，无需手写链接；SVG 也支持，图库仅包含当前文章配图。显式链接到高清图片时保留该图片地址，链接到普通网页时保留原有跳转。自动图片链接在 `custom-scripts.js` 中同步准备，必须保持该脚本在正文之后、DOM 就绪之前加载，让主题现有的 `.image-popup` 初始化统一处理，再沿用同一配置建立文章图库。
- 公式使用 Kramdown + MathJax。行内推荐 `$$y = f_{\theta}(x)$$`，独立公式使用单独成行的 `$$` 包围内容，并在公式块前后留空行。不要把公式包在反引号中；代码块内的公式示例不会被渲染。
- `> **备注：** 内容` 会渲染为带左侧竖线的备注块；多段备注之间保留一行 `>`，块内可以使用加粗、链接、列表和公式。
- MathJax 固定使用 2.7.9 的 `MathJax.js`，不要改回依赖额外版本查询的 `latest.js`。公式脚本与字体由 cdnjs 加载；博客长公式在自身区域横向滚动，不应撑宽手机页面。验证时需等待实际公式排版和字体加载完成，不能只检查 TeX 原文是否存在。
- 第一篇占位文章为 `_blogs/first-blog.en.md` 和 `_blogs/first-blog.zh.md`；后续填入正文时同步两种语言。
- CSS、脚本与头像使用 `relative_url`，博客导航指向主页对应锚点，避免嵌套链接下资源失效。不要改回相对当前目录的资源路径。

## 5. 已确认的样式与前端经验

### 5.1 主题全局链接焦点样式

主题原始默认对全局链接 `a:focus` 应用了黄色系 `outline`。来源如下：

- `_sass/_mixins.scss`
- `_sass/_reset.scss`
- `_sass/_base.scss`

其中 `$warning-color` 是偏黄橙色，因此旧版本中链接点击后出现黄色外轮廓属于主题原生行为，不是浏览器偶发 bug。当前仓库已将全局链接焦点态覆盖为主题色 `box-shadow`，并对 `.app-card` 与 `.site-nav__link` 做了局部一致化处理。

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
- About Me 中新增 Stanford University Visiting Scholar (remote) 经历与 Embodied AI / Automated Science Discovery 方向
- 侧边栏姓名下新增 `Visiting Scholar at Stanford University`，通过 `_config.yml` 的 `visiting` 字段渲染
- `_config.yml` 中的研究方向改为 `from virtual world to physical world`
- `My Apps` 区域新增 `AutoR`
- `My Apps` 区域新增 `Harness🎠`，链接到 `https://huggingface.co/spaces/InternScience/ResearchHarness`
- `ResearchClaw` 描述改为更贴近 `auto research`

### 7.2 论文链接更新

文件：

- `_pages/includes/pub.md`

已完成：

- `Eigen-Agent` 标题与 OpenReview 页面标题对齐
- `EarthSE` 增加 ICLR / OpenReview 链接
- `Earth-Agent` 增加 ICLR / OpenReview 链接
- `Omni-Weather` 链接改为 ICLR / OpenReview，但标题按要求保留原文案
- 新增核心作者论文 `ReCrit: Transition-Aware Reinforcement Learning for Scientific Critic Reasoning`
- 新增合作论文 `Sci-PRM: A Tool Aware Process Reward Model for Scientific Reasoning Verification`，venue 写作 `KDD, 2026 (Accept)`
- `Sci-PRM` 暂无链接时使用 `[Camera-ready coming soon]` 占位，避免 Markdown 行尾换行符裸露
- Publications 中展示文本统一使用 `arXiv` 大小写

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
- `_sass/_mixins.scss`

已完成：

- 去掉项目卡片点击后的黄色 `outline`
- 改为与卡片本身视觉风格一致的边框和阴影高亮
- 仅修改 `.app-card`，保持改动面最小
- 后续又将全局链接焦点态 `%tab-focus` 从黄色 `outline` 改为主题色 `box-shadow`
- 顶部导航 `.site-nav__link` 也已使用一致的背景和阴影焦点态

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

### 8.4 遇到 Git 网络问题时的处理规范

如果 `git push`、`git fetch`、`git ls-remote` 等 Git 命令因为网络问题失败，例如：

- `Recv failure: Connection reset by peer`
- HTTPS 连接被重置
- `gnutls_handshake() failed: The TLS connection was non-properly terminated`
- 远端暂时不可达

处理原则如下：

1. 不要改用其他绕路方案上传代码
2. 不要临时切换到 `curl`、`gh`、网页上传、API 写入等替代方式完成原本的 Git 推送
3. 应先在当前命令进程中关闭代理后重试原始 Git 命令
4. 关闭代理重试仍失败时，再把需要用户执行的原始 Git 命令明确告诉用户，由用户在自己的网络环境中执行

关闭代理重试 `push` 时优先使用：

```bash
env -u http_proxy -u https_proxy -u HTTP_PROXY -u HTTPS_PROXY -u all_proxy -u ALL_PROXY git -c http.proxy= -c https.proxy= push origin main
```

默认应优先提供的命令通常是：

```bash
git push origin main
```

如果本地还有未提交改动，则按顺序提供：

```bash
git add <files>
git commit -m "<message>"
git push origin main
```

这条规则是本仓库后续维护中的明确经验，后面继续沿用。

### 8.5 WSL Bash、Windows 路径与 apply_patch 可靠性经验

经验来源：

- `/mnt/d/xwh/ailab记录/工作/26年05月/skills/wsl-bash-windows/SKILL.md`

这个仓库位于 `/mnt/d/...`，后续默认应按 WSL 项目处理：

1. 看到 `/mnt/c/...` 或 `/mnt/d/...` 路径时，默认使用交互式 WSL Bash 和 Linux 命令链；涉及 Git、联网、依赖、Node/npm/Python 环境或路径排错时，优先用 `bash -i -c ...` 或原生交互 WSL shell，不要切到 PowerShell、cmd、Windows `node.exe` 或浏览器 `fetch`。
2. Windows 路径需要转换为 WSL 路径，例如 `D:\path\repo` 对应 `/mnt/d/path/repo`；中文路径、空格路径或特殊字符路径必须整体加引号。
3. 非交互 shell 中 `PS1` 为空是正常现象。需要确认交互 shell 时，可用 `bash -i -c 'printf "%s\n" "$PS1"'`，看到 `/mnt/d/...` prompt 才说明交互初始化正常。
4. 如果报 `Read-only file system`、`Permission denied`、无法创建 `.git/index.lock`、网络受限等，优先判断为沙箱/权限限制并申请提权，不要误判成仓库坏了或 Bash 不存在。
5. 联网任务如果失败，先检查是否需要提权或原生 WSL Bash；若出现 TLS 断开、代理端口不可达、DNS 异常等，再检查代理并按原始命令关闭代理重试，不要改用 Windows 工具链或其他上传/下载绕路。
6. 如果报 `codex-linux-sandbox` 不存在，或 `CreateProcess` 找不到 `/bin/bash`，通常是执行器或沙箱包装器没有真正进入 WSL；这时应停止改文件，提示用户修复或重启 Codex 的 WSL 绑定，而不是绕到 Windows 工具链。
7. 文件修改必须优先用 `apply_patch`。如果 `apply_patch` 行为异常，不要用 `cat > file`、Python 写文件、`sed -i` 等方式绕过，应先确认执行器和文件系统视图可信。
8. 在环境可疑或跨 WSL/Windows 边界工作前，做 `apply_patch` 探针闭环：新建临时文件、用 Bash 读取、用 `apply_patch` 修改、再用 `apply_patch` 删除、最后用 Bash 确认文件不存在。
9. `apply_patch` 返回 `Success` 但 Bash 看不到文件、同一文件能重复 `Add File`、刚新增文件删除时报不存在，都是文件系统视图不可信的信号，应立即停止继续编辑。
10. 用户贴来 Windows 图片或临时截图路径时，先把 `C:\Users\...\file.png` 转为 `/mnt/c/Users/.../file.png`，或把 `D:\...\file.png` 转为 `/mnt/d/.../file.png`；反斜杠改正斜杠，中文、空格和特殊字符路径要加引号。
11. 读取用户图片前先用 `ls -l "<WSL path>"` 确认文件仍存在，再把转换后的 WSL 路径交给图片查看工具；如果文件不存在，通常是临时截图已被清理，应让用户重新上传或重新截图。不要把用户真实临时路径写进仓库文档。
12. 临时测试文件必须用后清理，并通过 `git status --short` 或 `test ! -e <file>` 确认没有残留。

## 9. 一句话总结

这是一个已经定制较深的 Jekyll 学术主页仓库。后续维护时，优先尊重现有结构和视觉系统，谨慎处理全局样式、换行符和二进制文件，改动尽量局部、清晰、可追踪。

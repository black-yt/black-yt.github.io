# black-yt.github.io

Personal academic homepage of **Wanghan Xu (徐望瀚)**, PhD student in Electronic Information at Shanghai Jiao Tong University.

🌐 **Live site:** [black-yt.github.io](https://black-yt.github.io)

## About

Built on [Jekyll](https://jekyllrb.com/) with the [Minimal Mistakes](https://github.com/mmistakes/minimal-mistakes) theme, hosted on GitHub Pages. Features a custom design system with 4 switchable colour themes, animated UI components, and auto-updated Google Scholar citation counts.

## Features

- **4 colour themes** — Pure White / Warm Yellow / Cool Blue / Dark, switchable via floating dot palette, persisted in `localStorage`
- **Auto Google Scholar citations** — GitHub Actions workflow runs daily (UTC 08:00) to fetch citation data via `scholarly` and store it in the `google-scholar-stats` branch
- **Animated components** — breathing glow button, segmented control with sliding indicator, smooth news expand/collapse
- **Responsive layout** — JS-pinned sidebar on desktop, compact horizontal profile on mobile
- **Performance** — non-blocking font loading, Font Awesome preloaded, lazy images (below-fold only)

## Project Structure

```
_pages/
  about.md                  # Main page (assembles includes)
  includes/
    intro.md                # About Me + My Apps
    news.md                 # News with expand/collapse
    pub.md                  # Publications with All / Key Contributor filter
    honors.md               # Honors and Awards
    talks.md                # Invited Talks
    services.md             # Academic Services
    others.md               # Other info
_includes/
  author-profile.html       # Sidebar profile card
  head/custom.html          # Favicons, fonts, MathJax
assets/
  css/main.scss             # All custom styles + theme variables
  js/custom-scripts.js      # Theme switcher, sidebar pin, filter, news toggle
_config.yml                 # Site config: author info, analytics, SEO
```

## Local Development

```bash
bash run_server.sh
# equivalent to: bundle exec jekyll liveserve
# visit: http://localhost:4000
```

Requires Ruby + Bundler. Dependencies are listed in `Gemfile`.

## Updating Content

Edit the relevant file in `_pages/includes/` — changes to `about.md` are generally not needed. The page assembles content via `include_relative`.

To trigger a manual Google Scholar citation update, run the workflow from the Actions tab.

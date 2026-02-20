部署说明

将以下文件放到 GitHub 仓库的 `gh-pages` 分支或 `docs/` 目录，启用 GitHub Pages 即可：

- `index.html`  （主页）
- `script.js`
- `styles.css`

注意：页面使用了外部 CDN 依赖 `solarlunar` 来进行公历→农历转换，发布时需要可访问外部 CDN。若需要离线部署，请将 `solarlunar` 的代码一并拷贝到仓库并修改引用。

使用示例：
- 将 `docs/` 文件夹推到 `main` 分支（或 `gh-pages` 分支），在 GitHub 仓库设置 → Pages 选择 `main/docs` 或 `gh-pages`。

运行本地预览：
```bash
python -m http.server 8000
# 打开浏览器 http://localhost:8000/docs/
```

# 将 support.html / privacy.html 发布到 GitHub Pages

本目录下的 `support.html`（技术支持）与 `privacy.html`（隐私政策）可托管在 **GitHub Pages**，得到可在浏览器直接打开的 `https://` 链接，用于 **App Store Connect** 的「支持 URL」「隐私政策 URL」等字段。

## 推荐做法（仓库根目录即为 `tuibao-app` 时）

1. 在 GitHub 新建仓库（可设为 **Public**），将本项目推送到该仓库。
2. 打开仓库 **Settings → Pages**。
3. **Build and deployment → Branch** 选 `main`（或你的主分支），文件夹选 **`/docs`**，保存。
4. 等待 1～3 分钟部署完成后，在浏览器访问（请替换为你的用户名与仓库名）：

   - 技术支持：  
     `https://<你的GitHub用户名>.github.io/<仓库名>/support.html`
   - 隐私政策：  
     `https://<你的GitHub用户名>.github.io/<仓库名>/privacy.html`

若仓库名是 `tuibao-app`、用户名为 `myname`，示例为：

- `https://myname.github.io/tuibao-app/support.html`
- `https://myname.github.io/tuibao-app/privacy.html`

## 若你的 Git 仓库根目录不是 `tuibao-app`

需保证 GitHub 仓库**根目录下**存在 `docs` 文件夹，且内含上述两个 HTML。可将本目录整份复制到仓库根目录的 `docs/` 下，再按上面步骤开启 Pages。

## App Store Connect 填写建议

- **技术支持网址（Support URL）**：填 `support.html` 的完整 `https://` 地址。
- **隐私政策网址（Privacy Policy URL）**：填 `privacy.html` 的完整 `https://` 地址。

保存后用手机 Safari 打开两条链接，确认能正常显示即可提交审核。

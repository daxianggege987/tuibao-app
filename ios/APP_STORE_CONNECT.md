# 归档并上传到 App Store Connect

本工程为 **Capacitor iOS**，可上传的 Xcode 工程路径：

```
tuibao-app/ios/App/App.xcodeproj
```

（也可打开同目录下的 `App.xcodeproj/project.xcworkspace` 以解析 Swift Package。）

---

## 1. 上传前准备

1. **Apple Developer Program** 已付费生效。
2. **App Store Connect** 中已创建 App，**Bundle ID** 与工程一致：`w2a.W2Atuibao.t2bao.net`（若你改用其他 ID，需在 Xcode 与 ASC 中同步修改）。
3. **内购商品**：在 App Store Connect 创建非消耗型 IAP，Product ID 与代码一致：`com.tuibao.guide.unlock`。
4. **隐私政策 URL、支持 URL**：在 App Store Connect 应用信息中填写（审核必填项之一）。

---

## 2. 同步 Web 资源（必做）

在 `tuibao-app` 目录执行：

```bash
npm install
npm run ios:sync
```

确保 `App/App/public/` 内含最新 `index.html`、资源与 `tuibao.pdf`。

---

## 3. 用 Xcode 打开工程

```bash
open ios/App/App.xcodeproj
```

若提示解析 Swift Package，等待解析完成。

### 签名与能力

1. 左侧选中 **App** target → **Signing & Capabilities**。
2. **Team** 选择你的开发者团队。
3. **Signing Certificate**：一般选 **Apple Distribution**（归档时 Xcode 会自动处理）。
4. 点击 **+ Capability**，添加 **In-App Purchase**（应用内购买）。  
   - 若已存在，无需重复添加。  
   - 工程已包含 `App/App.entitlements`，启用能力后 Xcode 会写入相应条目。

### 版本号

- **TARGETS → App → General**
  - **Version**：面向用户的版本号（如 `1.0.0`），对应 `MARKETING_VERSION`。
  - **Build**：每次上传递增（如 `1`、`2`…），对应 `CURRENT_PROJECT_VERSION`。

或在 **Build Settings** 中直接改 `MARKETING_VERSION` / `CURRENT_PROJECT_VERSION`。

---

## 4. 归档（Archive）

1. 顶部设备选 **Any iOS Device (arm64)**（不要选模拟器）。
2. 菜单 **Product → Archive**。
3. 等待完成后，**Organizer** 窗口打开，选中刚生成的归档。

---

## 5. 分发到 App Store Connect

1. 在 Organizer 中点击 **Distribute App**。
2. 选择 **App Store Connect** → **Upload**。
3. 选项保持默认（含上传符号表等）→ 选择签名方式（通常 **Automatically manage signing**）→ **Upload**。

也可使用命令行归档（需已配置 Distribution 证书与描述文件；首次建议仍用 Xcode）：

```bash
cd ios/App
xcodebuild archive \
  -project App.xcodeproj \
  -scheme App \
  -configuration Release \
  -archivePath ../build/App.xcarchive \
  -destination 'generic/platform=iOS'
```

> 若签名报错，请在 Xcode 中先完成 **Signing & Capabilities** 再重试；命令行需与钥匙串中的证书一致。

---

## 6. 命令行导出 IPA（可选）

归档成功后，若需从 `.xcarchive` 导出 IPA，可使用本目录下的 `ExportOptions-AppStore.plist`：

```bash
xcodebuild -exportArchive -archivePath build/App.xcarchive -exportPath build/export -exportOptionsPlist ExportOptions-AppStore.plist
```

再使用 **Transporter** 或 **altool** / **notary** 等工具上传（以 Apple 当前文档为准）。

---

## 7. 共享 Scheme

已包含共享 Scheme：**App**，且 **Archive** 使用 **Release** 配置。团队其他成员打开工程后应能直接 **Archive**，无需再创建 Scheme。

---

## 8. 合规与加密

`Info.plist` 已设置 `ITSAppUsesNonExemptEncryption = false`（表示不使用需申报的自定义强加密）。若你的 App 实际使用了需申报的加密，请在提交时按 Apple 问卷如实修改。

---

## 9. 常见问题

| 现象 | 处理 |
|------|------|
| 找不到 Provisioning Profile | 在 developer.apple.com 检查 App ID 是否开启 In-App Purchase，并重新下载描述文件。 |
| Archive 灰色 | 设备需选真机或 **Any iOS Device**，不能选模拟器。 |
| Swift Package 失败 | 检查网络，**File → Packages → Reset Package Caches**。 |

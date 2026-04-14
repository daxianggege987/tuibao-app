# iOS App（Capacitor + App Store 内购）

**归档并上传到 App Store Connect**：见 [APP_STORE_CONNECT.md](APP_STORE_CONNECT.md)。

## 流程

1. 用户在 App 内完成测评并提交  
2. 成功页点击「使用 App Store 解锁」→ StoreKit 购买 `com.tuibao.guide.unlock`（非消耗型）  
3. 购买成功后进入「退保方法说明」页，展示 `public/tuibao.pdf`（更新文档时替换该文件后执行 `npm run ios:sync`）

## 本地演示（模拟器）

1. 安装依赖并同步前端资源：
   ```bash
   cd tuibao-app
   npm install
   npm run ios:sync
   ```
2. 用 Xcode 打开：`ios/App/App.xcodeproj`
3. **StoreKit 测试配置**：菜单 **Product → Scheme → Edit Scheme… → Run → Options**，将 **StoreKit Configuration** 选为 **`Tuibao.storekit`**（文件在左侧导航 **App** 分组内：`App/Tuibao.storekit`，内含商品 ID `com.tuibao.guide.unlock`）。**名称若为红色表示路径失效**，请用 **Choose…** 重新选中该文件；否则模拟器会一直提示「未找到商品」。
4. 选择模拟器（如 iPhone 17），**Run**。

在模拟器中：提交测评 → 成功页 → 解锁 → 使用测试账户流程完成「购买」→ 进入文档页。

## 上架前（App Store Connect）

1. 在 App Store Connect 创建同 ID 的**非消耗型** IAP：`com.tuibao.guide.unlock`，价格与审核信息按规范填写。  
2. 确保 Xcode 的 **Signing & Capabilities** 中已启用 **In-App Purchase**。  
3. 沙盒测试：使用沙盒 Apple ID 在真机验证购买与恢复。

## 脚本

- `npm run ios:sync`：构建 Web 并执行 `cap sync ios`，把 `dist` 拷进 `App/public`。

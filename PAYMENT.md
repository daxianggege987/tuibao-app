# 付费与解锁说明（App Store 内购）

本项目已改为 **iOS App Store 应用内购买**（非消耗型），不再使用第三方网页支付。

- **流程与 Xcode 演示步骤**：见 [ios/README.md](ios/README.md)  
- **商品 ID**：`com.tuibao.guide.unlock`（与 `IAPPlugin.swift`、`Tuibao.storekit` 保持一致）  
- **价格**：
  - **模拟器 / Xcode 本地测试**：由 `ios/App/App/Tuibao.storekit` 里商品的 `displayPrice` 决定（仅用于 StoreKit 测试界面展示）。
  - **正式上架**：用户在 App 内看到的价格由 **App Store Connect** 中该 IAP 的 **价格等级（Price Schedule）** 决定；上架后可在 App Store Connect 为该内购项**调整价格或改价**（需遵守苹果规则与审核要求）。修改 ASC 价格后无需改代码，但测试时仍可用 `.storekit` 保持占位价。
- **解锁后文档**：静态文件 [tuibao-app/public/tuibao.pdf](public/tuibao.pdf)，替换后重新构建即可

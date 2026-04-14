import Foundation
import Capacitor
import StoreKit

/// App Store 内购：非消耗型「解锁退保方法说明」
@objc(IAPPlugin)
public class IAPPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "IAPPlugin"
    public let jsName = "IAP"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "purchase", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "restore", returnType: CAPPluginReturnPromise),
    ]

    /// 与 App Store Connect / StoreKit 配置里的 Product ID 一致
    private let productId = "com.tuibao.guide.unlock"

    @objc public func purchase(_ call: CAPPluginCall) {
        Task {
            do {
                let products = try await Product.products(for: [productId])
                guard let product = products.first else {
                    call.reject("未找到商品，请检查 App Store Connect 与 StoreKit 配置")
                    return
                }
                let result = try await product.purchase()
                switch result {
                case .success(let verification):
                    let transaction = try Self.verify(verification)
                    await transaction.finish()
                    call.resolve(["unlocked": true])
                case .userCancelled:
                    call.reject("User cancelled", "USER_CANCELLED", nil)
                case .pending:
                    call.reject("订单待处理（如家长审批）")
                @unknown default:
                    call.reject("未知购买结果")
                }
            } catch {
                call.reject(error.localizedDescription)
            }
        }
    }

    @objc public func restore(_ call: CAPPluginCall) {
        Task {
            do {
                try await AppStore.sync()
                var unlocked = false
                for await entitlement in Transaction.currentEntitlements {
                    if case .verified(let transaction) = entitlement {
                        if transaction.productID == self.productId {
                            unlocked = true
                        }
                    }
                }
                call.resolve(["unlocked": unlocked])
            } catch {
                call.reject(error.localizedDescription)
            }
        }
    }

    private static func verify(_ result: VerificationResult<Transaction>) throws -> Transaction {
        switch result {
        case .unverified:
            throw NSError(domain: "IAP", code: 0, userInfo: [NSLocalizedDescriptionKey: "交易未通过校验"])
        case .verified(let transaction):
            return transaction
        }
    }
}

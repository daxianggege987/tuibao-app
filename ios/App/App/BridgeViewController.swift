import UIKit
import Capacitor

/// 注册本地 IAP 插件（Capacitor 不会自动扫描 App 目录下的 Swift 插件）
class BridgeViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        super.capacitorDidLoad()
        bridge?.registerPluginInstance(IAPPlugin())
    }
}

// swift-tools-version: 5.9
// 与 Ionic 官方 capacitor-swift-pm Release 相同的二进制产物，使用本地路径，避免拉取 GitHub。
import PackageDescription

let package = Package(
    name: "capacitor-swift-pm",
    platforms: [.iOS(.v15)],
    products: [
        .library(
            name: "Capacitor",
            targets: ["Capacitor"]
        ),
        .library(
            name: "Cordova",
            targets: ["Cordova"]
        )
    ],
    dependencies: [],
    targets: [
        .binaryTarget(
            name: "Capacitor",
            path: "../Capacitor.xcframework"
        ),
        .binaryTarget(
            name: "Cordova",
            path: "../Cordova.xcframework"
        )
    ]
)

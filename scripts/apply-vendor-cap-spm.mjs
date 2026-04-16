#!/usr/bin/env node
/**
 * 把 Capacitor iOS SPM 从「GitHub capacitor-swift-pm 仓库」切换为本地垫片
 * ios/App/CapApp-SPM/Vendor/capacitor-swift-pm-local（xcframework 与官方 Release 相同）。
 * 同时改写 @capacitor/browser 的 Package.swift，使其依赖同一垫片，避免重复声明 binaryTarget。
 *
 * `npx cap sync ios` 后执行（已挂在 npm run ios:sync）。
 * --lenient：未检出 Vendor 目录时静默退出（仅前端开发克隆）。
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const lenient = process.argv.includes('--lenient')

const packageSwiftPath = path.join(root, 'ios/App/CapApp-SPM/Package.swift')
const vendorCap = path.join(root, 'ios/App/CapApp-SPM/Vendor/Capacitor.xcframework')
const vendorCordova = path.join(root, 'ios/App/CapApp-SPM/Vendor/Cordova.xcframework')
const shimPkg = path.join(root, 'ios/App/CapApp-SPM/Vendor/capacitor-swift-pm-local/Package.swift')
/** 这些插件自带的 Package.swift 会拉 GitHub capacitor-swift-pm，需统一改为本地垫片 */
const capacitorPluginPackageSwifts = [
  'node_modules/@capacitor/browser/Package.swift',
  'node_modules/@capacitor/haptics/Package.swift',
  'node_modules/@capacitor-community/admob/Package.swift',
]

const hasVendor = fs.existsSync(vendorCap) && fs.existsSync(vendorCordova) && fs.existsSync(shimPkg)

function patchCapAppSpm() {
  let text = fs.readFileSync(packageSwiftPath, 'utf8')
  text = text.replace(/\n\/\/ DO NOT MODIFY THIS FILE[^\n]*\n/, '\n')

  // 旧版脚本若注入过 Vendor/*.xcframework 的 binaryTarget，与垫片包冲突，先去掉
  text = text.replace(
    /\n\s*\.binaryTarget\s*\(\s*\n\s*name:\s*"Capacitor",\s*\n\s*path:\s*"Vendor\/Capacitor\.xcframework"\s*\n\s*\),\s*/g,
    '\n'
  )
  text = text.replace(
    /\n\s*\.binaryTarget\s*\(\s*\n\s*name:\s*"Cordova",\s*\n\s*path:\s*"Vendor\/Cordova\.xcframework"\s*\n\s*\),\s*/g,
    '\n'
  )

  // 以前如果曾把依赖写成字符串 "Capacitor"，恢复为 .product
  text = text.replace(
    /dependencies:\s*\[\s*\n\s*"Capacitor",\s*\n\s*"Cordova",/,
    'dependencies: [\n                .product(name: "Capacitor", package: "capacitor-swift-pm"),\n                .product(name: "Cordova", package: "capacitor-swift-pm"),'
  )

  text = text.replace(
    /\.package\s*\(\s*url:\s*"https:\/\/github\.com\/ionic-team\/capacitor-swift-pm\.git"\s*,\s*exact:\s*"[^"]+"\s*\)/,
    '.package(name: "capacitor-swift-pm", path: "Vendor/capacitor-swift-pm-local")'
  )

  // 若已存在本地垫片依赖则跳过替换
  if (!text.includes('Vendor/capacitor-swift-pm-local')) {
    console.warn('[apply-vendor-cap-spm] Package.swift 未识别 capacitor-swift-pm 依赖，请检查。')
  }

  if (!text.includes('Vendored Capacitor') && !text.includes('capacitor-swift-pm-local')) {
    text = text.replace(
      /^(?:(\/\/[^\n]*\n))*(\/\/ swift-tools-version:[^\n]+\nimport PackageDescription\n)/m,
      `$2// capacitor-swift-pm：本地 Vendor/capacitor-swift-pm-local（scripts/apply-vendor-cap-spm.mjs）\n`
    )
  }

  fs.writeFileSync(packageSwiftPath, text, 'utf8')
}

function patchCapacitorPluginSpm() {
  const replacement =
    '.package(name: "capacitor-swift-pm", path: "../../../ios/App/CapApp-SPM/Vendor/capacitor-swift-pm-local")'
  const githubRe =
    /\.package\s*\(\s*url:\s*"https:\/\/github\.com\/ionic-team\/capacitor-swift-pm\.git"\s*,\s*(?:from|exact):\s*"[^"]+"\s*\)/

  for (const rel of capacitorPluginPackageSwifts) {
    const fullPath = path.join(root, rel)
    if (!fs.existsSync(fullPath)) {
      console.warn(`[apply-vendor-cap-spm] 未找到 ${rel}（可稍后在 npm install 后再跑）。`)
      continue
    }
    let text = fs.readFileSync(fullPath, 'utf8')
    if (!text.includes('github.com/ionic-team/capacitor-swift-pm.git')) {
      continue
    }
    text = text.replace(githubRe, replacement)
    fs.writeFileSync(fullPath, text, 'utf8')
    console.log(`[apply-vendor-cap-spm] 已把 ${rel} 指向本地 capacitor-swift-pm-local。`)
  }
}

function dropStalePackageResolved() {
  for (const p of [
    path.join(root, 'ios/App/CapApp-SPM/Package.resolved'),
    path.join(
      root,
      'ios/App/App.xcodeproj/project.xcworkspace/xcshareddata/swiftpm/Package.resolved'
    ),
  ]) {
    try {
      if (fs.existsSync(p)) fs.unlinkSync(p)
    } catch (_) {}
  }
}

if (!hasVendor) {
  const msg =
    '缺少 ios/App/CapApp-SPM/Vendor（Capacitor/Cordova xcframework 与 capacitor-swift-pm-local）。' +
    ' 首次可：node scripts/fetch-vendor-xcframeworks.mjs'
  if (lenient) {
    console.log('[apply-vendor-cap-spm] ' + msg + ' （--lenient，跳过）')
    process.exit(0)
  }
  console.error('[apply-vendor-cap-spm] ' + msg)
  process.exit(1)
}

patchCapacitorPluginSpm()
if (fs.existsSync(packageSwiftPath)) {
  patchCapAppSpm()
}
dropStalePackageResolved()
console.log('[apply-vendor-cap-spm] 已完成：SPM 不再解析 github.com 上的 capacitor-swift-pm 仓库。')

#!/usr/bin/env node
/**
 * 仅当仓库里未包含 Vendor/*.xcframework 时使用（需能访问 GitHub releases）。
 * 下载的是 Ionic 官方 capacitor-swift-pm 与 Package 中相同的 zip 与校验和。
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const vendorDir = path.join(root, 'ios/App/CapApp-SPM/Vendor')
const version = '8.3.0'

const artifacts = [
  {
    name: 'Capacitor',
    url: `https://github.com/ionic-team/capacitor-swift-pm/releases/download/${version}/Capacitor.xcframework.zip`,
    checksum: '8c3d73ba5986f0163c1bde0784255acda39f53e7488b483be9c3e9d9624363f0',
  },
  {
    name: 'Cordova',
    url: `https://github.com/ionic-team/capacitor-swift-pm/releases/download/${version}/Cordova.xcframework.zip`,
    checksum: 'ba4b2d01c60195d73131e8e0e661faef75564725b8499812fb13433282b6201e',
  },
]

fs.mkdirSync(vendorDir, { recursive: true })

for (const a of artifacts) {
  const zipPath = path.join(vendorDir, `${a.name}.xcframework.zip`)
  const outFramework = path.join(vendorDir, `${a.name}.xcframework`)
  if (fs.existsSync(outFramework)) {
    console.log(`已有 ${a.name}.xcframework，跳过。`)
    continue
  }
  console.log(`下载 ${a.url} …`)
  execSync(`curl -fL --retry 3 -o "${zipPath}" "${a.url}"`, { stdio: 'inherit' })
  const sum = execSync(`shasum -a 256 "${zipPath}"`, { encoding: 'utf8' }).trim().split(/\s/)[0]
  if (sum !== a.checksum) {
    fs.unlinkSync(zipPath)
    throw new Error(`${a.name} SHA256 不匹配：期望 ${a.checksum} 得到 ${sum}`)
  }
  execSync(`unzip -o -q "${zipPath}" -d "${vendorDir}"`, { stdio: 'inherit' })
  fs.unlinkSync(zipPath)
}

console.log('Vendor xcframework 已就绪。')

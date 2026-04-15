import pkg from '../../package.json'

/** 应用展示名（与 App Store 上架名称一致） */
export const APP_DISPLAY_NAME = '退保评估'

/** 构建版本号（来自 package.json，发版时随版本 bump） */
export const APP_VERSION = pkg.version

/**
 * 若已配置公开可访问的隐私政策 / 用户协议 URL，设置页将优先用系统浏览器打开。
 * 留空字符串则使用应用内静态页（见 LegalScreen）。
 */
export const PRIVACY_POLICY_URL = 'https://daxianggege987.github.io/tuibao-app/privacy.html'
export const TERMS_OF_SERVICE_URL = 'https://daxianggege987.github.io/tuibao-app/support.html'

export const CONTACT_EMAIL = '94722424@qq.com'

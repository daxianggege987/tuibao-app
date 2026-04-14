import pkg from '../../package.json'

/** 应用展示名（与 App 显示名称可一致） */
export const APP_DISPLAY_NAME = '退保免费评估'

/** 构建版本号（来自 package.json，发版时随版本 bump） */
export const APP_VERSION = pkg.version

/**
 * 若已配置公开可访问的隐私政策 / 用户协议 URL，设置页将优先用系统浏览器打开。
 * 留空字符串则使用应用内静态页（见 LegalScreen）。
 */
export const PRIVACY_POLICY_URL = ''
export const TERMS_OF_SERVICE_URL = ''

/** 客服联系占位，发版前可改为真实邮箱或微信说明 */
export const CONTACT_EMAIL = '94722424@qq.com'
export const CONTACT_WECHAT_HINT =
  '请通过应用内购买说明或您签约渠道提供的联系方式联系客服（此处为占位）。'

import { Capacitor } from '@capacitor/core'
import { IAP } from '../plugins/iap'
import { setGuideUnlocked } from './unlock'

export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform()
}

/** App 内：调起 App Store 内购；成功后写入本地解锁状态 */
export async function purchaseGuideWithAppStore(): Promise<void> {
  const { unlocked } = await IAP.purchase()
  if (unlocked) setGuideUnlocked(true)
}

/** 恢复购买（非消耗型） */
export async function restoreGuidePurchase(): Promise<boolean> {
  const { unlocked } = await IAP.restore()
  if (unlocked) setGuideUnlocked(true)
  return unlocked
}

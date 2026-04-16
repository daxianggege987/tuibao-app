import { Capacitor } from '@capacitor/core'
import {
  AdMob,
  BannerAdPosition,
  BannerAdSize,
  InterstitialAdPluginEvents,
} from '@capacitor-community/admob'
import {
  ADMOB_BANNER_AD_UNIT_ID,
  ADMOB_INTERSTITIAL_AD_UNIT_ID,
} from '../constants/adMob'

let initPromise: Promise<void> | null = null
let interstitialListenersRegistered = false

async function initAdMobInner(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return

  await AdMob.initialize()

  if (Capacitor.getPlatform() === 'ios') {
    const { status } = await AdMob.trackingAuthorizationStatus()
    if (status === 'notDetermined') {
      await AdMob.requestTrackingAuthorization()
    }
  }

  try {
    await AdMob.prepareInterstitial({ adId: ADMOB_INTERSTITIAL_AD_UNIT_ID })
  } catch {
    /* 网络或地区限制时可能失败 */
  }

  if (!interstitialListenersRegistered) {
    interstitialListenersRegistered = true
    void AdMob.addListener(InterstitialAdPluginEvents.Dismissed, () => {
      void AdMob.prepareInterstitial({ adId: ADMOB_INTERSTITIAL_AD_UNIT_ID }).catch(
        () => {},
      )
    })
  }
}

/** 应用启动时调用一次，完成 SDK 初始化与插页预加载 */
export function initAdMobOnce(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return Promise.resolve()
  if (!initPromise) initPromise = initAdMobInner()
  return initPromise
}

/** 根据当前界面显示/隐藏底部横幅（问卷与审阅页不展示，避免打断填写） */
export async function syncBannerForPhase(phase: string): Promise<void> {
  if (!Capacitor.isNativePlatform()) return

  const withBanner = new Set([
    'intro',
    'settings',
    'history',
    'knowledge',
    'checklist',
    'process',
    'calculator',
    'faq',
    'success',
    'guide',
  ])

  try {
    if (withBanner.has(phase)) {
      await AdMob.showBanner({
        adId: ADMOB_BANNER_AD_UNIT_ID,
        position: BannerAdPosition.BOTTOM_CENTER,
        adSize: BannerAdSize.ADAPTIVE_BANNER,
        margin: 0,
      })
    } else {
      await AdMob.removeBanner()
    }
  } catch {
    /* 无网络、未同意追踪等情况下忽略 */
  }
}

/** 评估提交成功页展示插页广告（稍作延迟，避免与页面切换抢焦点） */
export async function showInterstitialAfterAssessment(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return
  await initAdMobOnce()
  await new Promise<void>((r) => setTimeout(r, 450))

  try {
    await AdMob.showInterstitial()
  } catch {
    try {
      await AdMob.prepareInterstitial({ adId: ADMOB_INTERSTITIAL_AD_UNIT_ID })
      await AdMob.showInterstitial()
    } catch {
      /* ignore */
    }
  }
}

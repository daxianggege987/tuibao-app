const KEY = 'tuibao-guide-unlocked-v1'

export function isGuideUnlocked(): boolean {
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

export function setGuideUnlocked(value: boolean) {
  try {
    if (value) localStorage.setItem(KEY, '1')
    else localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}

/** 浏览器内演示用（非 App Store） */
export function simulateDemoUnlock() {
  setGuideUnlocked(true)
}

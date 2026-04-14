import { registerPlugin } from '@capacitor/core'

export interface IAPPlugin {
  purchase(): Promise<{ unlocked: boolean }>
  restore(): Promise<{ unlocked: boolean }>
}

export const IAP = registerPlugin<IAPPlugin>('IAP', {
  web: () => ({
    async purchase() {
      throw new Error('IAP_UNAVAILABLE_WEB')
    },
    async restore() {
      throw new Error('IAP_UNAVAILABLE_WEB')
    },
  }),
})

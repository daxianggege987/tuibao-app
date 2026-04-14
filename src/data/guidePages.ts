/** 应用内分页图：`public/guide/page-NN.png`（页数与 GUIDE_PAGE_COUNT 一致） */
export const GUIDE_PAGE_COUNT = 7

/** 与导出文件名一致： png | jpg | jpeg | webp */
export const GUIDE_PAGE_EXT: 'png' | 'jpg' | 'jpeg' | 'webp' = 'png'

const PAD = 2

/** 第 index 页（0-based）的 URL 路径片段，相对网站根（与 public/ 对应） */
export function guidePageSrc(index: number): string {
  const n = String(index + 1).padStart(PAD, '0')
  return `guide/page-${n}.${GUIDE_PAGE_EXT}`
}

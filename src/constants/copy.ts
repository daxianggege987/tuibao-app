/** 定稿文案：开场、免责声明、分组标题（与题库分离便于法务迭代） */

export const INTRO_TITLE = '退保免费评估'

export const INTRO_BODY =
  '您好，帮您免费评估一下，看看您的情况是否符合全额退保。以下为投保人需回答的问题。'

/** 首页三步流程说明（仅展示，无额外逻辑） */
export const INTRO_STEPS: readonly { title: string; body: string }[] = [
  {
    title: '填写问卷',
    body: '按顺序回答与保单、交费、保全等相关问题，可随时返回修改。',
  },
  {
    title: '查看评估思路',
    body: '提交前可审阅全部答案；系统将给出是否符合退保条件的初步结论。',
  },
  {
    title: '按需查看说明',
    body: '若您已购买操作指引，可从首页进入《退保方法说明》分页阅读或分享 PDF；已提交记录可在设置中查看摘要。',
  },
]

export const PRIVACY_HINT =
  '请勿在公共场合或他人设备上填写；问卷草稿与已提交评估摘要在本机保存，不上传服务器。提交后的数据处理请见隐私政策。'

export const DISCLAIMER_SHORT =
  '本评估仅用于初步了解情况，不构成法律意见或承诺；是否可退保以保险公司及监管规则为准。'

export const DISCLAIMER_REVIEW =
  '提交即表示您已阅读并理解：上述信息将用于初步评估参考，不构成任何法律承诺或结果保证。具体退保条件以保险合同、保险公司规则及有权机关认定为准。'

/** 付费引导（成功页）；具体交付方式由业务在支付后台/邮件中完成 */
export const PURCHASE_TITLE = '获取《退保操作指南》'

export const PURCHASE_BODY =
  '解锁后可查看完整退保方法说明（内容由运营配置）。购买通过 App Store 应用内购买完成，一次购买可在此设备上恢复。文档仅供学习参考，不构成法律意见。'

/** 可选：链接到「付费后如何下载」说明（需配置 VITE_POST_PURCHASE_HELP_URL） */
export const POST_PURCHASE_HELP_LABEL = '付费后如何获取文档？'

/** 付费解锁后展示区：占位，后续由运营替换为正式 HTML/Markdown 渲染 */
/** 保全与理赔三题任一为「是」 */
export const VERDICT_INELIGIBLE =
  '抱歉，您的保险退保无法办理'

/** 三题全为「否」时展示；{amount} 为格式化金额 */
export const VERDICT_ELIGIBLE_TEMPLATE =
  '恭喜您，您的保险可以申请退保。退保金额大概为 {amount} 元。具体操作方法，请购买后查看，如需协助操作，请付款后联系客服微信。'

/** 已购文档为 public/tuibao.pdf，更新文档时替换该文件即可 */
export const GUIDE_INTRO =
  '以下为已解锁的《退保方法说明》。可滑动或按钮翻页阅读下图，也可用底部按钮分享完整 PDF。'

export const GROUP_LABELS: Record<string, string> = {
  policy: '保单信息',
  payment: '交费情况',
  compliance: '投保与信息',
  agent: '业务员',
  contract: '合同与回访',
  extra: '保全与理赔',
}

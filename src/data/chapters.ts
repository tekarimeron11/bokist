import type { Chapter } from '../types'

export const CHAPTERS: Chapter[] = [
  { id: 'shouhin',  name: '商品売買',          order: 1, description: '三分法、返品、諸掛り、クレジット売掛金' },
  { id: 'genkin',   name: '現金・預金',        order: 2, description: '現金過不足、小口現金、当座借越' },
  { id: 'tegata',   name: '手形・電子記録',    order: 3, description: '約束手形、電子記録債権・債務' },
  { id: 'urikake',  name: '売掛・買掛・貸倒', order: 4, description: '売買代金の決済、貸倒引当金' },
  { id: 'kotei',    name: '有形固定資産',      order: 5, description: '取得・減価償却・売却' },
  { id: 'kyuryou',  name: '給料・社会保険',    order: 6, description: '給料の支払い、社会保険料納付' },
  { id: 'keika',    name: '経過勘定',          order: 7, description: '前払・前受・未払・未収' },
  { id: 'zeikin',   name: '消費税・法人税',    order: 8, description: '税抜方式、中間納付' },
  { id: 'shihon',   name: '資本・剰余金',      order: 9, description: '株式発行、配当' },
  { id: 'sonota',   name: 'その他',            order: 10, description: '訂正仕訳、商品券、立替・仮払' },
  { id: 'kessan',   name: '決算整理',          order: 11, description: '売上原価、棚卸減耗、貯蔵品、損益振替' },
]

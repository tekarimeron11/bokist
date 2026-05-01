export type GlossaryCategory =
  | 'basic'
  | 'shouhin'
  | 'genkin'
  | 'kotei'
  | 'kessan'
  | 'other'

export type GlossaryEntry = {
  term: string
  definition: string
  category?: GlossaryCategory
}

export const GLOSSARY: GlossaryEntry[] = [
  {
    term: '借方',
    definition: '仕訳の左側に書く欄のことです。意味の「借りる」とは関係なく、単なる位置の名称です。資産が増えたとき・費用が発生したときなどはこちらに書きます。',
    category: 'basic',
  },
  {
    term: '貸方',
    definition: '仕訳の右側に書く欄のことです。意味の「貸す」とは関係なく、単なる位置の名称です。負債・純資産が増えたとき・収益が発生したときなどはこちらに書きます。',
    category: 'basic',
  },
  {
    term: '相手勘定',
    definition: '仕訳で対になるもう一方の勘定科目のことです。たとえば「現金で仕入」した場合、仕入の相手勘定は現金になります。',
    category: 'basic',
  },
  {
    term: '振替',
    definition: 'ある勘定から別の勘定へ金額を移し替える処理のことです。決算整理や訂正仕訳などでよく使います。',
    category: 'basic',
  },
  {
    term: '諸口',
    definition: '仕訳の借方または貸方に複数の勘定がある場合に、総勘定元帳の摘要欄でまとめて示す表現です。「相手勘定が複数ある」という意味です。',
    category: 'basic',
  },
  {
    term: '三分法',
    definition: '商品売買を「仕入（費用）」「売上（収益）」「繰越商品（資産）」の3つの勘定に分けて記録する方法です。日商簿記3級ではこの方法を使います。',
    category: 'shouhin',
  },
  {
    term: '諸掛り',
    definition: '商品の仕入や販売にかかる付随費用（運賃・保険料など）のことです。仕入諸掛りは原則として仕入原価に含めます。',
    category: 'shouhin',
  },
  {
    term: '仕入諸掛り',
    definition: '商品を仕入れる際に発生した引取運賃などの費用です。仕入勘定に加算して処理します。',
    category: 'shouhin',
  },
  {
    term: '買掛金',
    definition: '商品を仕入れたときの「あとで払う約束」を表す負債のことです。ツケで仕入れた金額がここに入ります。',
    category: 'shouhin',
  },
  {
    term: '売掛金',
    definition: '商品を売ったときの「あとでもらえる権利」を表す資産のことです。ツケで売った金額がここに入ります。',
    category: 'shouhin',
  },
  {
    term: '当座借越',
    definition: '当座預金の残高を超えて小切手を振り出した場合に、不足額を銀行が立て替えてくれる仕組みです。負債として「当座借越」勘定で処理します。',
    category: 'genkin',
  },
  {
    term: '受取手形',
    definition: '商品代金などの代わりに受け取った約束手形のことです。後日決済される債権なので資産として扱います。',
    category: 'other',
  },
  {
    term: '電子記録債権',
    definition: '電子記録機関に登録することで発生する金銭債権のことです。手形に代わる決済手段として使われます。',
    category: 'other',
  },
  {
    term: '振出',
    definition: '小切手や手形を発行して相手に渡すことを「振り出す」と言います。振り出した側はあとで支払う義務が発生します。',
    category: 'other',
  },
  {
    term: '貸倒引当金',
    definition: '将来の貸倒れに備えてあらかじめ見積もり計上しておく評価勘定です。売掛金や受取手形の控除項目として表示します。',
    category: 'kessan',
  },
  {
    term: '差額補充法',
    definition: '貸倒引当金を設定する方法のひとつで、必要な引当金額と現在の残高との差額だけを繰り入れる方式です。',
    category: 'kessan',
  },
  {
    term: '経過勘定',
    definition: '前払・前受・未払・未収のように、決算時に費用・収益を当期に対応させるために使う勘定の総称です。',
    category: 'kessan',
  },
  {
    term: '見越し',
    definition: '経過勘定の処理のうち、すでに発生しているのにまだ支払い／受け取りをしていない費用・収益を当期に計上することです。未払利息や未収利息などが該当します。',
    category: 'kessan',
  },
  {
    term: '決算整理',
    definition: '会計期間の最終日に行う、帳簿を正しい姿に整える一連の仕訳のことです。減価償却、貸倒引当金の設定、経過勘定の計上などが含まれます。',
    category: 'kessan',
  },
  {
    term: '法人税等',
    definition: '法人税、住民税および事業税をまとめた呼び方です。決算で確定した税額を「法人税、住民税及び事業税」勘定に計上します。',
    category: 'kessan',
  },
  {
    term: '仮払消費税',
    definition: '商品の仕入時などに支払った消費税額を一時的に記録する資産勘定です。決算で仮受消費税と相殺します。',
    category: 'kessan',
  },
  {
    term: '仮受消費税',
    definition: '商品の販売時などに受け取った消費税額を一時的に記録する負債勘定です。決算で仮払消費税と相殺します。',
    category: 'kessan',
  },
  {
    term: '減価償却',
    definition: '建物や備品などの固定資産の取得原価を、使用期間にわたって費用配分する手続きです。3級では原則として定額法を使います。',
    category: 'kotei',
  },
  {
    term: '間接法',
    definition: '減価償却で、固定資産そのものを直接減らさず「減価償却累計額」という評価勘定で控除する記帳方法です。3級ではこの方法を使います。',
    category: 'kotei',
  },
]

export function findTerm(term: string): GlossaryEntry | undefined {
  return GLOSSARY.find((entry) => entry.term === term)
}

import type { Account } from '../types'

export const ACCOUNTS: Account[] = [
  // 資産
  { id: 'cash',                name: '現金',              category: 'asset' },
  { id: 'checking',            name: '当座預金',          category: 'asset' },
  { id: 'savings',             name: '普通預金',          category: 'asset' },
  { id: 'petty_cash',          name: '小口現金',          category: 'asset' },
  { id: 'notes_receivable',    name: '受取手形',          category: 'asset' },
  { id: 'accounts_receivable', name: '売掛金',            category: 'asset' },
  { id: 'credit_receivable',   name: 'クレジット売掛金',  category: 'asset' },
  { id: 'electronic_receivable', name: '電子記録債権',    category: 'asset' },
  { id: 'merchandise',         name: '繰越商品',          category: 'asset' },
  { id: 'gift_voucher',        name: '受取商品券',        category: 'asset' },
  { id: 'advance_payment',     name: '立替金',            category: 'asset' },
  { id: 'temp_payment',        name: '仮払金',            category: 'asset' },
  { id: 'temp_corp_tax',       name: '仮払法人税等',      category: 'asset' },
  { id: 'temp_sales_tax',      name: '仮払消費税',        category: 'asset' },
  { id: 'prepaid_insurance',   name: '前払保険料',        category: 'asset' },
  { id: 'prepaid_rent',        name: '前払地代',          category: 'asset' },
  { id: 'accrued_interest_recv', name: '未収利息',        category: 'asset' },
  { id: 'other_receivable',    name: '未収入金',          category: 'asset' },
  { id: 'building',            name: '建物',              category: 'asset' },
  { id: 'equipment',           name: '備品',              category: 'asset' },
  { id: 'vehicle',             name: '車両運搬具',        category: 'asset' },
  { id: 'land',                name: '土地',              category: 'asset' },

  // 負債
  { id: 'notes_payable',       name: '支払手形',          category: 'liability' },
  { id: 'accounts_payable',    name: '買掛金',            category: 'liability' },
  { id: 'electronic_payable',  name: '電子記録債務',      category: 'liability' },
  { id: 'overdraft',           name: '当座借越',          category: 'liability' },
  { id: 'other_payable',       name: '未払金',            category: 'liability' },
  { id: 'accrued_salary',      name: '未払給料',          category: 'liability' },
  { id: 'accrued_interest_pay', name: '未払利息',         category: 'liability' },
  { id: 'accrued_sales_tax',   name: '未払消費税',        category: 'liability' },
  { id: 'accrued_corp_tax',    name: '未払法人税等',      category: 'liability' },
  { id: 'unpaid_dividend',     name: '未払配当金',        category: 'liability' },
  { id: 'received_rent',       name: '前受家賃',          category: 'liability' },
  { id: 'received_land_rent',  name: '前受地代',          category: 'liability' },
  { id: 'income_tax_withhold', name: '所得税預り金',      category: 'liability' },
  { id: 'social_ins_withhold', name: '社会保険料預り金',  category: 'liability' },
  { id: 'temp_received_tax',   name: '仮受消費税',        category: 'liability' },
  { id: 'temp_received',       name: '仮受金',            category: 'liability' },
  { id: 'allowance_doubtful',  name: '貸倒引当金',        category: 'asset', isContra: true },
  { id: 'accumulated_dep',     name: '減価償却累計額',    category: 'asset', isContra: true },

  // 純資産
  { id: 'capital',             name: '資本金',            category: 'equity' },
  { id: 'legal_reserve',       name: '利益準備金',        category: 'equity' },
  { id: 'retained_earnings',   name: '繰越利益剰余金',    category: 'equity' },

  // 収益
  { id: 'sales',               name: '売上',              category: 'revenue' },
  { id: 'interest_income',     name: '受取利息',          category: 'revenue' },
  { id: 'rent_income',         name: '受取地代',          category: 'revenue' },
  { id: 'house_rent_income',   name: '受取家賃',          category: 'revenue' },
  { id: 'fixed_asset_gain',    name: '固定資産売却益',    category: 'revenue' },
  { id: 'misc_income',         name: '雑益',              category: 'revenue' },

  // 費用
  { id: 'purchase',            name: '仕入',              category: 'expense' },
  { id: 'salary',              name: '給料',              category: 'expense' },
  { id: 'legal_welfare',       name: '法定福利費',        category: 'expense' },
  { id: 'depreciation',        name: '減価償却費',        category: 'expense' },
  { id: 'doubtful_provision',  name: '貸倒引当金繰入',    category: 'expense' },
  { id: 'doubtful_loss',       name: '貸倒損失',          category: 'expense' },
  { id: 'commission_fee',      name: '支払手数料',        category: 'expense' },
  { id: 'insurance_fee',       name: '保険料',            category: 'expense' },
  { id: 'supplies_fee',        name: '消耗品費',          category: 'expense' },
  { id: 'travel_fee',          name: '旅費交通費',        category: 'expense' },
  { id: 'comm_fee',            name: '通信費',            category: 'expense' },
  { id: 'utility_fee',         name: '水道光熱費',        category: 'expense' },
  { id: 'corp_tax_expense',    name: '法人税、住民税及び事業税', category: 'expense' },
  { id: 'misc_loss',           name: '雑損',              category: 'expense' },
  { id: 'fixed_asset_loss',    name: '固定資産売却損',    category: 'expense' },
]

export const ACCOUNTS_BY_CATEGORY = {
  asset:     ACCOUNTS.filter((a) => a.category === 'asset'),
  liability: ACCOUNTS.filter((a) => a.category === 'liability'),
  equity:    ACCOUNTS.filter((a) => a.category === 'equity'),
  revenue:   ACCOUNTS.filter((a) => a.category === 'revenue'),
  expense:   ACCOUNTS.filter((a) => a.category === 'expense'),
}

export function findAccount(id: string): Account | undefined {
  return ACCOUNTS.find((a) => a.id === id)
}

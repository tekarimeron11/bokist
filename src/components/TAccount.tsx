import { findAccount } from '../data/accounts'
import { formatYen } from '../lib/format'

type Entry = {
  accountId: string
  amount: number
}

type Props = {
  debit: Entry[]
  credit: Entry[]
}

const INK = '#2a1f2a'
const PAPER = 'rgba(255,255,255,0)'
const SAGE_SOFT = '#dfead0'
const BLUSH_SOFT = '#ffd2c8'

const ROW_HEIGHT = 32
const HEADER_HEIGHT = 48
const PADDING_X = 16
const PADDING_Y = 16
const COLUMN_WIDTH = 200
const VIEW_WIDTH = COLUMN_WIDTH * 2 + PADDING_X * 2

export function TAccount({ debit, credit }: Props) {
  const rowCount = Math.max(debit.length, credit.length, 1)
  const bodyHeight = rowCount * ROW_HEIGHT + 12
  const totalHeight = HEADER_HEIGHT + bodyHeight + PADDING_Y * 2

  const centerX = VIEW_WIDTH / 2
  const headerY = PADDING_Y + 20
  const topLineY = PADDING_Y + HEADER_HEIGHT
  const bottomLineY = topLineY + bodyHeight

  const debitColX = PADDING_X + COLUMN_WIDTH / 2
  const creditColX = PADDING_X + COLUMN_WIDTH + COLUMN_WIDTH / 2

  return (
    <svg
      role="img"
      aria-label="T字勘定図表"
      viewBox={`0 0 ${VIEW_WIDTH} ${totalHeight}`}
      preserveAspectRatio="xMidYMid meet"
      className="w-full max-w-full h-auto"
      style={{ fontFamily: '"Outfit", "Noto Sans JP", sans-serif' }}
    >
      <rect x={0} y={0} width={VIEW_WIDTH} height={totalHeight} fill={PAPER} />

      <rect
        x={PADDING_X}
        y={topLineY}
        width={COLUMN_WIDTH}
        height={bodyHeight}
        fill={SAGE_SOFT}
        opacity={0.4}
      />
      <rect
        x={PADDING_X + COLUMN_WIDTH}
        y={topLineY}
        width={COLUMN_WIDTH}
        height={bodyHeight}
        fill={BLUSH_SOFT}
        opacity={0.4}
      />

      <text
        x={debitColX}
        y={headerY}
        textAnchor="middle"
        fontSize={14}
        fontWeight={600}
        fill={INK}
      >
        借方
      </text>
      <text
        x={creditColX}
        y={headerY}
        textAnchor="middle"
        fontSize={14}
        fontWeight={600}
        fill={INK}
      >
        貸方
      </text>

      <line
        x1={PADDING_X}
        y1={topLineY}
        x2={VIEW_WIDTH - PADDING_X}
        y2={topLineY}
        stroke={INK}
        strokeWidth={1.5}
      />
      <line
        x1={centerX}
        y1={topLineY}
        x2={centerX}
        y2={bottomLineY}
        stroke={INK}
        strokeWidth={1.5}
      />

      {Array.from({ length: rowCount }).map((_, idx) => {
        const rowY = topLineY + 6 + (idx + 1) * ROW_HEIGHT - ROW_HEIGHT / 2 + 4
        const d = debit[idx]
        const c = credit[idx]
        return (
          <g key={idx}>
            {d ? (
              <>
                <text
                  x={PADDING_X + 12}
                  y={rowY}
                  textAnchor="start"
                  fontSize={13}
                  fill={INK}
                >
                  {accountName(d.accountId)}
                </text>
                <text
                  x={centerX - 12}
                  y={rowY}
                  textAnchor="end"
                  fontSize={13}
                  fill={INK}
                >
                  {formatYen(d.amount)}
                </text>
              </>
            ) : null}
            {c ? (
              <>
                <text
                  x={centerX + 12}
                  y={rowY}
                  textAnchor="start"
                  fontSize={13}
                  fill={INK}
                >
                  {accountName(c.accountId)}
                </text>
                <text
                  x={VIEW_WIDTH - PADDING_X - 12}
                  y={rowY}
                  textAnchor="end"
                  fontSize={13}
                  fill={INK}
                >
                  {formatYen(c.amount)}
                </text>
              </>
            ) : null}
          </g>
        )
      })}
    </svg>
  )
}

function accountName(accountId: string): string {
  return findAccount(accountId)?.name ?? accountId
}

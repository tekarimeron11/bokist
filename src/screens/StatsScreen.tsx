import { progressStore } from '../storage/progressStore'

function summary() {
  const attempts = progressStore.getAll()
  const total = attempts.length
  const correct = attempts.filter((a) => a.correct).length
  const rate = total === 0 ? null : Math.round((correct / total) * 100)
  const today = new Date().toISOString().slice(0, 10)
  const todayCount = attempts.filter((a) => a.answeredAt.slice(0, 10) === today).length
  return { total, correct, rate, todayCount }
}

export function StatsScreen() {
  const s = summary()

  return (
    <div className="px-6 pt-6 pb-32">
      <div className="flex justify-between items-baseline pt-1.5">
        <span className="eyebrow">Progress</span>
        <span className="eyebrow-soft">your journey</span>
      </div>
      <h1 className="font-serif font-normal text-[32px] mt-2 leading-[1.1] tracking-[-0.015em]">
        あなたの<i className="italic font-light text-coral">歩み</i>
      </h1>
      <p className="text-[13.5px] font-serif italic text-ink-soft mt-2.5 leading-[1.6]">
        “小さな一問が、いつかの自信になる。”
      </p>

      {s.total === 0 ? (
        <div className="glass-card rounded-[22px] p-6 mt-6">
          <p className="text-[13.5px] text-ink-soft leading-[1.75] font-serif">
            学習データを蓄積すると、ここに表示されます。
            <br />
            まずはドリルから始めてみましょう。
          </p>
        </div>
      ) : (
        <>
          <section className="glass rounded-[28px] px-6 pt-7 pb-6 mt-6 relative overflow-hidden">
            <div
              aria-hidden
              className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(255,180,160,0.5), transparent 70%)' }}
            />
            <div className="relative">
              <span className="eyebrow">Accuracy</span>
              <div className="font-serif font-medium text-[48px] mt-2 leading-none tabular">
                {s.rate}
                <small className="text-[16px] text-ink-faint font-light ml-1">%</small>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-5">
                <div className="glass-pill rounded-2xl px-3.5 py-3">
                  <div className="font-serif font-medium text-[22px] leading-none tabular">
                    {s.total}
                    <small className="text-[11px] text-ink-faint font-light ml-1">回</small>
                  </div>
                  <div className="text-[10px] text-ink-faint tracking-[0.18em] uppercase mt-1">
                    total
                  </div>
                </div>
                <div className="glass-pill rounded-2xl px-3.5 py-3">
                  <div className="font-serif font-medium text-[22px] leading-none tabular">
                    {s.todayCount}
                    <small className="text-[11px] text-ink-faint font-light ml-1">回</small>
                  </div>
                  <div className="text-[10px] text-ink-faint tracking-[0.18em] uppercase mt-1">
                    today
                  </div>
                </div>
              </div>
            </div>
          </section>
          <p className="text-[11.5px] text-ink-faint mt-3 px-1 font-serif italic">
            ※ 詳細な分析・グラフは順次追加予定
          </p>
        </>
      )}
    </div>
  )
}

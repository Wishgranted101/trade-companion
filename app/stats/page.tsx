'use client'
import { useEffect, useState } from 'react'
import { fetchTradeStats } from '@/lib/supabase/queries'
import { fetchTrades } from '@/lib/supabase/queries'
import { Trade } from '@/types/trade'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'

export default function StatsPage() {
  const [stats, setStats] = useState<any>(null)
  const [trades, setTrades] = useState<Trade[]>([])
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    fetchTradeStats().then(setStats).catch(console.error)
    fetchTrades().then(setTrades).catch(console.error)
  }, [])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // Group trades by day
  const tradesByDay: Record<string, Trade[]> = {}
  trades.forEach(trade => {
    const date = new Date(trade.created_at)
    if (date.getFullYear() === year && date.getMonth() === month) {
      const key = date.getDate().toString()
      if (!tradesByDay[key]) tradesByDay[key] = []
      tradesByDay[key].push(trade)
    }
  })

  const selectedTrades = selectedDay ? (tradesByDay[selectedDay] || []) : []

  const getDayColor = (dayTrades: Trade[]) => {
    if (!dayTrades.length) return 'var(--surface)'
    const wins = dayTrades.filter(t => t.outcome === 'win').length
    const losses = dayTrades.filter(t => t.outcome === 'loss').length
    const open = dayTrades.filter(t => t.status === 'open').length
    if (open > 0 && wins === 0 && losses === 0) return 'var(--accent-be)15'
    if (wins > losses) return 'var(--accent)20'
    if (losses > wins) return 'var(--accent-loss)20'
    return 'var(--accent-be)20'
  }

  const getDayBorder = (dayTrades: Trade[]) => {
    if (!dayTrades.length) return 'var(--border)'
    const wins = dayTrades.filter(t => t.outcome === 'win').length
    const losses = dayTrades.filter(t => t.outcome === 'loss').length
    if (wins > losses) return 'var(--accent)'
    if (losses > wins) return 'var(--accent-loss)'
    return 'var(--accent-be)'
  }

  const getDayRR = (dayTrades: Trade[]) => {
    const closed = dayTrades.filter(t => t.rr_result !== null)
    if (!closed.length) return null
    const total = closed.reduce((sum, t) => sum + (t.rr_result || 0), 0)
    return Math.round(total * 10) / 10
  }

  const getDayPnL = (dayTrades: Trade[]) => {
    const closed = dayTrades.filter(t => t.dollar_pnl !== null && t.dollar_pnl !== undefined)
    if (!closed.length) return null
    const total = closed.reduce((sum, t) => sum + (t.dollar_pnl || 0), 0)
    return Math.round(total * 100) / 100
  }

  const monthlyRR = getDayRR(trades.filter(t => {
    const d = new Date(t.created_at)
    return d.getFullYear() === year && d.getMonth() === month
  }))

  return (
    <div className="pb-24" style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
      <Header title="Stats" />
      <div className="px-5 pt-5 flex flex-col gap-4">

        {/* Stat Cards */}
        <div className="grid grid-cols-2 gap-3">
          {stats ? (
            <>
              <StatCard label="Total Trades" value={stats.total} />
              <StatCard label="Win Rate" value={`${stats.winRate}%`} accent />
              <StatCard label="Wins" value={stats.wins} accent />
              <StatCard label="Losses" value={stats.losses} loss />
              <StatCard label="Avg RR" value={stats.avgRR} accent />
              <StatCard label="Followed Plan" value={`${stats.followedPlanRate}%`} accent />
            </>
          ) : (
            <div className="col-span-2 flex items-center justify-center py-10">
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading stats...</div>
            </div>
          )}
        </div>

        {/* Calendar */}
        <div className="rounded-2xl p-4"
          style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>

          {/* Month header */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
              className="w-8 h-8 rounded-xl flex items-center justify-center font-bold"
              style={{ backgroundColor: 'var(--surface-2)', color: 'var(--text-primary)' }}>
              ‹
            </button>
            <div className="text-center">
            <div className="text-base font-bold uppercase tracking-wide" style={{ color: 'var(--text-primary)' }}>{monthName}</div>
              {monthlyRR !== null && (
                <div className="text-xs font-mono mt-0.5"
                  style={{ color: monthlyRR >= 0 ? 'var(--accent)' : 'var(--accent-loss)' }}>
                  {monthlyRR >= 0 ? '+' : ''}{monthlyRR}R this month
                </div>
              )}
            </div>
            <button
              onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
              className="w-8 h-8 rounded-xl flex items-center justify-center font-bold"
              style={{ backgroundColor: 'var(--surface-2)', color: 'var(--text-primary)' }}>
              ›
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-8 mb-1">
            {['S','M','T','W','T','F','S','WK'].map((d, i) => (
              <div key={i} className="text-center text-xs font-bold py-1"
                style={{ color: i === 7 ? 'var(--accent)' : 'var(--text-secondary)' }}>{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          {(() => {
            const totalCells = firstDay + daysInMonth
            const totalWeeks = Math.ceil(totalCells / 7)
            const rows = []

            for (let week = 0; week < totalWeeks; week++) {
              const cells = []
              const weekTrades: Trade[] = []

              for (let col = 0; col < 7; col++) {
                const cellIndex = week * 7 + col
                const dayNum = cellIndex - firstDay + 1

                if (dayNum < 1 || dayNum > daysInMonth) {
                  cells.push(<div key={`empty-${cellIndex}`} />)
                } else {
                  const day = dayNum.toString()
                  const dayTrades = tradesByDay[day] || []
                  weekTrades.push(...dayTrades)
                  const rr = getDayRR(dayTrades)
                  const isSelected = selectedDay === day
                  const wins = dayTrades.filter(t => t.outcome === 'win').length
                  const losses = dayTrades.filter(t => t.outcome === 'loss').length

                  cells.push(
                    <button
                      key={day}
                      onClick={() => setSelectedDay(isSelected ? null : day)}
                      className="rounded-xl p-1 flex flex-col items-center transition-all"
                      style={{
                        backgroundColor: isSelected ? 'var(--accent)' : getDayColor(dayTrades),
                        border: `1px solid ${isSelected ? 'var(--accent)' : getDayBorder(dayTrades)}`,
                        minHeight: '52px'
                      }}>
                      <span className="text-xs font-bold"
                        style={{ color: isSelected ? '#fff' : 'var(--text-primary)' }}>
                        {dayNum}
                      </span>
                      {dayTrades.length > 0 && (
                        <>
                          <span style={{ color: isSelected ? '#fff' : 'var(--text-secondary)', fontSize: '9px' }}>
                            {wins}W {losses}L
                          </span>
                          {rr !== null && (
                            <span className="font-mono font-bold" style={{
                              fontSize: '9px',
                              color: isSelected ? '#fff' : rr >= 0 ? 'var(--accent)' : 'var(--accent-loss)'
                            }}>
                              {rr >= 0 ? '+' : ''}{rr}R
                            </span>
                          )}
                          {(() => {
                            const pnl = getDayPnL(dayTrades)
                            return pnl !== null ? (
                              <span className="font-mono font-bold" style={{
                                fontSize: '9px',
                                color: isSelected ? '#fff' : pnl >= 0 ? 'var(--accent)' : 'var(--accent-loss)'
                              }}>
                                {pnl >= 0 ? '+$' : '-$'}{Math.abs(pnl)}
                              </span>
                            ) : null
                          })()}
                        </>
                      )}
                    </button>
                  )
                }
              }

              // Weekly total column
              const weekRR = getDayRR(weekTrades)
              const weekPnL = getDayPnL(weekTrades)
              cells.push(
                <div key={`week-${week}`}
                  className="rounded-xl p-1 flex flex-col items-center justify-center"
                  style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', minHeight: '52px' }}>
                  {weekRR !== null ? (
                    <>
                      <span className="font-mono font-bold" style={{
                        fontSize: '9px',
                        color: weekRR >= 0 ? 'var(--accent)' : 'var(--accent-loss)'
                      }}>
                        {weekRR >= 0 ? '+' : ''}{weekRR}R
                      </span>
                      {weekPnL !== null && (
                        <span className="font-mono font-bold" style={{
                          fontSize: '9px',
                          color: weekPnL >= 0 ? 'var(--accent)' : 'var(--accent-loss)'
                        }}>
                          {weekPnL >= 0 ? '+$' : '-$'}{Math.abs(weekPnL)}
                        </span>
                      )}
                    </>
                  ) : (
                    <span style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>—</span>
                  )}
                </div>
              )

              rows.push(
                <div key={`row-${week}`} className="grid grid-cols-8 gap-1 mb-1">
                  {cells}
                </div>
              )
            }

            return <div>{rows}</div>
          })()}
        </div>

        {/* Monthly Summary Bar */}
        {(() => {
          const monthTrades = trades.filter(t => {
            const d = new Date(t.created_at)
            return d.getFullYear() === year && d.getMonth() === month && t.status === 'closed'
          })
          if (!monthTrades.length) return null

          const tradingDays = Object.keys(tradesByDay)
          const losingDays = tradingDays.filter(day => {
            const dayTrades = tradesByDay[day]
            const losses = dayTrades.filter(t => t.outcome === 'loss').length
            const wins = dayTrades.filter(t => t.outcome === 'win').length
            return losses > wins
          }).length

          const bestDay = tradingDays.reduce((best, day) => {
            const rr = getDayRR(tradesByDay[day]) || 0
            return rr > (getDayRR(tradesByDay[best]) || 0) ? day : best
          }, tradingDays[0])

          const worstDay = tradingDays.reduce((worst, day) => {
            const rr = getDayRR(tradesByDay[day]) || 0
            return rr < (getDayRR(tradesByDay[worst]) || 0) ? day : worst
          }, tradingDays[0])

          const bestRR = getDayRR(tradesByDay[bestDay])
          const worstRR = getDayRR(tradesByDay[worstDay])

          return (
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-2xl p-3"
                style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div className="text-xs font-bold tracking-widest uppercase mb-1"
                  style={{ color: 'var(--text-secondary)' }}>Best Day</div>
                <div className="text-sm font-bold font-mono"
                  style={{ color: 'var(--accent)' }}>
                  {bestRR !== null ? `+${bestRR}R` : '—'}
                </div>
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {monthName.split(' ')[0]} {bestDay}
                </div>
              </div>
              <div className="rounded-2xl p-3"
                style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div className="text-xs font-bold tracking-widest uppercase mb-1"
                  style={{ color: 'var(--text-secondary)' }}>Worst Day</div>
                <div className="text-sm font-bold font-mono"
                  style={{ color: 'var(--accent-loss)' }}>
                  {worstRR !== null ? `${worstRR}R` : '—'}
                </div>
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {monthName.split(' ')[0]} {worstDay}
                </div>
              </div>
              <div className="rounded-2xl p-3"
                style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div className="text-xs font-bold tracking-widest uppercase mb-1"
                  style={{ color: 'var(--text-secondary)' }}>Trading Days</div>
                <div className="text-sm font-bold"
                  style={{ color: 'var(--text-primary)' }}>{tradingDays.length}</div>
              </div>
              <div className="rounded-2xl p-3"
                style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div className="text-xs font-bold tracking-widest uppercase mb-1"
                  style={{ color: 'var(--text-secondary)' }}>Losing Days</div>
                <div className="text-sm font-bold"
                  style={{ color: losingDays > 0 ? 'var(--accent-loss)' : 'var(--accent)' }}>{losingDays}</div>
              </div>
            </div>
          )
        })()}


        {/* Selected day trades */}
        {selectedDay && (
          <div className="rounded-2xl p-4 flex flex-col gap-3"
            style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
              {monthName.split(' ')[0]} {selectedDay} — {selectedTrades.length} trade{selectedTrades.length !== 1 ? 's' : ''}
            </div>
            {selectedTrades.length === 0 ? (
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>No trades this day</div>
            ) : (
              selectedTrades.map(trade => {
                const isOpen = trade.status === 'open'
                const outcomeColor = trade.outcome === 'win' ? 'var(--accent)' : trade.outcome === 'loss' ? 'var(--accent-loss)' : 'var(--accent-be)'
                return (
                  <div key={trade.id} className="rounded-xl p-3 flex items-center justify-between"
                    style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                    <div>
                      <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{trade.pair}</div>
                      <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{trade.setup_type}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold"
                        style={{ color: isOpen ? 'var(--accent-be)' : outcomeColor }}>
                        {isOpen ? 'OPEN' : trade.outcome?.toUpperCase()}
                      </div>
                      {trade.rr_result !== null && (
                        <div className="text-xs font-mono font-bold"
                          style={{ color: trade.rr_result >= 0 ? 'var(--accent)' : 'var(--accent-loss)' }}>
                          {trade.rr_result >= 0 ? '+' : ''}{trade.rr_result}R
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

      </div>
      <BottomNav />
    </div>
  )
}

function StatCard({ label, value, accent, loss }: {
  label: string; value: any; accent?: boolean; loss?: boolean
}) {
  return (
    <div className="rounded-2xl p-4"
      style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div className="text-2xl font-bold mb-1"
        style={{ color: loss ? 'var(--accent-loss)' : accent ? 'var(--accent)' : 'var(--text-primary)' }}>
        {value}
      </div>
      <div className="text-xs font-semibold tracking-wide uppercase"
        style={{ color: 'var(--text-secondary)' }}>
        {label}
      </div>
    </div>
  )
}
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
          <div className="grid grid-cols-7 mb-1">
            {['S','M','T','W','T','F','S'].map((d, i) => (
              <div key={i} className="text-center text-xs font-bold py-1"
                style={{ color: 'var(--text-secondary)' }}>{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = (i + 1).toString()
              const dayTrades = tradesByDay[day] || []
              const rr = getDayRR(dayTrades)
              const isSelected = selectedDay === day
              const wins = dayTrades.filter(t => t.outcome === 'win').length
              const losses = dayTrades.filter(t => t.outcome === 'loss').length

              return (
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
                    {i + 1}
                  </span>
                  {dayTrades.length > 0 && (
                    <>
                      <span className="text-xs" style={{ color: isSelected ? '#fff' : 'var(--text-secondary)', fontSize: '9px' }}>
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
                    </>
                  )}
                </button>
              )
            })}
          </div>
        </div>

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
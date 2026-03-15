'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { fetchTrades } from '@/lib/supabase/queries'
import { Trade } from '@/types/trade'
import TradeCard from '@/components/trades/TradeCard'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'

export default function HomePage() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTrades()
      .then(setTrades)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const wins = trades.filter(t => t.outcome === 'win').length
  const total = trades.length
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0

  return (
    <div className="pb-24" style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
      <Header title="Trade Companion" />

      <div className="px-5 pt-5">
        {/* Summary bar */}
        {total > 0 && (
          <div className="rounded-2xl p-4 mb-5 flex items-center justify-between"
            style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="text-center">
              <div className="text-2xl font-bold">{total}</div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Trades</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>{winRate}%</div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Win Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>{wins}</div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Wins</div>
            </div>
          </div>
        )}

        {/* Trade list */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading trades...</div>
          </div>
        ) : trades.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="text-4xl">📒</div>
            <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>No trades yet</div>
            <div className="text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
              Tap the button below to log your first trade
            </div>
          </div>
        ) : (
          trades.map(trade => <TradeCard key={trade.id} trade={trade} />)
        )}
      </div>

      {/* Floating Add button */}
      <Link href="/add">
        <button className="fixed bottom-24 right-5 w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg transition-all active:scale-95 z-20"
          style={{ backgroundColor: 'var(--accent)', color: '#fff' }}>
          +
        </button>
      </Link>

      <BottomNav />
    </div>
  )
}
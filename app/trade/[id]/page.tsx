'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { fetchTradeById, deleteTrade } from '@/lib/supabase/queries'
import { Trade } from '@/types/trade'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'

export default function TradeDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [trade, setTrade] = useState<Trade | null>(null)

  useEffect(() => {
    if (id) fetchTradeById(id as string).then(setTrade).catch(console.error)
  }, [id])

  const handleDelete = async () => {
    if (!trade) return
    await deleteTrade(trade.id)
    router.push('/')
  }

  if (!trade) return (
    <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      <span style={{ color: 'var(--text-secondary)' }}>Loading...</span>
    </div>
  )

  const outcomeColor = trade.outcome === 'win' ? 'var(--accent)' : trade.outcome === 'loss' ? 'var(--accent-loss)' : 'var(--accent-be)'

  return (
    <div className="pb-24" style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
      <Header title={trade.pair} />
      <div className="px-5 pt-5 flex flex-col gap-4">

        {/* Outcome banner */}
        <div className="rounded-2xl p-4 flex items-center justify-between"
          style={{ backgroundColor: 'var(--surface)', border: `1px solid ${outcomeColor}` }}>
          <span className="text-2xl font-bold" style={{ color: outcomeColor }}>
            {trade.outcome.toUpperCase()}
          </span>
          {trade.rr_result !== null && (
            <span className="text-xl font-bold font-mono" style={{ color: outcomeColor }}>
              {trade.rr_result > 0 ? '+' : ''}{trade.rr_result}R
            </span>
          )}
        </div>

        {/* Details grid */}
        <div className="rounded-2xl p-4 grid grid-cols-2 gap-4"
          style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
          <Detail label="Setup" value={trade.setup_type} />
          <Detail label="Session" value={trade.session.replace('_', ' ')} />
          <Detail label="Entry" value={trade.entry_price} mono />
          <Detail label="Stop" value={trade.stop_price} mono />
          <Detail label="Target" value={trade.target_price} mono />
          <Detail label="RR Planned" value={`${trade.rr_planned}R`} mono />
          <Detail label="Followed Plan" value={trade.followed_plan ? 'Yes ✓' : 'No ✗'} />
          <Detail label="Emotion" value={trade.emotion} />
        </div>

        {trade.screenshot_url && (
          <a href={trade.screenshot_url} target="_blank" rel="noopener noreferrer"
            className="w-full py-3 rounded-2xl text-sm font-bold text-center transition-all active:scale-95"
            style={{ backgroundColor: 'var(--surface-2)', color: 'var(--accent)', border: '1px solid var(--border)' }}>
            View Screenshot ↗
          </a>
        )}

        <button onClick={handleDelete}
          className="w-full py-4 rounded-2xl text-sm font-bold transition-all active:scale-95 mt-2"
          style={{ backgroundColor: '#ff4d4d15', color: 'var(--accent-loss)', border: '1px solid var(--accent-loss)' }}>
          Delete Trade
        </button>

      </div>
      <BottomNav />
    </div>
  )
}

function Detail({ label, value, mono }: { label: string; value: any; mono?: boolean }) {
  return (
    <div>
      <div className="text-xs font-bold tracking-widest uppercase mb-1"
        style={{ color: 'var(--text-secondary)' }}>{label}</div>
      <div className={`text-sm font-semibold ${mono ? 'font-mono' : ''}`}
        style={{ color: 'var(--text-primary)' }}>{value}</div>
    </div>
  )
}
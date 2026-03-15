import Link from 'next/link'
import { Trade } from '@/types/trade'

const outcomeStyles = {
  win: { color: 'var(--accent)', label: 'WIN' },
  loss: { color: 'var(--accent-loss)', label: 'LOSS' },
  breakeven: { color: 'var(--accent-be)', label: 'B/E' },
}

export default function TradeCard({ trade }: { trade: Trade }) {
  const outcome = outcomeStyles[trade.outcome]
  const date = new Date(trade.created_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric'
  })

  return (
    <Link href={`/trade/${trade.id}`}>
      <div className="rounded-2xl p-4 mb-3 transition-all active:scale-98"
        style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--card-shadow)'
        }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              {trade.pair}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: 'var(--surface-2)', color: 'var(--text-secondary)' }}>
              {trade.setup_type}
            </span>
          </div>
          <span className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
            {date}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-widest px-2 py-1 rounded-lg"
            style={{ color: outcome.color, backgroundColor: `${outcome.color}15` }}>
            {outcome.label}
          </span>
          {trade.rr_result !== null && (
            <div className="flex items-center gap-1">
              <span className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>RR</span>
              <span className="text-sm font-bold font-mono"
                style={{ color: trade.rr_result >= 0 ? 'var(--accent)' : 'var(--accent-loss)' }}>
                {trade.rr_result > 0 ? '+' : ''}{trade.rr_result}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
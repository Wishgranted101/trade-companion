'use client'
import { useEffect, useState } from 'react'
import { fetchTradeStats } from '@/lib/supabase/queries'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'

export default function StatsPage() {
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    fetchTradeStats().then(setStats).catch(console.error)
  }, [])

  return (
    <div className="pb-24" style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
      <Header title="Stats" />
      <div className="px-5 pt-5 grid grid-cols-2 gap-3">
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
          <div className="col-span-2 flex items-center justify-center py-20">
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading stats...</div>
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
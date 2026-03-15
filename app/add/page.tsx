'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { insertTrade } from '@/lib/supabase/queries'
import { NewTrade, Outcome, Session, Emotion } from '@/types/trade'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'

export default function AddTradePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const [form, setForm] = useState<NewTrade>({
    pair: '',
    setup_type: '',
    session: 'new_york',
    entry_price: 0,
    stop_price: 0,
    target_price: 0,
    rr_planned: 0,
    rr_result: null,
    outcome: 'win',
    followed_plan: true,
    emotion: 'calm',
    screenshot_url: null,
  })

  const set = (field: keyof NewTrade, value: any) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async () => {
    if (!form.pair || !form.setup_type) return
    setSaving(true)
    try {
      await insertTrade(form)
      router.push('/')
    } catch (e) {
      console.error(e)
      setSaving(false)
    }
  }

  return (
    <div className="pb-24" style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
      <Header title="Log Trade" />

      <div className="px-5 pt-5 flex flex-col gap-4">

        {/* Pair */}
        <Field label="Pair">
          <input
            className="w-full rounded-xl px-4 py-3 text-sm font-mono uppercase"
            style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            placeholder="e.g. EUR/USD"
            value={form.pair}
            onChange={e => set('pair', e.target.value.toUpperCase())}
          />
        </Field>

        {/* Setup Type */}
        <Field label="Setup Type">
          <input
            className="w-full rounded-xl px-4 py-3 text-sm"
            style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            placeholder="e.g. Break & Retest"
            value={form.setup_type}
            onChange={e => set('setup_type', e.target.value)}
          />
        </Field>

        {/* Session */}
        <Field label="Session">
          <div className="grid grid-cols-4 gap-2">
            {(['london','new_york','asian','overlap'] as Session[]).map(s => (
              <button key={s}
                onClick={() => set('session', s)}
                className="py-2 rounded-xl text-xs font-semibold capitalize transition-all active:scale-95"
                style={{
                  backgroundColor: form.session === s ? 'var(--accent)' : 'var(--surface)',
                  border: '1px solid var(--border)',
                  color: form.session === s ? '#fff' : 'var(--text-secondary)'
                }}>
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </Field>

        {/* Prices */}
        <Field label="Entry Price">
          <input type="number"
            className="w-full rounded-xl px-4 py-3 text-sm font-mono"
            style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            placeholder="0.00000"
            value={form.entry_price || ''}
            onChange={e => set('entry_price', parseFloat(e.target.value) || 0)}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Stop Price">
            <input type="number"
              className="w-full rounded-xl px-4 py-3 text-sm font-mono"
              style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              placeholder="0.00000"
              value={form.stop_price || ''}
              onChange={e => set('stop_price', parseFloat(e.target.value) || 0)}
            />
          </Field>
          <Field label="Target Price">
            <input type="number"
              className="w-full rounded-xl px-4 py-3 text-sm font-mono"
              style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              placeholder="0.00000"
              value={form.target_price || ''}
              onChange={e => set('target_price', parseFloat(e.target.value) || 0)}
            />
          </Field>
        </div>

        {/* RR */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="RR Planned">
            <input type="number"
              className="w-full rounded-xl px-4 py-3 text-sm font-mono"
              style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              placeholder="1:2"
              value={form.rr_planned || ''}
              onChange={e => set('rr_planned', parseFloat(e.target.value) || 0)}
            />
          </Field>
          <Field label="RR Result">
            <input type="number"
              className="w-full rounded-xl px-4 py-3 text-sm font-mono"
              style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              placeholder="actual"
              value={form.rr_result ?? ''}
              onChange={e => set('rr_result', parseFloat(e.target.value) || null)}
            />
          </Field>
        </div>

        {/* Outcome */}
        <Field label="Outcome">
          <div className="grid grid-cols-3 gap-2">
            {(['win','loss','breakeven'] as Outcome[]).map(o => (
              <button key={o}
                onClick={() => set('outcome', o)}
                className="py-3 rounded-xl text-sm font-bold capitalize transition-all active:scale-95"
                style={{
                  backgroundColor: form.outcome === o
                    ? o === 'win' ? 'var(--accent)' : o === 'loss' ? 'var(--accent-loss)' : 'var(--accent-be)'
                    : 'var(--surface)',
                  border: '1px solid var(--border)',
                  color: form.outcome === o ? '#fff' : 'var(--text-secondary)'
                }}>
                {o === 'breakeven' ? 'B/E' : o}
              </button>
            ))}
          </div>
        </Field>

        {/* Followed Plan */}
        <Field label="Followed Plan?">
          <div className="grid grid-cols-2 gap-2">
            {[true, false].map(v => (
              <button key={String(v)}
                onClick={() => set('followed_plan', v)}
                className="py-3 rounded-xl text-sm font-bold transition-all active:scale-95"
                style={{
                  backgroundColor: form.followed_plan === v ? 'var(--accent)' : 'var(--surface)',
                  border: '1px solid var(--border)',
                  color: form.followed_plan === v ? '#fff' : 'var(--text-secondary)'
                }}>
                {v ? 'Yes ✓' : 'No ✗'}
              </button>
            ))}
          </div>
        </Field>

        {/* Emotion */}
        <Field label="Emotion">
          <div className="grid grid-cols-3 gap-2">
            {([
              { v: 'calm', e: '😌' },
              { v: 'confident', e: '💪' },
              { v: 'anxious', e: '😰' },
              { v: 'frustrated', e: '😤' },
              { v: 'fomo', e: '🤑' },
              { v: 'revenge', e: '😡' },
            ] as { v: Emotion; e: string }[]).map(({ v, e }) => (
              <button key={v}
                onClick={() => set('emotion', v)}
                className="py-2 rounded-xl text-xs font-semibold capitalize transition-all active:scale-95"
                style={{
                  backgroundColor: form.emotion === v ? 'var(--accent)' : 'var(--surface)',
                  border: '1px solid var(--border)',
                  color: form.emotion === v ? '#fff' : 'var(--text-secondary)'
                }}>
                {e} {v}
              </button>
            ))}
          </div>
        </Field>

        {/* Advanced Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full py-3 rounded-xl text-sm font-semibold transition-all active:scale-95"
          style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
          {showAdvanced ? '▲ Hide Advanced Details' : '▼ Advanced Details (optional)'}
        </button>

        {showAdvanced && (
          <div className="flex flex-col gap-4">
            <Field label="Screenshot URL">
              <input
                className="w-full rounded-xl px-4 py-3 text-sm"
                style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                placeholder="https://..."
                value={form.screenshot_url ?? ''}
                onChange={e => set('screenshot_url', e.target.value || null)}
              />
            </Field>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={saving || !form.pair || !form.setup_type}
          className="w-full py-4 rounded-2xl text-base font-bold transition-all active:scale-95 mt-2"
          style={{
            backgroundColor: saving || !form.pair || !form.setup_type ? 'var(--surface-2)' : 'var(--accent)',
            color: saving || !form.pair || !form.setup_type ? 'var(--text-secondary)' : '#fff'
          }}>
          {saving ? 'Saving...' : 'Save Trade'}
        </button>

      </div>
      <BottomNav />
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-bold tracking-widest uppercase"
        style={{ color: 'var(--text-secondary)' }}>
        {label}
      </label>
      {children}
    </div>
  )
}
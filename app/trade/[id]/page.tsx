'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { fetchTradeById, deleteTrade, updateTrade } from '@/lib/supabase/queries'
import { Trade, Outcome, Emotion } from '@/types/trade'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'

export default function TradeDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [trade, setTrade] = useState<Trade | null>(null)
  const [closing, setClosing] = useState(false)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [lightbox, setLightbox] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [closeForm, setCloseForm] = useState({
    outcome: 'win' as Outcome,
    rr_result: '',
    emotion: 'calm' as Emotion,
    closing_note: '',
    dollar_pnl: '',
  })

  useEffect(() => {
    if (id) fetchTradeById(id as string).then(setTrade).catch(console.error)
  }, [id])

  const handleDelete = async () => {
    if (!trade) return
    await deleteTrade(trade.id)
    router.push('/')
  }

  const handleCloseTrade = async () => {
    if (!trade) return
    setSaving(true)
    try {
      const updated = await updateTrade(trade.id, {
        status: 'closed',
        outcome: closeForm.outcome,
        rr_result: parseFloat(closeForm.rr_result) || null,
        dollar_pnl: parseFloat(closeForm.dollar_pnl) || null,
        emotion: closeForm.emotion,
        closing_note: closeForm.closing_note || null,
      })
      setTrade(updated)
      setClosing(false)
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const handleEditSave = async () => {
    if (!trade) return
    setSaving(true)
    try {
      const updated = await updateTrade(trade.id, {
        outcome: trade.outcome,
        rr_result: trade.rr_result,
        emotion: trade.emotion,
        followed_plan: trade.followed_plan,
        status: trade.status,
        closing_note: trade.closing_note,
      })
      setTrade(updated)
      setEditing(false)
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  if (!trade) return (
    <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      <span style={{ color: 'var(--text-secondary)' }}>Loading...</span>
    </div>
  )

  const isOpen = trade.status === 'open'
  const outcomeColor = trade.outcome === 'win' ? 'var(--accent)' : trade.outcome === 'loss' ? 'var(--accent-loss)' : 'var(--accent-be)'

  return (
    <>
      <div className="pb-96" style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
        <Header title={trade.pair} />
        <div className="px-5 pt-5 flex flex-col gap-4">

          {/* Status banner */}
          <div className="rounded-2xl p-4 flex items-center justify-between"
            style={{
              backgroundColor: 'var(--surface)',
              border: `1px solid ${isOpen ? 'var(--accent-be)' : outcomeColor}`
            }}>
            <span className="text-2xl font-bold"
              style={{ color: isOpen ? 'var(--accent-be)' : outcomeColor }}>
              {isOpen ? 'OPEN' : trade.outcome?.toUpperCase()}
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
<Detail label="Emotion" value={trade.emotion ?? '—'} />
{trade.lot_size && <Detail label="Lot Size" value={trade.lot_size} mono />}
{trade.dollar_pnl !== null && trade.dollar_pnl !== undefined && <Detail label="Dollar P&L" value={`$${trade.dollar_pnl}`} mono />}
          </div>

          {/* Closing note */}
          {trade.closing_note && (
            <div className="rounded-2xl p-4"
              style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="text-xs font-bold tracking-widest uppercase mb-2"
                style={{ color: 'var(--text-secondary)' }}>Closing Note</div>
              <div className="text-sm" style={{ color: 'var(--text-primary)' }}>{trade.closing_note}</div>
            </div>
          )}

          {/* Screenshot */}
          {trade.screenshot_url && (
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold tracking-widest uppercase"
                style={{ color: 'var(--text-secondary)' }}>Chart Screenshot</label>
              <img
                src={trade.screenshot_url}
                alt="Trade chart"
                className="w-full rounded-xl cursor-pointer active:scale-95 transition-all"
                style={{ border: '1px solid var(--border)' }}
                onClick={() => setLightbox(true)}
              />
              <div className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
                Tap image to expand
              </div>
            </div>
          )}

          {/* Close Trade */}
          {isOpen && !closing && (
            <button onClick={() => setClosing(true)}
              className="w-full py-4 rounded-2xl text-sm font-bold transition-all active:scale-95"
              style={{ backgroundColor: 'var(--accent)', color: '#fff' }}>
              Close Trade
            </button>
          )}

          {isOpen && closing && (
            <div className="rounded-2xl p-4 flex flex-col gap-4"
            style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--accent)', paddingBottom: '80px' }}>
              <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Close Trade</div>

              <Field label="Outcome">
                <div className="grid grid-cols-3 gap-2">
                  {(['win', 'loss', 'breakeven'] as Outcome[]).map(o => (
                    <button key={o} onClick={() => setCloseForm(p => ({ ...p, outcome: o }))}
                      className="py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
                      style={{
                        backgroundColor: closeForm.outcome === o
                          ? o === 'win' ? 'var(--accent)' : o === 'loss' ? 'var(--accent-loss)' : 'var(--accent-be)'
                          : 'var(--surface-2)',
                        border: '1px solid var(--border)',
                        color: closeForm.outcome === o ? '#fff' : 'var(--text-secondary)'
                      }}>{o === 'breakeven' ? 'B/E' : o}</button>
                  ))}
                </div>
              </Field>

              <div className="grid grid-cols-2 gap-3">
  <Field label="RR Result">
    <input type="number"
      className="w-full rounded-xl px-3 py-3 text-sm font-mono"
      style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
      placeholder="e.g. 2.5"
      value={closeForm.rr_result}
      onChange={e => setCloseForm(p => ({ ...p, rr_result: e.target.value }))} />
  </Field>
  <Field label="Dollar P&L">
    <input type="number"
      className="w-full rounded-xl px-3 py-3 text-sm font-mono"
      style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
      placeholder="e.g. 12.50"
      value={closeForm.dollar_pnl}
      onChange={e => setCloseForm(p => ({ ...p, dollar_pnl: e.target.value }))} />
  </Field>
</div>

              <Field label="Emotion">
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { v: 'calm', e: '😌' }, { v: 'confident', e: '💪' },
                    { v: 'anxious', e: '😰' }, { v: 'frustrated', e: '😤' },
                    { v: 'fomo', e: '🤑' }, { v: 'revenge', e: '😡' },
                  ] as { v: Emotion; e: string }[]).map(({ v, e }) => (
                    <button key={v} onClick={() => setCloseForm(p => ({ ...p, emotion: v }))}
                      className="py-2 rounded-xl text-xs font-semibold capitalize transition-all active:scale-95"
                      style={{
                        backgroundColor: closeForm.emotion === v ? 'var(--accent)' : 'var(--surface-2)',
                        border: '1px solid var(--border)',
                        color: closeForm.emotion === v ? '#fff' : 'var(--text-secondary)'
                      }}>{e} {v}</button>
                  ))}
                </div>
              </Field>

              <Field label="Closing Note (optional)">
                <textarea
                  className="w-full rounded-xl px-3 py-3 text-sm resize-none"
                  style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)', minHeight: '80px' }}
                  placeholder="What happened? Did price react as expected?"
                  value={closeForm.closing_note}
                  onChange={e => setCloseForm(p => ({ ...p, closing_note: e.target.value }))}
                />
              </Field>

              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setClosing(false)}
                  className="py-3 rounded-xl text-sm font-bold"
                  style={{ backgroundColor: 'var(--surface-2)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                  Cancel
                </button>
                <button onClick={handleCloseTrade} disabled={saving}
                  className="py-3 rounded-xl text-sm font-bold"
                  style={{ backgroundColor: 'var(--accent)', color: '#fff' }}>
                  {saving ? 'Saving...' : 'Confirm Close'}
                </button>
              </div>
            </div>
          )}

          {/* Edit button for closed trades */}
          {!isOpen && !editing && (
            <button onClick={() => setEditing(true)}
              className="w-full py-3 rounded-2xl text-sm font-bold transition-all active:scale-95"
              style={{ backgroundColor: 'var(--surface-2)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
              Edit Trade
            </button>
          )}

          {!isOpen && editing && (
            <div className="rounded-2xl p-4 flex flex-col gap-4"
              style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Edit Trade</div>

              <Field label="Outcome">
                <div className="grid grid-cols-3 gap-2">
                  {(['win', 'loss', 'breakeven'] as Outcome[]).map(o => (
                    <button key={o} onClick={() => setTrade(p => p ? { ...p, outcome: o } : p)}
                      className="py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
                      style={{
                        backgroundColor: trade.outcome === o
                          ? o === 'win' ? 'var(--accent)' : o === 'loss' ? 'var(--accent-loss)' : 'var(--accent-be)'
                          : 'var(--surface-2)',
                        border: '1px solid var(--border)',
                        color: trade.outcome === o ? '#fff' : 'var(--text-secondary)'
                      }}>{o === 'breakeven' ? 'B/E' : o}</button>
                  ))}
                </div>
              </Field>

              <Field label="RR Result">
                <input type="number"
                  className="w-full rounded-xl px-3 py-3 text-sm font-mono"
                  style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  placeholder="e.g. 2.5"
                  value={trade.rr_result ?? ''}
                  onChange={e => setTrade(p => p ? { ...p, rr_result: parseFloat(e.target.value) || null } : p)} />
              </Field>

              <Field label="Emotion">
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { v: 'calm', e: '😌' }, { v: 'confident', e: '💪' },
                    { v: 'anxious', e: '😰' }, { v: 'frustrated', e: '😤' },
                    { v: 'fomo', e: '🤑' }, { v: 'revenge', e: '😡' },
                  ] as { v: Emotion; e: string }[]).map(({ v, e }) => (
                    <button key={v} onClick={() => setTrade(p => p ? { ...p, emotion: v } : p)}
                      className="py-2 rounded-xl text-xs font-semibold capitalize transition-all active:scale-95"
                      style={{
                        backgroundColor: trade.emotion === v ? 'var(--accent)' : 'var(--surface-2)',
                        border: '1px solid var(--border)',
                        color: trade.emotion === v ? '#fff' : 'var(--text-secondary)'
                      }}>{e} {v}</button>
                  ))}
                </div>
              </Field>

              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setEditing(false)}
                  className="py-3 rounded-xl text-sm font-bold"
                  style={{ backgroundColor: 'var(--surface-2)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                  Cancel
                </button>
                <button onClick={handleEditSave} disabled={saving}
                  className="py-3 rounded-xl text-sm font-bold"
                  style={{ backgroundColor: 'var(--accent)', color: '#fff' }}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}


{!editing && !closing && (
  <>
    {confirmDelete ? (
      <div className="rounded-2xl p-4 flex flex-col gap-3"
        style={{ backgroundColor: '#ff4d4d15', border: '1px solid var(--accent-loss)' }}>
        <p className="text-sm font-semibold text-center"
          style={{ color: 'var(--accent-loss)' }}>
          Are you sure? This cannot be undone.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => setConfirmDelete(false)}
            className="py-3 rounded-xl text-sm font-bold"
            style={{ backgroundColor: 'var(--surface-2)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
            Cancel
          </button>
          <button onClick={handleDelete}
            className="py-3 rounded-xl text-sm font-bold"
            style={{ backgroundColor: 'var(--accent-loss)', color: '#fff' }}>
            Yes, Delete
          </button>
        </div>
      </div>
    ) : (
      <button onClick={() => setConfirmDelete(true)}
        className="w-full py-4 rounded-2xl text-sm font-bold transition-all active:scale-95"
        style={{ backgroundColor: '#ff4d4d15', color: 'var(--accent-loss)', border: '1px solid var(--accent-loss)' }}>
        Delete Trade
      </button>
    )}
  </>
)}

        </div>
        <BottomNav />
      </div>

      {/* Lightbox — outside main div so it covers full screen */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.95)' }}
        >
          <img
            src={trade.screenshot_url!}
            alt="Trade chart fullscreen"
            className="w-full rounded-xl"
            style={{ maxHeight: '90vh', objectFit: 'contain' }}
          />
          <button
            className="absolute top-5 right-5 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg"
            style={{ backgroundColor: 'var(--accent-loss)', color: '#fff' }}
            onClick={() => setLightbox(false)}
          >
            ✕
          </button>
        </div>
      )}
    </>
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-bold tracking-widest uppercase"
        style={{ color: 'var(--text-secondary)' }}>{label}</label>
      {children}
    </div>
  )
}
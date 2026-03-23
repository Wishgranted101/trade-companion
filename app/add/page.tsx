'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { insertTrade, uploadScreenshot } from '@/lib/supabase/queries'
import { NewTrade, Session } from '@/types/trade'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'

const PAIRS = ['XAU/USD', 'EUR/USD', 'GBP/USD', 'USD/JPY', 'GBP/JPY', 'NAS100', 'US30', 'Other']
const SETUPS = ['Break & Retest', 'Trend Pullback', 'Reversal', 'Range Breakout', 'Support Bounce', 'Resistance Rejection', 'Other']

const CHECKLIST = [
  { id: 'risk', label: 'Risk ≤ 1% of account' },
  { id: 'rr', label: 'Planned RR ≥ 3:1' },
  { id: 'setup', label: 'This matches one of my allowed setups' },
  { id: 'session', label: 'Trade is within my allowed session' },
  { id: 'emotion', label: 'I am NOT entering out of revenge / FOMO / urgency' },
  { id: 'news', label: 'I have checked economic news / high-impact events' },
]

export default function AddTradePage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [saving, setSaving] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [thesis, setThesis] = useState('')
  const [customPair, setCustomPair] = useState('')
  const [customSetup, setCustomSetup] = useState('')
  const [showGatekeeper, setShowGatekeeper] = useState(false)
  const [checks, setChecks] = useState({
    risk: false, rr: false, setup: false, session: false, emotion: false, news: false
  })

  const [form, setForm] = useState<NewTrade>({
    pair: 'XAU/USD',
    setup_type: 'Break & Retest',
    session: 'new_york',
    entry_price: 0,
    stop_price: 0,
    target_price: 0,
    rr_planned: 0,
    rr_result: null,
    outcome: null,
    followed_plan: true,
    emotion: null,
    screenshot_url: null,
    status: 'open',
    closing_note: null,
  })

  const set = (field: keyof NewTrade, value: any) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const allChecked = checks.risk && checks.rr && checks.setup && checks.session && checks.emotion && checks.news

  const handleOpenGatekeeper = () => {
    setChecks({ risk: false, rr: false, setup: false, session: false, emotion: false })
    setShowGatekeeper(true)
  }

  const handleCommit = async () => {
    if (!allChecked) return
    const finalPair = form.pair === 'Other' ? customPair : form.pair
    const finalSetup = form.setup_type === 'Other' ? customSetup : form.setup_type
    if (!finalPair || !finalSetup) return
    setSaving(true)
    try {
      let screenshot_url = null
      if (imageFile) {
        screenshot_url = await uploadScreenshot(imageFile)
      }
      await insertTrade({ ...form, pair: finalPair, setup_type: finalSetup, screenshot_url })
      router.push('/')
    } catch (e) {
      console.error(e)
      setSaving(false)
    }
  }

  return (
    
      <div className="pb-40" style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
        <Header title="Log Trade" />

        <div className="px-5 pt-5 flex flex-col gap-5">

          {/* Pair */}
          <Field label="Pair">
            <div className="grid grid-cols-4 gap-2">
              {PAIRS.slice(0, 4).map(p => (
                <button key={p} onClick={() => set('pair', p)}
                  className="py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
                  style={{
                    backgroundColor: form.pair === p ? 'var(--accent)' : 'var(--surface)',
                    border: '1px solid var(--border)',
                    color: form.pair === p ? '#fff' : 'var(--text-secondary)'
                  }}>{p}</button>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {PAIRS.slice(4).map(p => (
                <button key={p} onClick={() => set('pair', p)}
                  className="py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
                  style={{
                    backgroundColor: form.pair === p ? 'var(--accent)' : 'var(--surface)',
                    border: '1px solid var(--border)',
                    color: form.pair === p ? '#fff' : 'var(--text-secondary)'
                  }}>{p}</button>
              ))}
            </div>
            {form.pair === 'Other' && (
              <input
                className="w-full rounded-xl px-4 py-3 text-sm font-mono uppercase mt-2"
                style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--accent)', color: 'var(--text-primary)' }}
                placeholder="Type pair e.g. GBP/CAD"
                value={customPair}
                onChange={e => setCustomPair(e.target.value.toUpperCase())}
              />
            )}
          </Field>

          {/* Setup Type */}
          <Field label="Setup Type">
            <div className="grid grid-cols-2 gap-2">
              {SETUPS.map(s => (
                <button key={s} onClick={() => set('setup_type', s)}
                  className="py-2 px-3 rounded-xl text-xs font-semibold text-left transition-all active:scale-95"
                  style={{
                    backgroundColor: form.setup_type === s ? 'var(--accent)' : 'var(--surface)',
                    border: '1px solid var(--border)',
                    color: form.setup_type === s ? '#fff' : 'var(--text-secondary)'
                  }}>{s}</button>
              ))}
            </div>
            {form.setup_type === 'Other' && (
              <input
                className="w-full rounded-xl px-4 py-3 text-sm mt-2"
                style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--accent)', color: 'var(--text-primary)' }}
                placeholder="Type setup e.g. Liquidity Grab"
                value={customSetup}
                onChange={e => setCustomSetup(e.target.value)}
              />
            )}
          </Field>

          {/* Session */}
          <Field label="Session">
            <div className="grid grid-cols-4 gap-2">
              {(['london', 'new_york', 'asian', 'overlap'] as Session[]).map(s => (
                <button key={s} onClick={() => set('session', s)}
                  className="py-2 rounded-xl text-xs font-semibold capitalize transition-all active:scale-95"
                  style={{
                    backgroundColor: form.session === s ? 'var(--accent)' : 'var(--surface)',
                    border: '1px solid var(--border)',
                    color: form.session === s ? '#fff' : 'var(--text-secondary)'
                  }}>{s.replace('_', ' ')}</button>
              ))}
            </div>
          </Field>

          {/* Prices */}
          <div className="grid grid-cols-3 gap-3">
            <Field label="Entry">
              <input type="number"
                className="w-full rounded-xl px-3 py-3 text-sm font-mono"
                style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                placeholder="0.00"
                value={form.entry_price || ''}
                onChange={e => set('entry_price', parseFloat(e.target.value) || 0)} />
            </Field>
            <Field label="Stop">
              <input type="number"
                className="w-full rounded-xl px-3 py-3 text-sm font-mono"
                style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                placeholder="0.00"
                value={form.stop_price || ''}
                onChange={e => set('stop_price', parseFloat(e.target.value) || 0)} />
            </Field>
            <Field label="Target">
              <input type="number"
                className="w-full rounded-xl px-3 py-3 text-sm font-mono"
                style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                placeholder="0.00"
                value={form.target_price || ''}
                onChange={e => set('target_price', parseFloat(e.target.value) || 0)} />
            </Field>
          </div>

          {/* RR Planned */}
          <Field label="RR Planned">
            <input type="number"
              className="w-full rounded-xl px-3 py-3 text-sm font-mono"
              style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              placeholder="e.g. 3"
              value={form.rr_planned || ''}
              onChange={e => set('rr_planned', parseFloat(e.target.value) || 0)} />
          </Field>

          {/* Screenshot */}
          <Field label="Chart Screenshot">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImage}
            />
            {imagePreview ? (
              <div className="relative">
                <img src={imagePreview} alt="chart"
                  className="w-full rounded-xl object-cover"
                  style={{ maxHeight: '200px', border: '1px solid var(--border)' }} />
                <button
                  onClick={() => { setImageFile(null); setImagePreview(null) }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: 'var(--accent-loss)', color: '#fff' }}>✕</button>
              </div>
            ) : (
              <button onClick={() => fileRef.current?.click()}
                className="w-full py-4 rounded-xl text-sm font-semibold transition-all active:scale-95"
                style={{ backgroundColor: 'var(--surface)', border: '2px dashed var(--border)', color: 'var(--text-secondary)' }}>
                📸 Tap to upload or capture screenshot
              </button>
            )}
          </Field>

          {imagePreview && (
            <Field label="Trade Thesis / Strategy">
              <textarea
                className="w-full rounded-xl px-4 py-3 text-sm resize-none"
                style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', minHeight: '100px' }}
                placeholder="Why are you taking this trade? What is your edge?"
                value={thesis}
                onChange={e => setThesis(e.target.value)}
              />
            </Field>
          )}

       {/* Open Trade Button */}
       <button
            onClick={handleOpenGatekeeper}
            className="w-full py-4 rounded-2xl text-base font-bold transition-all active:scale-95"
            style={{ backgroundColor: 'var(--accent)', color: '#fff' }}>
            📂 Open Trade
          </button>

        </div>

        {/* Gatekeeper Modal — inside main div */}
        {showGatekeeper && (
  <div
    className="fixed inset-0 z-50 flex items-end justify-center"
    style={{ backgroundColor: 'rgba(0,0,0,0.7)', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
    <div className="w-full rounded-t-3xl p-4 flex flex-col gap-3"
style={{ backgroundColor: 'var(--surface)', maxHeight: '75vh', overflowY: 'auto', paddingBottom: '80px' }}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                  Discipline Check
                </div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                  All boxes must be checked before committing
                </div>
              </div>
              <div className="text-2xl">🛡️</div>
            </div>

            <div className="flex flex-col gap-3">
              {CHECKLIST.map(item => {
                const checked = checks[item.id as keyof typeof checks]
                return (
                  <button
                    key={item.id}
                    onClick={() => setChecks(p => ({ ...p, [item.id]: !p[item.id as keyof typeof p] }))}
                    className="flex items-center gap-3 p-4 rounded-2xl text-left transition-all"
                    style={{
                      backgroundColor: checked ? '#00c89615' : 'var(--surface-2)',
                      border: `1px solid ${checked ? 'var(--accent)' : 'var(--border)'}`,
                    }}>
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold"
                      style={{
                        backgroundColor: checked ? 'var(--accent)' : 'var(--surface)',
                        border: `1px solid ${checked ? 'var(--accent)' : 'var(--border)'}`,
                        color: '#fff'
                      }}>
                      {checked ? '✓' : ''}
                    </div>
                    <span className="text-sm font-semibold"
                      style={{ color: checked ? 'var(--accent)' : 'var(--text-primary)' }}>
                      {item.label}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-full h-2" style={{ backgroundColor: 'var(--surface-2)' }}>
                <div className="h-2 rounded-full transition-all"
                  style={{
                    width: `${([checks.risk, checks.rr, checks.setup, checks.session, checks.emotion].filter(Boolean).length / 5) * 100}%`,
                    backgroundColor: allChecked ? 'var(--accent)' : 'var(--accent-be)'
                  }} />
              </div>
              <span className="text-xs font-bold"
                style={{ color: allChecked ? 'var(--accent)' : 'var(--text-secondary)' }}>
                {[checks.risk, checks.rr, checks.setup, checks.session, checks.emotion, checks.news].filter(Boolean).length}/6
              </span>
            </div>

            {!allChecked && (
              <div className="rounded-xl p-3 text-xs font-semibold text-center"
                style={{ backgroundColor: '#ff4d4d15', color: 'var(--accent-loss)', border: '1px solid var(--accent-loss)' }}>
                ⚠️ Complete all checks before committing to this trade
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowGatekeeper(false)}
                className="py-4 rounded-2xl text-sm font-bold"
                style={{ backgroundColor: 'var(--surface-2)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                Cancel
              </button>
              <button
                onClick={handleCommit}
                disabled={!allChecked || saving}
                className="py-4 rounded-2xl text-sm font-bold"
                style={{
                  backgroundColor: allChecked ? 'var(--accent)' : 'var(--surface-2)',
                  color: allChecked ? '#fff' : 'var(--text-secondary)',
                  border: allChecked ? 'none' : '1px solid var(--border)'
                }}>
                {saving ? 'Saving...' : '✓ Commit Trade'}
              </button>
            </div>

          </div>
        </div>
   )}
   <BottomNav />
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
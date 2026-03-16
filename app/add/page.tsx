'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { insertTrade, uploadScreenshot } from '@/lib/supabase/queries'
import { NewTrade, Session } from '@/types/trade'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'

const PAIRS = ['XAU/USD', 'EUR/USD', 'GBP/USD', 'USD/JPY', 'GBP/JPY', 'NAS100', 'US30', 'Other']
const SETUPS = ['Break & Retest', 'Trend Pullback', 'Reversal', 'Range Breakout', 'Support Bounce', 'Resistance Rejection', 'Other']

export default function AddTradePage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [saving, setSaving] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [thesis, setThesis] = useState('')
  const [customPair, setCustomPair] = useState('')

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
  })

  const set = (field: keyof NewTrade, value: any) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async () => {
    const finalPair = form.pair === 'Other' ? customPair : form.pair
    if (!finalPair || !form.setup_type) return
    setSaving(true)
    try {
      let screenshot_url = null
      if (imageFile) {
        screenshot_url = await uploadScreenshot(imageFile)
      }
      await insertTrade({ ...form, pair: finalPair, screenshot_url })
      router.push('/')
    } catch (e) {
      console.error(e)
      setSaving(false)
    }
  }

  return (
    <div className="pb-28" style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
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
            capture="environment"
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

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={saving || !form.pair || !form.setup_type}
          className="w-full py-4 rounded-2xl text-base font-bold transition-all active:scale-95"
          style={{
            backgroundColor: saving || !form.pair || !form.setup_type ? 'var(--surface-2)' : 'var(--accent)',
            color: saving || !form.pair || !form.setup_type ? 'var(--text-secondary)' : '#fff'
          }}>
          {saving ? 'Saving...' : '📂 Open Trade'}
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
        style={{ color: 'var(--text-secondary)' }}>{label}</label>
      {children}
    </div>
  )
}
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); setLoading(false) }
      else { router.push('/') }
    } else if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) { setError(error.message); setLoading(false) }
      else { setMessage('Account created! You can now sign in.'); setMode('login'); setPassword(''); setLoading(false) }
    } else if (mode === 'forgot') {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) { setError(error.message); setLoading(false) }
      else { setMessage('Check your email for a password reset link.'); setLoading(false) }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: 'var(--background)' }}>
      <div className="w-full max-w-sm p-8 rounded-2xl"
        style={{ backgroundColor: 'var(--surface-1)' }}>
        <h1 className="text-2xl font-bold mb-2"
          style={{ color: 'var(--text-primary)' }}>Trade Companion</h1>
        <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
          {mode === 'login' && 'Sign in to your journal'}
          {mode === 'signup' && 'Create your account'}
          {mode === 'forgot' && 'Reset your password'}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl text-sm outline-none"
            style={{ backgroundColor: 'var(--surface-2)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
          />
          {mode !== 'forgot' && (
            <input
              type="password"
              placeholder="Password"
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={{ backgroundColor: 'var(--surface-2)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
            />
          )}
          {error && <p className="text-sm" style={{ color: 'var(--accent-loss)' }}>{error}</p>}
          {message && <p className="text-sm" style={{ color: 'var(--accent)' }}>{message}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-sm"
            style={{ backgroundColor: 'var(--accent)', color: 'white' }}>
            {loading ? '...' : mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
          </button>
        </form>

        <div className="flex flex-col items-center gap-2 mt-6">
          {mode === 'login' && (
            <>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Don't have an account?{' '}
                <button type="button" onClick={() => { setMode('signup'); setError(''); setMessage('') }}
                  className="underline" style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Sign up
                </button>
              </p>
              <button type="button" onClick={() => { setMode('forgot'); setError(''); setMessage('') }}
                className="text-xs underline" style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                Forgot password?
              </button>
            </>
          )}
          {mode === 'signup' && (
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Already have an account?{' '}
              <button type="button" onClick={() => { setMode('login'); setError(''); setMessage('') }}
                className="underline" style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}>
                Sign in
              </button>
            </p>
          )}
          {mode === 'forgot' && (
            <button type="button" onClick={() => { setMode('login'); setError(''); setMessage('') }}
              className="text-xs underline" style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}>
              Back to sign in
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
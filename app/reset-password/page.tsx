'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        // User is in password recovery mode, ready to set new password
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setMessage('Password updated! Redirecting...')
      setTimeout(() => router.push('/'), 2000)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: 'var(--background)' }}>
      <div className="w-full max-w-sm p-8 rounded-2xl"
        style={{ backgroundColor: 'var(--surface-1)' }}>
        <h1 className="text-2xl font-bold mb-2"
          style={{ color: 'var(--text-primary)' }}>Set New Password</h1>
        <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
          Enter your new password below
        </p>

        <form onSubmit={handleReset} className="flex flex-col gap-4">
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none"
            style={{ backgroundColor: 'var(--surface-2)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
          />
          {error && <p className="text-sm" style={{ color: 'var(--accent-loss)' }}>{error}</p>}
          {message && <p className="text-sm" style={{ color: 'var(--accent)' }}>{message}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-sm"
            style={{ backgroundColor: 'var(--accent)', color: 'white' }}>
            {loading ? '...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
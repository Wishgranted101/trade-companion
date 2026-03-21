'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function Header({ title }: { title: string }) {
  const [dark, setDark] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'))
  }, [])

  const toggle = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-10 px-5 py-4 flex items-center justify-between"
      style={{ backgroundColor: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
      <span className="text-lg font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
        {title}
      </span>
      <div className="flex items-center gap-2">
        <button onClick={toggle}
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all active:scale-95"
          style={{ backgroundColor: 'var(--surface-2)', color: 'var(--text-primary)' }}>
          {dark ? '🌙' : '🌞'}
        </button>
        <button onClick={handleLogout}
          className="text-xs px-3 py-1.5 rounded-lg"
          style={{ backgroundColor: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
          Sign Out
        </button>
      </div>
    </header>
  )
}
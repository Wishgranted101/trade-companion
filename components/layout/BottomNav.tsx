'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { href: '/', label: 'Journal', icon: '📒' },
  { href: '/stats', label: 'Stats', icon: '📊' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 flex"
      style={{ backgroundColor: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
      {tabs.map(tab => {
        const active = pathname === tab.href
        return (
          <Link key={tab.href} href={tab.href}
            className="flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-all active:scale-95"
            style={{ color: active ? 'var(--accent)' : 'var(--text-secondary)' }}>
            <span className="text-xl">{tab.icon}</span>
            <span className="text-xs font-semibold tracking-wide">{tab.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
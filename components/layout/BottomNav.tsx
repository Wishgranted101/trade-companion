'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { href: '/', label: 'Journal', icon: '📒' },
  { href: '/add', label: 'Log', icon: '➕' },
  { href: '/stats', label: 'Stats', icon: '📊' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50, backgroundColor: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
      <div style={{ display: 'flex' }}>
        {tabs.map(tab => {
          const active = pathname === tab.href
          return (
            <Link key={tab.href} href={tab.href}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px 0',
                gap: '4px',
                color: active ? 'var(--accent)' : 'var(--text-secondary)',
                textDecoration: 'none',
                borderTop: active ? '2px solid var(--accent)' : '2px solid transparent',
              }}>
              <span style={{ fontSize: '20px' }}>{tab.icon}</span>
              <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em' }}>{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
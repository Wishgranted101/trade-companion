import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Trade Companion',
  description: 'Your personal trading journal',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{
          __html: `
            const theme = localStorage.getItem('theme') ||
              (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
            document.documentElement.classList.toggle('dark', theme === 'dark');
          `
        }} />
        <main className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
          {children}
        </main>
      </body>
    </html>
  )
}
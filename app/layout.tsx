import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Preboarding',
  description: 'Réduisez vos no-show J1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className="antialiased">{children}</body>
    </html>
  )
}

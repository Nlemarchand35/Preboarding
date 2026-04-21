export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Toaster } from '@/components/ui/toaster'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <span className="text-xl font-bold text-gray-900">Preboarding</span>
          <form action="/api/auth/signout" method="post">
            <button
              type="submit"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Déconnexion
            </button>
          </form>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <Toaster />
    </div>
  )
}

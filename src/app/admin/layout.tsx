'use client'
import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard, Bus, Map, Ticket, LogOut, ChevronRight, Menu, X
} from 'lucide-react'
import { useState } from 'react'

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/buses', label: 'Buses', icon: Bus },
  { href: '/admin/routes', label: 'Routes', icon: Map },
  { href: '/admin/bookings', label: 'Bookings', icon: Ticket },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const u = session?.user as { role?: string } | undefined

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    else if (status === 'authenticated' && u?.role !== 'admin') router.push('/')
  }, [status, u, router])

  if (status === 'loading' || !session || u?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-gray-900 z-40 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo */}
        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
                <Bus className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-white">BusBook</span>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-500/20 flex items-center justify-center">
              <span className="text-brand-400 text-xs font-bold">{session.user?.name?.[0]}</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-white truncate">{session.user?.name}</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/admin' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  {label}
                </div>
                {active && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-gray-800">
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-red-900/40 hover:text-red-400 w-full transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-gray-100 flex items-center px-4 gap-3 sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100">
            <Menu className="w-5 h-5" />
          </button>
          <div className="text-sm text-gray-500 hidden sm:flex items-center gap-2">
            <span>Admin</span>
            {pathname !== '/admin' && (
              <>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="capitalize text-gray-800 font-medium">
                  {pathname.split('/').pop()}
                </span>
              </>
            )}
          </div>
          <div className="ml-auto">
            <Link href="/" className="text-xs text-gray-400 hover:text-brand-600 transition-colors">
              ← View Site
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

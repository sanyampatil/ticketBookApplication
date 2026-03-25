'use client'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'
import { Bus, Menu, X, User, LogOut, LayoutDashboard, Ticket, ChevronDown } from 'lucide-react'

export default function Navbar() {
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropOpen, setDropOpen] = useState(false)
  const u = session?.user as { role?: string; name?: string } | undefined

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center shadow-sm group-hover:bg-brand-700 transition-colors">
              <Bus className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-gray-900">
              Bus<span className="text-brand-600">Book</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/routes" className="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors">
              Find Buses
            </Link>
            {session && (
              <Link href="/bookings" className="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors">
                My Bookings
              </Link>
            )}
            {u?.role === 'admin' && (
              <Link href="/admin" className="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors">
                Admin
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setDropOpen(!dropOpen)}
                  className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 transition-colors"
                >
                  <div className="w-7 h-7 bg-brand-100 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-brand-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate">{session.user?.name}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${dropOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-lg border border-gray-100 py-2 animate-fade-in">
                    {u?.role === 'admin' && (
                      <Link
                        href="/admin"
                        onClick={() => setDropOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-gray-400" />
                        Admin Dashboard
                      </Link>
                    )}
                    <Link
                      href="/bookings"
                      onClick={() => setDropOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Ticket className="w-4 h-4 text-gray-400" />
                      My Bookings
                    </Link>
                    <div className="border-t border-gray-100 my-1" />
                    <button
                      onClick={() => { signOut({ callbackUrl: '/' }); setDropOpen(false) }}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="btn-secondary text-sm py-2 px-4">
                  Sign in
                </Link>
                <Link href="/register" className="btn-primary text-sm py-2 px-4">
                  Get started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1 animate-slide-up">
          <Link href="/routes" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">
            Find Buses
          </Link>
          {session && (
            <Link href="/bookings" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">
              My Bookings
            </Link>
          )}
          {u?.role === 'admin' && (
            <Link href="/admin" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">
              Admin
            </Link>
          )}
          <div className="border-t border-gray-100 pt-2 mt-2">
            {session ? (
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 w-full"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            ) : (
              <div className="flex gap-2">
                <Link href="/login" onClick={() => setMenuOpen(false)} className="btn-secondary text-sm flex-1 text-center py-2">Sign in</Link>
                <Link href="/register" onClick={() => setMenuOpen(false)} className="btn-primary text-sm flex-1 text-center py-2">Register</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

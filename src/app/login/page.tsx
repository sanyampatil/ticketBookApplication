'use client'
import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Bus, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (res?.error) {
      setError('Invalid email or password. Please try again.')
      setLoading(false)
    } else {
      router.push(callbackUrl)
      router.refresh()
    }
  }

  const fillDemo = (type: 'admin' | 'user') => {
    if (type === 'admin') {
      setEmail('admin@busbook.com')
      setPassword('admin123')
    } else {
      setEmail('user@busbook.com')
      setPassword('user123')
    }
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-brand-300 blur-3xl" />
        </div>
        <div className="relative text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
            <Bus className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-4xl font-display font-bold mb-4">Welcome back!</h1>
          <p className="text-brand-200 text-lg max-w-sm">
            Sign in to manage your bookings and continue your journey with BusBook.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4 text-center">
            {[
              { label: '50+ Buses', icon: '🚌' },
              { label: '120+ Routes', icon: '🗺️' },
              { label: '10K+ Users', icon: '👥' },
              { label: '24/7 Support', icon: '🎧' },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-sm font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center">
                <Bus className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-gray-900">
                Bus<span className="text-brand-600">Book</span>
              </span>
            </Link>
          </div>

          <div className="card shadow-xl border-0">
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-1">Sign in</h2>
            <p className="text-gray-500 text-sm mb-6">Enter your credentials to access your account</p>

            {/* Demo credentials */}
            <div className="bg-brand-50 border border-brand-100 rounded-xl p-3 mb-5">
              <p className="text-xs font-semibold text-brand-700 mb-2">🎯 Demo Credentials</p>
              <div className="flex gap-2">
                <button onClick={() => fillDemo('user')} className="text-xs bg-white border border-brand-200 text-brand-700 px-2.5 py-1.5 rounded-lg hover:bg-brand-50 transition-colors font-medium">
                  User Demo
                </button>
                <button onClick={() => fillDemo('admin')} className="text-xs bg-brand-600 text-white px-2.5 py-1.5 rounded-lg hover:bg-brand-700 transition-colors font-medium">
                  Admin Demo
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl p-3 mb-4 text-sm text-red-600">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    className="input-field pl-9"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input-field pl-9 pr-9"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in...</>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-5">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-brand-600 font-medium hover:text-brand-700">
                Create one
              </Link>
            </p>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            <Link href="/" className="hover:text-gray-600">← Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  )
}

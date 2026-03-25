'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { Bus, Mail, Lock, User, Phone, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }))

  const passwordStrength = (p: string) => {
    if (!p) return 0
    let score = 0
    if (p.length >= 6) score++
    if (p.length >= 8) score++
    if (/[A-Z]/.test(p)) score++
    if (/[0-9]/.test(p)) score++
    if (/[^A-Za-z0-9]/.test(p)) score++
    return score
  }
  const strength = passwordStrength(form.password)
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][strength]
  const strengthColor = ['', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400', 'bg-emerald-500'][strength]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirm) {
      setError('Passwords do not match')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone, password: form.password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      // Auto sign-in after registration
      await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      })
      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
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
          <h1 className="text-4xl font-display font-bold mb-4">Join BusBook</h1>
          <p className="text-brand-200 text-lg max-w-sm">
            Create your account and start booking comfortable bus journeys across Maharashtra.
          </p>
          <div className="mt-10 space-y-3">
            {[
              'Free account — no hidden charges',
              'Instant booking confirmation',
              'Easy cancellation & refunds',
              'Real-time seat availability',
            ].map((f) => (
              <div key={f} className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3 backdrop-blur-sm">
                <CheckCircle className="w-4 h-4 text-brand-300 shrink-0" />
                <span className="text-sm text-brand-100">{f}</span>
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
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-1">Create account</h2>
            <p className="text-gray-500 text-sm mb-6">Fill in your details to get started</p>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl p-3 mb-4 text-sm text-red-600">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input className="input-field pl-9" placeholder="Your full name" value={form.name}
                    onChange={(e) => update('name', e.target.value)} required />
                </div>
              </div>

              <div>
                <label className="label">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" className="input-field pl-9" placeholder="you@example.com" value={form.email}
                    onChange={(e) => update('email', e.target.value)} required />
                </div>
              </div>

              <div>
                <label className="label">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="tel" className="input-field pl-9" placeholder="10-digit mobile number" value={form.phone}
                    onChange={(e) => update('phone', e.target.value)} required />
                </div>
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type={showPassword ? 'text' : 'password'} className="input-field pl-9 pr-9"
                    placeholder="At least 6 characters" value={form.password}
                    onChange={(e) => update('password', e.target.value)} required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {form.password && (
                  <div className="mt-2">
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map((i) => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColor : 'bg-gray-200'}`} />
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{strengthLabel}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="label">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="password" className="input-field pl-9" placeholder="Repeat your password"
                    value={form.confirm} onChange={(e) => update('confirm', e.target.value)} required />
                  {form.confirm && form.confirm === form.password && (
                    <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                  )}
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating account...</>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-5">
              Already have an account?{' '}
              <Link href="/login" className="text-brand-600 font-medium hover:text-brand-700">Sign in</Link>
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

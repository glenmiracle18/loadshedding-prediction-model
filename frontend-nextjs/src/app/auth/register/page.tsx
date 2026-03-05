'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { Eye, EyeOff, UserPlus, User, Mail, Power } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import type { RegisterRequest } from '@/lib/api'

export default function RegisterPage() {
  const router = useRouter()
  const { register, loading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const form = useForm({
    defaultValues: {
      email: '',
      username: '',
      password: '',
    },
    onSubmit: async ({ value }: { value: RegisterRequest }) => {
      setError(null)
      const result = await register(value)
      
      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/auth/login')
        }, 2000)
      } else {
        setError(result.error || 'Registration failed')
      }
    },
  })

  if (success) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <div className="bg-white/10 backdrop-blur border border-white/20 rounded p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded mb-4">
                <UserPlus size={24} className="text-white" />
              </div>
              <h1 className="text-display text-3xl font-bold text-white mb-2">Account Created!</h1>
              <p className="text-white/70 mb-4">
                Your account has been successfully created. 
                Redirecting to login...
              </p>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500"></div>
              </div>
            </div>
          </div>
        </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500 rounded mb-4">
                <Power size={24} className="text-white" />
              </div>
              <h1 className="text-display text-3xl font-bold text-white mb-2">Create Account</h1>
              <p className="text-white/70">Join LoadShed Predictor to get started</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-400/50 rounded">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
            className="space-y-6"
          >
            <form.Field name="email">
              {(field) => (
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
                    <input
                      type="email"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-white/20 bg-white/10 text-white placeholder:text-white/50 rounded focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  {field.state.meta.errors.length > 0 && (
                    <p className="mt-1 text-sm text-red-200">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field name="username">
              {(field) => (
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <User size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
                    <input
                      type="text"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-white/20 bg-white/10 text-white placeholder:text-white/50 rounded focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                      placeholder="Choose a username"
                      required
                    />
                  </div>
                  {field.state.meta.errors.length > 0 && (
                    <p className="mt-1 text-sm text-red-200">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field name="password">
              {(field) => (
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="w-full pl-4 pr-12 py-3 border-2 border-white/20 bg-white/10 text-white placeholder:text-white/50 rounded focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                      placeholder="Create a password"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/70"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-white/50">
                    Password must be at least 8 characters long
                  </p>
                  {field.state.meta.errors.length > 0 && (
                    <p className="mt-1 text-sm text-red-200">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-white/20 text-white font-semibold rounded transition-colors"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-white/70">
              Already have an account?{' '}
              <Link
                href="/auth/login"
                className="text-amber-400 hover:text-amber-300 font-semibold transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
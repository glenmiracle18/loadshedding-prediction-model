'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Home, Menu, X, Zap, LogOut, LogIn, UserPlus, BarChart3, History, Calculator, Power } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const { isAuthenticated, user, logout } = useAuth()
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <>
      <header className="bg-transparent px-4 py-4 absolute top-0 left-0 right-0 z-50">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsOpen(true)}
              className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 lg:hidden text-white hover:text-amber-400"
            >
              <Menu size={20} />
            </button>
            
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-amber-500 rounded flex items-center justify-center hover:bg-amber-600 transition-colors duration-200">
                <Power className="w-5 h-5 text-white" />
              </div>
              <span className="text-display font-semibold text-white text-lg tracking-tight">LoadShed Predictor</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-2 bg-white/15 rounded p-1.5">
            <Link
              href="/"
              className={`px-4 py-2.5 rounded transition-colors duration-200 font-medium text-sm ${
                isActive('/') 
                  ? 'text-amber-500 bg-white/20' 
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}
            >
              Home
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  href="/dashboard"
                  className={`px-4 py-2.5 rounded transition-colors duration-200 font-medium text-sm ${
                    isActive('/dashboard') 
                      ? 'text-amber-500 bg-white/20' 
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/predict"
                  className={`px-4 py-2.5 rounded transition-colors duration-200 font-medium text-sm ${
                    isActive('/predict') 
                      ? 'text-amber-500 bg-white/20' 
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Predict
                </Link>
                <Link
                  href="/history"
                  className={`px-4 py-2.5 rounded transition-colors duration-200 font-medium text-sm ${
                    isActive('/history') 
                      ? 'text-amber-500 bg-white/20' 
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`}
                >
                  History
                </Link>
                <Link
                  href="/costs"
                  className={`px-4 py-2.5 rounded transition-colors duration-200 font-medium text-sm ${
                    isActive('/costs') 
                      ? 'text-amber-500 bg-white/20' 
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Cost Calculator
                </Link>
              </>
            )}
          </nav>

          {/* User Actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <>
                <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-white/15 rounded">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-white">
                    {user.username}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-4 py-2.5 text-white/90 hover:text-white hover:bg-white/10 rounded transition-colors duration-200 font-medium"
                >
                  <LogOut size={16} />
                  <span className="hidden sm:block">Logout</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="px-4 py-2.5 text-white/90 hover:text-white hover:bg-white/10 rounded transition-colors duration-200 font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="px-5 py-2.5 bg-amber-500 text-white rounded hover:bg-amber-600 transition-colors duration-200 font-medium"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <aside className="fixed top-0 left-0 h-full w-80 bg-white/95 backdrop-blur-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-200/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <Power className="w-4 h-4 text-white" />
                </div>
                <span className="text-display font-semibold text-slate-900">LoadShed Predictor</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-amber-50 rounded-xl transition-all duration-200 text-slate-600 hover:text-amber-600"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="p-4 space-y-2">
              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-200 font-medium ${
                  isActive('/') 
                    ? 'text-amber-700 bg-amber-50 shadow-soft' 
                    : 'text-slate-700 hover:bg-slate-100/70 hover:text-slate-900'
                }`}
              >
                <Home size={20} />
                Home
              </Link>

              {isAuthenticated && (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-200 font-medium ${
                      isActive('/dashboard') 
                        ? 'text-amber-700 bg-amber-50 shadow-soft' 
                        : 'text-slate-700 hover:bg-slate-100/70 hover:text-slate-900'
                    }`}
                  >
                    <BarChart3 size={20} />
                    Dashboard
                  </Link>
                  <Link
                    href="/predict"
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-200 font-medium ${
                      isActive('/predict') 
                        ? 'text-amber-700 bg-amber-50 shadow-soft' 
                        : 'text-slate-700 hover:bg-slate-100/70 hover:text-slate-900'
                    }`}
                  >
                    <Zap size={20} />
                    Predict
                  </Link>
                  <Link
                    href="/history"
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-200 font-medium ${
                      isActive('/history') 
                        ? 'text-amber-700 bg-amber-50 shadow-soft' 
                        : 'text-slate-700 hover:bg-slate-100/70 hover:text-slate-900'
                    }`}
                  >
                    <History size={20} />
                    History
                  </Link>
                  <Link
                    href="/costs"
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-200 font-medium ${
                      isActive('/costs') 
                        ? 'text-amber-700 bg-amber-50 shadow-soft' 
                        : 'text-slate-700 hover:bg-slate-100/70 hover:text-slate-900'
                    }`}
                  >
                    <Calculator size={20} />
                    Cost Calculator
                  </Link>
                </>
              )}

              {!isAuthenticated && (
                <div className="pt-4 space-y-3">
                  <Link
                    href="/auth/login"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 p-4 text-slate-700 hover:bg-slate-100/70 hover:text-slate-900 rounded-xl transition-all duration-200 font-medium"
                  >
                    <LogIn size={20} />
                    Sign In
                  </Link>
                  <Link
                    href="/auth/register"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 p-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-200 font-medium shadow-soft"
                  >
                    <UserPlus size={20} />
                    Get Started
                  </Link>
                </div>
              )}
            </nav>
          </aside>
        </div>
      )}
    </>
  )
}
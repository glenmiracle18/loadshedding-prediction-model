import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { Home, Menu, X, Zap, LogOut, LogIn, UserPlus, BarChart3, History, Calculator } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const { isAuthenticated, user, logout } = useAuth()

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
            >
              <Menu size={20} />
            </button>
            
            <Link to="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-gray-900">LoadShed Predictor</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link
              to="/"
              className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              activeProps={{ className: "px-3 py-2 text-blue-600 bg-blue-50 rounded-lg" }}
            >
              Home
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/dashboard"
                  className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  activeProps={{ className: "px-3 py-2 text-blue-600 bg-blue-50 rounded-lg" }}
                >
                  Dashboard
                </Link>
                <Link
                  to="/predict"
                  className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  activeProps={{ className: "px-3 py-2 text-blue-600 bg-blue-50 rounded-lg" }}
                >
                  Predict
                </Link>
                <Link
                  to="/history"
                  className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  activeProps={{ className: "px-3 py-2 text-blue-600 bg-blue-50 rounded-lg" }}
                >
                  History
                </Link>
                <Link
                  to="/costs"
                  className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  activeProps={{ className: "px-3 py-2 text-blue-600 bg-blue-50 rounded-lg" }}
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
                <span className="text-sm text-gray-600 hidden md:block">
                  {user.username}
                </span>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <LogOut size={16} />
                  <span className="hidden sm:block">Logout</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/auth/login"
                  className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth/register"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsOpen(false)} />
          <aside className="fixed top-0 left-0 h-full w-80 bg-white">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-gray-900">LoadShed Predictor</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="p-4 space-y-1">
              <Link
                to="/"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                activeProps={{ className: "flex items-center gap-3 p-3 text-blue-600 bg-blue-50 rounded-lg" }}
              >
                <Home size={20} />
                Home
              </Link>

              {isAuthenticated && (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    activeProps={{ className: "flex items-center gap-3 p-3 text-blue-600 bg-blue-50 rounded-lg" }}
                  >
                    <BarChart3 size={20} />
                    Dashboard
                  </Link>
                  <Link
                    to="/predict"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    activeProps={{ className: "flex items-center gap-3 p-3 text-blue-600 bg-blue-50 rounded-lg" }}
                  >
                    <Zap size={20} />
                    Predict
                  </Link>
                  <Link
                    to="/history"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    activeProps={{ className: "flex items-center gap-3 p-3 text-blue-600 bg-blue-50 rounded-lg" }}
                  >
                    <History size={20} />
                    History
                  </Link>
                  <Link
                    to="/costs"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    activeProps={{ className: "flex items-center gap-3 p-3 text-blue-600 bg-blue-50 rounded-lg" }}
                  >
                    <Calculator size={20} />
                    Cost Calculator
                  </Link>
                </>
              )}

              {!isAuthenticated && (
                <div className="pt-4 space-y-2">
                  <Link
                    to="/auth/login"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <LogIn size={20} />
                    Sign In
                  </Link>
                  <Link
                    to="/auth/register"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
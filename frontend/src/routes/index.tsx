import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useAuth } from '../hooks/useAuth'
import { Zap, ArrowRight, BarChart3, Clock, Shield, Brain } from 'lucide-react'

export const Route = createFileRoute('/')({ component: App })

function App() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              LoadShed Predictor
            </h1>
          </div>
          
          <p className="text-xl text-gray-600 mb-4">
            AI-powered load shedding predictions for South Africa
          </p>
          <p className="text-gray-500 max-w-2xl mx-auto mb-10">
            Get accurate 6-hour ahead predictions using machine learning. 
            Simple, fast, and reliable forecasting to help you plan better.
          </p>
          
          <div className="flex justify-center gap-4 mb-12">
            {isAuthenticated ? (
              <div className="flex gap-3">
                <button
                  onClick={() => navigate({ to: '/dashboard' })}
                  className="px-8 py-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={() => navigate({ to: '/predict' })}
                  className="px-8 py-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  New Prediction
                  <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => navigate({ to: '/auth/register' })}
                  className="px-8 py-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Get Started Free
                </button>
                <button
                  onClick={() => navigate({ to: '/auth/login' })}
                  className="px-8 py-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>

          {/* Key Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                <Brain className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                AI Powered
              </h3>
              <p className="text-gray-600 text-sm">
                Advanced machine learning models trained on historical data
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                6-Hour Ahead
              </h3>
              <p className="text-gray-600 text-sm">
                Real-time forecasting with confidence scores
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Analytics
              </h3>
              <p className="text-gray-600 text-sm">
                Track your prediction history and analyze trends
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Reliable
              </h3>
              <p className="text-gray-600 text-sm">
                92%+ accuracy with multiple fallback models
              </p>
            </div>
          </div>

          <div className="mt-16 text-center">
            <p className="text-sm text-gray-500">
              Powered by XGBoost & Random Forest • <span className="text-blue-600 font-medium">92%+ accuracy</span>
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
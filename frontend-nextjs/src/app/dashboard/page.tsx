'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { BarChart3, Zap, Clock, TrendingUp, MapPin } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { predictionsApi, healthApi } from '@/lib/api'
import type { PredictionResponse, HealthResponse } from '@/lib/api'

export default function DashboardPage() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const [predictions, setPredictions] = useState<PredictionResponse[]>([])
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [loading, setLoading] = useState(true)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    if (!isAuthenticated) return

    const loadData = async () => {
      try {
        // Load recent predictions
        const predictionsResponse = await predictionsApi.getUserPredictions(5, 0)
        if (predictionsResponse.success && predictionsResponse.data) {
          setPredictions(predictionsResponse.data)
        }

        // Load system health
        const healthResponse = await healthApi.checkHealth()
        if (healthResponse.success && healthResponse.data) {
          setHealth(healthResponse.data)
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [isAuthenticated])

  const getStageInfo = (stage: number) => {
    const stages = {
      0: { label: 'No Load Shedding', color: 'text-green-400', bgColor: 'bg-green-400/10' },
      1: { label: 'Stage 1', color: 'text-yellow-400', bgColor: 'bg-yellow-400/10' },
      2: { label: 'Stage 2', color: 'text-orange-400', bgColor: 'bg-orange-400/10' },
      3: { label: 'Stage 3', color: 'text-red-400', bgColor: 'bg-red-400/10' },
      4: { label: 'Stage 4', color: 'text-red-500', bgColor: 'bg-red-500/10' },
    }
    return stages[stage as keyof typeof stages] || stages[0]
  }

  if (!isAuthenticated) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white border border-gray-200 rounded-full mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-gray-600">
            Monitor your load shedding predictions and system status
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Predictions</p>
                <p className="text-2xl font-bold text-gray-900">{predictions.length}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">System Status</p>
                <p className="text-2xl font-bold text-green-600">
                  {health?.status || 'Loading...'}
                </p>
              </div>
              <Zap className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Avg Confidence</p>
                <p className="text-2xl font-bold text-gray-900">
                  {predictions.length > 0 
                    ? `${((predictions.reduce((acc, pred) => acc + pred.confidence_score, 0) / predictions.length) * 100).toFixed(1)}%`
                    : '0%'
                  }
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Last Updated</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Date().toLocaleDateString()}
                </p>
              </div>
              <Clock className="w-8 h-8 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Predictions */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent Predictions</h2>
              <button
                onClick={() => router.push('/history')}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
              >
                View All
              </button>
            </div>

            {predictions.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <BarChart3 size={24} className="text-gray-500" />
                </div>
                <p className="text-gray-600 mb-4">No predictions yet</p>
                <button
                  onClick={() => router.push('/predict')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Create Your First Prediction
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {predictions.slice(0, 5).map((prediction) => {
                  const stageInfo = getStageInfo(prediction.predicted_stage)
                  return (
                    <div
                      key={prediction.id}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${stageInfo.bgColor}`}>
                            <span className={`font-bold text-sm ${stageInfo.color}`}>
                              {prediction.predicted_stage}
                            </span>
                          </div>
                          <div>
                            <h3 className={`font-medium ${stageInfo.color}`}>
                              {stageInfo.label}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {(prediction.confidence_score * 100).toFixed(1)}% confidence
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-gray-600 text-sm">
                            <MapPin size={14} />
                            <span>{prediction.location}</span>
                          </div>
                          <p className="text-xs text-gray-500">
                            {new Date(prediction.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
            <div className="space-y-4">
              <button
                onClick={() => router.push('/predict')}
                className="w-full p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-3"
              >
                <Zap size={20} />
                <span>New Prediction</span>
              </button>
              
              <button
                onClick={() => router.push('/history')}
                className="w-full p-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center gap-3"
              >
                <BarChart3 size={20} />
                <span>View History</span>
              </button>
              
              <button
                onClick={() => router.push('/costs')}
                className="w-full p-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center gap-3"
              >
                <TrendingUp size={20} />
                <span>Cost Calculator</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
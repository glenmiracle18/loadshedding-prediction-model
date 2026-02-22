import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { BarChart3, Zap, Clock, TrendingUp, MapPin, Calendar } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { predictionsApi, healthApi } from '../lib/api'
import type { PredictionResponse, HealthResponse } from '../lib/api'

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const [predictions, setPredictions] = useState<PredictionResponse[]>([])
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [loading, setLoading] = useState(true)

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    navigate({ to: '/auth/login' })
    return null
  }

  useEffect(() => {
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
  }, [])

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

  const getAverageStage = () => {
    if (predictions.length === 0) return 0
    const sum = predictions.reduce((acc, pred) => acc + pred.predicted_stage, 0)
    return sum / predictions.length
  }

  const getAverageConfidence = () => {
    if (predictions.length === 0) return 0
    const sum = predictions.reduce((acc, pred) => acc + pred.confidence_score, 0)
    return (sum / predictions.length) * 100
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

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="text-blue-600" size={24} />
              <span className="text-2xl font-bold text-gray-900">{predictions.length}</span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">Total Predictions</h3>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="text-green-600" size={24} />
              <span className="text-2xl font-bold text-gray-900">{getAverageStage().toFixed(1)}</span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">Average Stage</h3>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <Zap className="text-yellow-600" size={24} />
              <span className="text-2xl font-bold text-gray-900">{getAverageConfidence().toFixed(1)}%</span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">Avg Confidence</h3>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <Clock className={`${health?.status === 'healthy' ? 'text-green-600' : 'text-red-600'}`} size={24} />
              <span className={`text-2xl font-bold ${health?.status === 'healthy' ? 'text-green-600' : 'text-red-600'}`}>
                {health?.status === 'healthy' ? '✓' : '✗'}
              </span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">System Status</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Predictions */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent Predictions</h2>
              <button
                onClick={() => navigate({ to: '/history' })}
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
                  onClick={() => navigate({ to: '/predict' })}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Create Your First Prediction
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {predictions.map((prediction) => {
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
                          <p className="text-sm text-gray-700 flex items-center gap-1">
                            <MapPin size={14} />
                            {prediction.location}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar size={12} />
                            {new Date(prediction.datetime).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        Model: {prediction.model_used.replace('_', ' ')} • 
                        Created: {new Date(prediction.created_at).toLocaleString()}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* System Health & Quick Actions */}
          <div className="space-y-6">
            {/* System Health */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">System Health</h2>
              
              {health ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Overall Status</span>
                    <span className={`font-medium ${health.status === 'healthy' ? 'text-green-600' : 'text-red-600'}`}>
                      {health.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Database</span>
                    <span className={`font-medium ${health.database === 'connected' ? 'text-green-600' : 'text-red-600'}`}>
                      {health.database}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Cache</span>
                    <span className={`font-medium ${health.cache === 'connected' ? 'text-green-600' : 'text-red-600'}`}>
                      {health.cache}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm">ML Models:</span>
                    <div className="mt-1 space-y-1">
                      {Object.entries(health.ml_models).map(([model, status]) => (
                        <div key={model} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700 capitalize">{model.replace('_', ' ')}</span>
                          <span className={`font-medium ${status === 'loaded' ? 'text-green-600' : 'text-red-600'}`}>
                            {status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">Unable to load system health</p>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={() => navigate({ to: '/predict' })}
                  className="w-full flex items-center gap-3 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Zap size={18} />
                  <span>New Prediction</span>
                </button>
                <button
                  onClick={() => navigate({ to: '/history' })}
                  className="w-full flex items-center gap-3 p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  <BarChart3 size={18} />
                  <span>View History</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
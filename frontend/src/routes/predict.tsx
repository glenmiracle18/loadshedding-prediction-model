import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { Zap, MapPin, Calendar, Droplets, BarChart3, Loader2, ArrowRight } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { predictionsApi } from '../lib/api'
import type { PredictionRequest, PredictionResponse } from '../lib/api'

export const Route = createFileRoute('/predict')({
  component: PredictPage,
})

function PredictPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null)

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    navigate({ to: '/auth/login' })
    return null
  }

  const form = useForm<PredictionRequest>({
    defaultValues: {
      location: '',
      datetime: '',
      humidity: undefined,
      demand_forecast: undefined,
    },
    onSubmit: async ({ value }) => {
      setLoading(true)
      setError(null)
      setPrediction(null)

      try {
        const response = await predictionsApi.createPrediction(value)
        
        if (response.success && response.data) {
          setPrediction(response.data)
        } else {
          // Check if it's a session expiry error
          if (response.error?.includes('Session expired')) {
            // Don't show error, user will be logged out automatically
            return
          }
          setError(response.error || 'Prediction failed')
        }
      } catch (err) {
        setError('Network error occurred')
      } finally {
        setLoading(false)
      }
    },
  })

  const getCurrentDateTime = () => {
    const now = new Date()
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
    return now.toISOString().slice(0, 16)
  }

  const getStageInfo = (stage: number) => {
    const stages = {
      0: { label: 'No Load Shedding', color: 'text-green-600', bgColor: 'bg-green-50', border: 'border-green-200' },
      1: { label: 'Stage 1', color: 'text-yellow-600', bgColor: 'bg-yellow-50', border: 'border-yellow-200' },
      2: { label: 'Stage 2', color: 'text-orange-600', bgColor: 'bg-orange-50', border: 'border-orange-200' },
      3: { label: 'Stage 3', color: 'text-red-600', bgColor: 'bg-red-50', border: 'border-red-200' },
      4: { label: 'Stage 4', color: 'text-red-700', bgColor: 'bg-red-50', border: 'border-red-300' },
      5: { label: 'Stage 5', color: 'text-red-800', bgColor: 'bg-red-50', border: 'border-red-300' },
      6: { label: 'Stage 6', color: 'text-red-900', bgColor: 'bg-red-50', border: 'border-red-400' },
      7: { label: 'Stage 7', color: 'text-red-900', bgColor: 'bg-red-50', border: 'border-red-400' },
      8: { label: 'Stage 8', color: 'text-red-900', bgColor: 'bg-red-50', border: 'border-red-400' },
    }
    return stages[stage as keyof typeof stages] || stages[0]
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Zap size={24} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Load Shedding Prediction</h1>
          <p className="text-gray-600">
            Get AI-powered predictions for load shedding stages
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Prediction Form */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Make Prediction</h2>
            
            <form
              onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                form.handleSubmit()
              }}
              className="space-y-6"
            >
              {/* Location */}
              <form.Field name="location">
                {(field) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin size={16} className="inline mr-2" />
                      City
                    </label>
                    <select
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select your city</option>
                      <option value="Cape Town">Cape Town</option>
                      <option value="Johannesburg">Johannesburg</option>
                      <option value="Durban">Durban</option>
                      <option value="Pretoria">Pretoria</option>
                      <option value="Port Elizabeth">Port Elizabeth</option>
                      <option value="Bloemfontein">Bloemfontein</option>
                    </select>
                  </div>
                )}
              </form.Field>

              {/* Date & Time */}
              <form.Field name="datetime">
                {(field) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar size={16} className="inline mr-2" />
                      Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      min={getCurrentDateTime()}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                )}
              </form.Field>

              {/* Essential Data */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <form.Field name="humidity">
                  {(field) => (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Droplets size={16} className="inline mr-2" />
                        Humidity (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={field.state.value || ''}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value ? Number(e.target.value) : undefined)}
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., 65"
                      />
                    </div>
                  )}
                </form.Field>

                <form.Field name="demand_forecast">
                  {(field) => (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <BarChart3 size={16} className="inline mr-2" />
                        Demand Forecast (MW)
                      </label>
                      <input
                        type="number"
                        step="100"
                        min="0"
                        value={field.state.value || ''}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value ? Number(e.target.value) : undefined)}
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., 32000"
                      />
                    </div>
                  )}
                </form.Field>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Getting Prediction...
                  </>
                ) : (
                  <>
                    <Zap size={20} />
                    Get Prediction
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Prediction Result */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Prediction Result</h2>
            
            {!prediction && !loading && (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <Zap size={24} className="text-gray-500" />
                </div>
                <p className="text-gray-600">Complete the form to get your prediction</p>
              </div>
            )}

            {loading && (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-4">
                  <Loader2 size={24} className="text-blue-600 animate-spin" />
                </div>
                <p className="text-gray-600">Processing your prediction...</p>
              </div>
            )}

            {prediction && (
              <div className="space-y-6">
                <div className={`p-6 rounded-lg border ${getStageInfo(prediction.predicted_stage).bgColor} ${getStageInfo(prediction.predicted_stage).border}`}>
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">
                      <span className={getStageInfo(prediction.predicted_stage).color}>
                        Stage {prediction.predicted_stage}
                      </span>
                    </div>
                    <h3 className={`text-xl font-semibold ${getStageInfo(prediction.predicted_stage).color}`}>
                      {getStageInfo(prediction.predicted_stage).label}
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm text-gray-600 mb-1">Confidence</h4>
                    <p className="text-2xl font-semibold text-gray-900">
                      {(prediction.confidence_score * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm text-gray-600 mb-1">Model Used</h4>
                    <p className="text-lg font-medium text-gray-900 capitalize">
                      {prediction.model_used.replace('_', ' ')}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm text-gray-600 mb-2">Details</h4>
                  <div className="space-y-1 text-sm text-gray-700">
                    <p><span className="text-gray-500">Location:</span> {prediction.location}</p>
                    <p><span className="text-gray-500">Date/Time:</span> {new Date(prediction.datetime).toLocaleString()}</p>
                    <p><span className="text-gray-500">Generated:</span> {new Date(prediction.created_at).toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => navigate({ to: '/history' })}
                    className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                  >
                    View History
                  </button>
                  <button
                    onClick={() => {
                      setPrediction(null)
                      form.reset()
                    }}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    New Prediction
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { History, MapPin, Calendar, Zap, Trash2, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { predictionsApi } from '../lib/api'
import type { PredictionResponse } from '../lib/api'

export const Route = createFileRoute('/history')({
  component: HistoryPage,
})

function HistoryPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [predictions, setPredictions] = useState<PredictionResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const pageSize = 10

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    navigate({ to: '/auth/login' })
    return null
  }

  useEffect(() => {
    loadPredictions()
  }, [currentPage])

  const loadPredictions = async () => {
    setLoading(true)
    try {
      const response = await predictionsApi.getUserPredictions(pageSize, currentPage * pageSize)
      if (response.success && response.data) {
        setPredictions(response.data)
        setHasMore(response.data.length === pageSize)
      }
    } catch (error) {
      console.error('Failed to load predictions:', error)
    } finally {
      setLoading(false)
    }
  }

  const deletePrediction = async (id: number) => {
    setDeleting(id)
    try {
      const response = await predictionsApi.deletePrediction(id)
      if (response.success) {
        setPredictions(predictions.filter(p => p.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete prediction:', error)
    } finally {
      setDeleting(null)
    }
  }

  const getStageInfo = (stage: number) => {
    const stages = {
      0: { label: 'No Load Shedding', color: 'text-green-400', bgColor: 'bg-green-400/10', border: 'border-green-400/20' },
      1: { label: 'Stage 1', color: 'text-yellow-400', bgColor: 'bg-yellow-400/10', border: 'border-yellow-400/20' },
      2: { label: 'Stage 2', color: 'text-orange-400', bgColor: 'bg-orange-400/10', border: 'border-orange-400/20' },
      3: { label: 'Stage 3', color: 'text-red-400', bgColor: 'bg-red-400/10', border: 'border-red-400/20' },
      4: { label: 'Stage 4', color: 'text-red-500', bgColor: 'bg-red-500/10', border: 'border-red-500/20' },
      5: { label: 'Stage 5', color: 'text-red-600', bgColor: 'bg-red-600/10', border: 'border-red-600/20' },
      6: { label: 'Stage 6', color: 'text-red-700', bgColor: 'bg-red-700/10', border: 'border-red-700/20' },
      7: { label: 'Stage 7', color: 'text-red-800', bgColor: 'bg-red-800/10', border: 'border-red-800/20' },
      8: { label: 'Stage 8', color: 'text-red-900', bgColor: 'bg-red-900/10', border: 'border-red-900/20' },
    }
    return stages[stage as keyof typeof stages] || stages[0]
  }

  if (loading && currentPage === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white border border-gray-200 rounded-full mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
          <p className="text-gray-600">Loading prediction history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-full">
                <History size={20} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Prediction History</h1>
            </div>
            <p className="text-gray-600">
              View and manage your load shedding prediction history
            </p>
          </div>
          
          <button
            onClick={() => navigate({ to: '/predict' })}
            className="flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Zap size={18} />
            New Prediction
          </button>
        </div>

        {predictions.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
              <History size={32} className="text-gray-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No predictions yet</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              You haven't made any load shedding predictions yet. Create your first prediction to get started.
            </p>
            <button
              onClick={() => navigate({ to: '/predict' })}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              Create First Prediction
            </button>
          </div>
        ) : (
          <>
            {/* Predictions Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Stage</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Location</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date/Time</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Confidence</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Model</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Created</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {predictions.map((prediction) => {
                      const stageInfo = getStageInfo(prediction.predicted_stage)
                      return (
                        <tr 
                          key={prediction.id} 
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${stageInfo.bgColor}`}>
                                <span className={`font-bold text-sm ${stageInfo.color}`}>
                                  {prediction.predicted_stage}
                                </span>
                              </div>
                              <div>
                                <p className={`font-medium text-sm ${stageInfo.color}`}>
                                  {stageInfo.label}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-gray-700">
                              <MapPin size={14} className="text-gray-500" />
                              <span className="text-sm">{prediction.location}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-gray-700">
                              <Calendar size={14} className="text-gray-500" />
                              <div className="text-sm">
                                <p>{new Date(prediction.datetime).toLocaleDateString()}</p>
                                <p className="text-gray-500 text-xs">
                                  {new Date(prediction.datetime).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <p className="text-gray-900 font-medium">
                                {(prediction.confidence_score * 100).toFixed(1)}%
                              </p>
                              <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full transition-all"
                                  style={{ width: `${prediction.confidence_score * 100}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-700 capitalize">
                              {prediction.model_used.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-600">
                              {new Date(prediction.created_at).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => deletePrediction(prediction.id)}
                              disabled={deleting === prediction.id}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Delete prediction"
                            >
                              {deleting === prediction.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                              ) : (
                                <Trash2 size={16} />
                              )}
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6 bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600">
                Showing {currentPage * pageSize + 1} to {currentPage * pageSize + predictions.length} predictions
              </p>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0 || loading}
                  className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>
                
                <span className="px-4 py-2 text-sm text-gray-700">
                  Page {currentPage + 1}
                </span>
                
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={!hasMore || loading}
                  className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
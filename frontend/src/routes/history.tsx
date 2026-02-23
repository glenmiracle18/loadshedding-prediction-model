import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { History, MapPin, Calendar, Zap, Trash2, Filter, ChevronLeft, ChevronRight, Eye, ChevronUp, ChevronDown, X } from 'lucide-react'
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
  const [pageSize, setPageSize] = useState(10)
  const [customPageSize, setCustomPageSize] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [selectedPrediction, setSelectedPrediction] = useState<PredictionResponse | null>(null)
  const [sortField, setSortField] = useState<string>('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    navigate({ to: '/auth/login' })
    return null
  }

  useEffect(() => {
    loadPredictions()
  }, [currentPage, pageSize, sortField, sortOrder])

  const loadPredictions = async () => {
    setLoading(true)
    try {
      const response = await predictionsApi.getUserPredictions(pageSize, currentPage * pageSize)
      if (response.success && response.data) {
        let data = response.data
        
        // Apply sorting
        if (sortField) {
          data = [...data].sort((a, b) => {
            let aVal: any, bVal: any
            
            switch (sortField) {
              case 'stage':
                aVal = a.predicted_stage
                bVal = b.predicted_stage
                break
              case 'location':
                aVal = a.location.toLowerCase()
                bVal = b.location.toLowerCase()
                break
              case 'datetime':
                aVal = new Date(a.datetime).getTime()
                bVal = new Date(b.datetime).getTime()
                break
              case 'confidence':
                aVal = a.confidence_score
                bVal = b.confidence_score
                break
              case 'model':
                aVal = a.model_used.toLowerCase()
                bVal = b.model_used.toLowerCase()
                break
              case 'created':
                aVal = new Date(a.created_at).getTime()
                bVal = new Date(b.created_at).getTime()
                break
              default:
                return 0
            }
            
            if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
            if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
            return 0
          })
        }
        
        setPredictions(data)
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

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
    setCurrentPage(0)
  }

  const handlePageSizeChange = (newSize: number | 'custom') => {
    if (newSize === 'custom') {
      setShowCustomInput(true)
    } else {
      setPageSize(newSize)
      setShowCustomInput(false)
      setCurrentPage(0)
    }
  }

  const handleCustomPageSizeSubmit = () => {
    const size = parseInt(customPageSize)
    if (size > 0 && size <= 1000) {
      setPageSize(size)
      setCurrentPage(0)
      setShowCustomInput(false)
      setCustomPageSize('')
    }
  }

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <ChevronUp size={14} className="opacity-0 group-hover:opacity-50" />
    return sortOrder === 'asc' ? 
      <ChevronUp size={14} className="text-blue-600" /> : 
      <ChevronDown size={14} className="text-blue-600" />
  }

  const DetailModal = ({ prediction, onClose }: { prediction: PredictionResponse, onClose: () => void }) => {
    const stageInfo = getStageInfo(prediction.predicted_stage)
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Prediction Details</h2>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Stage Result */}
            <div className={`p-6 rounded-lg border ${stageInfo.bgColor} ${stageInfo.border}`}>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">
                  <span className={stageInfo.color}>
                    Stage {prediction.predicted_stage}
                  </span>
                </div>
                <h3 className={`text-xl font-semibold ${stageInfo.color}`}>
                  {stageInfo.label}
                </h3>
                <p className="text-gray-600 mt-2">
                  Confidence: {(prediction.confidence_score * 100).toFixed(1)}%
                </p>
              </div>
            </div>
            
            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Location & Time</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <MapPin size={14} />
                      <span>{prediction.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Calendar size={14} />
                      <div>
                        <p>{new Date(prediction.datetime).toLocaleDateString()}</p>
                        <p className="text-gray-500 text-xs">
                          {new Date(prediction.datetime).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Model Information</h4>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-700">
                      <span className="text-gray-500">Model Used:</span>
                      <span className="ml-2 capitalize">{prediction.model_used.replace('_', ' ')}</span>
                    </div>
                    <div className="text-sm text-gray-700">
                      <span className="text-gray-500">Prediction ID:</span>
                      <span className="ml-2 font-mono">#{prediction.id}</span>
                    </div>
                    <div className="text-sm text-gray-700">
                      <span className="text-gray-500">Created:</span>
                      <span className="ml-2">{new Date(prediction.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Input Parameters</h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    {prediction.humidity !== null && (
                      <div>
                        <span className="text-gray-500">Humidity:</span>
                        <span className="ml-2">{prediction.humidity}%</span>
                      </div>
                    )}
                    {prediction.temperature !== null && (
                      <div>
                        <span className="text-gray-500">Temperature:</span>
                        <span className="ml-2">{prediction.temperature}°C</span>
                      </div>
                    )}
                    {prediction.wind_speed !== null && (
                      <div>
                        <span className="text-gray-500">Wind Speed:</span>
                        <span className="ml-2">{prediction.wind_speed} km/h</span>
                      </div>
                    )}
                    {prediction.demand_forecast !== null && (
                      <div>
                        <span className="text-gray-500">Demand Forecast:</span>
                        <span className="ml-2">{prediction.demand_forecast?.toLocaleString()} MW</span>
                      </div>
                    )}
                    {prediction.generation_capacity !== null && (
                      <div>
                        <span className="text-gray-500">Generation Capacity:</span>
                        <span className="ml-2">{prediction.generation_capacity?.toLocaleString()} MW</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Confidence Score</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Accuracy</span>
                      <span className="font-medium">{(prediction.confidence_score * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-blue-600 h-3 rounded-full transition-all"
                        style={{ width: `${prediction.confidence_score * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  onClose()
                  navigate({ 
                    to: '/costs', 
                    search: { 
                      stage: prediction.predicted_stage,
                      location: prediction.location 
                    } 
                  })
                }}
                className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
              >
                Calculate Costs
              </button>
              <button
                onClick={() => deletePrediction(prediction.id)}
                className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    )
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
                      <th className="px-6 py-4 text-left">
                        <button
                          onClick={() => handleSort('stage')}
                          className="group flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-gray-900"
                        >
                          Stage
                          <SortIcon field="stage" />
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left">
                        <button
                          onClick={() => handleSort('location')}
                          className="group flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-gray-900"
                        >
                          Location
                          <SortIcon field="location" />
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left">
                        <button
                          onClick={() => handleSort('datetime')}
                          className="group flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-gray-900"
                        >
                          Date/Time
                          <SortIcon field="datetime" />
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left">
                        <button
                          onClick={() => handleSort('confidence')}
                          className="group flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-gray-900"
                        >
                          Confidence
                          <SortIcon field="confidence" />
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left">
                        <button
                          onClick={() => handleSort('model')}
                          className="group flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-gray-900"
                        >
                          Model
                          <SortIcon field="model" />
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left">
                        <button
                          onClick={() => handleSort('created')}
                          className="group flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-gray-900"
                        >
                          Created
                          <SortIcon field="created" />
                        </button>
                      </th>
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
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setSelectedPrediction(prediction)}
                                className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                title="View details"
                              >
                                <Eye size={16} />
                              </button>
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
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination with Controls */}
            <div className="mt-6 bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                {/* Left side - Row count info and controls */}
                <div className="flex items-center gap-6 flex-wrap">
                  <p className="text-sm text-gray-600">
                    Showing {currentPage * pageSize + 1} to {currentPage * pageSize + predictions.length} of {predictions.length} predictions
                  </p>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Show:</span>
                    <div className="flex items-center gap-1">
                      {[10, 20, 50].map((size) => (
                        <button
                          key={size}
                          onClick={() => handlePageSizeChange(size)}
                          className={`px-3 py-1 text-sm rounded transition-colors ${
                            pageSize === size && !showCustomInput
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                      <button
                        onClick={() => handlePageSizeChange('custom')}
                        className={`px-3 py-1 text-sm rounded transition-colors ${
                          showCustomInput
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Custom
                      </button>
                      {showCustomInput && (
                        <div className="flex items-center gap-1 ml-2">
                          <input
                            type="number"
                            min="1"
                            max="1000"
                            value={customPageSize}
                            onChange={(e) => setCustomPageSize(e.target.value)}
                            className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="#"
                          />
                          <button
                            onClick={handleCustomPageSizeSubmit}
                            className="px-2 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                          >
                            ✓
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Right side - Pagination controls */}
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
            </div>
          </>
        )}
        
        {/* Detail Modal */}
        {selectedPrediction && (
          <DetailModal 
            prediction={selectedPrediction} 
            onClose={() => setSelectedPrediction(null)} 
          />
        )}
      </div>
    </div>
  )
}
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from '@tanstack/react-form'
import { useState, useEffect, Suspense } from 'react'
import { Calculator, Zap, DollarSign, TrendingUp, Fuel, Clock, CheckCircle, XCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

interface BusinessParameters {
  kva_requirement: number
  diesel_price_per_litre: number
  hourly_revenue: number
  fuel_consumption_rate: number
}

interface CostComparison {
  generator_option: {
    fuel_cost: number
    total_cost: number
    description: string
  }
  pause_option: {
    productivity_loss: number
    total_cost: number
    description: string
  }
  recommendation: 'generator' | 'pause'
  savings: number
  duration_hours: number
  stage: number
}

class CostCalculator {
  static calculateCosts(
    stage: number,
    durationHours: number,
    params: BusinessParameters
  ): CostComparison {
    // Generator option calculation
    const fuelCost = durationHours * params.fuel_consumption_rate * params.diesel_price_per_litre
    const generatorTotalCost = fuelCost

    // Pause operations option calculation
    const productivityLoss = durationHours * params.hourly_revenue
    const pauseTotalCost = productivityLoss

    // Determine recommendation
    const recommendation = generatorTotalCost < pauseTotalCost ? 'generator' : 'pause'
    const savings = Math.abs(generatorTotalCost - pauseTotalCost)

    return {
      generator_option: {
        fuel_cost: fuelCost,
        total_cost: generatorTotalCost,
        description: `Run generator for ${durationHours}h`
      },
      pause_option: {
        productivity_loss: productivityLoss,
        total_cost: pauseTotalCost,
        description: `Pause operations for ${durationHours}h`
      },
      recommendation,
      savings,
      duration_hours: durationHours,
      stage
    }
  }

  static compareOptions(
    stage: number,
    durationHours: number,
    params: BusinessParameters
  ): CostComparison {
    return this.calculateCosts(stage, durationHours, params)
  }
}

function CostsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated } = useAuth()
  const [comparison, setComparison] = useState<CostComparison | null>(null)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }
  }, [isAuthenticated, router])

  // Get duration from load shedding stage
  const getStageDuration = (stage: number): number => {
    const durations = {
      0: 0,    // No load shedding
      1: 2.5,  // 2.5 hours
      2: 2.5,  // 2.5 hours  
      3: 4,    // 4 hours
      4: 4,    // 4 hours
      5: 8,    // 8 hours
      6: 8,    // 8 hours
      7: 12,   // 12 hours
      8: 12,   // 12 hours
    }
    return durations[stage as keyof typeof durations] || 2.5
  }

  const form = useForm({
    defaultValues: {
      kva_requirement: 10,
      diesel_price_per_litre: 24.50,
      hourly_revenue: 1500,
      fuel_consumption_rate: 3.5, // litres per hour
    },
    onSubmit: async ({ value }: { value: BusinessParameters }) => {
      const stage = searchParams.get('stage') ? Number(searchParams.get('stage')) : 1
      const duration = searchParams.get('duration') ? Number(searchParams.get('duration')) : getStageDuration(stage)
      
      const result = CostCalculator.compareOptions(stage, duration, value)
      setComparison(result)
    },
  })

  // Auto-calculate when search params change or on mount
  useEffect(() => {
    if (!isAuthenticated) return

    const stage = searchParams.get('stage') ? Number(searchParams.get('stage')) : 1
    const duration = searchParams.get('duration') ? Number(searchParams.get('duration')) : getStageDuration(stage)
    
    const defaultParams: BusinessParameters = {
      kva_requirement: 10,
      diesel_price_per_litre: 24.50,
      hourly_revenue: 1500,
      fuel_consumption_rate: 3.5,
    }
    
    const result = CostCalculator.compareOptions(stage, duration, defaultParams)
    setComparison(result)
  }, [searchParams, isAuthenticated])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount)
  }

  const getStageColor = (stage: number) => {
    if (stage <= 1) return 'text-green-600'
    if (stage <= 2) return 'text-yellow-600'
    if (stage <= 4) return 'text-orange-600'
    return 'text-red-600'
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              <Calculator size={20} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Load Shedding Cost Calculator</h1>
          </div>
          <p className="text-gray-600">
            Calculate the financial impact of load shedding and compare your options
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Business Parameters</h2>
            
            <form
              onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                form.handleSubmit()
              }}
              className="space-y-6"
            >
              <form.Field name="kva_requirement">
                {(field) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Zap size={16} className="inline mr-2" />
                      Power Requirement (kVA)
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="0.1"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(Number(e.target.value))}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g., 10"
                    />
                  </div>
                )}
              </form.Field>

              <form.Field name="diesel_price_per_litre">
                {(field) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Fuel size={16} className="inline mr-2" />
                      Diesel Price (ZAR per litre)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(Number(e.target.value))}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g., 24.50"
                    />
                  </div>
                )}
              </form.Field>

              <form.Field name="hourly_revenue">
                {(field) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <DollarSign size={16} className="inline mr-2" />
                      Hourly Revenue (ZAR)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(Number(e.target.value))}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g., 1500"
                    />
                  </div>
                )}
              </form.Field>

              <form.Field name="fuel_consumption_rate">
                {(field) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <TrendingUp size={16} className="inline mr-2" />
                      Generator Consumption (L/hour)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(Number(e.target.value))}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g., 3.5"
                    />
                  </div>
                )}
              </form.Field>

              <button
                type="submit"
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Calculator size={20} />
                Calculate Costs
              </button>
            </form>
          </div>

          {/* Results */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Cost Analysis</h2>
            
            {comparison ? (
              <div className="space-y-6">
                {/* Stage Info */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm text-gray-600">Load Shedding Stage</h3>
                      <p className={`text-2xl font-bold ${getStageColor(comparison.stage)}`}>
                        Stage {comparison.stage}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm text-gray-600">Duration</h3>
                      <p className="text-2xl font-bold text-gray-900 flex items-center gap-1">
                        <Clock size={20} />
                        {comparison.duration_hours}h
                      </p>
                    </div>
                  </div>
                </div>

                {/* Options Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Generator Option */}
                  <div className={`p-4 border rounded-lg ${
                    comparison.recommendation === 'generator' 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">Generator</h4>
                      {comparison.recommendation === 'generator' && (
                        <CheckCircle size={20} className="text-green-600" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{comparison.generator_option.description}</p>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">
                        Fuel Cost: {formatCurrency(comparison.generator_option.fuel_cost)}
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        Total: {formatCurrency(comparison.generator_option.total_cost)}
                      </p>
                    </div>
                  </div>

                  {/* Pause Option */}
                  <div className={`p-4 border rounded-lg ${
                    comparison.recommendation === 'pause' 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">Pause Operations</h4>
                      {comparison.recommendation === 'pause' && (
                        <CheckCircle size={20} className="text-green-600" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{comparison.pause_option.description}</p>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">
                        Revenue Loss: {formatCurrency(comparison.pause_option.productivity_loss)}
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        Total: {formatCurrency(comparison.pause_option.total_cost)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Recommendation */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <CheckCircle size={20} />
                    Recommendation
                  </h4>
                  <p className="text-blue-800">
                    {comparison.recommendation === 'generator' ? 
                      'Use a generator to maintain operations' : 
                      'Pause operations during load shedding'
                    }
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    Potential savings: {formatCurrency(comparison.savings)}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => router.push('/predict')}
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    New Prediction
                  </button>
                  <button
                    onClick={() => router.push('/history')}
                    className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  >
                    View History
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calculator size={24} className="text-gray-500" />
                </div>
                <p className="text-gray-600">Enter your business parameters to calculate costs</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CostsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading cost calculator...</p>
        </div>
      </div>
    }>
      <CostsPageContent />
    </Suspense>
  )
}
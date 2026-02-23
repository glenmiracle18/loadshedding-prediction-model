import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { useState, useEffect } from 'react'
import { Calculator, Zap, DollarSign, TrendingUp, Fuel, Clock, CheckCircle, XCircle } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export const Route = createFileRoute('/costs')({
  component: CostsPage,
  validateSearch: (search) => {
    return {
      stage: search?.stage ? Number(search.stage) : undefined,
      duration: search?.duration ? Number(search.duration) : undefined,
      location: search?.location as string | undefined,
    }
  }
})

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

function CostsPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const search = useSearch({ from: '/costs' })
  const [comparison, setComparison] = useState<CostComparison | null>(null)

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    navigate({ to: '/auth/login' })
    return null
  }

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

  const form = useForm<BusinessParameters>({
    defaultValues: {
      kva_requirement: 10,
      diesel_price_per_litre: 24.50,
      hourly_revenue: 1500,
      fuel_consumption_rate: 3.5, // litres per hour
    },
    onSubmit: async ({ value }) => {
      const stage = search.stage || 1
      const duration = search.duration || getStageDuration(stage)
      
      const result = CostCalculator.compareOptions(stage, duration, value)
      setComparison(result)
    },
  })

  // Auto-calculate when search params change
  useEffect(() => {
    if (search.stage !== undefined) {
      const defaultParams: BusinessParameters = {
        kva_requirement: 10,
        diesel_price_per_litre: 24.50,
        hourly_revenue: 1500,
        fuel_consumption_rate: 3.5,
      }
      
      const stage = search.stage || 1
      const duration = search.duration || getStageDuration(stage)
      const result = CostCalculator.compareOptions(stage, duration, defaultParams)
      setComparison(result)
      
      // Update form with default values
      form.setFieldValue('kva_requirement', defaultParams.kva_requirement)
      form.setFieldValue('diesel_price_per_litre', defaultParams.diesel_price_per_litre)
      form.setFieldValue('hourly_revenue', defaultParams.hourly_revenue)
      form.setFieldValue('fuel_consumption_rate', defaultParams.fuel_consumption_rate)
    }
  }, [search.stage, search.duration])

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Calculator size={24} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Load Shedding Cost Calculator</h1>
          <p className="text-gray-600">
            Compare costs: Run generator vs. pause operations during predicted outages
          </p>
          {search.stage !== undefined && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg inline-block">
              <p className="text-sm text-blue-800">
                <Zap size={14} className="inline mr-1" />
                Prediction: Stage {search.stage} • {getStageDuration(search.stage || 1)}h duration
                {search.location && ` • ${search.location}`}
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Business Parameters */}
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
              {/* kVA Requirement */}
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
                      step="0.5"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(Number(e.target.value))}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">Generator size needed for your operations</p>
                  </div>
                )}
              </form.Field>

              {/* Diesel Price */}
              <form.Field name="diesel_price_per_litre">
                {(field) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Fuel size={16} className="inline mr-2" />
                      Diesel Price (R/litre)
                    </label>
                    <input
                      type="number"
                      min="10"
                      step="0.10"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(Number(e.target.value))}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">Current diesel price at your location</p>
                  </div>
                )}
              </form.Field>

              {/* Hourly Revenue */}
              <form.Field name="hourly_revenue">
                {(field) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <DollarSign size={16} className="inline mr-2" />
                      Hourly Revenue (R/hour)
                    </label>
                    <input
                      type="number"
                      min="100"
                      step="100"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(Number(e.target.value))}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">Revenue lost per hour when operations are paused</p>
                  </div>
                )}
              </form.Field>

              {/* Fuel Consumption Rate */}
              <form.Field name="fuel_consumption_rate">
                {(field) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Fuel size={16} className="inline mr-2" />
                      Fuel Consumption (litres/hour)
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="0.1"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(Number(e.target.value))}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">Generator fuel consumption per hour</p>
                  </div>
                )}
              </form.Field>

              <button
                type="submit"
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Calculator size={20} />
                Recalculate Comparison
              </button>
            </form>
          </div>

          {/* Cost Comparison */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Cost Comparison</h2>
            
            {!comparison && !search.stage && (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <Calculator size={24} className="text-gray-500" />
                </div>
                <p className="text-gray-600 mb-4">Start with a load shedding prediction</p>
                <button
                  onClick={() => navigate({ to: '/predict' })}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  Make Prediction
                </button>
              </div>
            )}

            {comparison && (
              <div className="space-y-6">
                {/* Scenario Info */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={16} className="text-gray-600" />
                    <h3 className="font-semibold text-gray-900">Outage Scenario</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Stage {comparison.stage} • {comparison.duration_hours} hours
                  </p>
                </div>

                {/* Option Comparison */}
                <div className="grid grid-cols-1 gap-4">
                  {/* Generator Option */}
                  <div className={`p-4 rounded-lg border-2 ${comparison.recommendation === 'generator' 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200 bg-white'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Fuel size={18} className={comparison.recommendation === 'generator' ? 'text-green-600' : 'text-gray-600'} />
                        <h3 className="font-semibold text-gray-900">Run Generator</h3>
                        {comparison.recommendation === 'generator' && (
                          <CheckCircle size={16} className="text-green-600" />
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">
                          R{comparison.generator_option.total_cost.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{comparison.generator_option.description}</p>
                    <div className="text-xs text-gray-500">
                      Fuel cost: R{comparison.generator_option.fuel_cost.toLocaleString()}
                    </div>
                  </div>

                  {/* Pause Operations Option */}
                  <div className={`p-4 rounded-lg border-2 ${comparison.recommendation === 'pause' 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200 bg-white'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <XCircle size={18} className={comparison.recommendation === 'pause' ? 'text-green-600' : 'text-gray-600'} />
                        <h3 className="font-semibold text-gray-900">Pause Operations</h3>
                        {comparison.recommendation === 'pause' && (
                          <CheckCircle size={16} className="text-green-600" />
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">
                          R{comparison.pause_option.total_cost.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{comparison.pause_option.description}</p>
                    <div className="text-xs text-gray-500">
                      Revenue loss: R{comparison.pause_option.productivity_loss.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Recommendation */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={18} className="text-blue-600" />
                    <h3 className="font-semibold text-gray-900">Recommendation</h3>
                  </div>
                  <p className="text-blue-800 mb-2">
                    <strong>
                      {comparison.recommendation === 'generator' 
                        ? 'Run your generator' 
                        : 'Pause operations'
                      }
                    </strong>
                  </p>
                  <p className="text-sm text-blue-700">
                    You'll save <strong>R{comparison.savings.toLocaleString()}</strong> compared to the alternative
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => navigate({ to: '/predict' })}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    New Prediction
                  </button>
                  <button
                    onClick={() => navigate({ to: '/history' })}
                    className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                  >
                    View History
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
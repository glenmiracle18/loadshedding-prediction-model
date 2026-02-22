import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { Calculator, Home, Zap, DollarSign, TrendingUp, Battery, Fuel, Wrench } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export const Route = createFileRoute('/costs')({
  component: CostsPage,
})

interface CostCalculationRequest {
  location: string
  household_size: number
  monthly_consumption: number
  backup_solution?: string
}

interface CostResult {
  backup_cost: number
  fuel_cost_monthly?: number
  equipment_cost?: number
  maintenance_cost_yearly?: number
  total_yearly_cost: number
  potential_savings?: number
  payback_period_months?: number
}

function CostsPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<CostResult | null>(null)

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    navigate({ to: '/auth/login' })
    return null
  }

  const form = useForm<CostCalculationRequest>({
    defaultValues: {
      location: '',
      household_size: 2,
      monthly_consumption: 500,
      backup_solution: 'generator',
    },
    onSubmit: async ({ value }) => {
      setLoading(true)
      setError(null)
      setResult(null)

      try {
        // Simulate cost calculation (replace with actual API call)
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        const baseEquipmentCosts = {
          generator: 15000,
          ups: 8000,
          solar: 45000,
          battery_bank: 25000,
        }

        const fuelCostsMonthly = {
          generator: value.monthly_consumption * 0.08, // R0.08 per kWh
          ups: 0,
          solar: 0,
          battery_bank: 0,
        }

        const maintenanceYearly = {
          generator: 2400,
          ups: 800,
          solar: 1200,
          battery_bank: 1000,
        }

        const solution = value.backup_solution as keyof typeof baseEquipmentCosts
        const equipmentCost = baseEquipmentCosts[solution] * (value.household_size / 2)
        const fuelCost = fuelCostsMonthly[solution] * value.household_size
        const maintenanceCost = maintenanceYearly[solution]
        const totalYearly = equipmentCost * 0.15 + (fuelCost * 12) + maintenanceCost
        const potentialSavings = value.monthly_consumption * 12 * 0.12 // Estimated savings from avoiding load shedding
        const paybackPeriod = equipmentCost / (potentialSavings / 12)

        setResult({
          backup_cost: equipmentCost,
          fuel_cost_monthly: fuelCost > 0 ? fuelCost : undefined,
          equipment_cost: equipmentCost,
          maintenance_cost_yearly: maintenanceCost,
          total_yearly_cost: totalYearly,
          potential_savings: potentialSavings,
          payback_period_months: Math.round(paybackPeriod),
        })
      } catch (err) {
        setError('Calculation failed. Please try again.')
      } finally {
        setLoading(false)
      }
    },
  })

  const backupSolutions = [
    { value: 'generator', label: 'Generator', description: 'Diesel/Gas generator for backup power' },
    { value: 'ups', label: 'UPS System', description: 'Uninterruptible power supply with batteries' },
    { value: 'solar', label: 'Solar System', description: 'Solar panels with battery storage' },
    { value: 'battery_bank', label: 'Battery Bank', description: 'Large battery system with inverter' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Calculator size={24} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cost Calculator</h1>
          <p className="text-gray-600">
            Calculate the costs and benefits of load shedding backup solutions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calculator Form */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Calculate Your Costs</h2>
            
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
                      <Home size={16} className="inline mr-2" />
                      Location
                    </label>
                    <select
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select your area</option>
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

              {/* Household Size */}
              <form.Field name="household_size">
                {(field) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Home size={16} className="inline mr-2" />
                      Household Size
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(Number(e.target.value))}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">Number of people in your household</p>
                  </div>
                )}
              </form.Field>

              {/* Monthly Consumption */}
              <form.Field name="monthly_consumption">
                {(field) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Zap size={16} className="inline mr-2" />
                      Monthly Consumption (kWh)
                    </label>
                    <input
                      type="number"
                      min="100"
                      step="50"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(Number(e.target.value))}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">Check your electricity bill for this information</p>
                  </div>
                )}
              </form.Field>

              {/* Backup Solution */}
              <form.Field name="backup_solution">
                {(field) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      <Battery size={16} className="inline mr-2" />
                      Backup Solution
                    </label>
                    <div className="space-y-3">
                      {backupSolutions.map((solution) => (
                        <label
                          key={solution.value}
                          className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                            field.state.value === solution.value
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="backup_solution"
                            value={solution.value}
                            checked={field.state.value === solution.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            className="mt-0.5 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="ml-3">
                            <div className="font-medium text-gray-900">{solution.label}</div>
                            <div className="text-sm text-gray-600">{solution.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </form.Field>

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
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Calculating...
                  </>
                ) : (
                  <>
                    <Calculator size={20} />
                    Calculate Costs
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Results */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Cost Analysis</h2>
            
            {!result && !loading && (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <Calculator size={24} className="text-gray-500" />
                </div>
                <p className="text-gray-600">Complete the form to see your cost analysis</p>
              </div>
            )}

            {loading && (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
                <p className="text-gray-600">Calculating your costs...</p>
              </div>
            )}

            {result && (
              <div className="space-y-6">
                {/* Equipment Cost */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Battery className="text-blue-600" size={20} />
                    <h3 className="font-semibold text-gray-900">Equipment Cost</h3>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    R{result.equipment_cost?.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">One-time investment</p>
                </div>

                {/* Monthly/Yearly Costs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.fuel_cost_monthly && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Fuel size={16} className="text-gray-600" />
                        <h4 className="text-sm font-medium text-gray-700">Monthly Fuel</h4>
                      </div>
                      <p className="text-xl font-semibold text-gray-900">
                        R{result.fuel_cost_monthly.toLocaleString()}
                      </p>
                    </div>
                  )}

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Wrench size={16} className="text-gray-600" />
                      <h4 className="text-sm font-medium text-gray-700">Yearly Maintenance</h4>
                    </div>
                    <p className="text-xl font-semibold text-gray-900">
                      R{result.maintenance_cost_yearly?.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Total Yearly Cost */}
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <DollarSign className="text-yellow-600" size={20} />
                    <h3 className="font-semibold text-gray-900">Total Yearly Cost</h3>
                  </div>
                  <p className="text-2xl font-bold text-yellow-600">
                    R{result.total_yearly_cost.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Including all operating costs</p>
                </div>

                {/* Savings & Payback */}
                {result.potential_savings && result.payback_period_months && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp size={16} className="text-green-600" />
                        <h4 className="text-sm font-medium text-gray-700">Potential Savings</h4>
                      </div>
                      <p className="text-xl font-semibold text-green-600">
                        R{result.potential_savings.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-600">Per year</p>
                    </div>

                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Calculator size={16} className="text-purple-600" />
                        <h4 className="text-sm font-medium text-gray-700">Payback Period</h4>
                      </div>
                      <p className="text-xl font-semibold text-purple-600">
                        {result.payback_period_months} months
                      </p>
                      <p className="text-xs text-gray-600">Break-even time</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => navigate({ to: '/predict' })}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Make Prediction
                  </button>
                  <button
                    onClick={() => {
                      setResult(null)
                      form.reset()
                    }}
                    className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                  >
                    New Calculation
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
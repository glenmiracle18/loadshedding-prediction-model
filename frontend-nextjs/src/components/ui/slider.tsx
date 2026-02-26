import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface SliderProps {
  id?: string
  value?: number[]
  onValueChange?: (value: number[]) => void
  onBlur?: () => void
  min?: number
  max?: number
  step?: number
  className?: string
}

const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ 
    id, 
    value = [0], 
    onValueChange, 
    onBlur, 
    min = 0, 
    max = 100, 
    step = 1, 
    className,
    ...props 
  }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = [Number(e.target.value)]
      onValueChange?.(newValue)
    }
    
    return (
      <input
        id={id}
        ref={ref}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value[0]}
        onChange={handleChange}
        onBlur={onBlur}
        className={cn(
          'w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer',
          '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer',
          '[&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-blue-600 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:cursor-pointer',
          className
        )}
        {...props}
      />
    )
  }
)

Slider.displayName = 'Slider'

export { Slider }
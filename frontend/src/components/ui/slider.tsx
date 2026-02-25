import { forwardRef } from 'react'

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
    className = '',
    ...props 
  }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = [Number(e.target.value)]
      onValueChange?.(newValue)
    }
    
    const classes = `w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider ${className}`
    
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
        className={classes}
        {...props}
      />
    )
  }
)

Slider.displayName = 'Slider'

export { Slider }
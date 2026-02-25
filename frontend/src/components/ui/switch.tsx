import { forwardRef } from 'react'

export interface SwitchProps {
  id?: string
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  onBlur?: () => void
  disabled?: boolean
  className?: string
}

const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ 
    id, 
    checked = false, 
    onCheckedChange, 
    onBlur, 
    disabled = false, 
    className = '',
    ...props 
  }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onCheckedChange?.(e.target.checked)
    }
    
    const baseClasses = 'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50'
    const stateClasses = checked 
      ? 'bg-primary' 
      : 'bg-input'
    
    const thumbClasses = 'pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform'
    const thumbPosition = checked ? 'translate-x-5' : 'translate-x-0'
    
    return (
      <label className={`relative ${className}`}>
        <input
          id={id}
          ref={ref}
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          onBlur={onBlur}
          disabled={disabled}
          className="sr-only"
          {...props}
        />
        <div className={`${baseClasses} ${stateClasses}`}>
          <div className={`${thumbClasses} ${thumbPosition}`} />
        </div>
      </label>
    )
  }
)

Switch.displayName = 'Switch'

export { Switch }
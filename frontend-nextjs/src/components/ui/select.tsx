import { forwardRef, createContext, useContext } from 'react'
import { cn } from '@/lib/utils'

interface SelectContextValue {
  value?: string
  onValueChange?: (value: string) => void
  name?: string
}

const SelectContext = createContext<SelectContextValue>({})

export interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  name?: string
  children: React.ReactNode
}

const Select = ({ value, onValueChange, name, children }: SelectProps) => {
  return (
    <SelectContext.Provider value={{ value, onValueChange, name }}>
      {children}
    </SelectContext.Provider>
  )
}

export interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const SelectTrigger = forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const { value } = useContext(SelectContext)
    
    return (
      <div className="relative">
        <button
          type="button"
          ref={ref}
          className={cn(
            'flex h-11 w-full items-center justify-between rounded border-2 border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50',
            className
          )}
          {...props}
        >
          {children}
        </button>
      </div>
    )
  }
)

SelectTrigger.displayName = 'SelectTrigger'

export interface SelectValueProps {
  placeholder?: string
}

const SelectValue = ({ placeholder }: SelectValueProps) => {
  const { value } = useContext(SelectContext)
  return (
    <span className={value ? 'text-slate-800 font-medium' : 'text-slate-400'}>
      {value || placeholder}
    </span>
  )
}

export interface SelectContentProps {
  className?: string
  children: React.ReactNode
}

const SelectContent = ({ className, children }: SelectContentProps) => {
  return (
    <div className={cn(
      'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded border-2 border-slate-200 bg-white text-slate-800',
      className
    )}>
      {children}
    </div>
  )
}

export interface SelectGroupProps {
  children: React.ReactNode
}

const SelectGroup = ({ children }: SelectGroupProps) => {
  return <div className="p-1 w-full">{children}</div>
}

export interface SelectLabelProps {
  className?: string
  children: React.ReactNode
}

const SelectLabel = ({ className, children }: SelectLabelProps) => {
  return (
    <div className={cn('py-2 px-4 text-sm font-semibold text-slate-600', className)}>
      {children}
    </div>
  )
}

export interface SelectItemProps {
  value: string
  className?: string
  children: React.ReactNode
}

const SelectItem = ({ value, className, children }: SelectItemProps) => {
  const { onValueChange } = useContext(SelectContext)
  
  return (
    <div
      className={cn(
        'relative flex w-full cursor-default select-none items-center rounded-lg py-2.5 px-4 text-sm font-medium outline-none hover:bg-amber-50 hover:text-amber-800 focus:bg-amber-50 focus:text-amber-800 transition-all duration-150',
        className
      )}
      onClick={() => onValueChange?.(value)}
    >
      {children}
    </div>
  )
}

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
}
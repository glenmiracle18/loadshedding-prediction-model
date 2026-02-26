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
            'flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50',
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
    <span className={value ? 'text-black' : 'text-gray-400'}>
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
      'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white text-gray-900 shadow-md',
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
    <div className={cn('py-1.5 pl-8 pr-2 text-sm font-semibold', className)}>
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
        'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900',
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
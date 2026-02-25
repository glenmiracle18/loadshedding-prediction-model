import { forwardRef, createContext, useContext } from 'react'

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
  ({ className = '', children, ...props }, ref) => {
    const { value } = useContext(SelectContext)
    const classes = `flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`
    
    return (
      <div className="relative">
        <button
          type="button"
          ref={ref}
          className={classes}
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
  return <span>{value || placeholder}</span>
}

export interface SelectContentProps {
  className?: string
  children: React.ReactNode
}

const SelectContent = ({ className = '', children }: SelectContentProps) => {
  const classes = `relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md ${className}`
  
  return (
    <div className={classes}>
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

const SelectLabel = ({ className = '', children }: SelectLabelProps) => {
  const classes = `py-1.5 pl-8 pr-2 text-sm font-semibold ${className}`
  return <div className={classes}>{children}</div>
}

export interface SelectItemProps {
  value: string
  className?: string
  children: React.ReactNode
}

const SelectItem = ({ value, className = '', children }: SelectItemProps) => {
  const { onValueChange } = useContext(SelectContext)
  const classes = `relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ${className}`
  
  return (
    <div
      className={classes}
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
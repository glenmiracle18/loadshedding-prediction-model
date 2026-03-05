import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', type = 'text', ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-11 w-full rounded border-2 border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 placeholder:text-slate-400 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/20 focus-visible:border-amber-500 hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'

export { Input }
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'energy'
  size?: 'default' | 'sm' | 'lg' | 'xl' | 'icon'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'default', ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/20 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed'
    
    const variants = {
      default: 'bg-amber-500 text-white hover:bg-amber-600 transform hover:-translate-y-0.5 active:translate-y-0 rounded',
      energy: 'bg-amber-500 text-white hover:bg-amber-600 transform hover:-translate-y-0.5 active:translate-y-0 rounded animate-pulse-energy',
      destructive: 'bg-red-500 text-white hover:bg-red-600 transform hover:-translate-y-0.5 active:translate-y-0 rounded',
      outline: 'border-2 border-slate-200 bg-white/80 text-slate-700 hover:bg-white hover:border-amber-300 hover:text-slate-900 rounded',
      secondary: 'bg-slate-200 text-slate-700 hover:bg-slate-300 hover:text-slate-900 rounded',
      ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded',
      link: 'text-amber-500 hover:text-amber-600 underline-offset-4 hover:underline',
    }
    
    const sizes = {
      default: 'h-11 px-6 py-3 text-sm',
      sm: 'h-9 px-4 py-2 text-sm',
      lg: 'h-12 px-8 py-3 text-base',
      xl: 'h-14 px-10 py-4 text-lg',
      icon: 'h-11 w-11 p-0',
    }
    
    return (
      <button 
        className={cn(baseClasses, variants[variant], sizes[size], className)} 
        ref={ref} 
        {...props} 
      />
    )
  }
)

Button.displayName = 'Button'

export { Button }
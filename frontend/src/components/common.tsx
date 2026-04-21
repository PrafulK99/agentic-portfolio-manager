import type { ReactNode } from 'react'

// ─── Premium Card Component ────────────────────────────────────────────────

interface CardProps {
  children: ReactNode
  className?: string
  interactive?: boolean
  variant?: 'default' | 'outlined'
}

export function Card({ children, className = '', interactive = false, variant = 'default' }: CardProps) {
  const baseClasses = 'rounded-2xl transition-smooth'
  
  const variantClasses = {
    default: 'bg-slate-900/50 border border-slate-800/50 backdrop-blur-sm shadow-premium hover:border-slate-700/50',
    outlined: 'border border-slate-800/50 rounded-2xl'
  }

  const interactiveClasses = interactive ? 'hover:shadow-lg hover:shadow-blue-500/10 hover:border-slate-700' : ''

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${interactiveClasses} ${className}`}>
      {children}
    </div>
  )
}

// ─── Premium Badge Component ──────────────────────────────────────────────

interface BadgeProps {
  children: ReactNode
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default'
  size?: 'sm' | 'md'
  className?: string
}

export function Badge({ children, variant = 'default', size = 'md', className = '' }: BadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  }

  const variantClasses = {
    success: 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300',
    warning: 'bg-amber-500/10 border border-amber-500/20 text-amber-300',
    danger: 'bg-red-500/10 border border-red-500/20 text-red-300',
    info: 'bg-blue-500/10 border border-blue-500/20 text-blue-300',
    default: 'bg-slate-700/30 border border-slate-600/30 text-slate-300',
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-lg font-semibold ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  )
}

// ─── Premium Button Component ─────────────────────────────────────────────

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  disabled?: boolean
  isLoading?: boolean
  icon?: ReactNode
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  isLoading = false,
  icon,
}: ButtonProps) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/25',
    secondary: 'bg-slate-700/50 text-slate-200 border border-slate-600/50 hover:bg-slate-600/50 hover:border-slate-500/50',
    tertiary: 'bg-transparent text-slate-300 hover:bg-slate-800/50',
    danger: 'bg-red-600/90 text-white hover:bg-red-500 shadow-lg shadow-red-500/25',
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`rounded-xl font-semibold transition-smooth flex items-center justify-center gap-2 ${sizeClasses[size]} ${variantClasses[variant]} ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {isLoading && (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {icon && !isLoading && icon}
      {children}
    </button>
  )
}

// ─── Premium Input Component ──────────────────────────────────────────────

interface InputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  disabled?: boolean
  label?: string
  icon?: ReactNode
  className?: string
}

export function Input({
  value,
  onChange,
  placeholder,
  type = 'text',
  disabled = false,
  label,
  icon,
  className = '',
}: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none flex items-center justify-center">
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-medium transition-smooth ${icon ? 'pl-10' : ''} bg-slate-800/50 border border-slate-700/50 text-slate-50 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:bg-slate-800/80 focus:ring-1 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        />
      </div>
    </div>
  )
}

// ─── Premium Section Component ────────────────────────────────────────────

interface SectionProps {
  children: ReactNode
  title?: string
  subtitle?: string
  className?: string
  action?: ReactNode
}

export function Section({ children, title, subtitle, className = '', action }: SectionProps) {
  return (
    <section className={`space-y-4 ${className}`}>
      {(title || subtitle) && (
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-0.5">
            {title && <h2 className="text-lg font-bold text-slate-50">{title}</h2>}
            {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </section>
  )
}

// ─── Premium Stat Card Component ──────────────────────────────────────────

interface StatCardProps {
  label: string
  value: string | number
  change?: number
  icon?: ReactNode
  variant?: 'default' | 'positive' | 'negative'
  className?: string
}

export function StatCard({ label, value, change, icon, variant = 'default', className = '' }: StatCardProps) {
  const variantBg = {
    default: 'bg-slate-900/50',
    positive: 'bg-emerald-500/5',
    negative: 'bg-red-500/5',
  }

  const variantBorder = {
    default: 'border-slate-800/50',
    positive: 'border-emerald-500/20',
    negative: 'border-red-500/20',
  }

  const changeColor = change === undefined ? 'text-slate-400' : change >= 0 ? 'text-emerald-400' : 'text-red-400'

  return (
    <Card className={`p-4 ${variantBg[variant]} ${variantBorder[variant]} ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
          <p className="text-2xl font-bold text-slate-50 truncate">{value}</p>
          {change !== undefined && (
            <p className={`text-sm font-semibold ${changeColor}`}>
              {change >= 0 ? '+' : ''}{change.toFixed(2)}%
            </p>
          )}
        </div>
        {icon && <div className="text-slate-600 mt-1">{icon}</div>}
      </div>
    </Card>
  )
}

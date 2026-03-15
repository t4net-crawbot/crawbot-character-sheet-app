import { motion } from 'framer-motion'

interface GoldButtonProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit'
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function GoldButton({
  children, onClick, disabled, type = 'button',
  variant = 'primary', size = 'md', className = '',
}: GoldButtonProps) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-8 py-3.5 text-base',
  }

  const variantClasses = {
    primary: 'bg-tov-gold text-tov-bg hover:bg-tov-goldLight hover:shadow-gold-lg',
    secondary: 'border-2 border-tov-gold text-tov-gold hover:bg-tov-gold/10',
    ghost: 'text-tov-textMuted hover:text-tov-text hover:bg-tov-surface',
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.03, y: -1 } : {}}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      className={`
        inline-flex items-center justify-center gap-2 rounded-lg font-semibold
        transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-tov-gold/50
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {children}
    </motion.button>
  )
}

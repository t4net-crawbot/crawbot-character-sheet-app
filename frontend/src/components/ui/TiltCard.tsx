import { useRef } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'

interface TiltCardProps {
  children: React.ReactNode
  isSelected?: boolean
  onClick?: () => void
  className?: string
  disabled?: boolean
}

export function TiltCard({ children, isSelected, onClick, className = '', disabled }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useTransform(y, [-60, 60], [6, -6])
  const rotateY = useTransform(x, [-60, 60], [-6, 6])

  const handleMouseMove = (e: React.MouseEvent) => {
    if (disabled) return
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    x.set(e.clientX - rect.left - rect.width / 2)
    y.set(e.clientY - rect.top - rect.height / 2)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' as const }}
      whileHover={!disabled ? { scale: 1.03 } : {}}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={disabled ? undefined : onClick}
      className={`
        rounded-xl border p-4 transition-all duration-200 select-none
        ${disabled
          ? 'border-tov-border bg-tov-surface opacity-40 cursor-not-allowed'
          : isSelected
            ? 'border-tov-gold bg-tov-card cursor-pointer shadow-gold'
            : 'border-tov-border bg-tov-surface hover:border-tov-gold/50 hover:bg-tov-card cursor-pointer'
        }
        ${className}
      `}
    >
      {children}
    </motion.div>
  )
}

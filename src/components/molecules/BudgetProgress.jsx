import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const BudgetProgress = ({ 
  current, 
  total, 
  currency = 'USD',
  size = 'md',
  showLabels = true,
  className = ''
}) => {
  const [animatedPercentage, setAnimatedPercentage] = useState(0)
  const percentage = Math.min((current / total) * 100, 100)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPercentage(percentage)
    }, 200)
    return () => clearTimeout(timer)
  }, [percentage])
  
  const getStatus = () => {
    if (percentage >= 90) return 'danger'
    if (percentage >= 75) return 'warning'
    return 'good'
  }
  
  const status = getStatus()
  
  const statusColors = {
    good: {
      bg: 'budget-gradient',
      text: 'text-success'
    },
    warning: {
      bg: 'budget-warning-gradient', 
      text: 'text-warning'
    },
    danger: {
      bg: 'budget-danger-gradient',
      text: 'text-error'
    }
  }
  
  const sizes = {
    sm: { container: 'w-16 h-16', stroke: 4, text: 'text-xs' },
    md: { container: 'w-20 h-20', stroke: 6, text: 'text-sm' },
    lg: { container: 'w-24 h-24', stroke: 8, text: 'text-base' }
  }
  
  const sizeConfig = sizes[size]
  const radius = 50 - sizeConfig.stroke / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (animatedPercentage / 100) * circumference
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }
  
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className={`relative ${sizeConfig.container}`}>
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="currentColor"
            strokeWidth={sizeConfig.stroke}
            fill="none"
            className="text-surface-200"
          />
          
          {/* Progress circle */}
          <motion.circle
            cx="50"
            cy="50"
            r={radius}
            stroke="url(#gradient)"
            strokeWidth={sizeConfig.stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
          
          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop 
                offset="0%" 
                stopColor={status === 'good' ? '#10B981' : status === 'warning' ? '#F59E0B' : '#EF4444'} 
              />
              <stop 
                offset="100%" 
                stopColor={status === 'good' ? '#059669' : status === 'warning' ? '#D97706' : '#DC2626'} 
              />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Center text */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center ${sizeConfig.text}`}>
          <span className={`font-semibold ${statusColors[status].text}`}>
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
      
      {showLabels && (
        <div className="mt-2 text-center">
          <div className="text-sm font-medium text-surface-900">
            {formatCurrency(current)} / {formatCurrency(total)}
          </div>
          <div className="text-xs text-surface-500 mt-1">
            {formatCurrency(total - current)} remaining
          </div>
        </div>
      )}
    </div>
  )
}

export default BudgetProgress
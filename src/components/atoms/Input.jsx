import { useState } from 'react'
import { motion } from 'framer-motion'
import ApperIcon from '@/components/ApperIcon'

const Input = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  icon,
  iconPosition = 'left',
  required = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const [focused, setFocused] = useState(false)
  
  const hasValue = value && value.length > 0
  const shouldFloat = focused || hasValue
  
  return (
    <div className={`relative ${className}`}>
      {/* Input Container */}
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          className={`
            w-full px-4 py-3 border-2 rounded-lg transition-all duration-200
            focus:outline-none focus:ring-0
            ${error 
              ? 'border-error focus:border-error' 
              : focused
                ? 'border-primary focus:border-primary'
                : 'border-surface-300 hover:border-surface-400'
            }
            ${disabled ? 'bg-surface-50 cursor-not-allowed' : 'bg-white'}
            ${icon && iconPosition === 'left' ? 'pl-11' : ''}
            ${icon && iconPosition === 'right' ? 'pr-11' : ''}
          `}
          placeholder={label ? '' : placeholder}
          {...props}
        />
        
        {/* Floating Label */}
        {label && (
<motion.label
            initial={false}
            animate={{
              y: shouldFloat ? -40 : 0,
              scale: shouldFloat ? 0.85 : 1,
              color: error ? '#EF4444' : focused ? '#2563EB' : '#64748B'
            }}
            transition={{ duration: 0.2 }}
            className={`
              absolute left-4 top-3 pointer-events-none origin-left z-10
              ${shouldFloat ? 'bg-white px-2' : ''}
            `}
          >
            {label}
            {required && <span className="text-error ml-1">*</span>}
          </motion.label>
        )}
        
        {/* Icons */}
        {icon && (
          <div className={`
            absolute top-1/2 transform -translate-y-1/2
            ${iconPosition === 'left' ? 'left-3' : 'right-3'}
          `}>
            <ApperIcon 
              name={icon} 
              size={20} 
              className={`
                ${error ? 'text-error' : focused ? 'text-primary' : 'text-surface-400'}
              `}
            />
          </div>
        )}
      </div>
      
      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 flex items-center text-sm text-error"
        >
          <ApperIcon name="AlertCircle" size={16} className="mr-1" />
          {error}
        </motion.div>
      )}
    </div>
  )
}

export default Input
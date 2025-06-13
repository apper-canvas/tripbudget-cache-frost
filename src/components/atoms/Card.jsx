import { motion } from 'framer-motion'

const Card = ({ 
  children, 
  className = '',
  hover = false,
  padding = 'default',
  ...props 
}) => {
  const paddings = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8'
  }
  
  return (
    <motion.div
      whileHover={hover ? { y: -2, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' } : {}}
      transition={{ duration: 0.2 }}
      className={`
        bg-white rounded-xl shadow-sm border border-surface-200
        ${paddings[padding]} ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export default Card
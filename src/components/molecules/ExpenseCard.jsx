import { motion } from 'framer-motion'
import { format } from 'date-fns'
import ApperIcon from '@/components/ApperIcon'
import Badge from '@/components/atoms/Badge'

const ExpenseCard = ({ 
  expense, 
  onClick,
  showTrip = false,
  className = ''
}) => {
  const getCategoryIcon = (category) => {
    const icons = {
      meals: 'UtensilsCrossed',
      transportation: 'Car',
      lodging: 'Bed',
      conference: 'Users',
      supplies: 'Package',
      other: 'FileText'
    }
    return icons[category] || 'FileText'
  }
  
  const getCategoryColor = (category) => {
    const colors = {
      meals: 'text-orange-600',
      transportation: 'text-blue-600',
      lodging: 'text-purple-600',
      conference: 'text-green-600',
      supplies: 'text-yellow-600',
      other: 'text-gray-600'
    }
    return colors[category] || 'text-gray-600'
  }
  
  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount)
  }
  
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM dd, yyyy')
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        bg-white rounded-xl p-4 border border-surface-200 cursor-pointer
        transition-all duration-200 hover:border-primary/20 ${className}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          <div className={`p-2 rounded-lg bg-surface-50 ${getCategoryColor(expense.category)}`}>
            <ApperIcon name={getCategoryIcon(expense.category)} size={20} />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-surface-900 truncate">
              {expense.merchantName}
            </h3>
            <p className="text-sm text-surface-500 mt-1">
              {formatDate(expense.date)}
            </p>
            {expense.notes && (
              <p className="text-xs text-surface-400 mt-1 truncate">
                {expense.notes}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex flex-col items-end space-y-2 ml-3">
          <span className="font-semibold text-surface-900">
            {formatCurrency(expense.amount, expense.currency)}
          </span>
          
          <div className="flex items-center space-x-2">
            <Badge 
              variant={expense.isCompliant ? 'success' : 'error'}
              size="sm"
            >
              {expense.isCompliant ? 'Compliant' : 'Policy Issue'}
            </Badge>
            
            {expense.receiptUrl && (
              <div className="p-1 rounded bg-surface-100">
                <ApperIcon name="Paperclip" size={12} className="text-surface-500" />
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default ExpenseCard
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import ApperIcon from '@/components/ApperIcon'
import ExpenseCard from '@/components/molecules/ExpenseCard'
import SkeletonLoader from '@/components/molecules/SkeletonLoader'
import EmptyState from '@/components/molecules/EmptyState'
import ErrorState from '@/components/molecules/ErrorState'
import { expenseService } from '@/services'

const RecentExpenses = ({ limit = 5, className = '' }) => {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  
  useEffect(() => {
    loadRecentExpenses()
  }, [])
  
  const loadRecentExpenses = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await expenseService.getAll()
      // Sort by date descending and take only the limit
      const sortedExpenses = result
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, limit)
      setExpenses(sortedExpenses)
    } catch (err) {
      setError(err.message || 'Failed to load recent expenses')
      toast.error('Failed to load recent expenses')
    } finally {
      setLoading(false)
    }
  }
  
  const handleExpenseClick = (expense) => {
    navigate('/expenses', { state: { selectedExpense: expense } })
  }
  
  if (loading) {
    return (
      <div className={className}>
        <h2 className="text-lg font-heading font-semibold text-surface-900 mb-4">
          Recent Expenses
        </h2>
        <SkeletonLoader count={3} type="list" />
      </div>
    )
  }
  
  if (error) {
    return (
      <div className={className}>
        <h2 className="text-lg font-heading font-semibold text-surface-900 mb-4">
          Recent Expenses
        </h2>
        <ErrorState 
          message={error}
          onRetry={loadRecentExpenses}
        />
      </div>
    )
  }
  
  if (expenses.length === 0) {
    return (
      <div className={className}>
        <h2 className="text-lg font-heading font-semibold text-surface-900 mb-4">
          Recent Expenses
        </h2>
        <EmptyState
          icon="Receipt"
          title="No expenses yet"
          description="Start by capturing your first receipt"
          actionLabel="Capture Receipt"
          onAction={() => navigate('/capture')}
        />
      </div>
    )
  }
  
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-heading font-semibold text-surface-900">
          Recent Expenses
        </h2>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/expenses')}
          className="flex items-center text-sm text-primary hover:text-blue-700 font-medium transition-colors"
        >
          View All
          <ApperIcon name="ChevronRight" size={16} className="ml-1" />
        </motion.button>
      </div>
      
      <div className="space-y-3">
        {expenses.map((expense, index) => (
          <motion.div
            key={expense.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <ExpenseCard
              expense={expense}
              onClick={() => handleExpenseClick(expense)}
            />
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default RecentExpenses
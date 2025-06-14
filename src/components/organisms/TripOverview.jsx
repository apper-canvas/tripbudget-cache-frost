import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import ApperIcon from '@/components/ApperIcon'
import TripCard from '@/components/molecules/TripCard'
import SkeletonLoader from '@/components/molecules/SkeletonLoader'
import EmptyState from '@/components/molecules/EmptyState'
import ErrorState from '@/components/molecules/ErrorState'
import { tripService, expenseService, budgetService } from '@/services'

const TripOverview = ({ className = '' }) => {
  const [trips, setTrips] = useState([])
  const [expenses, setExpenses] = useState([])
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  
  useEffect(() => {
    loadTripData()
  }, [])
  
  const loadTripData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [tripsResult, expensesResult, budgetsResult] = await Promise.all([
        tripService.getActiveTrips(),
        expenseService.getAll(),
        budgetService.getAll()
      ])
      
      setTrips(tripsResult)
      setExpenses(expensesResult)
      setBudgets(budgetsResult)
    } catch (err) {
      setError(err.message || 'Failed to load trip data')
      toast.error('Failed to load trip data')
    } finally {
      setLoading(false)
    }
  }
  
  const getExpensesForTrip = (tripId) => {
    return expenses.filter(expense => expense.tripId === tripId)
  }
  
  const getBudgetForTrip = (tripId) => {
    return budgets.find(budget => budget.tripId === tripId)
  }
  
const handleTripClick = () => {
    navigate('/trips')
  }
  
  if (loading) {
    return (
      <div className={className}>
        <h2 className="text-lg font-heading font-semibold text-surface-900 mb-4">
          Active Trips
        </h2>
        <SkeletonLoader count={2} type="card" />
      </div>
    )
  }
  
  if (error) {
    return (
      <div className={className}>
        <h2 className="text-lg font-heading font-semibold text-surface-900 mb-4">
          Active Trips
        </h2>
        <ErrorState 
          message={error}
          onRetry={loadTripData}
        />
      </div>
    )
  }
  
  if (trips.length === 0) {
    return (
      <div className={className}>
        <h2 className="text-lg font-heading font-semibold text-surface-900 mb-4">
          Active Trips
        </h2>
        <EmptyState
          icon="MapPin"
          title="No active trips"
          description="Create your first trip to start tracking expenses"
          actionLabel="Create Trip"
          onAction={() => navigate('/trips')}
        />
      </div>
    )
  }
  
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-heading font-semibold text-surface-900">
          Active Trips
        </h2>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/trips')}
          className="flex items-center text-sm text-primary hover:text-blue-700 font-medium transition-colors"
        >
          View All
          <ApperIcon name="ChevronRight" size={16} className="ml-1" />
        </motion.button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {trips.slice(0, 2).map((trip, index) => (
          <motion.div
            key={trip.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
<TripCard
              trip={trip}
              expenses={getExpensesForTrip(trip.id)}
              budget={getBudgetForTrip(trip.id)}
              onClick={handleTripClick}
            />
          </motion.div>
        ))}
      </div>
      
      {trips.length > 2 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 text-center"
        >
          <button
            onClick={() => navigate('/trips')}
            className="text-sm text-surface-500 hover:text-primary transition-colors"
          >
            +{trips.length - 2} more trip{trips.length - 2 !== 1 ? 's' : ''}
          </button>
        </motion.div>
      )}
    </div>
  )
}

export default TripOverview
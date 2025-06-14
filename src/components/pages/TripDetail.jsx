import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { format, differenceInDays } from 'date-fns'
import { toast } from 'react-toastify'
import ApperIcon from '@/components/ApperIcon'
import Button from '@/components/atoms/Button'
import Card from '@/components/atoms/Card'
import Badge from '@/components/atoms/Badge'
import BudgetProgress from '@/components/molecules/BudgetProgress'
import ExpenseCard from '@/components/molecules/ExpenseCard'
import SkeletonLoader from '@/components/molecules/SkeletonLoader'
import ErrorState from '@/components/molecules/ErrorState'
import EmptyState from '@/components/molecules/EmptyState'
import { tripService, expenseService, budgetService } from '@/services'

const TripDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [trip, setTrip] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [budget, setBudget] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (id) {
      loadTripData()
    }
  }, [id])

  const loadTripData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [tripResult, expensesResult, budgetsResult] = await Promise.all([
        tripService.getById(id),
        expenseService.getAll(),
        budgetService.getAll()
      ])

      if (!tripResult) {
        setError('Trip not found')
        return
      }

      setTrip(tripResult)
      setExpenses(expensesResult.filter(expense => expense.tripId === id))
      setBudget(budgetsResult.find(budget => budget.tripId === id))
    } catch (err) {
      setError(err.message || 'Failed to load trip data')
      toast.error('Failed to load trip data')
    } finally {
      setLoading(false)
    }
  }

  const getTripStatus = () => {
    if (!trip) return 'unknown'
    const now = new Date()
    const startDate = new Date(trip.startDate)
    const endDate = new Date(trip.endDate)
    
    if (now < startDate) return 'upcoming'
    if (now > endDate) return 'completed'
    return 'active'
  }

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM dd, yyyy')
  }

  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const budgetAmount = budget?.totalAmount || trip?.budget || 0
  const remainingBudget = budgetAmount - totalSpent
  const spentPercentage = budgetAmount > 0 ? (totalSpent / budgetAmount) * 100 : 0

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-full overflow-hidden">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-10 w-10 bg-surface-200 rounded-lg animate-pulse" />
          <div>
            <div className="h-8 bg-surface-200 rounded w-48 mb-2 animate-pulse" />
            <div className="h-4 bg-surface-200 rounded w-32 animate-pulse" />
          </div>
        </div>
        <SkeletonLoader count={3} type="card" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState 
          message={error}
          onRetry={loadTripData}
        />
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="p-6">
        <EmptyState
          icon="MapPin"
          title="Trip not found"
          description="The trip you're looking for could not be found"
          actionLabel="Back to Trips"
          onAction={() => navigate('/trips')}
        />
      </div>
    )
  }

  const status = getTripStatus()
  const statusVariants = {
    active: { variant: 'success', label: 'Active' },
    upcoming: { variant: 'info', label: 'Upcoming' },
    completed: { variant: 'default', label: 'Completed' }
  }

  return (
    <div className="p-6 space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            icon="ArrowLeft"
            onClick={() => navigate('/trips')}
          >
            Back to Trips
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-heading font-bold text-surface-900">
                {trip.name}
              </h1>
              <Badge {...statusVariants[status]} />
            </div>
            <p className="text-surface-600">
              {formatDate(trip.startDate)} - {formatDate(trip.endDate)} • {differenceInDays(new Date(trip.endDate), new Date(trip.startDate))} days
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" icon="Edit">
            Edit Trip
          </Button>
          <Button variant="primary" icon="Plus">
            Add Expense
          </Button>
        </div>
      </div>

      {/* Budget Overview */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-heading font-semibold text-surface-900">
            Budget Overview
          </h2>
          <div className="text-right">
            <div className="text-2xl font-bold text-surface-900">
              {formatCurrency(remainingBudget, trip.currency)}
            </div>
            <div className="text-sm text-surface-600">
              remaining of {formatCurrency(budgetAmount, trip.currency)}
            </div>
          </div>
        </div>
        
        <BudgetProgress
          spent={totalSpent}
          budget={budgetAmount}
          currency={trip.currency}
          showDetails={true}
        />
      </Card>

      {/* Trip Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-surface-900">
                {expenses.length}
              </div>
              <div className="text-sm text-surface-600">
                Total Expenses
              </div>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <ApperIcon name="Receipt" size={24} className="text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-surface-900">
                {formatCurrency(totalSpent / expenses.length || 0, trip.currency)}
              </div>
              <div className="text-sm text-surface-600">
                Average per Expense
              </div>
            </div>
            <div className="p-3 bg-success/10 rounded-lg">
              <ApperIcon name="TrendingUp" size={24} className="text-success" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-surface-900">
                {Math.round(spentPercentage)}%
              </div>
              <div className="text-sm text-surface-600">
                Budget Used
              </div>
            </div>
            <div className={`p-3 rounded-lg ${
              spentPercentage > 80 ? 'bg-danger/10' : 
              spentPercentage > 60 ? 'bg-warning/10' : 'bg-success/10'
            }`}>
              <ApperIcon 
                name="PieChart" 
                size={24} 
                className={
                  spentPercentage > 80 ? 'text-danger' : 
                  spentPercentage > 60 ? 'text-warning' : 'text-success'
                }
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Expenses List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-heading font-semibold text-surface-900">
            Recent Expenses
          </h2>
          <Button variant="outline" size="sm">
            View All Expenses
          </Button>
        </div>

        {expenses.length === 0 ? (
          <EmptyState
            icon="Receipt"
            title="No expenses yet"
            description="Start adding expenses to track your trip spending"
            actionLabel="Add First Expense"
            onAction={() => {}}
          />
        ) : (
          <div className="space-y-4">
            {expenses.slice(0, 5).map((expense, index) => (
              <motion.div
                key={expense.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ExpenseCard expense={expense} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default TripDetail
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { format, differenceInDays, isAfter, isBefore } from 'date-fns'
import { toast } from 'react-toastify'
import ApperIcon from '@/components/ApperIcon'
import Button from '@/components/atoms/Button'
import Card from '@/components/atoms/Card'
import Badge from '@/components/atoms/Badge'
import Input from '@/components/atoms/Input'
import ExpenseCard from '@/components/molecules/ExpenseCard'
import BudgetProgress from '@/components/molecules/BudgetProgress'
import SkeletonLoader from '@/components/molecules/SkeletonLoader'
import EmptyState from '@/components/molecules/EmptyState'
import ErrorState from '@/components/molecules/ErrorState'
import { tripService, expenseService, budgetService } from '@/services'

const TripDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [trip, setTrip] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [budget, setBudget] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editTrip, setEditTrip] = useState({
    name: '',
    startDate: '',
    endDate: '',
    budget: '',
    currency: 'USD'
  })

  useEffect(() => {
    loadTripDetails()
  }, [id])

  const loadTripDetails = async () => {
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
      
      setEditTrip({
        name: tripResult.name,
        startDate: tripResult.startDate,
        endDate: tripResult.endDate,
        budget: tripResult.budget?.toString() || '',
        currency: tripResult.currency || 'USD'
      })
    } catch (err) {
      setError(err.message || 'Failed to load trip details')
      toast.error('Failed to load trip details')
    } finally {
      setLoading(false)
    }
  }

  const handleEditTrip = async () => {
    if (!editTrip.name || !editTrip.startDate || !editTrip.endDate || !editTrip.budget) {
      toast.error('Please fill in all required fields')
      return
    }
    
    try {
      const updatedTrip = await tripService.update(id, {
        name: editTrip.name,
        startDate: editTrip.startDate,
        endDate: editTrip.endDate,
        budget: parseFloat(editTrip.budget),
        currency: editTrip.currency
      })
      
      // Update associated budget
      if (budget) {
        await budgetService.update(budget.id, {
          totalAmount: parseFloat(editTrip.budget),
          dailyLimit: Math.floor(parseFloat(editTrip.budget) / 5),
          categoryLimits: {
            meals: Math.floor(parseFloat(editTrip.budget) * 0.3),
            transportation: Math.floor(parseFloat(editTrip.budget) * 0.2),
            lodging: Math.floor(parseFloat(editTrip.budget) * 0.4),
            other: Math.floor(parseFloat(editTrip.budget) * 0.1)
          }
        })
      }
      
      setTrip(updatedTrip)
      setShowEditModal(false)
      toast.success('Trip updated successfully!')
      loadTripDetails() // Reload to get updated budget
    } catch (err) {
      toast.error('Failed to update trip')
    }
  }

  const handleDeleteTrip = async () => {
    try {
      await tripService.delete(id)
      
      // Delete associated budget
      if (budget) {
        await budgetService.delete(budget.id)
      }
      
      toast.success('Trip deleted successfully!')
      navigate('/trips')
    } catch (err) {
      toast.error('Failed to delete trip')
    }
  }

  const getTripStatus = () => {
    if (!trip) return 'completed'
    
    const now = new Date()
    const startDate = new Date(trip.startDate)
    const endDate = new Date(trip.endDate)
    
    if (isBefore(now, startDate)) return 'upcoming'
    if (isAfter(now, endDate)) return 'completed'
    return 'active'
  }

  const getStatusBadge = () => {
    const status = getTripStatus()
    const variants = {
      active: { variant: 'success', label: 'Active' },
      upcoming: { variant: 'info', label: 'Upcoming' },
      completed: { variant: 'default', label: 'Completed' }
    }
    return variants[status] || variants.completed
  }

  const getDuration = () => {
    if (!trip) return '0 days'
    const days = differenceInDays(new Date(trip.endDate), new Date(trip.startDate)) + 1
    return `${days} day${days !== 1 ? 's' : ''}`
  }

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMMM dd, yyyy')
  }

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const budgetAmount = budget?.totalAmount || trip?.budget || 0
  const statusBadge = getStatusBadge()

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-full overflow-hidden">
        <div className="flex items-center space-x-4 mb-6">
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
          onRetry={loadTripDetails}
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
          description="The trip you're looking for doesn't exist or has been deleted"
          actionLabel="Back to Trips"
          onAction={() => navigate('/trips')}
        />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            icon="ArrowLeft"
            onClick={() => navigate('/trips')}
            className="p-2"
          />
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl font-heading font-bold text-surface-900">
                {trip.name}
              </h1>
              <Badge {...statusBadge} />
            </div>
            <div className="flex items-center text-sm text-surface-500 space-x-4">
              <div className="flex items-center">
                <ApperIcon name="Calendar" size={16} className="mr-1" />
                {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
              </div>
              <div className="flex items-center">
                <ApperIcon name="Clock" size={16} className="mr-1" />
                {getDuration()}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            icon="Edit"
            onClick={() => setShowEditModal(true)}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            icon="Trash"
            onClick={() => setShowDeleteModal(true)}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Trip Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <ApperIcon name="DollarSign" size={20} className="text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-surface-900">Budget</h3>
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-surface-900">
              {formatCurrency(budgetAmount, trip.currency)}
            </div>
            <div className="text-sm text-surface-600">
              Total allocated budget
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <ApperIcon name="Receipt" size={20} className="text-accent" />
              </div>
              <h3 className="font-heading font-semibold text-surface-900">Spent</h3>
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-surface-900">
              {formatCurrency(totalSpent, trip.currency)}
            </div>
            <div className="text-sm text-surface-600">
              Total expenses recorded
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <ApperIcon name="TrendingUp" size={20} className="text-secondary" />
              </div>
              <h3 className="font-heading font-semibold text-surface-900">Remaining</h3>
            </div>
          </div>
          <div className="space-y-2">
            <div className={`text-2xl font-bold ${budgetAmount - totalSpent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(budgetAmount - totalSpent, trip.currency)}
            </div>
            <div className="text-sm text-surface-600">
              Available to spend
            </div>
          </div>
        </Card>
      </div>

      {/* Budget Progress */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-heading font-semibold text-surface-900">
            Budget Progress
          </h3>
          <div className="text-sm text-surface-600">
            {Math.round((totalSpent / budgetAmount) * 100)}% used
          </div>
        </div>
        
        <BudgetProgress 
          current={totalSpent}
          total={budgetAmount}
          currency={trip.currency}
          size="lg"
          showLabels={true}
        />
      </Card>

      {/* Expenses Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-heading font-semibold text-surface-900">
            Expenses ({expenses.length})
          </h3>
          <Button
            variant="primary"
            icon="Plus"
            onClick={() => navigate('/capture', { state: { tripId: trip.id } })}
          >
            Add Expense
          </Button>
        </div>
        
        {expenses.length === 0 ? (
          <EmptyState
            icon="Receipt"
            title="No expenses yet"
            description="Start adding expenses to track your trip spending"
            actionLabel="Add First Expense"
            onAction={() => navigate('/capture', { state: { tripId: trip.id } })}
          />
        ) : (
          <div className="space-y-4">
            {expenses.map((expense, index) => (
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
      </Card>

      {/* Edit Trip Modal */}
      <AnimatePresence>
        {showEditModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowEditModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-heading font-semibold text-surface-900">
                    Edit Trip
                  </h2>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="p-2 hover:bg-surface-100 rounded-lg transition-colors"
                  >
                    <ApperIcon name="X" size={20} />
                  </button>
                </div>
                
                <div className="space-y-4">
<Input
                    label="Trip Name"
                    labelPosition="above"
                    value={editTrip.name}
                    onChange={(e) => setEditTrip(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Q1 Sales Conference"
                    required
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
<Input
                      label="Start Date"
                      labelPosition="above"
                      type="date"
                      value={editTrip.startDate}
                      onChange={(e) => setEditTrip(prev => ({ ...prev, startDate: e.target.value }))}
                      required
                    />
                    <Input
                      label="End Date"
                      labelPosition="above"
                      type="date"
                      value={editTrip.endDate}
                      onChange={(e) => setEditTrip(prev => ({ ...prev, endDate: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
<Input
                      label="Budget"
                      labelPosition="above"
                      type="number"
                      value={editTrip.budget}
                      onChange={(e) => setEditTrip(prev => ({ ...prev, budget: e.target.value }))}
                      placeholder="2500"
                      required
                    />
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-2">
                        Currency
                      </label>
<select
                        value={editTrip.currency}
                        onChange={(e) => setEditTrip(prev => ({ ...prev, currency: e.target.value }))}
                        className="w-full px-4 py-3 border-2 border-surface-300 rounded-lg focus:border-primary focus:outline-none bg-white"
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="INR">INR</option>
                        <option value="CAD">CAD</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <Button
                    variant="ghost"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleEditTrip}
                    className="flex-1"
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowDeleteModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-heading font-semibold text-surface-900">
                    Delete Trip
                  </h2>
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="p-2 hover:bg-surface-100 rounded-lg transition-colors"
                  >
                    <ApperIcon name="X" size={20} />
                  </button>
                </div>
                
                <div className="mb-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <ApperIcon name="AlertTriangle" size={20} className="text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-surface-900">
                        Are you sure you want to delete this trip?
                      </h3>
                      <p className="text-sm text-surface-600 mt-1">
                        This action cannot be undone. All associated expenses and budget data will be permanently deleted.
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-surface-50 rounded-lg p-4">
                    <div className="text-sm font-medium text-surface-900">
                      Trip: {trip.name}
                    </div>
                    <div className="text-sm text-surface-600">
                      {expenses.length} expense{expenses.length !== 1 ? 's' : ''} will be deleted
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    onClick={handleDeleteTrip}
                    className="flex-1"
                  >
                    Delete Trip
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default TripDetails
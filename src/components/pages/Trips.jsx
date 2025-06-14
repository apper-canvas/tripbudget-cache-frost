import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import ApperIcon from '@/components/ApperIcon'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import TripCard from '@/components/molecules/TripCard'
import SkeletonLoader from '@/components/molecules/SkeletonLoader'
import EmptyState from '@/components/molecules/EmptyState'
import ErrorState from '@/components/molecules/ErrorState'
import { tripService, expenseService, budgetService } from '@/services'
const Trips = () => {
  const navigate = useNavigate()
  const [trips, setTrips] = useState([])
  const [expenses, setExpenses] = useState([])
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newTrip, setNewTrip] = useState({
    name: '',
    startDate: '',
    endDate: '',
    budget: '',
    currency: 'USD'
  })
  useEffect(() => {
    loadTripsData()
  }, [])
  
  const loadTripsData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [tripsResult, expensesResult, budgetsResult] = await Promise.all([
        tripService.getAll(),
        expenseService.getAll(),
        budgetService.getAll()
      ])
      
      setTrips(tripsResult)
      setExpenses(expensesResult)
      setBudgets(budgetsResult)
    } catch (err) {
      setError(err.message || 'Failed to load trips')
      toast.error('Failed to load trips')
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
  
  const filteredTrips = trips.filter(trip => {
    const matchesSearch = trip.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || trip.status === statusFilter
    return matchesSearch && matchesStatus
  })
  
  const handleCreateTrip = async () => {
    if (!newTrip.name || !newTrip.startDate || !newTrip.endDate || !newTrip.budget) {
      toast.error('Please fill in all required fields')
      return
    }
    
    try {
      const createdTrip = await tripService.create({
        ...newTrip,
        budget: parseFloat(newTrip.budget),
        userId: 'user1'
      })
      
      // Create associated budget
      await budgetService.create({
        tripId: createdTrip.id,
        totalAmount: parseFloat(newTrip.budget),
        dailyLimit: Math.floor(parseFloat(newTrip.budget) / 5), // Rough estimate
        categoryLimits: {
          meals: Math.floor(parseFloat(newTrip.budget) * 0.3),
          transportation: Math.floor(parseFloat(newTrip.budget) * 0.2),
          lodging: Math.floor(parseFloat(newTrip.budget) * 0.4),
          other: Math.floor(parseFloat(newTrip.budget) * 0.1)
        },
        alertThreshold: 80
      })
      
      setTrips([createdTrip, ...trips])
      setShowCreateModal(false)
      setNewTrip({ name: '', startDate: '', endDate: '', budget: '', currency: 'USD' })
      toast.success('Trip created successfully!')
    } catch (err) {
      toast.error('Failed to create trip')
    }
}
  
  const handleTripClick = (trip) => {
    navigate(`/trips/${trip.id}`)
  }
  
  const statusOptions = [
    { value: 'all', label: 'All Trips' },
    { value: 'active', label: 'Active' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'completed', label: 'Completed' }
  ]
  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-full overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="h-8 bg-surface-200 rounded w-32 mb-2 animate-pulse" />
            <div className="h-4 bg-surface-200 rounded w-48 animate-pulse" />
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
          onRetry={loadTripsData}
        />
      </div>
    )
  }
  
  return (
    <div className="p-6 space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-surface-900">
            Trips
          </h1>
          <p className="text-surface-600">
            Manage your travel itineraries and budgets
          </p>
        </div>
        
        <Button
          onClick={() => setShowCreateModal(true)}
          variant="primary"
          icon="Plus"
        >
          Create Trip
        </Button>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search trips..."
            icon="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 border-2 border-surface-300 rounded-lg focus:border-primary focus:outline-none bg-white"
        >
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      
      {/* Trips Grid */}
      {filteredTrips.length === 0 ? (
        <EmptyState
          icon="MapPin"
          title={searchTerm || statusFilter !== 'all' ? 'No trips found' : 'No trips yet'}
          description={
            searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Create your first trip to start tracking expenses'
          }
          actionLabel={searchTerm || statusFilter !== 'all' ? undefined : 'Create Trip'}
          onAction={searchTerm || statusFilter !== 'all' ? undefined : () => setShowCreateModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTrips.map((trip, index) => (
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
                onClick={() => handleTripClick(trip)}
              />
            </motion.div>
          ))}
        </div>
      )}
      
      {/* Create Trip Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowCreateModal(false)}
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
                    Create New Trip
                  </h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="p-2 hover:bg-surface-100 rounded-lg transition-colors"
                  >
                    <ApperIcon name="X" size={20} />
                  </button>
                </div>
                
                <div className="space-y-4">
<Input
                    label="Trip Name"
                    labelPosition="above"
                    value={newTrip.name}
                    onChange={(e) => setNewTrip(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Q1 Sales Conference"
                    required
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
<Input
                      label="Start Date"
                      labelPosition="above"
                      type="date"
                      value={newTrip.startDate}
                      onChange={(e) => setNewTrip(prev => ({ ...prev, startDate: e.target.value }))}
                      required
                    />
                    <Input
                      label="End Date"
                      labelPosition="above"
                      type="date"
                      value={newTrip.endDate}
                      onChange={(e) => setNewTrip(prev => ({ ...prev, endDate: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
<Input
                      label="Budget"
                      labelPosition="above"
                      type="number"
                      value={newTrip.budget}
                      onChange={(e) => setNewTrip(prev => ({ ...prev, budget: e.target.value }))}
                      placeholder="2500"
                      required
                    />
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-2">
                        Currency
                      </label>
<select
                        value={newTrip.currency}
                        onChange={(e) => setNewTrip(prev => ({ ...prev, currency: e.target.value }))}
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
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleCreateTrip}
                    className="flex-1"
                  >
                    Create Trip
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

export default Trips
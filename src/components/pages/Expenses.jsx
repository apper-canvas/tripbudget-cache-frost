import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { format } from 'date-fns'
import ApperIcon from '@/components/ApperIcon'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import Badge from '@/components/atoms/Badge'
import ExpenseCard from '@/components/molecules/ExpenseCard'
import SkeletonLoader from '@/components/molecules/SkeletonLoader'
import EmptyState from '@/components/molecules/EmptyState'
import ErrorState from '@/components/molecules/ErrorState'
import { expenseService, tripService } from '@/services'

const Expenses = () => {
  const [expenses, setExpenses] = useState([])
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [tripFilter, setTripFilter] = useState('all')
  const [complianceFilter, setComplianceFilter] = useState('all')
  const [selectedExpenses, setSelectedExpenses] = useState([])
  const [showBulkActions, setShowBulkActions] = useState(false)
  
  useEffect(() => {
    loadExpensesData()
  }, [])
  
  const loadExpensesData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [expensesResult, tripsResult] = await Promise.all([
        expenseService.getAll(),
        tripService.getAll()
      ])
      
      // Sort expenses by date descending
      const sortedExpenses = expensesResult.sort((a, b) => new Date(b.date) - new Date(a.date))
      setExpenses(sortedExpenses)
      setTrips(tripsResult)
    } catch (err) {
      setError(err.message || 'Failed to load expenses')
      toast.error('Failed to load expenses')
    } finally {
      setLoading(false)
    }
  }
  
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.merchantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter
    const matchesTrip = tripFilter === 'all' || expense.tripId === tripFilter
    const matchesCompliance = complianceFilter === 'all' || 
                             (complianceFilter === 'compliant' && expense.isCompliant) ||
                             (complianceFilter === 'non-compliant' && !expense.isCompliant)
    
    return matchesSearch && matchesCategory && matchesTrip && matchesCompliance
  })
  
  const handleExpenseSelect = (expenseId) => {
    setSelectedExpenses(prev => {
      if (prev.includes(expenseId)) {
        return prev.filter(id => id !== expenseId)
      } else {
        return [...prev, expenseId]
      }
    })
  }
  
  const handleSelectAll = () => {
    if (selectedExpenses.length === filteredExpenses.length) {
      setSelectedExpenses([])
    } else {
      setSelectedExpenses(filteredExpenses.map(expense => expense.id))
    }
  }
  
  const handleBulkDelete = async () => {
    if (selectedExpenses.length === 0) return
    
    try {
      await Promise.all(selectedExpenses.map(id => expenseService.delete(id)))
      setExpenses(prev => prev.filter(expense => !selectedExpenses.includes(expense.id)))
      setSelectedExpenses([])
      setShowBulkActions(false)
      toast.success(`Deleted ${selectedExpenses.length} expense${selectedExpenses.length !== 1 ? 's' : ''}`)
    } catch (err) {
      toast.error('Failed to delete expenses')
    }
  }
  
  const getTripName = (tripId) => {
    const trip = trips.find(t => t.id === tripId)
    return trip?.name || 'Unknown Trip'
  }
  
  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount)
  }
  
  const getTotalAmount = () => {
    return filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  }
  
  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'meals', label: 'Meals' },
    { value: 'transportation', label: 'Transportation' },
    { value: 'lodging', label: 'Lodging' },
    { value: 'conference', label: 'Conference' },
    { value: 'supplies', label: 'Supplies' },
    { value: 'other', label: 'Other' }
  ]
  
  const complianceOptions = [
    { value: 'all', label: 'All Expenses' },
    { value: 'compliant', label: 'Compliant' },
    { value: 'non-compliant', label: 'Policy Issues' }
  ]
  
  useEffect(() => {
    setShowBulkActions(selectedExpenses.length > 0)
  }, [selectedExpenses])
  
  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-full overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="h-8 bg-surface-200 rounded w-32 mb-2 animate-pulse" />
            <div className="h-4 bg-surface-200 rounded w-48 animate-pulse" />
          </div>
        </div>
        <SkeletonLoader count={5} type="list" />
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="p-6">
        <ErrorState 
          message={error}
          onRetry={loadExpensesData}
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
            Expenses
          </h1>
          <p className="text-surface-600">
            {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''} • Total: {formatCurrency(getTotalAmount())}
          </p>
        </div>
        
        {/* Bulk Actions */}
        {showBulkActions && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <span className="text-sm text-surface-600">
              {selectedExpenses.length} selected
            </span>
            <Button
              variant="danger"
              size="sm"
              icon="Trash2"
              onClick={handleBulkDelete}
            >
              Delete
            </Button>
          </motion.div>
        )}
      </div>
      
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Input
          placeholder="Search expenses..."
          icon="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-3 border-2 border-surface-300 rounded-lg focus:border-primary focus:outline-none bg-white"
        >
          {categories.map(category => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
        
        <select
          value={tripFilter}
          onChange={(e) => setTripFilter(e.target.value)}
          className="px-4 py-3 border-2 border-surface-300 rounded-lg focus:border-primary focus:outline-none bg-white"
        >
          <option value="all">All Trips</option>
          {trips.map(trip => (
            <option key={trip.id} value={trip.id}>
              {trip.name}
            </option>
          ))}
        </select>
        
        <select
          value={complianceFilter}
          onChange={(e) => setComplianceFilter(e.target.value)}
          className="px-4 py-3 border-2 border-surface-300 rounded-lg focus:border-primary focus:outline-none bg-white"
        >
          {complianceOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      
      {/* Select All */}
      {filteredExpenses.length > 0 && (
        <div className="flex items-center justify-between py-2 border-b border-surface-200">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedExpenses.length === filteredExpenses.length}
              onChange={handleSelectAll}
              className="w-4 h-4 text-primary border-surface-300 rounded focus:ring-primary"
            />
            <span className="text-sm text-surface-600">
              Select all {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''}
            </span>
          </label>
          
          <div className="flex items-center space-x-4 text-sm text-surface-500">
            <span>Sort by: Date (newest first)</span>
          </div>
        </div>
      )}
      
      {/* Expenses List */}
      {filteredExpenses.length === 0 ? (
        <EmptyState
          icon="Receipt"
          title={searchTerm || categoryFilter !== 'all' || tripFilter !== 'all' ? 'No expenses found' : 'No expenses yet'}
          description={
            searchTerm || categoryFilter !== 'all' || tripFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Start by capturing your first receipt'
          }
          actionLabel={searchTerm || categoryFilter !== 'all' || tripFilter !== 'all' ? undefined : 'Capture Receipt'}
          onAction={searchTerm || categoryFilter !== 'all' || tripFilter !== 'all' ? undefined : () => window.location.href = '/capture'}
        />
      ) : (
        <div className="space-y-3">
          {filteredExpenses.map((expense, index) => (
            <motion.div
              key={expense.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative"
            >
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={selectedExpenses.includes(expense.id)}
                  onChange={() => handleExpenseSelect(expense.id)}
                  className="w-4 h-4 text-primary border-surface-300 rounded focus:ring-primary"
                />
                
                <div className="flex-1">
                  <ExpenseCard
                    expense={expense}
                    showTrip
                    className="border-l-4 border-l-primary/20"
                  />
                  
                  <div className="ml-6 mt-2 text-xs text-surface-500 flex items-center space-x-4">
                    <span>Trip: {getTripName(expense.tripId)}</span>
                    <span>•</span>
                    <span>Added {format(new Date(expense.date), 'MMM dd, yyyy')}</span>
                    {expense.receiptUrl && (
                      <>
                        <span>•</span>
                        <span className="flex items-center">
                          <ApperIcon name="Paperclip" size={12} className="mr-1" />
                          Receipt attached
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Expenses
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { format } from 'date-fns'
import ApperIcon from '@/components/ApperIcon'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import Badge from '@/components/atoms/Badge'
import Card from '@/components/atoms/Card'
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
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [showManualForm, setShowManualForm] = useState(false)
  const [formData, setFormData] = useState({
    merchantName: '',
    amount: '',
    category: 'meals',
    tripId: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  })
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
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
  
  const handleFormSubmit = async (e) => {
    e.preventDefault()
    
    // Validate form
    const errors = {}
    if (!formData.merchantName.trim()) errors.merchantName = 'Merchant name is required'
    if (!formData.amount || parseFloat(formData.amount) <= 0) errors.amount = 'Valid amount is required'
    if (!formData.tripId) errors.tripId = 'Trip is required'
    if (!formData.date) errors.date = 'Date is required'
    
    setFormErrors(errors)
    if (Object.keys(errors).length > 0) return
    
    setSubmitting(true)
    try {
      const newExpense = {
        merchantName: formData.merchantName.trim(),
        amount: parseFloat(formData.amount),
        currency: 'USD',
        category: formData.category,
        tripId: formData.tripId,
        date: formData.date,
        notes: formData.notes.trim(),
        isCompliant: true, // Default to compliant for manual entries
        receiptUrl: null // No receipt for manual entries
      }
      
      const createdExpense = await expenseService.create(newExpense)
      setExpenses(prev => [createdExpense, ...prev])
      
      // Reset form
      setFormData({
        merchantName: '',
        amount: '',
        category: 'meals',
        tripId: '',
        date: new Date().toISOString().split('T')[0],
        notes: ''
      })
      setFormErrors({})
      setShowManualForm(false)
      
      toast.success('Expense added successfully')
    } catch (err) {
      toast.error('Failed to add expense')
    } finally {
      setSubmitting(false)
    }
  }
  
  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }))
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
<div className="flex items-center gap-3">
          {/* Add Expense Dropdown */}
          <div className="relative">
            <Button
              variant="primary"
              icon="Plus"
              onClick={() => setShowAddMenu(!showAddMenu)}
            >
              Add Expense
            </Button>
            
            {showAddMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-surface-200 z-10"
              >
                <div className="py-2">
                  <button
                    onClick={() => {
                      window.location.href = '/capture'
                      setShowAddMenu(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-surface-700 hover:bg-surface-50 flex items-center space-x-2"
                  >
                    <ApperIcon name="Camera" size={16} />
                    <span>Capture Receipt</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowManualForm(true)
                      setShowAddMenu(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-surface-700 hover:bg-surface-50 flex items-center space-x-2"
                  >
                    <ApperIcon name="Edit" size={16} />
                    <span>Manual Entry</span>
                  </button>
                </div>
              </motion.div>
            )}
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
      
      {/* Manual Expense Form Modal */}
      {showManualForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowManualForm(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md"
          >
            <Card className="max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-heading font-bold text-surface-900">
                    Add Manual Expense
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowManualForm(false)}
                    className="p-2 text-surface-400 hover:text-surface-600 rounded-lg hover:bg-surface-100"
                  >
                    <ApperIcon name="X" size={20} />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Input
                      label="Merchant Name"
                      placeholder="Enter merchant name"
                      value={formData.merchantName}
                      onChange={(e) => handleFormChange('merchantName', e.target.value)}
                      error={formErrors.merchantName}
                      required
                    />
                  </div>
                  
                  <div>
                    <Input
                      label="Amount"
                      type="number"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => handleFormChange('amount', e.target.value)}
                      error={formErrors.amount}
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleFormChange('category', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-surface-300 rounded-lg focus:border-primary focus:outline-none bg-white"
                      required
                    >
                      <option value="meals">Meals</option>
                      <option value="transportation">Transportation</option>
                      <option value="lodging">Lodging</option>
                      <option value="conference">Conference</option>
                      <option value="supplies">Supplies</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">
                      Trip
                    </label>
                    <select
                      value={formData.tripId}
                      onChange={(e) => handleFormChange('tripId', e.target.value)}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:border-primary focus:outline-none bg-white ${
                        formErrors.tripId ? 'border-error' : 'border-surface-300'
                      }`}
                      required
                    >
                      <option value="">Select a trip</option>
                      {trips.map(trip => (
                        <option key={trip.id} value={trip.id}>
                          {trip.name}
                        </option>
                      ))}
                    </select>
                    {formErrors.tripId && (
                      <p className="mt-1 text-sm text-error">{formErrors.tripId}</p>
                    )}
                  </div>
                  
                  <div>
                    <Input
                      label="Date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleFormChange('date', e.target.value)}
                      error={formErrors.date}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => handleFormChange('notes', e.target.value)}
                      placeholder="Add any additional notes..."
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-surface-300 rounded-lg focus:border-primary focus:outline-none bg-white resize-none"
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-surface-200">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowManualForm(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={submitting}
                    icon={submitting ? undefined : "Plus"}
                  >
                    {submitting ? 'Adding...' : 'Add Expense'}
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

export default Expenses
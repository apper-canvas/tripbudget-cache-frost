import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { format } from 'date-fns'
import ApperIcon from '@/components/ApperIcon'
import Button from '@/components/atoms/Button'
import Card from '@/components/atoms/Card'
import Badge from '@/components/atoms/Badge'
import SkeletonLoader from '@/components/molecules/SkeletonLoader'
import EmptyState from '@/components/molecules/EmptyState'
import ErrorState from '@/components/molecules/ErrorState'
import { expenseService, tripService } from '@/services'

const Reports = () => {
  const [trips, setTrips] = useState([])
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedTrip, setSelectedTrip] = useState('')
  const [generatingReport, setGeneratingReport] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [reportData, setReportData] = useState(null)
  const [reports, setReports] = useState([])
  
  useEffect(() => {
    loadReportsData()
  }, [])
  
  const loadReportsData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [tripsResult, expensesResult] = await Promise.all([
        tripService.getAll(),
        expenseService.getAll()
      ])
      
      setTrips(tripsResult)
      setExpenses(expensesResult)
      
      // Mock previous reports
      setReports([
        {
          id: '1',
          tripName: 'Q1 Sales Conference - San Francisco',
          generatedDate: '2024-02-20',
          status: 'submitted',
          totalAmount: 849
        },
        {
          id: '2',
          tripName: 'Trade Show - Las Vegas',
          generatedDate: '2024-01-25',
          status: 'approved',
          totalAmount: 1250
        }
      ])
      
      if (tripsResult.length > 0) {
        setSelectedTrip(tripsResult[0].id)
      }
    } catch (err) {
      setError(err.message || 'Failed to load reports data')
      toast.error('Failed to load reports data')
    } finally {
      setLoading(false)
    }
  }
  
  const getTripExpenses = (tripId) => {
    return expenses.filter(expense => expense.tripId === tripId)
  }
  
  const generateReport = async () => {
    if (!selectedTrip) {
      toast.error('Please select a trip')
      return
    }
    
    setGeneratingReport(true)
    
    try {
      // Simulate report generation delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const trip = trips.find(t => t.id === selectedTrip)
      const tripExpenses = getTripExpenses(selectedTrip)
      
      const report = {
        trip,
        expenses: tripExpenses,
        totalAmount: tripExpenses.reduce((sum, expense) => sum + expense.amount, 0),
        expensesByCategory: tripExpenses.reduce((acc, expense) => {
          acc[expense.category] = (acc[expense.category] || 0) + expense.amount
          return acc
        }, {}),
        complianceIssues: tripExpenses.filter(expense => !expense.isCompliant),
        generatedDate: new Date().toISOString()
      }
      
      setReportData(report)
      setShowPreview(true)
      toast.success('Report generated successfully!')
    } catch (err) {
      toast.error('Failed to generate report')
    } finally {
      setGeneratingReport(false)
    }
  }
  
  const downloadReport = (format) => {
    if (!reportData) return
    
    // Mock download - in real app would generate actual PDF/CSV
    const fileName = `expense-report-${reportData.trip.name.replace(/\s+/g, '-').toLowerCase()}-${format.toLowerCase()}`
    
    toast.success(`${format} report downloaded: ${fileName}`)
  }
  
  const submitReport = () => {
    if (!reportData) return
    
    const newReport = {
      id: Date.now().toString(),
      tripName: reportData.trip.name,
      generatedDate: format(new Date(), 'yyyy-MM-dd'),
      status: 'submitted',
      totalAmount: reportData.totalAmount
    }
    
    setReports(prev => [newReport, ...prev])
    setShowPreview(false)
    setReportData(null)
    toast.success('Report submitted for approval!')
  }
  
  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount)
  }
  
  const getStatusBadge = (status) => {
    const variants = {
      submitted: { variant: 'info', label: 'Submitted' },
      approved: { variant: 'success', label: 'Approved' },
      rejected: { variant: 'error', label: 'Rejected' },
      draft: { variant: 'default', label: 'Draft' }
    }
    return variants[status] || variants.draft
  }
  
  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-full overflow-hidden">
        <div>
          <div className="h-8 bg-surface-200 rounded w-32 mb-2 animate-pulse" />
          <div className="h-4 bg-surface-200 rounded w-48 animate-pulse" />
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
          onRetry={loadReportsData}
        />
      </div>
    )
  }
  
  return (
    <div className="p-6 space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-surface-900">
          Reports
        </h1>
        <p className="text-surface-600">
          Generate and manage expense reports for reimbursement
        </p>
      </div>
      
      {/* Generate New Report */}
      <Card className="space-y-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <ApperIcon name="FileText" size={24} className="text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-heading font-semibold text-surface-900">
              Generate New Report
            </h2>
            <p className="text-surface-600 text-sm">
              Create a comprehensive expense report for reimbursement
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-2">
              Select Trip
            </label>
            <select
              value={selectedTrip}
              onChange={(e) => setSelectedTrip(e.target.value)}
              className="w-full px-4 py-3 border-2 border-surface-300 rounded-lg focus:border-primary focus:outline-none bg-white"
            >
              <option value="">Choose a trip...</option>
              {trips.map(trip => {
                const tripExpenses = getTripExpenses(trip.id)
                return (
                  <option key={trip.id} value={trip.id}>
                    {trip.name} ({tripExpenses.length} expense{tripExpenses.length !== 1 ? 's' : ''})
                  </option>
                )
              })}
            </select>
          </div>
          
          <div className="flex items-end">
            <Button
              variant="primary"
              icon="FileText"
              loading={generatingReport}
              onClick={generateReport}
              disabled={!selectedTrip}
              className="w-full"
            >
              {generatingReport ? 'Generating...' : 'Generate Report'}
            </Button>
          </div>
        </div>
        
        {selectedTrip && (
          <div className="pt-4 border-t border-surface-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {(() => {
                const tripExpenses = getTripExpenses(selectedTrip)
                const totalAmount = tripExpenses.reduce((sum, expense) => sum + expense.amount, 0)
                const complianceIssues = tripExpenses.filter(expense => !expense.isCompliant).length
                
                return [
                  { label: 'Total Expenses', value: tripExpenses.length },
                  { label: 'Total Amount', value: formatCurrency(totalAmount) },
                  { label: 'Receipts', value: tripExpenses.filter(e => e.receiptUrl).length },
                  { label: 'Policy Issues', value: complianceIssues }
                ].map(stat => (
                  <div key={stat.label}>
                    <p className="text-2xl font-bold text-surface-900">{stat.value}</p>
                    <p className="text-sm text-surface-500">{stat.label}</p>
                  </div>
                ))
              })()}
            </div>
          </div>
        )}
      </Card>
      
      {/* Previous Reports */}
      <div>
        <h2 className="text-lg font-heading font-semibold text-surface-900 mb-4">
          Previous Reports
        </h2>
        
        {reports.length === 0 ? (
          <EmptyState
            icon="FileText"
            title="No reports yet"
            description="Generate your first expense report to get started"
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {reports.map((report, index) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card hover className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-surface-900 truncate">
                        {report.tripName}
                      </h3>
                      <p className="text-sm text-surface-500 mt-1">
                        Generated on {format(new Date(report.generatedDate), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <Badge {...getStatusBadge(report.status)} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-surface-900">
                      {formatCurrency(report.totalAmount)}
                    </span>
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" icon="Download">
                        Download
                      </Button>
                      <Button variant="ghost" size="sm" icon="Eye">
                        View
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      
      {/* Report Preview Modal */}
      <AnimatePresence>
        {showPreview && reportData && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowPreview(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-surface-200 p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-heading font-semibold text-surface-900">
                      Expense Report Preview
                    </h2>
                    <button
                      onClick={() => setShowPreview(false)}
                      className="p-2 hover:bg-surface-100 rounded-lg transition-colors"
                    >
                      <ApperIcon name="X" size={20} />
                    </button>
                  </div>
                </div>
                
                <div className="p-6 space-y-6">
                  {/* Report Header */}
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold text-surface-900">
                      {reportData.trip.name}
                    </h3>
                    <p className="text-surface-600">
                      {format(new Date(reportData.trip.startDate), 'MMM dd')} - {format(new Date(reportData.trip.endDate), 'MMM dd, yyyy')}
                    </p>
                    <p className="text-3xl font-bold text-primary">
                      {formatCurrency(reportData.totalAmount)}
                    </p>
                  </div>
                  
                  {/* Summary Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-surface-50 rounded-lg">
                      <p className="text-2xl font-bold text-surface-900">{reportData.expenses.length}</p>
                      <p className="text-sm text-surface-500">Total Expenses</p>
                    </div>
                    <div className="text-center p-4 bg-surface-50 rounded-lg">
                      <p className="text-2xl font-bold text-surface-900">
                        {reportData.expenses.filter(e => e.receiptUrl).length}
                      </p>
                      <p className="text-sm text-surface-500">With Receipts</p>
                    </div>
                    <div className="text-center p-4 bg-surface-50 rounded-lg">
                      <p className="text-2xl font-bold text-surface-900">
                        {Object.keys(reportData.expensesByCategory).length}
                      </p>
                      <p className="text-sm text-surface-500">Categories</p>
                    </div>
                    <div className="text-center p-4 bg-surface-50 rounded-lg">
                      <p className={`text-2xl font-bold ${reportData.complianceIssues.length > 0 ? 'text-error' : 'text-success'}`}>
                        {reportData.complianceIssues.length}
                      </p>
                      <p className="text-sm text-surface-500">Policy Issues</p>
                    </div>
                  </div>
                  
                  {/* Category Breakdown */}
                  <div>
                    <h4 className="font-semibold text-surface-900 mb-3">Expenses by Category</h4>
                    <div className="space-y-2">
                      {Object.entries(reportData.expensesByCategory).map(([category, amount]) => (
                        <div key={category} className="flex items-center justify-between p-3 bg-surface-50 rounded-lg">
                          <span className="capitalize font-medium">{category}</span>
                          <span className="font-semibold">{formatCurrency(amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Compliance Issues */}
                  {reportData.complianceIssues.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-error mb-3">
                        Policy Compliance Issues ({reportData.complianceIssues.length})
                      </h4>
                      <div className="space-y-2">
                        {reportData.complianceIssues.map(expense => (
                          <div key={expense.id} className="p-3 bg-error/5 border border-error/20 rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{expense.merchantName}</span>
                              <span className="font-semibold text-error">{formatCurrency(expense.amount)}</span>
                            </div>
                            <p className="text-sm text-surface-600 mt-1">
                              {expense.notes || 'Exceeds policy limits'}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="sticky bottom-0 bg-white border-t border-surface-200 p-6">
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => downloadReport('PDF')}
                      icon="Download"
                      className="flex-1"
                    >
                      Download PDF
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => downloadReport('CSV')}
                      icon="Download"
                      className="flex-1"
                    >
                      Download CSV
                    </Button>
                    <Button
                      variant="primary"
                      onClick={submitReport}
                      icon="Send"
                      className="flex-1"
                    >
                      Submit for Approval
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Reports
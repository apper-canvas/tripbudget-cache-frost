import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import ApperIcon from '@/components/ApperIcon'
import Button from '@/components/atoms/Button'
import Card from '@/components/atoms/Card'
import Badge from '@/components/atoms/Badge'
import EmptyState from '@/components/molecules/EmptyState'
import SkeletonLoader from '@/components/molecules/SkeletonLoader'
import receiptService from '@/services/api/receiptService'
import expenseService from '@/services/api/expenseService'
import tripService from '@/services/api/tripService'

const EmailReceipts = () => {
  const [emailReceipts, setEmailReceipts] = useState([])
  const [selectedEmail, setSelectedEmail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [trips, setTrips] = useState([])
  const [selectedTrip, setSelectedTrip] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    loadEmailReceipts()
    loadTrips()
  }, [])

  const loadEmailReceipts = async () => {
    setLoading(true)
    try {
      const receipts = await receiptService.getEmailReceipts()
      setEmailReceipts(receipts)
      if (receipts.length > 0) {
        setSelectedEmail(receipts[0])
      }
    } catch (error) {
      toast.error('Failed to load email receipts')
    } finally {
      setLoading(false)
    }
  }

  const loadTrips = async () => {
    try {
      const result = await tripService.getActiveTrips()
      setTrips(result)
      if (result.length > 0) {
        setSelectedTrip(result[0].id)
      }
    } catch (error) {
      console.error('Failed to load trips:', error)
    }
  }

  const handleProcessEmail = async (email) => {
    if (!selectedTrip) {
      toast.error('Please select a trip first')
      return
    }

    setProcessing(true)
    try {
      // Process email receipt
      const result = await receiptService.processEmailReceipt(email.id)
      
      if (result.success) {
        // Create expense from email data
        const newExpense = await expenseService.create({
          tripId: selectedTrip,
          merchantName: email.extractedData.merchantName,
          amount: email.extractedData.amount,
          currency: 'USD',
          category: email.extractedData.category,
          date: email.extractedData.date,
          notes: `Processed from email: ${email.subject}`,
          isCompliant: true
        })

        // Mark email as processed
        await receiptService.markAsProcessed(email.id)
        
        // Update local state
        setEmailReceipts(prev => prev.map(e => 
          e.id === email.id ? { ...e, processed: true } : e
        ))

        toast.success('Email receipt processed successfully!')
      }
    } catch (error) {
      toast.error('Failed to process email receipt')
    } finally {
      setProcessing(false)
    }
  }

  const formatEmailDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold text-surface-900">Email Receipts</h1>
            <p className="text-surface-600 mt-1">Process receipts forwarded via email</p>
          </div>
        </div>
        <SkeletonLoader count={5} type="list" />
      </div>
    )
  }

  if (emailReceipts.length === 0) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-surface-900 mb-2">Email Receipts</h1>
          <p className="text-surface-600">Process receipts forwarded via email</p>
        </div>
        
        <EmptyState
          icon="Mail"
          title="No Email Receipts"
          description="Forward your receipt emails to start processing them automatically"
          action={{
            label: "Learn How to Forward",
            onClick: () => toast.info("Email forwarding instructions coming soon!")
          }}
        />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-surface-900">Email Receipts</h1>
          <p className="text-surface-600 mt-1">Process receipts forwarded via email</p>
        </div>
        <Button
          variant="outline"
          icon="RefreshCw"
          onClick={loadEmailReceipts}
          disabled={loading}
        >
          Refresh
        </Button>
      </div>

      {/* Trip Selection */}
      {trips.length > 0 && (
        <Card padding="md">
          <div className="flex items-center space-x-4">
            <ApperIcon name="MapPin" size={20} className="text-primary" />
            <div className="flex-1">
              <label className="block text-sm font-medium text-surface-700 mb-2">
                Process receipts for trip:
              </label>
              <select
                value={selectedTrip}
                onChange={(e) => setSelectedTrip(e.target.value)}
                className="w-full max-w-sm px-3 py-2 border border-surface-300 rounded-lg focus:border-primary focus:outline-none bg-white"
              >
                {trips.map(trip => (
                  <option key={trip.id} value={trip.id}>
                    {trip.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>
      )}

      {/* Email List and Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Email List */}
        <div className="lg:col-span-1">
          <Card padding="none">
            <div className="p-4 border-b border-surface-200">
              <h3 className="font-semibold text-surface-900">Inbox</h3>
              <p className="text-sm text-surface-600">
                {emailReceipts.filter(e => !e.processed).length} unprocessed
              </p>
            </div>
            
            <div className="divide-y divide-surface-200 max-h-96 overflow-y-auto">
              {emailReceipts.map((email) => (
                <motion.button
                  key={email.id}
                  onClick={() => setSelectedEmail(email)}
                  className={`w-full p-4 text-left hover:bg-surface-50 transition-colors ${
                    selectedEmail?.id === email.id ? 'bg-primary/5 border-r-2 border-primary' : ''
                  }`}
                  whileHover={{ x: 2 }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="text-sm font-medium text-surface-900 truncate">
                          {email.from}
                        </p>
                        {email.processed ? (
                          <Badge variant="success" size="sm">Processed</Badge>
                        ) : (
                          <Badge variant="warning" size="sm">Pending</Badge>
                        )}
                      </div>
                      <p className="text-sm text-surface-700 truncate mb-1">
                        {email.subject}
                      </p>
                      <p className="text-xs text-surface-500">
                        {formatEmailDate(email.date)}
                      </p>
                    </div>
                    <ApperIcon name="ChevronRight" size={16} className="text-surface-400 mt-1" />
                  </div>
                </motion.button>
              ))}
            </div>
          </Card>
        </div>

        {/* Email Preview and Processing */}
        <div className="lg:col-span-2">
          {selectedEmail ? (
            <Card padding="lg">
              <div className="space-y-6">
                {/* Email Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-surface-900 mb-2">
                      {selectedEmail.subject}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-surface-600">
                      <span>From: {selectedEmail.from}</span>
                      <span>{formatEmailDate(selectedEmail.date)}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {selectedEmail.processed ? (
                      <Badge variant="success">Processed</Badge>
                    ) : (
                      <Badge variant="warning">Pending</Badge>
                    )}
                  </div>
                </div>

                {/* Extracted Data Preview */}
                {selectedEmail.extractedData && (
                  <div className="bg-surface-50 p-4 rounded-lg">
                    <h4 className="font-medium text-surface-900 mb-3">Extracted Information</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-surface-600">Merchant:</span>
                        <p className="font-medium">{selectedEmail.extractedData.merchantName}</p>
                      </div>
                      <div>
                        <span className="text-surface-600">Amount:</span>
                        <p className="font-medium">${selectedEmail.extractedData.amount}</p>
                      </div>
                      <div>
                        <span className="text-surface-600">Date:</span>
                        <p className="font-medium">{selectedEmail.extractedData.date}</p>
                      </div>
                      <div>
                        <span className="text-surface-600">Category:</span>
                        <p className="font-medium capitalize">{selectedEmail.extractedData.category}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Attachments */}
                {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                  <div>
                    <h4 className="font-medium text-surface-900 mb-2">Attachments</h4>
                    <div className="space-y-2">
                      {selectedEmail.attachments.map((attachment, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-surface-50 rounded-lg">
                          <ApperIcon name="Paperclip" size={16} className="text-surface-600" />
                          <span className="text-sm text-surface-700">{attachment}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Email Body Preview */}
                <div>
                  <h4 className="font-medium text-surface-900 mb-2">Email Content</h4>
                  <div className="bg-surface-50 p-4 rounded-lg">
                    <p className="text-sm text-surface-700 whitespace-pre-wrap">
                      {selectedEmail.body}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-surface-200">
                  {!selectedEmail.processed ? (
                    <>
                      <Button
                        variant="primary"
                        icon="Download"
                        onClick={() => handleProcessEmail(selectedEmail)}
                        disabled={processing || !selectedTrip}
                        loading={processing}
                        className="flex-1"
                      >
                        Process as Expense
                      </Button>
                      <Button
                        variant="outline"
                        icon="Eye"
                        onClick={() => navigate('/capture')}
                        className="flex-1"
                      >
                        Manual Review
                      </Button>
                    </>
                  ) : (
                    <div className="flex items-center space-x-2 text-success">
                      <ApperIcon name="CheckCircle" size={20} />
                      <span className="font-medium">Already processed as expense</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ) : (
            <Card padding="lg">
              <div className="text-center py-12">
                <ApperIcon name="Mail" size={48} className="text-surface-400 mx-auto mb-4" />
                <p className="text-surface-600">Select an email to preview and process</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default EmailReceipts
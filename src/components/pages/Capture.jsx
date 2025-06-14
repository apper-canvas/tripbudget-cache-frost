import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import ApperIcon from '@/components/ApperIcon'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import Card from '@/components/atoms/Card'
import Badge from '@/components/atoms/Badge'
import { receiptService, expenseService, tripService } from '@/services'

const Capture = () => {
  const [step, setStep] = useState('capture') // capture, processing, review, complete
  const [capturedImage, setCapturedImage] = useState(null)
  const [ocrResult, setOcrResult] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [trips, setTrips] = useState([])
  const [selectedTrip, setSelectedTrip] = useState('')
  const [expenseData, setExpenseData] = useState({
    merchantName: '',
    amount: '',
    category: 'meals',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  })
  
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)
  
  const categories = [
    { value: 'meals', label: 'Meals & Entertainment', icon: 'UtensilsCrossed' },
    { value: 'transportation', label: 'Transportation', icon: 'Car' },
    { value: 'lodging', label: 'Lodging', icon: 'Bed' },
    { value: 'conference', label: 'Conference & Events', icon: 'Users' },
    { value: 'supplies', label: 'Office Supplies', icon: 'Package' },
    { value: 'other', label: 'Other', icon: 'FileText' }
  ]
  
  // Load trips when component mounts
  useState(() => {
    const loadTrips = async () => {
      try {
        const result = await tripService.getActiveTrips()
        setTrips(result)
        if (result.length > 0) {
          setSelectedTrip(result[0].id)
        }
      } catch (error) {
        toast.error('Failed to load trips')
      }
    }
    loadTrips()
  }, [])
  
  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      processReceiptImage(file)
    }
  }
  
  const handleCameraCapture = (event) => {
    const file = event.target.files[0]
    if (file) {
      processReceiptImage(file)
    }
  }
  
  const processReceiptImage = async (file) => {
    // Create preview URL
    const previewUrl = URL.createObjectURL(file)
    setCapturedImage(previewUrl)
    setStep('processing')
    setProcessing(true)
    
    try {
      // Process OCR
      const result = await receiptService.processOCR(file)
      setOcrResult(result)
      
      // Pre-fill form with OCR results
      setExpenseData(prev => ({
        ...prev,
        merchantName: result.merchantName || '',
        amount: result.amount?.toString() || '',
        date: result.date || prev.date,
        category: result.category || 'meals'
      }))
      
      setStep('review')
      toast.success('Receipt processed successfully!')
    } catch (error) {
      toast.error('Failed to process receipt')
      setStep('capture')
    } finally {
      setProcessing(false)
    }
  }
  
  const handleSaveExpense = async () => {
    if (!expenseData.merchantName || !expenseData.amount || !selectedTrip) {
      toast.error('Please fill in all required fields')
      return
    }
    
    try {
      const newExpense = await expenseService.create({
        tripId: selectedTrip,
        merchantName: expenseData.merchantName,
        amount: parseFloat(expenseData.amount),
        currency: 'USD',
        category: expenseData.category,
        date: expenseData.date,
        notes: expenseData.notes,
        receiptUrl: capturedImage,
        isCompliant: true // Default to compliant, would be checked by policy engine
      })
      
      // Create receipt record
      if (ocrResult) {
        await receiptService.create({
          expenseId: newExpense.id,
          imageUrl: capturedImage,
          ocrData: ocrResult,
          confidence: ocrResult.confidence || 0.85
        })
      }
      
      setStep('complete')
      toast.success('Expense saved successfully!')
    } catch (error) {
      toast.error('Failed to save expense')
    }
  }
  
  const resetCapture = () => {
    setStep('capture')
    setCapturedImage(null)
    setOcrResult(null)
    setExpenseData({
      merchantName: '',
      amount: '',
      category: 'meals',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    })
  }
  
  const renderCaptureStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center space-y-6"
    >
      <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
        <ApperIcon name="Camera" size={48} className="text-primary" />
      </div>
      
      <div>
        <h2 className="text-2xl font-heading font-bold text-surface-900 mb-2">
          Capture Receipt
        </h2>
        <p className="text-surface-600">
          Take a photo or upload an image of your receipt
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
        <Button
          variant="primary"
          icon="Camera"
          onClick={() => cameraInputRef.current?.click()}
          className="py-4"
        >
          Take Photo
        </Button>
        
        <Button
          variant="outline"
          icon="Upload"
          onClick={() => fileInputRef.current?.click()}
          className="py-4"
        >
          Upload File
        </Button>
      </div>
      
      <input
        type="file"
        ref={cameraInputRef}
        onChange={handleCameraCapture}
        accept="image/*"
        capture="environment"
        className="hidden"
      />
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />
    </motion.div>
  )
  
  const renderProcessingStep = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6"
    >
      <div className="mx-auto w-24 h-24 bg-accent/10 rounded-full flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <ApperIcon name="Loader2" size={48} className="text-accent" />
        </motion.div>
      </div>
      
      <div>
        <h2 className="text-2xl font-heading font-bold text-surface-900 mb-2">
          Processing Receipt
        </h2>
        <p className="text-surface-600">
          Extracting information from your receipt...
        </p>
      </div>
      
      {capturedImage && (
        <div className="max-w-xs mx-auto">
          <img
            src={capturedImage}
            alt="Captured receipt"
            className="w-full rounded-lg shadow-md"
          />
        </div>
      )}
    </motion.div>
  )
  
  const renderReviewStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-2xl font-heading font-bold text-surface-900 mb-2">
          Review & Save
        </h2>
        <p className="text-surface-600">
          Verify the extracted information and save your expense
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Receipt Preview */}
        <div className="space-y-4">
          <h3 className="font-semibold text-surface-900">Receipt Preview</h3>
          {capturedImage && (
            <div className="relative">
              <img
                src={capturedImage}
                alt="Captured receipt"
                className="w-full rounded-lg shadow-md max-h-96 object-cover"
              />
              {ocrResult && (
                <div className="absolute top-2 right-2">
                  <Badge variant="success" size="sm">
                    {Math.round((ocrResult.confidence || 0.85) * 100)}% confidence
                  </Badge>
                </div>
              )}
            </div>
          )}
        </div>
{/* Expense Form */}
        <div className="space-y-6">
          <h3 className="font-semibold text-surface-900">Expense Details</h3>
          
{trips.length > 0 && (
            <Input
              label="Trip"
              type="select"
              labelPosition="above"
              value={selectedTrip}
              onChange={(e) => setSelectedTrip(e.target.value)}
              options={trips.map(trip => ({
                value: trip.id,
                label: trip.name
              }))}
              required
            />
          )}
          
          <div className="mb-6">
            <Input
              label="Merchant Name"
              labelPosition="above"
              value={expenseData.merchantName}
              onChange={(e) => setExpenseData(prev => ({ ...prev, merchantName: e.target.value }))}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <Input
              label="Amount"
              type="number"
              step="0.01"
              value={expenseData.amount}
              onChange={(e) => setExpenseData(prev => ({ ...prev, amount: e.target.value }))}
              required
            />
            <Input
              label="Date"
              type="date"
              value={expenseData.date}
              onChange={(e) => setExpenseData(prev => ({ ...prev, date: e.target.value }))}
              required
            />
          </div>
          
<div>
            <label className="block text-sm font-medium text-surface-700 mb-2">
              Category
            </label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map(category => (
                <button
                  key={category.value}
                  onClick={() => setExpenseData(prev => ({ ...prev, category: category.value }))}
                  className={`
                    p-3 rounded-lg border-2 transition-all text-left
                    ${expenseData.category === category.value
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-surface-300 hover:border-surface-400'
                    }
                  `}
                >
                  <div className="flex items-center space-x-2">
                    <ApperIcon name={category.icon} size={16} />
                    <span className="text-sm font-medium">{category.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          <Input
            label="Notes (Optional)"
            value={expenseData.notes}
            onChange={(e) => setExpenseData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Add any additional notes..."
          />
        </div>
      </div>
      
      <div className="flex gap-3">
        <Button
          variant="ghost"
          onClick={resetCapture}
          className="flex-1"
        >
          Start Over
        </Button>
        <Button
          variant="primary"
          onClick={handleSaveExpense}
          className="flex-1"
        >
          Save Expense
        </Button>
      </div>
    </motion.div>
  )
  
  const renderCompleteStep = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring' }}
        className="mx-auto w-24 h-24 bg-success/10 rounded-full flex items-center justify-center"
      >
        <ApperIcon name="CheckCircle" size={48} className="text-success" />
      </motion.div>
      
      <div>
        <h2 className="text-2xl font-heading font-bold text-surface-900 mb-2">
          Expense Saved!
        </h2>
        <p className="text-surface-600">
          Your receipt has been processed and expense added to your trip
        </p>
      </div>
      
      <div className="flex gap-3 max-w-md mx-auto">
        <Button
          variant="outline"
          onClick={resetCapture}
          className="flex-1"
        >
          Capture Another
        </Button>
        <Button
          variant="primary"
          onClick={() => window.history.back()}
          className="flex-1"
        >
          Done
        </Button>
      </div>
    </motion.div>
  )
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-center space-x-2 mb-8">
          {['capture', 'processing', 'review', 'complete'].map((stepName, index) => (
            <div key={stepName} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${['capture', 'processing', 'review', 'complete'].indexOf(step) >= index
                  ? 'bg-primary text-white'
                  : 'bg-surface-200 text-surface-500'
                }
              `}>
                {index + 1}
              </div>
              {index < 3 && (
                <div className={`
                  w-8 h-0.5 mx-2
                  ${['capture', 'processing', 'review', 'complete'].indexOf(step) > index
                    ? 'bg-primary'
                    : 'bg-surface-200'
                  }
                `} />
              )}
            </div>
          ))}
        </div>
      </div>
      
      <Card padding="lg">
        <AnimatePresence mode="wait">
          {step === 'capture' && renderCaptureStep()}
          {step === 'processing' && renderProcessingStep()}
          {step === 'review' && renderReviewStep()}
          {step === 'complete' && renderCompleteStep()}
        </AnimatePresence>
      </Card>
    </div>
  )
}

export default Capture
import receiptData from '../mockData/receipts.json'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

class ReceiptService {
  constructor() {
    this.data = [...receiptData]
  }

  async getAll() {
    await delay(300)
    return [...this.data]
  }

  async getById(id) {
    await delay(200)
    const receipt = this.data.find(item => item.id === id)
    return receipt ? { ...receipt } : null
  }

  async create(receipt) {
    await delay(400)
    const newReceipt = {
      ...receipt,
      id: Date.now().toString(),
      processedAt: new Date().toISOString()
    }
    this.data.push(newReceipt)
    return { ...newReceipt }
  }

  async update(id, updates) {
    await delay(350)
    const index = this.data.findIndex(item => item.id === id)
    if (index === -1) throw new Error('Receipt not found')
    
    this.data[index] = { ...this.data[index], ...updates }
    return { ...this.data[index] }
  }

  async delete(id) {
    await delay(250)
    const index = this.data.findIndex(item => item.id === id)
    if (index === -1) throw new Error('Receipt not found')
    
    this.data.splice(index, 1)
    return true
  }

  async processOCR(imageFile) {
    await delay(2000) // Simulate OCR processing time
    
    // Mock OCR results
    const mockOCRResult = {
      merchantName: "Sample Restaurant",
      amount: Math.floor(Math.random() * 10000) / 100,
      date: new Date().toISOString().split('T')[0],
      category: "meals",
      confidence: 0.85 + Math.random() * 0.15
    }
    
    return mockOCRResult
  }

  async getByExpenseId(expenseId) {
    await delay(200)
    return this.data.filter(receipt => receipt.expenseId === expenseId).map(receipt => ({ ...receipt }))
  }
}

export default new ReceiptService()
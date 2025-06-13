import expenseData from '../mockData/expenses.json'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

class ExpenseService {
  constructor() {
    this.data = [...expenseData]
  }

  async getAll() {
    await delay(300)
    return [...this.data]
  }

  async getById(id) {
    await delay(200)
    const expense = this.data.find(item => item.id === id)
    return expense ? { ...expense } : null
  }

  async create(expense) {
    await delay(400)
    const newExpense = {
      ...expense,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    this.data.push(newExpense)
    return { ...newExpense }
  }

  async update(id, updates) {
    await delay(350)
    const index = this.data.findIndex(item => item.id === id)
    if (index === -1) throw new Error('Expense not found')
    
    this.data[index] = { 
      ...this.data[index], 
      ...updates,
      updatedAt: new Date().toISOString()
    }
    return { ...this.data[index] }
  }

  async delete(id) {
    await delay(250)
    const index = this.data.findIndex(item => item.id === id)
    if (index === -1) throw new Error('Expense not found')
    
    this.data.splice(index, 1)
    return true
  }

  async getByTripId(tripId) {
    await delay(250)
    return this.data.filter(expense => expense.tripId === tripId).map(expense => ({ ...expense }))
  }

  async getByCategory(category) {
    await delay(200)
    return this.data.filter(expense => expense.category === category).map(expense => ({ ...expense }))
  }

  async getTotalByTrip(tripId) {
    await delay(200)
    const tripExpenses = this.data.filter(expense => expense.tripId === tripId)
    return tripExpenses.reduce((total, expense) => total + expense.amount, 0)
  }
}

  // Analytics methods for dashboard insights
  async getSpendingTrends() {
    await delay(300)
    const expenses = [...this.data]
    const monthlyData = {}
    
    expenses.forEach(expense => {
      const date = new Date(expense.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = 0
      }
      monthlyData[monthKey] += expense.amount
    })
    
    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, amount]) => ({ month, amount }))
  }

  async getVendorBreakdown() {
    await delay(250)
    const expenses = [...this.data]
    const vendorData = {}
    
    expenses.forEach(expense => {
      const vendor = expense.merchantName
      vendorData[vendor] = (vendorData[vendor] || 0) + expense.amount
    })
    
    return Object.entries(vendorData)
      .sort(([, a], [, b]) => b - a)
      .map(([vendor, amount]) => ({ vendor, amount }))
  }

  async getCategoryBreakdown() {
    await delay(250)
    const expenses = [...this.data]
    const categoryData = {}
    
    expenses.forEach(expense => {
      const category = expense.category
      categoryData[category] = (categoryData[category] || 0) + expense.amount
    })
    
    return Object.entries(categoryData)
      .sort(([, a], [, b]) => b - a)
      .map(([category, amount]) => ({ category, amount }))
  }
}

export default new ExpenseService()
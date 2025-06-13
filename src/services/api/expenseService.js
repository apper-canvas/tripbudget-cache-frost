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

export default new ExpenseService()
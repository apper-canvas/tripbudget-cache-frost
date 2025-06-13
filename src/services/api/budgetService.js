import budgetData from '../mockData/budgets.json'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

class BudgetService {
  constructor() {
    this.data = [...budgetData]
  }

  async getAll() {
    await delay(300)
    return [...this.data]
  }

  async getById(id) {
    await delay(200)
    const budget = this.data.find(item => item.id === id)
    return budget ? { ...budget } : null
  }

  async create(budget) {
    await delay(400)
    const newBudget = {
      ...budget,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    }
    this.data.push(newBudget)
    return { ...newBudget }
  }

  async update(id, updates) {
    await delay(350)
    const index = this.data.findIndex(item => item.id === id)
    if (index === -1) throw new Error('Budget not found')
    
    this.data[index] = { ...this.data[index], ...updates }
    return { ...this.data[index] }
  }

  async delete(id) {
    await delay(250)
    const index = this.data.findIndex(item => item.id === id)
    if (index === -1) throw new Error('Budget not found')
    
    this.data.splice(index, 1)
    return true
  }

  async getByTripId(tripId) {
    await delay(200)
    const budget = this.data.find(item => item.tripId === tripId)
    return budget ? { ...budget } : null
  }

  async calculateSpendingProgress(tripId, totalSpent) {
    await delay(200)
    const budget = this.data.find(item => item.tripId === tripId)
    if (!budget) return null

    const percentage = (totalSpent / budget.totalAmount) * 100
    const status = percentage >= 90 ? 'danger' : percentage >= 75 ? 'warning' : 'good'
    
    return {
      percentage: Math.min(percentage, 100),
      status,
      remaining: Math.max(budget.totalAmount - totalSpent, 0),
      isOverBudget: totalSpent > budget.totalAmount
    }
  }
}

export default new BudgetService()
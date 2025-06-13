import tripData from '../mockData/trips.json'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

class TripService {
  constructor() {
    this.data = [...tripData]
  }

  async getAll() {
    await delay(300)
    return [...this.data]
  }

  async getById(id) {
    await delay(200)
    const trip = this.data.find(item => item.id === id)
    return trip ? { ...trip } : null
  }

  async create(trip) {
    await delay(400)
    const newTrip = {
      ...trip,
      id: Date.now().toString(),
      status: 'active',
      createdAt: new Date().toISOString()
    }
    this.data.push(newTrip)
    return { ...newTrip }
  }

  async update(id, updates) {
    await delay(350)
    const index = this.data.findIndex(item => item.id === id)
    if (index === -1) throw new Error('Trip not found')
    
    this.data[index] = { ...this.data[index], ...updates }
    return { ...this.data[index] }
  }

  async delete(id) {
    await delay(250)
    const index = this.data.findIndex(item => item.id === id)
    if (index === -1) throw new Error('Trip not found')
    
    this.data.splice(index, 1)
    return true
  }

  async getActiveTrips() {
    await delay(200)
    return this.data.filter(trip => trip.status === 'active').map(trip => ({ ...trip }))
  }

  async getTripsByDateRange(startDate, endDate) {
    await delay(300)
    return this.data.filter(trip => {
      const tripStart = new Date(trip.startDate)
      const tripEnd = new Date(trip.endDate)
      return tripStart >= new Date(startDate) && tripEnd <= new Date(endDate)
    }).map(trip => ({ ...trip }))
  }
}

export default new TripService()
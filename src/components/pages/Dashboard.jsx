import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import ApperIcon from '@/components/ApperIcon'
import TripOverview from '@/components/organisms/TripOverview'
import RecentExpenses from '@/components/organisms/RecentExpenses'
import QuickActions from '@/components/organisms/QuickActions'
import { expenseService, tripService } from '@/services'

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalExpenses: 0,
    monthlySpend: 0,
    activeTrips: 0,
    pendingReports: 0
  })
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    loadDashboardStats()
  }, [])
  
  const loadDashboardStats = async () => {
    setLoading(true)
    try {
      const [expenses, trips] = await Promise.all([
        expenseService.getAll(),
        tripService.getAll()
      ])
      
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()
      
      const monthlyExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date)
        return expenseDate.getMonth() === currentMonth && 
               expenseDate.getFullYear() === currentYear
      })
      
      const activeTrips = trips.filter(trip => trip.status === 'active')
      
      setStats({
        totalExpenses: expenses.length,
        monthlySpend: monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0),
        activeTrips: activeTrips.length,
        pendingReports: Math.floor(Math.random() * 5) + 1 // Mock data
      })
    } catch (error) {
      toast.error('Failed to load dashboard statistics')
    } finally {
      setLoading(false)
    }
  }
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }
  
  const statCards = [
    {
      label: 'Total Expenses',
      value: stats.totalExpenses,
      icon: 'Receipt',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      label: 'Monthly Spend',
      value: formatCurrency(stats.monthlySpend),
      icon: 'DollarSign',
      color: 'text-accent',
      bgColor: 'bg-accent/10'
    },
    {
      label: 'Active Trips',
      value: stats.activeTrips,
      icon: 'MapPin',
      color: 'text-secondary',
      bgColor: 'bg-secondary/10'
    },
    {
      label: 'Pending Reports',
      value: stats.pendingReports,
      icon: 'FileText',
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    }
  ]
  
  return (
    <div className="p-6 space-y-8 max-w-full overflow-hidden">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center md:text-left"
      >
        <h1 className="text-3xl font-heading font-bold text-surface-900 mb-2">
          Welcome back!
        </h1>
        <p className="text-surface-600">
          Here's what's happening with your travel expenses
        </p>
      </motion.div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-4 md:p-6 border border-surface-200 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 md:p-3 rounded-lg ${stat.bgColor}`}>
                <ApperIcon name={stat.icon} size={20} className={stat.color} />
              </div>
            </div>
            
            <div>
              <p className="text-2xl md:text-3xl font-bold text-surface-900 mb-1">
                {loading ? '...' : stat.value}
              </p>
              <p className="text-sm text-surface-500 break-words">
                {stat.label}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Quick Actions */}
      <QuickActions />
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Trip Overview - Takes 2 columns on xl screens */}
        <div className="xl:col-span-2">
          <TripOverview />
        </div>
        
        {/* Recent Expenses - Takes 1 column on xl screens */}
        <div className="xl:col-span-1">
          <RecentExpenses />
        </div>
      </div>
    </div>
  )
}

export default Dashboard
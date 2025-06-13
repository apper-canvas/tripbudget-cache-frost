import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import Chart from 'react-apexcharts'
import ApperIcon from '@/components/ApperIcon'
import TripOverview from '@/components/organisms/TripOverview'
import RecentExpenses from '@/components/organisms/RecentExpenses'
import QuickActions from '@/components/organisms/QuickActions'

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalExpenses: 0,
    monthlySpend: 0,
    activeTrips: 0,
    pendingReports: 0
})
  const [chartData, setChartData] = useState({
    spendingTrends: [],
    vendorBreakdown: [],
    categoryBreakdown: []
  })
  const [loading, setLoading] = useState(false)
  
useEffect(() => {
    loadDashboardStats()
    loadChartData()
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
  
  const loadChartData = async () => {
    try {
      const [spendingTrends, vendorBreakdown, categoryBreakdown] = await Promise.all([
        expenseService.getSpendingTrends(),
        expenseService.getVendorBreakdown(),
        expenseService.getCategoryBreakdown()
      ])
      
      setChartData({
        spendingTrends,
        vendorBreakdown,
        categoryBreakdown
      })
    } catch (error) {
      console.error('Failed to load chart data:', error)
    }
  }
  
  const getSpendingTrendsOptions = () => ({
    chart: {
      type: 'line',
      height: 300,
      toolbar: { show: false },
      fontFamily: 'Inter, sans-serif'
    },
    colors: ['#8B5CF6'],
    stroke: {
      width: 3,
      curve: 'smooth'
    },
    xaxis: {
      categories: chartData.spendingTrends.map(item => {
        const [year, month] = item.month.split('-')
        return new Date(year, month - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      })
    },
    yaxis: {
      labels: {
        formatter: (value) => `$${value.toFixed(0)}`
      }
    },
    grid: {
      borderColor: '#f1f5f9'
    },
    tooltip: {
      y: {
        formatter: (value) => `$${value.toFixed(2)}`
      }
    }
  })
  
  const getVendorBreakdownOptions = () => ({
    chart: {
      type: 'pie',
      height: 300,
      fontFamily: 'Inter, sans-serif'
    },
    colors: ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
    labels: chartData.vendorBreakdown.slice(0, 6).map(item => item.vendor),
    legend: {
      position: 'bottom'
    },
    tooltip: {
      y: {
        formatter: (value) => `$${value.toFixed(2)}`
      }
    }
  })
  
  const getCategoryBreakdownOptions = () => ({
    chart: {
      type: 'bar',
      height: 300,
      toolbar: { show: false },
      fontFamily: 'Inter, sans-serif'
    },
    colors: ['#8B5CF6'],
    xaxis: {
      categories: chartData.categoryBreakdown.map(item => 
        item.category.charAt(0).toUpperCase() + item.category.slice(1)
      )
    },
    yaxis: {
      labels: {
        formatter: (value) => `$${value.toFixed(0)}`
      }
    },
    grid: {
      borderColor: '#f1f5f9'
    },
    tooltip: {
      y: {
        formatter: (value) => `$${value.toFixed(2)}`
      }
    }
  })
  
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
      
      {/* Analytics Charts */}
      <div className="space-y-8">
        {/* Spending Trends Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 border border-surface-200"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-surface-900">Spending Trends</h3>
              <p className="text-surface-600">Monthly expense progression</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <ApperIcon name="TrendingUp" size={24} className="text-primary" />
            </div>
          </div>
          
          {chartData.spendingTrends.length > 0 ? (
            <Chart
              options={getSpendingTrendsOptions()}
              series={[{
                name: 'Monthly Spending',
                data: chartData.spendingTrends.map(item => item.amount)
              }]}
              type="line"
              height={300}
            />
          ) : (
            <div className="h-[300px] flex items-center justify-center text-surface-500">
              Loading chart data...
            </div>
          )}
        </motion.div>

        {/* Vendor & Category Breakdowns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Vendor Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl p-6 border border-surface-200"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-surface-900">Top Vendors</h3>
                <p className="text-surface-600">Expense distribution by merchant</p>
              </div>
              <div className="p-3 bg-accent/10 rounded-lg">
                <ApperIcon name="PieChart" size={24} className="text-accent" />
              </div>
            </div>
            
            {chartData.vendorBreakdown.length > 0 ? (
              <Chart
                options={getVendorBreakdownOptions()}
                series={chartData.vendorBreakdown.slice(0, 6).map(item => item.amount)}
                type="pie"
                height={300}
              />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-surface-500">
                Loading chart data...
              </div>
            )}
          </motion.div>

          {/* Category Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl p-6 border border-surface-200"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-surface-900">Expense Categories</h3>
                <p className="text-surface-600">Spending breakdown by category</p>
              </div>
              <div className="p-3 bg-secondary/10 rounded-lg">
                <ApperIcon name="BarChart3" size={24} className="text-secondary" />
              </div>
            </div>
            
            {chartData.categoryBreakdown.length > 0 ? (
              <Chart
                options={getCategoryBreakdownOptions()}
                series={[{
                  name: 'Amount Spent',
                  data: chartData.categoryBreakdown.map(item => item.amount)
                }]}
                type="bar"
                height={300}
              />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-surface-500">
                Loading chart data...
              </div>
            )}
          </motion.div>
        </div>
      </div>
      
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
  )
}

export default Dashboard
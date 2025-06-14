import { motion } from "framer-motion";
import { differenceInDays, format, isAfter, isBefore } from "date-fns";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Badge from "@/components/atoms/Badge";
import BudgetProgress from "./BudgetProgress";
import React from "react";
const TripCard = ({ 
  trip, 
  expenses = [],
  budget = null,
  onClick,
  className = ''
}) => {
  const navigate = useNavigate()
  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const budgetAmount = budget?.totalAmount || trip.budget || 0
  
  const getTripStatus = () => {
    const now = new Date()
    const startDate = new Date(trip.startDate)
    const endDate = new Date(trip.endDate)
    
    if (isBefore(now, startDate)) return 'upcoming'
    if (isAfter(now, endDate)) return 'completed'
    return 'active'
  }
  
  const status = getTripStatus()
  
  const getStatusBadge = () => {
    const variants = {
      active: { variant: 'success', label: 'Active' },
      upcoming: { variant: 'info', label: 'Upcoming' },
      completed: { variant: 'default', label: 'Completed' }
    }
    return variants[status] || variants.completed
  }
  
  const getDuration = () => {
    const days = differenceInDays(new Date(trip.endDate), new Date(trip.startDate)) + 1
    return `${days} day${days !== 1 ? 's' : ''}`
  }
  
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM dd')
  }
  
  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }
const statusBadge = getStatusBadge()
  
  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      // Navigate to trip detail page
      navigate(`/trips/${trip.id}`)
      toast.info('Trip detail page is being prepared...')
    }
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className={`
        bg-white rounded-xl p-6 border border-surface-200 cursor-pointer
        transition-all duration-200 hover:border-primary/20 ${className}
      `}
    >
<div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="font-heading font-semibold text-surface-900 truncate">
              {trip.name}
            </h3>
            <Badge {...statusBadge} size="sm" />
          </div>
          
          <div className="flex items-center text-sm text-surface-500 space-x-4">
            <div className="flex items-center">
              <ApperIcon name="Calendar" size={16} className="mr-1" />
              {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
            </div>
            <div className="flex items-center">
              <ApperIcon name="Clock" size={16} className="mr-1" />
              {getDuration()}
            </div>
          </div>
        </div>
        
        <div className="ml-4">
          <ApperIcon name="MapPin" size={20} className="text-primary" />
        </div>
      </div>
      
      {/* Budget Progress */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-surface-600">Budget Progress</span>
            <span className="font-medium text-surface-900">
              {formatCurrency(totalSpent)} / {formatCurrency(budgetAmount, trip.currency)}
            </span>
          </div>
          
          <div className="w-full bg-surface-200 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((totalSpent / budgetAmount) * 100, 100)}%` }}
              transition={{ duration: 1, delay: 0.3 }}
              className={`
                h-2 rounded-full
                ${totalSpent / budgetAmount >= 0.9 
                  ? 'budget-danger-gradient' 
                  : totalSpent / budgetAmount >= 0.75 
                    ? 'budget-warning-gradient' 
                    : 'budget-gradient'
                }
              `}
            />
          </div>
        </div>
        
        <div className="ml-6">
          <BudgetProgress 
            current={totalSpent}
            total={budgetAmount}
            currency={trip.currency}
            size="sm"
            showLabels={false}
          />
        </div>
      </div>
      
      {/* Trip Stats */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-surface-100">
        <div className="flex items-center space-x-4 text-sm text-surface-500">
          <div className="flex items-center">
            <ApperIcon name="Receipt" size={16} className="mr-1" />
            {expenses.length} expense{expenses.length !== 1 ? 's' : ''}
          </div>
          {trip.itinerary && (
            <div className="flex items-center">
              <ApperIcon name="Route" size={16} className="mr-1" />
              {trip.itinerary.length} item{trip.itinerary.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
        
        <ApperIcon name="ChevronRight" size={16} className="text-surface-400" />
      </div>
    </motion.div>
  )
}

export default TripCard
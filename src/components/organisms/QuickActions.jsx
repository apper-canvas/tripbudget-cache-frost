import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import ApperIcon from '@/components/ApperIcon'
import Button from '@/components/atoms/Button'

const QuickActions = ({ className = '' }) => {
  const navigate = useNavigate()
  
  const actions = [
    {
      id: 'capture',
      label: 'Capture Receipt',
      description: 'Scan or upload a receipt',
      icon: 'Camera',
      color: 'bg-primary',
      hoverColor: 'hover:bg-blue-700',
      action: () => navigate('/capture')
    },
    {
      id: 'new-trip',
      label: 'New Trip',
      description: 'Plan your next business trip',
      icon: 'MapPin',
      color: 'bg-secondary',
      hoverColor: 'hover:bg-purple-800',
      action: () => navigate('/trips')
    },
    {
      id: 'reports',
      label: 'Generate Report',
      description: 'Create expense report',
      icon: 'FileText',
      color: 'bg-accent', 
      hoverColor: 'hover:bg-green-600',
      action: () => navigate('/reports')
    }
  ]
  
  return (
    <div className={`${className}`}>
      <h2 className="text-lg font-heading font-semibold text-surface-900 mb-4">
        Quick Actions
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {actions.map((action, index) => (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={action.action}
            className={`
              ${action.color} ${action.hoverColor}
              rounded-xl p-6 cursor-pointer transition-all duration-200
              text-white relative overflow-hidden group
            `}
          >
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/20" />
              <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full bg-white/10" />
            </div>
            
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                  <ApperIcon name={action.icon} size={24} />
                </div>
                <ApperIcon name="ArrowRight" size={20} className="opacity-60 group-hover:opacity-100 transition-opacity" />
              </div>
              
              <h3 className="font-semibold mb-1">{action.label}</h3>
              <p className="text-sm opacity-80">{action.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default QuickActions
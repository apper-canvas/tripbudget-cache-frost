import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ApperIcon from '@/components/ApperIcon'
import { routeArray } from '@/config/routes'

const Layout = () => {
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-white">
      {/* Desktop Header */}
      <header className="hidden md:flex items-center justify-between px-6 py-4 bg-white border-b border-surface-200 z-40">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
            <ApperIcon name="Wallet" size={20} className="text-white" />
          </div>
          <h1 className="text-xl font-heading font-semibold text-surface-900">TripBudget Pro</h1>
        </div>
        
        <nav className="flex space-x-1">
          {routeArray.map((route) => (
            <NavLink
              key={route.id}
              to={route.path}
              className={({ isActive }) =>
                `flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-white shadow-md'
                    : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'
                }`
              }
            >
              <ApperIcon name={route.icon} size={18} />
              <span className="font-medium">{route.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-lg hover:bg-surface-50 transition-colors">
            <ApperIcon name="Bell" size={20} className="text-surface-600" />
          </button>
          <div className="w-8 h-8 bg-gradient-to-br from-secondary to-accent rounded-full"></div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-surface-200 z-40">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
            <ApperIcon name="Wallet" size={16} className="text-white" />
          </div>
          <h1 className="text-lg font-heading font-semibold text-surface-900">TripBudget</h1>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="p-2 rounded-lg hover:bg-surface-50 transition-colors">
            <ApperIcon name="Bell" size={18} className="text-surface-600" />
          </button>
          <div className="w-7 h-7 bg-gradient-to-br from-secondary to-accent rounded-full"></div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-surface-50">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden bg-white border-t border-surface-200 px-4 py-2">
        <div className="flex justify-around">
          {routeArray.map((route) => (
            <NavLink
              key={route.id}
              to={route.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'text-primary'
                    : 'text-surface-500'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-2 rounded-lg ${isActive ? 'bg-primary/10' : ''}`}
                  >
                    <ApperIcon name={route.icon} size={20} />
                  </motion.div>
                  <span className="text-xs font-medium mt-1">{route.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}

export default Layout
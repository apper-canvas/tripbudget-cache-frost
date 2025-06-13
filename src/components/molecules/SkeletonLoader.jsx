import { motion } from 'framer-motion'

const SkeletonLoader = ({ 
  count = 3, 
  type = 'card',
  className = ''
}) => {
  const shimmer = {
    initial: { backgroundPosition: '200% 0' },
    animate: { backgroundPosition: '-200% 0' },
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: 'linear'
    }
  }
  
  const cardSkeleton = (index) => (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-xl p-6 border border-surface-200"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <motion.div
            {...shimmer}
            className="h-5 bg-gradient-to-r from-surface-200 via-surface-300 to-surface-200 rounded w-3/4 mb-2"
            style={{ backgroundSize: '200% 100%' }}
          />
          <motion.div
            {...shimmer}
            className="h-4 bg-gradient-to-r from-surface-200 via-surface-300 to-surface-200 rounded w-1/2"
            style={{ backgroundSize: '200% 100%' }}
          />
        </div>
        <motion.div
          {...shimmer}
          className="w-8 h-8 bg-gradient-to-r from-surface-200 via-surface-300 to-surface-200 rounded-full"
          style={{ backgroundSize: '200% 100%' }}
        />
      </div>
      
      <motion.div
        {...shimmer}
        className="h-2 bg-gradient-to-r from-surface-200 via-surface-300 to-surface-200 rounded-full mb-4"
        style={{ backgroundSize: '200% 100%' }}
      />
      
      <div className="flex justify-between">
        <motion.div
          {...shimmer}
          className="h-4 bg-gradient-to-r from-surface-200 via-surface-300 to-surface-200 rounded w-1/4"
          style={{ backgroundSize: '200% 100%' }}
        />
        <motion.div
          {...shimmer}
          className="h-4 bg-gradient-to-r from-surface-200 via-surface-300 to-surface-200 rounded w-1/4"
          style={{ backgroundSize: '200% 100%' }}
        />
      </div>
    </motion.div>
  )
  
  const listSkeleton = (index) => (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-xl p-4 border border-surface-200"
    >
      <div className="flex items-center space-x-3">
        <motion.div
          {...shimmer}
          className="w-12 h-12 bg-gradient-to-r from-surface-200 via-surface-300 to-surface-200 rounded-lg"
          style={{ backgroundSize: '200% 100%' }}
        />
        
        <div className="flex-1">
          <motion.div
            {...shimmer}
            className="h-4 bg-gradient-to-r from-surface-200 via-surface-300 to-surface-200 rounded w-3/4 mb-2"
            style={{ backgroundSize: '200% 100%' }}
          />
          <motion.div
            {...shimmer}
            className="h-3 bg-gradient-to-r from-surface-200 via-surface-300 to-surface-200 rounded w-1/2"
            style={{ backgroundSize: '200% 100%' }}
          />
        </div>
        
        <motion.div
          {...shimmer}
          className="h-6 bg-gradient-to-r from-surface-200 via-surface-300 to-surface-200 rounded w-16"
          style={{ backgroundSize: '200% 100%' }}
        />
      </div>
    </motion.div>
  )
  
  const skeletonComponents = {
    card: cardSkeleton,
    list: listSkeleton
  }
  
  const SkeletonComponent = skeletonComponents[type] || cardSkeleton
  
  return (
    <div className={`space-y-4 ${className}`}>
      {[...Array(count)].map((_, index) => SkeletonComponent(index))}
    </div>
  )
}

export default SkeletonLoader
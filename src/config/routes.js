import Dashboard from '@/components/pages/Dashboard'
import Trips from '@/components/pages/Trips'
import TripDetails from '@/components/pages/TripDetails'
import Capture from '@/components/pages/Capture'
import Expenses from '@/components/pages/Expenses'
import Reports from '@/components/pages/Reports'
import EmailReceipts from '@/components/pages/EmailReceipts'
export const routes = {
  dashboard: {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: 'LayoutDashboard',
    component: Dashboard
  },
trips: {
    id: 'trips',
    label: 'Trips',
    path: '/trips',
    icon: 'MapPin',
    component: Trips
  },
  tripDetails: {
    id: 'tripDetails',
    label: 'Trip Details',
    path: '/trips/:id',
    icon: 'MapPin',
    component: TripDetails,
    hidden: true
  },
  capture: {
    id: 'capture',
    label: 'Capture',
    path: '/capture',
    icon: 'Camera',
    component: Capture
  },
  expenses: {
    id: 'expenses',
    label: 'Expenses',
    path: '/expenses',
    icon: 'Receipt',
    component: Expenses
  },
  reports: {
    id: 'reports',
    label: 'Reports', 
    path: '/reports',
    icon: 'FileText',
    component: Reports
  },
  emailReceipts: {
    id: 'emailReceipts',
    label: 'Email Receipts',
    path: '/email-receipts',
icon: 'Mail',
    component: EmailReceipts
  }
}

export const routeArray = Object.values(routes)
export default routes
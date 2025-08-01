import { 
  Info, 
  CheckCircle, 
  AlertTriangle, 
  AlertCircle, 
  CreditCard, 
  Users, 
  Clock,
  Mail,
  Star
} from "lucide-react"
import React from 'react'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'

const notificationConfig = {
  info: {
    bg: "bg-blue-500/10 dark:bg-blue-900/30",
    border: "border-blue-500/20 dark:border-blue-800",
    text: "text-blue-600 dark:text-blue-300",
    icon: Info,
  },
  success: {
    bg: "bg-green-500/10 dark:bg-green-900/30",
    border: "border-green-500/20 dark:border-green-800",
    text: "text-green-600 dark:text-green-300",
    icon: CheckCircle,
  },
  warning: {
    bg: "bg-amber-500/10 dark:bg-amber-900/30",
    border: "border-amber-500/20 dark:border-amber-800",
    text: "text-amber-600 dark:text-amber-300",
    icon: AlertTriangle,
  },
  error: {
    bg: "bg-red-500/10 dark:bg-red-900/30",
    border: "border-red-500/20 dark:border-red-800",
    text: "text-red-600 dark:text-red-300",
    icon: AlertCircle,
  },
  transaction: {
    bg: "bg-purple-500/10 dark:bg-purple-900/30",
    border: "border-purple-500/20 dark:border-purple-800",
    text: "text-purple-600 dark:text-purple-300",
    icon: CreditCard,
  },
  referral: {
    bg: "bg-orange-500/10 dark:bg-orange-900/30",
    border: "border-orange-500/20 dark:border-orange-800",
    text: "text-orange-600 dark:text-orange-300",
    icon: Users,
  },
  subscribe: {
    bg: "bg-teal-500/10 dark:bg-teal-900/30",
    border: "border-teal-500/20 dark:border-teal-800",
    text: "text-teal-600 dark:text-teal-300",
    icon: Mail,
  }
}

function NotificationTemplate({ 
  type = 'info', 
  title, 
  message,
  createdAt,
  isRead = false,
  isNew = false,
  onClick,
  className = ''
}) {
  const { bg, border, text, icon: Icon } = notificationConfig[type] || notificationConfig.info

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`w-full max-w-[500px] mx-auto ${className}`}
    >
      <div
        className={`
          relative p-4 rounded-xl border 
          ${bg} ${border}
          transition-all duration-200
          hover:shadow-sm hover:border-opacity-40
          cursor-pointer group
          ${isRead ? 'opacity-80' : ''}
        `}
        onClick={onClick}
      >
        {isNew && (
          <div className="absolute top-3 right-3 text-amber-500">
            <Star className="h-4 w-4" />
          </div>
        )}

        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${bg} ${border}`}>
            <Icon className={`h-5 w-5 ${text}`} />
          </div>
          
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-slate-800 dark:text-slate-100">
                {title}
              </h3>
              {createdAt && (
                <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap ml-2">
                  {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
                </span>
              )}
            </div>
            
            {message && (
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {message}
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export { NotificationTemplate }
export default NotificationTemplate
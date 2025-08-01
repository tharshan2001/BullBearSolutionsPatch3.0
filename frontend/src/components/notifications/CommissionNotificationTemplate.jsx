import {
  PaymentsOutlined,
  AccountTreeOutlined,
  HubOutlined,
  ScheduleOutlined,
  KeyboardArrowRight,
  StarOutline
} from "@mui/icons-material";

const commissionTypeStyles = {
  direct: {
    bg: "bg-teal-500/10 dark:bg-teal-900/30",
    border: "border-teal-500/20 dark:border-teal-800",
    text: "text-teal-600 dark:text-teal-300",
    icon: <PaymentsOutlined fontSize="small" />,
    label: "Direct Commission"
  },
  level: {
    bg: "bg-blue-500/10 dark:bg-blue-900/30",
    border: "border-blue-500/20 dark:border-blue-800",
    text: "text-blue-600 dark:text-blue-300",
    icon: <AccountTreeOutlined fontSize="small" />,
    label: "Level Commission"
  },
  root: {
    bg: "bg-teal-500/10 dark:bg-teal-900/30",
    border: "border-teal-500/20 dark:border-teal-800",
    text: "text-teal-600 dark:text-teal-300",
    icon: <HubOutlined fontSize="small" />,
    label: "Root Commission"
  },
  unclaimed: {
    bg: "bg-amber-500/10 dark:bg-amber-900/30",
    border: "border-amber-500/20 dark:border-amber-800",
    text: "text-amber-600 dark:text-amber-300",
    icon: <ScheduleOutlined fontSize="small" />,
    label: "Unclaimed Commission"
  }
};

export default function CommissionNotificationTemplate({
  type = "direct",
  title,
  message,
  date,
  onClick,
  isNew = false
}) {
  const style = commissionTypeStyles[type] || commissionTypeStyles.direct;

  return (
    <div
      className={`
        relative p-4 mb-3 rounded-xl border 
        ${style.bg} ${style.border} 
        transition-all duration-200 
        hover:shadow-sm hover:border-teal-400/30 
        cursor-pointer group
      `}
      onClick={onClick}
    >
      {isNew && (
        <div className="absolute top-2 right-2 text-teal-400">
          <StarOutline fontSize="small" />
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className={`p-2 rounded-lg ${style.bg} ${style.border}`}>
          <span className={style.text}>
            {style.icon}
          </span>
        </div>
        
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium px-2 py-1 rounded-md ${style.bg} ${style.text}`}>
              {style.label}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {date}
            </span>
          </div>
          
          <h3 className="text-sm font-medium text-amber-800/60 dark:text-slate-100">
            {title}
          </h3>
          
          {message && (
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {message}
            </p>
          )}
        </div>
        
        <div className="text-slate-400 group-hover:text-teal-400 transition-colors pt-1">
        </div>
      </div>
    </div>
  );
}
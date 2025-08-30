function SummaryCard({ title, children, icon, bg = "bg-blue-50 dark:bg-blue-900/30", footer }) {
  return (
    <div className={`rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden ${bg} transition-colors duration-200`}>
      <div className="p-5">
        <div className="flex justify-between items-start">
          <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
            {title}
          </h4>
          {icon && (
            <div className="p-2 rounded-lg bg-white dark:bg-gray-800 bg-opacity-50 dark:bg-opacity-50">
              {icon}
            </div>
          )}
        </div>
        <div className="mt-3">
          {children}
        </div>
      </div>
      {footer && (
        <div className="px-5 py-3 bg-white dark:bg-gray-800 bg-opacity-30 dark:bg-opacity-30 border-t border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">{footer}</p>
        </div>
      )}
    </div>
  );
}

export default SummaryCard;
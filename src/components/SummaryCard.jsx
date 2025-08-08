function SummaryCard({ title, children, icon, bg = "bg-blue-50", footer }) {
  return (
    <div className={`rounded-xl shadow-sm border border-gray-100 overflow-hidden ${bg}`}>
      <div className="p-5">
        <div className="flex justify-between items-start">
          <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
            {title}
          </h4>
          {icon && (
            <div className="p-2 rounded-lg bg-white bg-opacity-50">
              {icon}
            </div>
          )}
        </div>
        <div className="mt-3">
          {children}
        </div>
      </div>
      {footer && (
        <div className="px-5 py-3 bg-white bg-opacity-30 border-t border-gray-100">
          <p className="text-xs text-gray-500">{footer}</p>
        </div>
      )}
    </div>
  );
}

export default SummaryCard;
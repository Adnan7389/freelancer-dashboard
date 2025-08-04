function SummaryCard({ title, children, bg = "bg-blue-50" }) {
  return (
    <div
      className={`rounded-lg shadow-sm border border-gray-200 p-4 sm:p-5 ${bg}`}
    >
      <h4 className="text-sm font-semibold text-gray-600 mb-2">{title}</h4>
      <div>{children}</div>
    </div>
  );
}

export default SummaryCard;

function SummaryCard({ title, children, bg = "bg-blue-100" }) {
  return (
    <div className={`p-4 rounded-lg shadow-sm ${bg}`}>
      <h4 className="text-gray-700 font-medium mb-1">{title}</h4>
      <div className="text-2xl font-bold">{children}</div>
    </div>
  );
}

export default SummaryCard;

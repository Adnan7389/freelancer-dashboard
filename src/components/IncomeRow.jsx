import React from "react";
import { FiEdit2, FiTrash2, FiSave, FiX, FiDollarSign, FiLayers, FiCalendar, FiFileText } from "react-icons/fi";

function IncomeRow({
  income,
  editingId,
  setEditingId,
  editForm,
  setEditForm,
  handleUpdate,
  handleDelete,
  formatCurrency
}) {
  const isEditing = editingId === income.id;

  const handleInputChange = (field, value) => {
    setEditForm({ ...editForm, [field]: value });
  };

  return (
    <tr className={`border-t border-gray-100 ${isEditing ? "bg-blue-50" : "hover:bg-gray-50"} transition-colors`}>
      {isEditing ? (
        <>
          <td className="p-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiDollarSign className="text-gray-400" />
              </div>
              <input
                type="number"
                value={editForm.amount}
                onChange={(e) => handleInputChange("amount", e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                step="0.01"
                min="0"
                required
                aria-label="Amount"
              />
            </div>
          </td>
          <td className="p-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLayers className="text-gray-400" />
              </div>
              <select
                value={editForm.platform}
                onChange={(e) => handleInputChange("platform", e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                aria-label="Platform"
              >
                <option value="Fiverr">Fiverr</option>
                <option value="Upwork">Upwork</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </td>
          <td className="p-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiCalendar className="text-gray-400" />
              </div>
              <input
                type="date"
                value={editForm.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                aria-label="Date"
              />
            </div>
          </td>
          <td className="p-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 pt-3 pointer-events-none">
                <FiFileText className="text-gray-400" />
              </div>
              <textarea
                value={editForm.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="2"
                aria-label="Description"
              />
            </div>
          </td>
          <td className="p-3">
            <div className="flex gap-2">
              <button
                onClick={handleUpdate}
                className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors"
                aria-label="Save changes"
              >
                <FiSave size={16} />
                <span className="hidden sm:inline">Save</span>
              </button>
              <button
                onClick={() => setEditingId(null)}
                className="flex items-center gap-1.5 bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors"
                aria-label="Cancel editing"
              >
                <FiX size={16} />
                <span className="hidden sm:inline">Cancel</span>
              </button>
            </div>
          </td>
        </>
      ) : (
        <>
          <td className="p-3 font-medium text-gray-900">
            {formatCurrency ? formatCurrency(income.amount) : income.amount.toFixed(2)}
          </td>
          <td className="p-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {income.platform}
            </span>
          </td>
          <td className="p-3 text-gray-700">
            {new Date(income.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </td>
          <td className="p-3 text-gray-700">
            {income.description || <span className="text-gray-400">-</span>}
          </td>
          <td className="p-3">
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditingId(income.id);
                  setEditForm({
                    amount: income.amount,
                    platform: income.platform,
                    date: income.date,
                    description: income.description || "",
                  });
                }}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors"
                aria-label="Edit income record"
              >
                <FiEdit2 size={16} />
                <span className="hidden sm:inline">Edit</span>
              </button>
              <button
                onClick={() => handleDelete(income.id)}
                className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-colors"
                aria-label="Delete income record"
              >
                <FiTrash2 size={16} />
                <span className="hidden sm:inline">Delete</span>
              </button>
            </div>
          </td>
        </>
      )}
    </tr>
  );
}

export default IncomeRow;
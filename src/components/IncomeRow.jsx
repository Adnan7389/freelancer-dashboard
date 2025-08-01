import React from "react";

function IncomeRow({
  income,
  editingId,
  setEditingId,
  editForm,
  setEditForm,
  handleUpdate,
  handleDelete,
}) {
  const isEditing = editingId === income.id;

  const handleInputChange = (field, value) => {
    setEditForm({ ...editForm, [field]: value });
  };

  return (
    <tr className="border-t">
      {isEditing ? (
        <>
          <td className="p-2">
            <input
              type="number"
              value={editForm.amount}
              onChange={(e) => handleInputChange("amount", e.target.value)}
              className="w-full p-1 border rounded"
              step="0.01"
              required
            />
          </td>
          <td className="p-2">
            <select
              value={editForm.platform}
              onChange={(e) => handleInputChange("platform", e.target.value)}
              className="w-full p-1 border rounded"
            >
              <option value="Fiverr">Fiverr</option>
              <option value="Upwork">Upwork</option>
              <option value="Other">Other</option>
            </select>
          </td>
          <td className="p-2">
            <input
              type="date"
              value={editForm.date}
              onChange={(e) => handleInputChange("date", e.target.value)}
              className="w-full p-1 border rounded"
              required
            />
          </td>
          <td className="p-2">
            <textarea
              value={editForm.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="w-full p-1 border rounded"
              rows="2"
            />
          </td>
          <td className="p-2">
            <button
              onClick={handleUpdate}
              className="bg-green-500 text-white px-2 py-1 rounded mr-2 hover:bg-green-600"
            >
              Save
            </button>
            <button
              onClick={() => setEditingId(null)}
              className="bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </td>
        </>
      ) : (
        <>
          <td className="p-2">{income.amount.toFixed(2)}</td>
          <td className="p-2">{income.platform}</td>
          <td className="p-2">
            {new Date(income.date).toLocaleDateString()}
          </td>
          <td className="p-2">{income.description || "-"}</td>
          <td className="p-2">
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
              className="bg-blue-500 text-white px-2 py-1 rounded mr-2 hover:bg-blue-600"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(income.id)}
              className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
            >
              Delete
            </button>
          </td>
        </>
      )}
    </tr>
  );
}

export default IncomeRow;

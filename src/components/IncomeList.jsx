import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { orderBy } from "firebase/firestore";

function IncomeList() {
  const { currentUser } = useAuth();
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ amount: "", platform: "", date: "", description: "" });

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "incomes"),
      where("userId", "==", currentUser.uid),
      orderBy("date", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const incomeData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setIncomes(incomeData);
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser]);

  const handleEdit = (income) => {
    setEditingId(income.id);
    setEditForm({
      amount: income.amount,
      platform: income.platform,
      date: income.date,
      description: income.description || "",
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
     if (!editForm.amount || editForm.amount <= 0) {
     return alert("Amount must be greater than 0");
    }
    if (!editForm.date || new Date(editForm.date) > new Date()) {
      return alert("Date cannot be in the future");
    }

    try {
      await updateDoc(doc(db, "incomes", editingId), {
        amount: parseFloat(editForm.amount),
        platform: editForm.platform,
        date: editForm.date,
        description: editForm.description,
      });
      setEditingId(null);
      setEditForm({ amount: "", platform: "", date: "", description: "" });
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        await deleteDoc(doc(db, "incomes", id));
      } catch (err) {
        console.error("Delete failed:", err);
      }
    }
  };
  if (loading) return <p className="text-gray-500">Loading incomes...</p>;
  
  if (incomes.length === 0) {
    return <p className="text-gray-500">No income records found.</p>;
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-bold mb-4">Income Records</h3>
      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Amount ($)</th>
              <th className="p-2 text-left">Platform</th>
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-left">Description</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {incomes.map((income) => (
              <tr key={income.id} className="border-t">
                {editingId === income.id ? (
                  <>
                    <td className="p-2">
                      <input
                        type="number"
                        value={editForm.amount}
                        onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                        className="w-full p-1 border rounded"
                        step="0.01"
                        required
                      />
                    </td>
                    <td className="p-2">
                      <select
                        value={editForm.platform}
                        onChange={(e) => setEditForm({ ...editForm, platform: e.target.value })}
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
                        onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                        className="w-full p-1 border rounded"
                        required
                      />
                    </td>
                    <td className="p-2">
                      <textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
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
                    <td className="p-2">{new Date(income.date).toLocaleDateString()}</td>
                    <td className="p-2">{income.description || "-"}</td>
                    <td className="p-2">
                      <button
                        onClick={() => handleEdit(income)}
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default IncomeList;
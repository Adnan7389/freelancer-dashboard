import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../hooks/useAuth";
import { orderBy } from "firebase/firestore";
import toast, { Toaster } from "react-hot-toast";
import IncomeRow from "./IncomeRow";

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

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!window.confirm("Apply changes?")) return;

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
      toast.success("Income updated!");
      setEditingId(null);
      setEditForm({ amount: "", platform: "", date: "", description: "" });
    } catch (err) {
      console.error("Update failed:", err);
      toast.error("Update failed: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        await deleteDoc(doc(db, "incomes", id));
        toast.success("Income deleted!");
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
      <Toaster position="top-center" />
      <h3 className="text-lg font-bold text-gray-800 mb-4">Income Records</h3>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : incomes.length === 0 ? (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center text-gray-500">
          No income records found.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Platform
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {incomes.map((income) => (
                  <IncomeRow
                    key={income.id}
                    income={income}
                    editingId={editingId}
                    setEditingId={setEditingId}
                    editForm={editForm}
                    setEditForm={setEditForm}
                    handleUpdate={handleUpdate}
                    handleDelete={handleDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default IncomeList;
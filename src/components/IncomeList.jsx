import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../hooks/useAuth";
import { orderBy } from "firebase/firestore";
import toast, { Toaster } from "react-hot-toast";
import IncomeRow from "./IncomeRow";
import { FiDollarSign, FiCalendar, FiLayers, FiFileText, FiTrash2, FiEdit2, FiCheck, FiX } from "react-icons/fi";

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
      toast.error("Amount must be greater than 0");
      return;
    }
    if (!editForm.date || new Date(editForm.date) > new Date()) {
      toast.error("Date cannot be in the future");
      return;
    }

    try {
      await updateDoc(doc(db, "incomes", editingId), {
        amount: parseFloat(editForm.amount),
        platform: editForm.platform,
        date: editForm.date,
        description: editForm.description,
      });
      toast.success("Income updated successfully!");
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
        toast.success("Income deleted successfully!");
      } catch (err) {
        console.error("Delete failed:", err);
        toast.error("Delete failed: " + err.message);
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Format platform name for display (capitalize first letter, rest lowercase)
  const formatPlatformName = (platform) => {
    if (!platform) return '';
    return platform.charAt(0).toUpperCase() + platform.slice(1).toLowerCase();
  };

  // Get the display name for a platform (prefer displayPlatform, fallback to platform field)
  const getDisplayPlatform = (income) => {
    if (income?.displayPlatform) return income.displayPlatform;
    if (!income?.platform) return '';
    return formatPlatformName(income.platform);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 flex items-center">
          <FiDollarSign className="mr-2 text-blue-500" />
          Income History
        </h3>
        <div className="text-sm text-gray-500">
          {incomes.length} {incomes.length === 1 ? 'record' : 'records'} found
        </div>
      </div>
      
      {incomes.length === 0 ? (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
          <div className="text-gray-400 mb-4">
            <FiDollarSign className="mx-auto text-4xl" />
          </div>
          <h4 className="text-lg font-medium text-gray-700 mb-2">No income records yet</h4>
          <p className="text-gray-500">Add your first income record to get started</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <FiDollarSign className="mr-2" />
                      Amount
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <FiLayers className="mr-2" />
                      Platform
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <FiCalendar className="mr-2" />
                      Date
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <FiFileText className="mr-2" />
                      Description
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {incomes.map((income) => (
                  <IncomeRow
                    key={income.id}
                    income={{
                      ...income,
                      platform: getDisplayPlatform(income)
                    }}
                    editingId={editingId}
                    setEditingId={setEditingId}
                    editForm={{
                      ...editForm,
                      platform: editForm.platform ? formatPlatformName(editForm.platform) : ''
                    }}
                    setEditForm={setEditForm}
                    handleUpdate={handleUpdate}
                    handleDelete={handleDelete}
                    formatCurrency={formatCurrency}
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
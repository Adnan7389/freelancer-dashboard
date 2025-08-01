import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { orderBy } from "firebase/firestore";

function IncomeList() {
  const { currentUser } = useAuth();
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);

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
            </tr>
          </thead>
          <tbody>
            {incomes.map((income) => (
              <tr key={income.id} className="border-t">
                <td className="p-2">{income.amount.toFixed(2)}</td>
                <td className="p-2">{income.platform}</td>
                <td className="p-2">{new Date(income.date).toLocaleDateString()}</td>
                <td className="p-2">{income.description || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default IncomeList;
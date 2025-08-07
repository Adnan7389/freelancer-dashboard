import { useState, useEffect } from "react";
import { FiUpload, FiDownload } from "react-icons/fi";
import { useProStatus } from "../hooks/useProStatus";
import { exportIncomesToCSV, importCSVToIncomes } from "../utils/csvUtils";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";
import dayjs from "dayjs";

function IncomeDataTools() {
  const { currentUser } = useAuth();
  const isPro = useProStatus();
  const [loading, setLoading] = useState(false);
  const [selectedMonths, setSelectedMonths] = useState([]);
  const [recordCount, setRecordCount] = useState(null);

  const allMonths = Array.from({ length: 12 }, (_, i) =>
    dayjs().month(i).format("MMMM")
  );

  const handleMonthToggle = (month) => {
    setSelectedMonths((prev) =>
      prev.includes(month)
        ? prev.filter((m) => m !== month)
        : [...prev, month]
    );
  };

  const handleExport = async () => {
    if (selectedMonths.length === 0) {
      return toast.error("Please select at least one month.");
    }

    try {
      setLoading(true);
      await exportIncomesToCSV(currentUser.uid, selectedMonths);
      toast.success("Exported filtered CSV!");
    } catch (err) {
      toast.error("Something went wrong: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setLoading(true);
      await importCSVToIncomes(file, currentUser.uid);
      toast.success("Imported successfully!");
    } catch (err) {
      toast.error("Something went wrong: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Preview record count based on selected months
  useEffect(() => {
    const fetchRecordCount = async () => {
      if (selectedMonths.length === 0) {
        setRecordCount(null);
        return;
      }

      try {
        const incomeRef = collection(db, "incomes");
        const snapshot = await getDocs(
          query(incomeRef, where("userId", "==", currentUser.uid))
        );

        const filtered = snapshot.docs.filter((doc) => {
          const date = doc.data().date;
          const monthName = dayjs(date).format("MMMM");
          return selectedMonths.includes(monthName);
        });

        setRecordCount(filtered.length);
      } catch (err) {
         console.error("Failed to fetch record count:", err);
        setRecordCount(null);
      }
    };

    fetchRecordCount();
  }, [selectedMonths, currentUser]);

  if (!isPro) return null;

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 space-y-5">
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-1">📁 Income Data Tools</h3>
        <p className="text-sm text-gray-600">
          Export income records for specific months or import new ones from Fiverr/Upwork reports.
        </p>
      </div>

      {/* Month Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
        {allMonths.map((month) => (
          <label key={month} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedMonths.includes(month)}
              onChange={() => handleMonthToggle(month)}
            />
            {month}
          </label>
        ))}
      </div>

      {/* Preview Info */}
      {recordCount !== null && (
        <p className="text-sm text-gray-700">
          🔍 {recordCount} record{recordCount !== 1 && "s"} match your selection.
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={handleExport}
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md transition"
        >
          <FiDownload size={18} />
          Export Selected
        </button>

        <label className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md cursor-pointer transition">
          <FiUpload size={18} />
          Import CSV
          <input
            type="file"
            accept=".csv"
            onChange={handleImport}
            className="hidden"
            aria-label="Upload CSV file"
          />
        </label>
      </div>
    </div>
  );
}

export default IncomeDataTools;

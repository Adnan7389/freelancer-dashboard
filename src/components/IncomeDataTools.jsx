import { useState, useEffect } from "react";
import { FiUpload, FiDownload, FiFilter, FiFileText } from "react-icons/fi";
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
  const [isSelectAll, setIsSelectAll] = useState(false);

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

  const handleSelectAll = () => {
    if (isSelectAll) {
      setSelectedMonths([]);
    } else {
      setSelectedMonths([...allMonths]);
    }
    setIsSelectAll(!isSelectAll);
  };

  const handleExport = async () => {
    if (selectedMonths.length === 0) {
      return toast.error("Please select at least one month to export");
    }

    try {
      setLoading(true);
      await exportIncomesToCSV(currentUser.uid, selectedMonths);
      toast.success("Export completed successfully!");
    } catch (err) {
      toast.error("Export failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      return toast.error("Please select a CSV file");
    }

    try {
      setLoading(true);
      await importCSVToIncomes(file, currentUser.uid);
      toast.success("Import completed successfully!");
    } catch (err) {
      toast.error("Import failed: " + err.message);
    } finally {
      e.target.value = ''; // Reset file input
      setLoading(false);
    }
  };

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
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <FiFileText className="text-2xl text-blue-500" />
          <h3 className="text-xl font-bold text-gray-800">Income Data Tools</h3>
        </div>
        <p className="text-sm text-gray-600">
          Export income records by month or import from platform reports
        </p>
      </div>

      {/* Month Selector */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <FiFilter className="text-gray-500" />
            Filter by Month
          </label>
          <button
            onClick={handleSelectAll}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {isSelectAll ? 'Deselect All' : 'Select All'}
          </button>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {allMonths.map((month) => (
            <button
              key={month}
              onClick={() => handleMonthToggle(month)}
              className={`flex items-center justify-center py-2 px-3 rounded-lg border transition-colors ${
                selectedMonths.includes(month)
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <span className="text-sm font-medium">{month}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Preview Info */}
      {recordCount !== null && (
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
          <p className="text-sm text-blue-700">
            <span className="font-medium">{recordCount}</span> record{recordCount !== 1 ? 's' : ''} match your selection
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleExport}
          disabled={loading || selectedMonths.length === 0}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
            loading || selectedMonths.length === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          <FiDownload size={18} />
          Export Selected
        </button>

        <label className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
          loading
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
        }`}>
          <FiUpload size={18} />
          Import CSV
          <input
            type="file"
            accept=".csv"
            onChange={handleImport}
            disabled={loading}
            className="hidden"
            aria-label="Upload CSV file"
          />
        </label>
      </div>

      {/* Help Text */}
      <div className="text-xs text-gray-500">
        <p>Supported formats: CSV exports from Fiverr, Upwork, or custom spreadsheets</p>
      </div>
    </div>
  );
}

export default IncomeDataTools;
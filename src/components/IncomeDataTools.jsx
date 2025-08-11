import { useState, useEffect } from "react";
import { FiUpload, FiDownload, FiFilter, FiFileText, FiCalendar } from "react-icons/fi";
import { useProStatus } from "../hooks/useProStatus";
import { exportIncomesToCSV, importCSVToIncomes } from "../utils/csvUtils";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import { collection, getDocs, query, where, limit } from "firebase/firestore";
import { db } from "../firebase";
import dayjs from "dayjs";

function IncomeDataTools() {
  const { currentUser } = useAuth();
  const isPro = useProStatus();
  const [loading, setLoading] = useState(false);
  const currentYear = dayjs().year();
  const years = [currentYear - 2, currentYear - 1, currentYear];
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonths, setSelectedMonths] = useState([]);
  const [recordCount, setRecordCount] = useState(null);
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [isLoadingCount, setIsLoadingCount] = useState(false);

  const allMonths = Array.from({ length: 12 }, (_, i) => ({
    name: dayjs().month(i).format("MMMM"),
    value: i + 1
  }));

  const toggleMonth = (month) => {
    // If 'Select All' is clicked
    if (month === 'all') {
      const allMonthValues = allMonths.map(m => m.value);
      const newSelection = selectedMonths.length === allMonthValues.length ? [] : allMonthValues;
      setSelectedMonths(newSelection);
      setIsSelectAll(!isSelectAll);
    } else {
      // Toggle individual month
      setSelectedMonths(prev => {
        const newSelection = prev.includes(month)
          ? prev.filter(m => m !== month)
          : [...prev, month];
        
        // Update 'Select All' checkbox state
        setIsSelectAll(newSelection.length === allMonths.length);
        
        return newSelection;
      });
    }
  };

  const handleSelectAll = () => {
    if (isSelectAll) {
      setSelectedMonths([]);
    } else {
      setSelectedMonths(allMonths.map(m => m.value));
    }
    setIsSelectAll(!isSelectAll);
  };

  const handleExport = async () => {
    if (selectedMonths.length === 0) {
      return toast.error("Please select at least one month to export");
    }

    if (recordCount === 0) {
      return toast.error("No records found for the selected period");
    }

    try {
      setLoading(true);
      // Convert month names to numbers (e.g., 'July' -> 7, 'August' -> 8)
      const monthNumbers = selectedMonths.map(month => 
        typeof month === 'string' ? new Date(`${month} 1, 2000`).getMonth() + 1 : month
      );
      
      await exportIncomesToCSV(currentUser.uid, monthNumbers, selectedYear);
      toast.success("Export completed successfully!");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error(error.message || "Export failed. Please try again.");
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
        setIsLoadingCount(true);
        const incomeRef = collection(db, "incomes");
        
        // First, check if we can find any records without date filtering
        const allRecordsQuery = query(
          incomeRef,
          where("userId", "==", currentUser.uid),
          limit(5) // Just get a few records to check
        );
        
        const allRecords = await getDocs(allRecordsQuery);
        
        if (allRecords.empty) {
          console.warn('No income records found for user');
          setRecordCount(0);
          return;
        }
        
        // Query all records for the user, we'll filter by date in memory
        const q = query(
          incomeRef,
          where("userId", "==", currentUser.uid)
        );
        
        const snapshot = await getDocs(q);
        
        // Filter client-side by selected months and year
        const filtered = snapshot.docs.filter(doc => {
          const data = doc.data();
          if (!data.date) {
            console.warn('Document missing date field:', doc.id);
            return false;
          }
          
          // Parse the date string (format: 'YYYY-MM-DD')
          const dateStr = data.date;
          const [year, month, day] = dateStr.split('-').map(Number);
          
          // Validate the date
          const date = new Date(year, month - 1, day);
          if (isNaN(date.getTime())) {
            console.warn('Invalid date format:', data.date, 'in document:', doc.id);
            return false;
          }
          
          // Get the month and year from the date
          const monthNum = date.getMonth() + 1; // Convert to 1-12
          const yearNum = date.getFullYear();
          
          // Check if the record's year matches the selected year
          // and if the record's month is in the selected months
          const isInSelectedYear = yearNum === selectedYear;
          const isInSelectedMonths = selectedMonths.includes(monthNum);
          
          return isInSelectedYear && isInSelectedMonths;
        });
        
        setRecordCount(filtered.length);
      } catch (err) {
        console.error("Failed to fetch record count:", err);
        setRecordCount(null);
      } finally {
        setIsLoadingCount(false);
      }
    };

    fetchRecordCount();
  }, [selectedMonths, selectedYear, currentUser]);

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

      {/* Year Selector */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <FiCalendar className="text-gray-500" />
          Select Year
        </label>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {years.map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`px-4 py-2 rounded-lg border transition-colors whitespace-nowrap ${
                selectedYear === year
                  ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      {/* Month Selector */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <FiFilter className="text-gray-500" />
            Select Months ({selectedYear})
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
              key={month.value}
              onClick={() => toggleMonth(month.value)}
              disabled={loading}
              className={`flex items-center justify-center py-2 px-3 rounded-lg border transition-colors ${
                selectedMonths.includes(month.value)
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <span className="text-sm font-medium">{month.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Preview Info */}
      {isLoadingCount ? (
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
          <p className="text-sm text-blue-700">
            Loading record count...
          </p>
        </div>
      ) : recordCount !== null && (
        <div className={`p-3 rounded-lg border ${
          recordCount > 0 
            ? 'bg-blue-50 border-blue-100' 
            : 'bg-amber-50 border-amber-100'
        }`}>
          <p className={`text-sm ${
            recordCount > 0 ? 'text-blue-700' : 'text-amber-700'
          }`}>
            {recordCount > 0 ? (
              <span>
                Found <span className="font-medium">{recordCount}</span> record{recordCount !== 1 ? 's' : ''} for {selectedMonths.length} selected month{selectedMonths.length !== 1 ? 's' : ''} in {selectedYear}
              </span>
            ) : (
              <span>No records found for the selected period</span>
            )}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleExport}
          disabled={loading || selectedMonths.length === 0 || recordCount === 0}
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
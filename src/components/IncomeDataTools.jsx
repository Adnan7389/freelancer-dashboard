import { useState, useEffect } from "react";
import { FiUpload, FiDownload, FiFilter, FiFileText, FiCalendar, FiCheck, FiCheckCircle } from "react-icons/fi";
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
    value: i + 1,
    shortName: dayjs().month(i).format("MMM") // Added short month names for mobile
  }));

  const toggleMonth = (month) => {
    if (month === 'all') {
      const allMonthValues = allMonths.map(m => m.value);
      const newSelection = selectedMonths.length === allMonthValues.length ? [] : allMonthValues;
      setSelectedMonths(newSelection);
      setIsSelectAll(!isSelectAll);
    } else {
      setSelectedMonths(prev => {
        const newSelection = prev.includes(month)
          ? prev.filter(m => m !== month)
          : [...prev, month];
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
      e.target.value = '';
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
        const allRecordsQuery = query(
          incomeRef,
          where("userId", "==", currentUser.uid),
          limit(5)
        );
        
        const allRecords = await getDocs(allRecordsQuery);
        
        if (allRecords.empty) {
          console.warn('No income records found for user');
          setRecordCount(0);
          return;
        }
        
        const q = query(
          incomeRef,
          where("userId", "==", currentUser.uid)
        );
        
        const snapshot = await getDocs(q);
        
        const filtered = snapshot.docs.filter(doc => {
          const data = doc.data();
          if (!data.date) {
            console.warn('Document missing date field:', doc.id);
            return false;
          }
          
          const dateStr = data.date;
          const [year, month, day] = dateStr.split('-').map(Number);
          
          const date = new Date(year, month - 1, day);
          if (isNaN(date.getTime())) {
            console.warn('Invalid date format:', data.date, 'in document:', doc.id);
            return false;
          }
          
          const monthNum = date.getMonth() + 1;
          const yearNum = date.getFullYear();
          
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
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md border border-gray-100 space-y-6 max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <FiFileText className="text-xl text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-800">Income Data Tools</h3>
            <p className="text-xs sm:text-sm text-gray-500">
              Export income records by month or import from platform reports
            </p>
          </div>
        </div>
      </div>

      {/* Year Selection - Improved Mobile Visibility */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <div className="p-1.5 bg-blue-50 rounded-md">
            <FiCalendar className="text-blue-600" />
          </div>
          Select Year
        </label>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {years.map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`px-3 sm:px-4 py-2 rounded-lg border transition-all duration-200 whitespace-nowrap min-w-[70px] sm:min-w-[80px] text-center text-sm sm:text-base ${
                selectedYear === year
                  ? 'bg-blue-100 border-blue-300 text-blue-700 font-semibold shadow-sm'
                  : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-600'
              }`}
              aria-label={`Select year ${year}`}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      {/* Month Selection - Improved Mobile Visibility */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <div className="p-1.5 bg-purple-50 rounded-md">
              <FiFilter className="text-purple-600" />
            </div>
            <span className="whitespace-nowrap">Select Months ({selectedYear})</span>
          </label>
          <button
            onClick={handleSelectAll}
            className="text-xs sm:text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
            aria-label={isSelectAll ? 'Deselect all months' : 'Select all months'}
          >
            {isSelectAll ? (
              <>
                <FiCheckCircle className="text-green-500" /> Deselect All
              </>
            ) : (
              'Select All'
            )}
          </button>
        </div>
        
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {allMonths.map((month) => (
            <button
              key={month.value}
              onClick={() => toggleMonth(month.value)}
              disabled={loading}
              className={`flex flex-col items-center justify-center py-2 px-1 sm:px-3 rounded-lg border transition-all duration-200 min-h-[60px] ${
                selectedMonths.includes(month.value)
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-600'
              } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              aria-label={`${selectedMonths.includes(month.value) ? 'Selected' : 'Select'} ${month.name}`}
            >
              <span className="text-xs font-medium sm:hidden">{month.shortName}</span>
              <span className="hidden sm:inline text-sm font-medium">{month.name}</span>
              {selectedMonths.includes(month.value) && (
                <FiCheck className="text-indigo-600 mt-1" size={14} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Record Count Preview */}
      {isLoadingCount ? (
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 animate-pulse">
          <p className="text-xs sm:text-sm text-blue-700 flex items-center gap-2">
            <svg className="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading record count...
          </p>
        </div>
      ) : recordCount !== null && (
        <div className={`p-3 rounded-lg border ${
          recordCount > 0 
            ? 'bg-blue-50 border-blue-200' 
            : 'bg-amber-50 border-amber-200'
        }`}>
          <p className={`text-xs sm:text-sm flex items-center gap-2 ${
            recordCount > 0 ? 'text-blue-700' : 'text-amber-700'
          }`}>
            {recordCount > 0 ? (
              <>
                <FiCheckCircle className="text-blue-500" />
                <span>
                  Found <span className="font-semibold">{recordCount}</span> record{recordCount !== 1 ? 's' : ''} for {selectedMonths.length} selected month{selectedMonths.length !== 1 ? 's' : ''} in {selectedYear}
                </span>
              </>
            ) : (
              <>
                <FiCheckCircle className="text-amber-500" />
                <span>No records found for the selected period</span>
              </>
            )}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleExport}
          disabled={loading || selectedMonths.length === 0 || recordCount === 0}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${
            loading || selectedMonths.length === 0 || recordCount === 0
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg'
          }`}
          aria-label="Export selected income data"
        >
          <FiDownload size={16} />
          Export Selected
        </button>

        <label className={`flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 rounded-lg font-medium transition-all duration-200 cursor-pointer text-sm sm:text-base ${
          loading
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg'
        }`}>
          <FiUpload size={16} />
          Import CSV
          <input
            type="file"
            accept=".csv"
            onChange={handleImport}
            disabled={loading}
            className="hidden"
            aria-label="Upload CSV file for import"
          />
        </label>
      </div>

      {/* Help Text */}
      <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
        <p>Supported formats: CSV exports from Fiverr, Upwork, or custom spreadsheets</p>
      </div>
    </div>
  );
}

export default IncomeDataTools;
import { useState } from "react";
import { FiUpload, FiDownload } from "react-icons/fi";
import { useProStatus } from "../hooks/useProStatus";
import { exportIncomesToCSV, importCSVToIncomes } from "../utils/csvUtils";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";

function IncomeDataTools() {
  const { currentUser } = useAuth();
  const isPro = useProStatus();
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);
      await exportIncomesToCSV(currentUser.uid);
      toast.success("Exported to CSV!");
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

  if (!isPro) return null;

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 space-y-4">
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-1">📁 Income Data Tools</h3>
        <p className="text-sm text-gray-600">
          Export your income records to a CSV file or import from Fiverr/Upwork reports.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        {/* Export Button */}
        <button
          onClick={handleExport}
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md transition"
        >
          <FiDownload size={18} />
          Export to CSV
        </button>

        {/* Import File Input */}
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

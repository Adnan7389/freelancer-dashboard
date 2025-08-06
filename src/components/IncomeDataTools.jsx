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
      toast.error("Export failed.");
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
      toast.error("Import failed.");
    } finally {
      setLoading(false);
    }
  };

  if (!isPro) return null;

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">📂 Import & Export</h3>
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={handleExport}
          disabled={loading}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          <FiDownload /> Export CSV
        </button>

        <label className="flex items-center gap-2 cursor-pointer bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">
          <FiUpload /> Import CSV
          <input
            type="file"
            accept=".csv"
            onChange={handleImport}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
}

export default IncomeDataTools;

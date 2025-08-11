import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useProStatus } from "../hooks/useProStatus";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import IncomeDataTools from "../components/IncomeDataTools";

function IncomeToolsPage() {
  const { currentUser } = useAuth();
  const isPro = useProStatus();
  const navigate = useNavigate();

  if (!isPro) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Upgrade to Pro</h2>
          <p className="text-gray-600 mb-6">Income Data Tools are only available for Pro users.</p>
          <a
            href="https://trackmyincome.lemonsqueezy.com/buy/fc8795bb-8bc2-483e-badf-a2b2afcfdd30"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-medium py-2.5 px-6 rounded-lg hover:opacity-90 transition-opacity"
          >
            <span>Upgrade Now</span>
            <span className="text-xs bg-yellow-700 text-yellow-100 px-2 py-0.5 rounded-full">
              $5/month
            </span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-blue-600 hover:underline"
          >
            <FiArrowLeft /> Back to Dashboard
          </button>
        </div>
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">Income Data Tools</h1>
            <p className="text-gray-600">
              Export your income data or import from platform reports
            </p>
          </div>
          <IncomeDataTools />
        </div>
      </div>
    </div>
  );
}

export default IncomeToolsPage;

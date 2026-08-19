import { useState, useEffect } from "react";
import axios from "axios";

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Safely extract active user email from localStorage
  const getActiveUserEmail = () => {
    try {
      const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
      if (savedUser && savedUser.email) return savedUser.email;
    } catch (e) {
      // Fallback if 'user' key is standard string
    }
    return localStorage.getItem("userEmail") || "";
  };

  const currentUserEmail = getActiveUserEmail();

  useEffect(() => {
    fetchHistory();
  }, [currentUserEmail]);

  const calculateRisk = (type, amount) => {
    const category = (type || "").toLowerCase();
    const amt = Number(amount || 0);

    if (category.includes("ato") || category.includes("mule") || amt >= 100000) {
      return { level: "Critical", cls: "chip-red" };
    }
    if (category.includes("deepfake") || amt >= 25000) {
      return { level: "High", cls: "chip-orange" };
    }
    if (category.includes("upi") || amt >= 5000) {
      return { level: "Moderate", cls: "chip-yellow" };
    }
    return { level: "Safe", cls: "chip-green" };
  };

  const fetchHistory = async () => {
    setLoading(true);
    if (!currentUserEmail) {
      setHistory([]);
      setLoading(false);
      return;
    }

    try {
      const url = `http://localhost:8000/api/reports/?email=${encodeURIComponent(currentUserEmail)}`;
      const response = await axios.get(url);
      const data = response.data;

      // Strict case-insensitive client verification to isolate account records
      const userFilteredData = data.filter(
        (item) => (item.email || "").toLowerCase() === currentUserEmail.toLowerCase()
      );

      const formattedData = userFilteredData.map((item) => {
        const riskObj = calculateRisk(item.fraud_type, item.amount);

        const formattedDate = item.created_at
          ? new Date(item.created_at).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "N/A";

        return {
          id: item.report_id || item._id,
          date: formattedDate,
          type: item.fraud_type || item.type || "General",
          category: item.title || item.description || "Fraud Detection",
          email: item.email || item.contact_email || "N/A",
          amount: Number(item.amount || item.amount_lost || 0),
          risk: riskObj.level,
          cls: riskObj.cls,
          status: item.status || "Submitted",
        };
      });

      setHistory(formattedData);
    } catch (error) {
      console.error("Failed to fetch history from DB:", error);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-primary-dark">Fraud History</h1>
        <p className="text-slate-500">A complete log of your past fraud reports and checks.</p>
      </div>

      <div className="card !p-0 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 font-medium">Loading history...</div>
        ) : history.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No history found for this account.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="text-left px-5 py-3 font-semibold">Date</th>
                <th className="text-left px-5 py-3 font-semibold">Type</th>
                <th className="text-left px-5 py-3 font-semibold">Title / Description</th>
                <th className="text-left px-5 py-3 font-semibold">Email</th>
                <th className="text-left px-5 py-3 font-semibold">Amount</th>
                <th className="text-left px-5 py-3 font-semibold">Risk Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 text-slate-600 font-medium whitespace-nowrap">{r.date}</td>
                  <td className="px-5 py-3 font-semibold text-slate-700">{r.type}</td>
                  <td className="px-5 py-3 text-slate-600 truncate max-w-xs">{r.category}</td>
                  <td className="px-5 py-3 text-slate-500">{r.email}</td>
                  <td className="px-5 py-3 font-semibold text-slate-700">
                    ₹{r.amount.toLocaleString("en-IN")}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`chip ${r.cls}`}>{r.risk}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
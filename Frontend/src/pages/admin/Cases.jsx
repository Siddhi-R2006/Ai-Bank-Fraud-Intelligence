import { useState, useEffect } from "react";
import axios from "axios";
import { FiX, FiCheckCircle, FiClock, FiInbox } from "react-icons/fi";

const CATEGORIES = ["Phishing", "UPI Scam", "ATO", "Deepfake", "Mule"];

export default function Cases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null);
  const [q, setQ] = useState("");
  const [f, setF] = useState("All");

  useEffect(() => {
    fetchCases();
  }, []);

  const getMappedStatus = (rawStatus) => {
    const status = (rawStatus || "").toLowerCase();
    if (status === "solved" || status === "resolved" || status === "case completed") {
      return { value: "Resolved", label: "Case Completed", cls: "bg-emerald-100 text-emerald-700" };
    }
    if (status === "working" || status === "investigating" || status === "under working") {
      return { value: "Investigating", label: "Under Working", cls: "bg-blue-100 text-blue-700" };
    }
    return { value: "Open", label: "Received", cls: "bg-amber-100 text-amber-700" };
  };

  const calculateRiskLevel = (type, amount, dbRisk) => {
    if (dbRisk && dbRisk !== "High") {
      return {
        level: dbRisk,
        cls: dbRisk === "Critical" ? "chip-red" : dbRisk === "Moderate" ? "chip-yellow" : "chip-green",
      };
    }

    if (type === "ATO" || type === "Mule" || amount >= 100000) {
      return { level: "Critical", cls: "chip-red" };
    }
    if (type === "Deepfake" || amount >= 25000) {
      return { level: "High", cls: "chip-orange" };
    }
    if (type === "UPI Scam" || amount >= 5000) {
      return { level: "Moderate", cls: "chip-yellow" };
    }
    return { level: "Low", cls: "chip-green" };
  };

  const normalizeCategory = (rawType) => {
    const typeStr = (rawType || "").toString().toLowerCase();
    let matchedCat = CATEGORIES.find((c) => c.toLowerCase() === typeStr);

    if (!matchedCat) {
      if (typeStr.includes("upi")) matchedCat = "UPI Scam";
      else if (typeStr.includes("ato") || typeStr.includes("account")) matchedCat = "ATO";
      else if (typeStr.includes("fake") || typeStr.includes("deep")) matchedCat = "Deepfake";
      else if (typeStr.includes("mule")) matchedCat = "Mule";
      else matchedCat = "Phishing";
    }

    return matchedCat;
  };

  const fetchCases = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/reports/");
      const data = response.data;

      const mappedData = data.map((item) => {
        // Retrieve Customer ID explicitly
        const rawCustId =
          item.customer_id ||
          item.user_id?._id ||
          item.user_id ||
          item.user?.id ||
          item.user?._id;

        const customerId = rawCustId
          ? `CUST-${String(rawCustId).slice(-6).toUpperCase()}`
          : item._id
          ? `CUST-${item._id.slice(-6).toUpperCase()}`
          : "CUST-000000";

        // Fetch Email Address directly
        const email =
          item.email ||
          item.user?.email ||
          item.user_id?.email ||
          item.contact_email ||
          "N/A";

        const category = normalizeCategory(item.fraud_type || item.type || item.category);
        const amount = Number(item.amount || item.amount_lost || 0);
        const riskObj = calculateRiskLevel(category, amount, item.risk_level);
        const statusObj = getMappedStatus(item.status);

        return {
          rawId: item._id,
          id: item._id ? `CASE-${item._id.slice(-6).toUpperCase()}` : `CASE-${item.case_id || "0000"}`,
          custId: customerId,
          email: email,
          amt: amount,
          type: category,
          s: statusObj.label,
          statusValue: statusObj.value,
          statusCls: statusObj.cls,
          r: riskObj.level,
          cls: riskObj.cls,
          date: item.created_at
            ? new Date(item.created_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : new Date().toLocaleDateString("en-IN"),
          description: item.description || item.details || item.summary || "No description provided.",
        };
      });

      setCases(mappedData);
    } catch (error) {
      console.error("Error fetching cases from DB:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (caseItem, newStatusLabel) => {
    let backendStatus = "Submitted";
    if (newStatusLabel === "Under Working") backendStatus = "Investigating";
    if (newStatusLabel === "Case Completed") backendStatus = "Resolved";

    try {
      const updatedStatusObj = getMappedStatus(backendStatus);
      setCases((prev) =>
        prev.map((c) =>
          c.rawId === caseItem.rawId
            ? {
                ...c,
                s: updatedStatusObj.label,
                statusValue: updatedStatusObj.value,
                statusCls: updatedStatusObj.cls,
              }
            : c
        )
      );

      if (selectedCase && selectedCase.rawId === caseItem.rawId) {
        setSelectedCase((prev) => ({
          ...prev,
          s: updatedStatusObj.label,
          statusValue: updatedStatusObj.value,
          statusCls: updatedStatusObj.cls,
        }));
      }

      if (caseItem.rawId) {
        await axios.patch(`http://localhost:8000/api/reports/${caseItem.rawId}`, {
          status: backendStatus,
        });
      }
    } catch (error) {
      console.error("Failed to update status in backend:", error);
    }
  };

  const rows = cases.filter(
    (r) =>
      (f === "All" || r.s === f) &&
      (q === "" ||
        r.custId.toLowerCase().includes(q.toLowerCase()) ||
        r.email.toLowerCase().includes(q.toLowerCase()) ||
        r.id.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-primary-dark">Case Management</h1>
        <p className="text-slate-500">Investigation queue for the fraud response team.</p>
      </div>

      <div className="card !p-0 overflow-hidden">
        <div className="p-4 flex flex-col md:flex-row gap-3 border-b border-slate-100">
          <input
            className="input flex-1"
            placeholder="Search by Customer ID, email, or case ID…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select className="input md:w-52" value={f} onChange={(e) => setF(e.target.value)}>
            <option value="All">All Statuses</option>
            <option value="Received">Received</option>
            <option value="Under Working">Under Working</option>
            <option value="Case Completed">Case Completed</option>
          </select>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500 font-medium">Loading cases...</div>
        ) : rows.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No matching cases found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="text-left px-5 py-3">Case</th>
                <th className="text-left px-5 py-3">Customer ID</th>
                <th className="text-left px-5 py-3">Email ID</th>
                <th className="text-left px-5 py-3">Amount</th>
                <th className="text-left px-5 py-3">Type</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-left px-5 py-3">Risk</th>
                <th className="text-left px-5 py-3">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 cursor-pointer">
                  <td
                    className="px-5 py-3 font-mono text-xs text-indigo-600 font-semibold"
                    onClick={() => setSelectedCase(r)}
                  >
                    {r.id}
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-slate-700" onClick={() => setSelectedCase(r)}>
                    {r.custId}
                  </td>
                  <td className="px-5 py-3 text-slate-600" onClick={() => setSelectedCase(r)}>
                    {r.email}
                  </td>
                  <td className="px-5 py-3 font-semibold" onClick={() => setSelectedCase(r)}>
                    ₹{r.amt.toLocaleString("en-IN")}
                  </td>
                  <td className="px-5 py-3" onClick={() => setSelectedCase(r)}>
                    {r.type}
                  </td>
                  <td className="px-5 py-3" onClick={() => setSelectedCase(r)}>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${r.statusCls}`}>
                      {r.s}
                    </span>
                  </td>
                  <td className="px-5 py-3" onClick={() => setSelectedCase(r)}>
                    <span className={`chip ${r.cls}`}>{r.r}</span>
                  </td>
                  <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
                    <select
                      className="text-xs p-1 border rounded bg-white font-medium focus:outline-none"
                      value={r.s}
                      onChange={(e) => handleStatusChange(r, e.target.value)}
                    >
                      <option value="Received">Received</option>
                      <option value="Under Working">Under Working</option>
                      <option value="Case Completed">Case Completed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Details Modal */}
      {selectedCase && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-100 animate-fadeIn">
            <div className="p-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-indigo-600 font-bold">{selectedCase.id}</span>
                <h2 className="text-lg font-bold text-slate-800">Customer Fraud Report Details</h2>
              </div>
              <button
                onClick={() => setSelectedCase(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-xs">Customer ID</span>
                  <span className="font-semibold font-mono text-slate-700">{selectedCase.custId}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">Email Address</span>
                  <span className="font-semibold text-slate-700">{selectedCase.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">Reported Amount</span>
                  <span className="font-semibold text-emerald-600">₹{selectedCase.amt.toLocaleString("en-IN")}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">Fraud Category</span>
                  <span className="font-semibold text-slate-700">{selectedCase.type}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">Report Date</span>
                  <span className="font-semibold text-slate-700">{selectedCase.date}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">Risk Level</span>
                  <span className={`chip ${selectedCase.cls}`}>{selectedCase.r}</span>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Incident Description
                </h3>
                <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed whitespace-pre-line">
                  {selectedCase.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">Update Incident Status:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStatusChange(selectedCase, "Received")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
                      selectedCase.s === "Received" ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <FiInbox /> Received
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedCase, "Under Working")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
                      selectedCase.s === "Under Working" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <FiClock /> Under Working
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedCase, "Case Completed")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
                      selectedCase.s === "Case Completed" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <FiCheckCircle /> Case Completed
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
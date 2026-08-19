import { useState, useEffect } from "react";
import { FiDownload, FiChevronDown, FiChevronRight } from "react-icons/fi";
import axios from "axios";

// Standard category filters
const CATEGORIES = ["Phishing", "UPI Scam", "ATO", "Deepfake", "Mule"];

export default function Reports() {
  const [groupedReports, setGroupedReports] = useState({});
  const [expandedTypes, setExpandedTypes] = useState({});
  const [loading, setLoading] = useState(true);
  const [f, setF] = useState("All");

  useEffect(() => {
    fetchReports();
  }, []);

  const getMappedStatus = (rawStatus) => {
    const status = (rawStatus || "").toLowerCase();
    if (status === "solved" || status === "resolved") {
      return { label: "Resolved", cls: "bg-emerald-100 text-emerald-700" };
    }
    if (status === "working" || status === "investigating" || status === "in_progress") {
      return { label: "Under Working", cls: "bg-blue-100 text-blue-700" };
    }
    // Default for "submitted", "open", or newly created reports
    return { label: "Received", cls: "bg-amber-100 text-amber-700" };
  };

  const fetchReports = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/reports/");
      const data = response.data;

      // Initialize empty category structural buckets
      const groups = {};
      CATEGORIES.forEach((cat) => {
        groups[cat] = {
          type: cat,
          totalCases: 0,
          resolvedCases: 0,
          items: [],
        };
      });

      data.forEach((item) => {
        const rawType = item.fraud_type || item.type || "";
        
        // Match raw backend strings to the 5 standard categories
        let matchedCat = CATEGORIES.find(
          (c) => c.toLowerCase() === rawType.toLowerCase()
        );

        if (!matchedCat) {
          if (rawType.toLowerCase().includes("upi")) matchedCat = "UPI Scam";
          else if (rawType.toLowerCase().includes("phish")) matchedCat = "Phishing";
          else if (rawType.toLowerCase().includes("ato")) matchedCat = "ATO";
          else if (rawType.toLowerCase().includes("fake")) matchedCat = "Deepfake";
          else if (rawType.toLowerCase().includes("mule")) matchedCat = "Mule";
          else matchedCat = "Phishing";
        }

        const mappedStatus = getMappedStatus(item.status);
        
        groups[matchedCat].totalCases += 1;
        if (mappedStatus.label === "Resolved") {
          groups[matchedCat].resolvedCases += 1;
        }

        // Fetch customer name across possible database schema fields
        const customerName =
          item.full_name ||
          item.customer_name ||
          item.reporter_name ||
          item.name ||
          item.username ||
          item.email ||
          "N/A";

        groups[matchedCat].items.push({
          id: item._id ? `CASE-${item._id.slice(-6).toUpperCase()}` : `CASE-${item.case_id || "0000"}`,
          customer: customerName,
          amount: Number(item.amount || item.amount_lost || 0),
          statusInfo: mappedStatus,
          date: item.created_at
            ? new Date(item.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
            : new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
        });
      });

      setGroupedReports(groups);
    } catch (error) {
      console.error("Error fetching reports from DB:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (type) => {
    setExpandedTypes((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const handleExportCSV = () => {
    const categories = Object.values(groupedReports);
    if (!categories.length) return;

    let csvContent = "Fraud Type,Total Cases,Resolved Cases,Resolution Rate\n";
    categories.forEach((cat) => {
      const rate = cat.totalCases > 0 ? Math.round((cat.resolvedCases / cat.totalCases) * 100) : 0;
      csvContent += `"${cat.type}",${cat.totalCases},${cat.resolvedCases},${rate}%\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fraud_reports_summary_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const visibleCategories = CATEGORIES.filter(
    (cat) => f === "All" || cat.toLowerCase() === f.toLowerCase()
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">Reports</h1>
          <p className="text-slate-500">Regulatory & executive summaries by category.</p>
        </div>
        <button onClick={handleExportCSV} className="btn-primary flex items-center gap-2">
          <FiDownload /> Export CSV
        </button>
      </div>

      <div className="card !p-0 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <select className="input md:w-52" value={f} onChange={(e) => setF(e.target.value)}>
            <option value="All">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500 font-medium">Loading reports from database...</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {visibleCategories.map((typeKey) => {
              const group = groupedReports[typeKey] || { type: typeKey, totalCases: 0, resolvedCases: 0, items: [] };
              const isExpanded = expandedTypes[typeKey];
              const rate = group.totalCases > 0 ? Math.round((group.resolvedCases / group.totalCases) * 100) : 0;

              return (
                <div key={typeKey} className="bg-white">
                  {/* Category Header Row */}
                  <div
                    onClick={() => toggleExpand(typeKey)}
                    className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer font-medium text-slate-700 select-none"
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? <FiChevronDown className="text-lg" /> : <FiChevronRight className="text-lg" />}
                      <span className="text-base font-bold text-primary-dark">{group.type}</span>
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <span className="text-slate-400 mr-1">Cases:</span>
                        <span className="font-semibold">{group.totalCases}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 mr-1">Resolved:</span>
                        <span className="font-semibold">{group.resolvedCases}</span>
                      </div>
                      <div className="w-20 text-right">
                        <span className="text-slate-400 mr-1">Rate:</span>
                        <span className="font-semibold text-emerald-600">{rate}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Submissions */}
                  {isExpanded && (
                    <div className="bg-slate-50 p-4 border-t border-slate-100">
                      {group.items.length === 0 ? (
                        <div className="text-center py-3 text-slate-400 text-xs italic">
                          No reported cases under {group.type} yet.
                        </div>
                      ) : (
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="text-slate-400 uppercase text-left border-b border-slate-200">
                              <th className="pb-2 px-3">Case ID</th>
                              <th className="pb-2 px-3">Reporter</th>
                              <th className="pb-2 px-3">Date</th>
                              <th className="pb-2 px-3">Amount</th>
                              <th className="pb-2 px-3">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {group.items.map((item, idx) => (
                              <tr key={idx} className="hover:bg-slate-100">
                                <td className="py-2 px-3 font-mono">{item.id}</td>
                                <td className="py-2 px-3">{item.customer}</td>
                                <td className="py-2 px-3">{item.date}</td>
                                <td className="py-2 px-3 font-semibold">₹{item.amount.toLocaleString("en-IN")}</td>
                                <td className="py-2 px-3">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${item.statusInfo.cls}`}
                                  >
                                    {item.statusInfo.label}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
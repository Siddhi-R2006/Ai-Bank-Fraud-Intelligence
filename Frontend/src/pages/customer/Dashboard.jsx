import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { getSession } from "../../lib/auth";
import { FiShield, FiMessageSquare, FiAlertTriangle, FiCheckCircle, FiTrendingUp } from "react-icons/fi";

export default function Dashboard() {
  const s = getSession();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // 1. Resolve user email from session object or localStorage fallback
      let userEmail = s?.email || s?.user?.email;
      if (!userEmail) {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            userEmail = parsed.email;
          } catch (e) {
            console.error("Error parsing stored user", e);
          }
        }
      }

      // 2. Build URL: Only pass email query if a valid string exists
      let url = "http://localhost:8000/api/reports/";
      if (userEmail && userEmail !== "undefined") {
        url += `?email=${encodeURIComponent(userEmail)}`;
      }

      const response = await axios.get(url);
      setReports(response.data || []);
    } catch (error) {
      console.error("Failed to fetch dashboard data from DB:", error);
    } finally {
      setLoading(false);
    }
  };

  // Dynamic KPI calculations from database records
  const totalReports = reports.length;

  const threatsBlocked = reports.filter((r) => {
    const type = (r.fraud_type || r.type || "").toLowerCase();
    const amount = Number(r.amount || 0);
    return type.includes("ato") || type.includes("mule") || type.includes("deepfake") || amount >= 25000;
  }).length;

  const inReviewCount = reports.filter((r) => {
    const status = (r.status || "").toLowerCase();
    return status === "submitted" || status === "under review" || status === "received";
  }).length;

  // Dynamic Security Score calculation
  const score = Math.max(50, 95 - threatsBlocked * 5);

  const getRiskChip = (fraudType, amount) => {
    const category = (fraudType || "").toLowerCase();
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

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="card !p-0 overflow-hidden">
        <div className="bg-gradient-primary text-white p-6 flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <div className="text-white/70 text-sm">Welcome back</div>
            <h1 className="text-2xl md:text-3xl font-bold">Hello, {s?.name || "Customer"} 👋</h1>
            <p className="text-white/85 mt-1">
              Your accounts look safe. Run a quick check anytime you receive a suspicious message.
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/customer/fraud-detector" className="px-5 py-2.5 rounded-xl bg-white text-primary-dark font-semibold">
              Quick fraud check
            </Link>
            <Link to="/customer/chatbot" className="px-5 py-2.5 rounded-xl border border-white/40 hover:bg-white/10">
              Ask AI chatbot
            </Link>
          </div>
        </div>
      </div>

      {/* Dynamic KPI Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="kpi">
          <div className="kpi-label">Total Reports Filed</div>
          <div className="kpi-value">{loading ? "..." : totalReports}</div>
          <div className="text-xs text-success flex items-center gap-1">
            <FiTrendingUp /> Syncing from Database
          </div>
        </div>

        <div className="kpi">
          <div className="kpi-label">Threats Flagged</div>
          <div className="kpi-value">{loading ? "..." : threatsBlocked}</div>
          <div className="text-xs text-slate-500">High / Critical cases</div>
        </div>

        <div className="kpi">
          <div className="kpi-label">Active Investigations</div>
          <div className="kpi-value">{loading ? "..." : inReviewCount}</div>
          <div className="text-xs text-slate-500">{inReviewCount} pending resolution</div>
        </div>

        <div className="card">
          <div className="kpi-label">Security Score</div>
          <div className="flex items-center gap-3 mt-2">
            <div className="relative w-16 h-16">
              <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#FCE7F3" strokeWidth="3" />
                <circle
                  cx="18"
                  cy="18"
                  r="15.9"
                  fill="none"
                  stroke="#6B21A8"
                  strokeWidth="3"
                  strokeDasharray={`${score}, 100`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 grid place-items-center text-primary-dark font-bold">
                {score}
              </div>
            </div>
            <div className="text-sm text-slate-600">
              {score >= 80 ? "Good — keep monitoring your alerts." : "Action Needed — resolve active fraud cases."}
            </div>
          </div>
        </div>
      </div>

      {/* Live Recent Checks + Banking Alerts */}
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-primary-dark flex items-center gap-2">
              <FiShield /> Recent fraud reports
            </h3>
            <Link to="/customer/history" className="text-sm text-primary font-semibold hover:underline">
              View all
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-slate-500">Loading recent database records...</div>
          ) : reports.length === 0 ? (
            <div className="py-8 text-center text-slate-500">No recent reports found in DB.</div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {reports.slice(0, 4).map((r) => {
                const risk = getRiskChip(r.fraud_type, r.amount);
                const formattedDate = r.created_at
                  ? new Date(r.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })
                  : "Recent";

                return (
                  <li key={r.report_id || r._id} className="py-3 flex items-center gap-3">
                    <FiAlertTriangle className="text-warning shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-800 truncate">
                        {r.title || r.description}
                      </div>
                      <div className="text-xs text-slate-500">
                        {r.fraud_type || "Fraud"} • {formattedDate}
                      </div>
                    </div>
                    <span className={`chip ${risk.cls}`}>{risk.level}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="card">
          <h3 className="font-bold text-primary-dark flex items-center gap-2 mb-3">
            <FiMessageSquare /> Latest banking alerts
          </h3>
          <ul className="space-y-3">
            {[
              "RBI: New phishing pattern impersonating tax refunds.",
              "UPI collect-request scam rising in metro cities.",
              "Never share OTP — banks never ask for it.",
              "Deepfake voice calls target senior citizens.",
            ].map((x, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <FiCheckCircle className="text-primary mt-0.5 shrink-0" /> {x}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
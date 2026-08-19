import { useState, useEffect } from "react";
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { FiAlertOctagon, FiFolder, FiTrendingUp, FiUsers } from "react-icons/fi";

Chart.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

export default function Dashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/reports/");
        if (res.ok) {
          const data = await res.json();
          setReports(data);
        }
      } catch (err) {
        console.error("Failed to fetch reports for dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  // --- KPI CALCULATIONS ---
  const totalFraud = reports.reduce((acc, r) => acc + (Number(r.amount) || 0), 0);
  const activeCasesCount = reports.filter(
    (r) => r.status && !["Resolved", "Case Completed", "Rejected"].includes(r.status)
  ).length;
  const highRiskCount = reports.filter((r) => Number(r.amount || 0) >= 50000).length;
  const totalReportsCount = reports.length;

  const kpis = [
    {
      l: "Total Reported Amount",
      v: `₹${totalFraud.toLocaleString("en-IN")}`,
      icon: <FiAlertOctagon />,
      trend: "+Live",
    },
    {
      l: "Active Cases",
      v: activeCasesCount.toString(),
      icon: <FiFolder />,
      trend: `${totalReportsCount} Total`,
    },
    {
      l: "High Risk Cases",
      v: highRiskCount.toString(),
      icon: <FiTrendingUp />,
      trend: "≥ ₹50k",
    },
    {
      l: "Total Incident Reports",
      v: totalReportsCount.toString(),
      icon: <FiUsers />,
      trend: "DB Live",
    },
  ];

  // --- CHART DATA PROCESSING ---
  // Category Breakdown for Doughnut Chart
  const categoryCounts = reports.reduce((acc, r) => {
    const type = r.fraud_type || "Other";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const donutLabels = Object.keys(categoryCounts).length
    ? Object.keys(categoryCounts)
    : ["No Data"];
  const donutValues = Object.keys(categoryCounts).length
    ? Object.values(categoryCounts)
    : [1];

  const donut = {
    labels: donutLabels,
    datasets: [
      {
        data: donutValues,
        backgroundColor: [
          "#6B21A8",
          "#9333EA",
          "#C2185B",
          "#f59e0b",
          "#ef4444",
          "#10b981",
          "#3b82f6",
        ],
      },
    ],
  };

  // Weekly Trend Line Chart (Grouped by Day of Week)
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const countsByDay = [0, 0, 0, 0, 0, 0, 0];

  reports.forEach((r) => {
    if (r.created_at) {
      const d = new Date(r.created_at);
      let dayIdx = d.getDay() - 1; // 0 = Mon, 6 = Sun
      if (dayIdx === -1) dayIdx = 6;
      countsByDay[dayIdx] += 1;
    }
  });

  const line = {
    labels: daysOfWeek,
    datasets: [
      {
        label: "Reported Incidents",
        data: countsByDay,
        borderColor: "#6B21A8",
        backgroundColor: "rgba(107,33,168,.15)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // --- RECENT CASES TABLE (Sorted by Amount / Risk) ---
  const sortedCases = [...reports]
    .sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0))
    .slice(0, 5);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-primary-dark">
          Security Operations Center
        </h1>
        <p className="text-slate-500 text-sm">
          Enterprise-wide view of real live fraud signals.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid md:grid-cols-4 gap-3">
        {kpis.map((k) => (
          <div key={k.l} className="card !p-4 flex flex-col gap-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-lg">{k.icon}</span>
              <span className="text-xs font-semibold text-danger">{k.trend}</span>
            </div>
            <div className="text-2xl font-bold text-primary-dark">{k.v}</div>
            <div className="text-xs text-slate-500 font-medium">{k.l}</div>
          </div>
        ))}
      </div>

      {/* Analytics Charts */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="card !p-4 lg:col-span-2">
          <h3 className="font-bold text-primary-dark text-sm mb-2">
            Fraud trends — this week
          </h3>
          <div className="h-36">
            <Line
              data={line}
              options={{
                plugins: {
                  legend: {
                    position: "bottom",
                    labels: { boxHeight: 6, font: { size: 11 } },
                  },
                },
                maintainAspectRatio: false,
              }}
            />
          </div>
        </div>

        <div className="card !p-4">
          <h3 className="font-bold text-primary-dark text-sm mb-2">By category</h3>
          <div className="h-36">
            <Doughnut
              data={donut}
              options={{
                plugins: {
                  legend: {
                    position: "bottom",
                    labels: { boxHeight: 6, font: { size: 11 } },
                  },
                },
                maintainAspectRatio: false,
              }}
            />
          </div>
        </div>
      </div>

      {/* Table & Heatmap */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card !p-0 overflow-hidden">
          <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-primary-dark text-sm">
              Active investigations
            </h3>
            <span className="text-xs text-slate-500">Sorted by highest amount</span>
          </div>
          <table className="w-full text-xs">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="text-left px-4 py-1.5">Case ID</th>
                <th className="text-left px-4 py-1.5">Email / Customer</th>
                <th className="text-left px-4 py-1.5">Amount</th>
                <th className="text-left px-4 py-1.5">Risk Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-slate-400">
                    Loading live database cases...
                  </td>
                </tr>
              ) : sortedCases.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-slate-400">
                    No active case records found.
                  </td>
                </tr>
              ) : (
                sortedCases.map((c) => {
                  const amt = Number(c.amount || 0);
                  const isCritical = amt >= 50000;
                  return (
                    <tr key={c._id || c.report_id} className="hover:bg-slate-50">
                      <td className="px-4 py-1.5 font-mono text-[10px]">
                        {c.report_id || c._id?.slice(-6)}
                      </td>
                      <td className="px-4 py-1.5 truncate max-w-[120px]">
                        {c.email || c.title}
                      </td>
                      <td className="px-4 py-1.5 font-semibold">
                        ₹{amt.toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-1.5">
                        <span
                          className={`chip ${
                            isCritical ? "chip-red" : "chip-orange"
                          }`}
                        >
                          {isCritical ? "Critical" : "High"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="card !p-4">
          <h3 className="font-bold text-primary-dark text-sm mb-2">
            Fraud heatmap · Live signals
          </h3>
          <div className="grid grid-cols-12 gap-0.5">
            {Array.from({ length: 24 }).map((_, i) => {
              const hasData = reports.length > i;
              const bg = hasData
                ? Number(reports[i]?.amount || 0) >= 50000
                  ? "bg-red-600"
                  : "bg-orange-400"
                : "bg-purple-50";
              return <div key={i} className={`h-3 rounded-sm ${bg}`} />;
            })}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
            <span>Low</span>
            <div className="flex-1 h-1.5 rounded bg-gradient-to-r from-purple-100 via-orange-300 to-red-600" />
            <span>High</span>
          </div>
        </div>
      </div>
    </div>
  );
}
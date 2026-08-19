import { useState, useEffect } from "react";
import { FiAlertOctagon, FiRadio } from "react-icons/fi";

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  // Fetch initial real report threats from backend API
  useEffect(() => {
    const fetchExistingReports = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/reports/");
        if (res.ok) {
          const data = await res.json();
          // Transform MongoDB records into alert format
          const formatted = data.map((r) => ({
            time: r.created_at
              ? new Date(r.created_at).toLocaleTimeString("en-US", {
                  hour12: false,
                })
              : "Just now",
            t: `Report: ${r.fraud_type || "Threat"} - ${r.title}`,
            loc: r.city || "Unknown Location",
            level: Number(r.amount || 0) >= 50000 ? "Critical" : "High",
          }));
          setAlerts(formatted.reverse());
        }
      } catch (err) {
        console.error("Failed to fetch initial reports:", err);
      }
    };

    fetchExistingReports();
  }, []);

  // Listen for real-time WebSocket threat events from reports and detector
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/ws/alerts");

    ws.onopen = () => setIsConnected(true);

    ws.onmessage = (event) => {
      try {
        const newAlert = JSON.parse(event.data);
        setAlerts((prev) => [newAlert, ...prev]);
      } catch (err) {
        console.error("Failed to parse incoming WebSocket alert", err);
      }
    };

    ws.onclose = () => setIsConnected(false);
    ws.onerror = (err) => console.error("WebSocket error:", err);

    return () => ws.close();
  }, []);

  const chip = (l) =>
    l === "Critical" ? "chip-red" : l === "High" ? "chip-orange" : "chip-blue";

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-primary-dark">Live Fraud Alerts</h1>
        <p className="text-slate-500">
          Streaming feed of active threats from reports and AI detector.
        </p>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-primary-dark flex items-center gap-2">
            <FiRadio className="text-danger" /> Real-time feed
          </h3>
          <span
            className={`text-xs font-bold flex items-center gap-1 ${
              isConnected ? "text-danger" : "text-slate-400"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? "bg-danger animate-pulse" : "bg-slate-300"
              }`}
            />
            {isConnected ? "LIVE" : "DISCONNECTED"}
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              No active threats detected yet.
            </div>
          ) : (
            alerts.map((a, i) => (
              <div key={i} className="flex items-center gap-3 py-3">
                <div className="text-xs font-mono text-slate-500 w-20">{a.time}</div>
                <FiAlertOctagon
                  className={a.level === "Critical" ? "text-danger" : "text-warning"}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-primary-dark truncate">{a.t}</div>
                  <div className="text-xs text-slate-500">{a.loc}</div>
                </div>
                <span className={`chip ${chip(a.level)}`}>{a.level}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
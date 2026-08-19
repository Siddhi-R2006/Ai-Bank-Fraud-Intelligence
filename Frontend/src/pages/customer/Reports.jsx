import { useState, useEffect } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";

const CATEGORIES = ["Phishing", "UPI Scam", "ATO", "Deepfake", "Mule"];
const CHANNELS = ["Mobile", "Web", "ATM", "Branch"];

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const [form, setForm] = useState({
    email: currentUserEmail,
    fraud_type: "Phishing",
    channel: "Mobile",
    amount: "",
    title: "",
    description: "",
    city: "Dombivli, Maharashtra",
    age: "",
  });

  // Re-sync form state and fetch records when session email resolves
  useEffect(() => {
    if (currentUserEmail) {
      setForm((prev) => ({ ...prev, email: currentUserEmail }));
      fetchReports(currentUserEmail);
    } else {
      setReports([]);
    }
  }, [currentUserEmail]);

  const fetchReports = async (email) => {
    if (!email) {
      setReports([]);
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:8000/api/reports/?email=${encodeURIComponent(email)}`
      );
      if (res.ok) {
        const data = await res.json();
        // Strict case-insensitive client filtering to prevent cross-account leakage
        const filtered = data.filter(
          (r) => (r.email || "").toLowerCase() === email.toLowerCase()
        );
        setReports(filtered);
      }
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const selectedChannel = form.channel || "Mobile";

    // Multi-key payload to match any backend model field requirement
    const payload = {
      email: currentUserEmail || form.email,
      fraud_type: form.fraud_type,
      channel: selectedChannel,
      fraud_channel: selectedChannel,
      channel_type: selectedChannel,
      source_channel: selectedChannel,
      amount: Number(form.amount || 0),
      title: form.title,
      description: form.description,
      city: form.city,
      age: Number(form.age),
      status: "Submitted",
    };

    try {
      const res = await fetch("http://localhost:8000/api/reports/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setForm({
          email: currentUserEmail,
          fraud_type: "Phishing",
          channel: "Mobile",
          amount: "",
          title: "",
          description: "",
          city: "Dombivli, Maharashtra",
          age: "",
        });
        setOpen(false);
        fetchReports(currentUserEmail);
      }
    } catch (err) {
      console.error("Failed to create report:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reportId) => {
    if (!window.confirm("Are you sure you want to delete this report?")) return;
    try {
      const res = await fetch(`http://localhost:8000/api/reports/${reportId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setReports((prev) =>
          prev.filter((r) => (r.report_id || r._id) !== reportId)
        );
      }
    } catch (err) {
      console.error("Failed to delete report:", err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">My Fraud Reports</h1>
          <p className="text-slate-500">Track the status of every case you have filed.</p>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="btn-primary flex items-center gap-2"
        >
          <FiPlus /> New report
        </button>
      </div>

      {open && (
        <form onSubmit={submit} className="card space-y-4 border border-indigo-100 shadow-md">
          <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">
            File Fraud Incident Report
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="label">Your Email Address</label>
              <input
                type="email"
                className="input bg-slate-50 cursor-not-allowed"
                value={form.email}
                readOnly
                required
              />
            </div>

            <div>
              <label className="label">Fraud Category</label>
              <select
                className="input"
                value={form.fraud_type}
                onChange={(e) => setForm({ ...form, fraud_type: e.target.value })}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Fraud Channel Source</label>
              <select
                className="input"
                value={form.channel}
                onChange={(e) => setForm({ ...form, channel: e.target.value })}
              >
                {CHANNELS.map((ch) => (
                  <option key={ch} value={ch}>
                    {ch}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">City / Location</label>
              <input
                className="input"
                placeholder="e.g. Dombivli, Maharashtra"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="label">Customer Age</label>
              <input
                type="number"
                min="1"
                max="120"
                className="input"
                placeholder="e.g. 24"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">Amount (Lost / Demanded)</label>
              <input
                type="number"
                className="input"
                placeholder="e.g. 5000"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="label">Incident Subject / Title</label>
              <input
                className="input"
                placeholder="e.g. Fraudulent UPI request received"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Detailed Description</label>
            <textarea
              className="input min-h-[100px]"
              placeholder="Describe what happened, transaction reference IDs, suspicious links..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2 rounded-lg text-sm text-slate-500 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button className="btn-primary" disabled={loading}>
              {loading ? "Submitting..." : "Submit Report"}
            </button>
          </div>
        </form>
      )}

      {/* Reports Display List */}
      <div className="grid md:grid-cols-2 gap-4">
        {reports.length === 0 ? (
          <div className="col-span-2 text-center p-8 card text-slate-500">
            No reports filed for this account yet.
          </div>
        ) : (
          reports.map((r) => {
            const reportId = r.report_id || r._id;
            // Check every possible key returned by backend DB models
            const displayChannel =
              r.channel ||
              r.fraud_channel ||
              r.channel_type ||
              r.source_channel ||
              "Mobile";

            return (
              <div key={reportId} className="card relative group space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-indigo-600 font-semibold">
                    {r.report_id ? r.report_id : `CASE-${String(reportId).slice(-6).toUpperCase()}`}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`chip ${r.badge_class || "chip-blue"}`}>
                      {r.status || "Submitted"}
                    </span>
                    <button
                      onClick={() => handleDelete(reportId)}
                      className="text-slate-400 hover:text-red-500 transition p-1"
                      title="Delete Report"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>

                <div className="font-semibold text-primary-dark">{r.title}</div>
                <p className="text-sm text-slate-600 leading-relaxed">{r.description}</p>

                <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-1 text-xs text-slate-500">
                  <span>
                    <strong className="text-slate-700">Email:</strong> {r.email || "N/A"}
                  </span>
                  <span>
                    <strong className="text-slate-700">Location:</strong> {r.city || "N/A"}
                  </span>
                  <span>
                    <strong className="text-slate-700">Age:</strong> {r.age ? `${r.age} yrs` : "N/A"}
                  </span>
                  <span>
                    <strong className="text-slate-700">Channel:</strong> {displayChannel}
                  </span>
                  <span>
                    <strong className="text-slate-700">Category:</strong> {r.fraud_type || r.type || "N/A"}
                  </span>
                </div>
                <div className="pt-1 flex justify-end text-xs font-bold text-emerald-600">
                  ₹{Number(r.amount || 0).toLocaleString("en-IN")}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
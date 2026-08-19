import { useState } from "react";
import { FiShield, FiAlertTriangle, FiCheckCircle, FiInfo } from "react-icons/fi";

export default function FraudDetector({ tone = "customer" }) {
  const [input, setInput] = useState("");
  const [res, setRes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:8000/api/detector/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: input }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze text via ML service.");
      }

      const data = await response.json();
      setRes({
        score: data.risk_score,
        level: data.level,
        probability: data.probability,
        detectedType: data.detected_type,
        hits: data.signals || [],
        explanation: data.explanation || "No additional explanation available.",
      });
    } catch (err) {
      console.error("ML Inference Error:", err);
      setError("Unable to connect to ML prediction service. Ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const level = res?.level;
  const chip =
    level === "Critical"
      ? "chip-red"
      : level === "Suspicious"
      ? "chip-orange"
      : "chip-green";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary-dark">AI Fraud Detector</h1>
        <p className="text-slate-500">
          Paste any SMS, email, or URL — our multi-domain Random Forest classifier will analyze the threat.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="card">
          <label className="label">Message / URL / Email text</label>
          <textarea
            className="input min-h-[180px]"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. Dear customer, your SBI KYC is expired. Click http://sbi-verify.xyz to update…"
          />

          {error && (
            <div className="mt-2 text-xs text-red-500 font-medium">{error}</div>
          )}

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleAnalyze}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
              disabled={loading || !input.trim()}
            >
              <FiShield /> {loading ? "Analyzing with AI..." : "Analyze Threat"}
            </button>
            <button
              onClick={() => {
                setInput("");
                setRes(null);
                setError(null);
              }}
              className="btn-outline"
            >
              Clear
            </button>
          </div>
          <div className="mt-4 text-xs text-slate-500">
            {tone === "admin"
              ? "Admin mode: findings are logged to the SOC audit trail."
              : "Your inputs are evaluated real-time against 700k+ trained records."}
          </div>
        </div>

        <div className="card">
          <h3 className="font-bold text-primary-dark">Risk Assessment Result</h3>
          {!res ? (
            <div className="text-slate-400 text-sm mt-8 text-center">
              Run an analysis to see model confidence & risk level.
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-4xl font-extrabold text-primary-dark">
                    {res.score}
                    <span className="text-lg text-slate-400">/100</span>
                  </div>
                  <span className="text-xs text-indigo-600 font-semibold uppercase tracking-wider">
                    {res.detectedType}
                  </span>
                </div>
                <span className={`chip ${chip}`}>{level}</span>
              </div>

              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    res.score >= 70
                      ? "bg-danger"
                      : res.score >= 40
                      ? "bg-warning"
                      : "bg-success"
                  } transition-all`}
                  style={{ width: `${res.score}%` }}
                />
              </div>

              {/* Summary Analysis Explanation Box */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 flex gap-2.5 items-start">
                <FiInfo className="text-indigo-600 shrink-0 mt-0.5 text-base" />
                <div>
                  <div className="font-semibold text-slate-900 mb-0.5">Summary Analysis</div>
                  <p className="text-slate-600 text-xs leading-relaxed">{res.explanation}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-sm font-semibold text-slate-700">
                  Model Confidence:{" "}
                  <span className="text-indigo-600">
                    {(res.probability * 100).toFixed(1)}% Threat Probability
                  </span>
                </div>

                <div className="text-sm font-semibold text-slate-700">
                  Detected Signals
                </div>
                {res.hits.length === 0 ? (
                  <div className="flex items-center gap-2 text-success text-sm">
                    <FiCheckCircle /> Clean structural pattern detected.
                  </div>
                ) : (
                  <ul className="space-y-1.5">
                    {res.hits.map((h) => (
                      <li key={h} className="flex items-center gap-2 text-sm text-slate-700">
                        <FiAlertTriangle className="text-warning" /> Flagged pattern:{" "}
                        <b className="font-mono">{h}</b>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
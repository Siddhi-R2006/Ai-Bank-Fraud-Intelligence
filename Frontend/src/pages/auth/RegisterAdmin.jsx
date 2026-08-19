import { useState } from "react";
import { Link } from "react-router-dom";
import AuthShell from "./AuthShell";
import { saveSession } from "../../lib/auth";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function RegisterAdmin() {
  const [f, setF] = useState({
    name: "",
    empId: "",
    email: "",
    department: "Cyber Fraud Intelligence",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    e.stopPropagation();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/auth/register/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(f),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Registration failed. Please check details.");
      }

      const userData = data.user || {
        name: f.name,
        empId: f.empId,
        email: f.email,
        department: f.department,
        role: "admin",
      };

      saveSession(data.token, userData, "admin");
      window.location.replace("/admin/dashboard");
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <AuthShell side="admin" title="Register as analyst" subtitle="For internal fraud & risk teams only.">
      {error && (
        <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Full name</label>
          <input className="input" value={f.name} onChange={set("name")} required disabled={loading} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Employee ID</label>
            <input className="input" value={f.empId} onChange={set("empId")} placeholder="EMP-2041" required disabled={loading} />
          </div>
          <div>
            <label className="label">Department</label>
            <select className="input" value={f.department} onChange={set("department")} disabled={loading}>
              <option>Cyber Fraud Intelligence</option>
              <option>Risk & Compliance</option>
            </select>
          </div>
        </div>

        <div>
          <label className="label">Work email</label>
          <input className="input" type="email" value={f.email} onChange={set("email")} placeholder="analyst@bank.co.in" required disabled={loading} />
        </div>

        <div>
          <label className="label">Password</label>
          <div className="relative">
            <input
              className="input pr-10"
              type={showPassword ? "text" : "password"}
              value={f.password}
              onChange={set("password")}
              placeholder="••••••••"
              required
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button className="btn-primary w-full" type="submit" disabled={loading}>
          {loading ? "Registering..." : "Request access"}
        </button>

        <p className="text-sm text-center text-slate-500">
          Already registered?{" "}
          <Link to="/login/admin" className="text-primary font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
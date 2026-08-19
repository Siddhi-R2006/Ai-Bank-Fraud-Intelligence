import { useState } from "react";
import { Link } from "react-router-dom";
import AuthShell from "./AuthShell";
import { saveSession } from "../../lib/auth";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function LoginAdmin() {
  const [empId, setEmpId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    e.stopPropagation();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/auth/login/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ empId, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Invalid Employee ID or password");
      }

      const userData = data.user || {
        empId,
        role: "admin",
        name: data.user?.name || `Analyst (${empId})`,
      };

      saveSession(data.token, userData, "admin");
      window.location.replace("/admin/dashboard");
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <AuthShell side="admin" title="Employee / Analyst Login" subtitle="Secure access to the fraud command center.">
      {error && (
        <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Employee ID</label>
          <input
            className="input"
            value={empId}
            onChange={(e) => setEmpId(e.target.value)}
            placeholder="EMP-2041"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="label">Password</label>
          <div className="relative">
            <input
              className="input pr-10"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

        <div className="flex justify-between text-sm">
          <label className="flex items-center gap-2 text-slate-600">
            <input type="checkbox" /> Trusted device
          </label>
          <Link to="/forgot-password" className="text-primary font-medium hover:underline">
            Forgot password?
          </Link>
        </div>

        <button className="btn-primary w-full" type="submit" disabled={loading}>
          {loading ? "Authenticating..." : "Sign in securely"}
        </button>

        <p className="text-sm text-center text-slate-500">
          Need access?{" "}
          <Link to="/register/admin" className="text-primary font-semibold hover:underline">
            Request account
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}

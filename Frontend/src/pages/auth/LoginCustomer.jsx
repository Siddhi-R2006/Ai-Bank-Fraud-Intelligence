import { useState } from "react";
import { Link } from "react-router-dom";
import AuthShell from "./AuthShell";
import { saveSession } from "../../lib/auth"; // Adjust path if your folder depth differs
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function LoginCustomer() {
  const [email, setEmail] = useState("");
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
      const response = await fetch("http://localhost:8000/api/auth/login/customer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Invalid login credentials");
      }

      // Format user details
      const userData = data.user || {
        email,
        role: "customer",
        name: email.split("@")[0],
      };

      // Save tokens and user session structured for getSession()
      saveSession(data.token, userData, "customer");

      // Hard redirect ensures ProtectedRoute and DashShell re-mount with clean state
      window.location.replace("/customer/dashboard");
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <AuthShell side="customer" title="Customer Login" subtitle="Access your fraud protection dashboard.">
      {error && (
        <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Email</label>
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="customer@bank.co.in"
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
            <input type="checkbox" /> Remember me
          </label>
          <Link to="/forgot-password" className="text-primary font-medium hover:underline">
            Forgot password?
          </Link>
        </div>

        <button className="btn-primary w-full" type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <p className="text-sm text-center text-slate-500">
          New here?{" "}
          <Link to="/register/customer" className="text-primary font-semibold hover:underline">
            Create account
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}

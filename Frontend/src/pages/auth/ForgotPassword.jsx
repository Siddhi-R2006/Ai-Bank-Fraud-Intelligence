import { useState } from "react";
import { Link } from "react-router-dom";
import AuthShell from "./AuthShell";

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  return (
    <AuthShell title="Reset password" subtitle="We'll email you a secure reset link.">
      {sent ? (
        <div className="card !p-4 bg-emerald-50 border-emerald-200 text-emerald-800">
          If an account exists for that email, a reset link is on its way.
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="space-y-4">
          <div><label className="label">Email</label><input className="input" type="email" required /></div>
          <button className="btn-primary w-full">Send reset link</button>
        </form>
      )}
      <p className="text-sm text-center text-slate-500 mt-4">
        <Link to="/choose-role" className="text-primary font-semibold hover:underline">Back to login</Link>
      </p>
    </AuthShell>
  );
}

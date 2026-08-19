import { useState } from "react";

function Toggle({ on, onChange, label, desc }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <div className="font-semibold text-slate-800">{label}</div>
        <div className="text-sm text-slate-500">{desc}</div>
      </div>
      <button
        type="button"
        onClick={() => onChange(!on)}
        className={`w-12 h-7 rounded-full transition ${on ? "bg-primary" : "bg-slate-300"} relative`}
      >
        <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition ${on ? "left-[calc(100%-1.625rem)]" : "left-0.5"}`} />
      </button>
    </div>
  );
}

export default function Settings() {
  const [s, setS] = useState({ email: true, sms: true, push: false, twofa: true, bio: false });
  const set = (k) => (v) => setS({ ...s, [k]: v });
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary-dark">Settings</h1>
      <div className="grid md:grid-cols-2 gap-5">
        <div className="card">
          <h3 className="font-bold text-primary-dark mb-2">Notifications</h3>
          <div className="divide-y divide-slate-100">
            <Toggle on={s.email} onChange={set("email")} label="Email alerts" desc="Fraud & account activity" />
            <Toggle on={s.sms} onChange={set("sms")} label="SMS alerts" desc="Transactions above ₹5,000" />
            <Toggle on={s.push} onChange={set("push")} label="Push notifications" desc="Instant in-app alerts" />
          </div>
        </div>
        <div className="card">
          <h3 className="font-bold text-primary-dark mb-2">Security</h3>
          <div className="divide-y divide-slate-100">
            <Toggle on={s.twofa} onChange={set("twofa")} label="Two-factor authentication" desc="OTP on every login" />
            <Toggle on={s.bio} onChange={set("bio")} label="Biometric login" desc="Fingerprint / Face ID" />
          </div>
        </div>
      </div>
    </div>
  );
}

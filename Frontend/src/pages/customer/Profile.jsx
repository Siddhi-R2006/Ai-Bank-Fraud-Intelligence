import { getSession } from "../../lib/auth";

export default function Profile() {
  const s = getSession();
  const score = 82;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary-dark">My Profile</h1>
      <div className="grid md:grid-cols-3 gap-5">
        <div className="card md:col-span-2">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-primary text-white grid place-items-center text-3xl font-bold">
              {s?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <div className="text-xl font-bold text-primary-dark">{s?.name}</div>
              <div className="text-slate-500 text-sm">Customer · {s?.id}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
            <div><div className="label">Email</div><div>customer@example.com</div></div>
            <div><div className="label">Mobile</div><div>+91 98•••••210</div></div>
            <div><div className="label">Home branch</div><div>Mumbai Fort</div></div>
            <div><div className="label">Member since</div><div>Jan 2022</div></div>
          </div>
        </div>
        <div className="card text-center">
          <div className="label">Security Score</div>
          <div className="relative w-40 h-40 mx-auto mt-3">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#FCE7F3" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#6B21A8" strokeWidth="3" strokeDasharray={`${score}, 100`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 grid place-items-center">
              <div>
                <div className="text-4xl font-extrabold text-primary-dark">{score}</div>
                <div className="text-xs text-slate-500">out of 100</div>
              </div>
            </div>
          </div>
          <p className="text-sm text-slate-500 mt-2">Enable 2FA and biometric login to reach 95.</p>
        </div>
      </div>
    </div>
  );
}

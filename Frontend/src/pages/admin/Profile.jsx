import { getSession } from "../../lib/auth";

export default function Profile() {
  const s = getSession();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary-dark">Employee Profile</h1>
      <div className="grid md:grid-cols-3 gap-5">
        <div className="card md:col-span-2">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-primary-dark text-white grid place-items-center text-3xl font-bold">
              {s?.name?.[0]?.toUpperCase() || "A"}
            </div>
            <div>
              <div className="text-xl font-bold text-primary-dark">{s?.name}</div>
              <div className="text-slate-500 text-sm">Fraud Analyst · {s?.id}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
            <div><div className="label">Department</div><div>Cyber Fraud Intelligence</div></div>
            <div><div className="label">Region</div><div>West Zone</div></div>
            <div><div className="label">Clearance</div><div>Level 3</div></div>
            <div><div className="label">Joined</div><div>Mar 2021</div></div>
          </div>
        </div>
        <div className="card">
          <div className="label">This month</div>
          <div className="grid grid-cols-2 gap-4 mt-3">
            <div><div className="text-2xl font-extrabold text-primary-dark">128</div><div className="text-xs text-slate-500">Cases resolved</div></div>
            <div><div className="text-2xl font-extrabold text-primary-dark">94%</div><div className="text-xs text-slate-500">Accuracy</div></div>
            <div><div className="text-2xl font-extrabold text-primary-dark">₹2.4Cr</div><div className="text-xs text-slate-500">Prevented</div></div>
            <div><div className="text-2xl font-extrabold text-primary-dark">4.9</div><div className="text-xs text-slate-500">Team rating</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}

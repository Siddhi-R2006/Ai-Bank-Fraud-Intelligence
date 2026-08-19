import { Link } from "react-router-dom";
import { FiArrowLeft, FiShield } from "react-icons/fi";

export default function AuthShell({ title, subtitle, children, side = "customer" }) {
  const items = side === "admin"
    ? [
        "Live streaming fraud alerts",
        "Case investigation workspace",
        "Money mule graph analytics",
        "Region-wise fraud heatmaps",
      ]
    : [
        "Instant SMS & URL scanning",
        "24/7 AI banking chatbot",
        "Personal security score",
        "Report and track fraud cases",
      ];
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Side */}
      <div className="hidden lg:flex relative bg-gradient-primary text-white p-12 flex-col justify-between overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.15),transparent_40%)]" />
        <div className="relative">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-white/15 grid place-items-center font-bold">A</div>
            <div className="font-bold">ABFIS</div>
          </Link>
        </div>
        <div className="relative">
          <FiShield className="text-4xl mb-4 opacity-80" />
          <h2 className="text-3xl font-bold leading-tight">Protecting India's digital banking, one signal at a time.</h2>
          <ul className="mt-6 space-y-2 text-white/85">
            {items.map(i => <li key={i} className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-white rounded-full" /> {i}</li>)}
          </ul>
        </div>
        <div className="relative text-xs text-white/60">© {new Date().getFullYear()} ABFIS — Research prototype.</div>
      </div>

      {/* Form */}
      <div className="flex items-center justify-center p-6 md:p-12 bg-slate-50">
        <div className="w-full max-w-md">
          <Link to="/choose-role" className="btn-ghost mb-4"><FiArrowLeft /> Change role</Link>
          <h1 className="text-2xl font-bold text-primary-dark">{title}</h1>
          <p className="text-slate-500 text-sm mt-1">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

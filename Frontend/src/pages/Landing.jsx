import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiShield, FiCpu, FiActivity, FiGlobe, FiTrendingUp, FiMessageSquare } from "react-icons/fi";

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-primary grid place-items-center text-white font-bold">A</div>
            <div>
              <div className="font-bold text-primary-dark leading-tight">ABFIS</div>
              <div className="text-[10px] text-slate-500 -mt-0.5">AI Banking Fraud Intelligence</div>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-primary">Features</a>
            <a href="#stats" className="hover:text-primary">Impact</a>
            <a href="#how" className="hover:text-primary">How it works</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/choose-role" className="btn-ghost">Sign in</Link>
            <Link to="/choose-role" className="btn-primary">Get started</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-primary opacity-95" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.15),transparent_40%),radial-gradient(circle_at_80%_60%,rgba(194,24,89,0.35),transparent_45%)]" />
        <div className="relative max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-12 items-center text-white">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold">
              <FiShield /> RBI-aligned fraud analytics
            </span>
            <h1 className="mt-5 text-4xl md:text-5xl font-extrabold leading-tight">
              Analysis of cyber fraud trends in retail & digital banking
            </h1>
            <p className="mt-5 text-white/85 text-lg max-w-xl">
              A unified AI platform that detects phishing, UPI scams, fake investment schemes, and emerging digital cyber threats — protecting customers and empowering fraud analysts.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/choose-role" className="px-6 py-3 rounded-xl bg-white text-primary-dark font-semibold hover:shadow-glow transition">Launch dashboard</Link>
              <a href="#features" className="px-6 py-3 rounded-xl border border-white/40 hover:bg-white/10 transition font-semibold">Explore capabilities</a>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="glass !bg-white/10 !border-white/20 p-6"
          >
            <div className="grid grid-cols-2 gap-4">
              {[
                { i: <FiCpu />, t: "DistilBERT", d: "Phish classifier" },
                { i: <FiActivity />, t: "Live SOC", d: "Streaming alerts" },
                { i: <FiTrendingUp />, t: "Trend AI", d: "Category modeling" },
                { i: <FiMessageSquare />, t: "Chatbot", d: "Customer guidance" },
              ].map((c, i) => (
                <div key={i} className="rounded-xl bg-white/10 border border-white/15 p-4">
                  <div className="w-9 h-9 rounded-lg bg-white/15 grid place-items-center text-lg">{c.i}</div>
                  <div className="mt-3 font-semibold">{c.t}</div>
                  <div className="text-xs text-white/70">{c.d}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-4 gap-4">
        {[
          { v: "₹50000+", l: "Estimated fraud loss prevented" },
          { v: "200+", l: "Messages & URLs analyzed" },
          { v: "98.6%", l: "AI detection precision" },
          { v: "< 400 ms", l: "Median threat response time" },
        ].map((s, i) => (
          <div key={i} className="card text-center">
            <div className="text-3xl font-extrabold text-primary-dark">{s.v}</div>
            <div className="text-sm text-slate-500 mt-1">{s.l}</div>
          </div>
        ))}
      </section>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-6 pb-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-primary-dark">A command center for modern banking fraud</h2>
          <p className="text-slate-500 mt-2">Purpose-built modules for customers and fraud analysts.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { i: <FiShield />, t: "AI Fraud Detector", d: "Paste any SMS, email or URL — get a risk score with explainable signals." },
            { i: <FiMessageSquare />, t: "Banking Chatbot", d: "24/7 assistant for reporting fraud, blocking cards and safe-banking guidance." },
            { i: <FiActivity />, t: "SOC Alerts", d: "Streaming feed of high-signal events across UPI, cards and net-banking." },
            { i: <FiTrendingUp />, t: "Fraud Analytics", d: "Trends across phishing, deepfake, ATO and SIM-swap — regionally segmented." },
            { i: <FiGlobe />, t: "Live Advisories & News", d: "Real-time stream of RBI notices, government cybersecurity advisories, and scam alerts." },
            { i: <FiCpu />, t: "Case Management", d: "Assign, investigate and resolve — with a full audit trail." },
          ].map((f, i) => (
            <div key={i} className="card hover:shadow-glow transition group">
              <div className="w-11 h-11 rounded-xl bg-primary-light text-primary grid place-items-center text-xl group-hover:bg-primary group-hover:text-white transition">{f.i}</div>
              <div className="mt-4 font-bold text-primary-dark">{f.t}</div>
              <div className="text-sm text-slate-500 mt-1">{f.d}</div>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} ABFIS —  Internship Project. For research & demonstration.
      </footer>
    </div>
  );
}
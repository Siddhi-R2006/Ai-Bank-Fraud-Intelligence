import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiUser, FiBriefcase, FiArrowLeft, FiCheck } from "react-icons/fi";

export default function ChooseRole() {
  const nav = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-soft">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <button onClick={() => nav("/")} className="btn-ghost mb-6"><FiArrowLeft /> Back to home</button>
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-primary-dark">Choose your role</h1>
          <p className="text-slate-500 mt-2">Select an experience tailored to your needs.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Customer */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            className="card hover:shadow-glow transition">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary-light text-primary grid place-items-center text-2xl"><FiUser /></div>
              <div>
                <h3 className="text-xl font-bold text-primary-dark">Customer</h3>
                <p className="text-sm text-slate-500">Retail banking user</p>
              </div>
            </div>
            <ul className="mt-5 space-y-2 text-sm text-slate-600">
              {["Detect fraud messages","Use AI Chatbot","View fraud history","Manage profile"].map(x => (
                <li key={x} className="flex items-center gap-2"><FiCheck className="text-success" /> {x}</li>
              ))}
            </ul>
            <div className="mt-6 flex gap-3">
              <Link to="/login/customer" className="btn-primary flex-1">Login</Link>
              <Link to="/register/customer" className="btn-outline flex-1">Register</Link>
            </div>
          </motion.div>

          {/* Admin */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
            className="card hover:shadow-glow transition">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary text-white grid place-items-center text-2xl"><FiBriefcase /></div>
              <div>
                <h3 className="text-xl font-bold text-primary-dark">Employee / Fraud Analyst</h3>
                <p className="text-sm text-slate-500">Bank staff · SOC access</p>
              </div>
            </div>
            <ul className="mt-5 space-y-2 text-sm text-slate-600">
              {["Monitor fraud trends","Manage fraud cases","Money mule detection","Fraud analytics"].map(x => (
                <li key={x} className="flex items-center gap-2"><FiCheck className="text-success" /> {x}</li>
              ))}
            </ul>
            <div className="mt-6 flex gap-3">
              <Link to="/login/admin" className="btn-primary flex-1">Login</Link>
              <Link to="/register/admin" className="btn-outline flex-1">Register</Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

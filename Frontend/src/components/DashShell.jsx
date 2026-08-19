import { useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { clearSession, getSession } from "../lib/auth";
import { FiLogOut, FiBell, FiSearch } from "react-icons/fi";

export default function DashShell({ title, brandTag, nav, tone = "customer" }) {
  const navigate = useNavigate();
  const session = getSession();

  // Validate session on mount
  useEffect(() => {
    if (!session || !session.token) {
      navigate("/choose-role", { replace: true });
    }
  }, [session, navigate]);

  function signOut() {
    clearSession();
    navigate("/choose-role", { replace: true });
  }

  const sidebarBg =
    tone === "admin"
      ? "bg-gradient-to-b from-primary-dark via-[#4C1D95] to-primary-dark"
      : "bg-gradient-primary";

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside className={`w-64 shrink-0 ${sidebarBg} text-white p-4 hidden md:flex md:flex-col`}>
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="w-9 h-9 rounded-xl bg-white/15 grid place-items-center font-bold">A</div>
          <div>
            <div className="font-bold leading-tight">ABFIS</div>
            <div className="text-[10px] text-white/70 -mt-0.5">{brandTag}</div>
          </div>
        </div>
        <nav className="mt-4 space-y-1 flex-1">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `sidebar-link ${isActive ? "sidebar-link-active" : ""}`}
            >
              <span className="text-lg">{item.icon}</span> {item.label}
            </NavLink>
          ))}
        </nav>
        <button onClick={signOut} className="sidebar-link mt-2 hover:bg-red-500/20">
          <FiLogOut /> Logout
        </button>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Topbar */}
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-4 sticky top-0 z-30">
          <h2 className="font-bold text-primary-dark hidden sm:block">{title}</h2>
          <div className="ml-auto flex items-center gap-3">
           
           
            <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
              <div className="w-9 h-9 rounded-full bg-gradient-primary text-white grid place-items-center font-bold">
                {session?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-semibold text-primary-dark leading-tight">
                  {session?.name || "Customer"}
                </div>
                <div className="text-[11px] text-slate-500 -mt-0.5">{session?.id}</div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-x-hidden">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
import { useState } from "react";
import { FiUsers, FiActivity, FiShield, FiAlertTriangle } from "react-icons/fi";

const initialMules = [
  { id: "1", acct: "XXXX-2205", holder: "Rahul S.", inflow: "₹12.6L", outflow: "₹12.4L", score: 96, txns: 48, status: "Critical", cx: 120, cy: 80 },
  { id: "2", acct: "XXXX-1128", holder: "Aniket M.", inflow: "₹8.2L", outflow: "₹7.9L", score: 92, txns: 34, status: "Critical", cx: 280, cy: 150 },
  { id: "3", acct: "XXXX-4471", holder: "Priya V.", inflow: "₹3.4L", outflow: "₹3.3L", score: 88, txns: 19, status: "High Risk", cx: 440, cy: 90 },
  { id: "4", acct: "XXXX-9083", holder: "Amit K.", inflow: "₹2.1L", outflow: "₹1.9L", score: 74, txns: 12, status: "Moderate", cx: 520, cy: 200 },
];

const links = [
  { from: { x: 120, y: 80 }, to: { x: 280, y: 150 } },
  { from: { x: 280, y: 150 }, to: { x: 440, y: 90 } },
  { from: { x: 440, y: 90 }, to: { x: 520, y: 200 } },
];

export default function Mule() {
  const [selectedAccount, setSelectedAccount] = useState(initialMules[0]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary-dark">Money Mule Detection</h1>
        <p className="text-slate-500">Graph-based anomaly detection over fast-moving deposit chains.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Interactive Graph Canvas */}
        <div className="card lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-primary-dark flex items-center gap-2">
              <FiActivity /> Live Mule Graph Network
            </h3>
            <span className="text-xs text-slate-500">Click a node to inspect layer</span>
          </div>

          <div className="h-80 rounded-xl bg-slate-900 relative overflow-hidden flex items-center justify-center p-4">
            <svg className="w-full h-full" viewBox="0 0 600 280">
              {/* Directed Links */}
              {links.map((l, i) => (
                <line
                  key={i}
                  x1={l.from.x}
                  y1={l.from.y}
                  x2={l.to.x}
                  y2={l.to.y}
                  stroke="#A855F7"
                  strokeWidth="2"
                  strokeDasharray="6,6"
                  className="animate-pulse"
                />
              ))}

              {/* Interactive Nodes */}
              {initialMules.map((m) => {
                const isSelected = selectedAccount.acct === m.acct;
                return (
                  <g key={m.id} className="cursor-pointer" onClick={() => setSelectedAccount(m)}>
                    <circle
                      cx={m.cx}
                      cy={m.cy}
                      r={isSelected ? "22" : "18"}
                      fill={m.score > 90 ? "#EF4444" : "#F97316"}
                      className="transition-all duration-300 hover:opacity-80"
                      stroke={isSelected ? "#FFFFFF" : "none"}
                      strokeWidth="3"
                    />
                    <text
                      x={m.cx}
                      y={m.cy + 35}
                      textAnchor="middle"
                      fill="#E2E8F0"
                      fontSize="11"
                      fontWeight="600"
                    >
                      {m.acct}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Node Detail Inspection Bar */}
          <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500">Selected Node</div>
              <div className="font-bold text-slate-800">{selectedAccount.acct} ({selectedAccount.holder})</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Velocity Rate</div>
              <div className="font-semibold text-primary">{selectedAccount.txns} Txns / 24h</div>
            </div>
            <span className={`chip ${selectedAccount.score > 90 ? "chip-red" : "chip-orange"}`}>
              Score: {selectedAccount.score}
            </span>
          </div>
        </div>

        {/* Top Suspicious Accounts List */}
        <div className="card">
          <h3 className="font-bold text-primary-dark flex items-center gap-2 mb-3">
            <FiUsers /> Top Suspicious Accounts
          </h3>
          <ul className="divide-y divide-slate-100">
            {initialMules.map((m) => (
              <li
                key={m.acct}
                onClick={() => setSelectedAccount(m)}
                className={`py-3 cursor-pointer rounded-lg px-2 transition-colors ${
                  selectedAccount.acct === m.acct ? "bg-purple-50" : "hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-mono text-sm font-semibold text-slate-800">{m.acct}</div>
                  <span className={`chip ${m.score > 90 ? "chip-red" : "chip-orange"}`}>{m.score}</span>
                </div>
                <div className="text-xs text-slate-500 mt-1 flex justify-between">
                  <span>In {m.inflow}</span>
                  <span>Out {m.outflow}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
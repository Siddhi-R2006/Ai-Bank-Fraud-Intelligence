import DashShell from "../../components/DashShell";
import { FiGrid, FiRadio, FiPieChart, FiShield, FiFolder, FiUsers, FiFileText, FiUser, FiSettings } from "react-icons/fi";

const nav = [
  { to: "/admin/dashboard", label: "SOC Dashboard", icon: <FiGrid /> },
  { to: "/admin/alerts", label: "Live Alerts", icon: <FiRadio /> },
  { to: "/admin/analytics", label: "Fraud Analytics", icon: <FiPieChart /> },
 
  { to: "/admin/cases", label: "Case Management", icon: <FiFolder /> },
  
  { to: "/admin/reports", label: "Reports", icon: <FiFileText /> },
];

export default function AdminLayout() {
  return <DashShell title="Fraud Command Center" brandTag="Analyst · SOC" nav={nav} tone="admin" />;
}

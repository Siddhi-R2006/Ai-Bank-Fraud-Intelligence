import DashShell from "../../components/DashShell";
import { FiHome, FiShield, FiMessageSquare, FiClock, FiFileText, FiUser, FiSettings, FiGlobe } from "react-icons/fi";

const nav = [
  { to: "/customer/dashboard", label: "Dashboard", icon: <FiHome /> },
  { to: "/customer/fraud-detector", label: "AI Fraud Detector", icon: <FiShield /> },
  { to: "/customer/chatbot", label: "AI Chatbot", icon: <FiMessageSquare /> },
  { to: "/customer/history", label: "Fraud History", icon: <FiClock /> },
  { to: "/customer/reports", label: "My Reports", icon: <FiFileText /> },
  { to: "/customer/news", label: "News & Updates", icon: <FiGlobe /> },

];

export default function CustomerLayout() {
  return <DashShell title="Customer Portal" brandTag="Customer" nav={nav} tone="customer" />;
}

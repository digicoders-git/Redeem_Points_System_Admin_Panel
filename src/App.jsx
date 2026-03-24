import { useState, useEffect } from "react";
import AdminLogin from "./pages/AdminLogin";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import AdminBills from "./pages/AdminBills";
import AdminRewards from "./pages/AdminRewards";
import AdminRedemptions from "./pages/AdminRedemptions";
import BottomNav from "./components/BottomNav";
import PullToRefresh from "./components/PullToRefresh";
import IOSInstallPrompt from "./components/IOSInstallPrompt";
import { Download } from "lucide-react";

export default function App() {
  const token = localStorage.getItem("adminToken");
  const [tab, setTab] = useState(() => localStorage.getItem("adminTab") || "dashboard");

  const handleTab = (t) => { localStorage.setItem("adminTab", t); setTab(t); };
  const [installPrompt, setInstallPrompt] = useState(() => window.__installPrompt || null);

  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstallPrompt(null));
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") setInstallPrompt(null);
  };

  if (!token) return <AdminLogin />;

  const pages = {
    dashboard: <Dashboard />,
    users: <Users />,
    bills: <AdminBills />,
    rewards: <AdminRewards />,
    redemptions: <AdminRedemptions />,
  };

  return (
    <PullToRefresh>
      <IOSInstallPrompt />
      <div className="max-w-lg mx-auto min-h-screen bg-[#F5F7FA] font-sans relative pb-safe">
        {pages[tab]}
        <BottomNav active={tab} setActive={handleTab} />
        {installPrompt && (
          <button
            onClick={handleInstall}
            className="fixed bottom-20 right-4 z-50 flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-[13px] font-bold px-5 py-3 rounded-full shadow-[0_5px_15px_rgba(15,23,42,0.4)] transition active:scale-[0.98]"
          >
            <Download size={14} /> Install App
          </button>
        )}
      </div>
    </PullToRefresh>
  );
}

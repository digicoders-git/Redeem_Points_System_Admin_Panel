import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import AdminLogin from "./pages/AdminLogin";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import AdminBills from "./pages/AdminBills";
import AdminRewards from "./pages/AdminRewards";
import AdminRedemptions from "./pages/AdminRedemptions";
import AdminTerms from "./pages/AdminTerms";
import BillDetail from "./pages/BillDetail";
import RedemptionDetail from "./pages/RedemptionDetail";
import BottomNav from "./components/BottomNav";
import PullToRefresh from "./components/PullToRefresh";
import IOSInstallPrompt from "./components/IOSInstallPrompt";
import { Download } from "lucide-react";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("adminToken");
  return token ? children : <Navigate to="/" replace />;
}

const BOTTOM_NAV_ROUTES = ["/dashboard", "/users", "/bills", "/rewards", "/redemptions", "/terms"];

export default function App() {
  const location = useLocation();
  const showNav = BOTTOM_NAV_ROUTES.includes(location.pathname);
  const [installPrompt, setInstallPrompt] = useState(() => window.__installPrompt || null);

  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstallPrompt(null));
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") setInstallPrompt(null);
  };

  return (
    <PullToRefresh>
      <IOSInstallPrompt />
      <div className="max-w-lg mx-auto min-h-screen bg-[#F5F7FA] font-sans relative pb-safe">
        <Routes>
          <Route path="/" element={<AdminLogin />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
          <Route path="/bills" element={<ProtectedRoute><AdminBills /></ProtectedRoute>} />
          <Route path="/rewards" element={<ProtectedRoute><AdminRewards /></ProtectedRoute>} />
          <Route path="/redemptions" element={<ProtectedRoute><AdminRedemptions /></ProtectedRoute>} />
          <Route path="/terms" element={<ProtectedRoute><AdminTerms /></ProtectedRoute>} />
          <Route path="/bills/:id" element={<ProtectedRoute><BillDetail /></ProtectedRoute>} />
          <Route path="/redemptions/:id" element={<ProtectedRoute><RedemptionDetail /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>

        {showNav && <BottomNav />}

        {installPrompt && (
          <button onClick={handleInstall} className="fixed bottom-20 right-4 z-50 flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-[13px] font-bold px-5 py-3 rounded-full shadow-lg transition active:scale-[0.98]">
            <Download size={14} /> Install App
          </button>
        )}
      </div>
    </PullToRefresh>
  );
}

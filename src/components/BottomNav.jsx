import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, Receipt, Gift, CheckCircle, LogOut, FileText } from "lucide-react";
import api from "../api/axios";
import Swal from "sweetalert2";

const tabs = [
  { path: "/dashboard", icon: <LayoutDashboard size={18} />, label: "Home" },
  { path: "/users", icon: <Users size={18} />, label: "Users" },
  { path: "/bills", icon: <Receipt size={18} />, label: "Bills" },
  { path: "/rewards", icon: <Gift size={18} />, label: "Rewards" },
  { path: "/redemptions", icon: <CheckCircle size={18} />, label: "Redeem" },
  { path: "/terms", icon: <FileText size={18} />, label: "Terms" },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const logout = async () => {
    const res = await Swal.fire({ title: "Logout?", text: "Are you sure?", icon: "warning", showCancelButton: true, confirmButtonText: "Yes, Logout", confirmButtonColor: "#ef4444" });
    if (!res.isConfirmed) return;
    await api.post("/admin/logout-all").catch(() => {});
    localStorage.clear();
    await Swal.fire({ icon: "success", title: "Logged Out!", timer: 1200, showConfirmButton: false });
    navigate("/", { replace: true });
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg z-50">
      <div className="flex max-w-lg mx-auto">
        {tabs.map((t) => {
          const active = pathname === t.path;
          return (
            <button
              key={t.path}
              onClick={() => navigate(t.path)}
              className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-colors ${active ? "text-[#0f4089]" : "text-gray-400"}`}
            >
              <span className="mb-0.5">{t.icon}</span>
              <span className="text-[9px] font-semibold">{t.label}</span>
              {active && <span className="w-1.5 h-1.5 rounded-full bg-[#f97316] mt-0.5" />}
            </button>
          );
        })}
        <button onClick={logout} className="flex-1 flex flex-col items-center py-2.5 gap-0.5 text-gray-400 hover:text-red-500 transition-colors">
          <span className="mb-0.5"><LogOut size={18} /></span>
          <span className="text-[9px] font-semibold">Logout</span>
        </button>
      </div>
    </nav>
  );
}

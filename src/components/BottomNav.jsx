import api from "../api/axios";
import { LayoutDashboard, Users, Receipt, Gift, CheckCircle, LogOut } from "lucide-react";
import Swal from "sweetalert2";

export default function BottomNav({ active, setActive }) {
  const tabs = [
    { id: "dashboard", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
    { id: "users", icon: <Users size={20} />, label: "Users" },
    { id: "bills", icon: <Receipt size={20} />, label: "Bills" },
    { id: "rewards", icon: <Gift size={20} />, label: "Rewards" },
    { id: "redemptions", icon: <CheckCircle size={20} />, label: "Redeem" },
  ];

  const logout = async () => {
    const res = await Swal.fire({ title: "Logout?", text: "Are you sure you want to logout?", icon: "warning", showCancelButton: true, confirmButtonText: "Yes, Logout", confirmButtonColor: "#ef4444" });
    if (!res.isConfirmed) return;
    await api.post("/admin/logout-all").catch(() => {});
    localStorage.clear();
    await Swal.fire({ icon: "success", title: "Logged Out!", timer: 1200, showConfirmButton: false });
    window.location.reload();
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg z-50">
      <div className="flex max-w-lg mx-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-colors ${
              active === t.id ? "text-[#0f4089]" : "text-gray-400"
            }`}
          >
            <span className="mb-0.5">{t.icon}</span>
            <span className="text-[9px] font-semibold">{t.label}</span>
            {active === t.id && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#f97316] mt-0.5" />
            )}
          </button>
        ))}
        <button
          onClick={logout}
          className="flex-1 flex flex-col items-center py-2.5 gap-0.5 text-gray-400 hover:text-red-500 transition-colors"
        >
          <span className="mb-0.5"><LogOut size={20} /></span>
          <span className="text-[9px] font-semibold">Logout</span>
        </button>
      </div>
    </nav>
  );
}

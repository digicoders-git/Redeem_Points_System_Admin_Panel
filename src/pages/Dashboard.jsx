import { useState, useEffect } from "react";
import api from "../api/axios";
import { Users, Receipt, Clock, Gift, Settings, Loader2, LayoutDashboard } from "lucide-react";
import Swal from "sweetalert2";

export default function Dashboard() {
  const [stats, setStats] = useState({ users: 0, bills: 0, pendingBills: 0, pendingRedemptions: 0 });
  const [config, setConfig] = useState({ amountPerPoint: "" });
  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const admin = JSON.parse(localStorage.getItem("adminInfo") || "{}");

  useEffect(() => {
    Promise.all([
      api.get("/users/admin/all"),
      api.get("/bills/admin/all"),
      api.get("/rewards/admin/redemptions"),
      api.get("/bills/admin/point-config").catch(() => ({ data: {} })),
    ]).then(([u, b, r, c]) => {
      const redemptions = r.data.redemptions || [];
      const totalPointsRedeemed = redemptions
        .filter((x) => x.status === "approved" || x.status === "delivered")
        .reduce((sum, x) => sum + (x.pointsUsed || x.reward?.pointsRequired || 0), 0);

      setStats({
        users: u.data.users?.length || 0,
        bills: b.data.bills?.length || 0,
        pendingBills: b.data.bills?.filter((x) => x.status === "pending").length || 0,
        pendingRedemptions: redemptions.filter((x) => x.status === "pending").length || 0,
        totalPointsRedeemed,
      });
      if (c.data.pointSetting) setConfig({ amountPerPoint: c.data.pointSetting.amountPerPoint });
    }).catch(() => {}).finally(() => setPageLoading(false));
  }, []);

  const saveConfig = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/bills/admin/point-config", { amountPerPoint: Number(config.amountPerPoint) });
      Swal.fire({ icon: "success", title: "Config Saved!", timer: 1500, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: "error", title: "Failed", text: "Could not save config" });
    } finally {
      setSaving(false);
    }
  };

  const cards = [
    { label: "Total Users", value: stats.users, icon: <Users size={24} />, color: "bg-[#0f4089]/10 text-[#0f4089] border border-[#0f4089]/20" },
    { label: "Total Bills", value: stats.bills, icon: <Receipt size={24} />, color: "bg-[#1a4187]/10 text-[#1a4187] border border-[#1a4187]/20" },
    { label: "Pending Bills", value: stats.pendingBills, icon: <Clock size={24} />, color: "bg-amber-100 text-amber-600 border border-amber-200" },
    { label: "Pending Redeem", value: stats.pendingRedemptions, icon: <Gift size={24} />, color: "bg-green-100 text-green-600 border border-green-200" },
    { label: "Points Redeemed", value: stats.totalPointsRedeemed || 0, icon: <Gift size={24} />, color: "bg-[#f97316]/10 text-[#f97316] border border-[#f97316]/20" },
  ];

  return (
    <div className="min-h-screen bg-[#F5F7FA] font-sans pb-24">
      {/* Top Header Background */}
      <div className="bg-[#0f4089] rounded-b-[40px] px-6 pt-10 pb-12 mb-6 relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold text-2xl tracking-wide mb-1">Dashboard</h1>
            <p className="text-white/80 font-medium text-sm">Welcome, {admin.name || admin.adminId}</p>
          </div>
          <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm border border-white/20">
            <LayoutDashboard className="text-white" size={24} />
          </div>
        </div>
      </div>

      <div className="px-5">
        {pageLoading ? (
          <div className="flex justify-center items-center py-40">
            <Loader2 size={32} className="animate-spin text-[#0f4089]" />
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {cards.map((c) => (
                <div key={c.label} className={`rounded-3xl p-5 shadow-sm flex flex-col items-center justify-center text-center ${c.color} bg-white`}>
                  <div className={`mb-3 w-12 h-12 rounded-2xl flex items-center justify-center ${c.color.split(" ")[0]}`}>
                    {c.icon}
                  </div>
                  <div className="text-2xl font-extrabold text-gray-900 leading-none mb-1">{c.value}</div>
                  <div className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">{c.label}</div>
                </div>
              ))}
            </div>

            {/* Point Config */}
            <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 p-6 mb-4">
              <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                <div className="bg-[#E3EBFB] text-[#0f4089] p-1.5 rounded-lg"><Settings size={18} /></div> 
                Point Configuration
              </h3>
              <p className="text-[13px] text-gray-500 mb-5 font-medium ml-[34px]">Set how many ₹ = 1 Point</p>
              
              <form onSubmit={saveConfig} className="flex flex-col gap-3">
                <input
                  type="number"
                  placeholder="e.g. 100"
                  value={config.amountPerPoint}
                  onChange={(e) => setConfig({ amountPerPoint: e.target.value })}
                  required
                  className="w-full border-2 border-gray-100 bg-[#F5F7FA] rounded-2xl px-5 py-3.5 text-[15px] font-bold text-gray-800 focus:outline-none focus:border-[#0f4089]/30 transition-colors"
                />
                <button 
                  type="submit" 
                  disabled={saving} 
                  className="w-full bg-[#0f4089] hover:bg-[#1a4187] text-white py-3.5 rounded-2xl text-[15px] font-bold flex items-center justify-center gap-2 disabled:opacity-60 transition active:scale-[0.98] shadow-md"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  Save
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

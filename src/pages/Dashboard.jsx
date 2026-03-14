import { useState, useEffect } from "react";
import api from "../api/axios";
import { Users, Receipt, Clock, Gift, Settings, ShieldCheck } from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState({ users: 0, bills: 0, pendingBills: 0, pendingRedemptions: 0 });
  const [admins, setAdmins] = useState([]);
  const [config, setConfig] = useState({ amountPerPoint: "" });
  const [msg, setMsg] = useState("");
  const admin = JSON.parse(localStorage.getItem("adminInfo") || "{}");

  useEffect(() => {
    Promise.all([
      api.get("/users/admin/all"),
      api.get("/bills/admin/all"),
      api.get("/rewards/admin/redemptions"),
      api.get("/bills/admin/point-config").catch(() => ({ data: {} })),
      api.get("/admin/list"),
    ]).then(([u, b, r, c, a]) => {
      setStats({
        users: u.data.users?.length || 0,
        bills: b.data.bills?.length || 0,
        pendingBills: b.data.bills?.filter((x) => x.status === "pending").length || 0,
        pendingRedemptions: r.data.redemptions?.filter((x) => x.status === "pending").length || 0,
      });
      if (c.data.pointSetting) setConfig({ amountPerPoint: c.data.pointSetting.amountPerPoint });
      setAdmins(a.data.admins || []);
    }).catch(() => {});
  }, []);

  const saveConfig = async (e) => {
    e.preventDefault();
    try {
      await api.post("/bills/admin/point-config", { amountPerPoint: Number(config.amountPerPoint) });
      setMsg("Config saved!");
      setTimeout(() => setMsg(""), 2000);
    } catch {
      setMsg("Failed to save");
    }
  };

  const cards = [
    { label: "Total Users", value: stats.users, icon: <Users size={24} />, color: "bg-blue-50 text-blue-600" },
    { label: "Total Bills", value: stats.bills, icon: <Receipt size={24} />, color: "bg-violet-50 text-violet-600" },
    { label: "Pending Bills", value: stats.pendingBills, icon: <Clock size={24} />, color: "bg-amber-50 text-amber-600" },
    { label: "Pending Redeem", value: stats.pendingRedemptions, icon: <Gift size={24} />, color: "bg-green-50 text-green-600" },
  ];

  return (
    <div className="px-4 py-6 pb-24">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-sm text-gray-400">Welcome, {admin.name || admin.adminId}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {cards.map((c) => (
          <div key={c.label} className={`rounded-2xl p-4 ${c.color}`}>
            <div className="text-2xl mb-1">{c.icon}</div>
            <div className="text-2xl font-bold">{c.value}</div>
            <div className="text-xs font-medium opacity-80">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Point Config */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
        <h3 className="font-semibold text-gray-700 mb-1 flex items-center gap-1.5"><Settings size={18} /> Point Configuration</h3>
        <p className="text-xs text-gray-400 mb-3">Set how many ₹ = 1 Point</p>
        {msg && (
          <div className="bg-green-50 text-green-600 text-sm rounded-xl px-4 py-2 mb-3 text-center">{msg}</div>
        )}
        <form onSubmit={saveConfig} className="flex gap-3">
          <input
            type="number"
            placeholder="e.g. 100 (₹100 = 1 pt)"
            value={config.amountPerPoint}
            onChange={(e) => setConfig({ amountPerPoint: e.target.value })}
            required
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
          <button type="submit" className="bg-slate-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold">
            Save
          </button>
        </form>
      </div>

      {/* Admin List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-1.5"><ShieldCheck size={18} /> Admin Accounts ({admins.length})</h3>
        <div className="space-y-2">
          {admins.map((a) => (
            <div key={a._id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-800">{a.name || a.adminId}</p>
                <p className="text-xs text-gray-400">{a.adminId}</p>
              </div>
              <p className="text-xs text-gray-400">{new Date(a.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import api from "../api/axios";
import { Target, Loader2, Gift } from "lucide-react";
import Swal from "sweetalert2";

export default function AdminRewards() {
  const [rewards, setRewards] = useState([]);
  const [form, setForm] = useState({ rewardName: "", rewardImage: "", pointsRequired: "", description: "" });
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionId, setActionId] = useState(null);

  const load = () => {
    setLoading(true);
    api.get("/rewards/admin/rewards")
      .then(({ data }) => setRewards(data.rewards || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...form, pointsRequired: Number(form.pointsRequired) };
      if (editing) {
        await api.put(`/rewards/admin/rewards/${editing}`, payload);
      } else {
        await api.post("/rewards/admin/add", payload);
      }
      setForm({ rewardName: "", rewardImage: "", pointsRequired: "", description: "" });
      setEditing(null);
      Swal.fire({ icon: "success", title: editing ? "Reward Updated!" : "Reward Added!", timer: 1500, showConfirmButton: false });
      load();
    } catch (e) {
      Swal.fire({ icon: "error", title: "Failed", text: e.response?.data?.message || "Something went wrong" });
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (r) => {
    setEditing(r._id);
    setForm({ rewardName: r.rewardName, rewardImage: r.rewardImage || "", pointsRequired: r.pointsRequired, description: r.description || "" });
  };

  const remove = async (id) => {
    const res = await Swal.fire({ title: "Delete Reward?", text: "This cannot be undone!", icon: "warning", showCancelButton: true, confirmButtonText: "Yes, Delete", confirmButtonColor: "#ef4444" });
    if (!res.isConfirmed) return;
    setActionId(id);
    await api.delete(`/rewards/admin/rewards/${id}`);
    setActionId(null);
    Swal.fire({ icon: "success", title: "Deleted!", timer: 1200, showConfirmButton: false });
    load();
  };

  const toggleActive = async (r) => {
    setActionId(r._id);
    await api.put(`/rewards/admin/rewards/${r._id}`, { isActive: !r.isActive });
    setActionId(null);
    load();
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] font-sans pb-24">
      {/* Top Header Background */}
      <div className="bg-[#0f4089] rounded-b-[40px] px-6 pt-10 pb-12 relative overflow-hidden shadow-lg mb-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold text-2xl tracking-wide mb-1">Rewards</h1>
            <p className="text-white/80 font-medium text-sm">Manage Gift Catalog</p>
          </div>
          <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm border border-white/20">
            <Gift className="text-white" size={24} />
          </div>
        </div>
      </div>

      <div className="px-5 relative z-20">
        <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 p-5 mb-6">
          <h3 className="font-bold text-gray-900 mb-4">{editing ? "Edit Reward" : "Add New Reward"}</h3>
          <form onSubmit={submit} className="space-y-4">
            <input
              placeholder="Reward Name"
              value={form.rewardName}
              onChange={(e) => setForm({ ...form, rewardName: e.target.value })}
              required
              className="w-full border-2 border-gray-100 bg-[#F5F7FA] rounded-xl px-4 py-3 text-[14px] font-semibold text-gray-800 focus:outline-none focus:border-[#0f4089]/30 transition-colors"
            />
            <input
              placeholder="Image URL (optional)"
              value={form.rewardImage}
              onChange={(e) => setForm({ ...form, rewardImage: e.target.value })}
              className="w-full border-2 border-gray-100 bg-[#F5F7FA] rounded-xl px-4 py-3 text-[14px] font-semibold text-gray-800 focus:outline-none focus:border-[#0f4089]/30 transition-colors"
            />
            <input
              type="number"
              placeholder="Points Required"
              value={form.pointsRequired}
              onChange={(e) => setForm({ ...form, pointsRequired: e.target.value })}
              required
              className="w-full border-2 border-gray-100 bg-[#F5F7FA] rounded-xl px-4 py-3 text-[14px] font-semibold text-gray-800 focus:outline-none focus:border-[#0f4089]/30 transition-colors"
            />
            <input
              placeholder="Description (optional)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border-2 border-gray-100 bg-[#F5F7FA] rounded-xl px-4 py-3 text-[14px] font-semibold text-gray-800 focus:outline-none focus:border-[#0f4089]/30 transition-colors"
            />
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-[#0f4089] hover:bg-[#1a4187] text-white py-3.5 rounded-xl text-[14px] font-bold flex items-center justify-center gap-2 disabled:opacity-60 transition active:scale-95 shadow-md"
              >
                {submitting && <Loader2 size={16} className="animate-spin" />}
                {editing ? "Update Reward" : "Add Reward"}
              </button>
              {editing && (
                <button
                  type="button"
                  onClick={() => { setEditing(null); setForm({ rewardName: "", rewardImage: "", pointsRequired: "", description: "" }); }}
                  className="flex-1 border-2 border-gray-200 text-gray-600 py-3.5 rounded-xl text-[14px] font-bold transition active:scale-95 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 size={32} className="animate-spin text-[#0f4089]" />
          </div>
        ) : (
          <div className="space-y-4">
            {rewards.length === 0 && (
              <div className="bg-white rounded-[24px] p-10 text-center border border-gray-100 shadow-sm">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Gift size={28} className="text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium">No rewards added yet</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-1">
              {rewards.map((r) => (
                <div key={r._id} className="bg-white rounded-[24px] shadow-[0_4px_20px_rgb(0,0,0,0.04)] border border-gray-100 p-4 flex flex-col sm:flex-row gap-4 sm:items-center">
                  {r.rewardImage ? (
                    <div className="w-full sm:w-20 aspect-square sm:aspect-auto sm:h-20 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center">
                      <img src={r.rewardImage} alt={r.rewardName} className="w-full h-full object-contain p-2 mix-blend-multiply" />
                    </div>
                  ) : (
                    <div className="w-full sm:w-20 aspect-square bg-gray-50 rounded-xl flex items-center justify-center text-gray-300">
                      <Gift size={32} />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0 flex flex-col">
                    <p className="font-extrabold text-gray-900 text-[15px] truncate mb-0.5">{r.rewardName}</p>
                    {r.description && <p className="text-[12px] text-gray-500 truncate mb-1.5">{r.description}</p>}
                    <div className="inline-flex max-w-fit items-center gap-1.5 bg-[#E3EBFB] text-[#0f4089] px-2.5 py-1 rounded-lg text-[12px] font-bold mb-3">
                       {r.pointsRequired} pts
                    </div>
                    
                    <div className="flex items-center justify-between mt-auto">
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border ${r.isActive ? "bg-green-50 text-green-600 border-green-200" : "bg-gray-50 text-gray-400 border-gray-200"}`}>
                        {r.isActive ? "Active" : "Inactive"}
                      </span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => toggleActive(r)}
                          disabled={actionId === r._id}
                          className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center hover:bg-amber-100 transition"
                        >
                          {actionId === r._id ? <Loader2 size={14} className="animate-spin" /> : <Target size={14} />}
                        </button>
                        <button
                          onClick={() => startEdit(r)}
                          className="w-8 h-8 rounded-lg bg-blue-50 text-[#0f4089] flex items-center justify-center hover:bg-blue-100 transition"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                        </button>
                        <button
                          onClick={() => remove(r._id)}
                          disabled={actionId === r._id}
                          className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition"
                        >
                          {actionId === r._id ? <Loader2 size={14} className="animate-spin" /> : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

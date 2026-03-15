import { useState, useEffect } from "react";
import api from "../api/axios";
import { Target } from "lucide-react";
import Swal from "sweetalert2";

export default function AdminRewards() {
  const [rewards, setRewards] = useState([]);
  // API fields: rewardName, rewardImage, pointsRequired, description
  const [form, setForm] = useState({ rewardName: "", rewardImage: "", pointsRequired: "", description: "" });
  const [editing, setEditing] = useState(null);

  const load = () =>
    api.get("/rewards/admin/rewards").then(({ data }) => setRewards(data.rewards || []));

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
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
    }
  };

  const startEdit = (r) => {
    setEditing(r._id);
    setForm({
      rewardName: r.rewardName,
      rewardImage: r.rewardImage || "",
      pointsRequired: r.pointsRequired,
      description: r.description || "",
    });
  };

  const remove = async (id) => {
    const res = await Swal.fire({ title: "Delete Reward?", text: "This cannot be undone!", icon: "warning", showCancelButton: true, confirmButtonText: "Yes, Delete", confirmButtonColor: "#ef4444" });
    if (!res.isConfirmed) return;
    await api.delete(`/rewards/admin/rewards/${id}`);
    Swal.fire({ icon: "success", title: "Deleted!", timer: 1200, showConfirmButton: false });
    load();
  };

  const toggleActive = async (r) => {
    await api.put(`/rewards/admin/rewards/${r._id}`, { isActive: !r.isActive });
    load();
  };

  return (
    <div className="px-4 py-6 pb-24">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Rewards</h2>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-5">
        <h3 className="font-semibold text-gray-700 mb-3">{editing ? "Edit Reward" : "Add New Reward"}</h3>
        <form onSubmit={submit} className="space-y-3">
          <input
            placeholder="Reward Name"
            value={form.rewardName}
            onChange={(e) => setForm({ ...form, rewardName: e.target.value })}
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
          />
          <input
            placeholder="Image URL (optional)"
            value={form.rewardImage}
            onChange={(e) => setForm({ ...form, rewardImage: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
          />
          <input
            type="number"
            placeholder="Points Required"
            value={form.pointsRequired}
            onChange={(e) => setForm({ ...form, pointsRequired: e.target.value })}
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
          />
          <input
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
          />
          <div className="flex gap-2">
            <button type="submit" className="flex-1 bg-slate-800 text-white py-2.5 rounded-xl text-sm font-semibold transition active:scale-95 active:opacity-80">
              {editing ? "Update" : "Add Reward"}
            </button>
            {editing && (
              <button
                type="button"
                onClick={() => { setEditing(null); setForm({ rewardName: "", rewardImage: "", pointsRequired: "", description: "" }); }}
                className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-xl text-sm font-semibold transition active:scale-95 active:opacity-80"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="space-y-3">
        {rewards.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-8">No rewards added yet</p>
        )}
        {rewards.map((r) => (
          <div key={r._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3">
            <div className="flex gap-3 items-center">
              {r.rewardImage && (
                <img src={r.rewardImage} alt={r.rewardName} className="w-14 h-14 rounded-xl object-cover" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate">{r.rewardName}</p>
                {r.description && <p className="text-xs text-gray-400 truncate">{r.description}</p>}
                <p className="text-xs text-violet-600 font-semibold mt-0.5 flex items-center gap-1"><Target size={12} /> {r.pointsRequired} pts</p>
              </div>
              <div className="flex flex-col gap-1.5 items-end">
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${r.isActive ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                  {r.isActive ? "Active" : "Inactive"}
                </span>
                <div className="flex gap-1.5">
                  <button onClick={() => toggleActive(r)} className="text-xs bg-amber-50 text-amber-600 px-2 py-1 rounded-lg font-medium transition active:scale-90 active:bg-amber-200">
                    {r.isActive ? "Off" : "On"}
                  </button>
                  <button onClick={() => startEdit(r)} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-lg font-medium transition active:scale-90 active:bg-blue-200">
                    Edit
                  </button>
                  <button onClick={() => remove(r._id)} className="text-xs bg-red-50 text-red-500 px-2 py-1 rounded-lg font-medium transition active:scale-90 active:bg-red-200">
                    Del
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

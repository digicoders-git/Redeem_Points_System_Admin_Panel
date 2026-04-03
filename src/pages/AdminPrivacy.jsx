import { useState, useEffect } from "react";
import api from "../api/axios";
import { Loader2, Plus, Pencil, Trash2, Check, X, Lock, ToggleLeft, ToggleRight } from "lucide-react";
import Swal from "sweetalert2";

export default function AdminPrivacy() {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newText, setNewText] = useState("");
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState(null);

  const load = () => {
    setLoading(true);
    api.get("/privacy/admin/all")
      .then(({ data }) => setPoints(data.points || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const add = async (e) => {
    e.preventDefault();
    if (!newText.trim()) return;
    setAdding(true);
    try {
      await api.post("/privacy/admin/add", { text: newText.trim() });
      setNewText("");
      load();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Failed", text: err.response?.data?.message || "Could not add point" });
    } finally {
      setAdding(false);
    }
  };

  const saveEdit = async (id) => {
    if (!editText.trim()) return;
    setSaving(true);
    try {
      await api.put(`/privacy/admin/${id}`, { text: editText.trim() });
      setEditId(null);
      load();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Failed", text: err.response?.data?.message || "Could not update" });
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (point) => {
    setActionId(point._id);
    try {
      await api.put(`/privacy/admin/${point._id}`, { isActive: !point.isActive });
      load();
    } finally {
      setActionId(null);
    }
  };

  const remove = async (id) => {
    const res = await Swal.fire({ title: "Delete this point?", text: "This cannot be undone.", icon: "warning", showCancelButton: true, confirmButtonText: "Yes, Delete", confirmButtonColor: "#ef4444" });
    if (!res.isConfirmed) return;
    setActionId(id);
    try {
      await api.delete(`/privacy/admin/${id}`);
      load();
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] font-sans pb-24">
      <div className="bg-[#0f4089] rounded-b-[32px] px-5 pt-10 pb-10 relative overflow-hidden shadow-lg mb-5">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold text-xl tracking-wide mb-0.5">Privacy Policy</h1>
            <p className="text-white/70 text-sm">Manage privacy points</p>
          </div>
          <div className="bg-white/10 p-3 rounded-2xl border border-white/20">
            <Lock className="text-white" size={22} />
          </div>
        </div>
      </div>

      <div className="px-4">
        <form onSubmit={add} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-5">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Add New Point</p>
          <div className="flex gap-2">
            <input
              placeholder="Type a new privacy point..."
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              className="flex-1 border-2 border-gray-100 bg-[#F5F7FA] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#0f4089]/30"
            />
            <button type="submit" disabled={adding || !newText.trim()} className="bg-[#0f4089] text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-1.5 disabled:opacity-50 active:scale-95 shrink-0">
              {adding ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />} Add
            </button>
          </div>
        </form>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={30} className="animate-spin text-[#0f4089]" />
          </div>
        ) : (
          <div className="space-y-2.5">
            {points.length === 0 && (
              <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
                <Lock size={28} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No privacy points added yet</p>
              </div>
            )}
            {points.map((p, i) => (
              <div key={p._id} className={`bg-white rounded-2xl border shadow-sm p-4 transition ${!p.isActive ? "opacity-50 border-gray-100" : "border-gray-100"}`}>
                {editId === p._id ? (
                  <div className="flex gap-2 items-start">
                    <textarea value={editText} onChange={(e) => setEditText(e.target.value)} rows={2} className="flex-1 border-2 border-[#0f4089]/30 bg-[#F5F7FA] rounded-xl px-3 py-2 text-sm focus:outline-none resize-none" autoFocus />
                    <div className="flex flex-col gap-1.5 shrink-0">
                      <button onClick={() => saveEdit(p._id)} disabled={saving} className="w-8 h-8 bg-green-500 text-white rounded-lg flex items-center justify-center active:scale-95">
                        {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                      </button>
                      <button onClick={() => setEditId(null)} className="w-8 h-8 bg-gray-100 text-gray-500 rounded-lg flex items-center justify-center active:scale-95">
                        <X size={13} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#E3EBFB] text-[#0f4089] text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                    <p className="flex-1 text-sm text-gray-700 leading-relaxed">{p.text}</p>
                    <div className="flex gap-1.5 shrink-0">
                      <button onClick={() => toggle(p)} disabled={actionId === p._id} className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${p.isActive ? "bg-green-50 text-green-600 hover:bg-green-100" : "bg-gray-100 text-gray-400 hover:bg-gray-200"}`}>
                        {actionId === p._id ? <Loader2 size={13} className="animate-spin" /> : p.isActive ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                      </button>
                      <button onClick={() => { setEditId(p._id); setEditText(p.text); }} className="w-8 h-8 rounded-lg bg-blue-50 text-[#0f4089] flex items-center justify-center hover:bg-blue-100 transition">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => remove(p._id)} disabled={actionId === p._id} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition">
                        {actionId === p._id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

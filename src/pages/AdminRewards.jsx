import { useState, useEffect } from "react";
import api from "../api/axios";
import { Target, Loader2, Gift, X, Plus, ImageIcon } from "lucide-react";
import Swal from "sweetalert2";

const emptyForm = { rewardName: "", rewardImage: "", pointsRequired: "", description: "" };

export default function AdminRewards() {
  const [rewards, setRewards] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
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

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + imageFiles.length > 5) {
      Swal.fire({ icon: "warning", title: "Max 5 images allowed", timer: 1500, showConfirmButton: false });
      return;
    }
    const newFiles = [...imageFiles, ...files];
    setImageFiles(newFiles);
    const previews = newFiles.map((f) => URL.createObjectURL(f));
    setImagePreviews(previews);
  };

  const removePreview = (i) => {
    const newFiles = imageFiles.filter((_, idx) => idx !== i);
    const newPreviews = imagePreviews.filter((_, idx) => idx !== i);
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("rewardName", form.rewardName);
      fd.append("pointsRequired", Number(form.pointsRequired));
      fd.append("description", form.description);
      if (form.rewardImage) fd.append("rewardImage", form.rewardImage);
      imageFiles.forEach((f) => fd.append("rewardImages", f));

      if (editing) {
        await api.put(`/rewards/admin/rewards/${editing}`, fd);
      } else {
        await api.post("/rewards/admin/add", fd);
      }
      setForm(emptyForm);
      setImageFiles([]);
      setImagePreviews([]);
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
    setImageFiles([]);
    setImagePreviews(r.rewardImages?.length > 0 ? r.rewardImages : r.rewardImage ? [r.rewardImage] : []);
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm(emptyForm);
    setImageFiles([]);
    setImagePreviews([]);
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
      <div className="bg-[#0f4089] rounded-b-[32px] px-5 pt-10 pb-10 relative overflow-hidden shadow-lg mb-5">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold text-xl tracking-wide mb-0.5">Rewards</h1>
            <p className="text-white/70 text-sm">Manage Gift Catalog</p>
          </div>
          <div className="bg-white/10 p-3 rounded-2xl border border-white/20">
            <Gift className="text-white" size={22} />
          </div>
        </div>
      </div>

      <div className="px-4">
        {/* Add/Edit Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5">
          <h3 className="font-bold text-gray-900 mb-4 text-sm">{editing ? "Edit Reward" : "Add New Reward"}</h3>
          <form onSubmit={submit} className="space-y-3">
            <input
              placeholder="Reward Name *"
              value={form.rewardName}
              onChange={(e) => setForm({ ...form, rewardName: e.target.value })}
              required
              className="w-full border-2 border-gray-100 bg-[#F5F7FA] rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 focus:outline-none focus:border-[#0f4089]/30"
            />
            <input
              type="number"
              placeholder="Points Required *"
              value={form.pointsRequired}
              onChange={(e) => setForm({ ...form, pointsRequired: e.target.value })}
              required
              className="w-full border-2 border-gray-100 bg-[#F5F7FA] rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 focus:outline-none focus:border-[#0f4089]/30"
            />
            <input
              placeholder="Description (optional)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border-2 border-gray-100 bg-[#F5F7FA] rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 focus:outline-none focus:border-[#0f4089]/30"
            />

            {/* Image Upload */}
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Images (max 5)</p>
              <div className="flex flex-wrap gap-2">
                {imagePreviews.map((src, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-gray-100">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    {imageFiles[i] && (
                      <button type="button" onClick={() => removePreview(i)} className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
                        <X size={10} />
                      </button>
                    )}
                  </div>
                ))}
                {imagePreviews.length < 5 && (
                  <label className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-[#0f4089]/40 bg-[#F5F7FA] transition-colors">
                    <Plus size={18} className="text-gray-400" />
                    <span className="text-[9px] text-gray-400 mt-0.5">Add</span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelect} />
                  </label>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1.5">Or paste image URL:</p>
              <input
                placeholder="https://example.com/image.jpg"
                value={form.rewardImage}
                onChange={(e) => setForm({ ...form, rewardImage: e.target.value })}
                className="w-full border-2 border-gray-100 bg-[#F5F7FA] rounded-xl px-4 py-2.5 text-xs text-gray-700 focus:outline-none focus:border-[#0f4089]/30 mt-1.5"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <button type="submit" disabled={submitting} className="flex-1 bg-[#0f4089] text-white py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60 active:scale-95 shadow-md">
                {submitting && <Loader2 size={15} className="animate-spin" />}
                {editing ? "Update Reward" : "Add Reward"}
              </button>
              {editing && (
                <button type="button" onClick={cancelEdit} className="flex-1 border-2 border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-bold active:scale-95 bg-white">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Rewards List */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 size={32} className="animate-spin text-[#0f4089]" />
          </div>
        ) : (
          <div className="space-y-3">
            {rewards.length === 0 && (
              <div className="bg-white rounded-2xl p-10 text-center border border-gray-100 shadow-sm">
                <Gift size={28} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium text-sm">No rewards added yet</p>
              </div>
            )}
            {rewards.map((r) => {
              const images = r.rewardImages?.length > 0 ? r.rewardImages : r.rewardImage ? [r.rewardImage] : [];
              return (
                <div key={r._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                  <div className="flex gap-3">
                    {/* Images */}
                    <div className="shrink-0">
                      {images.length > 0 ? (
                        <div className="relative w-16 h-16">
                          <img src={images[0]} alt={r.rewardName} className="w-16 h-16 rounded-xl object-cover border border-gray-100" />
                          {images.length > 1 && (
                            <span className="absolute -bottom-1 -right-1 bg-[#0f4089] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">+{images.length - 1}</span>
                          )}
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100">
                          <ImageIcon size={22} className="text-gray-300" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-extrabold text-gray-900 text-sm truncate">{r.rewardName}</p>
                      {r.description && <p className="text-xs text-gray-500 truncate mt-0.5">{r.description}</p>}
                      <div className="inline-flex items-center gap-1 bg-[#E3EBFB] text-[#0f4089] px-2.5 py-1 rounded-lg text-xs font-bold mt-1.5">
                        {r.pointsRequired} pts
                      </div>
                    </div>
                  </div>

                  {/* Multiple image strip */}
                  {images.length > 1 && (
                    <div className="flex gap-1.5 mt-3 overflow-x-auto no-scrollbar">
                      {images.map((img, i) => (
                        <img key={i} src={img} alt="" className="w-12 h-12 rounded-lg object-cover border border-gray-100 shrink-0" />
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border ${r.isActive ? "bg-green-50 text-green-600 border-green-200" : "bg-gray-50 text-gray-400 border-gray-200"}`}>
                      {r.isActive ? "Active" : "Inactive"}
                    </span>
                    <div className="flex gap-1.5">
                      <button onClick={() => toggleActive(r)} disabled={actionId === r._id} className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center hover:bg-amber-100 transition">
                        {actionId === r._id ? <Loader2 size={13} className="animate-spin" /> : <Target size={13} />}
                      </button>
                      <button onClick={() => startEdit(r)} className="w-8 h-8 rounded-lg bg-blue-50 text-[#0f4089] flex items-center justify-center hover:bg-blue-100 transition">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>
                      </button>
                      <button onClick={() => remove(r._id)} disabled={actionId === r._id} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition">
                        {actionId === r._id ? <Loader2 size={13} className="animate-spin" /> : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}` }} />
    </div>
  );
}

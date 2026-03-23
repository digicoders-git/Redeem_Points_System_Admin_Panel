import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import api from "../api/axios";
import { Info, CheckCircle, XCircle, Loader2, X, ExternalLink, FileText, Image, Pencil, Receipt, ChevronDown, ChevronUp } from "lucide-react";
import Swal from "sweetalert2";

export default function AdminBills() {
  const [bills, setBills] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [reason, setReason] = useState({});
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [editingAmount, setEditingAmount] = useState(false);
  const [newAmount, setNewAmount] = useState("");
  const [amountSaving, setAmountSaving] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .get("/bills/admin/all", { params: filter !== "all" ? { status: filter } : {} })
      .then(({ data }) => setBills(data.bills || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const isPdf = (url) => url?.toLowerCase().includes(".pdf");

  const users = useMemo(() => {
    const map = {};
    bills.forEach((b) => { if (b.userId?._id) map[b.userId._id] = b.userId; });
    return Object.values(map);
  }, [bills]);

  const filtered = bills.filter((b) => {
    const q = search.toLowerCase();
    const matchSearch = !q || b.billName?.toLowerCase().includes(q) || b.billNumber?.toLowerCase().includes(q) || b.userId?.name?.toLowerCase().includes(q) || b.userId?.mobile?.includes(q);
    const billDate = new Date(b.date || b.createdAt);
    const matchFrom = !dateFrom || billDate >= new Date(dateFrom);
    const matchTo = !dateTo || billDate <= new Date(dateTo + "T23:59:59");
    const matchUser = !selectedUser || b.userId?._id === selectedUser;
    const matchMin = !minAmount || b.amount >= Number(minAmount);
    const matchMax = !maxAmount || b.amount <= Number(maxAmount);
    return matchSearch && matchFrom && matchTo && matchUser && matchMin && matchMax;
  });

  const approve = async (id) => {
    const res = await Swal.fire({ title: "Approve Bill?", icon: "question", showCancelButton: true, confirmButtonText: "Yes, Approve", confirmButtonColor: "#22c55e" });
    if (!res.isConfirmed) return;
    setActionId(id);
    await api.patch(`/bills/admin/${id}/approve`);
    setActionId(null);
    Swal.fire({ icon: "success", title: "Approved!", timer: 1200, showConfirmButton: false });
    load();
  };

  const reject = async (id) => {
    const res = await Swal.fire({ title: "Reject Bill?", icon: "warning", showCancelButton: true, confirmButtonText: "Yes, Reject", confirmButtonColor: "#ef4444" });
    if (!res.isConfirmed) return;
    setActionId(id);
    await api.patch(`/bills/admin/${id}/reject`, { rejectionReason: reason[id] || "Not specified" });
    setActionId(null);
    Swal.fire({ icon: "info", title: "Rejected", timer: 1200, showConfirmButton: false });
    load();
  };

  const saveAmount = async () => {
    if (!newAmount || isNaN(newAmount) || Number(newAmount) <= 0) return;
    setAmountSaving(true);
    try {
      const { data } = await api.patch(`/bills/admin/${selected._id}/edit-amount`, { amount: Number(newAmount) });
      const updated = data.bill;
      setSelected((prev) => ({ ...prev, amount: updated.amount }));
      setBills((prev) => prev.map((b) => b._id === updated._id ? { ...b, amount: updated.amount } : b));
      setEditingAmount(false);
      Swal.fire({ icon: "success", title: "Amount Updated!", timer: 1200, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Failed", text: err.response?.data?.message || "Could not update amount" });
    } finally {
      setAmountSaving(false);
    }
  };

  const openModal = (b) => {
    setSelected(b);
    setEditingAmount(false);
    setNewAmount("");
  };

  const statusStyle = {
    pending: "bg-amber-100 text-amber-600 border-amber-200",
    approved: "bg-green-100 text-green-600 border-green-200",
    rejected: "bg-red-100 text-red-500 border-red-200",
  };

  return (
    <>
      <div className="min-h-screen bg-[#F5F7FA] font-sans pb-24">
        {/* Header */}
        <div className="bg-[#0f4089] rounded-b-[32px] px-5 pt-10 pb-10 mb-5 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h1 className="text-white font-bold text-xl tracking-wide mb-0.5">Bills Log</h1>
              <p className="text-white/70 text-sm">Review Uploads</p>
            </div>
            <div className="bg-white/10 p-3 rounded-2xl border border-white/20">
              <Receipt className="text-white" size={22} />
            </div>
          </div>
        </div>

        <div className="px-4">
          {/* Search */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
            <input
              placeholder="Search by name, bill no, user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border-2 border-gray-100 bg-[#F5F7FA] rounded-xl px-4 py-2.5 text-sm mb-3 focus:outline-none focus:border-[#0f4089]/30 transition-colors"
            />

            {/* Toggle Filters */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-[#F5F7FA] rounded-xl text-sm font-semibold text-gray-600 border-2 border-gray-100"
            >
              <span>Advanced Filters</span>
              {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showFilters && (
              <div className="mt-3 space-y-3">
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full border-2 border-gray-100 bg-[#F5F7FA] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#0f4089]/30 transition-colors"
                >
                  <option value="">All Users</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>{u.name || u.mobile}{u.mobile ? ` • ${u.mobile}` : ""}</option>
                  ))}
                </select>

                <div className="grid grid-cols-2 gap-2">
                  <input type="number" placeholder="Min ₹" value={minAmount} onChange={(e) => setMinAmount(e.target.value)} className="border-2 border-gray-100 bg-[#F5F7FA] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#0f4089]/30 transition-colors" />
                  <input type="number" placeholder="Max ₹" value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)} className="border-2 border-gray-100 bg-[#F5F7FA] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#0f4089]/30 transition-colors" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="border-2 border-gray-100 bg-[#F5F7FA] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#0f4089]/30 transition-colors" />
                  <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="border-2 border-gray-100 bg-[#F5F7FA] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#0f4089]/30 transition-colors" />
                </div>
              </div>
            )}
          </div>

          {/* Status Tabs */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1 no-scrollbar">
            {["all", "pending", "approved", "rejected"].map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-full text-xs font-bold capitalize whitespace-nowrap transition-colors shrink-0 ${filter === f ? "bg-[#0f4089] text-white shadow-md" : "bg-white text-gray-500 border border-gray-200"}`}>
                {f}
              </button>
            ))}
          </div>

          {/* Bills List */}
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 size={32} className="animate-spin text-[#0f4089]" />
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.length === 0 && <p className="text-center text-gray-400 text-sm py-8">No bills found</p>}
              {filtered.map((b) => (
                <div key={b._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 cursor-pointer active:scale-[0.99] transition-transform" onClick={() => openModal(b)}>
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-extrabold text-[#0f4089] text-lg leading-tight">₹{b.amount}</p>
                      <p className="text-sm text-gray-800 font-semibold truncate mt-0.5">{b.billName}</p>
                      <p className="text-xs text-gray-400 truncate">#{b.billNumber}</p>
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full capitalize border shrink-0 ${statusStyle[b.status]}`}>{b.status}</span>
                  </div>

                  {/* User + Date */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span className="font-medium truncate max-w-[60%]">{b.userId?.name || "User"} • {b.userId?.mobile}</span>
                    <span className="text-gray-400 shrink-0">{new Date(b.date || b.createdAt).toLocaleDateString()}</span>
                  </div>

                  {/* Bill Image thumbnail */}
                  {b.billImage && !isPdf(b.billImage) && (
                    <img src={b.billImage} alt="bill" className="w-full h-32 object-cover rounded-xl mb-3 border border-gray-100" />
                  )}
                  {b.billImage && isPdf(b.billImage) && (
                    <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 mb-3 border border-gray-100">
                      <FileText size={18} className="text-red-400 shrink-0" />
                      <span className="text-xs font-semibold text-gray-600">PDF Document</span>
                    </div>
                  )}

                  {b.rejectionReason && (
                    <p className="text-xs text-red-500 mb-3 flex items-start gap-1.5 bg-red-50 px-3 py-2 rounded-xl border border-red-100 font-medium">
                      <Info size={13} className="shrink-0 mt-0.5" /> <span className="break-words">{b.rejectionReason}</span>
                    </p>
                  )}

                  {/* Approve/Reject actions */}
                  {b.status === "pending" && (
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 mt-1" onClick={(e) => e.stopPropagation()}>
                      <input
                        placeholder="Rejection reason (optional)"
                        value={reason[b._id] || ""}
                        onChange={(e) => setReason({ ...reason, [b._id]: e.target.value })}
                        className="w-full border-2 border-white bg-white rounded-xl px-3 py-2.5 text-xs mb-2.5 focus:outline-none focus:border-red-200 transition-colors"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => approve(b._id)} disabled={actionId === b._id} className="bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-60 transition active:scale-95">
                          {actionId === b._id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />} Approve
                        </button>
                        <button onClick={() => reject(b._id)} disabled={actionId === b._id} className="bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-60 transition active:scale-95">
                          {actionId === b._id ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />} Reject
                        </button>
                      </div>
                    </div>
                  )}

                  {b.pointsEarned > 0 && (
                    <div className="inline-flex items-center gap-1 bg-orange-50 text-orange-500 font-bold px-3 py-1.5 rounded-lg text-xs mt-3">
                      +{b.pointsEarned} points awarded
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bill Detail Modal */}
      {selected && createPortal(
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div
            className="bg-white w-full sm:max-w-lg sm:rounded-[28px] rounded-t-[28px] flex flex-col shadow-2xl"
            style={{ maxHeight: "92vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 shrink-0">
              <h3 className="font-bold text-gray-900 text-base">Bill Details</h3>
              <button onClick={() => setSelected(null)} className="p-2 rounded-full hover:bg-gray-100 bg-gray-50 transition-colors">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto flex-1 p-5">
              {/* Amount + Status */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-gradient-to-br from-[#0f4089] to-[#1a4187] rounded-2xl p-4 text-white">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[11px] text-white/70 font-medium uppercase tracking-wider">Amount</p>
                    {selected.status === "pending" && !editingAmount && (
                      <button onClick={() => { setEditingAmount(true); setNewAmount(selected.amount); }} className="text-white/80 hover:text-white bg-white/10 p-1.5 rounded-lg transition-colors">
                        <Pencil size={13} />
                      </button>
                    )}
                  </div>
                  {editingAmount ? (
                    <input
                      type="number"
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                      className="w-full bg-white/20 border border-white/30 text-white placeholder-white/50 rounded-xl px-3 py-1.5 text-lg font-bold focus:outline-none mt-1"
                      autoFocus
                    />
                  ) : (
                    <p className="font-extrabold text-white text-2xl mt-1">₹{selected.amount}</p>
                  )}
                </div>
                <div className="bg-[#F5F7FA] border border-gray-100 rounded-2xl p-4 flex flex-col justify-center">
                  <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-2">Status</p>
                  <span className={`inline-flex items-center max-w-fit px-3 py-1 rounded-lg text-xs font-bold capitalize border ${statusStyle[selected.status]}`}>
                    {selected.status}
                  </span>
                </div>
              </div>

              {/* Save/Cancel edit */}
              {editingAmount && (
                <div className="grid grid-cols-2 gap-2 mb-5">
                  <button onClick={saveAmount} disabled={amountSaving} className="bg-[#0f4089] text-white py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 disabled:opacity-60 active:scale-95">
                    {amountSaving ? <Loader2 size={15} className="animate-spin" /> : null} Save
                  </button>
                  <button onClick={() => setEditingAmount(false)} className="bg-white border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-bold active:scale-95">
                    Cancel
                  </button>
                </div>
              )}

              {/* Details */}
              <div className="bg-[#F5F7FA] rounded-2xl p-4 space-y-3 mb-5 border border-gray-100">
                {[
                  ["Store/Item", selected.billName],
                  ["Bill No", `#${selected.billNumber}`],
                  ["User Name", selected.userId?.name],
                  ["Contact", selected.userId?.mobile],
                  ["Upload Date", new Date(selected.date || selected.createdAt).toLocaleDateString()],
                ].map(([label, val], i, arr) => (
                  <div key={label} className={`flex justify-between items-center gap-3 ${i !== arr.length - 1 ? "border-b border-gray-200/60 pb-3" : ""}`}>
                    <span className="text-gray-500 font-medium text-xs shrink-0">{label}</span>
                    <span className="font-bold text-gray-900 text-sm text-right break-all">{val}</span>
                  </div>
                ))}
                {selected.pointsEarned > 0 && (
                  <div className="flex justify-between items-center border-t border-gray-200/60 pt-3">
                    <span className="text-gray-500 font-medium text-xs">Reward Points</span>
                    <span className="font-extrabold text-orange-500 text-sm px-2.5 py-1 bg-orange-50 rounded-lg">+{selected.pointsEarned} pts</span>
                  </div>
                )}
              </div>

              {/* Rejection reason */}
              {selected.rejectionReason && (
                <div className="bg-red-50 rounded-2xl px-4 py-3 mb-5 flex items-start gap-3 border border-red-100">
                  <Info size={16} className="text-red-500 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-[11px] font-bold text-red-700 uppercase tracking-wider mb-1">Rejection Reason</h4>
                    <p className="text-sm text-red-600 font-medium break-words">{selected.rejectionReason}</p>
                  </div>
                </div>
              )}

              {/* Attachment */}
              {selected.billImage && (
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Attachment</h4>
                  {isPdf(selected.billImage) ? (
                    <div className="flex flex-col items-center gap-4 bg-[#F5F7FA] border border-gray-100 rounded-2xl p-6">
                      <FileText size={52} className="text-red-400" />
                      <p className="text-sm text-gray-500 font-medium text-center">PDF preview not supported.<br />Please open the file directly.</p>
                      <a href={selected.billImage} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#0f4089] text-white px-5 py-3 rounded-xl text-sm font-bold shadow-md active:scale-95 transition">
                        <ExternalLink size={16} /> Open PDF
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="bg-gray-50 p-2 rounded-2xl border border-gray-100">
                        <img src={selected.billImage} alt="bill" className="w-full rounded-xl object-contain max-h-64" />
                      </div>
                      <a href={selected.billImage} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-[#F5F7FA] hover:bg-gray-100 border border-gray-200 text-gray-700 font-bold px-4 py-3 rounded-xl text-sm transition active:scale-95 w-full">
                        <Image size={16} /> Open original image
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      <style dangerouslySetInnerHTML={{
        __html: `.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}`
      }} />
    </>
  );
}

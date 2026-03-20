import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import api from "../api/axios";
import { Info, CheckCircle, XCircle, Loader2, X, ExternalLink, FileText, Image, Pencil } from "lucide-react";
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
    pending: "bg-amber-100 text-amber-600",
    approved: "bg-green-100 text-green-600",
    rejected: "bg-red-100 text-red-500",
  };

  return (
    <>
      <div className="px-4 py-6 pb-24">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Bills</h2>

        <input
          placeholder="Search by name, bill no, user..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-slate-300"
        />

        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-slate-300 bg-white"
        >
          <option value="">All Users</option>
          {users.map((u) => (
            <option key={u._id} value={u._id}>{u.name || u.mobile}{u.mobile ? ` • ${u.mobile}` : ""}</option>
          ))}
        </select>

        <div className="flex gap-2 mb-3">
          <input type="number" placeholder="Min ₹" value={minAmount} onChange={(e) => setMinAmount(e.target.value)} className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-slate-300" />
          <input type="number" placeholder="Max ₹" value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)} className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-slate-300" />
        </div>

        <div className="flex gap-2 mb-3">
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-slate-300" />
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-slate-300" />
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {["all", "pending", "approved", "rejected"].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize whitespace-nowrap transition ${filter === f ? "bg-slate-800 text-white" : "bg-gray-100 text-gray-500"}`}>
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 size={32} className="animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.length === 0 && <p className="text-center text-gray-400 text-sm py-8">No bills found</p>}
            {filtered.map((b) => (
              <div key={b._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 cursor-pointer" onClick={() => openModal(b)}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-gray-800">₹{b.amount}</p>
                    <p className="text-xs text-gray-500 font-medium">{b.billName}</p>
                    <p className="text-xs text-gray-400">#{b.billNumber}</p>
                    <p className="text-xs text-gray-400">{b.userId?.name || "User"} • {b.userId?.mobile}</p>
                    <p className="text-xs text-gray-400">{new Date(b.date || b.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusStyle[b.status]}`}>{b.status}</span>
                </div>

                {b.billImage && !isPdf(b.billImage) && <img src={b.billImage} alt="bill" className="w-full h-36 object-cover rounded-xl mb-3" />}
                {b.billImage && isPdf(b.billImage) && (
                  <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 mb-3">
                    <FileText size={16} className="text-red-400" />
                    <span className="text-xs text-gray-500">PDF Document</span>
                  </div>
                )}

                {b.rejectionReason && <p className="text-xs text-red-400 mb-2 flex items-center gap-1"><Info size={14} /> {b.rejectionReason}</p>}

                {b.status === "pending" && (
                  <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                    <input
                      placeholder="Rejection reason (optional)"
                      value={reason[b._id] || ""}
                      onChange={(e) => setReason({ ...reason, [b._id]: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-slate-300"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => approve(b._id)} disabled={actionId === b._id} className="flex-1 bg-green-500 text-white py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-60 transition active:scale-95">
                        {actionId === b._id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />} Approve
                      </button>
                      <button onClick={() => reject(b._id)} disabled={actionId === b._id} className="flex-1 bg-red-500 text-white py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-60 transition active:scale-95">
                        {actionId === b._id ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />} Reject
                      </button>
                    </div>
                  </div>
                )}

                {b.pointsEarned > 0 && <p className="text-xs text-violet-600 font-semibold mt-2">+{b.pointsEarned} points awarded</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bill Detail Modal */}
      {selected && createPortal(
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div
            className="bg-white w-full max-w-lg rounded-2xl flex flex-col"
            style={{ height: "min(90vh, 700px)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 shrink-0">
              <h3 className="font-bold text-gray-800 text-lg">Bill Details</h3>
              <button onClick={() => setSelected(null)} className="p-1 rounded-full hover:bg-gray-100">
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="overflow-y-auto flex-1 p-5">

              {/* Amount + Edit */}
              <div className="grid grid-cols-2 gap-2 mb-5">
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-xs text-gray-400">Amount</p>
                    {selected.status === "pending" && !editingAmount && (
                      <button onClick={() => { setEditingAmount(true); setNewAmount(selected.amount); }} className="text-slate-500 hover:text-slate-800">
                        <Pencil size={13} />
                      </button>
                    )}
                  </div>
                  {editingAmount ? (
                    <div className="flex items-center gap-1 mt-1">
                      <input
                        type="number"
                        value={newAmount}
                        onChange={(e) => setNewAmount(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-2 py-1 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-slate-400"
                        autoFocus
                      />
                    </div>
                  ) : (
                    <p className="font-bold text-gray-800 text-lg">₹{selected.amount}</p>
                  )}
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400">Status</p>
                  <p className={`font-semibold capitalize text-sm mt-0.5 ${selected.status === "approved" ? "text-green-600" : selected.status === "rejected" ? "text-red-500" : "text-amber-500"}`}>
                    {selected.status}
                  </p>
                </div>
              </div>

              {/* Edit Amount Save/Cancel */}
              {editingAmount && (
                <div className="flex gap-2 mb-4">
                  <button onClick={saveAmount} disabled={amountSaving} className="flex-1 bg-slate-800 text-white py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-60">
                    {amountSaving ? <Loader2 size={13} className="animate-spin" /> : null} Save Amount
                  </button>
                  <button onClick={() => setEditingAmount(false)} className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-xl text-xs font-semibold">
                    Cancel
                  </button>
                </div>
              )}

              {/* Info Rows */}
              <div className="space-y-2 mb-5">
                {[
                  ["Bill Name", selected.billName],
                  ["Bill No", `#${selected.billNumber}`],
                  ["User", selected.userId?.name],
                  ["Mobile", selected.userId?.mobile],
                  ["Date", new Date(selected.date || selected.createdAt).toLocaleDateString()],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between text-sm border-b border-gray-50 pb-2">
                    <span className="text-gray-400">{label}</span>
                    <span className="font-medium text-gray-700">{val}</span>
                  </div>
                ))}
                {selected.pointsEarned > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Points</span>
                    <span className="font-semibold text-violet-600">+{selected.pointsEarned}</span>
                  </div>
                )}
              </div>

              {selected.rejectionReason && (
                <div className="bg-red-50 rounded-xl px-3 py-2 mb-4 flex items-center gap-2">
                  <Info size={14} className="text-red-400" />
                  <p className="text-xs text-red-500">{selected.rejectionReason}</p>
                </div>
              )}

              {/* Document */}
              {selected.billImage && (
                isPdf(selected.billImage) ? (
                  <div className="flex flex-col items-center gap-3 bg-gray-50 rounded-2xl p-8">
                    <FileText size={56} className="text-red-400" />
                    <p className="text-sm text-gray-500">PDF cannot be previewed inline</p>
                    <a href={selected.billImage} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold">
                      <ExternalLink size={16} /> Open PDF in Browser
                    </a>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <img src={selected.billImage} alt="bill" className="w-full rounded-2xl object-contain" />
                    <a href={selected.billImage} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 border border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl text-sm font-medium w-full">
                      <Image size={16} /> Open Image in Browser
                    </a>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      , document.body)}
    </>
  );
}

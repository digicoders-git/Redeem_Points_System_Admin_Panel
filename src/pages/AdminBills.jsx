import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { Info, CheckCircle, XCircle, Loader2, FileText, Receipt, ChevronDown, ChevronUp } from "lucide-react";
import Swal from "sweetalert2";

export default function AdminBills() {
  const navigate = useNavigate();
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
  const [showFilters, setShowFilters] = useState(false);

  const load = () => {
    setLoading(true);
    api.get("/bills/admin/all", { params: filter !== "all" ? { status: filter } : {} })
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

  const approve = async (id, e) => {
    e.stopPropagation();
    const res = await Swal.fire({ title: "Approve Bill?", icon: "question", showCancelButton: true, confirmButtonText: "Yes, Approve", confirmButtonColor: "#22c55e" });
    if (!res.isConfirmed) return;
    setActionId(id);
    await api.patch(`/bills/admin/${id}/approve`);
    setActionId(null);
    Swal.fire({ icon: "success", title: "Approved!", timer: 1200, showConfirmButton: false });
    load();
  };

  const reject = async (id, e) => {
    e.stopPropagation();
    const res = await Swal.fire({ title: "Reject Bill?", icon: "warning", showCancelButton: true, confirmButtonText: "Yes, Reject", confirmButtonColor: "#ef4444" });
    if (!res.isConfirmed) return;
    setActionId(id);
    await api.patch(`/bills/admin/${id}/reject`, { rejectionReason: reason[id] || "Not specified" });
    setActionId(null);
    Swal.fire({ icon: "info", title: "Rejected", timer: 1200, showConfirmButton: false });
    load();
  };

  const statusStyle = {
    pending: "bg-amber-100 text-amber-600 border-amber-200",
    approved: "bg-green-100 text-green-600 border-green-200",
    rejected: "bg-red-100 text-red-500 border-red-200",
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] font-sans pb-24">
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
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
          <input placeholder="Search by name, bill no, user..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full border-2 border-gray-100 bg-[#F5F7FA] rounded-xl px-4 py-2.5 text-sm mb-3 focus:outline-none focus:border-[#0f4089]/30" />
          <button onClick={() => setShowFilters(!showFilters)} className="w-full flex items-center justify-between px-4 py-2.5 bg-[#F5F7FA] rounded-xl text-sm font-semibold text-gray-600 border-2 border-gray-100">
            <span>Advanced Filters</span>
            {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {showFilters && (
            <div className="mt-3 space-y-3">
              <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} className="w-full border-2 border-gray-100 bg-[#F5F7FA] rounded-xl px-4 py-2.5 text-sm focus:outline-none">
                <option value="">All Users</option>
                {users.map((u) => <option key={u._id} value={u._id}>{u.name || u.mobile}{u.mobile ? ` • ${u.mobile}` : ""}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-2">
                <input type="number" placeholder="Min ₹" value={minAmount} onChange={(e) => setMinAmount(e.target.value)} className="border-2 border-gray-100 bg-[#F5F7FA] rounded-xl px-3 py-2.5 text-sm focus:outline-none" />
                <input type="number" placeholder="Max ₹" value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)} className="border-2 border-gray-100 bg-[#F5F7FA] rounded-xl px-3 py-2.5 text-sm focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="border-2 border-gray-100 bg-[#F5F7FA] rounded-xl px-3 py-2.5 text-sm focus:outline-none" />
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="border-2 border-gray-100 bg-[#F5F7FA] rounded-xl px-3 py-2.5 text-sm focus:outline-none" />
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto pb-1 no-scrollbar">
          {["all", "pending", "approved", "rejected"].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-full text-xs font-bold capitalize whitespace-nowrap shrink-0 transition-colors ${filter === f ? "bg-[#0f4089] text-white shadow-md" : "bg-white text-gray-500 border border-gray-200"}`}>{f}</button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16"><Loader2 size={32} className="animate-spin text-[#0f4089]" /></div>
        ) : (
          <div className="space-y-3">
            {filtered.length === 0 && <p className="text-center text-gray-400 text-sm py-8">No bills found</p>}
            {filtered.map((b) => (
              <div key={b._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 cursor-pointer active:scale-[0.99] transition-transform" onClick={() => navigate(`/bills/${b._id}`, { state: { bill: b } })}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-extrabold text-[#0f4089] text-lg leading-tight">₹{b.amount}</p>
                    <p className="text-sm text-gray-800 font-semibold truncate mt-0.5">{b.billName}</p>
                    <p className="text-xs text-gray-400 truncate">#{b.billNumber}</p>
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full capitalize border shrink-0 ${statusStyle[b.status]}`}>{b.status}</span>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span className="font-medium truncate max-w-[60%]">{b.userId?.name || "User"} • {b.userId?.mobile}</span>
                  <span className="text-gray-400 shrink-0">{new Date(b.date || b.createdAt).toLocaleDateString()}</span>
                </div>

                {b.billImage && !isPdf(b.billImage) && <img src={b.billImage} alt="bill" className="w-full h-32 object-cover rounded-xl mb-3 border border-gray-100" onError={(e) => { e.target.style.display = "none"; }} />}
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

                {b.status === "pending" && (
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 mt-1" onClick={(e) => e.stopPropagation()}>
                    <input placeholder="Rejection reason (optional)" value={reason[b._id] || ""} onChange={(e) => setReason({ ...reason, [b._id]: e.target.value })} className="w-full border-2 border-white bg-white rounded-xl px-3 py-2.5 text-xs mb-2.5 focus:outline-none focus:border-red-200" />
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={(e) => approve(b._id, e)} disabled={actionId === b._id} className="bg-green-500 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-60 active:scale-95">
                        {actionId === b._id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />} Approve
                      </button>
                      <button onClick={(e) => reject(b._id, e)} disabled={actionId === b._id} className="bg-red-500 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-60 active:scale-95">
                        {actionId === b._id ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />} Reject
                      </button>
                    </div>
                  </div>
                )}

                {b.pointsEarned > 0 && <div className="inline-flex items-center gap-1 bg-orange-50 text-orange-500 font-bold px-3 py-1.5 rounded-lg text-xs mt-3">+{b.pointsEarned} points awarded</div>}
              </div>
            ))}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}` }} />
    </div>
  );
}

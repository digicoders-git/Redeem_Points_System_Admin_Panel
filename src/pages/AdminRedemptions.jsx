import { useState, useEffect } from "react";
import api from "../api/axios";
import { Info, CheckCircle, XCircle, Loader2, CheckSquare } from "lucide-react";
import Swal from "sweetalert2";

export default function AdminRedemptions() {
  const [redemptions, setRedemptions] = useState([]);
  const [filter, setFilter] = useState("all");
  const [reason, setReason] = useState({});
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState(null);

  const load = () => {
    setLoading(true);
    api
      .get("/rewards/admin/redemptions", { params: filter !== "all" ? { status: filter } : {} })
      .then(({ data }) => setRedemptions(data.redemptions || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const approve = async (id) => {
    const res = await Swal.fire({ title: "Approve Redemption?", icon: "question", showCancelButton: true, confirmButtonText: "Yes, Approve", confirmButtonColor: "#22c55e" });
    if (!res.isConfirmed) return;
    setActionId(id);
    await api.patch(`/rewards/admin/redemptions/${id}/approve`);
    setActionId(null);
    Swal.fire({ icon: "success", title: "Approved!", timer: 1200, showConfirmButton: false });
    load();
  };

  const reject = async (id) => {
    const res = await Swal.fire({ title: "Reject Redemption?", icon: "warning", showCancelButton: true, confirmButtonText: "Yes, Reject", confirmButtonColor: "#ef4444" });
    if (!res.isConfirmed) return;
    setActionId(id);
    await api.patch(`/rewards/admin/redemptions/${id}/reject`, { rejectionReason: reason[id] || "Not specified" });
    setActionId(null);
    Swal.fire({ icon: "info", title: "Rejected", timer: 1200, showConfirmButton: false });
    load();
  };

  const statusStyle = {
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    approved: "bg-green-100 text-green-700 border-green-200",
    rejected: "bg-red-100 text-red-600 border-red-200",
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] font-sans pb-24">
      {/* Top Header Background */}
      <div className="bg-[#0f4089] rounded-b-[40px] px-6 pt-10 pb-12 mb-6 relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold text-2xl tracking-wide mb-1">Redemptions</h1>
            <p className="text-white/80 font-medium text-sm">Review User Gift Requests</p>
          </div>
          <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm border border-white/20">
            <CheckSquare className="text-white" size={24} />
          </div>
        </div>
      </div>

      <div className="px-5">
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 no-scrollbar shrink-0">
          {["all", "pending", "approved", "rejected"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2 rounded-full text-[13px] font-bold capitalize whitespace-nowrap transition-colors ${
                filter === f ? "bg-[#0f4089] text-white shadow-md" : "bg-white text-gray-500 border border-gray-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 size={32} className="animate-spin text-[#0f4089]" />
          </div>
        ) : (
          <div className="space-y-4">
            {redemptions.length === 0 && (
              <div className="bg-white rounded-[24px] p-10 text-center border border-gray-100 shadow-sm">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckSquare size={28} className="text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium">No redemptions found</p>
              </div>
            )}
            
            {redemptions.map((r) => (
              <div key={r._id} className="bg-white rounded-[24px] shadow-[0_4px_20px_rgb(0,0,0,0.04)] border border-gray-100 p-5">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex flex-col">
                    <p className="font-extrabold text-gray-900 text-[16px]">{r.rewardId?.rewardName || "Reward"}</p>
                    <p className="text-[13px] text-gray-500 font-medium mt-1">{r.userId?.name} • {r.userId?.mobile}</p>
                    <p className="text-[12px] text-gray-400 mt-1">{new Date(r.createdAt).toLocaleDateString()}</p>
                    
                    <div className="flex gap-2 items-center mt-3">
                      <span className="text-[12px] bg-[#E3EBFB] text-[#0f4089] font-bold px-2 py-1 rounded-lg">Wallet: {r.userId?.walletPoints} pts</span>
                      <span className="text-[12px] bg-[#f97316]/10 text-[#f97316] font-bold px-2 py-1 rounded-lg">-{r.pointsUsed} pts</span>
                    </div>
                  </div>
                  <span className={`text-[11px] font-bold px-3 py-1.5 rounded-full capitalize border ${statusStyle[r.status]}`}>
                    {r.status}
                  </span>
                </div>

                {r.rejectionReason && (
                  <p className="text-[12px] text-red-500 bg-red-50 p-2.5 rounded-xl border border-red-100 mb-2 flex items-center gap-1.5 font-semibold">
                    <Info size={14} /> {r.rejectionReason}
                  </p>
                )}

                {r.status === "pending" && (
                  <div className="bg-gray-50 rounded-xl p-3 mt-4 border border-gray-100">
                    <input
                      placeholder="Reason for rejection (if rejecting)"
                      value={reason[r._id] || ""}
                      onChange={(e) => setReason({ ...reason, [r._id]: e.target.value })}
                      className="w-full border border-gray-200 bg-white rounded-xl px-4 py-3 text-[13px] mb-3 focus:outline-none focus:border-[#0f4089]/30 transition-colors"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => approve(r._id)}
                        disabled={actionId === r._id}
                        className="flex-1 bg-[#10b981] text-white py-3 rounded-xl text-[13px] font-bold flex items-center justify-center gap-1.5 disabled:opacity-60 transition active:scale-95 shadow-sm shadow-green-500/20"
                      >
                        {actionId === r._id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} fill="white" className="text-[#10b981]" />} Approve
                      </button>
                      <button
                        onClick={() => reject(r._id)}
                        disabled={actionId === r._id}
                        className="flex-1 bg-red-500 text-white py-3 rounded-xl text-[13px] font-bold flex items-center justify-center gap-1.5 disabled:opacity-60 transition active:scale-95 shadow-sm shadow-red-500/20"
                      >
                        {actionId === r._id ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} fill="white" className="text-red-500" />} Reject
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}

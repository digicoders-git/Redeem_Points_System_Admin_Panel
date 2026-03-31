import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { Loader2, CheckSquare } from "lucide-react";

export default function AdminRedemptions() {
  const navigate = useNavigate();
  const [redemptions, setRedemptions] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  const load = () => {
    setLoading(true);
    api.get("/rewards/admin/redemptions", { params: filter !== "all" ? { status: filter } : {} })
      .then(({ data }) => setRedemptions(data.redemptions || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const statusStyle = {
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    approved: "bg-green-100 text-green-700 border-green-200",
    rejected: "bg-red-100 text-red-600 border-red-200",
    delivered: "bg-blue-100 text-blue-700 border-blue-200",
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] font-sans pb-24">
      <div className="bg-[#0f4089] rounded-b-[32px] px-5 pt-10 pb-10 mb-5 relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold text-xl tracking-wide mb-0.5">Redemptions</h1>
            <p className="text-white/70 text-sm">Review Gift Requests</p>
          </div>
          <div className="bg-white/10 p-3 rounded-2xl border border-white/20">
            <CheckSquare className="text-white" size={22} />
          </div>
        </div>
      </div>

      <div className="px-4">
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1 no-scrollbar">
          {["all", "pending", "approved", "rejected", "delivered"].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-full text-xs font-bold capitalize whitespace-nowrap shrink-0 transition-colors ${filter === f ? "bg-[#0f4089] text-white shadow-md" : "bg-white text-gray-500 border border-gray-200"}`}>{f}</button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16"><Loader2 size={32} className="animate-spin text-[#0f4089]" /></div>
        ) : (
          <div className="space-y-3">
            {redemptions.length === 0 && (
              <div className="bg-white rounded-2xl p-10 text-center border border-gray-100 shadow-sm">
                <CheckSquare size={28} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium text-sm">No redemptions found</p>
              </div>
            )}
            {redemptions.map((r) => {
              const images = r.rewardId?.rewardImages?.length > 0 ? r.rewardId.rewardImages : r.rewardId?.rewardImage ? [r.rewardId.rewardImage] : [];
              return (
                <div key={r._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 cursor-pointer active:scale-[0.99] transition-transform" onClick={() => navigate(`/redemptions/${r._id}`, { state: { redemption: r } })}>
                  <div className="flex gap-3 items-start">
                    {/* Reward thumbnail */}
                    <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                      {images.length > 0 ? (
                        <img src={images[0]} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = "none"; }} />
                      ) : (
                        <CheckSquare size={20} className="text-gray-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-bold text-gray-900 text-sm truncate">{r.rewardId?.rewardName || "Reward"}</p>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full capitalize border shrink-0 ${statusStyle[r.status]}`}>{r.status}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{r.userId?.name} • {r.userId?.mobile}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{new Date(r.createdAt).toLocaleDateString()}</p>
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs bg-[#E3EBFB] text-[#0f4089] font-bold px-2 py-0.5 rounded-lg">Wallet: {r.userId?.walletPoints} pts</span>
                        <span className="text-xs bg-orange-50 text-orange-500 font-bold px-2 py-0.5 rounded-lg">-{r.pointsUsed} pts</span>
                      </div>
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

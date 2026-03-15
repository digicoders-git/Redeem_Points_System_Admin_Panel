import { useState, useEffect } from "react";
import api from "../api/axios";
import { Info, CheckCircle, XCircle } from "lucide-react";
import Swal from "sweetalert2";

export default function AdminRedemptions() {
  const [redemptions, setRedemptions] = useState([]);
  const [filter, setFilter] = useState("all");
  const [reason, setReason] = useState({});

  const load = () =>
    api
      .get("/rewards/admin/redemptions", { params: filter !== "all" ? { status: filter } : {} })
      .then(({ data }) => setRedemptions(data.redemptions || []));

  useEffect(() => { load(); }, [filter]);

  const approve = async (id) => {
    const res = await Swal.fire({ title: "Approve Redemption?", icon: "question", showCancelButton: true, confirmButtonText: "Yes, Approve", confirmButtonColor: "#22c55e" });
    if (!res.isConfirmed) return;
    await api.patch(`/rewards/admin/redemptions/${id}/approve`);
    Swal.fire({ icon: "success", title: "Approved!", timer: 1200, showConfirmButton: false });
    load();
  };

  // API field is "rejectionReason"
  const reject = async (id) => {
    const res = await Swal.fire({ title: "Reject Redemption?", icon: "warning", showCancelButton: true, confirmButtonText: "Yes, Reject", confirmButtonColor: "#ef4444" });
    if (!res.isConfirmed) return;
    await api.patch(`/rewards/admin/redemptions/${id}/reject`, { rejectionReason: reason[id] || "Not specified" });
    Swal.fire({ icon: "info", title: "Rejected", timer: 1200, showConfirmButton: false });
    load();
  };

  const statusStyle = {
    pending: "bg-amber-100 text-amber-600",
    approved: "bg-green-100 text-green-600",
    rejected: "bg-red-100 text-red-500",
  };

  return (
    <div className="px-4 py-6 pb-24">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Redemptions</h2>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {["all", "pending", "approved", "rejected"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize whitespace-nowrap transition ${
              filter === f ? "bg-slate-800 text-white" : "bg-gray-100 text-gray-500"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {redemptions.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-8">No redemptions found</p>
        )}
        {redemptions.map((r) => (
          <div key={r._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                {/* populated as rewardId */}
                <p className="font-semibold text-gray-800">{r.rewardId?.rewardName || "Reward"}</p>
                <p className="text-xs text-gray-400">{r.userId?.name} • {r.userId?.mobile}</p>
                <p className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</p>
                <p className="text-xs text-red-400 font-semibold mt-1">-{r.pointsUsed} pts</p>
                <p className="text-xs text-gray-400">Wallet: {r.userId?.walletPoints} pts</p>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusStyle[r.status]}`}>
                {r.status}
              </span>
            </div>

            {r.rejectionReason && (
              <p className="text-xs text-red-400 mb-2 flex items-center gap-1"><Info size={14} /> {r.rejectionReason}</p>
            )}

            {r.status === "pending" && (
              <div className="space-y-2 mt-2">
                <input
                  placeholder="Rejection reason (optional)"
                  value={reason[r._id] || ""}
                  onChange={(e) => setReason({ ...reason, [r._id]: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-slate-300"
                />
                <div className="flex gap-2">
                  <button onClick={() => approve(r._id)} className="flex-1 bg-green-500 text-white py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5">
                    <CheckCircle size={14} /> Approve
                  </button>
                  <button onClick={() => reject(r._id)} className="flex-1 bg-red-500 text-white py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5">
                    <XCircle size={14} /> Reject
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

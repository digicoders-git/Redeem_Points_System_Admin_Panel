import { useState } from "react";
import { ArrowLeft, Gift, Info, Loader2, CheckCircle, XCircle } from "lucide-react";
import api from "../api/axios";
import Swal from "sweetalert2";

const statusStyle = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  approved: "bg-green-100 text-green-700 border-green-200",
  rejected: "bg-red-100 text-red-600 border-red-200",
  delivered: "bg-blue-100 text-blue-700 border-blue-200",
};

export default function RedemptionDetail({ redemption: initialR, onBack }) {
  const [r, setR] = useState(initialR);
  const [reason, setReason] = useState("");
  const [actionId, setActionId] = useState(null);

  const images = r.rewardId?.rewardImages?.length > 0 ? r.rewardId.rewardImages : r.rewardId?.rewardImage ? [r.rewardId.rewardImage] : [];

  const approve = async () => {
    const res = await Swal.fire({ title: "Approve Redemption?", icon: "question", showCancelButton: true, confirmButtonText: "Yes, Approve", confirmButtonColor: "#22c55e" });
    if (!res.isConfirmed) return;
    setActionId("approve");
    await api.patch(`/rewards/admin/redemptions/${r._id}/approve`);
    setR((prev) => ({ ...prev, status: "approved" }));
    setActionId(null);
    Swal.fire({ icon: "success", title: "Approved!", timer: 1200, showConfirmButton: false });
  };

  const reject = async () => {
    const res = await Swal.fire({ title: "Reject Redemption?", icon: "warning", showCancelButton: true, confirmButtonText: "Yes, Reject", confirmButtonColor: "#ef4444" });
    if (!res.isConfirmed) return;
    setActionId("reject");
    await api.patch(`/rewards/admin/redemptions/${r._id}/reject`, { rejectionReason: reason || "Not specified" });
    setR((prev) => ({ ...prev, status: "rejected", rejectionReason: reason || "Not specified" }));
    setActionId(null);
    Swal.fire({ icon: "info", title: "Rejected", timer: 1200, showConfirmButton: false });
  };

  const deliver = async () => {
    const res = await Swal.fire({ title: "Mark as Delivered?", icon: "question", showCancelButton: true, confirmButtonText: "Yes, Delivered", confirmButtonColor: "#3b82f6" });
    if (!res.isConfirmed) return;
    setActionId("deliver");
    await api.patch(`/rewards/admin/redemptions/${r._id}/deliver`);
    setR((prev) => ({ ...prev, status: "delivered" }));
    setActionId(null);
    Swal.fire({ icon: "success", title: "Delivered!", timer: 1200, showConfirmButton: false });
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] font-sans">
      <div className="flex items-center gap-3 px-4 py-4 bg-white border-b border-gray-100 sticky top-0 z-10">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 transition text-gray-600">
          <ArrowLeft size={20} />
        </button>
        <h2 className="font-bold text-lg text-gray-800">Redemption Details</h2>
      </div>

      <div className="p-5 space-y-4 pb-10">
        {/* Reward image + name */}
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
          <div className="w-full bg-gray-50 flex items-center justify-center h-48">
            {images.length > 0 ? (
              <img src={images[0]} alt={r.rewardId?.rewardName} className="h-full w-full object-contain p-4" onError={(e) => { e.target.style.display = "none"; }} />
            ) : (
              <Gift size={64} className="text-gray-200" />
            )}
          </div>
          <div className="p-4">
            <h2 className="font-bold text-gray-900 text-lg">{r.rewardId?.rewardName || "Reward"}</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-xs font-bold px-3 py-1 rounded-full capitalize border ${statusStyle[r.status]}`}>{r.status}</span>
              <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* User + Points */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 space-y-3">
          {[
            ["User", r.userId?.name],
            ["Mobile", r.userId?.mobile],
            ["Wallet Points", `${r.userId?.walletPoints} pts`],
            ["Points Used", `-${r.pointsUsed} pts`],
          ].map(([label, val], i, arr) => (
            <div key={label} className={`flex justify-between items-center ${i !== arr.length - 1 ? "border-b border-gray-100 pb-3" : ""}`}>
              <span className="text-sm text-gray-500 font-medium">{label}</span>
              <span className={`text-sm font-bold ${label === "Points Used" ? "text-orange-500" : "text-gray-900"}`}>{val}</span>
            </div>
          ))}
        </div>

        {/* Rejection reason */}
        {r.rejectionReason && (
          <div className="bg-red-50 rounded-2xl p-4 border border-red-100 flex items-start gap-3">
            <Info size={16} className="text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-1">Rejection Reason</p>
              <p className="text-sm text-red-600 font-medium">{r.rejectionReason}</p>
            </div>
          </div>
        )}

        {/* Actions */}
        {r.status === "pending" && (
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-3">
            <input placeholder="Rejection reason (optional)" value={reason} onChange={(e) => setReason(e.target.value)} className="w-full border-2 border-white bg-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-200" />
            <div className="grid grid-cols-2 gap-2">
              <button onClick={approve} disabled={!!actionId} className="bg-green-500 text-white py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 disabled:opacity-60 active:scale-95">
                {actionId === "approve" ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} />} Approve
              </button>
              <button onClick={reject} disabled={!!actionId} className="bg-red-500 text-white py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 disabled:opacity-60 active:scale-95">
                {actionId === "reject" ? <Loader2 size={15} className="animate-spin" /> : <XCircle size={15} />} Reject
              </button>
            </div>
          </div>
        )}

        {r.status === "approved" && (
          <button onClick={deliver} disabled={!!actionId} className="w-full bg-blue-500 text-white py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60 active:scale-95">
            {actionId === "deliver" ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} />} Mark as Delivered
          </button>
        )}
      </div>
    </div>
  );
}

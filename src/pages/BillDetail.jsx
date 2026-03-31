import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, ExternalLink, Image, Pencil, Info, Loader2, CheckCircle, XCircle } from "lucide-react";
import api from "../api/axios";
import Swal from "sweetalert2";

const statusStyle = {
  pending: "bg-amber-100 text-amber-600 border-amber-200",
  approved: "bg-green-100 text-green-600 border-green-200",
  rejected: "bg-red-100 text-red-500 border-red-200",
};

export default function BillDetail() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [bill, setBill] = useState(state?.bill);
  const [editingAmount, setEditingAmount] = useState(false);
  const [newAmount, setNewAmount] = useState("");
  const [amountSaving, setAmountSaving] = useState(false);
  const [reason, setReason] = useState("");
  const [actionId, setActionId] = useState(null);
  const [fullScreen, setFullScreen] = useState(false);

  if (!bill) { navigate("/bills", { replace: true }); return null; }

  const isPdf = (url) => url?.toLowerCase().includes(".pdf");

  const approve = async () => {
    const res = await Swal.fire({ title: "Approve Bill?", icon: "question", showCancelButton: true, confirmButtonText: "Yes, Approve", confirmButtonColor: "#22c55e" });
    if (!res.isConfirmed) return;
    setActionId("approve");
    await api.patch(`/bills/admin/${bill._id}/approve`);
    setBill((b) => ({ ...b, status: "approved" }));
    setActionId(null);
    Swal.fire({ icon: "success", title: "Approved!", timer: 1200, showConfirmButton: false });
  };

  const reject = async () => {
    const res = await Swal.fire({ title: "Reject Bill?", icon: "warning", showCancelButton: true, confirmButtonText: "Yes, Reject", confirmButtonColor: "#ef4444" });
    if (!res.isConfirmed) return;
    setActionId("reject");
    await api.patch(`/bills/admin/${bill._id}/reject`, { rejectionReason: reason || "Not specified" });
    setBill((b) => ({ ...b, status: "rejected", rejectionReason: reason || "Not specified" }));
    setActionId(null);
    Swal.fire({ icon: "info", title: "Rejected", timer: 1200, showConfirmButton: false });
  };

  const saveAmount = async () => {
    if (!newAmount || isNaN(newAmount) || Number(newAmount) <= 0) return;
    setAmountSaving(true);
    try {
      const { data } = await api.patch(`/bills/admin/${bill._id}/edit-amount`, { amount: Number(newAmount) });
      setBill((b) => ({ ...b, amount: data.bill.amount }));
      setEditingAmount(false);
      Swal.fire({ icon: "success", title: "Amount Updated!", timer: 1200, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Failed", text: err.response?.data?.message || "Could not update" });
    } finally {
      setAmountSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] font-sans">
      <div className="flex items-center gap-3 px-4 py-4 bg-white border-b border-gray-100 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 transition text-gray-600">
          <ArrowLeft size={20} />
        </button>
        <h2 className="font-bold text-lg text-gray-800">Bill Details</h2>
      </div>

      <div className="p-5 space-y-4 pb-10">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-[#0f4089] to-[#1a4187] rounded-2xl p-4 text-white">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-white/70 uppercase tracking-wider">Amount</p>
              {bill.status === "pending" && !editingAmount && (
                <button onClick={() => { setEditingAmount(true); setNewAmount(bill.amount); }} className="bg-white/10 p-1.5 rounded-lg">
                  <Pencil size={13} className="text-white" />
                </button>
              )}
            </div>
            {editingAmount ? (
              <input type="number" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} className="w-full bg-white/20 border border-white/30 text-white rounded-xl px-3 py-1.5 text-lg font-bold focus:outline-none mt-1" autoFocus />
            ) : (
              <p className="text-3xl font-extrabold mt-1">₹{bill.amount}</p>
            )}
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Status</p>
            <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-bold capitalize border ${statusStyle[bill.status]}`}>{bill.status}</span>
          </div>
        </div>

        {editingAmount && (
          <div className="grid grid-cols-2 gap-2">
            <button onClick={saveAmount} disabled={amountSaving} className="bg-[#0f4089] text-white py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 disabled:opacity-60">
              {amountSaving ? <Loader2 size={15} className="animate-spin" /> : null} Save
            </button>
            <button onClick={() => setEditingAmount(false)} className="bg-white border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-bold">Cancel</button>
          </div>
        )}

        <div className="bg-white rounded-2xl p-5 border border-gray-100 space-y-3">
          {[
            ["Store/Item", bill.billName],
            ["Bill No", `#${bill.billNumber}`],
            ["User", bill.userId?.name],
            ["Mobile", bill.userId?.mobile],
            ["Date", new Date(bill.date || bill.createdAt).toLocaleDateString()],
          ].map(([label, val], i, arr) => (
            <div key={label} className={`flex justify-between items-center gap-3 ${i !== arr.length - 1 ? "border-b border-gray-100 pb-3" : ""}`}>
              <span className="text-sm text-gray-500 font-medium shrink-0">{label}</span>
              <span className="text-sm font-bold text-gray-900 text-right break-all">{val}</span>
            </div>
          ))}
          {bill.pointsEarned > 0 && (
            <div className="flex justify-between items-center border-t border-gray-100 pt-3">
              <span className="text-sm text-gray-500 font-medium">Points Earned</span>
              <span className="font-extrabold text-orange-500 text-sm px-2.5 py-1 bg-orange-50 rounded-lg">+{bill.pointsEarned} pts</span>
            </div>
          )}
        </div>

        {bill.rejectionReason && (
          <div className="bg-red-50 rounded-2xl p-4 border border-red-100 flex items-start gap-3">
            <Info size={16} className="text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-1">Rejection Reason</p>
              <p className="text-sm text-red-600 font-medium">{bill.rejectionReason}</p>
            </div>
          </div>
        )}

        {bill.status === "pending" && (
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

        {bill.billImage && (
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Attachment</p>
            {isPdf(bill.billImage) ? (
              <div className="flex flex-col items-center gap-4 bg-[#F5F7FA] rounded-2xl p-6">
                <FileText size={52} className="text-red-400" />
                <a href={bill.billImage} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#0f4089] text-white px-5 py-3 rounded-xl text-sm font-bold active:scale-95">
                  <ExternalLink size={16} /> Open PDF
                </a>
              </div>
            ) : (
              <div className="space-y-3">
                <img src={bill.billImage} alt="bill" className="w-full rounded-xl object-contain max-h-64 cursor-zoom-in" onClick={() => setFullScreen(true)} />
                <a href={bill.billImage} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-[#F5F7FA] border border-gray-200 text-gray-700 font-bold px-4 py-3 rounded-xl text-sm w-full active:scale-95">
                  <Image size={16} /> Open Original
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {fullScreen && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4" onClick={() => setFullScreen(false)}>
          <img src={bill.billImage} alt="Full" className="w-full h-full object-contain" />
          <button className="absolute top-6 left-6 bg-white/10 p-3 rounded-full text-white" onClick={() => setFullScreen(false)}>
            <ArrowLeft size={22} />
          </button>
        </div>
      )}
    </div>
  );
}

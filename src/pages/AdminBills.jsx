import { useState, useEffect } from "react";
import api from "../api/axios";
import { Info, CheckCircle, XCircle } from "lucide-react";

export default function AdminBills() {
  const [bills, setBills] = useState([]);
  const [filter, setFilter] = useState("all");
  const [reason, setReason] = useState({});

  const load = () =>
    api
      .get("/bills/admin/all", { params: filter !== "all" ? { status: filter } : {} })
      .then(({ data }) => setBills(data.bills || []));

  useEffect(() => { load(); }, [filter]);

  const approve = async (id) => {
    await api.patch(`/bills/admin/${id}/approve`);
    load();
  };

  // API field is "rejectionReason"
  const reject = async (id) => {
    await api.patch(`/bills/admin/${id}/reject`, {
      rejectionReason: reason[id] || "Not specified",
    });
    load();
  };

  const statusStyle = {
    pending: "bg-amber-100 text-amber-600",
    approved: "bg-green-100 text-green-600",
    rejected: "bg-red-100 text-red-500",
  };

  return (
    <div className="px-4 py-6 pb-24">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Bills</h2>

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
        {bills.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-8">No bills found</p>
        )}
        {bills.map((b) => (
          <div key={b._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-semibold text-gray-800">₹{b.amount}</p>
                <p className="text-xs text-gray-500 font-medium">{b.billName}</p>
                <p className="text-xs text-gray-400">#{b.billNumber}</p>
                <p className="text-xs text-gray-400">{b.userId?.name || "User"} • {b.userId?.mobile}</p>
                <p className="text-xs text-gray-400">{new Date(b.date || b.createdAt).toLocaleDateString()}</p>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusStyle[b.status]}`}>
                {b.status}
              </span>
            </div>

            {b.billImage && (
              <img src={b.billImage} alt="bill" className="w-full h-36 object-cover rounded-xl mb-3" />
            )}

            {b.rejectionReason && (
              <p className="text-xs text-red-400 mb-2 flex items-center gap-1"><Info size={14} /> {b.rejectionReason}</p>
            )}

            {b.status === "pending" && (
              <div className="space-y-2">
                <input
                  placeholder="Rejection reason (optional)"
                  value={reason[b._id] || ""}
                  onChange={(e) => setReason({ ...reason, [b._id]: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-slate-300"
                />
                <div className="flex gap-2">
                  <button onClick={() => approve(b._id)} className="flex-1 bg-green-500 text-white py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5">
                    <CheckCircle size={14} /> Approve
                  </button>
                  <button onClick={() => reject(b._id)} className="flex-1 bg-red-500 text-white py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5">
                    <XCircle size={14} /> Reject
                  </button>
                </div>
              </div>
            )}

            {b.pointsEarned > 0 && (
              <p className="text-xs text-violet-600 font-semibold mt-2">+{b.pointsEarned} points awarded</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

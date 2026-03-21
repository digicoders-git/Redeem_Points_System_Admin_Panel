import { useState, useEffect } from "react";
import api from "../api/axios";
import { Coins, Loader2, Users as UsersIcon } from "lucide-react";
import Swal from "sweetalert2";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState(null);

  const load = () => {
    setLoading(true);
    api.get("/users/admin/all")
      .then(({ data }) => setUsers(data.users || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const toggle = async (user) => {
    const action = user.isActive ? "Deactivate" : "Activate";
    const res = await Swal.fire({ title: `${action} User?`, icon: "question", showCancelButton: true, confirmButtonText: `Yes, ${action}`, confirmButtonColor: user.isActive ? "#ef4444" : "#22c55e" });
    if (!res.isConfirmed) return;
    setActionId(user._id);
    await api.patch(`/users/admin/${user._id}/status`, { isActive: !user.isActive });
    setActionId(null);
    Swal.fire({ icon: "success", title: `User ${action}d!`, timer: 1200, showConfirmButton: false });
    load();
  };

  const remove = async (id) => {
    const res = await Swal.fire({ title: "Delete User?", text: "This cannot be undone!", icon: "warning", showCancelButton: true, confirmButtonText: "Yes, Delete", confirmButtonColor: "#ef4444" });
    if (!res.isConfirmed) return;
    setActionId(id);
    await api.delete(`/users/admin/${id}`);
    setActionId(null);
    Swal.fire({ icon: "success", title: "Deleted!", timer: 1200, showConfirmButton: false });
    load();
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] font-sans pb-24">
      {/* Top Header Background */}
      <div className="bg-[#0f4089] rounded-b-[40px] px-6 pt-10 pb-12 mb-6 relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold text-2xl tracking-wide mb-1">Users List</h1>
            <p className="text-white/80 font-medium text-sm">Total: {users.length}</p>
          </div>
          <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm border border-white/20">
            <UsersIcon className="text-white" size={24} />
          </div>
        </div>
      </div>

      <div className="px-5">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 size={32} className="animate-spin text-[#0f4089]" />
          </div>
        ) : (
          <div className="space-y-4">
            {users.length === 0 && (
              <div className="bg-white rounded-[24px] p-10 text-center border border-gray-100 shadow-sm">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <UsersIcon size={28} className="text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium">No users found</p>
              </div>
            )}
            
            {users.map((u) => (
              <div key={u._id} className="bg-white rounded-[24px] shadow-[0_4px_20px_rgb(0,0,0,0.04)] border border-gray-100 px-5 py-5 transition hover:shadow-md">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-extrabold text-gray-900 text-[16px]">{u.name}</p>
                    <p className="text-[13px] text-gray-500 font-medium">{u.email}</p>
                    <p className="text-[13px] text-gray-500 font-medium mt-0.5">{u.mobile}</p>
                    <div className="inline-flex mt-3 bg-[#E3EBFB] text-[#0f4089] px-3 py-1 rounded-xl text-[12px] font-bold items-center gap-1.5">
                      <Coins size={14} className="text-[#f97316]" /> {u.walletPoints || 0} Points
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <span className={`text-[11px] font-bold px-3 py-1.5 rounded-full border ${u.isActive ? "bg-green-50 text-green-600 border-green-200" : "bg-red-50 text-red-500 border-red-200"}`}>
                      {u.isActive ? "Active" : "Inactive"}
                    </span>
                    <div className="flex flex-col gap-2 mt-1">
                      <button
                        onClick={() => toggle(u)}
                        disabled={actionId === u._id}
                        className="text-[11px] bg-amber-50 text-amber-600 border border-amber-200 px-3 py-1.5 rounded-xl font-bold transition active:scale-95 disabled:opacity-60 flex justify-center items-center gap-1 min-w-[80px]"
                      >
                        {actionId === u._id ? <Loader2 size={12} className="animate-spin" /> : null}
                        {u.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => remove(u._id)}
                        disabled={actionId === u._id}
                        className="text-[11px] bg-red-50 text-red-500 border border-red-200 px-3 py-1.5 rounded-xl font-bold transition active:scale-95 disabled:opacity-60 flex justify-center items-center gap-1 min-w-[80px]"
                      >
                        {actionId === u._id ? <Loader2 size={12} className="animate-spin" /> : null}
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

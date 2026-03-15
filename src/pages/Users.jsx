import { useState, useEffect } from "react";
import api from "../api/axios";
import { Coins } from "lucide-react";
import Swal from "sweetalert2";

export default function Users() {
  const [users, setUsers] = useState([]);

  const load = () =>
    api.get("/users/admin/all").then(({ data }) => setUsers(data.users || []));

  useEffect(() => { load(); }, []);

  const toggle = async (user) => {
    const action = user.isActive ? "Deactivate" : "Activate";
    const res = await Swal.fire({ title: `${action} User?`, icon: "question", showCancelButton: true, confirmButtonText: `Yes, ${action}`, confirmButtonColor: user.isActive ? "#ef4444" : "#22c55e" });
    if (!res.isConfirmed) return;
    await api.patch(`/users/admin/${user._id}/status`, { isActive: !user.isActive });
    Swal.fire({ icon: "success", title: `User ${action}d!`, timer: 1200, showConfirmButton: false });
    load();
  };

  const remove = async (id) => {
    const res = await Swal.fire({ title: "Delete User?", text: "This cannot be undone!", icon: "warning", showCancelButton: true, confirmButtonText: "Yes, Delete", confirmButtonColor: "#ef4444" });
    if (!res.isConfirmed) return;
    await api.delete(`/users/admin/${id}`);
    Swal.fire({ icon: "success", title: "Deleted!", timer: 1200, showConfirmButton: false });
    load();
  };

  return (
    <div className="px-4 py-6 pb-24">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Users ({users.length})</h2>

      <div className="space-y-3">
        {users.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-8">No users found</p>
        )}
        {users.map((u) => (
          <div key={u._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-gray-800">{u.name}</p>
                <p className="text-xs text-gray-400">{u.email}</p>
                <p className="text-xs text-gray-400">{u.mobile}</p>
                <p className="text-xs text-violet-600 font-semibold mt-1 flex items-center gap-1">
                  <Coins size={14} /> {u.walletPoints || 0} pts
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${u.isActive ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500"}`}>
                  {u.isActive ? "Active" : "Inactive"}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggle(u)}
                    className="text-xs bg-amber-50 text-amber-600 px-2.5 py-1 rounded-lg font-medium"
                  >
                    {u.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => remove(u._id)}
                    className="text-xs bg-red-50 text-red-500 px-2.5 py-1 rounded-lg font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

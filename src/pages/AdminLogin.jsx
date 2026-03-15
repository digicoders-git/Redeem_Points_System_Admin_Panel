import { useState } from "react";
import api from "../api/axios";
import { ShieldCheck } from "lucide-react";
import Swal from "sweetalert2";

export default function AdminLogin() {
  const [form, setForm] = useState({ adminId: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr("");
    try {
      const { data } = await api.post("/admin/login", form);
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminInfo", JSON.stringify(data.admin));
      await Swal.fire({ icon: "success", title: "Login Successful", text: "Welcome back!", timer: 1500, showConfirmButton: false });
      window.location.reload();
    } catch (e) {
      const msg = e.response?.data?.message || "Login failed";
      setErr(msg);
      Swal.fire({ icon: "error", title: "Login Failed", text: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8">
        <div className="text-center mb-6 flex flex-col items-center">
          <div className="text-slate-800 mb-3"><ShieldCheck size={48} /></div>
          <h2 className="text-2xl font-bold text-gray-800">Admin Panel</h2>
          <p className="text-gray-500 text-sm mt-1">Sign in to manage the system</p>
        </div>

        {err && (
          <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-2 mb-4 text-center">
            {err}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <input
            placeholder="Admin ID"
            value={form.adminId}
            onChange={(e) => setForm({ ...form, adminId: e.target.value })}
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold py-3 rounded-xl transition disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

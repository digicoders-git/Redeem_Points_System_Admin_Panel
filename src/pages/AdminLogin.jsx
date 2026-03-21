import { useState } from "react";
import api from "../api/axios";
import { ShieldCheck, Loader2 } from "lucide-react";
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
    <div className="min-h-screen bg-[#F5F7FA] font-sans flex flex-col items-center">
      {/* Top Header Background */}
      <div className="w-full max-w-lg bg-[#0f4089] rounded-b-[40px] px-6 pt-16 pb-32 relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-6">
            <span className="text-[#0f4089] font-extrabold text-4xl">C</span>
            <span className="w-3 h-3 bg-[#f97316] rounded-full absolute ml-8 mt-8"></span>
          </div>
          <h1 className="text-white font-bold text-2xl tracking-wide">Cable Sansar</h1>
          <p className="text-white/80 font-medium text-sm mt-1">Admin Portal</p>
        </div>
      </div>

      <div className="w-full max-w-sm px-5 -mt-28 relative z-20">
        <div className="bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-8 border border-gray-100">
          <div className="text-center mb-6 flex flex-col items-center">
            <div className="w-12 h-12 bg-[#0f4089]/5 text-[#0f4089] rounded-2xl flex items-center justify-center mb-3">
              <ShieldCheck size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Sign In</h2>
          </div>

          {err && (
            <div className="bg-red-50 text-red-600 text-[13px] font-semibold rounded-xl px-4 py-3 mb-5 border border-red-100 flex items-center justify-center text-center">
              {err}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5 block ml-1">Admin ID</label>
              <input
                placeholder="Enter ID"
                value={form.adminId}
                onChange={(e) => setForm({ ...form, adminId: e.target.value })}
                required
                className="w-full border-2 border-gray-100 bg-[#F5F7FA] rounded-2xl px-5 py-3.5 text-[15px] font-semibold text-gray-800 focus:outline-none focus:border-[#0f4089]/30 transition-colors"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5 block ml-1">Password</label>
              <input
                type="password"
                placeholder="Enter Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                className="w-full border-2 border-gray-100 bg-[#F5F7FA] rounded-2xl px-5 py-3.5 text-[15px] font-semibold text-gray-800 focus:outline-none focus:border-[#0f4089]/30 transition-colors"
              />
            </div>
            
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#f97316] hover:bg-[#eb6a10] active:scale-[0.98] text-white font-bold text-[16px] py-4 rounded-[16px] shadow-[0_5px_15px_rgba(249,115,22,0.3)] transition-all flex justify-center items-center gap-2 disabled:opacity-60 disabled:shadow-none"
              >
                {loading ? <><Loader2 size={20} className="animate-spin" /> Signing in...</> : "Sign In"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

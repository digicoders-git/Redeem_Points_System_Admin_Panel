import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock } from "lucide-react";

const PRIVACY_POINTS = [
  {
    title: "Information We Collect",
    text: "We collect your name, mobile number, and bill information to operate the rewards program.",
  },
  {
    title: "How We Use Your Data",
    text: "Your personal data is used solely for managing your account, processing reward points, and improving our services.",
  },
  {
    title: "Data Sharing",
    text: "We do not sell, trade, or share your personal information with third parties without your consent.",
  },
  {
    title: "Bill Images",
    text: "Bill images uploaded by you are stored securely and used only for verification purposes by our admin team.",
  },
  {
    title: "Data Security",
    text: "We use industry-standard security measures to protect your data from unauthorized access, alteration, or disclosure.",
  },
  {
    title: "Account Deletion",
    text: "You may request deletion of your account and associated data by contacting our support team.",
  },
  {
    title: "Cookies & Storage",
    text: "We use local storage to keep you logged in and remember your preferences. No tracking cookies are used.",
  },
  {
    title: "Changes to Policy",
    text: "Cable Sansar reserves the right to update this privacy policy at any time. Continued use of the app implies acceptance.",
  },
  {
    title: "Contact Us",
    text: "For any privacy-related concerns, please contact us through the official Cable Sansar support channel.",
  },
];

export default function AdminPrivacyPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F5F7FA] font-sans pb-10">
      <div className="flex items-center gap-3 px-4 py-4 bg-white border-b border-gray-100 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 transition text-gray-600">
          <ArrowLeft size={20} />
        </button>
        <h2 className="font-bold text-lg text-gray-800">Privacy Policy</h2>
      </div>

      <div className="px-4 pt-5">
        <div className="bg-[#0f4089] rounded-2xl p-5 mb-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
            <Lock size={22} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-base">Your Privacy Matters</p>
            <p className="text-white/70 text-xs mt-0.5">Last updated: January 2025</p>
          </div>
        </div>

        <div className="space-y-3">
          {PRIVACY_POINTS.map((p, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#E3EBFB] text-[#0f4089] text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                <div>
                  <p className="text-sm font-bold text-gray-900 mb-1">{p.title}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{p.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6 px-4">
          © 2025 Cable Sansar. All rights reserved.
        </p>
      </div>
    </div>
  );
}

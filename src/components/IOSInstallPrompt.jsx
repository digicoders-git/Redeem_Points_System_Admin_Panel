import { useState, useEffect } from "react";
import { Share, X, Plus, Home } from "lucide-react";

export default function IOSInstallPrompt() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
    const dismissed = localStorage.getItem("iosInstallDismissed");

    if (isIOS && !isStandalone && !dismissed) {
      setTimeout(() => setShow(true), 2000);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem("iosInstallDismissed", "true");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-[100] flex items-end justify-center backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-t-[32px] p-6 pb-8 shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-900 text-lg">Install App</h3>
          <button onClick={dismiss} className="p-2 rounded-full hover:bg-gray-100 bg-gray-50 transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <p className="text-gray-600 text-sm mb-6">
          Install this app on your iPhone for quick access and a better experience.
        </p>

        <div className="space-y-4">
          <div className="flex items-start gap-4 bg-[#F5F7FA] rounded-2xl p-4 border border-gray-100">
            <div className="bg-slate-800 p-2.5 rounded-xl shrink-0">
              <Share size={20} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm mb-1">Step 1</p>
              <p className="text-gray-600 text-sm">
                Tap the <span className="font-bold">Share</span> button at the bottom of Safari
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 bg-[#F5F7FA] rounded-2xl p-4 border border-gray-100">
            <div className="bg-slate-800 p-2.5 rounded-xl shrink-0">
              <Plus size={20} className="text-white" strokeWidth={3} />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm mb-1">Step 2</p>
              <p className="text-gray-600 text-sm">
                Scroll and tap <span className="font-bold">"Add to Home Screen"</span>
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 bg-[#F5F7FA] rounded-2xl p-4 border border-gray-100">
            <div className="bg-slate-800 p-2.5 rounded-xl shrink-0">
              <Home size={20} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm mb-1">Step 3</p>
              <p className="text-gray-600 text-sm">
                Tap <span className="font-bold">"Add"</span> to install the app
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={dismiss}
          className="w-full bg-slate-800 text-white font-bold py-3.5 rounded-xl mt-6 active:scale-95 transition"
        >
          Got it
        </button>
      </div>
    </div>
  );
}

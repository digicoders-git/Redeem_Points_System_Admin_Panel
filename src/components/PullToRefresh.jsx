import { useState } from "react";
import { RefreshCw } from "lucide-react";

export default function PullToRefresh({ children }) {
  const [startY, setStartY] = useState(0);
  const [pulling, setPulling] = useState(false);
  const [pullDist, setPullDist] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const handleTouchStart = (e) => {
    if (window.scrollY === 0) {
      setStartY(e.touches[0].clientY);
      setPulling(true);
    }
  };

  const handleTouchMove = (e) => {
    if (!pulling || refreshing) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY;
    if (diff > 0 && window.scrollY <= 0) {
      setPullDist(Math.min(diff * 0.4, 100));
    } else {
      setPullDist(0);
    }
  };

  const handleTouchEnd = () => {
    if (pullDist > 60 && !refreshing) {
      setRefreshing(true);
      setPullDist(60);
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } else {
      setPullDist(0);
      setPulling(false);
    }
  };

  return (
    <div 
      className="w-full h-full"
      onTouchStart={handleTouchStart} 
      onTouchMove={handleTouchMove} 
      onTouchEnd={handleTouchEnd}
    >
      <div 
        className="fixed left-1/2 -ml-5 z-[100] transition-all duration-200 pointer-events-none"
        style={{ 
          top: `max(-50px, ${refreshing ? 30 : pullDist - 40}px)`, 
          opacity: pullDist > 10 || refreshing ? 1 : 0 
        }}
      >
        <div 
          className="bg-white rounded-full p-2.5 shadow-[0_4px_15px_rgba(0,0,0,0.15)] flex items-center justify-center border border-gray-50"
          style={{ transform: `rotate(${pullDist * 4}deg)` }}
        >
          <RefreshCw size={20} strokeWidth={2.5} className={`text-[#0f4089] ${refreshing ? "animate-spin" : ""}`} />
        </div>
      </div>
      {children}
    </div>
  );
}

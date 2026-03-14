import { useState } from "react";
import AdminLogin from "./pages/AdminLogin";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import AdminBills from "./pages/AdminBills";
import AdminRewards from "./pages/AdminRewards";
import AdminRedemptions from "./pages/AdminRedemptions";
import BottomNav from "./components/BottomNav";

export default function App() {
  const token = localStorage.getItem("adminToken");
  const [tab, setTab] = useState("dashboard");

  if (!token) return <AdminLogin />;

  const pages = {
    dashboard: <Dashboard />,
    users: <Users />,
    bills: <AdminBills />,
    rewards: <AdminRewards />,
    redemptions: <AdminRedemptions />,
  };

  return (
    <div className="max-w-lg mx-auto min-h-screen bg-gray-50 relative">
      {pages[tab]}
      <BottomNav active={tab} setActive={setTab} />
    </div>
  );
}

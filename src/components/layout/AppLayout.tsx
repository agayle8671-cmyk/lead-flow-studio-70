import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import FloatingOrbs from "./FloatingOrbs";

const AppLayout = () => {
  return (
    <div className="min-h-screen flex w-full relative">
      {/* Floating orbs background */}
      <FloatingOrbs />

      {/* Sidebar */}
      <AppSidebar />

      {/* Main content */}
      <main className="flex-1 overflow-auto relative z-10">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;

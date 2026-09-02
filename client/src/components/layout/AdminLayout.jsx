/**
 * components/layout/AdminLayout.jsx — shell for admin pages.
 */
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function AdminLayout() {
  return (
    <div className="md:flex md:items-start">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6">
        <Outlet />
      </main>
    </div>
  );
}

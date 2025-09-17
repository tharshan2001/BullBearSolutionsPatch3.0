import { Link, Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="p-4 text-2xl font-bold">Admin Panel</div>
        <nav className="flex flex-col gap-2 p-4">
          <Link className="hover:bg-gray-700 p-2 rounded" to="/dashboard">Dashboard</Link>
          <Link className="hover:bg-gray-700 p-2 rounded" to="/users">Users</Link>
          <Link className="hover:bg-gray-700 p-2 rounded" to="/settings">Settings</Link>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-gray-200 p-4 shadow">Header</header>
        <main className="flex-1 p-4 overflow-auto">
          <Outlet /> {/* Render nested routes */}
        </main>
      </div>
    </div>
  );
}

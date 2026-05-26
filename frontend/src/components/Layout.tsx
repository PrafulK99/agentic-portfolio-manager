import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-surface">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Top Navigation */}
        <TopNav />

        {/* Page Content */}
        <div className="flex-1 p-margin-mobile md:p-margin-desktop max-w-container-max mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
import { Link, useLocation } from 'react-router-dom';

interface NavItem {
  name: string;
  path: string;
  icon: string;
}

export default function Sidebar() {
  const location = useLocation();

  const navItems: NavItem[] = [
    { name: 'Dashboard', path: '/', icon: 'dashboard' },
    { name: 'Analyze Stock', path: '/analyze', icon: 'query_stats' },
    { name: 'Portfolio', path: '/portfolio', icon: 'account_balance_wallet' },
    { name: 'AI Agents', path: '/agents', icon: 'smart_toy' },
    { name: 'Watchlist', path: '/watchlist', icon: 'visibility' },
    { name: 'Reports', path: '/reports', icon: 'description' },
    { name: 'Settings', path: '/settings', icon: 'settings' },
  ];

  return (
    <aside className="hidden md:flex flex-col h-screen w-64 border-r border-outline-variant/30 bg-surface fixed left-0 top-0 p-6 space-y-4 z-40">
      {/* Logo Section */}
      <div className="mb-6">
        <h1 className="font-headline-lg text-headline-lg font-bold text-primary tracking-tight">FinAI</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg font-label-caps text-label-caps transition-all ${
                isActive
                  ? 'bg-primary-container text-on-primary-container font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container-highest'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer Section */}
      <div className="mt-auto space-y-4">
        <div className="border-t border-outline-variant/30 pt-4 space-y-2">
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-surface-container-highest transition-all rounded-lg font-label-caps text-label-caps"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            Sign Out
          </a>
        </div>
      </div>
    </aside>
  );
}

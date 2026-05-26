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
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-primary relative">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              smart_toy
            </span>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-secondary rounded-full border-2 border-surface"></div>
          </div>
          <div>
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-primary tracking-tight">
              QuantAI Pro
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Active Portfolio Agent</p>
          </div>
        </div>
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
        <button className="w-full py-2 bg-primary text-on-primary rounded-lg font-label-caps text-label-caps font-semibold hover:bg-primary/90 transition-colors">
          Upgrade to Alpha
        </button>
        <div className="border-t border-outline-variant/30 pt-4 space-y-2">
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-surface-container-highest transition-all rounded-lg font-label-caps text-label-caps"
          >
            <span className="material-symbols-outlined text-[20px]">contact_support</span>
            Support
          </a>
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

import { useState } from 'react';

export default function TopNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-surface/80 backdrop-blur-md sticky top-0 z-30 w-full border-b border-outline-variant/30 shadow-sm">
      <div className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-4 max-w-container-max mx-auto">
        {/* Left Section - Search */}
        <div className="flex items-center gap-4">
          <button
            className="md:hidden text-on-surface"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div className="relative hidden md:flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-outline">search</span>
            <input
              className="pl-10 pr-4 py-2 w-80 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-body-sm font-body-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              placeholder="Search assets, symbols, or agents..."
              type="text"
            />
          </div>
        </div>

        {/* Right Section - Icons & Profile */}
        <div className="flex items-center gap-6">
          <div className="flex gap-4 text-primary">
            <button className="hover:bg-surface-container-low transition-colors duration-200 p-2 rounded-full relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
            </button>
            <button className="hover:bg-surface-container-low transition-colors duration-200 p-2 rounded-full">
              <span className="material-symbols-outlined">help_outline</span>
            </button>
          </div>
          <div className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden border border-outline-variant/30">
            <img
              alt="User Profile"
              className="w-full h-full object-cover"
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop"
            />
          </div>
        </div>
      </div>
    </header>
  );
}

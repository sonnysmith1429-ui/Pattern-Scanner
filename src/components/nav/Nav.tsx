import { motion } from 'framer-motion';
import { ScanLine, History, Bookmark, Settings as SettingsIcon, User } from 'lucide-react';
import Logo from '../ui/Logo';

export type Screen = 'upload' | 'scanning' | 'dashboard' | 'history' | 'watchlist' | 'settings' | 'profile';

const NAV_ITEMS: { screen: Screen; label: string; icon: React.ReactNode }[] = [
  { screen: 'upload', label: 'Scan', icon: <ScanLine size={18} /> },
  { screen: 'history', label: 'History', icon: <History size={18} /> },
  { screen: 'watchlist', label: 'Watchlist', icon: <Bookmark size={18} /> },
  { screen: 'settings', label: 'Settings', icon: <SettingsIcon size={18} /> },
  { screen: 'profile', label: 'Profile', icon: <User size={18} /> },
];

function isActive(current: Screen, item: Screen) {
  if (item === 'upload') return current === 'upload' || current === 'scanning' || current === 'dashboard';
  return current === item;
}

export default function Nav({
  current,
  onNavigate,
  onLogo,
}: {
  current: Screen;
  onNavigate: (screen: Screen) => void;
  onLogo: () => void;
}) {
  return (
    <>
      {/* Desktop top nav */}
      <div className="hidden sm:flex sticky top-0 z-40 items-center justify-between px-6 py-4 glass border-x-0 border-t-0">
        <button onClick={onLogo} className="cursor-pointer">
          <Logo size={34} textClass="text-base" />
        </button>
        <div className="flex items-center gap-1 bg-white/5 rounded-full p-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(current, item.screen);
            return (
              <button
                key={item.screen}
                onClick={() => onNavigate(item.screen)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                  active ? 'text-white' : 'text-white/50 hover:text-white'
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-blue-500 rounded-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {item.icon}
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 glass border-x-0 border-b-0 px-2 pt-2 pb-[calc(env(safe-area-inset-bottom)+8px)]">
        <div className="flex items-center justify-between">
          {NAV_ITEMS.map((item) => {
            const active = isActive(current, item.screen);
            return (
              <button
                key={item.screen}
                onClick={() => onNavigate(item.screen)}
                className="flex-1 flex flex-col items-center gap-1 py-1.5 cursor-pointer"
              >
                <span className={active ? 'text-blue-400' : 'text-white/40'}>{item.icon}</span>
                <span className={`text-[10px] font-medium ${active ? 'text-blue-400' : 'text-white/40'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

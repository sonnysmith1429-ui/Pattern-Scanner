import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Landing from './components/landing/Landing';
import UploadScreen from './components/upload/UploadScreen';
import ScanningAnimation from './components/scan/ScanningAnimation';
import Dashboard from './components/dashboard/Dashboard';
import History from './components/history/History';
import Watchlist from './components/watchlist/Watchlist';
import Settings from './components/settings/Settings';
import Profile from './components/profile/Profile';
import Nav, { type Screen } from './components/nav/Nav';
import Disclaimer from './components/ui/Disclaimer';
import { generateScanResult, demoChartImage } from './lib/mockData';
import { analyzeChartImage, type ChartAnalysis } from './lib/imageAnalysis';
import type { ScanResult, WatchlistItem } from './lib/types';
import {
  loadHistory,
  saveHistory,
  loadWatchlist,
  saveWatchlist,
  loadSettings,
  saveSettings,
} from './lib/storage';

type AppScreen = 'landing' | Screen;

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('landing');
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [currentResult, setCurrentResult] = useState<ScanResult | null>(null);
  const pendingAnalysis = useRef<Promise<ChartAnalysis> | null>(null);

  const [history, setHistory] = useState<ScanResult[]>(() => loadHistory());
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(() => loadWatchlist());
  const [settings, setSettings] = useState(() => loadSettings());

  useEffect(() => {
    document.documentElement.classList.toggle('light', settings.theme === 'light');
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveHistory(history);
  }, [history]);

  useEffect(() => {
    saveWatchlist(watchlist);
  }, [watchlist]);

  function startScan(image: string, manualPrice?: number) {
    setPendingImage(image);
    pendingAnalysis.current = analyzeChartImage(image, manualPrice);
    setScreen('scanning');
  }

  async function handleScanComplete() {
    if (!pendingImage || !pendingAnalysis.current) return;
    const analysis = await pendingAnalysis.current;
    const result = generateScanResult(pendingImage, analysis);
    setCurrentResult(result);
    setHistory((h) => [result, ...h]);
    setScreen('dashboard');
  }

  function handleDemo() {
    startScan(demoChartImage());
  }

  function toggleFavourite(id: string) {
    setHistory((h) => h.map((r) => (r.id === id ? { ...r, favourite: !r.favourite } : r)));
    setCurrentResult((r) => (r && r.id === id ? { ...r, favourite: !r.favourite } : r));
  }

  function deleteScan(id: string) {
    setHistory((h) => h.filter((r) => r.id !== id));
  }

  function selectScan(id: string) {
    const found = history.find((r) => r.id === id);
    if (found) {
      setCurrentResult(found);
      setScreen('dashboard');
    }
  }

  function addWatchlistItem(item: Omit<WatchlistItem, 'id'>) {
    setWatchlist((w) => [{ ...item, id: `w_${Date.now()}` }, ...w]);
  }

  function updateWatchlistItem(id: string, patch: Partial<WatchlistItem>) {
    setWatchlist((w) => w.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }

  function deleteWatchlistItem(id: string) {
    setWatchlist((w) => w.filter((i) => i.id !== id));
  }

  const showNav = screen !== 'landing';

  return (
    <div className="min-h-[100svh] flex flex-col">
      {showNav && (
        <Nav
          current={screen as Screen}
          onNavigate={(s) => setScreen(s)}
          onLogo={() => setScreen('landing')}
        />
      )}

      <div className="flex-1 pb-20 sm:pb-0">
        <AnimatePresence mode="wait">
          {screen === 'landing' && (
            <motion.div key="landing" exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <Landing onUpload={() => setScreen('upload')} onDemo={handleDemo} />
            </motion.div>
          )}

          {screen === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <UploadScreen onBack={() => setScreen('landing')} onScan={startScan} />
            </motion.div>
          )}

          {screen === 'scanning' && pendingImage && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ScanningAnimation image={pendingImage} onComplete={handleScanComplete} />
            </motion.div>
          )}

          {screen === 'dashboard' && currentResult && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Dashboard
                result={currentResult}
                onRescan={() => {
                  setPendingImage(null);
                  setCurrentResult(null);
                  setScreen('upload');
                }}
                onToggleFavourite={() => toggleFavourite(currentResult.id)}
              />
            </motion.div>
          )}

          {screen === 'history' && (
            <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <History
                history={history}
                onSelect={selectScan}
                onToggleFavourite={toggleFavourite}
                onDelete={deleteScan}
              />
            </motion.div>
          )}

          {screen === 'watchlist' && (
            <motion.div key="watchlist" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Watchlist
                items={watchlist}
                onAdd={addWatchlistItem}
                onUpdate={updateWatchlistItem}
                onDelete={deleteWatchlistItem}
              />
            </motion.div>
          )}

          {screen === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Settings
                settings={settings}
                onChange={(patch) => setSettings((s) => ({ ...s, ...patch }))}
                onClearHistory={() => setHistory([])}
                historyCount={history.length}
              />
            </motion.div>
          )}

          {screen === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Profile history={history} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {screen !== 'landing' && screen !== 'dashboard' && screen !== 'scanning' && (
        <div className="hidden sm:block px-6 pb-6 max-w-6xl mx-auto w-full">
          <Disclaimer compact />
        </div>
      )}
    </div>
  );
}

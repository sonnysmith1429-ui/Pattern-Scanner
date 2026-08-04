import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Landing from './components/landing/Landing';
import UploadScreen from './components/upload/UploadScreen';
import ScanningAnimation, { type ScanStep } from './components/scan/ScanningAnimation';
import ConfirmSquad from './components/upload/ConfirmSquad';
import Dashboard from './components/dashboard/Dashboard';
import SquadPage from './components/squad/SquadPage';
import PlayerDrawer from './components/squad/PlayerDrawer';
import TransfersPage from './components/transfers/TransfersPage';
import PlayersPage from './components/players/PlayersPage';
import PlayerComparison from './components/players/PlayerComparison';
import FixturesPage from './components/fixtures/FixturesPage';
import History from './components/history/History';
import Settings from './components/settings/Settings';
import Nav, { type Screen } from './components/nav/Nav';
import Disclaimer from './components/ui/Disclaimer';
import ToastHost from './components/ui/ToastHost';

import type { AIAnalysisResponse, DetectedSquad, FplDataset, Squad, TeamAnalysis, TransferRecommendation } from './types';
import { useFplData } from './hooks/useFplData';
import { getDataset, getManagerPicks } from './lib/fpl/provider';
import { getMockBundle } from './lib/fpl/mockData';
import { recogniseSquadFromImage } from './lib/ocr';
import { analyseSquad } from './lib/engine';
import { buildAiRequest } from './lib/ai/buildRequest';
import { getAiAnalysis } from './lib/ai/client';
import { pushToast } from './lib/toast';
import { withMinDuration } from './lib/utils/format';
import {
  loadHistory,
  saveHistory,
  loadSettings,
  saveSettings,
  loadContext,
  saveContext,
} from './lib/storage';
import type { SavedAnalysis, AppSettings, UserContext } from './types';

type AppScreen = 'landing' | Screen;

type UploadSource = { type: 'image'; image: string } | { type: 'managerId'; managerId: number; gameweek: number } | { type: 'demo' };

async function runSteps(
  steps: { label: string; work?: () => Promise<void> }[],
  setSteps: (steps: ScanStep[]) => void,
  setError: (msg: string) => void,
): Promise<boolean> {
  const state: ScanStep[] = steps.map((s, i) => ({ label: s.label, status: i === 0 ? 'active' : 'pending' }));
  setSteps([...state]);
  for (let i = 0; i < steps.length; i++) {
    state[i].status = 'active';
    setSteps([...state]);
    try {
      if (steps[i].work) {
        await withMinDuration(steps[i].work!(), 500);
      } else {
        await new Promise((r) => setTimeout(r, 420));
      }
    } catch (err) {
      state[i].status = 'error';
      setSteps([...state]);
      setError((err as Error).message || 'Something went wrong. Please try again.');
      return false;
    }
    state[i].status = 'done';
    if (state[i + 1]) state[i + 1].status = 'active';
    setSteps([...state]);
  }
  return true;
}

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('landing');
  const [hasAnalysed, setHasAnalysed] = useState(false);
  const fplData = useFplData();

  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [context, setContext] = useState<UserContext>(() => loadContext());
  const [history, setHistory] = useState<SavedAnalysis[]>(() => loadHistory());

  const [activeDataset, setActiveDataset] = useState<FplDataset | null>(null);
  const [pendingSource, setPendingSource] = useState<UploadSource | null>(null);
  const [pendingImagePreview, setPendingImagePreview] = useState<string | null>(null);
  const [detectedSquad, setDetectedSquad] = useState<DetectedSquad | null>(null);
  const [squad, setSquad] = useState<Squad | null>(null);
  const [teamAnalysis, setTeamAnalysis] = useState<TeamAnalysis | null>(null);
  const [aiResponse, setAiResponse] = useState<AIAnalysisResponse | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [scanSteps, setScanSteps] = useState<ScanStep[]>([]);
  const [scanError, setScanError] = useState<string | null>(null);

  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  const [comparisonIds, setComparisonIds] = useState<[number, number] | null>(null);
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('light', settings.theme === 'light');
    saveSettings(settings);
  }, [settings]);

  useEffect(() => saveHistory(history), [history]);
  useEffect(() => saveContext(context), [context]);

  function updateContext(patch: Partial<UserContext>) {
    setContext((c) => ({ ...c, ...patch }));
  }

  function saveAnalysisEntry(ds: FplDataset, sq: Squad, ta: TeamAnalysis, label: string) {
    const entry: SavedAnalysis = {
      id: `analysis_${Date.now()}`,
      createdAt: new Date().toISOString(),
      squad: sq,
      teamAnalysis: ta,
      dataSource: ds.freshness.source,
      favourite: false,
      label,
    };
    setHistory((h) => [entry, ...h]);
    setCurrentAnalysisId(entry.id);
  }

  function updateCurrentHistoryEntry(sq: Squad, ta: TeamAnalysis) {
    if (!currentAnalysisId) return;
    setHistory((h) => h.map((e) => (e.id === currentAnalysisId ? { ...e, squad: sq, teamAnalysis: ta } : e)));
  }

  async function runAiInBackground(ds: FplDataset, sq: Squad, ta: TeamAnalysis) {
    setAiLoading(true);
    try {
      const res = await getAiAnalysis(buildAiRequest(ds, sq, ta));
      setAiResponse(res);
    } finally {
      setAiLoading(false);
    }
  }

  async function handleUploadSubmit(source: { type: 'image'; image: string } | { type: 'managerId'; managerId: number; gameweek: number }, ctx: UserContext) {
    setContext(ctx);
    setPendingSource(source);
    setScanError(null);
    setDetectedSquad(null);
    setScreen('scanning');
    setPendingImagePreview(source.type === 'image' ? source.image : null);

    let ok = false;
    if (source.type === 'image') {
      ok = await runSteps(
        [
          { label: 'Reading your screenshot' },
          {
            label: 'Identifying players',
            work: async () => {
              const dataset = await getDataset();
              setActiveDataset(dataset);
              const detected = await recogniseSquadFromImage(source.image, dataset.players);
              if (detected.playersFound === 0) {
                throw new Error("We couldn't identify your squad from this screenshot. Try uploading a clearer screenshot showing your full team.");
              }
              setDetectedSquad(detected);
            },
          },
        ],
        setScanSteps,
        setScanError,
      );
    } else {
      ok = await runSteps(
        [
          {
            label: 'Fetching your squad from FPL',
            work: async () => {
              const dataset = await getDataset();
              setActiveDataset(dataset);
              const result = await getManagerPicks(source.managerId, source.gameweek);
              const detected: DetectedSquad = {
                playersFound: result.picks.length,
                playersExpected: 15,
                overallConfidence: 1,
                source: 'manager-id',
                picks: result.picks.map((p, i) => ({
                  slotId: `mgr-${i}`,
                  rawText: '',
                  isStarter: p.isStarter,
                  isBench: !p.isStarter,
                  isCaptain: p.isCaptain,
                  isViceCaptain: p.isViceCaptain,
                  matchedPlayerId: p.playerId,
                  matchConfidence: 1,
                  alternatives: [],
                })),
              };
              setDetectedSquad(detected);
              if (ctx.bank == null) setContext((c) => ({ ...c, bank: result.bank }));
            },
          },
        ],
        setScanSteps,
        setScanError,
      );
    }

    if (ok) setScreen('confirm');
  }

  async function handleDemo() {
    setPendingSource({ type: 'demo' });
    setScanError(null);
    setPendingImagePreview(null);
    setScreen('scanning');

    const ok = await runSteps(
      [
        {
          label: 'Loading demo squad',
          work: async () => {
            const bundle = getMockBundle();
            setActiveDataset(bundle.dataset);
            setDetectedSquad(bundle.demoDetectedSquad);
            setContext((c) => ({ ...c, bank: c.bank ?? bundle.demoSquad.context.bank, freeTransfers: c.freeTransfers ?? bundle.demoSquad.context.freeTransfers }));
          },
        },
      ],
      setScanSteps,
      setScanError,
    );

    if (ok) setScreen('confirm');
  }

  async function handleConfirm(confirmedSquad: Squad) {
    if (!activeDataset) return;
    const ds = activeDataset;
    setSquad(confirmedSquad);
    setScanError(null);
    setScreen('scanning');
    setPendingImagePreview(null);

    let computed: TeamAnalysis | null = null;
    const ok = await runSteps(
      [
        { label: 'Checking current prices' },
        {
          label: 'Analysing form',
          work: async () => {
            computed = analyseSquad(ds, confirmedSquad);
          },
        },
        { label: 'Analysing fixtures' },
        { label: 'Comparing player statistics' },
        {
          label: 'Running AI analysis',
          work: async () => {
            if (!computed) return;
            const res = await getAiAnalysis(buildAiRequest(ds, confirmedSquad, computed));
            setAiResponse(res);
          },
        },
      ],
      setScanSteps,
      setScanError,
    );

    if (!ok || !computed) return;
    setTeamAnalysis(computed);
    saveAnalysisEntry(ds, confirmedSquad, computed, pendingSource?.type === 'demo' ? 'Demo Squad' : pendingSource?.type === 'managerId' ? `Manager #${pendingSource.managerId}` : 'Squad analysis');
    setHasAnalysed(true);
    setScreen('dashboard');
  }

  function handleRescan() {
    setSquad(null);
    setTeamAnalysis(null);
    setAiResponse(null);
    setDetectedSquad(null);
    setPendingImagePreview(null);
    setScanError(null);
    setScreen('upload');
  }

  function makeTransfer(rec: TransferRecommendation) {
    if (!squad || !teamAnalysis || !activeDataset) return;
    const newPicks = squad.picks.map((p) => (p.playerId === rec.outPlayerId ? { ...p, playerId: rec.inPlayerId } : p));
    const newSquad: Squad = { ...squad, picks: newPicks };
    const newAnalysis = analyseSquad(activeDataset, newSquad);
    setSquad(newSquad);
    setTeamAnalysis(newAnalysis);
    updateCurrentHistoryEntry(newSquad, newAnalysis);
    pushToast('Transfer applied — squad updated.', 'success');
    runAiInBackground(activeDataset, newSquad, newAnalysis);
  }

  function applyFixMyTeam(result: { transfers: TransferRecommendation[] }) {
    if (!squad || !activeDataset) return;
    let picks = squad.picks;
    for (const t of result.transfers) picks = picks.map((p) => (p.playerId === t.outPlayerId ? { ...p, playerId: t.inPlayerId } : p));
    const newSquad: Squad = { ...squad, picks };
    const newAnalysis = analyseSquad(activeDataset, newSquad);
    setSquad(newSquad);
    setTeamAnalysis(newAnalysis);
    updateCurrentHistoryEntry(newSquad, newAnalysis);
    pushToast(`${result.transfers.length} transfer${result.transfers.length === 1 ? '' : 's'} applied.`, 'success');
    runAiInBackground(activeDataset, newSquad, newAnalysis);
    setScreen('dashboard');
  }

  async function refreshData() {
    setRefreshing(true);
    try {
      const fresh = await getDataset({ forceRefresh: true });
      const stillValid = !squad || squad.picks.every((p) => fresh.players.some((pl) => pl.id === p.playerId));
      if (stillValid) {
        setActiveDataset(fresh);
        if (squad) {
          const newAnalysis = analyseSquad(fresh, squad);
          setTeamAnalysis(newAnalysis);
          updateCurrentHistoryEntry(squad, newAnalysis);
        }
        pushToast('Data refreshed.', 'success');
      } else {
        pushToast('Refresh skipped — currently using demo data.', 'info');
      }
    } catch {
      pushToast('Refresh failed — please try again.', 'error');
    }
    setRefreshing(false);
  }

  function toggleFavourite(id: string) {
    setHistory((h) => h.map((e) => (e.id === id ? { ...e, favourite: !e.favourite } : e)));
  }

  function deleteHistoryEntry(id: string) {
    setHistory((h) => h.filter((e) => e.id !== id));
    if (currentAnalysisId === id) setCurrentAnalysisId(null);
  }

  function selectHistoryEntry(id: string) {
    const entry = history.find((e) => e.id === id);
    if (!entry) return;
    const ds = entry.dataSource === 'mock' ? getMockBundle().dataset : (activeDataset ?? fplData.dataset);
    if (!ds) return;
    setActiveDataset(ds);
    setSquad(entry.squad);
    setTeamAnalysis(entry.teamAnalysis);
    setCurrentAnalysisId(id);
    setAiResponse(null);
    runAiInBackground(ds, entry.squad, entry.teamAnalysis);
    setHasAnalysed(true);
    setScreen('dashboard');
  }

  const dataset = activeDataset;
  const playerById = dataset ? new Map(dataset.players.map((p) => [p.id, p])) : new Map();
  const selectedPlayer = selectedPlayerId != null ? playerById.get(selectedPlayerId) ?? null : null;
  const selectedAnalysis = teamAnalysis?.playerAnalyses.find((a) => a.playerId === selectedPlayerId);

  const showNav = hasAnalysed && !['landing', 'upload', 'scanning', 'confirm'].includes(screen);

  return (
    <div className="min-h-[100svh] flex flex-col">
      {showNav && <Nav current={screen as Screen} onNavigate={(s) => setScreen(s)} onLogo={() => setScreen('landing')} />}

      <div className="flex-1 pb-20 sm:pb-0">
        <AnimatePresence mode="wait">
          {screen === 'landing' && (
            <motion.div key="landing" exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <Landing onUpload={() => setScreen('upload')} onDemo={handleDemo} />
            </motion.div>
          )}

          {screen === 'upload' && (
            <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <UploadScreen onBack={() => setScreen('landing')} onSubmit={handleUploadSubmit} onDemo={handleDemo} initialContext={context} />
            </motion.div>
          )}

          {screen === 'scanning' && (
            <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <ScanningAnimation
                image={pendingImagePreview}
                steps={scanSteps}
                error={scanError}
                onRetry={() => setScreen(detectedSquad ? 'confirm' : 'upload')}
                onUseDemo={handleDemo}
              />
            </motion.div>
          )}

          {screen === 'confirm' && detectedSquad && dataset && (
            <motion.div key="confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <ConfirmSquad detected={detectedSquad} players={dataset.players} context={context} onConfirm={handleConfirm} onBack={() => setScreen('upload')} />
            </motion.div>
          )}

          {screen === 'dashboard' && dataset && squad && teamAnalysis && (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
              <Dashboard
                dataset={dataset}
                squad={squad}
                teamAnalysis={teamAnalysis}
                freshness={dataset.freshness}
                onRefresh={refreshData}
                refreshing={refreshing}
                aiResponse={aiResponse}
                aiLoading={aiLoading}
                onRescan={handleRescan}
                isFavourite={!!history.find((e) => e.id === currentAnalysisId)?.favourite}
                onToggleFavourite={() => currentAnalysisId && toggleFavourite(currentAnalysisId)}
                onNavigate={(tab) => setScreen(tab)}
              />
            </motion.div>
          )}

          {screen === 'squad' && dataset && squad && teamAnalysis && (
            <motion.div key="squad" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <SquadPage dataset={dataset} squad={squad} teamAnalysis={teamAnalysis} onOpenPlayer={setSelectedPlayerId} />
            </motion.div>
          )}

          {screen === 'transfers' && dataset && squad && teamAnalysis && (
            <motion.div key="transfers" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <TransfersPage
                dataset={dataset}
                squad={squad}
                teamAnalysis={teamAnalysis}
                aiResponse={aiResponse}
                onMakeTransfer={makeTransfer}
                onApplyFixMyTeam={applyFixMyTeam}
                onOpenPlayer={setSelectedPlayerId}
                onCompare={(a, b) => {
                  setComparisonIds([a, b]);
                  setScreen('comparison');
                }}
              />
            </motion.div>
          )}

          {screen === 'players' && dataset && (
            <motion.div key="players" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <PlayersPage
                dataset={dataset}
                onOpenPlayer={setSelectedPlayerId}
                onCompare={(a, b) => {
                  setComparisonIds([a, b]);
                  setScreen('comparison');
                }}
              />
            </motion.div>
          )}

          {screen === 'comparison' && dataset && comparisonIds && (
            <motion.div key="comparison" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <PlayerComparison
                dataset={dataset}
                playerAId={comparisonIds[0]}
                playerBId={comparisonIds[1]}
                onChangePlayer={(slot, id) => setComparisonIds((prev) => (prev ? (slot === 'a' ? [id, prev[1]] : [prev[0], id]) : prev))}
                onBack={() => setScreen(squad ? 'transfers' : 'players')}
              />
            </motion.div>
          )}

          {screen === 'fixtures' && dataset && squad && (
            <motion.div key="fixtures" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <FixturesPage dataset={dataset} squad={squad} onOpenPlayer={setSelectedPlayerId} />
            </motion.div>
          )}

          {screen === 'history' && (
            <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <History history={history} onSelect={selectHistoryEntry} onToggleFavourite={toggleFavourite} onDelete={deleteHistoryEntry} />
            </motion.div>
          )}

          {screen === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Settings
                context={context}
                onChangeContext={updateContext}
                settings={settings}
                onChangeSettings={(patch) => setSettings((s) => ({ ...s, ...patch }))}
                historyCount={history.length}
                onClearHistory={() => setHistory([])}
                freshness={dataset?.freshness ?? null}
                onRefresh={refreshData}
                refreshing={refreshing}
                aiProvider={aiResponse?.provider ?? null}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <PlayerDrawer player={selectedPlayer} analysis={selectedAnalysis} dataset={dataset ?? { players: [], teams: [], events: [], fixtures: [], freshness: { source: 'mock', fetchedAt: new Date().toISOString() } }} onClose={() => setSelectedPlayerId(null)} />

      <ToastHost />

      {screen !== 'landing' && screen !== 'scanning' && !['dashboard', 'transfers'].includes(screen) && (
        <div className="hidden sm:block px-6 pb-6 max-w-6xl mx-auto w-full">
          <Disclaimer compact />
        </div>
      )}
    </div>
  );
}

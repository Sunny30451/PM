import React, { useState, useMemo } from 'react';
import { AppProvider, useAppContext } from './src/viewmodels/AppViewModel.jsx';
import { useTheme } from './src/viewmodels/useTheme.js';
import { Header } from './src/views/Header.jsx';
import { DashboardView } from './src/views/DashboardView.jsx';
import { AdminView } from './src/views/AdminView.jsx';
import { ProjectDetailView } from './src/views/ProjectDetailView.jsx';

// ==========================================
// ROOT APP COMPONENT (MVVM Entry Point)
// ==========================================

/**
 * AppShell - Wraps the app with the AppProvider and passes navigation
 * callbacks via viewController so the ViewModel can trigger view changes.
 */
export default function App() {
  return (
    <AppShell />
  );
}

function AppShell() {
  const [view, setView] = useState('dashboard');
  const [activeProjectId, setActiveProjectId] = useState(null);

  const viewController = useMemo(() => ({
    goToDashboard: () => setView('dashboard'),
    onProjectDeleted: (id) => {
      if (activeProjectId === id) setView('dashboard');
    }
  }), [activeProjectId]);

  return (
    <AppProvider viewController={viewController}>
      <AppContent
        view={view}
        setView={setView}
        activeProjectId={activeProjectId}
        setActiveProjectId={setActiveProjectId}
      />
    </AppProvider>
  );
}

/**
 * AppContent - The main layout component inside the AppProvider context.
 * Handles view routing, theme application, and renders Header + active view.
 */
function AppContent({ view, setView, activeProjectId, setActiveProjectId }) {
  const {
    projects,
    isLoading,
    persistenceStatus,
    persistenceError
  } = useAppContext();
  const { themePref, setThemePref, isDark } = useTheme();

  const activeProject = useMemo(
    () => projects.find(p => p.id === activeProjectId),
    [projects, activeProjectId]
  );

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${isDark ? 'dark bg-zinc-900 text-zinc-200' : 'bg-zinc-50 text-zinc-800'}`}>
      <Header view={view} setView={setView} themePref={themePref} setThemePref={setThemePref} />

      {persistenceStatus === 'error' && (
        <div
          role="alert"
          className="border-b border-amber-300 bg-amber-50 px-6 py-2 text-center text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200"
        >
          Datenbank nicht erreichbar. Änderungen bleiben nur für diese Sitzung erhalten.
          {persistenceError ? ` (${persistenceError})` : ''}
        </div>
      )}

      <main className="flex-1 overflow-auto">
        {isLoading && (
          <div className="flex min-h-[50vh] items-center justify-center text-zinc-500 dark:text-zinc-400">
            Daten werden aus SQLite geladen …
          </div>
        )}
        {!isLoading && view === 'dashboard' && (
          <DashboardView onEdit={(id) => { setActiveProjectId(id); setView('project'); }} />
        )}
        {!isLoading && view === 'admin' && <AdminView />}
        {!isLoading && view === 'project' && activeProject && (
          <ProjectDetailView project={activeProject} onBack={() => setView('dashboard')} />
        )}
      </main>
    </div>
  );
}

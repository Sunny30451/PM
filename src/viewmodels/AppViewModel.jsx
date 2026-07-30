import React, {
    useState,
    useMemo,
    createContext,
    useContext,
    useEffect,
    useCallback
} from 'react';
import {
    initialProjects,
    initialGlobalSchema,
    initialGlobalAddons,
    initialGlobalBaseTypes
} from '../models/initialData.js';
import { loadAppState, saveAppState } from '../services/persistenceApi.js';

// ==========================================
// APP CONTEXT (Global State)
// ==========================================

const AppContext = createContext();

export function useAppContext() {
    return useContext(AppContext);
}

/**
 * AppProvider - Root ViewModel providing global state management.
 * Manages projects, global schema, addons, and base types.
 */
export function AppProvider({ children, viewController }) {
    const [projects, setProjects] = useState(initialProjects);
    const [globalSchema, setGlobalSchema] = useState(initialGlobalSchema);
    const [globalAddons, setGlobalAddons] = useState(initialGlobalAddons);
    const [globalBaseTypes, setGlobalBaseTypes] = useState(initialGlobalBaseTypes);
    const [isLoading, setIsLoading] = useState(true);
    const [isHydrated, setIsHydrated] = useState(false);
    const [persistenceStatus, setPersistenceStatus] = useState('loading');
    const [persistenceError, setPersistenceError] = useState(null);

    useEffect(() => {
        const controller = new AbortController();
        let isActive = true;

        async function hydrateState() {
            try {
                const persistedState = await loadAppState(controller.signal);

                if (persistedState && isActive) {
                    setProjects(persistedState.projects);
                    setGlobalSchema(persistedState.globalSchema);
                    setGlobalAddons(persistedState.globalAddons);
                    setGlobalBaseTypes(persistedState.globalBaseTypes);
                }

                if (isActive) {
                    setPersistenceStatus('saved');
                    setPersistenceError(null);
                }
            } catch (error) {
                if (error.name !== 'AbortError' && isActive) {
                    setPersistenceStatus('error');
                    setPersistenceError(error.message);
                }
            } finally {
                if (isActive) {
                    setIsHydrated(true);
                    setIsLoading(false);
                }
            }
        }

        hydrateState();

        return () => {
            isActive = false;
            controller.abort();
        };
    }, []);

    useEffect(() => {
        if (!isHydrated) return undefined;

        let isActive = true;
        setPersistenceStatus('saving');

        const timeoutId = window.setTimeout(async () => {
            try {
                await saveAppState({
                    projects,
                    globalSchema,
                    globalAddons,
                    globalBaseTypes
                });

                if (isActive) {
                    setPersistenceStatus('saved');
                    setPersistenceError(null);
                }
            } catch (error) {
                if (isActive) {
                    setPersistenceStatus('error');
                    setPersistenceError(error.message);
                }
            }
        }, 300);

        return () => {
            isActive = false;
            window.clearTimeout(timeoutId);
        };
    }, [projects, globalSchema, globalAddons, globalBaseTypes, isHydrated]);

    const handleSaveProject = useCallback((projectData) => {
        if (projectData.id) {
            setProjects(prev => prev.map(p => p.id === projectData.id ? projectData : p));
        } else {
            setProjects(prev => [...prev, {
                ...projectData,
                id: Date.now().toString(),
                specificSchema: [],
                activeAddons: [],
                dashboardLayout: ['project-details'],
                lockedWidgets: ['project-details'],
                addonData: {}
            }]);
        }
        if (viewController?.goToDashboard) {
            viewController.goToDashboard();
        }
    }, [viewController]);

    const handleDeleteProject = useCallback((id) => {
        setProjects(prev => prev.filter(p => p.id !== id));
        if (viewController?.onProjectDeleted) {
            viewController.onProjectDeleted(id);
        }
    }, [viewController]);

    const updateProject = useCallback((id, updates) => {
        setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    }, []);

    const contextValue = useMemo(() => ({
        projects, globalSchema, globalAddons, globalBaseTypes,
        setProjects, setGlobalSchema, setGlobalAddons, setGlobalBaseTypes,
        handleSaveProject, handleDeleteProject, updateProject,
        isLoading, persistenceStatus, persistenceError
    }), [
        projects,
        globalSchema,
        globalAddons,
        globalBaseTypes,
        handleSaveProject,
        handleDeleteProject,
        updateProject,
        isLoading,
        persistenceStatus,
        persistenceError
    ]);

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
}

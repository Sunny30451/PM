import React, { useState, useMemo, createContext, useContext } from 'react';
import {
    initialProjects,
    initialGlobalSchema,
    initialGlobalAddons,
    initialGlobalBaseTypes
} from '../models/initialData.js';

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

    const handleSaveProject = (projectData) => {
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
    };

    const handleDeleteProject = (id) => {
        setProjects(prev => prev.filter(p => p.id !== id));
        if (viewController?.onProjectDeleted) {
            viewController.onProjectDeleted(id);
        }
    };

    const updateProject = (id, updates) => {
        setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    };

    const contextValue = useMemo(() => ({
        projects, globalSchema, globalAddons, globalBaseTypes,
        setProjects, setGlobalSchema, setGlobalAddons, setGlobalBaseTypes,
        handleSaveProject, handleDeleteProject, updateProject
    }), [projects, globalSchema, globalAddons, globalBaseTypes]);

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
}

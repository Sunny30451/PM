import { useCallback } from 'react';
import { useAppContext } from './AppViewModel.jsx';

/**
 * useProjectViewModel - ViewModel hook for project-level operations.
 * Provides addon data updates, dashboard layout mutations, and widget locking.
 */
export function useProjectViewModel(project) {
    const { updateProject } = useAppContext();

    const updateAddonData = useCallback((addonId, newData) => {
        updateProject(project.id, {
            addonData: { ...project.addonData, [addonId]: newData }
        });
    }, [project.id, project.addonData, updateProject]);

    const updateDashboardLayout = useCallback((newLayout) => {
        updateProject(project.id, { dashboardLayout: newLayout });
    }, [project.id, updateProject]);

    const removeWidgetFromDashboard = useCallback((widgetId) => {
        updateProject(project.id, {
            dashboardLayout: (project.dashboardLayout || []).filter(x => x !== widgetId)
        });
    }, [project.id, project.dashboardLayout, updateProject]);

    const toggleWidgetLock = useCallback((widgetId) => {
        const locked = project.lockedWidgets || [];
        updateProject(project.id, {
            lockedWidgets: locked.includes(widgetId)
                ? locked.filter(x => x !== widgetId)
                : [...locked, widgetId]
        });
    }, [project.id, project.lockedWidgets, updateProject]);

    const toggleAddon = useCallback((addonId) => {
        const active = project.activeAddons || [];
        updateProject(project.id, {
            activeAddons: active.includes(addonId)
                ? active.filter(x => x !== addonId)
                : [...active, addonId],
            dashboardLayout: active.includes(addonId)
                ? (project.dashboardLayout || []).filter(x => x !== addonId)
                : project.dashboardLayout
        });
    }, [project.id, project.activeAddons, project.dashboardLayout, updateProject]);

    return {
        updateAddonData,
        updateDashboardLayout,
        removeWidgetFromDashboard,
        toggleWidgetLock,
        toggleAddon
    };
}

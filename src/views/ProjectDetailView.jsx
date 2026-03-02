import React, { useState } from 'react';
import {
    LayoutDashboard, Settings, ChevronRight, AlignLeft, Component
} from 'lucide-react';
import { useAppContext } from '../viewmodels/AppViewModel.jsx';
import { IconRegistry } from '../models/initialData.js';
import { ProjectDashboard } from './ProjectDashboard.jsx';
import { ProjectOverview } from './ProjectOverview.jsx';
import { ProjectSettings } from './ProjectSettings.jsx';
import { AddonRenderer } from './addons/AddonRenderer.jsx';

// ==========================================
// PROJECT DETAIL VIEW (Main Layout)
// ==========================================

export function ProjectDetailView({ project, onBack }) {
    const { globalAddons } = useAppContext();
    const [activeTab, setActiveTab] = useState('dashboard');

    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'overview', label: 'Details', icon: AlignLeft },
        ...(project.activeAddons || []).map(id => {
            const def = globalAddons.find(a => a.id === id);
            return def ? { id: `addon-${id}`, label: def.name, icon: IconRegistry[def.icon] || Component } : null;
        }).filter(Boolean)
    ];

    return (
        <div className="flex flex-col h-full">
            <div className="bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button onClick={onBack} className="p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-full"><ChevronRight size={20} className="rotate-180" /></button>
                    <div>
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white leading-tight">{project.name}</h2>
                        <div className="text-sm text-zinc-500 mt-0.5 flex items-center space-x-2">
                            <span className={`w-2 h-2 rounded-full ${project.status === 'Geplant' ? 'bg-cyan-400' : project.status === 'In Bearbeitung' ? 'bg-emerald-400' : 'bg-zinc-400'}`}></span>
                            <span>{project.status}</span>
                        </div>
                    </div>
                </div>
                <button onClick={() => setActiveTab('settings')} title="Konfiguration" className={`p-2 rounded-full transition-colors ${activeTab === 'settings' ? 'bg-teal-100 text-teal-600' : 'text-zinc-400 hover:bg-zinc-100'}`}><Settings size={22} /></button>
            </div>

            <div className="flex flex-1 overflow-hidden">
                <div className="w-64 bg-zinc-50 dark:bg-zinc-800/50 border-r border-zinc-200 dark:border-zinc-700 flex flex-col p-4 space-y-1 overflow-y-auto">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center space-x-3 text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}>
                            <tab.icon size={16} /><span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-white dark:bg-zinc-900">
                    <div className="max-w-6xl mx-auto h-full">
                        {activeTab === 'dashboard' && <ProjectDashboard project={project} />}
                        {activeTab === 'overview' && <ProjectOverview project={project} />}
                        {activeTab === 'settings' && <ProjectSettings project={project} />}
                        {activeTab.startsWith('addon-') && (
                            <div className="max-w-4xl">
                                <AddonRenderer addonId={activeTab.replace('addon-', '')} project={project} isWidget={false} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

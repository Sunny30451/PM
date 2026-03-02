import React, { useState } from 'react';
import {
    LayoutDashboard, GripHorizontal, Lock, Unlock, X, AlignLeft, Component
} from 'lucide-react';
import { UI } from '../components/UI.jsx';
import { useAppContext } from '../viewmodels/AppViewModel.jsx';
import { IconRegistry } from '../models/initialData.js';
import { ProjectOverview } from './ProjectOverview.jsx';
import { AddonRenderer } from './addons/AddonRenderer.jsx';

// ==========================================
// PROJECT DASHBOARD (Drag & Drop Layout)
// ==========================================

export function ProjectDashboard({ project }) {
    const { globalAddons, updateProject } = useAppContext();
    const [dragOver, setDragOver] = useState(false);

    const layout = project.dashboardLayout || [];
    const locked = project.lockedWidgets || [];
    const available = ['project-details', ...(project.activeAddons || [])].filter(id => !layout.includes(id));

    const handleDrop = (e, targetId = null) => {
        e.preventDefault(); setDragOver(false);
        const draggedId = e.dataTransfer.getData('addonId');
        const reorderId = e.dataTransfer.getData('reorderId');

        if (!draggedId && !reorderId) return;

        let newLayout = [...layout];

        if (draggedId && !layout.includes(draggedId)) {
            if (targetId) {
                newLayout.splice(newLayout.indexOf(targetId), 0, draggedId);
            } else {
                newLayout.push(draggedId);
            }
        } else if (reorderId && reorderId !== targetId) {
            const oldIndex = newLayout.indexOf(reorderId);
            if (oldIndex > -1) {
                newLayout.splice(oldIndex, 1);
                if (targetId) {
                    newLayout.splice(newLayout.indexOf(targetId), 0, reorderId);
                } else {
                    newLayout.push(reorderId);
                }
            }
        }
        updateProject(project.id, { dashboardLayout: newLayout });
    };

    const removeWidget = (id) => updateProject(project.id, { dashboardLayout: layout.filter(x => x !== id) });
    const toggleLock = (id) => updateProject(project.id, { lockedWidgets: locked.includes(id) ? locked.filter(x => x !== id) : [...locked, id] });

    return (
        <div className="space-y-6 h-full flex flex-col">
            <UI.Card className="p-4 flex flex-col bg-zinc-50 dark:bg-zinc-800/50">
                <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-3 flex items-center"><Component size={16} className="mr-2 text-teal-500" /> Verfügbare Widgets</h3>
                <div className="flex flex-wrap gap-3">
                    {available.map(id => {
                        const isDet = id === 'project-details';
                        const def = isDet ? null : globalAddons.find(a => a.id === id);
                        if (!isDet && !def) return null;
                        const Icon = isDet ? AlignLeft : (IconRegistry[def.icon] || Component);
                        return (
                            <div key={id} draggable onDragStart={e => e.dataTransfer.setData('addonId', id)} className="bg-white dark:bg-zinc-800 border border-zinc-300 rounded-lg px-3 py-2 flex items-center space-x-2 cursor-grab shadow-sm hover:border-teal-400">
                                <Icon size={16} className="text-teal-500" /><span className="text-sm font-medium">{isDet ? 'Details' : def.name}</span>
                            </div>
                        )
                    })}
                </div>
            </UI.Card>

            <div className={`flex-1 rounded-2xl border-2 ${dragOver ? 'border-teal-500 bg-teal-50/50 border-dashed' : 'border-transparent bg-zinc-100 dark:bg-zinc-800/30'} p-6 overflow-y-auto`}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={e => handleDrop(e)}>
                {layout.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-400 opacity-70"><LayoutDashboard size={48} className="mb-4" /><p>Dashboard ist leer.</p></div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
                        {layout.map(id => (
                            <DraggableWidget key={id} addonId={id} project={project} isLocked={locked.includes(id)} onDrop={(e) => handleDrop(e, id)} onRemove={() => removeWidget(id)} onToggleLock={() => toggleLock(id)} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// ==========================================
// DRAGGABLE WIDGET WRAPPER
// ==========================================

function DraggableWidget({ addonId, project, isLocked, onDrop, onRemove, onToggleLock }) {
    const { globalAddons } = useAppContext();
    const isDetails = addonId === 'project-details';
    const def = isDetails ? null : globalAddons.find(a => a.id === addonId);
    const name = isDetails ? 'Projekt-Details' : def?.name;

    if (!isDetails && !def) return null;

    return (
        <UI.Card className={`flex flex-col relative group transition-all hover:shadow-md ${isLocked ? 'ring-1 ring-teal-500/30' : ''}`}>
            <div
                draggable={!isLocked}
                onDragStart={e => {
                    if (isLocked) { e.preventDefault(); return; }
                    e.dataTransfer.setData('reorderId', addonId);
                }}
                onDragOver={e => {
                    if (!isLocked) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                }}
                onDrop={e => {
                    if (!isLocked) {
                        e.stopPropagation();
                        onDrop(e);
                    }
                }}
            >
                <div className={`px-4 py-3 border-b border-zinc-100 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 flex justify-between items-center rounded-t-xl ${isLocked ? '' : 'cursor-move'}`}>
                    <div className="flex items-center text-zinc-500">
                        {!isLocked ? <GripHorizontal size={16} className="mr-3 opacity-50" /> : <Lock size={14} className="mr-3 text-teal-500" />}
                        <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{name}</span>
                    </div>
                    <div className="flex space-x-1">
                        <UI.IconButton
                            icon={isLocked ? Lock : Unlock}
                            onClick={(e) => { e.stopPropagation(); onToggleLock(); }}
                            className={isLocked ? 'text-teal-500' : 'opacity-0 group-hover:opacity-100'}
                            title={isLocked ? "Widget entsperren" : "Widget auf Dashboard fixieren"}
                        />
                        {!isLocked && (
                            <UI.IconButton
                                icon={X}
                                variant="danger"
                                onClick={(e) => { e.stopPropagation(); onRemove(); }}
                                title="Vom Dashboard entfernen"
                            />
                        )}
                    </div>
                </div>
                <div className="p-5 overflow-auto max-h-[600px] cursor-auto" draggable onDragStart={e => { e.preventDefault(); e.stopPropagation(); }}>
                    {isDetails ? <ProjectOverview project={project} isWidget /> : <AddonRenderer addonId={addonId} project={project} isWidget />}
                </div>
            </div>
        </UI.Card>
    );
}

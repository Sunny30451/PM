import React, { useState } from 'react';
import { Trash2, CalendarDays } from 'lucide-react';
import { UI } from '../../components/UI.jsx';

// ==========================================
// SPRINTS ADDON
// ==========================================

export function SprintsAddon({ data, updateAddonData, addonId, project, globalAddons, globalBaseTypes }) {
    const sprints = data?.list || [];
    const [sprint, setSprint] = useState({ name: '', startDate: '', endDate: '' });
    const [taskInputs, setTaskInputs] = useState({});

    const teamAddon = project.activeAddons?.find(id => globalBaseTypes.find(bt => bt.id === globalAddons.find(a => a.id === id)?.type)?.coreType === 'team');
    const teamMembers = teamAddon ? (project.addonData?.[teamAddon]?.list || []) : [];
    const hasTeamModuleActive = !!teamAddon;

    const addSprint = e => {
        e.preventDefault();
        if (!sprint.name.trim()) return;
        updateAddonData(addonId, { ...data, list: [...sprints, { id: Date.now().toString(), ...sprint, tasks: [] }] });
        setSprint({ name: '', startDate: '', endDate: '' });
    };

    const handleTaskInput = (sprintId, field, value) => {
        setTaskInputs(prev => ({
            ...prev,
            [sprintId]: { ...(prev[sprintId] || {}), [field]: value }
        }));
    };

    const addTaskToSprint = (e, sprintId) => {
        e.preventDefault();
        const taskData = taskInputs[sprintId];
        if (!taskData || !taskData.name?.trim()) return;

        // Use sprint dates if not explicitly provided
        const sprintObj = sprints.find(s => s.id === sprintId);
        const resolvedData = {
            ...taskData,
            startDate: taskData.startDate !== undefined ? taskData.startDate : sprintObj.startDate,
            endDate: taskData.endDate !== undefined ? taskData.endDate : sprintObj.endDate
        };

        updateAddonData(addonId, {
            ...data,
            list: sprints.map(s => s.id === sprintId ? { ...s, tasks: [...(s.tasks || []), { id: Date.now().toString(), done: false, ...resolvedData }] } : s)
        });

        setTaskInputs(prev => ({ ...prev, [sprintId]: { name: '', description: '', plannedDuration: '', startDate: '', endDate: '', assigneeId: '', assigneeName: '' } }));
    };

    const removeTask = (sprintId, taskId) => {
        updateAddonData(addonId, {
            ...data,
            list: sprints.map(s => s.id === sprintId ? { ...s, tasks: s.tasks.filter(t => t.id !== taskId) } : s)
        });
    };

    const updateTask = (sprintId, taskId, field, value) => {
        updateAddonData(addonId, {
            ...data,
            list: sprints.map(s => {
                if (s.id === sprintId) {
                    return { ...s, tasks: s.tasks.map(t => t.id === taskId ? { ...t, [field]: value } : t) };
                }
                return s;
            })
        });
    };

    return (
        <div className="w-full">
            <div className="mb-4 flex items-center gap-2">
                <input type="checkbox" checked={!!data?.syncWithTasks} onChange={e => updateAddonData(addonId, { ...data, syncWithTasks: e.target.checked })} className="rounded text-teal-600" />
                <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">Mit Aufgaben synchronisieren</span>
            </div>

            <UI.Card className="mb-6 p-4 bg-zinc-50 dark:bg-zinc-800/50">
                <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-3">Neuen Sprint anlegen</h4>
                <form onSubmit={addSprint} className="flex flex-col sm:flex-row gap-3">
                    <UI.Input placeholder="Sprint Name *" value={sprint.name || ''} onChange={e => setSprint({ ...sprint, name: e.target.value })} required />
                    <UI.Input type="date" value={sprint.startDate || ''} onChange={e => setSprint({ ...sprint, startDate: e.target.value })} className="sm:w-36" required />
                    <UI.Input type="date" value={sprint.endDate || ''} onChange={e => setSprint({ ...sprint, endDate: e.target.value })} className="sm:w-36" required />
                    <UI.Button type="submit">Erstellen</UI.Button>
                </form>
            </UI.Card>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {sprints.map(s => {
                    const tForm = taskInputs[s.id] || {};
                    return (
                        <UI.Card key={s.id} className="border-l-4 border-l-teal-500 flex flex-col overflow-visible">
                            <div className="p-4 border-b border-zinc-100 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/30">
                                <div className="flex justify-between items-center mb-1">
                                    <h4 className="font-bold text-zinc-800 dark:text-zinc-100">{s.name}</h4>
                                    <UI.IconButton icon={Trash2} variant="danger" onClick={() => updateAddonData(addonId, { ...data, list: sprints.filter(x => x.id !== s.id) })} />
                                </div>
                                {(s.startDate || s.endDate) && (
                                    <div className="flex items-center text-xs text-zinc-500 dark:text-zinc-400">
                                        <CalendarDays size={12} className="mr-1 text-teal-500" />
                                        <span>{s.startDate ? new Date(s.startDate).toLocaleDateString('de-DE') : ''} - {s.endDate ? new Date(s.endDate).toLocaleDateString('de-DE') : ''}</span>
                                    </div>
                                )}
                            </div>

                            <div className="p-0">
                                <div className="divide-y divide-zinc-100 dark:divide-zinc-700/50">
                                    {(!s.tasks || s.tasks.length === 0) && <p className="px-4 py-3 text-xs text-zinc-400 italic">Noch keine Aufgaben in diesem Sprint.</p>}
                                    {(s.tasks || []).map(t => (
                                        <div key={t.id} className="p-3 flex flex-col hover:bg-zinc-50 dark:hover:bg-zinc-700/30 group relative transition-colors">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1 pr-8">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <input type="checkbox" checked={!!t.done} onChange={() => updateTask(s.id, t.id, 'done', !t.done)} className="w-4 h-4 rounded text-teal-600" />
                                                        <UI.Input size="sm" value={t.name || ''} onChange={(e) => updateTask(s.id, t.id, 'name', e.target.value)} placeholder="Aufgabenname" className={`font-bold shadow-none border-transparent hover:border-zinc-200 focus:bg-white ${t.done ? 'line-through text-zinc-400' : ''}`} />
                                                    </div>
                                                    <UI.Input size="sm" value={t.description || ''} onChange={(e) => updateTask(s.id, t.id, 'description', e.target.value)} placeholder="Beschreibung..." className="text-xs shadow-none border-transparent hover:border-zinc-200 focus:bg-white ml-6 w-full" />
                                                </div>
                                                <UI.IconButton icon={Trash2} variant="danger" onClick={() => removeTask(s.id, t.id)} className="opacity-0 group-hover:opacity-100" />
                                            </div>

                                            <div className="pl-6 mt-2 flex flex-wrap items-center gap-2">
                                                <UI.Input type="date" size="sm" value={t.startDate || ''} onChange={e => updateTask(s.id, t.id, 'startDate', e.target.value)} title="Startdatum" className="w-32 py-1" />
                                                <UI.Input type="date" size="sm" value={t.endDate || ''} onChange={e => updateTask(s.id, t.id, 'endDate', e.target.value)} title="Enddatum" className="w-32 py-1" />
                                                <UI.Input type="number" size="sm" placeholder="Dauer" value={t.plannedDuration || ''} onChange={e => updateTask(s.id, t.id, 'plannedDuration', e.target.value)} className="w-20 py-1" />
                                                {hasTeamModuleActive ? (
                                                    <UI.Select size="sm" value={t.assigneeId || ''} onChange={e => updateTask(s.id, t.id, 'assigneeId', e.target.value)} className="w-32 py-1">
                                                        <option value="">Bearbeiter...</option>
                                                        {teamMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                                    </UI.Select>
                                                ) : (
                                                    <UI.Input size="sm" value={t.assigneeName || ''} onChange={e => updateTask(s.id, t.id, 'assigneeName', e.target.value)} placeholder="Bearbeiter..." className="w-32 py-1" />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-100 dark:border-zinc-700">
                                    <form onSubmit={(e) => addTaskToSprint(e, s.id)} className="flex flex-col gap-2">
                                        <div className="flex gap-2">
                                            <UI.Input size="sm" value={tForm.name || ''} onChange={e => handleTaskInput(s.id, 'name', e.target.value)} placeholder="Neue Aufgabe..." required className="flex-1 py-1.5" />
                                            <UI.Input size="sm" value={tForm.description || ''} onChange={e => handleTaskInput(s.id, 'description', e.target.value)} placeholder="Beschreibung" className="flex-1 py-1.5 hidden sm:block" />
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <UI.Input type="date" size="sm" value={tForm.startDate !== undefined ? tForm.startDate : (s.startDate || '')} onChange={e => handleTaskInput(s.id, 'startDate', e.target.value)} title="Startdatum" className="w-32 py-1.5" />
                                            <UI.Input type="date" size="sm" value={tForm.endDate !== undefined ? tForm.endDate : (s.endDate || '')} onChange={e => handleTaskInput(s.id, 'endDate', e.target.value)} title="Enddatum" className="w-32 py-1.5" />
                                            <UI.Input type="number" size="sm" value={tForm.plannedDuration || ''} onChange={e => handleTaskInput(s.id, 'plannedDuration', e.target.value)} placeholder="Dauer" title="Geplante Dauer" className="w-20 py-1.5" />
                                            {hasTeamModuleActive ? (
                                                <UI.Select size="sm" value={tForm.assigneeId || ''} onChange={e => handleTaskInput(s.id, 'assigneeId', e.target.value)} className="w-32 py-1.5">
                                                    <option value="">Bearbeiter...</option>
                                                    {teamMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                                </UI.Select>
                                            ) : (
                                                <UI.Input size="sm" value={tForm.assigneeName || ''} onChange={e => handleTaskInput(s.id, 'assigneeName', e.target.value)} placeholder="Bearbeiter..." className="w-32 py-1.5" />
                                            )}
                                            <UI.Button type="submit" size="sm" variant="secondary" className="ml-auto">Add</UI.Button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </UI.Card>
                    )
                })}
            </div>
        </div>
    )
}

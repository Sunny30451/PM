import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { UI } from '../../components/UI.jsx';

// ==========================================
// TASKS ADDON
// ==========================================

export function TasksAddon({ addonId, data, updateAddonData, project, globalAddons, globalBaseTypes }) {
    const tasks = data?.list || [];
    const [newTask, setNewTask] = useState({ name: '', startDate: '', endDate: '', plannedDuration: '', assigneeId: '', assigneeName: '' });

    // Find Team Members
    const teamAddon = project.activeAddons?.find(id => globalBaseTypes.find(bt => bt.id === globalAddons.find(a => a.id === id)?.type)?.coreType === 'team');
    const teamMembers = teamAddon ? (project.addonData?.[teamAddon]?.list || []) : [];
    const hasTeamModuleActive = !!teamAddon;

    // Sync Sprints
    const sprintAddons = project.activeAddons?.filter(id => globalBaseTypes.find(bt => bt.id === globalAddons.find(a => a.id === id)?.type)?.coreType === 'sprints') || [];
    const sprintTasks = sprintAddons.flatMap(sid => {
        const sData = project.addonData?.[sid];
        return sData?.syncWithTasks ? (sData.list || []).flatMap(s => (s.tasks || []).map(t => ({ ...t, text: t.name, isSprint: true, sId: s.id, sName: s.name, aId: sid }))) : [];
    });

    const displayTasks = [...tasks, ...sprintTasks];
    const progress = displayTasks.length ? Math.round((displayTasks.filter(t => t.done).length / displayTasks.length) * 100) : 0;

    const addTask = e => {
        e.preventDefault();
        if (newTask.name.trim()) {
            updateAddonData(addonId, { ...data, list: [...tasks, { id: Date.now().toString(), text: newTask.name, done: false, ...newTask }] });
            setNewTask({ name: '', startDate: '', endDate: '', plannedDuration: '', assigneeId: '', assigneeName: '' });
        }
    };

    const toggle = t => t.isSprint ? updateAddonData(t.aId, { ...project.addonData[t.aId], list: project.addonData[t.aId].list.map(s => s.id === t.sId ? { ...s, tasks: s.tasks.map(x => x.id === t.id ? { ...x, done: !x.done } : x) } : s) }) : updateAddonData(addonId, { ...data, list: tasks.map(x => x.id === t.id ? { ...x, done: !x.done } : x) });
    const remove = t => t.isSprint ? updateAddonData(t.aId, { ...project.addonData[t.aId], list: project.addonData[t.aId].list.map(s => s.id === t.sId ? { ...s, tasks: s.tasks.filter(x => x.id !== t.id) } : s) }) : updateAddonData(addonId, { ...data, list: tasks.filter(x => x.id !== t.id) });

    const updateField = (t, field, value) => {
        if (t.isSprint) {
            const sprintData = project.addonData[t.aId];
            const newList = sprintData.list.map(s => s.id === t.sId ? { ...s, tasks: s.tasks.map(x => x.id === t.id ? { ...x, [field]: value } : x) } : s);
            updateAddonData(t.aId, { ...sprintData, list: newList });
        } else {
            const targetField = field === 'name' ? 'text' : field;
            updateAddonData(addonId, { ...data, list: tasks.map(x => x.id === t.id ? { ...x, [targetField]: value } : x) });
        }
    };

    return (
        <div className="w-full">
            <div className="mb-4"><div className="flex justify-between text-sm mb-1"><span>Fortschritt ({progress}%)</span></div><div className="w-full bg-zinc-200 rounded-full h-2"><div className="bg-teal-500 h-2 rounded-full" style={{ width: `${progress}%` }}></div></div></div>
            <UI.Card>
                <form onSubmit={addTask} className="p-3 bg-zinc-50 flex flex-col gap-2 border-b">
                    <div className="flex gap-2">
                        <UI.Input value={newTask.name} onChange={e => setNewTask({ ...newTask, name: e.target.value })} placeholder="Neue Aufgabe..." required />
                        <UI.Button type="submit">Add</UI.Button>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <UI.Input type="date" size="sm" value={newTask.startDate} onChange={e => setNewTask({ ...newTask, startDate: e.target.value })} title="Startdatum" className="w-32" />
                        <UI.Input type="date" size="sm" value={newTask.endDate} onChange={e => setNewTask({ ...newTask, endDate: e.target.value })} title="Enddatum" className="w-32" />
                        <UI.Input type="number" size="sm" value={newTask.plannedDuration} onChange={e => setNewTask({ ...newTask, plannedDuration: e.target.value })} placeholder="Dauer" title="Geplante Dauer" className="w-24" />
                        {hasTeamModuleActive ? (
                            <UI.Select size="sm" value={newTask.assigneeId} onChange={e => setNewTask({ ...newTask, assigneeId: e.target.value, assigneeName: '' })} className="w-40">
                                <option value="">Bearbeiter...</option>
                                {teamMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </UI.Select>
                        ) : (
                            <UI.Input size="sm" value={newTask.assigneeName} onChange={e => setNewTask({ ...newTask, assigneeName: e.target.value, assigneeId: '' })} placeholder="Bearbeiter..." className="w-40" />
                        )}
                    </div>
                </form>
                <div className="divide-y max-h-[400px] overflow-y-auto">
                    {displayTasks.map(t => (
                        <div key={t.id} className="p-3 flex flex-col hover:bg-zinc-50 group">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-1 overflow-hidden">
                                    <input type="checkbox" checked={!!t.done} onChange={() => toggle(t)} className="w-4 h-4 text-teal-600 rounded" />
                                    {t.isSprint && <UI.Badge color="amber">{t.sName}</UI.Badge>}
                                    <UI.Input size="sm" value={t.text || t.name || ''} onChange={e => updateField(t, 'name', e.target.value)} className={`bg-transparent border-transparent hover:border-zinc-200 focus:border-teal-300 focus:bg-white shadow-none ${t.done ? 'line-through text-zinc-400' : ''}`} />
                                </div>
                                <UI.IconButton icon={Trash2} variant="danger" onClick={() => remove(t)} className="opacity-0 group-hover:opacity-100" />
                            </div>
                            <div className="pl-8 mt-1 flex flex-wrap items-center gap-2">
                                <UI.Input type="date" size="sm" value={t.startDate || ''} onChange={e => updateField(t, 'startDate', e.target.value)} title="Startdatum" className="w-32 py-1" />
                                <UI.Input type="date" size="sm" value={t.endDate || ''} onChange={e => updateField(t, 'endDate', e.target.value)} title="Enddatum" className="w-32 py-1" />
                                <UI.Input type="number" size="sm" placeholder="Dauer" value={t.plannedDuration || ''} onChange={e => updateField(t, 'plannedDuration', e.target.value)} className="w-20 py-1" />
                                {hasTeamModuleActive ? (
                                    <UI.Select size="sm" value={t.assigneeId || ''} onChange={e => updateField(t, 'assigneeId', e.target.value)} className="w-32 py-1">
                                        <option value="">Bearbeiter...</option>
                                        {teamMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                    </UI.Select>
                                ) : (
                                    <UI.Input size="sm" value={t.assigneeName || ''} onChange={e => updateField(t, 'assigneeName', e.target.value)} placeholder="Bearbeiter..." className="w-32 py-1" />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </UI.Card>
        </div>
    );
}

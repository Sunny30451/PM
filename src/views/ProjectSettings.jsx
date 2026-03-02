import React, { useState } from 'react';
import { Trash2, Component } from 'lucide-react';
import { UI } from '../components/UI.jsx';
import { useAppContext } from '../viewmodels/AppViewModel.jsx';
import { IconRegistry } from '../models/initialData.js';

// ==========================================
// PROJECT SETTINGS VIEW
// ==========================================

export function ProjectSettings({ project }) {
    const { globalAddons, updateProject } = useAppContext();

    const toggleAddon = (id) => {
        const active = project.activeAddons || [];
        updateProject(project.id, {
            activeAddons: active.includes(id) ? active.filter(x => x !== id) : [...active, id],
            dashboardLayout: active.includes(id) ? (project.dashboardLayout || []).filter(x => x !== id) : project.dashboardLayout
        });
    };

    return (
        <div className="space-y-8">
            <UI.Card>
                <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-700">
                    <h3 className="text-lg font-bold text-zinc-800 dark:text-white">Projektspezifische Felder</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Definiere Datenfelder, die *nur* für die Details dieses Projekts relevant sind.</p>
                </div>
                <div className="p-6">
                    <ProjectSchemaBuilder project={project} updateProject={updateProject} />
                </div>
            </UI.Card>

            <UI.Card>
                <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-700">
                    <h3 className="text-lg font-bold text-zinc-800 dark:text-white">Verfügbare Module</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Aktiviere benötigte Funktionen aus dem globalen Katalog für dieses Projekt.</p>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {globalAddons.map(addon => {
                        const isActive = project.activeAddons?.includes(addon.id);
                        const Icon = IconRegistry[addon.icon] || Component;
                        return (
                            <div key={addon.id} className={`border rounded-xl p-4 flex items-start space-x-4 transition-all ${isActive ? 'border-teal-500 dark:border-teal-400 bg-teal-50/30 dark:bg-teal-900/20 ring-1 ring-teal-500 dark:ring-teal-400' : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'}`}>
                                <div className={`p-2 rounded-lg ${isActive ? 'bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'}`}><Icon size={20} /></div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-sm text-zinc-800 dark:text-zinc-200">{addon.name}</h4>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 mb-3">{addon.description}</p>
                                    <UI.Button size="sm" variant={isActive ? 'danger' : 'primary'} onClick={() => toggleAddon(addon.id)}>{isActive ? 'Deaktivieren' : 'Aktivieren'}</UI.Button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </UI.Card>
        </div>
    )
}

// ==========================================
// PROJECT SCHEMA BUILDER
// ==========================================

function ProjectSchemaBuilder({ project, updateProject }) {
    const [newField, setNewField] = useState({ label: '', type: 'text', optionsStr: '' });
    const specificSchema = project.specificSchema || [];

    const addField = () => {
        if (!newField.label) return;
        const fieldId = 'proj_' + newField.label.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now();
        const fieldObj = { id: fieldId, label: newField.label, type: newField.type, ...(newField.type === 'select' && { options: newField.optionsStr.split(',').map(s => s.trim()).filter(Boolean) }) };
        updateProject(project.id, { specificSchema: [...specificSchema, fieldObj] });
        setNewField({ label: '', type: 'text', optionsStr: '' });
    };

    const removeField = (id) => {
        updateProject(project.id, { specificSchema: specificSchema.filter(f => f.id !== id) });
    };

    return (
        <div>
            <div className="space-y-2 mb-4">
                {specificSchema.length === 0 && <p className="text-zinc-500 dark:text-zinc-400 italic text-sm">Keine projektspezifischen Felder definiert.</p>}
                {specificSchema.map(field => (
                    <div key={field.id} className="flex items-center justify-between p-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 shadow-sm">
                        <div>
                            <span className="font-medium text-sm text-zinc-800 dark:text-zinc-200">{field.label}</span>
                            <UI.Badge color="teal" className="ml-2">{field.type}</UI.Badge>
                        </div>
                        <UI.IconButton icon={Trash2} variant="danger" onClick={() => removeField(field.id)} />
                    </div>
                ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
                <UI.Input
                    placeholder="Feldname (z.B. Git-Repo URL)"
                    value={newField.label}
                    onChange={e => setNewField({ ...newField, label: e.target.value })}
                    className="flex-1"
                />
                <UI.Select
                    value={newField.type}
                    onChange={e => setNewField({ ...newField, type: e.target.value })}
                    className="sm:w-32"
                >
                    <option value="text">Text</option>
                    <option value="number">Zahl</option>
                    <option value="date">Datum</option>
                    <option value="select">Dropdown</option>
                    <option value="url">URL / Link</option>
                    <option value="email">E-Mail</option>
                </UI.Select>
                {newField.type === 'select' && (
                    <UI.Input
                        placeholder="Optionen (Komma)"
                        value={newField.optionsStr}
                        onChange={e => setNewField({ ...newField, optionsStr: e.target.value })}
                        className="flex-1"
                    />
                )}
                <UI.Button onClick={addField} disabled={!newField.label}>
                    Hinzufügen
                </UI.Button>
            </div>
        </div>
    );
}

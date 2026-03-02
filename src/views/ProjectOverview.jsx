import React, { useState } from 'react';
import { Edit, Save, Briefcase } from 'lucide-react';
import { UI } from '../components/UI.jsx';
import { DynamicInput } from '../components/DynamicInput.jsx';
import { useAppContext } from '../viewmodels/AppViewModel.jsx';

// ==========================================
// PROJECT OVERVIEW (Description + Metadata)
// ==========================================

export function ProjectOverview({ project, isWidget = false }) {
    const { globalSchema, updateProject } = useAppContext();
    const [isEditing, setIsEditing] = useState(false);
    const [data, setData] = useState({ description: project.description, customData: project.customData });

    const startEditing = () => {
        setData({ description: project.description, customData: project.customData });
        setIsEditing(true);
    };

    const handleSave = () => {
        updateProject(project.id, data);
        setIsEditing(false);
    };

    if (isEditing) return (
        <div className="space-y-6 animate-fade-in w-full">
            <UI.Card>
                <div className="p-3 border-b border-zinc-100 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 flex justify-between items-center">
                    <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Details bearbeiten</h4>
                    <div className="flex space-x-2">
                        <UI.Button size="sm" variant="secondary" onClick={() => setIsEditing(false)}>Abbrechen</UI.Button>
                        <UI.Button size="sm" onClick={handleSave}><Save size={14} className="mr-1" /> Speichern</UI.Button>
                    </div>
                </div>
                <div className="p-4 space-y-6">
                    <div>
                        <label className="text-xs font-bold text-zinc-500 mb-2 block uppercase tracking-wider">Beschreibung</label>
                        <UI.Textarea value={data.description || ''} onChange={e => setData({ ...data, description: e.target.value })} className="min-h-[120px]" />
                    </div>

                    {(globalSchema.length > 0 || (project.specificSchema && project.specificSchema.length > 0)) && (
                        <div className={`grid grid-cols-1 ${isWidget ? '' : 'sm:grid-cols-2'} gap-6 pt-4 border-t border-zinc-200 dark:border-zinc-700`}>
                            {globalSchema.length > 0 && (
                                <div>
                                    <label className="text-xs font-bold text-zinc-500 mb-3 block uppercase tracking-wider">Globale Daten</label>
                                    <div className="space-y-3">
                                        {globalSchema.map(f => (
                                            <div key={f.id}>
                                                <label className="text-xs text-zinc-600 dark:text-zinc-400 mb-1 block">{f.label}</label>
                                                <DynamicInput field={f} value={data.customData?.[f.id] || ''} onChange={v => setData({ ...data, customData: { ...data.customData, [f.id]: v } })} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {project.specificSchema && project.specificSchema.length > 0 && (
                                <div>
                                    <label className="text-xs font-bold text-zinc-500 mb-3 block uppercase tracking-wider">Projektspezifische Daten</label>
                                    <div className="space-y-3">
                                        {project.specificSchema.map(f => (
                                            <div key={f.id}>
                                                <label className="text-xs text-zinc-600 dark:text-zinc-400 mb-1 block">{f.label}</label>
                                                <DynamicInput field={f} value={data.customData?.[f.id] || ''} onChange={v => setData({ ...data, customData: { ...data.customData, [f.id]: v } })} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </UI.Card>
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in w-full">
            <UI.Card>
                <div className="p-3 border-b border-zinc-100 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 flex justify-between items-center">
                    <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Beschreibung</h4>
                    <UI.Button size="sm" variant="secondary" onClick={startEditing}>
                        <Edit size={14} className="mr-1" /> Bearbeiten
                    </UI.Button>
                </div>
                <div className="p-4 text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-line leading-relaxed">
                    {project.description || <span className="italic text-zinc-400">Keine Beschreibung hinterlegt.</span>}
                </div>
            </UI.Card>

            {(globalSchema.length > 0 || (project.specificSchema && project.specificSchema.length > 0)) && (
                <div className={`grid grid-cols-1 ${isWidget ? '' : 'sm:grid-cols-2'} gap-4`}>
                    {globalSchema.length > 0 && (
                        <UI.Card>
                            <div className="p-3 border-b border-zinc-100 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
                                <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Globale Daten</h4>
                            </div>
                            <div className="divide-y divide-zinc-100 dark:divide-zinc-700/50">
                                {globalSchema.map(f => (
                                    <div key={f.id} className="p-3 flex justify-between text-sm hover:bg-zinc-50 dark:hover:bg-zinc-700/30 transition-colors">
                                        <span className="text-zinc-500 dark:text-zinc-400">{f.label}</span>
                                        <span className="font-medium text-zinc-800 dark:text-zinc-200">{project.customData?.[f.id] || '-'}</span>
                                    </div>
                                ))}
                            </div>
                        </UI.Card>
                    )}

                    {project.specificSchema && project.specificSchema.length > 0 && (
                        <UI.Card>
                            <div className="p-3 border-b border-zinc-100 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
                                <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Projektspezifische Daten</h4>
                            </div>
                            <div className="divide-y divide-zinc-100 dark:divide-zinc-700/50">
                                {project.specificSchema.map(f => (
                                    <div key={f.id} className="p-3 flex justify-between text-sm hover:bg-zinc-50 dark:hover:bg-zinc-700/30 transition-colors">
                                        <span className="text-zinc-500 dark:text-zinc-400">{f.label}</span>
                                        <span className="font-medium text-teal-700 dark:text-teal-400">{project.customData?.[f.id] || '-'}</span>
                                    </div>
                                ))}
                            </div>
                        </UI.Card>
                    )}
                </div>
            )}
        </div>
    );
}

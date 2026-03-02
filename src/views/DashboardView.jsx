import React, { useState } from 'react';
import {
    Plus, Trash2, Edit, X, FolderOpen, Save, Settings, Briefcase
} from 'lucide-react';
import { UI } from '../components/UI.jsx';
import { DynamicInput } from '../components/DynamicInput.jsx';
import { useAppContext } from '../viewmodels/AppViewModel.jsx';

// ==========================================
// DASHBOARD VIEW
// ==========================================

export function DashboardView({ onEdit }) {
    const { projects, globalSchema, handleDeleteProject, handleSaveProject } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null);

    const openEditProject = (e, project) => { e.stopPropagation(); setEditingProject(project); setIsModalOpen(true); };

    return (
        <div className="max-w-7xl mx-auto p-6 lg:p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">Projekte</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">Verwalte deine Vorhaben und passe sie flexibel an.</p>
                </div>
                <UI.Button onClick={() => { setEditingProject(null); setIsModalOpen(true); }}><Plus size={20} className="mr-2" /> Neues Projekt</UI.Button>
            </div>

            {projects.length === 0 ? (
                <UI.Card className="p-12 text-center">
                    <FolderOpen size={48} className="mx-auto text-zinc-300 dark:text-zinc-600 mb-4" />
                    <h3 className="text-xl font-medium text-zinc-700 dark:text-zinc-300 mb-2">Keine Projekte vorhanden</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 mb-6">Starte dein erstes modulares Vorhaben.</p>
                    <button onClick={() => setIsModalOpen(true)} className="text-teal-600 dark:text-teal-400 font-medium hover:underline">Jetzt erstellen</button>
                </UI.Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map(project => (
                        <UI.Card key={project.id} className="p-6 hover:shadow-lg transition-all cursor-pointer group flex flex-col">
                            <div className="flex justify-between items-start mb-4 h-full" onClick={() => onEdit(project.id)}>
                                <h3 className="text-xl font-bold text-zinc-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors line-clamp-1 flex-1 pr-2">{project.name}</h3>
                                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <UI.IconButton icon={Edit} onClick={(e) => openEditProject(e, project)} />
                                    <UI.IconButton icon={Trash2} variant="danger" onClick={(e) => { e.stopPropagation(); handleDeleteProject(project.id); }} />
                                </div>
                            </div>
                            <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-4 line-clamp-2 flex-1" onClick={() => onEdit(project.id)}>{project.description}</p>

                            <div className="space-y-3 mt-auto pt-2" onClick={() => onEdit(project.id)}>
                                <div className="flex items-center space-x-2">
                                    <UI.Badge color={project.status === 'Aktiv' || project.status === 'In Bearbeitung' ? 'emerald' : project.status === 'Geplant' ? 'cyan' : 'zinc'}>{project.status || 'Neu'}</UI.Badge>
                                    <UI.Badge>{project.activeAddons?.length || 0} Addons</UI.Badge>
                                </div>
                                {globalSchema.length > 0 && (
                                    <div className="pt-3 border-t border-zinc-100 dark:border-zinc-700/50 flex flex-wrap gap-2">
                                        {globalSchema.slice(0, 2).map(field => (
                                            <div key={field.id} className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center">
                                                <span className="font-medium mr-1">{field.label}:</span>
                                                <span className="truncate max-w-[100px] text-zinc-700 dark:text-zinc-300">{project.customData?.[field.id] || '-'}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </UI.Card>
                    ))}
                </div>
            )}

            {isModalOpen && <ProjectFormModal project={editingProject} onClose={() => setIsModalOpen(false)} onSave={handleSaveProject} />}
        </div>
    );
}

// ==========================================
// PROJECT FORM MODAL
// ==========================================

function ProjectFormModal({ project, onClose, onSave }) {
    const { globalSchema } = useAppContext();
    const [formData, setFormData] = useState(project || { name: '', description: '', status: 'Geplant', customData: {} });

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleCustomDataChange = (fieldId, value) => setFormData(prev => ({ ...prev, customData: { ...(prev.customData || {}), [fieldId]: value } }));
    const handleSubmit = (e) => { e.preventDefault(); onSave(formData); onClose(); };

    return (
        <div className="fixed inset-0 bg-zinc-900/50 dark:bg-zinc-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-700 flex justify-between items-center bg-zinc-50 dark:bg-zinc-800/50">
                    <h3 className="text-lg font-bold text-zinc-800 dark:text-white">{project ? 'Projekt bearbeiten' : 'Neues Projekt'}</h3>
                    <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"><X size={20} /></button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                    <form id="project-form" onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Projektname *</label>
                            <UI.Input required name="name" value={formData.name || ''} onChange={handleChange} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Beschreibung</label>
                            <UI.Textarea name="description" value={formData.description || ''} onChange={handleChange} rows={3} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Status</label>
                            <UI.Select name="status" value={formData.status || ''} onChange={handleChange}>
                                <option>Geplant</option><option>In Bearbeitung</option><option>Pausiert</option><option>Abgeschlossen</option>
                            </UI.Select>
                        </div>

                        {globalSchema.length > 0 && (
                            <div className="pt-4 mt-4 border-t border-zinc-200 dark:border-zinc-700">
                                <h4 className="text-sm font-bold text-zinc-800 dark:text-white mb-4 flex items-center"><Settings size={14} className="mr-2 text-teal-500" /> Globale Metadaten</h4>
                                <div className="space-y-4">
                                    {globalSchema.map(field => (
                                        <div key={field.id}>
                                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{field.label}</label>
                                            <DynamicInput field={field} value={formData.customData?.[field.id] || ''} onChange={(val) => handleCustomDataChange(field.id, val)} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {project?.specificSchema?.length > 0 && (
                            <div className="pt-4 mt-4 border-t border-zinc-200 dark:border-zinc-700">
                                <h4 className="text-sm font-bold text-zinc-800 dark:text-white mb-4 flex items-center"><Briefcase size={14} className="mr-2 text-teal-500" /> Projektspezifische Metadaten</h4>
                                <div className="space-y-4">
                                    {project.specificSchema.map(field => (
                                        <div key={field.id}>
                                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{field.label}</label>
                                            <DynamicInput field={field} value={formData.customData?.[field.id] || ''} onChange={(val) => handleCustomDataChange(field.id, val)} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 flex justify-end space-x-3">
                    <UI.Button variant="secondary" onClick={onClose}>Abbrechen</UI.Button>
                    <UI.Button type="submit" form="project-form"><Save size={16} className="mr-2" /> Speichern</UI.Button>
                </div>
            </div>
        </div>
    );
}

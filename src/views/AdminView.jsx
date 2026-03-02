import React, { useState } from 'react';
import { Plus, Trash2, Edit, X, Database, Layers, Component } from 'lucide-react';
import { UI } from '../components/UI.jsx';
import { useAppContext } from '../viewmodels/AppViewModel.jsx';
import { IconRegistry } from '../models/initialData.js';
import { coreTypeLabels, defaultBaseTypeIds } from '../models/constants.js';

// ==========================================
// ADMIN VIEW (Tab Container)
// ==========================================

export function AdminView() {
    const [activeTab, setActiveTab] = useState('schema');

    return (
        <div className="max-w-4xl mx-auto p-6 lg:p-8">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">Administration</h2>
                <p className="text-zinc-500 dark:text-zinc-400 mt-1">Konfiguriere das globale Datenmodell und die verfügbaren Module.</p>
            </div>

            <div className="flex space-x-2 mb-6 border-b border-zinc-200 dark:border-zinc-700 overflow-x-auto">
                {[
                    { id: 'schema', label: 'Daten-Schema', icon: Database },
                    { id: 'basetypes', label: 'Basis-Typen', icon: Layers },
                    { id: 'addons', label: 'Module & Addons', icon: Component }
                ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 font-medium flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? 'border-teal-600 dark:border-teal-400 text-teal-600 dark:text-teal-400' : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-600'}`}>
                        <tab.icon size={18} /><span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {activeTab === 'schema' && <AdminSchemaEditor />}
            {activeTab === 'basetypes' && <AdminBaseTypeEditor />}
            {activeTab === 'addons' && <AdminAddonEditor />}
        </div>
    );
}

// ==========================================
// ADMIN: GLOBAL SCHEMA EDITOR
// ==========================================

function AdminSchemaEditor() {
    const { globalSchema, setGlobalSchema } = useAppContext();
    const [newField, setNewField] = useState({ label: '', type: 'text', optionsStr: '' });

    const addField = () => {
        if (!newField.label) return;
        const fieldId = 'field_' + newField.label.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now();
        const fieldObj = { id: fieldId, label: newField.label, type: newField.type, ...(newField.type === 'select' && { options: newField.optionsStr.split(',').map(s => s.trim()).filter(Boolean) }) };
        setGlobalSchema([...globalSchema, fieldObj]);
        setNewField({ label: '', type: 'text', optionsStr: '' });
    };

    return (
        <UI.Card className="animate-fade-in">
            <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-700/50 bg-zinc-50 dark:bg-zinc-800/50">
                <h3 className="text-lg font-bold text-zinc-800 dark:text-white">Globales Schema anpassen</h3>
            </div>
            <div className="p-6">
                <div className="space-y-3 mb-8">
                    {globalSchema.length === 0 && <p className="text-zinc-500 text-sm">Noch keine Felder definiert.</p>}
                    {globalSchema.map(field => (
                        <div key={field.id} className="flex justify-between p-3 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-800">
                            <div>
                                <span className="font-semibold text-zinc-800 dark:text-zinc-200">{field.label}</span>
                                <UI.Badge color="teal" className="ml-3">{field.type}</UI.Badge>
                            </div>
                            <UI.IconButton icon={Trash2} variant="danger" onClick={() => setGlobalSchema(globalSchema.filter(f => f.id !== field.id))} />
                        </div>
                    ))}
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 flex flex-col sm:flex-row gap-3">
                    <UI.Input placeholder="Feldname" value={newField.label || ''} onChange={e => setNewField({ ...newField, label: e.target.value })} className="flex-1" />
                    <UI.Select value={newField.type || ''} onChange={e => setNewField({ ...newField, type: e.target.value })} className="sm:w-40">
                        <option value="text">Text</option><option value="number">Zahl</option><option value="date">Datum</option><option value="select">Dropdown</option><option value="url">URL</option><option value="email">E-Mail</option>
                    </UI.Select>
                    {newField.type === 'select' && <UI.Input placeholder="Optionen (Komma)" value={newField.optionsStr || ''} onChange={e => setNewField({ ...newField, optionsStr: e.target.value })} className="flex-1" />}
                    <UI.Button onClick={addField} disabled={!newField.label}><Plus size={16} className="mr-1" /> Add</UI.Button>
                </div>
            </div>
        </UI.Card>
    );
}

// ==========================================
// ADMIN: BASE TYPE EDITOR
// ==========================================

function AdminBaseTypeEditor() {
    const { globalBaseTypes, setGlobalBaseTypes } = useAppContext();
    const [newBaseType, setNewBaseType] = useState({ name: '', coreType: 'data_only' });

    const addBaseType = () => {
        if (!newBaseType.name) return;
        setGlobalBaseTypes([...globalBaseTypes, { id: 'bt_' + Date.now(), ...newBaseType }]);
        setNewBaseType({ name: '', coreType: 'data_only' });
    };

    return (
        <UI.Card className="animate-fade-in">
            <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-700/50 bg-zinc-50 dark:bg-zinc-800/50">
                <h3 className="text-lg font-bold text-zinc-800 dark:text-white">Basis-Typen verwalten</h3>
            </div>
            <div className="p-6">
                <div className="space-y-3 mb-8">
                    {globalBaseTypes.map(bt => {
                        const isDefault = defaultBaseTypeIds.includes(bt.id);
                        return (
                            <div key={bt.id} className="flex justify-between p-3 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-800">
                                <div>
                                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">{bt.name}</span>
                                    <UI.Badge color="teal" className="ml-3">Kern: {coreTypeLabels[bt.coreType] || bt.coreType}</UI.Badge>
                                </div>
                                {!isDefault && <UI.IconButton icon={Trash2} variant="danger" onClick={() => setGlobalBaseTypes(globalBaseTypes.filter(b => b.id !== bt.id))} />}
                            </div>
                        )
                    })}
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 flex flex-col sm:flex-row gap-3">
                    <UI.Input placeholder="Name des Typs" value={newBaseType.name || ''} onChange={e => setNewBaseType({ ...newBaseType, name: e.target.value })} className="flex-1" />
                    <UI.Select value={newBaseType.coreType || ''} onChange={e => setNewBaseType({ ...newBaseType, coreType: e.target.value })} className="sm:w-64">
                        {Object.entries(coreTypeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </UI.Select>
                    <UI.Button onClick={addBaseType} disabled={!newBaseType.name}><Plus size={16} className="mr-1" /> Add</UI.Button>
                </div>
            </div>
        </UI.Card>
    );
}

// ==========================================
// ADMIN: ADDON EDITOR
// ==========================================

function AdminAddonEditor() {
    const { globalAddons, setGlobalAddons, globalBaseTypes } = useAppContext();
    const [editingAddon, setEditingAddon] = useState(null);

    const handleSave = (addon) => {
        setGlobalAddons(prev => prev.find(a => a.id === addon.id) ? prev.map(a => a.id === addon.id ? addon : a) : [...prev, addon]);
        setEditingAddon(null);
    };

    if (editingAddon) return <AddonEditForm addon={editingAddon} onSave={handleSave} onCancel={() => setEditingAddon(null)} globalBaseTypes={globalBaseTypes} />;

    return (
        <UI.Card className="animate-fade-in">
            <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-700/50 bg-zinc-50 dark:bg-zinc-800/50 flex justify-between items-center">
                <h3 className="text-lg font-bold text-zinc-800 dark:text-white">Modul-Katalog (Addons)</h3>
                <UI.Button size="sm" onClick={() => setEditingAddon({ id: 'addon_' + Date.now(), name: '', description: '', type: 'notes', icon: 'Component', schema: [] })}><Plus size={14} className="mr-1" /> Neues Modul</UI.Button>
            </div>
            <div className="p-6 space-y-4">
                {globalAddons.map(addon => {
                    const Icon = IconRegistry[addon.icon] || Component;
                    return (
                        <div key={addon.id} className="flex justify-between p-4 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-800">
                            <div className="flex space-x-4">
                                <div className="bg-white dark:bg-zinc-900 p-2 border border-zinc-200 dark:border-zinc-700 rounded-lg text-teal-600 dark:text-teal-400 self-start"><Icon size={24} /></div>
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <h4 className="font-bold text-zinc-800 dark:text-zinc-200">{addon.name}</h4>
                                        <UI.Badge>{(globalBaseTypes || []).find(bt => bt.id === addon.type)?.name || addon.type}</UI.Badge>
                                        {addon.schema?.length > 0 && <UI.Badge color="teal">{addon.schema.length} Felder</UI.Badge>}
                                    </div>
                                    <p className="text-sm text-zinc-500 mt-1">{addon.description}</p>
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                <UI.IconButton icon={Edit} onClick={() => setEditingAddon(addon)} />
                                <UI.IconButton icon={Trash2} variant="danger" onClick={() => setGlobalAddons(globalAddons.filter(a => a.id !== addon.id))} />
                            </div>
                        </div>
                    )
                })}
            </div>
        </UI.Card>
    );
}

// ==========================================
// ADDON EDIT FORM
// ==========================================

function AddonEditForm({ addon, onSave, onCancel, globalBaseTypes }) {
    const [formData, setFormData] = useState(addon);
    const [newField, setNewField] = useState({ label: '', type: 'text', optionsStr: '' });

    const addField = () => {
        if (!newField.label) return;
        const fieldObj = { id: 'field_' + Date.now(), label: newField.label, type: newField.type, ...(newField.type === 'select' && { options: newField.optionsStr.split(',').map(s => s.trim()) }) };
        setFormData(prev => ({ ...prev, schema: [...(prev.schema || []), fieldObj] }));
        setNewField({ label: '', type: 'text', optionsStr: '' });
    };

    return (
        <UI.Card className="animate-fade-in">
            <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-700/50 bg-zinc-50 dark:bg-zinc-800/50 flex justify-between items-center">
                <h3 className="text-lg font-bold text-zinc-800 dark:text-white">Modul bearbeiten</h3>
                <button onClick={onCancel} className="text-zinc-400"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-xs font-bold text-zinc-500 mb-1">Modul Name</label><UI.Input value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
                    <div>
                        <label className="block text-xs font-bold text-zinc-500 mb-1">Basis-Typ</label>
                        <UI.Select value={formData.type || ''} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                            {globalBaseTypes.map(bt => <option key={bt.id} value={bt.id}>{bt.name}</option>)}
                        </UI.Select>
                    </div>
                    <div className="md:col-span-2"><label className="block text-xs font-bold text-zinc-500 mb-1">Beschreibung</label><UI.Input value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} /></div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-zinc-500 mb-2">Icon</label>
                        <div className="flex flex-wrap gap-2">
                            {Object.keys(IconRegistry).map(name => {
                                const IconComp = IconRegistry[name];
                                const active = formData.icon === name;
                                return <button key={name} onClick={() => setFormData({ ...formData, icon: name })} className={`p-2 rounded-lg border ${active ? 'bg-teal-100 border-teal-500 text-teal-700' : 'bg-white dark:bg-zinc-800 border-zinc-200 text-zinc-500'}`}><IconComp size={20} /></button>
                            })}
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-zinc-200 dark:border-zinc-700">
                    <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-2">Zusätzliche Datenfelder</h4>
                    <div className="space-y-2 mb-4">
                        {(formData.schema || []).map(f => (
                            <div key={f.id} className="flex justify-between p-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-800">
                                <div><span className="text-sm font-semibold">{f.label}</span><UI.Badge className="ml-2">{f.type}</UI.Badge></div>
                                <UI.IconButton icon={Trash2} variant="danger" onClick={() => setFormData(prev => ({ ...prev, schema: prev.schema.filter(x => x.id !== f.id) }))} />
                            </div>
                        ))}
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 flex gap-2">
                        <UI.Input placeholder="Feldname" value={newField.label || ''} onChange={e => setNewField({ ...newField, label: e.target.value })} />
                        <UI.Select value={newField.type || ''} onChange={e => setNewField({ ...newField, type: e.target.value })} className="w-32">
                            <option value="text">Text</option><option value="date">Datum</option><option value="select">Dropdown</option>
                        </UI.Select>
                        <UI.Button onClick={addField} disabled={!newField.label}>Add</UI.Button>
                    </div>
                </div>
                <div className="flex justify-end pt-4 space-x-3">
                    <UI.Button variant="secondary" onClick={onCancel}>Abbrechen</UI.Button>
                    <UI.Button onClick={() => onSave(formData)} disabled={!formData.name}>Speichern</UI.Button>
                </div>
            </div>
        </UI.Card>
    )
}

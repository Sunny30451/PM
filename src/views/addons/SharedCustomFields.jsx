import React, { useState } from 'react';
import { Trash2, Database } from 'lucide-react';
import { UI } from '../../components/UI.jsx';
import { DynamicInput } from '../../components/DynamicInput.jsx';

// ==========================================
// SHARED CUSTOM FIELDS COMPONENT
// ==========================================

export function SharedCustomFields({ addonDef, data, updateAddonData, addonId, isWidget }) {
    const [isBuilderOpen, setIsBuilderOpen] = useState(false);
    const [newField, setNewField] = useState({ label: '', type: 'text', optionsStr: '' });

    const globalFields = addonDef.schema || [];
    const specificFields = data?.specificSchema || [];
    const allFields = [...globalFields, ...specificFields];

    if (allFields.length === 0 && isWidget) return null;

    const addField = () => {
        if (!newField.label) return;
        const fieldObj = { id: 'spec_' + Date.now(), label: newField.label, type: newField.type, ...(newField.type === 'select' && { options: newField.optionsStr.split(',').map(s => s.trim()).filter(Boolean) }) };
        updateAddonData(addonId, { ...data, specificSchema: [...specificFields, fieldObj] });
        setNewField({ label: '', type: 'text', optionsStr: '' });
    };

    const removeSpecificField = (fieldId) => {
        updateAddonData(addonId, { ...data, specificSchema: specificFields.filter(f => f.id !== fieldId) });
    };

    return (
        <div className={`mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-700 ${isWidget ? 'w-full' : 'max-w-2xl'}`}>
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-bold flex items-center text-zinc-800 dark:text-zinc-200">
                    <Database size={16} className="mr-2 text-teal-500 dark:text-teal-400" /> Eigene Datenfelder
                </h4>
                {!isWidget && (
                    <UI.Button size="sm" variant="secondary" onClick={() => setIsBuilderOpen(!isBuilderOpen)}>
                        {isBuilderOpen ? 'Schließen' : '+ Feld hinzufügen'}
                    </UI.Button>
                )}
            </div>

            {isBuilderOpen && !isWidget && (
                <div className="mb-4 p-4 bg-teal-50/50 dark:bg-teal-900/10 rounded-xl border border-teal-100 dark:border-teal-500/20">
                    <h5 className="text-xs font-bold text-teal-900 dark:text-teal-300 mb-2">Projektspezifische Felder verwalten</h5>
                    <div className="space-y-2 mb-3">
                        {globalFields.length > 0 && <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">Globale Felder: {globalFields.map(f => f.label).join(', ')}</p>}
                        {specificFields.map(f => (
                            <div key={f.id} className="flex items-center justify-between p-2 bg-white dark:bg-zinc-900 rounded border border-zinc-200 dark:border-zinc-700 shadow-sm">
                                <div><span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{f.label}</span> <UI.Badge color="teal" className="ml-2">{f.type}</UI.Badge></div>
                                <UI.IconButton icon={Trash2} variant="danger" onClick={() => removeSpecificField(f.id)} />
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <UI.Input size="sm" placeholder="Feldname" value={newField.label} onChange={e => setNewField({ ...newField, label: e.target.value })} className="flex-1" />
                        <UI.Select size="sm" value={newField.type} onChange={e => setNewField({ ...newField, type: e.target.value })} className="w-32">
                            <option value="text">Text</option><option value="number">Zahl</option><option value="date">Datum</option><option value="select">Dropdown</option><option value="url">URL</option><option value="email">E-Mail</option>
                        </UI.Select>
                        {newField.type === 'select' && <UI.Input size="sm" placeholder="Optionen (Komma)" value={newField.optionsStr} onChange={e => setNewField({ ...newField, optionsStr: e.target.value })} className="flex-1" />}
                        <UI.Button size="sm" onClick={addField} disabled={!newField.label}>Hinzufügen</UI.Button>
                    </div>
                </div>
            )}

            {allFields.length > 0 ? (
                <div className="space-y-4 bg-zinc-50 dark:bg-zinc-800/50 p-5 rounded-xl border border-zinc-200 dark:border-zinc-700">
                    {allFields.map(f => (
                        <div key={f.id}>
                            <label className="text-sm block mb-1 text-zinc-700 dark:text-zinc-300">{f.label}</label>
                            <DynamicInput field={f} value={data?.customFields?.[f.id] || ''} onChange={v => updateAddonData(addonId, { ...data, customFields: { ...(data?.customFields || {}), [f.id]: v } })} />
                        </div>
                    ))}
                </div>
            ) : (
                !isWidget && <p className="text-sm text-zinc-500 dark:text-zinc-400 italic">Keine zusätzlichen Datenfelder konfiguriert.</p>
            )}
        </div>
    );
}

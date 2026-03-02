import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { UI } from '../../components/UI.jsx';

// ==========================================
// LOCATION ADDON
// ==========================================

export function LocationAddon({ data, updateAddonData, addonId }) {
    const locations = data?.list || [];
    const [loc, setLoc] = useState({ company: '', department: '', street: '', zip: '', city: '', country: '', phone: '', email: '', role: '' });

    const add = e => {
        e.preventDefault();
        if (!loc.company.trim() && !loc.department.trim()) return;
        updateAddonData(addonId, { ...data, list: [...locations, { id: Date.now().toString(), ...loc }] });
        setLoc({ company: '', department: '', street: '', zip: '', city: '', country: '', phone: '', email: '', role: '' });
    };

    const updateLoc = (id, field, value) => {
        updateAddonData(addonId, { ...data, list: locations.map(l => l.id === id ? { ...l, [field]: value } : l) });
    };

    return (
        <div className="w-full">
            <UI.Card className="mb-6">
                <form onSubmit={add} className="p-4 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-700 space-y-3">
                    <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-2">Neuen Standort erfassen</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <UI.Input placeholder="Firma *" value={loc.company} onChange={e => setLoc({ ...loc, company: e.target.value })} required />
                        <UI.Input placeholder="Name / Abteilung" value={loc.department} onChange={e => setLoc({ ...loc, department: e.target.value })} />
                        <div className="sm:col-span-2"><UI.Input placeholder="Straße" value={loc.street} onChange={e => setLoc({ ...loc, street: e.target.value })} /></div>
                        <div className="flex gap-2">
                            <UI.Input placeholder="PLZ" value={loc.zip} onChange={e => setLoc({ ...loc, zip: e.target.value })} className="w-1/3" />
                            <UI.Input placeholder="Ort" value={loc.city} onChange={e => setLoc({ ...loc, city: e.target.value })} className="w-2/3" />
                        </div>
                        <UI.Input placeholder="Land" value={loc.country} onChange={e => setLoc({ ...loc, country: e.target.value })} />
                        <UI.Input type="tel" placeholder="Telefon" value={loc.phone} onChange={e => setLoc({ ...loc, phone: e.target.value })} />
                        <UI.Input type="email" placeholder="E-Mail" value={loc.email} onChange={e => setLoc({ ...loc, email: e.target.value })} />
                        <div className="sm:col-span-2 flex gap-3">
                            <UI.Input placeholder="Funktion (z.B. Hauptsitz, Lieferant)" value={loc.role} onChange={e => setLoc({ ...loc, role: e.target.value })} className="flex-1" />
                            <UI.Button type="submit">Hinzufügen</UI.Button>
                        </div>
                    </div>
                </form>
            </UI.Card>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {locations.length === 0 && <p className="text-center text-zinc-500 dark:text-zinc-400 text-sm py-4">Keine Standorte erfasst.</p>}
                {locations.map(l => (
                    <UI.Card key={l.id} className="relative group transition-all">
                        <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <UI.IconButton icon={Trash2} variant="danger" onClick={() => updateAddonData(addonId, { ...data, list: locations.filter(x => x.id !== l.id) })} className="bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200 dark:border-zinc-700" />
                        </div>
                        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 pr-10">
                            <div className="space-y-2">
                                <UI.Input size="sm" value={l.company} onChange={e => updateLoc(l.id, 'company', e.target.value)} placeholder="Firma" className="font-bold bg-transparent border-transparent hover:border-zinc-200 dark:hover:border-zinc-600 focus:bg-white dark:focus:bg-zinc-900 shadow-none text-base" />
                                <UI.Input size="sm" value={l.department} onChange={e => updateLoc(l.id, 'department', e.target.value)} placeholder="Name / Abteilung" className="bg-transparent border-transparent hover:border-zinc-200 dark:hover:border-zinc-600 focus:bg-white dark:focus:bg-zinc-900 shadow-none" />
                                <UI.Input size="sm" value={l.role} onChange={e => updateLoc(l.id, 'role', e.target.value)} placeholder="Funktion" className="text-xs text-teal-600 dark:text-teal-400 font-medium bg-transparent border-transparent hover:border-zinc-200 dark:hover:border-zinc-600 focus:bg-white dark:focus:bg-zinc-900 shadow-none" />
                            </div>
                            <div className="space-y-2 sm:border-l border-zinc-100 dark:border-zinc-700 sm:pl-4">
                                <UI.Input size="sm" value={l.street} onChange={e => updateLoc(l.id, 'street', e.target.value)} placeholder="Straße" className="bg-transparent border-transparent hover:border-zinc-200 dark:hover:border-zinc-600 focus:bg-white dark:focus:bg-zinc-900 shadow-none text-xs" />
                                <div className="flex gap-2">
                                    <UI.Input size="sm" value={l.zip} onChange={e => updateLoc(l.id, 'zip', e.target.value)} placeholder="PLZ" className="w-1/3 bg-transparent border-transparent hover:border-zinc-200 dark:hover:border-zinc-600 focus:bg-white dark:focus:bg-zinc-900 shadow-none text-xs" />
                                    <UI.Input size="sm" value={l.city} onChange={e => updateLoc(l.id, 'city', e.target.value)} placeholder="Ort" className="w-2/3 bg-transparent border-transparent hover:border-zinc-200 dark:hover:border-zinc-600 focus:bg-white dark:focus:bg-zinc-900 shadow-none text-xs" />
                                </div>
                                <UI.Input size="sm" value={l.country} onChange={e => updateLoc(l.id, 'country', e.target.value)} placeholder="Land" className="bg-transparent border-transparent hover:border-zinc-200 dark:hover:border-zinc-600 focus:bg-white dark:focus:bg-zinc-900 shadow-none text-xs" />
                            </div>
                            <div className="sm:col-span-2 pt-2 border-t border-zinc-100 dark:border-zinc-700 flex flex-col sm:flex-row gap-2">
                                <UI.Input type="tel" size="sm" value={l.phone} onChange={e => updateLoc(l.id, 'phone', e.target.value)} placeholder="Telefon" className="flex-1 bg-transparent border-transparent hover:border-zinc-200 dark:hover:border-zinc-600 focus:bg-white dark:focus:bg-zinc-900 shadow-none text-xs" />
                                <UI.Input type="email" size="sm" value={l.email} onChange={e => updateLoc(l.id, 'email', e.target.value)} placeholder="E-Mail" className="flex-1 bg-transparent border-transparent hover:border-zinc-200 dark:hover:border-zinc-600 focus:bg-white dark:focus:bg-zinc-900 shadow-none text-xs" />
                            </div>
                        </div>
                    </UI.Card>
                ))}
            </div>
        </div>
    );
}

import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { UI } from '../../components/UI.jsx';

// ==========================================
// SOFTWARE ADDON
// ==========================================

export function SoftwareAddon({ data, updateAddonData, addonId }) {
    const sws = data?.list || [];
    const [sw, setSw] = useState({ name: '', url: '' });
    const add = e => { e.preventDefault(); updateAddonData(addonId, { ...data, list: [...sws, { id: Date.now(), ...sw }] }); setSw({ name: '', url: '' }); };

    return (
        <UI.Card>
            <form onSubmit={add} className="p-3 bg-zinc-50 flex gap-2 border-b"><UI.Input placeholder="Software" value={sw.name || ''} onChange={e => setSw({ ...sw, name: e.target.value })} required /><UI.Input placeholder="URL" value={sw.url || ''} onChange={e => setSw({ ...sw, url: e.target.value })} /><UI.Button type="submit">Add</UI.Button></form>
            <div className="divide-y max-h-[400px] overflow-y-auto">
                {sws.map(s => (
                    <div key={s.id} className="p-3 flex justify-between group">
                        <div><p className="font-bold text-sm">{s.name}</p><a href={s.url} target="_blank" className="text-xs text-teal-600">{s.url}</a></div>
                        <UI.IconButton icon={Trash2} variant="danger" onClick={() => updateAddonData(addonId, { ...data, list: sws.filter(x => x.id !== s.id) })} className="opacity-0 group-hover:opacity-100" />
                    </div>
                ))}
            </div>
        </UI.Card>
    )
}

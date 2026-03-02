import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { UI } from '../../components/UI.jsx';

// ==========================================
// TEAM ADDON
// ==========================================

export function TeamAddon({ data, updateAddonData, addonId }) {
    const [member, setMember] = useState({ name: '', role: '' });
    const members = data?.list || [];
    const add = e => { e.preventDefault(); updateAddonData(addonId, { ...data, list: [...members, { id: Date.now(), ...member }] }); setMember({ name: '', role: '' }); };

    return (
        <UI.Card>
            <form onSubmit={add} className="p-3 bg-zinc-50 flex gap-2 border-b"><UI.Input placeholder="Name" value={member.name || ''} onChange={e => setMember({ ...member, name: e.target.value })} required /><UI.Input placeholder="Rolle" value={member.role || ''} onChange={e => setMember({ ...member, role: e.target.value })} /><UI.Button type="submit">Add</UI.Button></form>
            <div className="divide-y max-h-[400px] overflow-y-auto">
                {members.map(m => (
                    <div key={m.id} className="p-3 flex justify-between group">
                        <div><p className="font-bold text-sm">{m.name}</p><p className="text-xs text-zinc-500">{m.role}</p></div>
                        <UI.IconButton icon={Trash2} variant="danger" onClick={() => updateAddonData(addonId, { ...data, list: members.filter(x => x.id !== m.id) })} className="opacity-0 group-hover:opacity-100" />
                    </div>
                ))}
            </div>
        </UI.Card>
    )
}

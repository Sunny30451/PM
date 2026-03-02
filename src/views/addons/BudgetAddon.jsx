import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { UI } from '../../components/UI.jsx';

// ==========================================
// BUDGET ADDON
// ==========================================

export function BudgetAddon({ data, updateAddonData, addonId }) {
    const [expense, setExpense] = useState({ desc: '', amount: '' });
    const exps = data?.expenses || [];
    const spent = exps.reduce((s, e) => s + (Number(e.amount) || 0), 0);

    const add = e => { e.preventDefault(); updateAddonData(addonId, { ...data, expenses: [...exps, { id: Date.now(), ...expense }] }); setExpense({ desc: '', amount: '' }); };
    return (
        <div>
            <div className="grid grid-cols-2 gap-4 mb-4">
                <UI.Card className="p-4 bg-zinc-50"><p className="text-xs font-bold text-zinc-500">Gesamtbudget</p><input type="number" value={data?.total || 0} onChange={e => updateAddonData(addonId, { ...data, total: Number(e.target.value) })} className="bg-transparent text-2xl font-bold w-full outline-none" /></UI.Card>
                <UI.Card className="p-4 bg-zinc-50"><p className="text-xs font-bold text-zinc-500">Ausgegeben</p><p className="text-2xl font-bold">{spent} €</p></UI.Card>
            </div>
            <UI.Card>
                <form onSubmit={add} className="p-3 bg-zinc-50 flex gap-2 border-b"><UI.Input placeholder="Posten" value={expense.desc || ''} onChange={e => setExpense({ ...expense, desc: e.target.value })} required /><UI.Input type="number" placeholder="Betrag" value={expense.amount || ''} onChange={e => setExpense({ ...expense, amount: e.target.value })} className="w-32" required /><UI.Button type="submit">Add</UI.Button></form>
                <div className="divide-y max-h-[300px] overflow-y-auto">
                    {exps.map(e => (
                        <div key={e.id} className="p-3 flex justify-between group"><span className="text-sm">{e.desc}</span><div className="flex gap-4"><span className="font-bold">{e.amount} €</span><UI.IconButton icon={Trash2} variant="danger" onClick={() => updateAddonData(addonId, { ...data, expenses: exps.filter(x => x.id !== e.id) })} className="opacity-0 group-hover:opacity-100 py-0" /></div></div>
                    ))}
                </div>
            </UI.Card>
        </div>
    );
}

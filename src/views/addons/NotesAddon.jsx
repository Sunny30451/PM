import React from 'react';
import { UI } from '../../components/UI.jsx';

// ==========================================
// NOTES ADDON
// ==========================================

export function NotesAddon({ data, updateAddonData, addonId, isWidget }) {
    return <UI.Textarea value={data?.text || ''} onChange={e => updateAddonData(addonId, { ...data, text: e.target.value })} className={`w-full flex-1 ${isWidget ? 'min-h-[250px]' : 'min-h-[400px]'}`} placeholder="Notizen..." />;
}

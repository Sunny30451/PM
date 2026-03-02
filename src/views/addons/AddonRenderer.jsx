import React from 'react';
import { useAppContext } from '../../viewmodels/AppViewModel.jsx';
import { IconRegistry } from '../../models/initialData.js';
import { Component } from 'lucide-react';
import { SharedCustomFields } from './SharedCustomFields.jsx';
import { TasksAddon } from './TasksAddon.jsx';
import { NotesAddon } from './NotesAddon.jsx';
import { BudgetAddon } from './BudgetAddon.jsx';
import { TeamAddon } from './TeamAddon.jsx';
import { LocationAddon } from './LocationAddon.jsx';
import { SprintsAddon } from './SprintsAddon.jsx';
import { SoftwareAddon } from './SoftwareAddon.jsx';
import { DataOnlyAddon } from './DataOnlyAddon.jsx';

// ==========================================
// ADDON RENDERER (Router)
// ==========================================

export function AddonRenderer({ addonId, project, isWidget }) {
    const { globalBaseTypes, globalAddons, updateProject } = useAppContext();
    const addonDef = globalAddons.find(a => a.id === addonId);

    if (!addonDef) return <div className="p-4 bg-rose-50 text-rose-500 rounded-xl">Modul entfernt.</div>;

    const data = project.addonData?.[addonId] || {};
    const baseType = globalBaseTypes.find(bt => bt.id === addonDef.type);
    const coreType = baseType ? baseType.coreType : 'data_only';

    const updateData = (id, newData) => updateProject(project.id, { addonData: { ...project.addonData, [id]: newData } });

    const props = { addonId, addonDef, data, updateAddonData: updateData, isWidget, project, globalAddons, globalBaseTypes };

    const components = {
        tasks: TasksAddon,
        notes: NotesAddon,
        budget: BudgetAddon,
        team: TeamAddon,
        sprints: SprintsAddon,
        software: SoftwareAddon,
        location: LocationAddon,
        data_only: DataOnlyAddon
    };
    const ComponentToRender = components[coreType] || DataOnlyAddon;

    return (
        <div className="flex flex-col h-full w-full">
            {!isWidget && (
                <h3 className="text-2xl font-bold mb-6 flex items-center">
                    {React.createElement(IconRegistry[addonDef.icon] || Component, { className: "mr-3 text-teal-500" })} {addonDef.name}
                </h3>
            )}
            <ComponentToRender {...props} />
            <SharedCustomFields addonDef={addonDef} data={data} updateAddonData={updateData} addonId={addonId} isWidget={isWidget} />
        </div>
    );
}

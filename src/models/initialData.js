import {
    CheckSquare, FileText, DollarSign, List, AlignLeft, PieChart,
    Star, Activity, Component, Users, CalendarDays, AppWindow, MapPin
} from 'lucide-react';

// ==========================================
// ICON REGISTRY
// ==========================================

export const IconRegistry = {
    CheckSquare, FileText, DollarSign, List, AlignLeft, PieChart,
    Star, Activity, Component, Users, CalendarDays, AppWindow, MapPin
};

// ==========================================
// INITIAL GLOBAL SCHEMA
// ==========================================

export const initialGlobalSchema = [
    { id: 'department', label: 'Abteilung', type: 'text' },
    { id: 'priority', label: 'Priorität', type: 'select', options: ['Niedrig', 'Mittel', 'Hoch'] }
];

// ==========================================
// INITIAL GLOBAL BASE TYPES
// ==========================================

export const initialGlobalBaseTypes = [
    { id: 'notes', name: 'Text-Notizen (Freitext)', coreType: 'notes' },
    { id: 'tasks', name: 'Aufgabenliste (To-Dos)', coreType: 'tasks' },
    { id: 'budget', name: 'Zahlen & Budget', coreType: 'budget' },
    { id: 'team', name: 'Team & Personen', coreType: 'team' },
    { id: 'sprints', name: 'Sprintplanung', coreType: 'sprints' },
    { id: 'software', name: 'Software & Zugänge', coreType: 'software' },
    { id: 'location', name: 'Standorte & Adressen', coreType: 'location' },
    { id: 'data_only', name: 'Nur Eigene Datenfelder', coreType: 'data_only' }
];

// ==========================================
// INITIAL GLOBAL ADDONS
// ==========================================

export const initialGlobalAddons = [
    { id: 'tasks', name: 'Aufgabenverwaltung', type: 'tasks', icon: 'CheckSquare', description: 'Verwalte To-Dos und Meilensteine.', schema: [] },
    { id: 'notes', name: 'Notizen & Doku', type: 'notes', icon: 'FileText', description: 'Freitextfeld für Dokumentationen.', schema: [] },
    { id: 'budget', name: 'Budget-Tracker', type: 'budget', icon: 'DollarSign', description: 'Kosten und Budgets im Blick behalten.', schema: [] },
    { id: 'team', name: 'Projektbeteiligte', type: 'team', icon: 'Users', description: 'Verwalte Teammitglieder und Ansprechpartner.', schema: [] },
    { id: 'sprints', name: 'Sprintplanung', type: 'sprints', icon: 'CalendarDays', description: 'Plane Sprints und ordne Aufgaben zu.', schema: [] },
    { id: 'software', name: 'IT & Software', type: 'software', icon: 'AppWindow', description: 'Systeme, URLs und Benutzerzugänge verwalten.', schema: [] },
    { id: 'location', name: 'Standorte', type: 'location', icon: 'MapPin', description: 'Verwalte Firmen, Adressen und Abteilungen.', schema: [] }
];

// ==========================================
// INITIAL PROJECTS (MOCK DATA)
// ==========================================

export const initialProjects = [
    {
        id: 'p1',
        name: 'Website Relaunch',
        description: 'Neugestaltung der Corporate Website mit neuem Branding.',
        status: 'In Bearbeitung',
        customData: { department: 'Marketing', priority: 'Hoch' },
        specificSchema: [{ id: 'target_audience', label: 'Zielgruppe', type: 'text' }],
        activeAddons: ['tasks', 'notes', 'budget', 'team', 'sprints', 'software', 'location'],
        dashboardLayout: ['project-details', 'software', 'location', 'team', 'sprints', 'tasks', 'budget'],
        lockedWidgets: ['project-details'],
        addonData: {
            tasks: {
                list: [
                    { id: 't1', text: 'Design-Drafts prüfen', done: true, startDate: '2026-03-01', endDate: '2026-03-05', plannedDuration: 8, assigneeId: 'm1' },
                    { id: 't2', text: 'Content migrieren', done: false, assigneeId: 'm2' }
                ],
                taskSchema: [],
                customFields: {}
            },
            notes: { text: 'Fokus auf Mobile-First und schnelle Ladezeiten. \n\nFarbschema: Teal/Grau.', customFields: {} },
            budget: {
                total: 15000,
                expenses: [
                    { id: 'e1', date: '2026-03-01', description: 'Server Hosting (Jahresabo)', amount: 1200, actorType: 'other', actorName: 'AWS' },
                    { id: 'e2', date: '2026-03-15', description: 'Freelancer Design', amount: 3300, actorType: 'team', actorId: 'm2' }
                ],
                customFields: {}
            },
            team: {
                list: [
                    { id: 'm1', name: 'Max Mustermann', role: 'Projektleiter', email: 'max@example.com', phone: '+49 123 456789' },
                    { id: 'm2', name: 'Anna Schmidt', role: 'UX Designerin', email: 'anna@example.com', phone: '' }
                ],
                customFields: {}
            },
            sprints: {
                syncWithTasks: true,
                list: [{
                    id: 'sp1', name: 'Sprint 1: MVP', startDate: '2026-03-01', endDate: '2026-03-14',
                    tasks: [{ id: 'spt1', name: 'Header-Design', description: 'Navigation und Logo einbauen', startDate: '2026-03-01', endDate: '2026-03-03', plannedDuration: 4, assigneeId: 'm2', done: false }]
                }],
                customFields: {}
            },
            software: {
                list: [{
                    id: 'sw1', name: 'WordPress Core', function: 'CMS Backend', installedOn: 'Hetzner Cloud', adminUrl: 'https://admin.example.com', serviceUrl: 'https://example.com', responsibleId: 'm1',
                    users: [{ id: 'u1', teamMemberId: 'm2', username: 'anna_editor', password: '***', description: 'Redakteurszugang' }]
                }],
                customFields: {}
            },
            location: {
                list: [{
                    id: 'loc1', company: 'TechNova GmbH', department: 'Hauptquartier', street: 'Innovationspark 1', zip: '10115', city: 'Berlin', country: 'Deutschland', phone: '+49 30 1234567', email: 'hello@technova.de', role: 'Kunde'
                }],
                customFields: {}
            }
        }
    }
];

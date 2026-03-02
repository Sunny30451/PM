import React, { useState } from 'react';
import {
    LayoutDashboard, Settings, Briefcase, Sun, Moon, Monitor
} from 'lucide-react';

// ==========================================
// HEADER COMPONENT
// ==========================================

export function Header({ view, setView, themePref, setThemePref }) {
    return (
        <header className="bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm transition-colors duration-200">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setView('dashboard')}>
                <div className="bg-teal-600 dark:bg-teal-500 p-2 rounded-lg text-white">
                    <Briefcase size={24} />
                </div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-emerald-500 dark:from-teal-400 dark:to-emerald-400">
                    ModulPro
                </h1>
            </div>
            <nav className="flex space-x-1 items-center">
                <button onClick={() => setView('dashboard')} className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center space-x-2 ${view === 'dashboard' || view === 'project' ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700'}`}>
                    <LayoutDashboard size={18} /><span>Dashboard</span>
                </button>
                <button onClick={() => setView('admin')} className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center space-x-2 ${view === 'admin' ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700'}`}>
                    <Settings size={18} /><span>Administration</span>
                </button>
                <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-700 mx-2"></div>
                <ThemeSelector themePref={themePref} setThemePref={setThemePref} />
            </nav>
        </header>
    );
}

// ==========================================
// THEME SELECTOR COMPONENT
// ==========================================

function ThemeSelector({ themePref, setThemePref }) {
    const [isOpen, setIsOpen] = useState(false);
    const Icon = themePref === 'dark' ? Moon : themePref === 'light' ? Sun : Monitor;

    return (
        <div className="relative ml-2">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-md font-medium transition-colors flex items-center justify-center text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700" title="Design anpassen">
                <Icon size={18} />
            </button>
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-lg z-50 overflow-hidden py-1">
                        {['light', 'dark', 'system'].map(mode => (
                            <button key={mode} onClick={() => { setThemePref(mode); setIsOpen(false) }} className={`w-full px-4 py-2 text-sm text-left flex items-center space-x-3 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 ${themePref === mode ? 'text-teal-600 dark:text-teal-400 font-bold' : 'text-zinc-700 dark:text-zinc-300'}`}>
                                {mode === 'light' ? <Sun size={14} /> : mode === 'dark' ? <Moon size={14} /> : <Monitor size={14} />}
                                <span className="capitalize">{mode === 'light' ? 'Hell' : mode === 'dark' ? 'Dunkel' : 'System'}</span>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

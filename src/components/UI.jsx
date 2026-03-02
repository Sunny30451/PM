import React from 'react';

// ==========================================
// SHARED UI COMPONENTS (Design System)
// ==========================================

export const UI = {
    Input: ({ className = '', size = 'md', ...props }) => {
        const sizes = { sm: "px-2 py-1 text-xs", md: "px-3 py-2 text-sm", lg: "px-4 py-2.5 text-base" };
        return (
            <input className={`w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-600 text-zinc-800 dark:text-zinc-100 rounded-md outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 transition-all ${sizes[size]} ${className}`} {...props} />
        )
    },
    Select: ({ className = '', size = 'md', children, ...props }) => {
        const sizes = { sm: "px-2 py-1 text-xs", md: "px-3 py-2 text-sm", lg: "px-4 py-2.5 text-base" };
        return (
            <select className={`w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-600 text-zinc-800 dark:text-zinc-100 rounded-md outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 transition-all ${sizes[size]} ${className}`} {...props}>
                {children}
            </select>
        )
    },
    Textarea: ({ className = '', ...props }) => (
        <textarea className={`w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-600 text-zinc-800 dark:text-zinc-100 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 text-sm transition-all ${className}`} {...props} />
    ),
    Button: ({ variant = 'primary', size = 'md', className = '', children, ...props }) => {
        const baseStyle = "rounded-md font-medium transition-colors flex items-center justify-center whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed";
        const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm", lg: "px-5 py-2.5" };
        const variants = {
            primary: "bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white shadow-sm",
            secondary: "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300",
            danger: "bg-rose-100 hover:bg-rose-200 dark:bg-rose-900/30 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-400",
            outline: "border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
        };
        return <button className={`${baseStyle} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>{children}</button>;
    },
    IconButton: ({ icon: Icon, onClick, variant = 'ghost', className = '', title }) => {
        const variants = {
            ghost: "text-zinc-400 hover:text-teal-600 dark:text-zinc-500 dark:hover:text-teal-400 hover:bg-zinc-100 dark:hover:bg-zinc-800",
            danger: "text-zinc-400 hover:text-rose-600 dark:text-zinc-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30",
        };
        return (
            <button type="button" onClick={onClick} title={title} className={`p-1.5 rounded-lg transition-colors ${variants[variant]} ${className}`}>
                <Icon size={16} />
            </button>
        );
    },
    Card: ({ children, className = '' }) => (
        <div className={`bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-sm overflow-hidden ${className}`}>
            {children}
        </div>
    ),
    Badge: ({ children, color = 'zinc', className = '' }) => {
        const colors = {
            zinc: "bg-zinc-100 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300",
            teal: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
            emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
            cyan: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
            amber: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
        };
        return <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded ${colors[color]} ${className}`}>{children}</span>;
    }
};

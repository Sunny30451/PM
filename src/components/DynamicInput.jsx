import React from 'react';
import { UI } from './UI.jsx';

/**
 * DynamicInput - Renders the appropriate input type based on a field schema definition.
 * Supports: text, number, date, url, email, select (dropdown).
 */
export function DynamicInput({ field, value, onChange }) {
    if (field.type === 'select' && field.options) {
        return (
            <UI.Select value={value || ''} onChange={(e) => onChange(e.target.value)}>
                <option value="">Bitte wählen...</option>
                {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </UI.Select>
        );
    }
    const type = field.type === 'url' ? 'url' : field.type === 'email' ? 'email' : field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text';
    return <UI.Input type={type} value={value || ''} onChange={(e) => onChange(e.target.value)} />;
}

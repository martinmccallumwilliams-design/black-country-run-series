/**
 * Admin Dashboard — Manage entries, assign numbers, upload results
 * Protected — requires Supabase auth login
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    ArrowLeft,
    Users,
    Hash,
    Upload,
    Download,
    Search,
    Eye,
    Edit3,
    Save,
    X,
    CheckCircle2,
    AlertCircle,
    LogIn,
    LogOut,
    Trophy,
    Mail,
    Filter,
} from 'lucide-react';
import { supabase, type Entry, type RaceResult } from '../lib/supabase';

// --- Auth Component ---
function AdminLogin({ onLogin }: { onLogin: () => void }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const { error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) {
            setError(authError.message);
            setLoading(false);
        } else {
            onLogin();
        }
    };

    return (
        <div className="min-h-screen bg-brand-dark flex items-center justify-center px-6">
            <div className="glass p-12 rounded-3xl max-w-md w-full">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-brand-red/20 text-brand-red rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <LogIn size={32} />
                    </div>
                    <h1 className="text-3xl font-display font-bold mb-2">Admin Login</h1>
                    <p className="text-gray-400 text-sm">Black Country Run Series Dashboard</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-red transition-colors"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-red transition-colors"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>

                    {error && (
                        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-gradient text-white py-4 rounded-xl font-bold"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
}

// --- Main Dashboard ---
type Tab = 'registrations' | 'entries' | 'results';

export default function AdminPage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>('entries');

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        setLoading(false);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setUser(null);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-brand-dark flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-brand-red border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!user) {
        return <AdminLogin onLogin={checkAuth} />;
    }

    return (
        <div className="min-h-screen bg-brand-dark pt-8 pb-24 px-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <a href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors text-sm">
                            <ArrowLeft size={16} /> Back to Site
                        </a>
                        <h1 className="text-3xl font-display font-bold">Admin Dashboard</h1>
                        <p className="text-gray-400 text-sm mt-1">Logged in as {user.email}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="glass px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <LogOut size={16} /> Sign Out
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-8 overflow-x-auto">
                    {([
                        { id: 'registrations', label: 'Email Signups', icon: <Mail size={16} /> },
                        { id: 'entries', label: 'Race Entries', icon: <Users size={16} /> },
                        { id: 'results', label: 'Results', icon: <Trophy size={16} /> },
                    ] as { id: Tab; label: string; icon: React.ReactNode }[]).map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all whitespace-nowrap ${activeTab === tab.id
                                    ? 'bg-brand-red text-white'
                                    : 'glass text-gray-400 hover:text-white'
                                }`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'registrations' && <RegistrationsTab />}
                {activeTab === 'entries' && <EntriesTab />}
                {activeTab === 'results' && <ResultsTab />}
            </div>
        </div>
    );
}

// --- Registrations Tab ---
function RegistrationsTab() {
    const [registrations, setRegistrations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRegistrations();
    }, []);

    const loadRegistrations = async () => {
        const { data, error } = await supabase
            .from('registrations')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) setRegistrations(data);
        setLoading(false);
    };

    const exportCSV = () => {
        const headers = ['First Name', 'Email', 'Club', 'Races Interested', 'Date'];
        const rows = registrations.map(r => [
            r.first_name,
            r.email,
            r.club || '',
            (r.races_interested || []).join('; '),
            new Date(r.created_at).toLocaleDateString(),
        ]);
        const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'registrations.csv';
        a.click();
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div className="text-sm text-gray-400">
                    <span className="text-white font-bold text-lg">{registrations.length}</span> interest signups
                </div>
                <button
                    onClick={exportCSV}
                    className="glass px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                    <Download size={16} /> Export CSV
                </button>
            </div>

            <div className="glass rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase text-gray-500">Name</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase text-gray-500">Email</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase text-gray-500">Club</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase text-gray-500">Interested In</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase text-gray-500">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {registrations.map(reg => (
                                <tr key={reg.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-bold">{reg.first_name}</td>
                                    <td className="px-6 py-4 text-gray-400">{reg.email}</td>
                                    <td className="px-6 py-4 text-gray-400">{reg.club || '—'}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {(reg.races_interested || []).map((race: string) => (
                                                <span key={race} className="text-[10px] bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                                                    {race}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 text-xs">
                                        {new Date(reg.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// --- Entries Tab ---
function EntriesTab() {
    const [entries, setEntries] = useState<Entry[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingNumber, setEditingNumber] = useState<string | null>(null);
    const [numberValue, setNumberValue] = useState('');

    useEffect(() => {
        loadEntries();
    }, []);

    const loadEntries = async () => {
        const { data, error } = await supabase
            .from('entries')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) setEntries(data);
        setLoading(false);
    };

    const assignNumber = async (entryId: string) => {
        const num = parseInt(numberValue);
        if (isNaN(num)) return;

        const { error } = await supabase
            .from('entries')
            .update({ race_number: num })
            .eq('id', entryId);

        if (!error) {
            setEntries(prev =>
                prev.map(e => (e.id === entryId ? { ...e, race_number: num } : e))
            );
            setEditingNumber(null);
            setNumberValue('');
        }
    };

    const updatePaymentStatus = async (entryId: string, status: string) => {
        const { error } = await supabase
            .from('entries')
            .update({ payment_status: status })
            .eq('id', entryId);

        if (!error) {
            setEntries(prev =>
                prev.map(e => (e.id === entryId ? { ...e, payment_status: status as any } : e))
            );
        }
    };

    const exportCSV = () => {
        const headers = ['Race No', 'First Name', 'Last Name', 'Email', 'DOB', 'Gender', 'Club', 'Entry Type', 'Races', 'Payment', 'Emergency Contact', 'Emergency Phone', 'Medical'];
        const rows = entries.map(e => [
            e.race_number || '',
            e.first_name,
            e.last_name,
            e.email,
            e.date_of_birth,
            e.gender,
            e.club || '',
            e.entry_type,
            (e.races || []).join('; '),
            e.payment_status,
            e.emergency_contact,
            e.emergency_phone,
            e.medical_info || '',
        ]);
        const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'race-entries.csv';
        a.click();
    };

    const filteredEntries = entries.filter(e => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            e.first_name.toLowerCase().includes(q) ||
            e.last_name.toLowerCase().includes(q) ||
            e.email.toLowerCase().includes(q) ||
            (e.club || '').toLowerCase().includes(q) ||
            String(e.race_number).includes(q)
        );
    });

    if (loading) return <LoadingSpinner />;

    return (
        <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div className="text-sm text-gray-400">
                    <span className="text-white font-bold text-lg">{entries.length}</span> entries
                    <span className="mx-2">·</span>
                    <span className="text-green-400 font-bold">{entries.filter(e => e.payment_status === 'paid').length}</span> paid
                    <span className="mx-2">·</span>
                    <span className="text-yellow-400 font-bold">{entries.filter(e => e.payment_status === 'pending').length}</span> pending
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-brand-red"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={exportCSV}
                        className="glass px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <Download size={16} /> CSV
                    </button>
                </div>
            </div>

            <div className="glass rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="px-4 py-4 text-left text-xs font-bold uppercase text-gray-500">No.</th>
                                <th className="px-4 py-4 text-left text-xs font-bold uppercase text-gray-500">Name</th>
                                <th className="px-4 py-4 text-left text-xs font-bold uppercase text-gray-500">Email</th>
                                <th className="px-4 py-4 text-left text-xs font-bold uppercase text-gray-500">Gender</th>
                                <th className="px-4 py-4 text-left text-xs font-bold uppercase text-gray-500">Club</th>
                                <th className="px-4 py-4 text-left text-xs font-bold uppercase text-gray-500">Entry</th>
                                <th className="px-4 py-4 text-left text-xs font-bold uppercase text-gray-500">Races</th>
                                <th className="px-4 py-4 text-left text-xs font-bold uppercase text-gray-500">Payment</th>
                                <th className="px-4 py-4 text-left text-xs font-bold uppercase text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEntries.map(entry => (
                                <tr key={entry.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-4">
                                        {editingNumber === entry.id ? (
                                            <div className="flex items-center gap-1">
                                                <input
                                                    type="number"
                                                    className="w-16 bg-white/10 border border-brand-red rounded px-2 py-1 text-sm"
                                                    value={numberValue}
                                                    onChange={e => setNumberValue(e.target.value)}
                                                    autoFocus
                                                />
                                                <button onClick={() => assignNumber(entry.id!)} className="text-green-400 hover:text-green-300">
                                                    <Save size={14} />
                                                </button>
                                                <button onClick={() => setEditingNumber(null)} className="text-gray-500 hover:text-gray-300">
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => { setEditingNumber(entry.id!); setNumberValue(String(entry.race_number || '')); }}
                                                className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors group"
                                            >
                                                <span className="font-display font-bold">{entry.race_number || '—'}</span>
                                                <Edit3 size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </button>
                                        )}
                                    </td>
                                    <td className="px-4 py-4 font-bold whitespace-nowrap">{entry.first_name} {entry.last_name}</td>
                                    <td className="px-4 py-4 text-gray-400 text-xs">{entry.email}</td>
                                    <td className="px-4 py-4 text-gray-400">{entry.gender}</td>
                                    <td className="px-4 py-4 text-gray-400 text-xs">{entry.club || '—'}</td>
                                    <td className="px-4 py-4">
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${entry.entry_type === 'series' ? 'bg-brand-red/20 text-brand-red' : 'bg-white/10 text-gray-400'
                                            }`}>
                                            {entry.entry_type}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {(entry.races || []).map((race: string) => (
                                                <span key={race} className="text-[9px] bg-white/5 px-1.5 py-0.5 rounded border border-white/10">
                                                    {race.replace(' 5K', '')}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <select
                                            value={entry.payment_status}
                                            onChange={e => updatePaymentStatus(entry.id!, e.target.value)}
                                            className={`text-xs font-bold rounded-full px-3 py-1 bg-transparent border cursor-pointer ${entry.payment_status === 'paid'
                                                    ? 'border-green-500/30 text-green-400'
                                                    : entry.payment_status === 'pending'
                                                        ? 'border-yellow-500/30 text-yellow-400'
                                                        : 'border-red-500/30 text-red-400'
                                                }`}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="paid">Paid</option>
                                            <option value="refunded">Refunded</option>
                                        </select>
                                    </td>
                                    <td className="px-4 py-4">
                                        <button className="text-gray-500 hover:text-white transition-colors" title="View details">
                                            <Eye size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// --- Results Tab ---
function ResultsTab() {
    const [message, setMessage] = useState('');

    return (
        <div className="glass p-12 rounded-3xl text-center">
            <Trophy size={48} className="text-brand-red mx-auto mb-6" />
            <h2 className="text-2xl font-display font-bold mb-4">Results Management</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
                After each race, you can upload results directly to the database. Results will automatically appear on the public results page.
            </p>
            <div className="glass p-6 rounded-2xl text-left max-w-lg mx-auto space-y-4">
                <h3 className="font-bold text-sm uppercase text-gray-500 tracking-wider">How to upload results:</h3>
                <ol className="list-decimal list-inside space-y-3 text-sm text-gray-300">
                    <li>Go to your <strong>Supabase Dashboard</strong> → Table Editor → <code className="bg-white/10 px-1 rounded">results</code></li>
                    <li>Click <strong>"Insert row"</strong> or use the CSV import feature</li>
                    <li>Match each result to an <code className="bg-white/10 px-1 rounded">entry_id</code> from the entries table</li>
                    <li>Fill in time, position, and category data</li>
                    <li>Results appear instantly on the <a href="/results" className="text-brand-red underline">public results page</a></li>
                </ol>
            </div>
            {message && (
                <div className="mt-4 text-green-400 text-sm">{message}</div>
            )}
        </div>
    );
}

// --- Helpers ---
function LoadingSpinner() {
    return (
        <div className="p-16 text-center text-gray-500">
            <div className="animate-spin w-8 h-8 border-2 border-brand-red border-t-transparent rounded-full mx-auto mb-4" />
            Loading...
        </div>
    );
}

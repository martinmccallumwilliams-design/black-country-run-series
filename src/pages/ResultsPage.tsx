/**
 * Results Page — Public race results display
 * Shows results for each race with filtering and search
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
    ArrowLeft,
    Trophy,
    Search,
    Clock,
    Medal,
    ChevronDown,
    Users,
} from 'lucide-react';
import { getResults, type RaceResult } from '../lib/supabase';
import SEO from '../components/SEO';

const RACE_TABS = [
    { id: 'Andy Holden 5K', name: 'Andy Holden 5K', date: 'Wed 8th July • 7:15pm' },
    { id: 'GWR 5K', name: 'GWR 5K', date: 'Thu 23rd July • 7:15pm' },
    { id: 'Dudley Zoo 5K', name: 'Dudley Zoo 5K', date: 'Wed 29th July • 7:15pm' },
];

export default function ResultsPage() {
    const [activeRace, setActiveRace] = useState(RACE_TABS[0].id);
    const [results, setResults] = useState<RaceResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [genderFilter, setGenderFilter] = useState<'all' | 'M' | 'F'>('all');

    useEffect(() => {
        loadResults();
    }, [activeRace]);

    const loadResults = async () => {
        setLoading(true);
        try {
            const data = await getResults(activeRace);
            setResults(data || []);
        } catch (err) {
            console.error('Failed to load results:', err);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredResults = results.filter(r => {
        const entry = r.entry as any;
        if (!entry) return false;

        const nameMatch =
            !searchQuery ||
            `${entry.first_name} ${entry.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
            entry.club?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            String(entry.race_number).includes(searchQuery);

        const genderMatch = genderFilter === 'all' || entry.gender === genderFilter;

        return nameMatch && genderMatch;
    });

    const formatTime = (time: string | null | undefined) => {
        if (!time) return '—';
        // Supabase intervals come as HH:MM:SS format
        return time;
    };

    return (
        <div className="min-h-screen bg-brand-dark pt-8 pb-24 px-6">
            <SEO
                title="Race Results | Black Country Run Series 2026"
                description="View the official race results for the Black Country Run Series 2026. Search by name, club, or race number across all three 5K events."
                canonical="/results"
            />
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <a href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors text-sm">
                        <ArrowLeft size={16} /> Back to Home
                    </a>
                    <h1 className="text-4xl md:text-6xl font-display font-bold mb-4">
                        RACE <span className="text-brand-red">RESULTS</span>
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Black Country Run Series 2026
                    </p>
                </div>

                {/* Race Tabs */}
                <div className="flex flex-wrap gap-2 justify-center mb-8">
                    {RACE_TABS.map(race => (
                        <button
                            key={race.id}
                            onClick={() => setActiveRace(race.id)}
                            className={`px-6 py-3 rounded-full font-bold text-sm transition-all ${activeRace === race.id
                                ? 'btn-gradient text-white'
                                : 'glass text-gray-400 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            {race.name}
                        </button>
                    ))}
                </div>

                {/* Filters */}
                <div className="glass p-4 rounded-2xl mb-8 flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search by name, club, or race number..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-brand-red transition-colors text-sm"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        {(['all', 'M', 'F'] as const).map(g => (
                            <button
                                key={g}
                                onClick={() => setGenderFilter(g)}
                                className={`px-4 py-3 rounded-xl text-sm font-bold transition-all border ${genderFilter === g
                                    ? 'bg-brand-red border-brand-red text-white'
                                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                    }`}
                            >
                                {g === 'all' ? 'All' : g === 'M' ? 'Men' : 'Women'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Results Table */}
                <div className="glass rounded-3xl overflow-hidden">
                    {loading ? (
                        <div className="p-16 text-center text-gray-500">
                            <div className="animate-spin w-8 h-8 border-2 border-brand-red border-t-transparent rounded-full mx-auto mb-4" />
                            Loading results...
                        </div>
                    ) : filteredResults.length === 0 ? (
                        <div className="p-16 text-center">
                            <Trophy size={48} className="text-gray-600 mx-auto mb-4" />
                            <h3 className="text-xl font-display font-bold mb-2 text-gray-400">
                                {results.length === 0 ? 'Results Coming Soon' : 'No Results Found'}
                            </h3>
                            <p className="text-gray-500 text-sm">
                                {results.length === 0
                                    ? 'Results will be published here after race day. Check back soon!'
                                    : 'Try adjusting your search or filter criteria.'}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-white/10 text-left">
                                        <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 tracking-wider">Pos</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 tracking-wider">No.</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 tracking-wider">Name</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 tracking-wider">Club</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 tracking-wider">Cat</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 tracking-wider">Gun Time</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 tracking-wider">Chip Time</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 tracking-wider">Gen Pos</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 tracking-wider">Cat Pos</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredResults.map((result, i) => {
                                        const entry = result.entry as any;
                                        const isTop3 = (result.position || 0) <= 3;
                                        return (
                                            <motion.tr
                                                key={result.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: i * 0.02 }}
                                                className={`border-b border-white/5 hover:bg-white/5 transition-colors ${isTop3 ? 'bg-brand-red/5' : ''
                                                    }`}
                                            >
                                                <td className="px-6 py-4 font-display font-bold">
                                                    {isTop3 ? (
                                                        <span className="flex items-center gap-1">
                                                            <Medal size={14} className="text-brand-red" />
                                                            {result.position}
                                                        </span>
                                                    ) : (
                                                        result.position
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-gray-400">{entry?.race_number || '—'}</td>
                                                <td className="px-6 py-4 font-bold">{entry?.first_name} {entry?.last_name}</td>
                                                <td className="px-6 py-4 text-gray-400">{entry?.club || '—'}</td>
                                                <td className="px-6 py-4">
                                                    <span className="text-xs bg-white/5 px-2 py-1 rounded-full border border-white/10">
                                                        {result.category || '—'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-mono">{formatTime(result.finish_time)}</td>
                                                <td className="px-6 py-4 font-mono text-brand-red font-bold">{formatTime(result.chip_time)}</td>
                                                <td className="px-6 py-4 text-gray-400">{result.gender_position || '—'}</td>
                                                <td className="px-6 py-4 text-gray-400">{result.category_position || '—'}</td>
                                            </motion.tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Stats Bar */}
                {filteredResults.length > 0 && (
                    <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                            <Users size={14} />
                            {filteredResults.length} finishers shown
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

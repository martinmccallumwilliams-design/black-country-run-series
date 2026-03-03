/**
 * Race Entry Form — Full registration with runner details
 * Collects all info needed for race day administration
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
    CheckCircle2,
    ArrowRight,
    ArrowLeft,
    ShieldCheck,
    CreditCard,
    AlertCircle,
} from 'lucide-react';
import { submitEntry } from '../lib/supabase';

const RACES = [
    { id: 'Andy Holden 5K', name: 'Andy Holden 5K', date: 'Wed 8th July • 7:15pm', location: 'Baggeridge Country Park' },
    { id: 'GWR 5K', name: 'GWR 5K', date: 'Thu 23rd July • 7:15pm', location: 'Railway Walk, Wombourne' },
    { id: 'Dudley Zoo 5K', name: 'Dudley Zoo 5K', date: 'Wed 29th July • 7:15pm', location: 'Dudley Zoo and Castle' },
];

type EntryType = 'series' | 'individual';

interface FormData {
    firstName: string;
    lastName: string;
    email: string;
    dateOfBirth: string;
    gender: 'M' | 'F' | '';
    club: string;
    entryType: EntryType;
    races: string[];
    emergencyContact: string;
    emergencyPhone: string;
    medicalInfo: string;
    tShirtSize: string;
    agreeTerms: boolean;
    agreeData: boolean;
}

const INITIAL_FORM: FormData = {
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: '',
    gender: '',
    club: '',
    entryType: 'series',
    races: [],
    emergencyContact: '',
    emergencyPhone: '',
    medicalInfo: '',
    tShirtSize: '',
    agreeTerms: false,
    agreeData: false,
};

export default function EntryPage() {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState<FormData>(INITIAL_FORM);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');

    const update = (field: keyof FormData, value: any) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const totalSteps = 3;

    const seriesPrice = 35;
    const individualPrice = 15;
    const totalPrice = form.entryType === 'series' ? seriesPrice : individualPrice * form.races.length;

    const canProceedStep1 =
        form.firstName && form.lastName && form.email && form.dateOfBirth && form.gender;

    const canProceedStep2 =
        form.entryType === 'series' || form.races.length > 0;

    const canSubmit =
        form.emergencyContact && form.emergencyPhone && form.agreeTerms && form.agreeData;

    const handleSubmit = async () => {
        if (!canSubmit) return;
        setStatus('loading');
        setErrorMsg('');

        try {
            await submitEntry({
                first_name: form.firstName,
                last_name: form.lastName,
                email: form.email,
                date_of_birth: form.dateOfBirth,
                gender: form.gender as 'M' | 'F',
                club: form.club || undefined,
                entry_type: form.entryType,
                races: form.entryType === 'series' ? RACES.map(r => r.id) : form.races,
                emergency_contact: form.emergencyContact,
                emergency_phone: form.emergencyPhone,
                medical_info: form.medicalInfo || undefined,
                t_shirt_size: form.tShirtSize || undefined,
                payment_id: undefined,
            });

            setStatus('success');
        } catch (err: any) {
            console.error('Entry submission error:', err);
            setErrorMsg(err?.message || 'Something went wrong. Please try again.');
            setStatus('error');
        }
    };

    if (status === 'success') {
        return (
            <div className="min-h-screen bg-brand-dark flex items-center justify-center px-6 py-24">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass p-12 rounded-3xl text-center max-w-lg w-full"
                >
                    <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
                        <CheckCircle2 size={40} />
                    </div>
                    <h2 className="text-4xl font-display font-bold mb-4">Entry Received!</h2>
                    <p className="text-gray-400 mb-4 text-lg">
                        Thanks <span className="text-white font-bold">{form.firstName}</span>! Your entry for the{' '}
                        <span className="text-brand-red font-bold">
                            {form.entryType === 'series' ? 'Full Series' : form.races.join(', ')}
                        </span>{' '}
                        has been received.
                    </p>
                    <p className="text-gray-500 mb-8">
                        You'll receive a confirmation email shortly with payment details and your race information.
                    </p>
                    <div className="flex flex-col gap-3">
                        <a href="/" className="btn-gradient text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2">
                            Back to Home
                        </a>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-brand-dark pt-8 pb-24 px-6">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <a href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors text-sm">
                        <ArrowLeft size={16} /> Back to Home
                    </a>
                    <h1 className="text-4xl md:text-6xl font-display font-bold mb-4">
                        RACE <span className="text-brand-red">ENTRY</span>
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Black Country Run Series 2026 — Secure your place
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="flex items-center gap-2 mb-12 max-w-md mx-auto">
                    {Array.from({ length: totalSteps }).map((_, i) => (
                        <React.Fragment key={i}>
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${i + 1 <= step
                                    ? 'bg-brand-red border-brand-red text-white'
                                    : 'border-white/20 text-gray-500'
                                    }`}
                            >
                                {i + 1 <= step && step > i + 1 ? <CheckCircle2 size={18} /> : i + 1}
                            </div>
                            {i < totalSteps - 1 && (
                                <div className={`flex-1 h-0.5 transition-all ${i + 1 < step ? 'bg-brand-red' : 'bg-white/10'}`} />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Step 1: Personal Details */}
                {step === 1 && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass p-8 md:p-12 rounded-3xl"
                    >
                        <h2 className="text-2xl font-display font-bold mb-2">Your Details</h2>
                        <p className="text-gray-400 text-sm mb-8">We need these for race day administration and results.</p>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">First Name *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Alex"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-red transition-colors"
                                        value={form.firstName}
                                        onChange={e => update('firstName', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Last Name *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Smith"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-red transition-colors"
                                        value={form.lastName}
                                        onChange={e => update('lastName', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Email Address *</label>
                                <input
                                    type="email"
                                    required
                                    placeholder="alex@example.com"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-red transition-colors"
                                    value={form.email}
                                    onChange={e => update('email', e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Date of Birth *</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-red transition-colors"
                                        value={form.dateOfBirth}
                                        onChange={e => update('dateOfBirth', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Gender *</label>
                                    <div className="flex gap-3">
                                        {(['M', 'F'] as const).map(g => (
                                            <button
                                                key={g}
                                                type="button"
                                                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all border ${form.gender === g
                                                    ? 'bg-brand-red border-brand-red text-white'
                                                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                                    }`}
                                                onClick={() => update('gender', g)}
                                            >
                                                {g === 'M' ? 'Male' : 'Female'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Running Club (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Tipton Harriers"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-red transition-colors"
                                    value={form.club}
                                    onChange={e => update('club', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end">
                            <button
                                disabled={!canProceedStep1}
                                onClick={() => setStep(2)}
                                className="btn-gradient text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 disabled:opacity-40 disabled:pointer-events-none"
                            >
                                Next: Choose Races <ArrowRight size={18} />
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Step 2: Race Selection */}
                {step === 2 && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass p-8 md:p-12 rounded-3xl"
                    >
                        <h2 className="text-2xl font-display font-bold mb-2">Choose Your Races</h2>
                        <p className="text-gray-400 text-sm mb-8">Select the full series for the best value, or choose individual races.</p>

                        {/* Entry Type Toggle */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <button
                                type="button"
                                onClick={() => update('entryType', 'series')}
                                className={`p-6 rounded-2xl text-left transition-all border-2 ${form.entryType === 'series'
                                    ? 'border-brand-red bg-brand-red/10'
                                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                                    }`}
                            >
                                <div className="text-xs font-bold uppercase tracking-wider text-brand-red mb-2">Best Value</div>
                                <div className="text-xl font-display font-bold mb-1">Full Series</div>
                                <div className="text-gray-400 text-sm mb-3">All 3 races + interlocking medal</div>
                                <div className="text-3xl font-display font-bold">
                                    £{seriesPrice} <span className="text-sm text-gray-500 line-through">£45</span>
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => update('entryType', 'individual')}
                                className={`p-6 rounded-2xl text-left transition-all border-2 ${form.entryType === 'individual'
                                    ? 'border-brand-red bg-brand-red/10'
                                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                                    }`}
                            >
                                <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Flexible</div>
                                <div className="text-xl font-display font-bold mb-1">Individual Race</div>
                                <div className="text-gray-400 text-sm mb-3">Pick your race(s)</div>
                                <div className="text-3xl font-display font-bold">£{individualPrice} <span className="text-sm text-gray-500">per race</span></div>
                            </button>
                        </div>

                        {/* Individual Race Selection */}
                        {form.entryType === 'individual' && (
                            <div className="space-y-3 mb-8">
                                <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Select Race(s) *</label>
                                {RACES.map(race => (
                                    <label
                                        key={race.id}
                                        className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all border ${form.races.includes(race.id)
                                            ? 'bg-brand-red/10 border-brand-red'
                                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 accent-brand-red"
                                            checked={form.races.includes(race.id)}
                                            onChange={e => {
                                                const newRaces = e.target.checked
                                                    ? [...form.races, race.id]
                                                    : form.races.filter(r => r !== race.id);
                                                update('races', newRaces);
                                            }}
                                        />
                                        <div className="flex-1">
                                            <div className="font-bold">{race.name}</div>
                                            <div className="text-sm text-gray-400">{race.date} — {race.location}</div>
                                        </div>
                                        <div className="text-lg font-display font-bold">£{individualPrice}</div>
                                    </label>
                                ))}
                            </div>
                        )}

                        {/* Full Series Confirmation */}
                        {form.entryType === 'series' && (
                            <div className="glass p-6 rounded-2xl mb-8">
                                <div className="text-sm font-bold uppercase text-brand-red tracking-wider mb-4">Your Series Includes:</div>
                                {RACES.map(race => (
                                    <div key={race.id} className="flex items-center gap-3 py-2">
                                        <CheckCircle2 size={16} className="text-brand-red" />
                                        <span className="font-medium">{race.name}</span>
                                        <span className="text-sm text-gray-500">— {race.date}</span>
                                    </div>
                                ))}
                                <div className="flex items-center gap-3 py-2 border-t border-white/10 mt-2 pt-4">
                                    <CheckCircle2 size={16} className="text-brand-red" />
                                    <span className="font-medium">Complete Interlocking Medal</span>
                                </div>
                            </div>
                        )}

                        {/* Price Summary */}
                        <div className="glass p-6 rounded-2xl mb-8 flex items-center justify-between">
                            <div>
                                <div className="text-sm text-gray-400">Total</div>
                                <div className="text-3xl font-display font-bold">£{totalPrice}</div>
                            </div>
                            <CreditCard size={24} className="text-gray-500" />
                        </div>

                        <div className="flex justify-between">
                            <button
                                onClick={() => setStep(1)}
                                className="text-gray-400 hover:text-white px-6 py-4 rounded-xl font-bold flex items-center gap-2 transition-colors"
                            >
                                <ArrowLeft size={18} /> Back
                            </button>
                            <button
                                disabled={!canProceedStep2}
                                onClick={() => setStep(3)}
                                className="btn-gradient text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 disabled:opacity-40 disabled:pointer-events-none"
                            >
                                Next: Safety Info <ArrowRight size={18} />
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Step 3: Emergency & Confirmation */}
                {step === 3 && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass p-8 md:p-12 rounded-3xl"
                    >
                        <h2 className="text-2xl font-display font-bold mb-2">Safety & Confirmation</h2>
                        <p className="text-gray-400 text-sm mb-8">Required for race day safety. This information is kept confidential.</p>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Emergency Contact Name *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Jane Smith"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-red transition-colors"
                                        value={form.emergencyContact}
                                        onChange={e => update('emergencyContact', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Emergency Phone *</label>
                                    <input
                                        type="tel"
                                        required
                                        placeholder="e.g. 07700 900000"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-red transition-colors"
                                        value={form.emergencyPhone}
                                        onChange={e => update('emergencyPhone', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Medical Conditions (Optional)</label>
                                <textarea
                                    placeholder="Any allergies, conditions, or medications we should know about..."
                                    rows={3}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-red transition-colors resize-none"
                                    value={form.medicalInfo}
                                    onChange={e => update('medicalInfo', e.target.value)}
                                />
                            </div>

                            {/* Summary */}
                            <div className="glass p-6 rounded-2xl space-y-3">
                                <div className="text-sm font-bold uppercase text-brand-red tracking-wider mb-3">Entry Summary</div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Runner</span>
                                    <span className="font-bold">{form.firstName} {form.lastName}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Entry Type</span>
                                    <span className="font-bold">{form.entryType === 'series' ? 'Full Series' : 'Individual'}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Races</span>
                                    <span className="font-bold text-right">
                                        {form.entryType === 'series' ? 'All 3 Races' : form.races.join(', ')}
                                    </span>
                                </div>
                                {form.club && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Club</span>
                                        <span className="font-bold">{form.club}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-lg pt-3 border-t border-white/10">
                                    <span className="text-gray-400">Total</span>
                                    <span className="font-display font-bold text-2xl">£{totalPrice}</span>
                                </div>
                            </div>

                            {/* Agreements */}
                            <div className="space-y-4 pt-4 border-t border-white/10">
                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        className="mt-1 w-4 h-4 accent-brand-red"
                                        checked={form.agreeTerms}
                                        onChange={e => update('agreeTerms', e.target.checked)}
                                    />
                                    <span className="text-xs text-gray-400 group-hover:text-gray-300 leading-relaxed">
                                        I confirm I am medically fit to participate and accept the <a href="#" className="underline">Terms & Conditions</a> and <a href="#" className="underline">risk waiver</a>. *
                                    </span>
                                </label>
                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        className="mt-1 w-4 h-4 accent-brand-red"
                                        checked={form.agreeData}
                                        onChange={e => update('agreeData', e.target.checked)}
                                    />
                                    <span className="text-xs text-gray-400 group-hover:text-gray-300 leading-relaxed">
                                        I consent to my data being stored for race administration and results publication. View our <a href="#" className="underline">Privacy Policy</a>. *
                                    </span>
                                </label>
                            </div>

                            {status === 'error' && (
                                <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm">
                                    <AlertCircle size={18} />
                                    {errorMsg}
                                </div>
                            )}
                        </div>

                        <div className="mt-8 flex justify-between">
                            <button
                                onClick={() => setStep(2)}
                                className="text-gray-400 hover:text-white px-6 py-4 rounded-xl font-bold flex items-center gap-2 transition-colors"
                            >
                                <ArrowLeft size={18} /> Back
                            </button>
                            <button
                                disabled={!canSubmit || status === 'loading'}
                                onClick={handleSubmit}
                                className="btn-gradient text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 disabled:opacity-40 disabled:pointer-events-none"
                            >
                                {status === 'loading' ? (
                                    'Submitting...'
                                ) : (
                                    <>
                                        Submit Entry — £{totalPrice} <ShieldCheck size={18} />
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}

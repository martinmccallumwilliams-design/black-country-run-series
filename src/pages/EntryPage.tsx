import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
    CheckCircle2,
    ArrowRight,
    ArrowLeft,
    ShieldCheck,
    AlertCircle,
    Lock,
} from 'lucide-react';
import { createCheckoutSession, getEntrySettings } from '../lib/supabase';
import SEO from '../components/SEO';

const RACES = [
    { id: 'Andy Holden 5K', name: 'Andy Holden 5K', date: 'Wed 8th July • 7:15pm', location: 'Baggeridge Country Park' },
    { id: 'GWR 5K', name: 'GWR 5K', date: 'Thu 23rd July • 7:15pm', location: 'Railway Walk, Wombourne' },
    { id: 'Dudley Zoo 5K', name: 'Dudley Zoo 5K', date: 'Wed 29th July • 7:15pm', location: 'Dudley Zoo and Castle' },
];


interface FormData {
    // Step 1 — Personal
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    gender: 'M' | 'F' | '';
    nationality: string;
    // Step 2 — Address & Club
    addressLine1: string;
    addressLine2: string;
    city: string;
    postcode: string;
    club: string;
    ukaNumber: string;
    // Step 3 — Safety & Consent
    emergencyContact: string;
    emergencyPhone: string;
    medicalInfo: string;
    tShirtSize: string;
    agreeTerms: boolean;
    agreeData: boolean;
    agreePhoto: boolean;
    // Under-18 parent / guardian consent
    parentGuardianName: string;
    parentGuardianPhone: string;
    parentGuardianEmail: string;
    parentGuardianConsent: boolean;
    // Under-15 nominated race-day supervisor
    supervisorName: string;
    supervisorPhone: string;
}

const INITIAL_FORM: FormData = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    nationality: 'British',
    addressLine1: '',
    addressLine2: '',
    city: '',
    postcode: '',
    club: '',
    ukaNumber: '',
    emergencyContact: '',
    emergencyPhone: '',
    medicalInfo: '',
    tShirtSize: '',
    agreeTerms: false,
    agreeData: false,
    agreePhoto: false,
    parentGuardianName: '',
    parentGuardianPhone: '',
    parentGuardianEmail: '',
    parentGuardianConsent: false,
    supervisorName: '',
    supervisorPhone: '',
};

const inputClass = 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-red transition-colors text-white placeholder-gray-600';
const labelClass = 'text-xs font-bold uppercase text-gray-500 tracking-wider';

const getAge = (dob: string): number | null => {
    if (!dob) return null;
    const today = new Date();
    const birth = new Date(dob);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
};

export default function EntryPage() {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState<FormData>(INITIAL_FORM);
    const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');
    const [entriesOpen, setEntriesOpen] = useState<boolean | null>(null);

    const totalSteps = 3;
    const seriesPrice = 35;

    const age = getAge(form.dateOfBirth);
    const isUnder18 = age !== null && age < 18;
    const isUnder15 = age !== null && age < 15;

    useEffect(() => {
        getEntrySettings().then(s => {
            setEntriesOpen(s?.general_entries_open ?? false);
        });
    }, []);

    const update = (field: keyof FormData, value: any) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const canProceedStep1 =
        form.firstName && form.lastName && form.email && form.phone &&
        form.dateOfBirth && form.gender && form.nationality;

    const canProceedStep2 =
        form.addressLine1 && form.city && form.postcode;

    const canSubmit =
        form.emergencyContact && form.emergencyPhone &&
        form.agreeTerms && form.agreeData &&
        (!isUnder18 || (form.parentGuardianName && form.parentGuardianPhone && form.parentGuardianConsent)) &&
        (!isUnder15 || (form.supervisorName && form.supervisorPhone));

    const handleSubmit = async () => {
        if (!canSubmit) return;
        setStatus('loading');
        setErrorMsg('');

        // Append guardian/supervisor details to medical info so they persist
        // without requiring a DB schema change.
        let medicalInfoFull = form.medicalInfo || '';
        if (isUnder18) {
            medicalInfoFull += `\n[GUARDIAN: ${form.parentGuardianName}, ${form.parentGuardianPhone}${form.parentGuardianEmail ? ', ' + form.parentGuardianEmail : ''}]`;
        }
        if (isUnder15) {
            medicalInfoFull += `\n[RACE-DAY SUPERVISOR: ${form.supervisorName}, ${form.supervisorPhone}]`;
        }

        try {
            const { checkoutUrl } = await createCheckoutSession({
                first_name: form.firstName,
                last_name: form.lastName,
                email: form.email,
                phone: form.phone,
                date_of_birth: form.dateOfBirth,
                gender: form.gender as 'M' | 'F',
                nationality: form.nationality,
                address_line1: form.addressLine1,
                address_line2: form.addressLine2 || undefined,
                city: form.city,
                postcode: form.postcode,
                club: form.club || undefined,
                uka_number: form.ukaNumber || undefined,
                entry_type: 'series',
                races: RACES.map(r => r.id),
                emergency_contact: form.emergencyContact,
                emergency_phone: form.emergencyPhone,
                medical_info: medicalInfoFull.trim() || undefined,
                t_shirt_size: form.tShirtSize || undefined,
            });

            window.location.href = checkoutUrl;
        } catch (err: any) {
            console.error('Entry submission error:', err);
            setErrorMsg(err?.message || 'Something went wrong. Please try again.');
            setStatus('error');
        }
    };

    // Loading state
    if (entriesOpen === null) {
        return (
            <div className="min-h-screen bg-brand-dark flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // Entries closed
    if (!entriesOpen) {
        return (
            <div className="min-h-screen bg-brand-dark flex items-center justify-center px-6 py-24">
                <div className="glass p-12 rounded-3xl text-center max-w-lg w-full">
                    <div className="w-20 h-20 bg-brand-red/20 text-brand-red rounded-full flex items-center justify-center mx-auto mb-8">
                        <Lock size={40} />
                    </div>
                    <h2 className="text-3xl font-display font-bold mb-4">Entries Not Yet Open</h2>
                    <p className="text-gray-400 mb-8">
                        Entries are not currently open. Register your interest to be notified when they do.
                    </p>
                    <a href="/#register" className="btn-gradient text-white py-4 px-8 rounded-xl font-bold inline-block">
                        Register Your Interest
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-brand-dark pt-8 pb-24 px-6">
            <SEO
                title="Enter Now | Black Country Run Series 2026"
                description="Secure your place in the Black Country Run Series 2026. Full series entry — all 3 races + interlocking medal for £35."
                canonical="/enter"
            />
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <a href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors text-sm">
                        <ArrowLeft size={16} /> Back to Home
                    </a>
                    <h1 className="text-4xl md:text-6xl font-display font-bold mb-4">
                        RACE <span className="text-brand-red">ENTRY</span>
                    </h1>
                    <p className="text-gray-400 text-lg">Black Country Run Series 2026 — Full Series · £{seriesPrice}</p>
                </div>

                {/* Series Summary Banner */}
                <div className="glass rounded-2xl p-5 mb-8 flex flex-wrap gap-4 justify-between items-center border border-brand-red/20">
                    <div className="text-sm font-bold uppercase text-brand-red tracking-wider">Full Series Entry Includes:</div>
                    {RACES.map(r => (
                        <div key={r.id} className="flex items-center gap-2 text-sm text-gray-300">
                            <CheckCircle2 size={14} className="text-brand-red shrink-0" />
                            <span>{r.name} · {r.date.split('•')[0].trim()}</span>
                        </div>
                    ))}
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                        <CheckCircle2 size={14} className="text-brand-red shrink-0" />
                        <span>Interlocking Medal</span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="flex items-center gap-2 mb-12 max-w-md mx-auto">
                    {Array.from({ length: totalSteps }).map((_, i) => (
                        <React.Fragment key={i}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                                i + 1 <= step ? 'bg-brand-red border-brand-red text-white' : 'border-white/20 text-gray-500'
                            }`}>
                                {i + 1 < step ? <CheckCircle2 size={18} /> : i + 1}
                            </div>
                            {i < totalSteps - 1 && (
                                <div className={`flex-1 h-0.5 transition-all ${i + 1 < step ? 'bg-brand-red' : 'bg-white/10'}`} />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Step 1: Personal Details */}
                {step === 1 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass p-8 md:p-12 rounded-3xl">
                        <h2 className="text-2xl font-display font-bold mb-2">Personal Details</h2>
                        <p className="text-gray-400 text-sm mb-8">Required for race registration and results publication.</p>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className={labelClass}>First Name *</label>
                                    <input type="text" placeholder="e.g. Alex" className={inputClass}
                                        value={form.firstName} onChange={e => update('firstName', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <label className={labelClass}>Last Name *</label>
                                    <input type="text" placeholder="e.g. Smith" className={inputClass}
                                        value={form.lastName} onChange={e => update('lastName', e.target.value)} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className={labelClass}>Email Address *</label>
                                    <input type="email" placeholder="alex@example.com" className={inputClass}
                                        value={form.email} onChange={e => update('email', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <label className={labelClass}>Mobile Phone *</label>
                                    <input type="tel" placeholder="e.g. 07700 900000" className={inputClass}
                                        value={form.phone} onChange={e => update('phone', e.target.value)} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className={labelClass}>Date of Birth *</label>
                                    <input type="date" className={inputClass}
                                        value={form.dateOfBirth} onChange={e => update('dateOfBirth', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <label className={labelClass}>Gender *</label>
                                    <div className="flex gap-3">
                                        {(['M', 'F'] as const).map(g => (
                                            <button key={g} type="button"
                                                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all border ${
                                                    form.gender === g ? 'bg-brand-red border-brand-red text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                                }`}
                                                onClick={() => update('gender', g)}>
                                                {g === 'M' ? 'Male' : 'Female'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className={labelClass}>Nationality *</label>
                                <input type="text" placeholder="e.g. British" className={inputClass}
                                    value={form.nationality} onChange={e => update('nationality', e.target.value)} />
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end">
                            <button disabled={!canProceedStep1} onClick={() => setStep(2)}
                                className="btn-gradient text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 disabled:opacity-40 disabled:pointer-events-none">
                                Next: Address & Club <ArrowRight size={18} />
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Step 2: Address & Club */}
                {step === 2 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass p-8 md:p-12 rounded-3xl">
                        <h2 className="text-2xl font-display font-bold mb-2">Address & Club</h2>
                        <p className="text-gray-400 text-sm mb-8">Your address is required for race administration. Club details are used for results.</p>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className={labelClass}>Address Line 1 *</label>
                                <input type="text" placeholder="House number and street name" className={inputClass}
                                    value={form.addressLine1} onChange={e => update('addressLine1', e.target.value)} />
                            </div>

                            <div className="space-y-2">
                                <label className={labelClass}>Address Line 2 (Optional)</label>
                                <input type="text" placeholder="Apartment, suite, etc." className={inputClass}
                                    value={form.addressLine2} onChange={e => update('addressLine2', e.target.value)} />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className={labelClass}>Town / City *</label>
                                    <input type="text" placeholder="e.g. Dudley" className={inputClass}
                                        value={form.city} onChange={e => update('city', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <label className={labelClass}>Postcode *</label>
                                    <input type="text" placeholder="e.g. DY1 4SB" className={`${inputClass} uppercase`}
                                        value={form.postcode} onChange={e => update('postcode', e.target.value.toUpperCase())} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className={labelClass}>Running Club (Optional)</label>
                                    <input type="text" placeholder="e.g. Tipton Harriers" className={inputClass}
                                        value={form.club} onChange={e => update('club', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <label className={labelClass}>UKA Registration No. (Optional)</label>
                                    <input type="text" placeholder="e.g. 2134567" className={inputClass}
                                        value={form.ukaNumber} onChange={e => update('ukaNumber', e.target.value)} />
                                    <p className="text-xs text-gray-600">Found on your UK Athletics club card</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between mt-8">
                            <button onClick={() => setStep(1)}
                                className="text-gray-400 hover:text-white px-6 py-4 rounded-xl font-bold flex items-center gap-2 transition-colors">
                                <ArrowLeft size={18} /> Back
                            </button>
                            <button disabled={!canProceedStep2} onClick={() => setStep(3)}
                                className="btn-gradient text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 disabled:opacity-40 disabled:pointer-events-none">
                                Next: Safety & Consent <ArrowRight size={18} />
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Step 3: Safety & Consent */}
                {step === 3 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass p-8 md:p-12 rounded-3xl">
                        <h2 className="text-2xl font-display font-bold mb-2">Safety & Consent</h2>
                        <p className="text-gray-400 text-sm mb-8">Required for race day safety. All information is kept confidential.</p>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className={labelClass}>Emergency Contact Name *</label>
                                    <input type="text" placeholder="e.g. Jane Smith" className={inputClass}
                                        value={form.emergencyContact} onChange={e => update('emergencyContact', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <label className={labelClass}>Emergency Contact Phone *</label>
                                    <input type="tel" placeholder="e.g. 07700 900000" className={inputClass}
                                        value={form.emergencyPhone} onChange={e => update('emergencyPhone', e.target.value)} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className={labelClass}>Medical Conditions / Medications (Optional)</label>
                                <textarea placeholder="Any allergies, conditions, or medications we should know about on race day..."
                                    rows={3} className={`${inputClass} resize-none`}
                                    value={form.medicalInfo} onChange={e => update('medicalInfo', e.target.value)} />
                            </div>

                            {/* T-Shirt info */}
                            <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                                <span className="text-lg">👕</span>
                                <p className="text-xs text-gray-400 leading-relaxed">
                                    <span className="font-bold text-white">Race t-shirts will be available to buy on race day.</span> No need to pre-order — just bring cash or card and pick one up at registration.
                                </p>
                            </div>

                            {/* Under-18: Parent / Guardian Consent */}
                            {isUnder18 && (
                                <div className="space-y-4 p-5 rounded-2xl border border-amber-500/30 bg-amber-500/5">
                                    <div>
                                        <p className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-1">Parent / Guardian Consent Required</p>
                                        <p className="text-xs text-gray-400">This entry is for a participant under 18. A parent or guardian must provide consent below.</p>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className={labelClass}>Parent / Guardian Name *</label>
                                            <input type="text" placeholder="Full name" className={inputClass}
                                                value={form.parentGuardianName} onChange={e => update('parentGuardianName', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className={labelClass}>Parent / Guardian Phone *</label>
                                            <input type="tel" placeholder="e.g. 07700 900000" className={inputClass}
                                                value={form.parentGuardianPhone} onChange={e => update('parentGuardianPhone', e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className={labelClass}>Parent / Guardian Email (Optional)</label>
                                        <input type="email" placeholder="guardian@example.com" className={inputClass}
                                            value={form.parentGuardianEmail} onChange={e => update('parentGuardianEmail', e.target.value)} />
                                    </div>
                                    <label className="flex items-start gap-3 cursor-pointer group">
                                        <input type="checkbox" className="mt-1 w-4 h-4 accent-brand-red shrink-0"
                                            checked={form.parentGuardianConsent} onChange={e => update('parentGuardianConsent', e.target.checked)} />
                                        <span className="text-xs text-gray-400 group-hover:text-gray-300 leading-relaxed">
                                            I am the parent or legal guardian of the entrant named above. I give my consent for them to participate in the Black Country Run Series 2026 and accept the{' '}
                                            <a href="/legal" className="underline hover:text-white">Terms & Conditions</a> on their behalf. *
                                        </span>
                                    </label>
                                </div>
                            )}

                            {/* Under-15: Nominated Race-Day Supervisor */}
                            {isUnder15 && (
                                <div className="space-y-4 p-5 rounded-2xl border border-orange-500/30 bg-orange-500/5">
                                    <div>
                                        <p className="text-sm font-bold text-orange-400 uppercase tracking-wider mb-1">Race-Day Supervisor Required</p>
                                        <p className="text-xs text-gray-400">Participants under 15 must be accompanied and supervised by a nominated adult throughout the event.</p>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className={labelClass}>Supervisor Name *</label>
                                            <input type="text" placeholder="Full name" className={inputClass}
                                                value={form.supervisorName} onChange={e => update('supervisorName', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className={labelClass}>Supervisor Phone *</label>
                                            <input type="tel" placeholder="e.g. 07700 900000" className={inputClass}
                                                value={form.supervisorPhone} onChange={e => update('supervisorPhone', e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Entry Summary */}
                            <div className="glass p-6 rounded-2xl space-y-3 border border-white/5">
                                <div className="text-sm font-bold uppercase text-brand-red tracking-wider mb-3">Entry Summary</div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Runner</span>
                                    <span className="font-bold">{form.firstName} {form.lastName}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Email</span>
                                    <span className="font-bold">{form.email}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Entry Type</span>
                                    <span className="font-bold">Full Series</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Races</span>
                                    <span className="font-bold text-right">All 3 Races</span>
                                </div>
                                {form.club && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Club</span>
                                        <span className="font-bold">{form.club}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-lg pt-3 border-t border-white/10">
                                    <span className="text-gray-400">Total</span>
                                    <span className="font-display font-bold text-2xl">£{seriesPrice}</span>
                                </div>
                            </div>

                            {/* Consents */}
                            <div className="space-y-4 pt-4 border-t border-white/10">
                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <input type="checkbox" className="mt-1 w-4 h-4 accent-brand-red shrink-0"
                                        checked={form.agreeTerms} onChange={e => update('agreeTerms', e.target.checked)} />
                                    <span className="text-xs text-gray-400 group-hover:text-gray-300 leading-relaxed">
                                        I confirm I am medically fit to participate, am 11 years of age or older, and accept the{' '}
                                        <a href="/legal" className="underline hover:text-white">Terms & Conditions</a> and risk waiver. *
                                    </span>
                                </label>
                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <input type="checkbox" className="mt-1 w-4 h-4 accent-brand-red shrink-0"
                                        checked={form.agreeData} onChange={e => update('agreeData', e.target.checked)} />
                                    <span className="text-xs text-gray-400 group-hover:text-gray-300 leading-relaxed">
                                        I consent to my personal data being stored for race administration, results publication, and Power of 10 submission. View our{' '}
                                        <a href="/legal" className="underline hover:text-white">Privacy Policy</a>. *
                                    </span>
                                </label>
                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <input type="checkbox" className="mt-1 w-4 h-4 accent-brand-red shrink-0"
                                        checked={form.agreePhoto} onChange={e => update('agreePhoto', e.target.checked)} />
                                    <span className="text-xs text-gray-400 group-hover:text-gray-300 leading-relaxed">
                                        I consent to photographs and video taken on race day being used for promotional purposes (optional).
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
                            <button onClick={() => setStep(2)}
                                className="text-gray-400 hover:text-white px-6 py-4 rounded-xl font-bold flex items-center gap-2 transition-colors">
                                <ArrowLeft size={18} /> Back
                            </button>
                            <button disabled={!canSubmit || status === 'loading'} onClick={handleSubmit}
                                className="btn-gradient text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 disabled:opacity-40 disabled:pointer-events-none">
                                {status === 'loading' ? (
                                    <span className="flex items-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Redirecting to payment...
                                    </span>
                                ) : (
                                    <>Proceed to Payment — £{seriesPrice} <ShieldCheck size={18} /></>
                                )}
                            </button>
                        </div>
                        <p className="text-center text-xs text-gray-600 mt-4 flex items-center justify-center gap-1">
                            <Lock size={10} /> Secure payment via Stripe
                        </p>
                    </motion.div>
                )}
            </div>
        </div>
    );
}

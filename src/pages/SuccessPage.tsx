import { motion } from 'motion/react';
import { CheckCircle2, Mail, Calendar, MapPin } from 'lucide-react';
import SEO from '../components/SEO';

const RACES = [
    { name: 'Andy Holden 5K', date: 'Wed 8th July • 7:15pm', location: 'Baggeridge Country Park' },
    { name: 'GWR 5K', date: 'Thu 23rd July • 7:15pm', location: 'Railway Walk, Wombourne' },
    { name: 'Dudley Zoo 5K', date: 'Wed 29th July • 7:15pm', location: 'Dudley Zoo and Castle' },
];

export default function SuccessPage() {
    return (
        <div className="min-h-screen bg-brand-dark flex items-center justify-center px-6 py-24">
            <SEO
                title="Entry Confirmed! | Black Country Run Series 2026"
                description="Your entry for the Black Country Run Series 2026 is confirmed."
                canonical="/enter/success"
            />
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-lg w-full space-y-6"
            >
                {/* Success header */}
                <div className="glass p-10 rounded-3xl text-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', delay: 0.2 }}
                        className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                        <CheckCircle2 size={40} />
                    </motion.div>
                    <h1 className="text-3xl font-display font-bold mb-3">You're In!</h1>
                    <p className="text-gray-400 leading-relaxed">
                        Your entry for the Black Country Run Series 2026 is confirmed.
                        A confirmation email with your race number is on its way.
                    </p>
                </div>

                {/* Email notice */}
                <div className="glass p-5 rounded-2xl flex items-start gap-4 border border-brand-red/20">
                    <Mail size={20} className="text-brand-red shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-bold text-white mb-1">Check your inbox</p>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            We've sent a confirmation email with your race number and all the details you need for race day. Check your spam folder if it doesn't arrive within a few minutes.
                        </p>
                    </div>
                </div>

                {/* Races */}
                <div className="glass p-6 rounded-2xl space-y-4">
                    <p className="text-xs font-bold uppercase text-brand-red tracking-wider">Your Races</p>
                    {RACES.map(race => (
                        <div key={race.name} className="flex items-start gap-3">
                            <CheckCircle2 size={16} className="text-brand-red shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-bold text-white">{race.name}</p>
                                <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                        <Calendar size={10} /> {race.date}
                                    </span>
                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                        <MapPin size={10} /> {race.location}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <a href="/" className="btn-gradient text-white py-4 rounded-xl font-bold flex items-center justify-center w-full">
                    Back to Home
                </a>
            </motion.div>
        </div>
    );
}

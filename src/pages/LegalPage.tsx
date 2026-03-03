import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Shield, FileText, Cookie, RefreshCcw, Mail } from 'lucide-react';

const sections = [
    { id: 'privacy', label: 'Privacy Policy', icon: Shield },
    { id: 'terms', label: 'Terms & Conditions', icon: FileText },
    { id: 'cookies', label: 'Cookie Policy', icon: Cookie },
    { id: 'refunds', label: 'Refund Policy', icon: RefreshCcw },
];

const LegalPage = () => {
    const location = useLocation();
    const hash = location.hash.replace('#', '') || 'privacy';
    const [activeSection, setActiveSection] = useState(hash);

    useEffect(() => {
        const newHash = location.hash.replace('#', '');
        if (newHash && sections.some(s => s.id === newHash)) {
            setActiveSection(newHash);
        }
    }, [location.hash]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [activeSection]);

    return (
        <div className="min-h-screen bg-brand-dark text-white">
            {/* Header */}
            <div className="border-b border-white/10">
                <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft size={20} />
                        <span className="text-sm font-medium">Back to Home</span>
                    </Link>
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-brand-red to-red-700 rounded-lg flex items-center justify-center font-display font-bold text-sm">B</div>
                        <span className="font-display font-bold text-sm tracking-tight">BLACK COUNTRY RUN SERIES</span>
                    </Link>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10"
                >
                    <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Legal & GDPR</h1>
                    <p className="text-gray-400 text-lg">Black Country Run Series — Tipton Harriers Sub-Committee</p>
                </motion.div>

                {/* Tab Navigation */}
                <div className="flex flex-wrap gap-2 mb-10 border-b border-white/10 pb-4">
                    {sections.map(s => {
                        const Icon = s.icon;
                        return (
                            <button
                                key={s.id}
                                onClick={() => {
                                    setActiveSection(s.id);
                                    window.history.replaceState(null, '', `/legal#${s.id}`);
                                }}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeSection === s.id
                                    ? 'bg-brand-red text-white shadow-lg shadow-brand-red/20'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                <Icon size={16} />
                                {s.label}
                            </button>
                        );
                    })}
                </div>

                {/* Content */}
                <motion.div
                    key={activeSection}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="prose prose-invert max-w-none"
                >
                    {activeSection === 'privacy' && <PrivacyPolicy />}
                    {activeSection === 'terms' && <TermsConditions />}
                    {activeSection === 'cookies' && <CookiePolicy />}
                    {activeSection === 'refunds' && <RefundPolicy />}
                </motion.div>

                {/* Contact */}
                <div className="mt-16 p-8 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                        <Mail size={24} className="text-brand-red" />
                        <h3 className="text-xl font-display font-bold">Contact Us</h3>
                    </div>
                    <p className="text-gray-400 mb-2">
                        For any data protection queries, requests or complaints:
                    </p>
                    <a href="mailto:contact@blackcountryrun.co.uk" className="text-brand-red hover:underline font-semibold">
                        contact@blackcountryrun.co.uk
                    </a>
                    <p className="text-gray-500 text-sm mt-4">
                        Data Controller: Tipton Harriers Sub-Committee — Black Country Run Series
                    </p>
                </div>
            </div>

            {/* Footer */}
            <div className="border-t border-white/10 mt-16">
                <div className="max-w-6xl mx-auto px-6 py-8 text-center text-gray-500 text-sm">
                    © 2026 Black Country Run Series. All rights reserved. Organised by Tipton Harriers.
                </div>
            </div>
        </div>
    );
};

/* ============================
   PRIVACY POLICY
   ============================ */
const PrivacyPolicy = () => (
    <div className="space-y-8">
        <div>
            <h2 className="text-3xl font-display font-bold mb-2">Privacy Policy</h2>
            <p className="text-gray-500 text-sm">Effective Date: 2nd March 2026</p>
        </div>

        <p className="text-gray-300 leading-relaxed">
            The Black Country Run Series ("we", "us", "our") is committed to protecting and respecting your privacy in accordance with UK GDPR and the Data Protection Act 2018. This Privacy Policy explains how we collect, use, store and protect your personal data.
        </p>

        <Section title="1.1 Data We Collect">
            <p>When you register interest or enter a race, we may collect:</p>
            <ul>
                <li>Full name</li>
                <li>Email address</li>
                <li>Date of birth</li>
                <li>Gender (if required for race categories)</li>
                <li>Emergency contact name and phone number</li>
                <li>Club affiliation (if applicable)</li>
                <li>Payment confirmation details</li>
                <li>IP address (for consent logging)</li>
            </ul>
            <p className="mt-4 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium">
                ✓ We do NOT store card or payment details. Payments are securely processed by Stripe.
            </p>
        </Section>

        <Section title="1.2 Lawful Basis for Processing">
            <p>We process your data under the following lawful bases:</p>
            <ul>
                <li><strong>Contract</strong> — to administer your race entry and deliver the event.</li>
                <li><strong>Consent</strong> — to send you marketing emails, priority access notifications or updates.</li>
                <li><strong>Vital Interests</strong> — for emergency medical information required for your safety during the event.</li>
                <li><strong>Legitimate Interest</strong> — to publish race results and event photography.</li>
            </ul>
        </Section>

        <Section title="1.3 How We Use Your Data">
            <p>We use your data to:</p>
            <ul>
                <li>Process race entries</li>
                <li>Manage payments via Stripe</li>
                <li>Send event updates and race instructions</li>
                <li>Allocate race numbers and timing</li>
                <li>Contact emergency contacts if necessary</li>
                <li>Publish race results</li>
                <li>Send marketing communications (if consent given)</li>
            </ul>
        </Section>

        <Section title="1.4 Data Storage">
            <p>Entry data is stored securely using Supabase (hosted within the EU/UK). Payment processing is handled securely by Stripe. We do not store card information.</p>
            <p>Access to participant data is restricted to authorised event administrators only.</p>
        </Section>

        <Section title="1.5 Data Retention">
            <ul>
                <li><strong>Race results</strong> — retained indefinitely for historical record and sporting accuracy.</li>
                <li><strong>Contact details</strong> — retained for up to 24 months after your last interaction.</li>
                <li><strong>Medical/emergency information</strong> — deleted after event completion unless required for incident reporting.</li>
            </ul>
        </Section>

        <Section title="1.6 Your Rights">
            <p>Under UK GDPR you have the right to:</p>
            <ul>
                <li>Access your data</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Withdraw consent at any time</li>
                <li>Restrict processing</li>
                <li>Data portability</li>
                <li>Lodge a complaint with the <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="text-brand-red hover:underline">Information Commissioner's Office (ICO)</a></li>
            </ul>
            <p className="mt-2">
                Requests can be made via: <a href="mailto:contact@blackcountryrun.co.uk" className="text-brand-red hover:underline">contact@blackcountryrun.co.uk</a>
            </p>
        </Section>

        <Section title="1.7 Data Sharing">
            <p>We may share data with:</p>
            <ul>
                <li>Stripe (payment processing)</li>
                <li>Timing providers</li>
                <li>Event insurers (if required)</li>
                <li>Emergency services (if required)</li>
            </ul>
            <p className="mt-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium">
                ✓ We do not sell or share your data for third-party marketing purposes.
            </p>
        </Section>

        <Section title="1.8 ICO Registration">
            <p>The Black Country Run Series is registered with the Information Commissioner's Office (ICO) where required.</p>
        </Section>
    </div>
);

/* ============================
   TERMS & CONDITIONS
   ============================ */
const TermsConditions = () => (
    <div className="space-y-8">
        <div>
            <h2 className="text-3xl font-display font-bold mb-2">Race Entry Terms & Conditions</h2>
            <p className="text-gray-500 text-sm">By entering a Black Country Run Series event, you agree to the following terms.</p>
        </div>

        <Section title="2.1 Entry Confirmation">
            <p>Entry is only confirmed once payment has been successfully processed via Stripe.</p>
        </Section>

        <Section title="2.2 Refund Policy">
            <p>Entry fees are non-refundable unless:</p>
            <ul>
                <li>The event is cancelled by the organiser.</li>
                <li>The event cannot take place due to circumstances beyond reasonable control.</li>
            </ul>
            <p>Refund eligibility and timelines will be stated clearly at time of entry.</p>
        </Section>

        <Section title="2.3 Transfer Policy">
            <p>Entries may be transferable before a specified cut-off date. Transfers must be completed via official communication with the organisers.</p>
        </Section>

        <Section title="2.4 Event Cancellation">
            <p>In the event of cancellation due to weather, safety, or force majeure:</p>
            <ul>
                <li>Alternative dates may be offered.</li>
                <li>Partial refunds may be considered.</li>
                <li>Entry deferrals may be offered.</li>
            </ul>
            <p>The organiser's decision is final.</p>
        </Section>

        <Section title="2.5 Medical Declaration">
            <p>Participants confirm they are medically fit to participate. Participants accept full responsibility for their health during the event.</p>
        </Section>

        <Section title="2.6 Liability Disclaimer">
            <p>Participation is at your own risk. The organiser, volunteers, sponsors and venue partners shall not be liable for injury, loss or damage except where caused by proven negligence.</p>
        </Section>

        <Section title="2.7 Photography & Media">
            <p>By entering, you consent to photography and videography during the event. Images may be used for promotional purposes unless you notify us in writing prior to race day.</p>
        </Section>

        <Section title="2.8 Under 16 Participants">
            <p>Where applicable, participants under 16 must have parental or guardian consent.</p>
        </Section>
    </div>
);

/* ============================
   COOKIE POLICY
   ============================ */
const CookiePolicy = () => (
    <div className="space-y-8">
        <div>
            <h2 className="text-3xl font-display font-bold mb-2">Cookie Policy</h2>
        </div>

        <p className="text-gray-300 leading-relaxed">
            We use cookies to improve your experience on our website. Cookies are small text files stored on your device when you visit a website.
        </p>

        <Section title="What cookies do we use?">
            <ul>
                <li><strong>Essential cookies</strong> — required for the website to function correctly (e.g. authentication, form submissions).</li>
                <li><strong>Performance cookies</strong> — help us monitor website performance and improve user experience.</li>
                <li><strong>Payment cookies</strong> — used by Stripe to enable secure payment processing.</li>
            </ul>
        </Section>

        <Section title="Managing cookies">
            <p>You can disable cookies through your browser settings. Please note that disabling certain cookies may affect website functionality.</p>
            <p className="mt-2">
                For more information, visit <a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-brand-red hover:underline">allaboutcookies.org</a>.
            </p>
        </Section>
    </div>
);

/* ============================
   REFUND POLICY
   ============================ */
const RefundPolicy = () => (
    <div className="space-y-8">
        <div>
            <h2 className="text-3xl font-display font-bold mb-2">Refund Policy</h2>
        </div>

        <Section title="Race Entry Refunds">
            <p>Entry fees are <strong>non-refundable</strong> unless:</p>
            <ul>
                <li>The event is cancelled by the organiser.</li>
                <li>The event cannot take place due to circumstances beyond reasonable control (force majeure).</li>
            </ul>
        </Section>

        <Section title="Event Cancellation">
            <p>If an event is cancelled, we will offer one or more of the following:</p>
            <ul>
                <li>Entry deferral to a rescheduled date</li>
                <li>Partial refund (depending on costs already incurred)</li>
                <li>Credit towards a future Black Country Run Series event</li>
            </ul>
        </Section>

        <Section title="Entry Transfers">
            <p>Entries may be transferred to another person before the published transfer deadline. Contact us at <a href="mailto:contact@blackcountryrun.co.uk" className="text-brand-red hover:underline">contact@blackcountryrun.co.uk</a> to arrange a transfer.</p>
        </Section>

        <Section title="How to Request a Refund">
            <p>If you believe you are entitled to a refund, please email <a href="mailto:contact@blackcountryrun.co.uk" className="text-brand-red hover:underline">contact@blackcountryrun.co.uk</a> with your name, email used for registration, and reason for the request.</p>
        </Section>
    </div>
);

/* ============================
   SHARED COMPONENTS
   ============================ */
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="space-y-3">
        <h3 className="text-xl font-display font-bold text-white">{title}</h3>
        <div className="text-gray-300 leading-relaxed space-y-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1.5 [&_li]:text-gray-300 [&_strong]:text-white">
            {children}
        </div>
    </div>
);

export default LegalPage;

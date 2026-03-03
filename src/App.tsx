/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  MapPin,
  Trophy,
  Zap,
  CheckCircle2,
  ChevronRight,
  Menu,
  X,
  Mail,
  Instagram,
  Facebook,
  Twitter,
  ArrowRight,
  ShieldCheck,
  Clock,
  Users,
  ClipboardList,
  BarChart3
} from 'lucide-react';
import { submitRegistration } from './lib/supabase';

// --- Components ---

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Series', href: '#series' },
    { name: 'Races', href: '#races' },
    { name: 'Prices', href: '#prices' },
    { name: 'Enter', href: '/enter' },
    { name: 'Results', href: '/results' },
    { name: 'FAQ', href: '#faq' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-black/90 backdrop-blur-lg border-b border-white/10 py-3' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-tipton-green rounded-sm flex items-center justify-center font-display font-bold text-xl group-hover:scale-110 transition-transform text-white">B</div>
          <span className="font-display font-bold text-lg tracking-tighter hidden sm:block">BLACK COUNTRY RUN SERIES</span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a key={link.name} href={link.href} className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
              {link.name}
            </a>
          ))}
          <a href="/enter" className="btn-gradient text-white px-5 py-2 rounded-full text-sm font-bold">
            Enter Now
          </a>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-black border-b border-white/10 p-6 flex flex-col gap-4 md:hidden"
          >
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-lg font-medium text-gray-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <a
              href="/enter"
              className="bg-brand-red text-white py-3 rounded-lg text-center font-bold"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Enter Now
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const RaceCard = ({ title, date, location, type, idealFor, highlight, images, firstImageHoldTime = 4000 }: { title: string, date: string, location: string, type: string, idealFor: string[], highlight: string, images: string[], firstImageHoldTime?: number }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const delay = currentImageIndex === 0 ? firstImageHoldTime : 4000;
    const timer = setTimeout(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, delay);
    return () => clearTimeout(timer);
  }, [currentImageIndex, images.length, firstImageHoldTime]);

  return (
    <motion.div
      whileHover={{ y: -10 }}
      className="bg-brand-dark/50 backdrop-blur-xl rounded-3xl overflow-hidden flex flex-col h-full group relative border border-white/5 shadow-2xl shadow-black hover:border-brand-red/30 hover:shadow-brand-red/10 transition-all duration-700"
    >
      <div className="h-[320px] overflow-hidden relative bg-black">
        <AnimatePresence mode="wait">
          {currentImageIndex === 0 ? (
            <motion.div
              key="poster"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 1, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full"
            >
              {/* Blurred background filler to make it look premium without black bars */}
              <img src={images[0]} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40 blur-2xl scale-125 saturate-150" referrerPolicy="no-referrer" aria-hidden="true" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/90 z-0" />
              {/* Actual uncropped logo floating in the middle */}
              <img src={images[0]} alt={`${title} Cover`} className="absolute inset-0 w-full h-full object-contain p-8 z-10 drop-shadow-[0_20px_20px_rgba(0,0,0,0.9)] group-hover:scale-105 transition-transform duration-1000" referrerPolicy="no-referrer" />
            </motion.div>
          ) : (
            <motion.img
              key={currentImageIndex}
              src={images[currentImageIndex]}
              alt={`${title} - ${currentImageIndex + 1}`}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 1, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
              referrerPolicy="no-referrer"
            />
          )}
        </AnimatePresence>

        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/20 to-transparent z-20 pointer-events-none" />

        {/* Carousel Indicators - Glassmorphic */}
        <div className="absolute top-4 right-4 flex gap-1.5 z-30 bg-black/40 backdrop-blur-md px-3 py-2 rounded-full border border-white/10 shadow-xl">
          {images.map((_, idx) => (
            <div
              key={idx}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${idx === currentImageIndex ? 'bg-brand-red w-4 shadow-[0_0_10px_rgba(220,38,38,0.8)]' : 'bg-white/40'}`}
            />
          ))}
        </div>

        <div className="absolute bottom-6 left-6 z-30">
          <span className="bg-brand-red text-[10px] uppercase font-bold tracking-[0.2em] px-4 py-1.5 rounded-full shadow-[0_0_20px_rgba(220,38,38,0.3)] border border-brand-red/50">{type}</span>
        </div>
      </div>
      <div className="p-6 flex-grow flex flex-col relative z-10">
        <div className="flex items-center gap-2 text-brand-red mb-2">
          <Calendar size={14} />
          <span className="text-xs font-bold uppercase tracking-wider">{date}</span>
        </div>
        <h3 className="text-2xl mb-2 group-hover:text-brand-red transition-colors">{title}</h3>
        <div className="flex items-start gap-2 text-gray-400 text-sm mb-4">
          <MapPin size={16} className="shrink-0 mt-0.5" />
          <span>{location}</span>
        </div>
        <div className="mb-6 flex-grow">
          <p className="text-sm text-gray-300 mb-4 italic leading-relaxed">"{highlight}"</p>
          <div className="space-y-2">
            <p className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">Ideal for:</p>
            <div className="flex flex-wrap gap-2">
              {idealFor.map(item => (
                <span key={item} className="text-[10px] bg-white/5 border border-white/10 px-2 py-1 rounded-full text-gray-300 group-hover:border-brand-red/30 transition-colors">{item}</span>
              ))}
            </div>
          </div>
        </div>
        <a href="/enter" className="flex items-center justify-between w-full py-3 px-4 bg-white/5 hover:bg-brand-red/10 border border-white/10 hover:border-brand-red/30 rounded-xl transition-all text-sm font-bold group/btn">
          Enter Now
          <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
        </a>
      </div>

      {/* Premium Hover Glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute -inset-px bg-gradient-to-r from-brand-red/20 to-transparent rounded-2xl blur-sm" />
      </div>
    </motion.div >
  );
};

const RegisterForm = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({
    firstName: '',
    email: '',
    club: '',
    races: [] as string[],
    gdpr: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      await submitRegistration({
        first_name: formData.firstName,
        email: formData.email,
        club: formData.club || undefined,
        races_interested: formData.races,
        gdpr_consent: formData.gdpr,
      });
      setStatus('success');
    } catch (err: any) {
      console.error('Registration error:', err);
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass p-8 rounded-3xl text-center"
      >
        <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={32} />
        </div>
        <h3 className="text-3xl mb-4">You're on the list!</h3>
        <p className="text-gray-400 mb-8">We'll email you as soon as priority access opens. Get ready for an epic summer of racing.</p>
        <button
          onClick={() => setStatus('idle')}
          className="text-brand-red font-bold hover:underline"
        >
          Register another person
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass p-8 rounded-3xl space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">First Name</label>
          <input
            required
            type="text"
            placeholder="e.g. Alex"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-red transition-colors"
            value={formData.firstName}
            onChange={e => setFormData({ ...formData, firstName: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Email Address</label>
          <input
            required
            type="email"
            placeholder="alex@example.com"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-red transition-colors"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Running Club (Optional)</label>
        <input
          type="text"
          placeholder="e.g. Tipton Harriers"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-red transition-colors"
          value={formData.club}
          onChange={e => setFormData({ ...formData, club: e.target.value })}
        />
      </div>

      <div className="space-y-3">
        <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Which race(s) are you interested in?</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {['Full Series (All 3)', 'Andy Holden 5K', 'GWR 5K', 'Dudley Zoo 5K'].map(race => (
            <label key={race} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 cursor-pointer hover:bg-white/10 transition-colors">
              <input
                type="checkbox"
                className="w-4 h-4 accent-brand-red"
                checked={formData.races.includes(race)}
                onChange={e => {
                  const newRaces = e.target.checked
                    ? [...formData.races, race]
                    : formData.races.filter(r => r !== race);
                  setFormData({ ...formData, races: newRaces });
                }}
              />
              <span className="text-sm">{race}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-white/10">
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            required
            type="checkbox"
            className="mt-1 w-4 h-4 accent-brand-red"
            checked={formData.gdpr}
            onChange={e => setFormData({ ...formData, gdpr: e.target.checked })}
          />
          <span className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors leading-relaxed">
            I consent to receiving email communications regarding the Black Country Run Series including priority entry access, event updates and future race announcements. I understand I can unsubscribe at any time. View our <a href="/legal#privacy" className="underline text-brand-red">Privacy Policy</a>.
          </span>
        </label>
      </div>

      <button
        disabled={status === 'loading'}
        type="submit"
        className="w-full btn-gradient text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2"
      >
        {status === 'loading' ? 'Processing...' : 'Secure Priority Access'}
        <ArrowRight size={20} />
      </button>

      <p className="text-[10px] text-center text-gray-500 uppercase tracking-widest">
        No payment required today • Limited early bird spots
      </p>

      <div className="text-center pt-2">
        <a
          href="mailto:info@tiptonharriers.co.uk?subject=Black Country Run Series Interest&body=Hi, I am interested in the 2026 series. My name is..."
          className="text-[10px] text-gray-600 hover:text-gray-400 underline uppercase tracking-tighter"
        >
          Having trouble? Register via email instead
        </a>
      </div>
    </form>
  );
};

// --- Main App ---

export default function App() {
  return (
    <div className="min-h-screen font-sans selection:bg-brand-red selection:text-white overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-12 px-6 overflow-hidden">
        {/* Hero Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/BCR Cover Photo.png"
            alt="Black Country Run Series Preview"
            className="w-full h-full object-cover opacity-60"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/90 via-brand-dark/60 to-brand-dark" />
        </div>

        <div className="relative z-20 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block bg-brand-red/20 text-brand-red text-xs font-bold tracking-[0.3em] uppercase px-4 py-2 rounded-full mb-6 border border-brand-red/30">
              Summer 2026 Series
            </span>
            <h1 className="text-5xl md:text-8xl mb-6 leading-[0.9] text-gradient">
              BLACK COUNTRY <br /> RUN SERIES
            </h1>
            <p className="text-lg md:text-2xl text-gray-400 mb-10 max-w-2xl mx-auto font-medium">
              Three evening 5Ks. One interlocking medal. <br className="hidden md:block" /> One unforgettable summer.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <a href="/enter" className="w-full sm:w-auto btn-gradient text-white px-8 py-4 rounded-full font-bold text-lg">
                Enter Now
              </a>
              <a href="#races" className="w-full sm:w-auto glass hover:bg-white/10 text-white px-8 py-4 rounded-full font-bold text-lg transition-all">
                View the 3 Races
              </a>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {[
                { icon: <ShieldCheck size={18} />, text: 'Traffic-free' },
                { icon: <Clock size={18} />, text: 'Evening Races' },
                { icon: <Zap size={18} />, text: 'Accurate Timing' },
                { icon: <Users size={18} />, text: 'All Abilities' },
              ].map((chip, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 + (i * 0.1) }}
                  className="flex items-center justify-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-wider"
                >
                  <span className="text-brand-red">{chip.icon}</span>
                  {chip.text}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Series Overview */}
      <section id="series" className="py-24 px-6 bg-black relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-6xl mb-8 leading-tight">
                PROUDLY HOSTED BY <br />
                <span className="tipton-text">TIPTON HARRIERS</span>
              </h2>
              <p className="text-lg text-gray-400 mb-6 leading-relaxed">
                Tipton Harriers proudly presents the Black Country Run Series — a three-race 5K summer series celebrating running, community and iconic West Midlands locations.
              </p>
              <p className="text-lg text-gray-400 mb-8 leading-relaxed">
                Whether you're chasing a PB on the flat GWR course or enjoying the scenic trails of Baggeridge, our professionally organised races offer something for every runner.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="glass p-6 rounded-2xl">
                  <div className="text-3xl font-display font-bold text-white mb-1">3</div>
                  <div className="text-xs font-bold uppercase text-gray-500 tracking-widest">Epic Races</div>
                </div>
                <div className="glass p-6 rounded-2xl">
                  <div className="text-3xl font-display font-bold text-white mb-1">1</div>
                  <div className="text-xs font-bold uppercase text-gray-500 tracking-widest">Interlocking Medal</div>
                </div>
              </div>
            </div>
            <div className="aspect-square rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-brand-red/5">
              <motion.img
                initial={{ filter: "grayscale(100%)" }}
                whileInView={{ filter: "grayscale(0%)" }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                src="/images/BCR Cover Photo.png"
                alt="Black Country Run Series preview"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Races Section */}
      <section id="races" className="py-24 px-6 bg-brand-dark">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl mb-4">THE 2026 CALENDAR</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Three distinct courses, three unique challenges. All traffic-free, all professionally timed.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <RaceCard
              title="Andy Holden 5K"
              date="Wed 8th July"
              location="Baggeridge Country Park"
              type="Trail / Off-road"
              highlight="Undulating woodland trails with a scenic summer evening atmosphere."
              idealFor={['Trail Runners', 'Strength Focused', 'XC Enthusiasts']}
              firstImageHoldTime={8000}
              images={[
                "/images/Andy Holden 5k Logo.png",
                "/images/Baggeridge 5k Race Scene.png",
                "/images/Baggeridge Chimney.png",
                "/images/Baggeridge Bridge.png",
                "/images/Baggeridge Path.png"
              ]}
            />
            <RaceCard
              title="GWR 5K"
              date="Thu 23rd July"
              location="Railway Walk, Wombourne"
              type="Fast & Flat"
              highlight="14:11 winning time last year! EA measured and licensed for official PBs."
              idealFor={['PB Hunters', 'Club Runners', 'First-timers']}
              firstImageHoldTime={8000}
              images={[
                "/images/GWR 5k Logo.png",
                "/images/South Staffs Railway walk sign.png",
                "/images/GWR 5k 2025 Amy Hadley.png",
                "/images/GWR 5k 2025 Halesowen Runner.png",
                "/images/GWR 5k 2025 Start.png",
                "/images/1st Place Woman GWR 5k 2025.png"
              ]}
            />
            <RaceCard
              title="Dudley Zoo 5K"
              date="Wed 29th July"
              location="Dudley Zoo and Castle"
              type="Unique Experience"
              highlight="Starting and finishing in the historic Castle Grounds. Sport meets heritage."
              idealFor={['Families', 'Fun Runners', 'Experience Seekers']}
              firstImageHoldTime={8000}
              images={[
                "/images/Dudley Zoo 5k Logo.png",
                "/images/Dudley Castle.png",
                "/images/Meerkat.png"
              ]}
            />
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-24 px-6 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                icon: <Clock className="text-brand-red" size={32} />,
                title: 'Evening Racing',
                desc: 'Perfect post-work atmosphere. Cooler conditions and lively crowds make for a unique summer experience.'
              },
              {
                icon: <Users className="text-brand-red" size={32} />,
                title: 'Welcoming Community',
                desc: 'From elite club athletes to families and first-timers, our series celebrates every runner.'
              },
              {
                icon: <Trophy className="text-brand-red" size={32} />,
                title: 'Professional Standards',
                desc: 'Accurate timing, marshalled courses, and EA licensing ensure a high-quality race experience.'
              },
            ].map((benefit, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/10">
                  {benefit.icon}
                </div>
                <h3 className="text-2xl mb-4">{benefit.title}</h3>
                <p className="text-gray-400 leading-relaxed">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Medal Section */}
      <section id="medal" className="py-24 px-6 bg-brand-dark relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-red/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div className="order-2 md:order-1 relative group perspective-1000">
              <motion.div
                animate={{ y: [-15, 15, -15], rotateY: [-5, 5, -5], rotateX: [2, -2, 2] }}
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                className="aspect-square relative z-10 p-8 flex items-center justify-center"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-brand-red/30 to-transparent blur-[80px] opacity-0 group-hover:opacity-70 transition-opacity duration-1000 rounded-full" />

                <img
                  src="/images/BCR Medal.png"
                  alt="Black Country Run Series Complete Interlocking Medal"
                  className="w-full h-full object-contain drop-shadow-[0_40px_60px_rgba(0,0,0,0.8)] filter brightness-110 contrast-125"
                />
              </motion.div>

              {/* Spinning technical accents */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 max-w-full">
                <div className="absolute w-[90%] h-[90%] border-[2px] border-dashed border-white/10 rounded-full animate-spin-slow opacity-50" />
                <div className="absolute w-[80%] h-[80%] border-[1px] border-brand-red/20 rounded-full" style={{ animation: 'spin 20s linear infinite reverse' }} />
              </div>
            </div>

            <div className="order-1 md:order-2 text-center md:text-left">
              <span className="text-brand-red font-bold uppercase tracking-widest text-xs mb-4 block">The Ultimate Reward</span>
              <div className="flex flex-col md:flex-row md:flex-wrap gap-x-4 gap-y-2 mb-8 justify-center md:justify-start overflow-hidden py-2">
                <motion.h2
                  initial={{ x: -100, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ margin: "-50px" }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="text-4xl md:text-5xl lg:text-6xl font-display font-bold bg-gradient-to-r from-brand-red to-red-400 bg-clip-text text-transparent"
                >
                  INTERLOCKING
                </motion.h2>
                <motion.h2
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ margin: "-50px" }}
                  transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                  className="text-4xl md:text-5xl lg:text-6xl font-display font-bold bg-gradient-to-b from-gray-100 to-gray-400 bg-clip-text text-transparent"
                >
                  SERIES
                </motion.h2>
                <motion.h2
                  initial={{ x: 100, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ margin: "-50px" }}
                  transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                  className="text-4xl md:text-5xl lg:text-6xl font-display font-bold bg-gradient-to-l from-brand-red to-red-400 bg-clip-text text-transparent"
                >
                  MEDAL
                </motion.h2>
              </div>
              <p className="text-lg text-gray-400 mb-6 leading-relaxed">
                Full-series entrants receive a bespoke interlocking medal design. Each individual race medal connects, forming one complete, impressive piece when all three are completed.
              </p>
              <div className="space-y-4 inline-block text-left">
                {[
                  'Bespoke design for 2026',
                  'Heavyweight premium finish',
                  'Interlocking mechanism',
                  'Series ribbon included'
                ].map(item => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle2 size={20} className="text-brand-red" />
                    <span className="font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="prices" className="py-24 px-6 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl mb-4">ENTRY OPTIONS</h2>
            <p className="text-gray-400">Secure your spot early for the best rates. Places are strictly limited.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Series Entry */}
            <div className="glass p-8 rounded-3xl border-brand-red/30 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-red text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1 rounded-full">Best Value</div>
              <h3 className="text-2xl mb-2">Full Series Entry</h3>
              <p className="text-gray-400 text-sm mb-6">Access to all 3 races + Interlocking Medal</p>
              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-5xl font-display font-bold">£35</span>
                <span className="text-gray-500 line-through">£45</span>
                <span className="text-brand-red text-xs font-bold uppercase tracking-wider ml-2">Early Bird</span>
              </div>
              <ul className="space-y-4 mb-8">
                {['All 3 Race Entries', 'Complete Interlocking Medal', 'Series Points Competition', 'Priority Support'].map(item => (
                  <li key={item} className="flex items-center gap-3 text-sm text-gray-300">
                    <CheckCircle2 size={16} className="text-brand-red" />
                    {item}
                  </li>
                ))}
              </ul>
              <a href="/enter" className="block w-full btn-gradient text-white text-center py-4 rounded-xl font-bold">
                Enter Now
              </a>
            </div>

            {/* Individual Entry */}
            <div className="glass p-8 rounded-3xl">
              <h3 className="text-2xl mb-2">Individual Race</h3>
              <p className="text-gray-400 text-sm mb-6">Entry to any single race in the series</p>
              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-5xl font-display font-bold">£15</span>
                <span className="text-brand-red text-xs font-bold uppercase tracking-wider ml-2">Per Race</span>
              </div>
              <ul className="space-y-4 mb-8">
                {['Single Race Entry', 'Individual Race Medal', 'Professional Timing', 'Post-race Refreshments'].map(item => (
                  <li key={item} className="flex items-center gap-3 text-sm text-gray-300">
                    <CheckCircle2 size={16} className="text-brand-red" />
                    {item}
                  </li>
                ))}
              </ul>
              <a href="/enter" className="block w-full bg-white/5 hover:bg-white/10 text-white text-center py-4 rounded-xl font-bold transition-all border border-white/10">
                Enter Now
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Prizes Section */}
      <section id="prizes" className="py-24 px-6 bg-brand-dark">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-6xl mb-8">PRIZES & <br /><span className="text-brand-red">AWARDS</span></h2>
              <p className="text-lg text-gray-400 mb-8">We celebrate excellence across all categories. Whether you're an elite athlete or a dedicated veteran, there's a trophy to chase.</p>

              <div className="space-y-8">
                <div>
                  <h4 className="text-xl mb-4 flex items-center gap-3">
                    <div className="w-8 h-8 bg-brand-red/20 text-brand-red rounded-lg flex items-center justify-center">1</div>
                    Each Individual Race
                  </h4>
                  <p className="text-gray-400 text-sm ml-11">Individual prizes, age category awards (V40, V50, V60+), and special recognition awards for standout performances.</p>
                </div>
                <div>
                  <h4 className="text-xl mb-4 flex items-center gap-3">
                    <div className="w-8 h-8 bg-brand-red/20 text-brand-red rounded-lg flex items-center justify-center">2</div>
                    Overall Series Awards
                  </h4>
                  <p className="text-gray-400 text-sm ml-11">Male, Female, and all Age Groups. We celebrate excellence across the board, plus the prestigious Tipton Harriers Club Award.</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl shadow-brand-red/10 border border-white/5">
                <img src="/images/Sale5MileWinner.jpg" alt="Sale 5 Mile Winner" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
              </div>
              <div className="aspect-[3/4] rounded-2xl overflow-hidden mt-8 shadow-2xl shadow-brand-red/10 border border-white/5">
                <img src="/images/GroupFinishPhoto.jpg" alt="Runners celebrating finish" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-6 bg-black">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl mb-4">FAQ</h2>
            <p className="text-gray-400">Everything you need to know before you lace up.</p>
          </div>

          <div className="space-y-4">
            {[
              { q: 'Is it suitable for beginners?', a: 'Absolutely! While we have elite runners, the series is open to all abilities. We have a friendly, supportive atmosphere.' },
              { q: 'Are the courses traffic-free?', a: 'Yes, all three races are held on traffic-free courses for your safety and enjoyment.' },
              { q: 'When do entries open?', a: 'General entries open in April. Register your interest now for priority access and early bird pricing.' },
              { q: 'Can I enter individual races?', a: 'Yes, you can enter single races for £15 each, or the full series for the best value.' },
              { q: 'Is the GWR 5K officially measured?', a: 'Yes, the GWR 5K is England Athletics measured and licensed. Your time will appear on Power of 10.' },
              { q: 'Are places limited?', a: 'Yes, due to venue capacities, places are strictly limited. We recommend registering early.' },
            ].map((item, i) => (
              <details key={i} className="glass rounded-2xl group">
                <summary className="p-6 cursor-pointer font-bold flex items-center justify-between list-none">
                  {item.q}
                  <ChevronRight size={18} className="group-open:rotate-90 transition-transform" />
                </summary>
                <div className="px-6 pb-6 text-gray-400 text-sm leading-relaxed">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Register Section */}
      <section id="register" className="py-24 px-6 bg-brand-dark relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-7xl mb-8 leading-tight">
                GET <span className="text-brand-red">PRIORITY</span> <br /> ACCESS
              </h2>
              <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                Don't miss out on the summer's most iconic race series. Register your interest today to receive:
              </p>
              <ul className="space-y-6">
                {[
                  { title: '48h Priority Window', desc: 'Secure your spot before general release.' },
                  { title: 'Early Bird Pricing', desc: 'Lock in the lowest possible entry fee.' },
                  { title: 'Event Updates', desc: 'Be the first to see the 2026 medal design.' },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <div className="w-6 h-6 bg-brand-red rounded-full flex items-center justify-center shrink-0 mt-1">
                      <CheckCircle2 size={14} className="text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{item.title}</h4>
                      <p className="text-gray-400 text-sm">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div id="form-container">
              <RegisterForm />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black pt-24 pb-12 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <a href="#" className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-brand-red rounded-sm flex items-center justify-center font-display font-bold text-xl">B</div>
                <span className="font-display font-bold text-xl tracking-tighter">BLACK COUNTRY RUN SERIES</span>
              </a>
              <p className="text-gray-500 max-w-sm mb-8">
                A summer 5K series celebrating the heritage and community of the Black Country. Hosted by Tipton Harriers.
              </p>
              <div className="flex gap-4">
                {[Instagram, Facebook, Twitter].map((Icon, i) => (
                  <a key={i} href="#" className="w-10 h-10 glass rounded-full flex items-center justify-center hover:bg-brand-red hover:border-brand-red transition-all">
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-display font-bold uppercase tracking-widest text-xs mb-6 text-gray-400">Quick Links</h4>
              <ul className="space-y-4 text-sm text-gray-500">
                <li><a href="#series" className="hover:text-white transition-colors">Series Overview</a></li>
                <li><a href="#races" className="hover:text-white transition-colors">Race Calendar</a></li>
                <li><a href="/enter" className="hover:text-white transition-colors">Enter Now</a></li>
                <li><a href="/results" className="hover:text-white transition-colors">Results</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-display font-bold uppercase tracking-widest text-xs mb-6 text-gray-400">Legal</h4>
              <ul className="space-y-4 text-sm text-gray-500">
                <li><a href="/legal#privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="/legal#terms" className="hover:text-white transition-colors">Terms & Conditions</a></li>
                <li><a href="/legal#cookies" className="hover:text-white transition-colors">Cookie Policy</a></li>
                <li><a href="/legal#refunds" className="hover:text-white transition-colors">Refund Policy</a></li>
                <li><a href="mailto:contact@blackcountryrunseries.co.uk" className="hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-600">© 2026 Tipton Harriers. Black Country Run Series.</p>
            <p className="text-[10px] text-gray-700 uppercase tracking-[0.2em]">Three Evening Races. One Summer. One Medal.</p>
          </div>
        </div>
      </footer>

      {/* Mobile Sticky CTA */}
      <div className="md:hidden fixed bottom-6 left-6 right-6 z-40">
        <a href="/enter" className="block w-full btn-gradient text-white text-center py-4 rounded-full font-bold">
          Enter Now
        </a>
      </div>
    </div>
  );
}

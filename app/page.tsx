"use client";

import { useState } from "react";

/* ───────────────── ICONS ───────────────── */
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-5 h-5 text-emerald-400">
    <path d="M5 13l4 4L19 7" />
  </svg>
);
const IconStar = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-yellow-400">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);
const IconCalendar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-8 h-8">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);
const IconClock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-8 h-8">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
);
const IconBell = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-8 h-8">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
  </svg>
);
const IconUsers = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-8 h-8">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
  </svg>
);
const IconSmartphone = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-8 h-8">
    <rect x="5" y="2" width="14" height="20" rx="2" />
    <path d="M12 18h.01" />
  </svg>
);
const IconBarChart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-8 h-8">
    <rect x="18" y="3" width="4" height="18" />
    <rect x="10" y="8" width="4" height="13" />
    <rect x="2" y="13" width="4" height="8" />
  </svg>
);
const IconGlobe = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-8 h-8">
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
  </svg>
);
const IconChevronLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);
const IconChevronRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
    <path d="M9 18l6-6-6-6" />
  </svg>
);

/* ───────────────── BOOKING DEMO DATA ───────────────── */
const SERVICES = [
  { id: "coupe", name: "Coupe femme", duration: "45 min", price: "55$", icon: "✂️" },
  { id: "coloration", name: "Coloration complète", duration: "90 min", price: "120$", icon: "🎨" },
  { id: "meches", name: "Mèches / Balayage", duration: "120 min", price: "150$", icon: "✨" },
  { id: "brushing", name: "Brushing", duration: "30 min", price: "35$", icon: "💇" },
  { id: "soin", name: "Soin capillaire", duration: "60 min", price: "80$", icon: "💆" },
  { id: "barbe", name: "Taille de barbe", duration: "20 min", price: "25$", icon: "🧔" },
];

const STYLISTS = [
  { id: "marie", name: "Marie L.", specialty: "Coloriste", avatar: "👩‍🎨" },
  { id: "julien", name: "Julien D.", specialty: "Coiffeur senior", avatar: "💇‍♂️" },
  { id: "sophie", name: "Sophie R.", specialty: "Spécialiste soins", avatar: "💆‍♀️" },
];

const TIME_SLOTS = [
  { time: "09:00", available: true },
  { time: "09:30", available: false },
  { time: "10:00", available: true },
  { time: "10:30", available: true },
  { time: "11:00", available: false },
  { time: "11:30", available: true },
  { time: "13:00", available: true },
  { time: "13:30", available: false },
  { time: "14:00", available: true },
  { time: "14:30", available: true },
  { time: "15:00", available: true },
  { time: "15:30", available: false },
  { time: "16:00", available: true },
  { time: "16:30", available: true },
];

/* ───────────────── BOOKING WIDGET ───────────────── */
function BookingWidget() {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedStylist, setSelectedStylist] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [calendarMonth] = useState(1); // February (0-indexed)

  const today = 7; // Simulated "today"
  const daysInMonth = 28;
  const monthName = "Février 2026";
  const dayNames = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  // Feb 2026 starts on Sunday → offset = 6
  const startOffset = 6;

  const service = SERVICES.find((s) => s.id === selectedService);
  const stylist = STYLISTS.find((s) => s.id === selectedStylist);

  const handleConfirm = () => setStep(5);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="flex items-center justify-between mb-8">
        {["Service", "Styliste", "Date", "Confirmer"].map((label, i) => (
          <div key={label} className="flex items-center gap-2 flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition ${
                step > i + 1
                  ? "bg-emerald-500 text-white"
                  : step === i + 1
                  ? "gradient-purple text-white"
                  : "bg-slate-800 text-slate-500"
              }`}
            >
              {step > i + 1 ? "✓" : i + 1}
            </div>
            <span className={`text-sm hidden sm:inline ${step === i + 1 ? "text-white font-semibold" : "text-slate-500"}`}>
              {label}
            </span>
            {i < 3 && <div className={`flex-1 h-0.5 mx-2 ${step > i + 1 ? "bg-emerald-500" : "bg-slate-800"}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Service */}
      {step === 1 && (
        <div className="animate-fade-in-up">
          <h3 className="text-2xl font-bold mb-6">Choisissez un service</h3>
          <div className="grid gap-3">
            {SERVICES.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setSelectedService(s.id);
                  setStep(2);
                }}
                className={`flex items-center gap-4 p-4 rounded-xl border transition text-left ${
                  selectedService === s.id
                    ? "border-violet-500 bg-violet-500/10"
                    : "border-slate-700/50 glass-card hover:border-violet-500/30"
                }`}
              >
                <span className="text-3xl">{s.icon}</span>
                <div className="flex-1">
                  <p className="font-semibold">{s.name}</p>
                  <p className="text-sm text-slate-400">{s.duration}</p>
                </div>
                <span className="text-lg font-bold text-violet-400">{s.price}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Stylist */}
      {step === 2 && (
        <div className="animate-fade-in-up">
          <h3 className="text-2xl font-bold mb-2">Choisissez votre styliste</h3>
          <p className="text-slate-400 mb-6">Pour: <span className="text-violet-400 font-semibold">{service?.name}</span></p>
          <div className="grid gap-3">
            {STYLISTS.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setSelectedStylist(s.id);
                  setStep(3);
                }}
                className={`flex items-center gap-4 p-5 rounded-xl border transition text-left ${
                  selectedStylist === s.id
                    ? "border-violet-500 bg-violet-500/10"
                    : "border-slate-700/50 glass-card hover:border-violet-500/30"
                }`}
              >
                <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center text-2xl">
                  {s.avatar}
                </div>
                <div>
                  <p className="font-semibold text-lg">{s.name}</p>
                  <p className="text-sm text-slate-400">{s.specialty}</p>
                </div>
              </button>
            ))}
            <button
              onClick={() => {
                setSelectedStylist("any");
                setStep(3);
              }}
              className="flex items-center gap-4 p-5 rounded-xl border border-slate-700/50 glass-card hover:border-violet-500/30 transition text-left"
            >
              <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center text-2xl">🎲</div>
              <div>
                <p className="font-semibold text-lg">Pas de préférence</p>
                <p className="text-sm text-slate-400">Premier(ère) disponible</p>
              </div>
            </button>
          </div>
          <button onClick={() => setStep(1)} className="mt-4 text-sm text-slate-400 hover:text-white flex items-center gap-1">
            <IconChevronLeft /> Retour
          </button>
        </div>
      )}

      {/* Step 3: Date & Time */}
      {step === 3 && (
        <div className="animate-fade-in-up">
          <h3 className="text-2xl font-bold mb-2">Choisissez une date et heure</h3>
          <p className="text-slate-400 mb-6">
            {service?.name} avec{" "}
            <span className="text-violet-400 font-semibold">
              {selectedStylist === "any" ? "Premier(ère) disponible" : stylist?.name}
            </span>
          </p>

          {/* Calendar */}
          <div className="glass-card rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <button className="p-1 hover:bg-slate-800 rounded-lg"><IconChevronLeft /></button>
              <h4 className="font-bold">{monthName}</h4>
              <button className="p-1 hover:bg-slate-800 rounded-lg"><IconChevronRight /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {dayNames.map((d) => (
                <div key={d} className="text-xs text-slate-500 py-2">{d}</div>
              ))}
              {Array.from({ length: startOffset }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isPast = day < today;
                const isToday = day === today;
                const isSelected = day === selectedDate;
                const isWeekend = (i + startOffset) % 7 === 5 || (i + startOffset) % 7 === 6;

                return (
                  <button
                    key={day}
                    disabled={isPast || isWeekend}
                    onClick={() => {
                      setSelectedDate(day);
                      setSelectedTime(null);
                    }}
                    className={`py-2 rounded-lg text-sm transition ${
                      isPast || isWeekend
                        ? "text-slate-700 cursor-not-allowed"
                        : isSelected
                        ? "gradient-purple text-white font-bold"
                        : isToday
                        ? "border border-violet-500 text-violet-400"
                        : "hover:bg-slate-800 text-slate-300"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time slots */}
          {selectedDate && (
            <div className="animate-slide-down">
              <h4 className="font-bold mb-3">Heures disponibles — {selectedDate} février</h4>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot.time}
                    disabled={!slot.available}
                    onClick={() => {
                      setSelectedTime(slot.time);
                      setStep(4);
                    }}
                    className={`py-2.5 rounded-lg text-sm font-medium transition ${
                      !slot.available
                        ? "bg-slate-800/50 text-slate-600 cursor-not-allowed line-through"
                        : selectedTime === slot.time
                        ? "gradient-purple text-white"
                        : "border border-slate-700 hover:border-violet-500 text-slate-300"
                    }`}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button onClick={() => setStep(2)} className="mt-6 text-sm text-slate-400 hover:text-white flex items-center gap-1">
            <IconChevronLeft /> Retour
          </button>
        </div>
      )}

      {/* Step 4: Confirmation */}
      {step === 4 && (
        <div className="animate-fade-in-up">
          <h3 className="text-2xl font-bold mb-6">Confirmer votre rendez-vous</h3>
          <div className="glass-card rounded-xl p-6 space-y-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Service</span>
              <span className="font-semibold">{service?.icon} {service?.name}</span>
            </div>
            <div className="border-t border-slate-700/50" />
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Styliste</span>
              <span className="font-semibold">
                {selectedStylist === "any" ? "🎲 Premier(ère) disponible" : `${stylist?.avatar} ${stylist?.name}`}
              </span>
            </div>
            <div className="border-t border-slate-700/50" />
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Date</span>
              <span className="font-semibold">📅 {selectedDate} février 2026</span>
            </div>
            <div className="border-t border-slate-700/50" />
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Heure</span>
              <span className="font-semibold">🕐 {selectedTime}</span>
            </div>
            <div className="border-t border-slate-700/50" />
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Durée</span>
              <span className="font-semibold">⏱️ {service?.duration}</span>
            </div>
            <div className="border-t border-slate-700/50" />
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Prix</span>
              <span className="text-2xl font-black text-violet-400">{service?.price}</span>
            </div>
          </div>

          {/* Client info */}
          <div className="glass-card rounded-xl p-6 mb-6 space-y-4">
            <h4 className="font-bold">Vos coordonnées</h4>
            <input
              type="text"
              placeholder="Votre nom complet"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-violet-500 transition"
            />
            <input
              type="tel"
              placeholder="Numéro de téléphone"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-violet-500 transition"
            />
            <input
              type="email"
              placeholder="Courriel (pour la confirmation)"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-violet-500 transition"
            />
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(3)} className="flex-1 border border-slate-600 py-3 rounded-xl font-semibold hover:bg-slate-800 transition">
              ← Retour
            </button>
            <button onClick={handleConfirm} className="flex-1 gradient-purple py-3 rounded-xl font-bold hover:opacity-90 transition">
              Confirmer le rendez-vous ✓
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Success */}
      {step === 5 && (
        <div className="animate-fade-in-up text-center py-12">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/20 flex items-center justify-center animate-checkmark">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="w-10 h-10 text-emerald-400">
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-3xl font-black mb-3">Rendez-vous confirmé! 🎉</h3>
          <p className="text-slate-300 text-lg mb-2">
            {service?.name} — {selectedDate} février à {selectedTime}
          </p>
          <p className="text-slate-400 mb-8">Un SMS et courriel de confirmation ont été envoyés.</p>
          <div className="glass-card rounded-xl p-6 max-w-sm mx-auto text-left space-y-3 mb-8">
            <p className="text-sm text-slate-400">📱 Rappel SMS envoyé 24h avant</p>
            <p className="text-sm text-slate-400">📧 Courriel de confirmation envoyé</p>
            <p className="text-sm text-slate-400">🔄 Modification/annulation en 1 clic</p>
          </div>
          <button
            onClick={() => {
              setStep(1);
              setSelectedService(null);
              setSelectedStylist(null);
              setSelectedDate(null);
              setSelectedTime(null);
            }}
            className="gradient-purple px-8 py-3 rounded-xl font-bold hover:opacity-90 transition"
          >
            Réserver un autre rendez-vous
          </button>
        </div>
      )}
    </div>
  );
}

/* ───────────────── MAIN PAGE ───────────────── */
export default function Home() {
  const [formStatus, setFormStatus] = useState<"idle" | "sent">("idle");

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("sent");
    setTimeout(() => setFormStatus("idle"), 4000);
  };

  return (
    <>
      {/* ───── NAV ───── */}
      <nav className="fixed top-0 w-full z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-purple rounded-lg flex items-center justify-center text-sm font-bold">B</div>
            <span className="text-lg font-bold">Book<span className="text-violet-400">IA</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-300">
            <a href="#fonctionnalites" className="hover:text-white transition">Fonctionnalités</a>
            <a href="#demo" className="hover:text-white transition">Démo</a>
            <a href="#tarifs" className="hover:text-white transition">Tarifs</a>
            <a href="#contact" className="hover:text-white transition">Contact</a>
          </div>
          <a href="#demo" className="gradient-purple px-5 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition">
            Essayer la démo →
          </a>
        </div>
      </nav>

      {/* ───── HERO ───── */}
      <section className="gradient-hero min-h-screen flex items-center relative overflow-hidden pt-20">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-16 items-center relative">
          <div>
            <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/30 rounded-full px-4 py-1.5 text-sm text-violet-300 mb-6">
              <span className="w-2 h-2 bg-violet-400 rounded-full animate-pulse" />
              Assistant de réservation intelligent
            </div>
            <h1 className="text-5xl lg:text-7xl font-black leading-tight mb-6">
              Zéro appel manqué,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-300">
                100% réservé
              </span>
            </h1>
            <p className="text-xl text-slate-300 mb-8 leading-relaxed max-w-lg">
              Un système de réservation IA qui gère vos rendez-vous, envoie des rappels
              et remplit votre agenda — 24/7, sans intervention humaine.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#demo" className="gradient-purple px-8 py-4 rounded-xl text-lg font-bold hover:opacity-90 transition pulse-glow-purple">
                Voir la démo en direct →
              </a>
              <a href="#tarifs" className="border border-slate-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-slate-800 transition">
                Voir les tarifs
              </a>
            </div>
            <div className="flex flex-wrap items-center gap-6 mt-10 text-sm text-slate-400">
              <span className="flex items-center gap-1">✅ Salons de coiffure</span>
              <span className="flex items-center gap-1">✅ Spas</span>
              <span className="flex items-center gap-1">✅ Cliniques</span>
              <span className="flex items-center gap-1">✅ Studios</span>
            </div>
          </div>
          <div className="relative hidden lg:block">
            <div className="float-animation">
              <div className="w-80 mx-auto glass-card rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 gradient-purple rounded-full flex items-center justify-center">📅</div>
                  <div>
                    <p className="font-bold text-sm">Nouveau rendez-vous</p>
                    <p className="text-xs text-slate-400">Il y a 2 min</p>
                  </div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-400">Client</span><span>Marie T.</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Service</span><span>Coloration</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Date</span><span>12 fév, 14h</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Status</span><span className="text-emerald-400">✅ Confirmé</span></div>
                </div>
                <div className="glass-card rounded-xl p-3 text-xs text-slate-300 flex gap-2 items-start">
                  <span>🤖</span>
                  <span>Rappel automatique envoyé par SMS à Marie. Prochain rappel dans 23h.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── STATS ───── */}
      <section className="bg-slate-900/50 border-y border-slate-800/50 py-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: "92%", label: "Moins de no-shows" },
            { value: "24/7", label: "Réservation en ligne" },
            { value: "+60%", label: "Plus de rendez-vous" },
            { value: "< 10s", label: "Pour réserver" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl font-black text-violet-400 mb-2">{stat.value}</div>
              <div className="text-sm text-slate-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ───── FEATURES ───── */}
      <section id="fonctionnalites" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Votre agenda, <span className="text-violet-400">automatisé</span>
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Fini les appels manqués et les doubles réservations. BookIA gère tout pour vous.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <IconCalendar />,
                title: "Réservation 24/7",
                desc: "Vos clients réservent à toute heure. Plus besoin de répondre au téléphone pendant un service.",
              },
              {
                icon: <IconBell />,
                title: "Rappels automatiques",
                desc: "SMS et courriels de rappel 24h et 1h avant le rendez-vous. Réduisez les no-shows de 92%.",
              },
              {
                icon: <IconClock />,
                title: "Disponibilité en temps réel",
                desc: "L'IA connaît votre horaire, vos pauses et vos congés. Jamais de double réservation.",
              },
              {
                icon: <IconUsers />,
                title: "Multi-employés",
                desc: "Chaque membre de l'équipe a son propre calendrier. Gestion des spécialités et préférences.",
              },
              {
                icon: <IconSmartphone />,
                title: "Widget intégrable",
                desc: "Un bouton sur votre site, Facebook ou Instagram. Vos clients réservent d'où ils sont.",
              },
              {
                icon: <IconBarChart />,
                title: "Analytiques",
                desc: "Heures de pointe, services populaires, taux de remplissage — tout dans un tableau de bord.",
              },
            ].map((feat) => (
              <div key={feat.title} className="glass-card rounded-2xl p-8 hover:border-violet-500/30 transition group">
                <div className="w-14 h-14 gradient-purple rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition">
                  {feat.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feat.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── DEMO SECTION ───── */}
      <section id="demo" className="py-24 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Essayez-le <span className="text-violet-400">maintenant</span>
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Testez le parcours de réservation complet. C&apos;est exactement ce que vos clients verront.
            </p>
          </div>
          <div className="glass-card rounded-2xl p-6 md:p-10">
            <BookingWidget />
          </div>
        </div>
      </section>

      {/* ───── HOW IT WORKS ───── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              En ligne en <span className="text-violet-400">48 heures</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Vos services",
                desc: "Envoyez-nous vos services, prix, employés et horaires. On configure tout.",
              },
              {
                step: "02",
                title: "Installation",
                desc: "Un simple bouton à ajouter sur votre site. Compatible partout: WordPress, Wix, Shopify...",
              },
              {
                step: "03",
                title: "Automatisé!",
                desc: "Les clients réservent en autonomie. Rappels, confirmations et paiements — tout est automatique.",
              },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="text-6xl font-black text-violet-500/20 mb-4">{s.step}</div>
                <h3 className="text-xl font-bold mb-3">{s.title}</h3>
                <p className="text-slate-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── INDUSTRIES ───── */}
      <section className="py-24 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Parfait pour <span className="text-violet-400">votre industrie</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "✂️", name: "Salons de coiffure", desc: "Coupes, colorations, coiffures" },
              { icon: "💆", name: "Spas & Massages", desc: "Soins, massages, détente" },
              { icon: "🏥", name: "Cliniques", desc: "Dentaires, esthétiques, médicales" },
              { icon: "💅", name: "Esthétique", desc: "Manucure, pédicure, soins" },
              { icon: "🏋️", name: "Studios fitness", desc: "Cours, entraînements, coaching" },
              { icon: "📸", name: "Photographes", desc: "Séances, événements, portraits" },
              { icon: "🐾", name: "Toilettage", desc: "Soins pour animaux" },
              { icon: "🎓", name: "Tuteurs", desc: "Cours privés, formations" },
            ].map((ind) => (
              <div key={ind.name} className="glass-card rounded-xl p-6 text-center hover:border-violet-500/30 transition">
                <span className="text-4xl mb-3 block">{ind.icon}</span>
                <h3 className="font-bold mb-1">{ind.name}</h3>
                <p className="text-sm text-slate-400">{ind.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── TESTIMONIALS ───── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Ils nous font <span className="text-violet-400">confiance</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Isabelle Côté",
                role: "Propriétaire, Salon Beauté Pure",
                text: "Mes no-shows sont passés de 15% à presque zéro. Les rappels SMS font toute la différence. En plus, je reçois des réservations même à 23h!",
              },
              {
                name: "Marc-André Simard",
                role: "Directeur, Spa Zenitude",
                text: "L'installation a pris 20 minutes. Nos clients adorent la simplicité du système. On a augmenté notre taux de remplissage de 35%.",
              },
              {
                name: "Catherine Roy",
                role: "Dentiste, Clinique Roy",
                text: "Fini les heures au téléphone à gérer les rendez-vous. BookIA nous a littéralement libéré une employée à temps plein.",
              },
            ].map((t) => (
              <div key={t.name} className="glass-card rounded-2xl p-8">
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <IconStar key={s} />
                  ))}
                </div>
                <p className="text-slate-300 mb-6 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 gradient-purple rounded-full flex items-center justify-center font-bold text-sm">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-slate-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── PRICING ───── */}
      <section id="tarifs" className="py-24 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Tarifs <span className="text-violet-400">simples</span>
            </h2>
            <p className="text-lg text-slate-400">Investissez dans votre croissance. ROI garanti dès le premier mois.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Solo",
                setup: "500$",
                monthly: "99$/mois",
                features: [
                  "1 employé",
                  "Réservation en ligne 24/7",
                  "Rappels SMS automatiques",
                  "Widget personnalisé",
                  "Support par email",
                ],
                highlighted: false,
              },
              {
                name: "Équipe",
                setup: "1 200$",
                monthly: "199$/mois",
                features: [
                  "Tout de Solo +",
                  "Jusqu'à 10 employés",
                  "Paiements en ligne",
                  "Tableau de bord analytique",
                  "Intégration Google Calendar",
                  "Support prioritaire",
                ],
                highlighted: true,
              },
              {
                name: "Entreprise",
                setup: "2 000$",
                monthly: "299$/mois",
                features: [
                  "Tout de Équipe +",
                  "Employés illimités",
                  "Multi-succursales",
                  "API personnalisée",
                  "Intégration POS/CRM",
                  "Gestionnaire dédié",
                ],
                highlighted: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 border ${
                  plan.highlighted
                    ? "border-violet-500 bg-gradient-to-b from-violet-500/10 to-transparent scale-105"
                    : "border-slate-700/50 glass-card"
                } transition hover:border-violet-500/50`}
              >
                {plan.highlighted && (
                  <div className="text-xs font-bold text-violet-400 uppercase tracking-wider mb-4">⭐ Plus populaire</div>
                )}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-1">
                  <span className="text-4xl font-black text-violet-400">{plan.monthly.split("/")[0]}</span>
                  <span className="text-slate-400">/mois</span>
                </div>
                <p className="text-sm text-slate-400 mb-6">+ {plan.setup} frais d&apos;installation</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <IconCheck /> <span className="text-slate-300">{f}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="#contact"
                  className={`block text-center py-3 rounded-xl font-semibold transition ${
                    plan.highlighted
                      ? "gradient-purple hover:opacity-90"
                      : "border border-slate-600 hover:bg-slate-800"
                  }`}
                >
                  Commencer
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── CONTACT / CTA ───── */}
      <section id="contact" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-black mb-6">
                Prêt à remplir votre{" "}
                <span className="text-violet-400">agenda</span>?
              </h2>
              <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                Contactez-nous pour une démo personnalisée adaptée à votre entreprise.
                Réponse en moins de 24 heures.
              </p>
              <div className="space-y-4 text-slate-300">
                <div className="flex items-center gap-3">
                  <span className="text-xl">📧</span>
                  <a href="mailto:alex@perroquet.io" className="hover:text-violet-400 transition">alex@perroquet.io</a>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl">🌐</span>
                  <span>perroquet.io</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl">📍</span>
                  <span>Montréal, Québec</span>
                </div>
              </div>
              <div className="mt-8 glass-card rounded-xl p-6">
                <h4 className="font-bold mb-3 flex items-center gap-2"><IconGlobe /> Intégrations</h4>
                <div className="flex flex-wrap gap-3 text-sm text-slate-300">
                  {["Google Calendar", "Outlook", "WordPress", "Wix", "Shopify", "Stripe", "Square"].map((i) => (
                    <span key={i} className="bg-slate-800 px-3 py-1.5 rounded-lg">{i}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="glass-card rounded-2xl p-8">
              {formStatus === "sent" ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">✅</div>
                  <h3 className="text-2xl font-bold mb-2">Message envoyé!</h3>
                  <p className="text-slate-400">Nous vous répondrons sous 24 heures.</p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-5">
                  <h3 className="text-xl font-bold mb-2">Demander une démo gratuite</h3>
                  <input
                    type="text"
                    placeholder="Nom de votre entreprise"
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-violet-500 transition"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="email"
                      placeholder="Votre courriel"
                      required
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-violet-500 transition"
                    />
                    <input
                      type="tel"
                      placeholder="Téléphone"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-violet-500 transition"
                    />
                  </div>
                  <select className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-400 focus:outline-none focus:border-violet-500 transition">
                    <option>Type d&apos;entreprise</option>
                    <option>Salon de coiffure</option>
                    <option>Spa / Massage</option>
                    <option>Clinique</option>
                    <option>Esthétique</option>
                    <option>Studio fitness</option>
                    <option>Autre</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Nombre d'employés"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-violet-500 transition"
                  />
                  <textarea
                    placeholder="Parlez-nous de vos besoins..."
                    rows={3}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-violet-500 transition resize-none"
                  />
                  <button type="submit" className="w-full gradient-purple py-3 rounded-xl font-bold hover:opacity-90 transition">
                    Demander ma démo gratuite →
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ───── FOOTER ───── */}
      <footer className="border-t border-slate-800/50 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 gradient-purple rounded-lg flex items-center justify-center text-sm font-bold">B</div>
              <span className="font-bold">BookIA</span>
              <span className="text-slate-500 text-sm">par Perroquet</span>
            </div>
            <p className="text-sm text-slate-500">© 2025 Perroquet. Tous droits réservés.</p>
            <div className="flex gap-6 text-sm text-slate-400">
              <a href="mailto:alex@perroquet.io" className="hover:text-white transition">Contact</a>
              <span>Montréal, QC 🇨🇦</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

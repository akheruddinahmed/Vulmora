import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Sparkles,
  Truck,
  Droplets,
  Award,
  CheckCircle2,
  ArrowRight,
  HeartHandshake,
  MapPin,
  Building2,
  Leaf,
  FlaskConical,
} from 'lucide-react';
import { useStoreSettings } from '@/contexts/StoreSettingsContext';
import { VulmoraLogo } from '@/components/common/VulmoraLogo';
import { SKLogo } from '@/components/common/SKLogo';

export const AboutUsPage: React.FC = () => {
  const { settings } = useStoreSettings();

  const corePillars = [
    {
      icon: FlaskConical,
      title: 'Pharmaceutical Precision',
      desc: 'Our personal care line, including Glycerin I.P., adheres strictly to the Indian Pharmacopoeia monograph standards with 98% pure topical formulation under licensed manufacturing supervision.',
      color: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      icon: Sparkles,
      title: 'Power 3X Cleaning Performance',
      desc: 'Engineered with active enzyme complexes and optical brighteners that lift stubborn grease and dirt while preserving delicate textile fibers even in hard groundwater.',
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    {
      icon: Droplets,
      title: 'Long-Lasting Freshness & Sanitization',
      desc: 'Our White Phenyl concentrates blend natural pine oil extracts and floral fragrance to sanitize living spaces and eliminate odor-causing bacteria on all floor types.',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      icon: Truck,
      title: '100% Cash on Delivery (COD)',
      desc: 'Zero risk for you. Inspect your package at your doorstep and pay cash only when satisfied. Direct nationwide logistics coverage across Indian towns and cities.',
      color: 'bg-purple-50 text-purple-700 border-purple-200',
    },
  ];

  const milestones = [
    {
      title: 'Scientific Formulation',
      detail: 'Formulated at S K Research Laboratories, prioritizing concentrated active ingredients over watered-down fillers.',
    },
    {
      title: 'Drug License Compliant',
      detail: 'Personal care items manufactured following national standards to ensure zero skin irritants and uncompromised purity.',
    },
    {
      title: 'Direct-to-Home Delivery',
      detail: 'Eliminating multiple distributor markups so Indian families receive premium hygiene at genuinely affordable pricing.',
    },
    {
      title: 'Uncompromising Quality Control',
      detail: 'Every single batch undergoes seal integrity, density, and safety inspections before dispatch from Guwahati.',
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-950 via-slate-900 to-slate-950 text-white py-20 lg:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-700/20 via-transparent to-transparent opacity-60 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-semibold mb-6 uppercase tracking-wider backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The VULMORA Promise</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Purity, Hygiene & Care <br className="hidden sm:inline" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-200 to-purple-400">
              Crafted for Every Indian Home
            </span>
          </h1>

          <p className="mt-6 text-sm sm:text-base lg:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
            Manufactured with laboratory precision by <strong className="text-white">S K Research Laboratories</strong> in Guwahati, Assam. Delivering authentic personal skin care and powerhouse cleaning essentials directly to your doorstep.
          </p>

          {/* Quick Metrics Bar */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-extrabold text-blue-400">98%</div>
              <div className="text-[11px] sm:text-xs text-slate-300 mt-1">Glycerin I.P. Monograph Purity</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-extrabold text-purple-400">Power 3X</div>
              <div className="text-[11px] sm:text-xs text-slate-300 mt-1">Deep Stain Lifting Formula</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">100%</div>
              <div className="text-[11px] sm:text-xs text-slate-300 mt-1">Cash on Delivery Across India</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-400">Assam</div>
              <div className="text-[11px] sm:text-xs text-slate-300 mt-1">Direct Manufacturer Dispatch</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Story & Origin Section */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 text-blue-700 text-xs font-bold uppercase tracking-wider">
              <Building2 className="w-4 h-4" />
              <span>Our Heritage & Vision</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Bridging Pharmaceutical Standards With Everyday Household Care
            </h2>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Every day, families depend on essential products for cleaning, laundry, and personal wellness. Too often, commercial alternatives rely on excessive fillers, diluted chemical cleansers, and inflated distributor price tags.
            </p>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              <strong className="text-slate-900">VULMORA</strong> was founded at <strong className="text-slate-900">S K Research Laboratories</strong> with a clean conscience and a single mandate: <em>to formulate trustworthy, concentrated essentials where every drop and scoop delivers true value.</em>
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-slate-700">
                  <strong>Standardized Formulation:</strong> Strict batch uniformity ensures consistent results with every order.
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-slate-700">
                  <strong>Drug License Certified:</strong> Our Glycerin conforms strictly to Indian Pharmacopoeia (I.P.) grades.
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-slate-700">
                  <strong>Tamper-Evident Safety:</strong> Sealed caps and protective bottling preserve freshness from plant to doorstep.
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-tr from-blue-900 via-indigo-900 to-slate-900 p-8 sm:p-12 text-white shadow-xl border border-slate-200">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
              
              <div className="space-y-6 relative z-10">
                {/* Official S K Research Laboratories Logo Badge */}
                <div className="p-3 sm:p-4 bg-white rounded-2xl shadow-lg border border-white/20 inline-flex items-center">
                  <SKLogo variant="logo-only" size="lg" className="h-12 sm:h-14" />
                </div>

                <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                  Manufactured & Marketed by <br />
                  <span className="text-blue-300">S K Research Laboratories</span>
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Operating with ethical manufacturing guidelines, S K Research Laboratories drives continuous research into fabric safety, deep soil suspension, and skin dermatological compatibility.
                </p>

                <div className="pt-4 border-t border-white/10 text-xs text-slate-400 space-y-2">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <span>{settings.storeAddress}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>State Drug License & Laboratory Verified Standards</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Core Pillars */}
      <section className="py-16 bg-slate-100/70 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-blue-700 text-xs font-bold uppercase tracking-wider">
              Why Indian Families Choose Us
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              The Four Pillars of VULMORA Excellence
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-3">
              We focus on what matters: purity of ingredients, heavy-duty cleaning power, and genuine customer trust.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {corePillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 border ${pillar.color}`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-2">{pillar.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{pillar.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Manufacturing Quality & Commitment */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-14 shadow-sm">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <Leaf className="w-3.5 h-3.5" />
              <span>Quality Assurance</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Zero Compromises on Formulation Safety
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              From water treatment to ingredient blending, our production chain ensures that every unit dispatched to customers meets safety benchmarks.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {milestones.map((item, i) => (
              <div key={i} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-2">
                <div className="text-blue-900 font-extrabold text-sm flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-900 text-white text-xs flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span>{item.title}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Official Manufacturer Endorsement Banner */}
        <div className="mt-12">
          <SKLogo variant="banner" theme="light" />
        </div>
      </section>

      {/* 5. Call To Action */}
      <section className="pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 rounded-3xl p-8 sm:p-12 text-white text-center shadow-xl space-y-6">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Experience VULMORA in Your Home?
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 max-w-2xl mx-auto leading-relaxed">
            Order your household cleaning essentials and personal care today. Pay conveniently with Cash on Delivery at your doorstep.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/shop"
              className="px-6 py-3 rounded-xl bg-white text-blue-900 font-bold text-xs sm:text-sm hover:bg-slate-100 transition-colors shadow-md flex items-center gap-2"
            >
              <span>Browse All Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/contact"
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 transition-colors"
            >
              <span>Contact Customer Support</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUsPage;

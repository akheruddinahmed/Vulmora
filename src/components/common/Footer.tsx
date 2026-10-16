import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Truck,
  ShieldCheck,
  RotateCcw,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';
import { useStoreSettings } from '@/contexts/StoreSettingsContext';
import { useToast } from '@/contexts/ToastContext';
import { VulmoraLogo } from './VulmoraLogo';
import { SKLogo } from './SKLogo';

export const Footer: React.FC = () => {
  const { settings } = useStoreSettings();
  const { success } = useToast();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setSubscribed(true);
      success('Subscribed!', 'Thank you for subscribing to VULMORA announcements.');
      setNewsletterEmail('');
    }
  };

  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value proposition badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pb-12 border-b border-slate-800">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-blue-600/10 text-blue-400 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Cash on Delivery Across India</h4>
              <p className="text-xs text-slate-400 mt-0.5">Pay only when you inspect the parcel at doorstep</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-purple-600/10 text-purple-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">100% Authentic VULMORA Care</h4>
              <p className="text-xs text-slate-400 mt-0.5">Direct from manufacturer packaging</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-fuchsia-600/10 text-fuchsia-400 flex items-center justify-center shrink-0">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Hassle-Free Returns</h4>
              <p className="text-xs text-slate-400 mt-0.5">7-day doorstep pickup support</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 py-12">
          {/* Brand & Manufacturer Info */}
          <div className="space-y-4">
            <VulmoraLogo theme="dark" size="md" />
            <p className="text-xs text-slate-400 leading-relaxed">
              VULMORA delivers trusted everyday household cleaning and personal care solutions. From Power 3X laundry care to floral floor cleaners and pure Glycerin I.P.
            </p>

            {/* Official Manufacturer Endorsement */}
            <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 flex items-center gap-3">
              <div className="bg-white p-1.5 rounded-xl shrink-0">
                <SKLogo variant="logo-only" size="xs" className="h-7" />
              </div>
              <div className="text-[11px] text-slate-300">
                <span className="block text-[9px] uppercase font-bold tracking-wider text-slate-400">
                  Formulated & Manufactured by
                </span>
                <span className="font-extrabold text-white">S K Research Laboratories</span>
              </div>
            </div>
            <div className="space-y-2 text-xs text-slate-400 pt-1">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <span>{settings.storeAddress}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                <span>Customer Care: {settings.contactPhone}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                <span>{settings.contactEmail}</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white tracking-wider uppercase mb-4">
              VULMORA Catalog
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-white transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/shop?category=laundry-care" className="hover:text-white transition-colors">
                  Laundry Washing Powder
                </Link>
              </li>
              <li>
                <Link to="/shop?category=floor-cleaning" className="hover:text-white transition-colors">
                  White Phenyl Floor Cleaners
                </Link>
              </li>
              <li>
                <Link to="/shop?category=personal-care" className="hover:text-white transition-colors">
                  Glycerin I.P. Skin Softener
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About VULMORA
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact Customer Care
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-white transition-colors">
                  Track My COD Order
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies & Assistance */}
          <div>
            <h4 className="text-xs font-bold text-white tracking-wider uppercase mb-4">
              Policies & Help
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <span className="cursor-pointer hover:text-white transition-colors" title={settings.policies?.returnPolicy}>
                  Return & Refund Policy
                </span>
              </li>
              <li>
                <span className="cursor-pointer hover:text-white transition-colors" title={settings.policies?.shippingPolicy}>
                  Shipping & Delivery Info
                </span>
              </li>
              <li>
                <span className="cursor-pointer hover:text-white transition-colors" title={settings.policies?.privacyPolicy}>
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="cursor-pointer hover:text-white transition-colors" title={settings.policies?.termsAndConditions}>
                  Terms & Conditions
                </span>
              </li>
              <li>
                <span className="text-emerald-400 font-semibold">100% Cash on Delivery (COD)</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white tracking-wider uppercase">
              Stay in Touch
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Get notified of new VULMORA household releases, pack sizes, and special seasonal promotions.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <input
                type="email"
                required
                placeholder="Enter your email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 text-xs text-white rounded-xl border border-slate-800 focus:outline-none focus:border-blue-600"
              />
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
              >
                {subscribed ? 'Subscribed ✓' : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 mt-4 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} VULMORA. Manufactured & Marketed by S K Research Laboratories. All rights reserved.</p>
          <p className="flex items-center gap-1.5 font-medium">
            <span>Guwahati, Assam</span>
            <span>•</span>
            <span className="text-blue-400">Cash on Delivery Nationwide</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

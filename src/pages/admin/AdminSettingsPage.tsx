import React, { useState, useEffect } from 'react';
import { Save, Database, ShieldCheck, Truck, RefreshCw, Layers, Cloud, Key, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { useStoreSettings } from '@/contexts/StoreSettingsContext';
import { seedInitialFirestoreData } from '@/services/seed/seedDataService';
import { useToast } from '@/contexts/ToastContext';
import { StoreSettings } from '@/types/settings';
import { isFirebaseConfigured } from '@/services/firebase/config';

export const AdminSettingsPage: React.FC = () => {
  const { settings, updateSettings, isLoading } = useStoreSettings();
  const { success, error } = useToast();

  const [formData, setFormData] = useState<StoreSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleChange = (field: keyof StoreSettings, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePolicyChange = (policyField: keyof StoreSettings['policies'], value: string) => {
    setFormData((prev) => ({
      ...prev,
      policies: {
        ...prev.policies,
        [policyField]: value,
      },
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateSettings(formData);
    } catch {
      // toast shown in context
    } finally {
      setIsSaving(false);
    }
  };

  const handleSeedData = async () => {
    if (
      !window.confirm(
        'Populate Firestore with sample categories, products, and default store configuration? This will create real documents in Firestore.'
      )
    ) {
      return;
    }

    setIsSeeding(true);
    try {
      const res = await seedInitialFirestoreData();
      success(
        'Database Seeded!',
        `Created ${res.categoriesCount} categories and ${res.productsCount} products in Firestore.`
      );
    } catch (err: any) {
      error('Seed Error', err.message);
    } finally {
      setIsSeeding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-800 rounded w-1/4" />
        <div className="h-96 bg-slate-800 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Store Preferences & Operations
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Global delivery thresholds, Cash on Delivery policies, brand identity, and catalog utilities
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/25 active:scale-[0.98] disabled:opacity-50 self-start sm:self-auto"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Settings</span>
            </>
          )}
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Section 1: Brand & Contact Info */}
        <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-4">
          <h3 className="text-sm font-bold text-white pb-3 border-b border-slate-800">
            1. Brand Identity & Customer Service
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1 sm:col-span-2">
              <label className="font-semibold text-slate-300">Store Name</label>
              <input
                type="text"
                value={formData.storeName || ''}
                onChange={(e) => handleChange('storeName', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="font-semibold text-slate-300">Store Tagline / Slogan</label>
              <input
                type="text"
                value={formData.storeTagline || ''}
                onChange={(e) => handleChange('storeTagline', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Customer Support Email</label>
              <input
                type="email"
                value={formData.contactEmail || ''}
                onChange={(e) => handleChange('contactEmail', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Customer Support Phone</label>
              <input
                type="text"
                value={formData.contactPhone || ''}
                onChange={(e) => handleChange('contactPhone', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="font-semibold text-slate-300">Physical Store Address</label>
              <input
                type="text"
                value={formData.storeAddress || ''}
                onChange={(e) => handleChange('storeAddress', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="font-semibold text-slate-300">Top Announcement Banner</label>
              <input
                type="text"
                value={formData.announcement || ''}
                onChange={(e) => handleChange('announcement', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Delivery & Thresholds */}
        <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-4">
          <h3 className="text-sm font-bold text-white pb-3 border-b border-slate-800">
            2. Delivery Shipping & Thresholds
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Standard COD Shipping Fee (₹)</label>
              <input
                type="number"
                min="0"
                value={formData.shippingFee || 0}
                onChange={(e) => handleChange('shippingFee', Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Free Shipping Minimum (₹)</label>
              <input
                type="number"
                min="0"
                value={formData.freeShippingThreshold || 0}
                onChange={(e) => handleChange('freeShippingThreshold', Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Global Low Stock Threshold</label>
              <input
                type="number"
                min="1"
                value={formData.lowStockThreshold || 5}
                onChange={(e) => handleChange('lowStockThreshold', Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Legal & Customer Policies */}
        <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-4">
          <h3 className="text-sm font-bold text-white pb-3 border-b border-slate-800">
            3. Customer Policies (Cash on Delivery & Returns)
          </h3>

          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Return & Refund Policy</label>
              <textarea
                rows={3}
                value={formData.policies?.returnPolicy || ''}
                onChange={(e) => handlePolicyChange('returnPolicy', e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500 resize-none leading-relaxed"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Shipping & Delivery Policy</label>
              <textarea
                rows={3}
                value={formData.policies?.shippingPolicy || ''}
                onChange={(e) => handlePolicyChange('shippingPolicy', e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500 resize-none leading-relaxed"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Terms & Conditions</label>
              <textarea
                rows={3}
                value={formData.policies?.termsAndConditions || ''}
                onChange={(e) => handlePolicyChange('termsAndConditions', e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500 resize-none leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Database Seeder Utility */}
        <div className="bg-slate-900 border border-amber-500/30 p-6 sm:p-8 rounded-3xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-amber-400" />
                <span>Initialize VULMORA Catalog with Seed Data</span>
              </h3>
              <p className="text-xs text-slate-400 max-w-lg">
                Populates your Firestore database with the 3 authentic VULMORA departments (Laundry Care, Floor Cleaning, Personal Care) and the 4 initial products with verified printed MRPs and packaging photos.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSeedData}
              disabled={isSeeding}
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-md shrink-0 disabled:opacity-50 flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
              <span>{isSeeding ? 'Seeding...' : 'Seed Sample Data'}</span>
            </button>
          </div>
        </div>

        {/* Section 5: Firebase Backend & Cloud Connection */}
        <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <Cloud className="w-5 h-5 text-blue-400" />
              <div>
                <h3 className="text-sm font-bold text-white">5. Firebase Backend Connection</h3>
                <p className="text-xs text-slate-400">Database and authentication infrastructure status</p>
              </div>
            </div>
            {isFirebaseConfigured ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Live Project Connected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <AlertCircle className="w-3.5 h-3.5" />
                Configuration Incomplete
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1">
              <span className="text-slate-400 font-medium">Configured Project ID:</span>
              <p className="font-mono text-white text-[13px] font-bold">
                {import.meta.env.VITE_FIREBASE_PROJECT_ID || 'vulmora-b26f8'}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1">
              <span className="text-slate-400 font-medium">Auth Domain:</span>
              <p className="font-mono text-white text-[13px] font-bold">
                {import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'vulmora-b26f8.firebaseapp.com'}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-300 font-semibold">
              <span className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-blue-400" />
                How to update Firebase configuration keys
              </span>
              <a
                href="https://console.firebase.google.com"
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 text-[11px]"
              >
                Firebase Console <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Open the project's root <code className="text-amber-300">.env</code> file in your editor to review or update your Firebase Web App credentials:
            </p>
            <pre className="font-mono text-[10px] sm:text-[11px] p-3 rounded-xl bg-slate-900 border border-slate-800 text-blue-300 overflow-x-auto">
{`VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:...`}
            </pre>
          </div>
        </div>

        {/* Bottom Save Bar */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/25 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save All Store Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};

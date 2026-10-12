import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  Building,
  CreditCard,
  Tag,
  Shield,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Mail,
  Phone,
  Save,
  Server
} from 'lucide-react';
import { isValidSwissIBAN, formatIBAN } from '../../utils/swissQr';
import { Role } from '../../types';

export const SettingsAdmin: React.FC = () => {
  const {
    settings,
    updateSettings,
    pricingRules,
    role,
    setRole,
    resetToDemoData,
    addToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'general' | 'banking' | 'pricing' | 'roles' | 'system'>('general');

  // School form
  const [name, setName] = useState(settings.name);
  const [legalName, setLegalName] = useState(settings.legalName);
  const [street, setStreet] = useState(settings.street);
  const [postalCode, setPostalCode] = useState(settings.postalCode);
  const [city, setCity] = useState(settings.city);
  const [canton, setCanton] = useState(settings.canton);
  const [email, setEmail] = useState(settings.email);
  const [phone, setPhone] = useState(settings.phone);
  const [website, setWebsite] = useState(settings.website);

  // Banking form
  const [iban, setIban] = useState(settings.iban);
  const [qrIban, setQrIban] = useState(settings.qrIban);
  const [creditorName, setCreditorName] = useState(settings.creditorName);
  const [taxRatePercent, setTaxRatePercent] = useState(settings.taxRatePercent);
  const [paymentTermsDays, setPaymentTermsDays] = useState(settings.defaultPaymentTermsDays);

  const [ibanError, setIbanError] = useState('');

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      name,
      legalName,
      street,
      postalCode,
      city,
      canton,
      email,
      phone,
      website
    });
  };

  const handleSaveBanking = (e: React.FormEvent) => {
    e.preventDefault();
    if (iban && !isValidSwissIBAN(iban)) {
      setIbanError('Please provide a valid Swiss IBAN (starts with CH or LI, 21 alphanumeric chars)');
      return;
    }
    setIbanError('');

    updateSettings({
      iban,
      qrIban,
      creditorName,
      taxRatePercent,
      defaultPaymentTermsDays: paymentTermsDays
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Settings & Administration
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configure Swiss dance studio credentials, QR-bill parameters, pricing models, and security roles.
          </p>
        </div>

        <button
          onClick={resetToDemoData}
          className="px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Demo Database</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 max-w-fit text-xs font-medium">
        {[
          { id: 'general', label: 'Studio Profile' },
          { id: 'banking', label: 'Swiss Banking & QR-IBAN' },
          { id: 'pricing', label: 'Pricing Rules & Age Tiers' },
          { id: 'roles', label: 'Demo Role Switcher' },
          { id: 'system', label: 'System & Vercel Deploy' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === tab.id
                ? 'bg-white text-slate-900 font-semibold shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: General Studio Info */}
      {activeTab === 'general' && (
        <form onSubmit={handleSaveGeneral} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4 max-w-2xl text-xs">
          <h3 className="font-bold text-sm text-slate-900">Studio Entity & Official Swiss Address</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Studio Display Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Legal Entity (Handelsregister)</label>
              <input
                type="text"
                value={legalName}
                onChange={e => setLegalName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Street Address</label>
              <input
                type="text"
                value={street}
                onChange={e => setStreet(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Postal Code (PLZ)</label>
              <input
                type="text"
                value={postalCode}
                onChange={e => setPostalCode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">City & Canton</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
                <input
                  type="text"
                  value={canton}
                  onChange={e => setCanton(e.target.value)}
                  className="w-16 px-2 py-2 rounded-xl border border-slate-200 text-center uppercase font-mono"
                  maxLength={2}
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Official Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Website URL</label>
              <input
                type="text"
                value={website}
                onChange={e => setWebsite(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold shadow-md flex items-center gap-1.5 active:scale-95 transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Studio Information</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Swiss Banking & QR-IBAN */}
      {activeTab === 'banking' && (
        <form onSubmit={handleSaveBanking} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4 max-w-2xl text-xs">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="w-4 h-4 text-violet-600" />
            <h3 className="font-bold text-sm text-slate-900">SIX Swiss Payment Standards Configuration</h3>
          </div>

          <p className="text-slate-500">
            Configure your Swiss clearing bank credentials for automatic QR-Bill generation and CAMT reconciliation.
          </p>

          <div className="space-y-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Creditor Account Holder Name *</label>
              <input
                type="text"
                value={creditorName}
                onChange={e => setCreditorName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Standard Swiss IBAN *</label>
              <input
                type="text"
                value={iban}
                onChange={e => setIban(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
              />
              {ibanError && <p className="text-[11px] text-rose-500 mt-1">{ibanError}</p>}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Official QR-IBAN (for 27-digit Swiss QR References) *
              </label>
              <input
                type="text"
                value={qrIban}
                onChange={e => setQrIban(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-violet-700 font-bold"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Allocated by PostFinance, UBS, Raiffeisen, or Cantonal banks specifically for Swiss QR-bills.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Swiss VAT Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={taxRatePercent}
                  onChange={e => setTaxRatePercent(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Default Terms (Days)</label>
                <input
                  type="number"
                  value={paymentTermsDays}
                  onChange={e => setPaymentTermsDays(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold shadow-md flex items-center gap-1.5 active:scale-95 transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Update Banking Credentials</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 3: Pricing Rules */}
      {activeTab === 'pricing' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4 text-xs">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Active Pricing Tiers & Age Categories</h3>
            <p className="text-slate-400">
              Configured age group calculations automatically apply discounts and generate invoice lines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pricingRules.map(rule => (
              <div key={rule.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900">{rule.name}</h4>
                  <span className="font-mono font-bold text-violet-700">
                    CHF {rule.termCHF}.00 <span className="text-[10px] text-slate-400 font-normal">/ term</span>
                  </span>
                </div>
                <p className="text-slate-500 text-[11px]">{rule.description}</p>
                <div className="flex items-center gap-3 text-[11px] text-slate-600 pt-1 border-t border-slate-200/60">
                  <span>Age: {rule.minAge}–{rule.maxAge} yrs</span>
                  <span>•</span>
                  <span>Classes: {rule.weeklyClasses === 0 ? 'Drop-in' : `${rule.weeklyClasses}x / week`}</span>
                  <span>•</span>
                  <span>Sibling Rebate: {rule.siblingDiscountPercent}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Demo Role Switcher */}
      {activeTab === 'roles' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4 max-w-2xl text-xs">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Role-Based Access Simulation</h3>
            <p className="text-slate-500 mt-1">
              Switch roles to evaluate how the application behaves for different staff members:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                id: 'admin',
                label: 'Studio Administrator',
                desc: 'Full access to all modules, billing, registrations, and settings.'
              },
              {
                id: 'owner',
                label: 'Studio Owner',
                desc: 'Executive access with focus on high-level revenue and reports.'
              },
              {
                id: 'teacher',
                label: 'Dance Teacher / Instructor',
                desc: 'Focused on daily timetable, class attendance, and student notes.'
              },
              {
                id: 'finance',
                label: 'Finance & Invoicing Admin',
                desc: 'Dedicated to Swiss QR invoicing, bank reconciliation, and reminders.'
              },
            ].map(r => (
              <div
                key={r.id}
                onClick={() => setRole(r.id as Role)}
                className={`p-4 rounded-xl border cursor-pointer transition ${
                  role === r.id
                    ? 'border-violet-600 bg-violet-50/70 ring-2 ring-violet-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900 text-sm">{r.label}</span>
                  {role === r.id && (
                    <span className="w-2.5 h-2.5 rounded-full bg-violet-600" />
                  )}
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: System & Vercel Deploy */}
      {activeTab === 'system' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4 max-w-2xl text-xs">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-violet-600" />
            <h3 className="font-bold text-sm text-slate-900">Vercel Deployment Architecture</h3>
          </div>

          <p className="text-slate-600 leading-relaxed">
            DanseFlow has been architected as a high-performance React + TypeScript single-page application configured specifically for zero-friction Vercel deployment:
          </p>

          <div className="space-y-2.5 bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-[11px]">
            <div className="flex items-center gap-2 text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>vercel.json SPA rewrite rules configured</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Output directory: dist / Build command: npm run build</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>SIX Swiss Payment Standards 2.0 QR-bill engine included</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Offline-capable persistent localStorage state layer</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-violet-50/50 border border-violet-100 text-slate-700">
            <h4 className="font-bold text-violet-950 mb-1">To deploy to Vercel via CLI or GitHub:</h4>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600">
              <li>Push this repository to GitHub or run <code>vercel</code> in the root directory.</li>
              <li>Vercel automatically detects the Vite framework and <code>vercel.json</code>.</li>
              <li>Your live Swiss Dance SaaS will be accessible globally at your <code>.vercel.app</code> domain!</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};

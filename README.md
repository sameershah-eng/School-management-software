# DanseFlow — Swiss Dance School Management SaaS

> Everything your dance school needs, beautifully organized. Built for Swiss dance studios and academies.

## Overview

**DanseFlow** is a comprehensive, production-grade SaaS application designed specifically for dance studios operating in Switzerland. It provides an end-to-end operational suite covering:

- **Swiss QR-Bill Invoicing:** Native generation of SIX Swiss Payment Standards 2.0 (SPS) compliant QR-bills with 27-digit structured QR-references (`QRR`), Modulo 10 recursive check digits, valid QR-IBAN support, and A4 print-ready payment slips (*Empfangsschein* & *Zahlteil*).
- **ISO 20022 Bank Reconciliation:** Direct import and automated matching of CAMT.053 / CSV bank statements from PostFinance, UBS, Raiffeisen, and Swiss Cantonal Banks.
- **Student & Minor Guardian Management:** Complete dancer directory with automatic age group categorization (Kids 4–9, Teens 10–16, Adults 17+), parental guardian contact tracking for minors, and Swiss address validation.
- **Weekly Schedule & Conflict Detection:** Interactive timetable grid across studios and instructors with automatic collision alerts for room and teacher double-bookings.
- **Online Public Student Portal:** Interactive 4-step registration wizard with live studio capacity checks, terms acceptance, reference generation, and 1-click admin enrollment approval.
- **Attendance & Point Cards:** Daily roll-call sheet optimized for tablets with automatic 1-point deduction from prepaid 5/10/20 class drop-in passes.
- **Polite Swiss Reminders:** Multi-lingual dunning notices in German (*Mahnung*), French (*Rappel*), and English with preview and simulated dispatch.
- **Data Migration & CSV Tools:** Import existing student rosters with column mapping and duplicate email detection.

---

## Deploying to Vercel

DanseFlow is pre-configured for instant zero-configuration deployment on **Vercel**:

### Option 1: Deploy with Vercel CLI

```bash
# 1. Install Vercel CLI (if not already installed)
npm install -g vercel

# 2. Deploy from the project root
vercel
```

Follow the interactive prompts:
- **Set up and deploy?** [Y]
- **Which scope?** (Select your account)
- **Link to existing project?** [N]
- **Project name?** `danseflow`
- **Framework Preset?** Vite (detected automatically)
- **Build Command?** `npm run build`
- **Output Directory?** `dist`

### Option 2: Deploy via GitHub / GitLab on Vercel Dashboard

1. Push your repository to GitHub.
2. In your Vercel Dashboard, click **Add New...** -> **Project**.
3. Import the repository.
4. Framework is automatically detected as **Vite**.
5. Click **Deploy**.

The included `vercel.json` ensures that single-page application (SPA) routing works smoothly for all browser refreshes and direct URLs:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## Local Development

```bash
# Install dependencies
npm install

# Start development server on port 3000
npm run dev

# Compile and check TypeScript
npm run lint

# Production build
npm run build
```

---

## Swiss Standards & Conventions

- **Currency:** Swiss Francs (`CHF`)
- **Number formatting:** Swiss convention (`CHF 1'250.00`)
- **Date format:** `DD.MM.YYYY`
- **Timezone:** `Europe/Zurich`
- **QR Standard:** SIX Swiss Payment Standards 2.0 (Swiss Payments Code `SPC`)

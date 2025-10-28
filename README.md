# GDPR-Compliant Google Tag Manager for Next.js

A lightweight, production-ready module for user consent compliant Google Tag Manager integration in Next.js applications. Works seamlessly with Vercel's `@next/third-parties` GTM plugin.

## Features

- ✅ GDPR-compliant consent management
- ✅ Google Consent Mode v2 support
- ✅ Geo-aware consent (show banner only in regulated regions)
- ✅ Integrates with Vercel's official GTM plugin
- ✅ Fully customizable UI (colors, text, themes)
- ✅ Light and dark theme support
- ✅ TypeScript support
- ✅ No external dependencies (except React/Next.js and @next/third-parties)
- ✅ ~3KB gzipped

## Installation

```bash
npm install @ourfires/nextjs-gtm @next/third-parties
```

## Quick Start

### 1. Create a consent manager instance

```tsx
// lib/consent.ts
"use client";

import { ConsentManager } from "@ourfires/nextjs-gtm";

export const consentManager = new ConsentManager();
```

> **Note:** The `"use client"` directive is required because `ConsentManager` uses browser APIs (cookies, window). This file can safely live in `lib/` - the directive just ensures it runs on the client.

### 2. Add to your root layout (recommended)

Use the `GTMWithConsent` component for the simplest setup:

```tsx
// app/layout.tsx
import { GTMWithConsent } from "@ourfires/nextjs-gtm";
import { consentManager } from "@/lib/consent";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <GTMWithConsent
          gtmId="GTM-XXXXXX"
          consentManager={consentManager}
          config={{
            privacyPolicyUrl: "/privacy-policy",
            position: "bottom",
            theme: "light",
          }}
        />
      </body>
    </html>
  );
}
```

**Alternative:** If you need more control, use the individual components:

```tsx
// app/layout.tsx
import { ConsentBanner, GDPRGoogleTagManager } from "@ourfires/nextjs-gtm";
import { consentManager } from "@/lib/consent";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <GDPRGoogleTagManager
          gtmId="GTM-XXXXXX"
          consentManager={consentManager}
        />
        <ConsentBanner
          consentManager={consentManager}
          config={{
            privacyPolicyUrl: "/privacy-policy",
            position: "bottom",
            theme: "light",
          }}
        />
      </body>
    </html>
  );
}
```

### 3. Track events (optional)

```tsx
"use client";

import { useConsent } from "@ourfires/nextjs-gtm";
import { consentManager } from "@/lib/consent";

export function MyComponent() {
  const { hasAnalyticsConsent, consent } = useConsent(consentManager);

  const trackEvent = () => {
    if (hasAnalyticsConsent) {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "button_click",
        button_name: "cta",
      });
    }
  };

  return <button onClick={trackEvent}>Click me</button>;
}
```

## Configuration

### ConsentBanner Props

```tsx
interface ConsentConfig {
  cookieName?: string; // Default: 'user_consent'
  cookieExpiry?: number; // Default: 365 days
  privacyPolicyUrl?: string;
  showPreferencesDefault?: boolean;
  position?: "top" | "bottom"; // Default: 'bottom'
  theme?: "light" | "dark"; // Default: 'light'
  translations?: Partial<Translations>;
  colors?: {
    light?: ThemeColors;
    dark?: ThemeColors;
  };
}

interface ThemeColors {
  background?: string; // Banner background color
  text?: string; // Text color
  border?: string; // Border color
  accent?: string; // Primary buttons and links
  secondaryButton?: string; // Secondary button background
  secondaryButtonText?: string; // Secondary button text
  toggleBoxBackground?: string; // Preference toggle boxes
  toggleSwitchBackground?: string; // Toggle switches (unchecked)
}
```

### Custom Colors

Customize the banner appearance for both light and dark themes. All color properties are optional and will fall back to the default theme colors.

```tsx
<ConsentBanner
  consentManager={consentManager}
  config={{
    theme: "dark",
    colors: {
      dark: {
        background: "#1a1a1a",
        accent: "#3b82f6",
        secondaryButton: "#2a2a2a",
      },
      light: {
        background: "#ffffff",
        accent: "#2563eb",
      },
    },
  }}
/>
```

**Default Colors:**

- **Light theme**: White background (`#ffffff`), blue accent (`#2563eb`)
- **Dark theme**: Neutral dark gray background (`#1a1a1a`), blue accent (`#2563eb`)

### Custom Translations

```tsx
<ConsentBanner
  consentManager={consentManager}
  config={{
    translations: {
      title: "Impostazioni Cookie",
      description: "Utilizziamo i cookie per migliorare la tua esperienza...",
      acceptAll: "Accetta Tutti",
      rejectAll: "Rifiuta Tutti",
      necessaryLabel: "Necessari",
      analyticsLabel: "Analitiche",
      marketingLabel: "Marketing",
      preferencesLabel: "Preferenze",
      // ... more translations
    },
  }}
/>
```

### Italian Example

```tsx
const italianConfig = {
  privacyPolicyUrl: "/privacy",
  translations: {
    title: "Impostazioni Cookie",
    description:
      "Utilizziamo i cookie per migliorare la tua esperienza di navigazione e analizzare il nostro traffico.",
    acceptAll: "Accetta Tutti",
    rejectAll: "Rifiuta Tutti",
    customize: "Personalizza",
    savePreferences: "Salva Preferenze",
    necessaryLabel: "Necessari",
    necessaryDescription: "Cookie essenziali per il funzionamento del sito.",
    analyticsLabel: "Analitiche",
    analyticsDescription:
      "Ci aiutano a capire come i visitatori interagiscono con il sito.",
    marketingLabel: "Marketing",
    marketingDescription: "Utilizzati per fornire pubblicità personalizzate.",
    preferencesLabel: "Preferenze",
    preferencesDescription: "Ricordano le tue preferenze e impostazioni.",
  },
};
```

## API Reference

### ConsentManager

```tsx
const manager = new ConsentManager({ cookieName?, cookieExpiry? })

// Methods
manager.getConsent(): ConsentState | null
manager.setConsent(consent: ConsentState): void
manager.hasConsent(): boolean
manager.hasAnalyticsConsent(): boolean
manager.hasMarketingConsent(): boolean
manager.acceptAll(): void
manager.rejectAll(): void
manager.subscribe(callback): () => void
manager.updateGoogleConsentMode(consent): void
```

### useConsent Hook

```tsx
const {
  consent,
  hasConsent,
  hasAnalyticsConsent,
  hasMarketingConsent,
  hasPreferencesConsent,
  acceptAll,
  rejectAll,
  updateConsent,
} = useConsent(consentManager);
```

## Advanced Usage

### Geo-Aware Consent (Only Show Banner in Regulated Regions)

Show the consent banner only to visitors from regions with privacy regulations (GDPR, CCPA, LGPD, PIPEDA, POPIA). For users outside regulated regions, GTM loads immediately without requiring consent. Requires Vercel or CloudFlare deployment.

#### Setup (2 steps):

**1. Create `middleware.ts` in your project root:**

```tsx
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isRegulatedRegion } from "@ourfires/nextjs-gtm";

// Extend NextRequest to include Vercel's geo property
interface NextRequestWithGeo extends NextRequest {
  geo?: {
    country?: string;
    region?: string;
  };
}

export function middleware(request: NextRequestWithGeo) {
  const needsConsent = isRegulatedRegion(
    request.geo?.country,
    request.geo?.region
  );

  const response = NextResponse.next();
  response.cookies.set("geo-needs-consent", needsConsent ? "1" : "0", {
    path: "/", // Cookie available on all pages
    maxAge: 86400, // Cache for 24 hours (avoid geo check on every request)
    sameSite: "lax", // Security: prevent CSRF attacks
  });

  return response;
}
```

**2. Enable `geoAware` prop in your layout:**

**Option A: Using `GTMWithConsent` (recommended):**

```tsx
// app/layout.tsx
<GTMWithConsent
  gtmId="GTM-XXXXXX"
  consentManager={consentManager}
  config={{ privacyPolicyUrl: "/privacy" }}
  geoAware={true}
/>
```

**Option B: Using separate components:**

```tsx
// app/layout.tsx
<GDPRGoogleTagManager
  gtmId="GTM-XXXXXX"
  consentManager={consentManager}
  // waitForConsent will be determined by geo-location automatically
/>
<ConsentBanner
  consentManager={consentManager}
  config={{ privacyPolicyUrl: "/privacy" }}
  geoAware={true}
/>
```

**How it works:**
- **Regulated regions** (EU, California, Brazil, etc.): Banner shows, GTM waits for consent
- **Non-regulated regions**: No banner, GTM loads immediately

**Covered regulations:**

- ✅ **GDPR** - EU/EEA + UK (28 countries)
- ✅ **CCPA/CPRA** - California, USA
- ✅ **LGPD** - Brazil
- ✅ **PIPEDA** - Canada
- ✅ **POPIA** - South Africa

**Platforms:** Vercel, CloudFlare Pages, or any platform providing `request.geo` headers.

### Programmatic Consent Control

```tsx
"use client";

import { consentManager } from "@/lib/consent";

export function SettingsPage() {
  const openConsentSettings = () => {
    // Reset consent to show banner again
    if (typeof document !== "undefined") {
      document.cookie =
        "user_consent=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      window.location.reload();
    }
  };

  return (
    <button onClick={openConsentSettings}>Manage Cookie Preferences</button>
  );
}
```

### Custom Consent Logic

```tsx
consentManager.setConsent({
  necessary: true,
  analytics: true,
  marketing: false,
  preferences: true,
  timestamp: Date.now(),
});
```

### Listen to Consent Changes

```tsx
useEffect(() => {
  const unsubscribe = consentManager.subscribe((consent) => {
    console.log("Consent updated:", consent);
    // Update your analytics, ads, etc.
  });

  return unsubscribe;
}, []);
```

## Google Consent Mode v2

The module automatically handles Google Consent Mode v2, updating these parameters:

- `ad_storage`
- `ad_user_data`
- `ad_personalization`
- `analytics_storage`
- `functionality_storage`
- `personalization_storage`
- `security_storage` (always granted)

## Privacy Law Compliance

This library is designed to be compliant with major international privacy regulations:

### ✅ GDPR (EU General Data Protection Regulation)

- **Opt-in by default**: All toggles start unchecked except necessary cookies
- **Granular consent control**: 4 distinct categories (necessary, analytics, marketing, preferences)
- **Clear reject option**: "Reject All" button prominently available
- **Consent-gated loading**: GTM only loads after analytics consent is granted
- **Google Consent Mode v2**: Implements "denied" defaults before user interaction
- **Consent timestamp**: All consent events are timestamped
- **Reasonable expiry**: 365-day cookie expiry (configurable)

### ✅ CCPA/CPRA (California Consumer Privacy Act)

- **Opt-out mechanism**: "Reject All" provides clear opt-out
- **Clear disclosure**: Cookie usage is disclosed in the banner
- **Granular control**: Users can control specific data categories

### ✅ Other Supported Regulations

- **ePrivacy Directive (Cookie Law)** - EU
- **UK GDPR** - United Kingdom
- **LGPD** - Brazil
- **PIPEDA** - Canada
- **POPIA** - South Africa

The library follows privacy-by-design principles with opt-in consent, granular controls, and proper Google Consent Mode integration to help you comply with global privacy laws.

## License

MIT

/**
 * Usage Examples for @ourfires/nextjs-gtm
 *
 * This file demonstrates common integration patterns for the GDPR-compliant
 * Google Tag Manager package.
 */

import {
  ConsentManager,
  GDPRGoogleTagManager,
  ConsentBanner,
  useConsent,
} from "@ourfires/nextjs-gtm";

// ============================================================================
// Example 1: Basic Setup
// ============================================================================

// lib/consent.ts
// Create a single ConsentManager instance to use throughout your app
export const consentManager = new ConsentManager({
  cookieName: "gdpr_consent", // optional, default
  cookieExpiry: 365, // optional, days, default
});

// ============================================================================
// Example 2: Root Layout Integration
// ============================================================================

// app/layout.tsx
import { consentManager } from "./lib/consent";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}

        {/* GTM Script - loads when analytics consent is granted */}
        <GDPRGoogleTagManager
          gtmId="GTM-XXXXXX"
          consentManager={consentManager}
        />

        {/* Consent Banner - shows on first visit */}
        <ConsentBanner
          consentManager={consentManager}
          config={{
            privacyPolicyUrl: "/privacy",
            theme: "light",
            position: "bottom",
          }}
        />
      </body>
    </html>
  );
}

// ============================================================================
// Example 3: Using the useConsent Hook
// ============================================================================

// app/components/AnalyticsStatus.tsx
function AnalyticsStatus() {
  const {
    consent,
    hasConsent,
    hasAnalyticsConsent,
    hasMarketingConsent,
    acceptAll,
    rejectAll,
  } = useConsent(consentManager);

  if (!hasConsent) {
    return <p>No consent given yet</p>;
  }

  return (
    <div>
      <h3>Current Consent Status</h3>
      <ul>
        <li>Analytics: {hasAnalyticsConsent ? "✓" : "✗"}</li>
        <li>Marketing: {hasMarketingConsent ? "✓" : "✗"}</li>
        <li>
          Last updated:{" "}
          {consent ? new Date(consent.timestamp).toLocaleString() : "N/A"}
        </li>
      </ul>

      <div>
        <button onClick={acceptAll}>Accept All</button>
        <button onClick={rejectAll}>Reject All</button>
      </div>
    </div>
  );
}

// ============================================================================
// Example 4: Custom Consent Configuration
// ============================================================================

// app/layout.tsx (alternative with custom config)
export function CustomLayoutExample({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}

        <GDPRGoogleTagManager
          gtmId="GTM-XXXXXX"
          consentManager={consentManager}
          waitForConsent={true} // default, wait for analytics consent
          dataLayerName="dataLayer" // default
          nonce="your-csp-nonce" // optional CSP nonce
        />

        <ConsentBanner
          consentManager={consentManager}
          config={{
            privacyPolicyUrl: "/privacy-policy",
            showPreferencesDefault: false, // show simple banner first
            position: "top", // or "bottom" (default)
            theme: "dark", // or "light" (default)
            translations: {
              // Override any default text
              title: "We use cookies",
              description: "Custom description here...",
              acceptAll: "Accept",
              rejectAll: "Decline",
            },
          }}
        />
      </body>
    </html>
  );
}

// ============================================================================
// Example 5: Manually Checking Consent Before Loading Third-Party Scripts
// ============================================================================

// app/components/ThirdPartyScript.tsx
function ThirdPartyScript() {
  const { hasMarketingConsent } = useConsent(consentManager);

  // Only load third-party marketing scripts when consent is granted
  if (!hasMarketingConsent) {
    return null;
  }

  return (
    <script
      async
      src="https://example.com/marketing-script.js"
      data-consent="marketing"
    />
  );
}

// ============================================================================
// Example 6: Programmatic Consent Management
// ============================================================================

// app/components/ConsentControls.tsx
function ConsentControls() {
  const handleCustomConsent = () => {
    // Get current consent
    const current = consentManager.getConsent();

    // Set specific consent categories
    consentManager.setConsent({
      necessary: true, // always required
      analytics: true,
      marketing: false,
      preferences: true,
      timestamp: Date.now(),
    });
  };

  const checkConsent = () => {
    console.log("Has consent:", consentManager.hasConsent());
    console.log("Has analytics:", consentManager.hasAnalyticsConsent());
    console.log("Has marketing:", consentManager.hasMarketingConsent());
    console.log("Current state:", consentManager.getConsent());
  };

  return (
    <div>
      <button onClick={handleCustomConsent}>Set Custom Consent</button>
      <button onClick={checkConsent}>Check Current Consent</button>
    </div>
  );
}

// ============================================================================
// Example 7: Listening to Consent Changes
// ============================================================================

// app/components/ConsentListener.tsx
import { useEffect } from "react";

function ConsentListener() {
  useEffect(() => {
    // Subscribe to consent changes
    const unsubscribe = consentManager.subscribe((consent) => {
      console.log("Consent changed:", consent);

      // Track consent change in your analytics
      if (consent.analytics) {
        // Analytics is now enabled, you can track this event
        window.dataLayer?.push({
          event: "consent_granted",
          category: "analytics",
        });
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return null;
}

// ============================================================================
// Example 8: Multi-language Support
// ============================================================================

// app/[locale]/layout.tsx
const translations = {
  en: {
    title: "Cookie Settings",
    description: "We use cookies...",
    acceptAll: "Accept All",
    rejectAll: "Reject All",
  },
  es: {
    title: "Configuración de Cookies",
    description: "Utilizamos cookies...",
    acceptAll: "Aceptar Todo",
    rejectAll: "Rechazar Todo",
  },
  fr: {
    title: "Paramètres des Cookies",
    description: "Nous utilisons des cookies...",
    acceptAll: "Tout Accepter",
    rejectAll: "Tout Rejeter",
  },
};

export function MultiLanguageLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const locale = params.locale || "en";
  const t =
    translations[locale as keyof typeof translations] || translations.en;

  return (
    <html lang={locale}>
      <body>
        {children}

        <GDPRGoogleTagManager
          gtmId="GTM-XXXXXX"
          consentManager={consentManager}
        />

        <ConsentBanner
          consentManager={consentManager}
          config={{
            privacyPolicyUrl: `/${locale}/privacy`,
            translations: t,
          }}
        />
      </body>
    </html>
  );
}

// ============================================================================
// Example 9: Server Components with Client Islands
// ============================================================================

// app/page.tsx (Server Component)
export default function HomePage() {
  return (
    <div>
      <h1>Welcome to our site</h1>
      <p>This is a server component</p>

      {/* Client component island for consent status */}
      <AnalyticsStatus />
    </div>
  );
}

// The ConsentBanner and GDPRGoogleTagManager are already client components
// so they can be used directly in server components like layout.tsx

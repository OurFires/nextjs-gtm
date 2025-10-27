"use client";

import { useEffect, useState } from "react";
import { GoogleTagManager } from "@next/third-parties/google";
import type { GTMConsentParams } from "./types";

/**
 * GDPRGoogleTagManager - GDPR-compliant wrapper for Vercel's GoogleTagManager
 *
 * Only loads GTM script when analytics consent is granted.
 * Initializes Google Consent Mode v2 with denied defaults before GTM loads.
 *
 * @example
 * ```tsx
 * import { GDPRGoogleTagManager } from "@ourfires/nextjs-gtm";
 * import { consentManager } from "@/lib/consent";
 *
 * export default function Layout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         {children}
 *         <GDPRGoogleTagManager gtmId="GTM-XXXXXX" consentManager={consentManager} />
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function GDPRGoogleTagManager({
  gtmId,
  consentManager,
  waitForConsent = true,
  ...gtmProps
}: GTMConsentParams) {
  const [shouldLoad, setShouldLoad] = useState<boolean>(false);
  const [consentModeInitialized, setConsentModeInitialized] = useState<boolean>(false);

  useEffect(() => {
    // Initialize Google Consent Mode with denied defaults on mount
    if (!consentModeInitialized) {
      consentManager.initializeGoogleConsentMode();
      setConsentModeInitialized(true);

      // Track feature usage
      if (typeof performance !== "undefined" && performance.mark) {
        performance.mark("gdpr-gtm-initialized");
      }
    }

    // Check if we should load GTM immediately
    if (!waitForConsent) {
      setShouldLoad(true);
      return;
    }

    // Check current consent state
    const currentConsent = consentManager.getConsent();
    if (currentConsent?.analytics) {
      setShouldLoad(true);
    }

    // Subscribe to consent changes
    const unsubscribe = consentManager.subscribe((consent) => {
      if (consent.analytics) {
        setShouldLoad(true);

        // Track consent granted
        if (typeof performance !== "undefined" && performance.mark) {
          performance.mark("gdpr-gtm-consent-granted");
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [consentManager, waitForConsent, consentModeInitialized]);

  // Only render GTM when consent is granted (or waitForConsent is false)
  if (!shouldLoad) {
    return null;
  }

  return <GoogleTagManager gtmId={gtmId} {...gtmProps} />;
}

"use client";

import { useState, useEffect } from "react";
import { GDPRGoogleTagManager } from "./gdpr-google-tag-manager";
import { ConsentBanner } from "./consent-banner";
import { checkGeoConsent } from "./geo-utils";
import type { ConsentManager, ConsentConfig } from "./types";

/**
 * Props for GTMWithConsent component
 */
export interface GTMWithConsentProps {
  /** Google Tag Manager container ID (e.g., 'GTM-XXXXXX') */
  gtmId: string;
  /** ConsentManager instance */
  consentManager: ConsentManager;
  /** Configuration options for the consent banner */
  config?: ConsentConfig;
  /** Wait for analytics consent before loading GTM (default: true) */
  waitForConsent?: boolean;
  /** Custom GTM script URL */
  gtmScriptUrl?: string;
  /** Custom dataLayer name (default: 'dataLayer') */
  dataLayerName?: string;
  /** GTM environment auth parameter */
  auth?: string;
  /** GTM environment preview parameter */
  preview?: string;
  /** Initial dataLayer values */
  dataLayer?: Record<string, any>;
  /** Nonce for CSP */
  nonce?: string;
  /** Enable geo-aware consent (only show banner and wait for consent in regulated regions) */
  geoAware?: boolean;
}

/**
 * GTMWithConsent - Complete GDPR-compliant GTM solution with consent banner
 *
 * Combines GDPRGoogleTagManager and ConsentBanner into a single component.
 * This is the recommended way to add GTM with consent management to your Next.js app.
 *
 * @example
 * ```tsx
 * // lib/consent.ts
 * import { ConsentManager } from "@ourfires/nextjs-gtm";
 * export const consentManager = new ConsentManager();
 *
 * // app/layout.tsx
 * import { GTMWithConsent } from "@ourfires/nextjs-gtm";
 * import { consentManager } from "@/lib/consent";
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html lang="en">
 *       <body>
 *         {children}
 *         <GTMWithConsent
 *           gtmId="GTM-XXXXXX"
 *           consentManager={consentManager}
 *           config={{
 *             privacyPolicyUrl: "/privacy-policy",
 *             position: "bottom",
 *             theme: "light",
 *           }}
 *         />
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function GTMWithConsent({
  gtmId,
  consentManager,
  config,
  waitForConsent = true,
  gtmScriptUrl,
  dataLayerName,
  auth,
  preview,
  dataLayer,
  nonce,
  geoAware = false,
}: GTMWithConsentProps) {
  const [shouldWaitForConsent, setShouldWaitForConsent] = useState<boolean>(waitForConsent);

  useEffect(() => {
    if (geoAware) {
      // Check if user is in a regulated region
      const needsConsent = checkGeoConsent();

      // Only wait for consent if user is in a regulated region
      setShouldWaitForConsent(needsConsent);
    } else {
      // Use the explicit waitForConsent prop value
      setShouldWaitForConsent(waitForConsent);
    }
  }, [geoAware, waitForConsent]);

  return (
    <>
      <GDPRGoogleTagManager
        gtmId={gtmId}
        consentManager={consentManager}
        waitForConsent={shouldWaitForConsent}
        gtmScriptUrl={gtmScriptUrl}
        dataLayerName={dataLayerName}
        auth={auth}
        preview={preview}
        dataLayer={dataLayer}
        nonce={nonce}
      />
      <ConsentBanner
        consentManager={consentManager}
        config={config}
        geoAware={geoAware}
      />
    </>
  );
}

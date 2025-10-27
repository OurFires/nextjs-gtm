"use client";

import { GDPRGoogleTagManager } from "./gdpr-google-tag-manager";
import { ConsentBanner } from "./consent-banner";
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
}: GTMWithConsentProps) {
  return (
    <>
      <GDPRGoogleTagManager
        gtmId={gtmId}
        consentManager={consentManager}
        waitForConsent={waitForConsent}
        gtmScriptUrl={gtmScriptUrl}
        dataLayerName={dataLayerName}
        auth={auth}
        preview={preview}
        dataLayer={dataLayer}
        nonce={nonce}
      />
      <ConsentBanner consentManager={consentManager} config={config} />
    </>
  );
}

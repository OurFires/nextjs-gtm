"use client";

import { useEffect, useState, useCallback } from "react";
import type { ConsentManager, ConsentState, UseConsentReturn } from "./types";

/**
 * useConsent - React hook for accessing and managing consent state
 *
 * Subscribes to ConsentManager and provides current consent state
 * along with helper methods for managing consent.
 *
 * @param consentManager - ConsentManager instance
 * @returns Object with consent state and action methods
 *
 * @example
 * ```tsx
 * import { useConsent } from "@ourfires/nextjs-gtm";
 * import { consentManager } from "@/lib/consent";
 *
 * function MyComponent() {
 *   const { consent, hasAnalyticsConsent, acceptAll } = useConsent(consentManager);
 *
 *   return (
 *     <div>
 *       <p>Analytics enabled: {hasAnalyticsConsent ? "Yes" : "No"}</p>
 *       <button onClick={acceptAll}>Enable All</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useConsent(consentManager: ConsentManager): UseConsentReturn {
  const [consent, setConsent] = useState<ConsentState | null>(null);

  // Initialize consent state and subscribe to changes
  useEffect(() => {
    // Get initial consent
    const initialConsent = consentManager.getConsent();
    setConsent(initialConsent);

    // Subscribe to consent changes
    const unsubscribe = consentManager.subscribe((newConsent) => {
      setConsent(newConsent);
    });

    return () => {
      unsubscribe();
    };
  }, [consentManager]);

  // Memoized action handlers
  const acceptAll = useCallback(() => {
    consentManager.acceptAll();
  }, [consentManager]);

  const rejectAll = useCallback(() => {
    consentManager.rejectAll();
  }, [consentManager]);

  const updateConsent = useCallback(
    (partialConsent: Partial<ConsentState>) => {
      const currentConsent = consentManager.getConsent();
      const newConsent: ConsentState = {
        necessary: true,
        analytics: partialConsent.analytics ?? currentConsent?.analytics ?? false,
        marketing: partialConsent.marketing ?? currentConsent?.marketing ?? false,
        preferences: partialConsent.preferences ?? currentConsent?.preferences ?? false,
        timestamp: Date.now(),
      };
      consentManager.setConsent(newConsent);
    },
    [consentManager]
  );

  return {
    consent,
    hasConsent: consent !== null,
    hasAnalyticsConsent: consent?.analytics === true,
    hasMarketingConsent: consent?.marketing === true,
    hasPreferencesConsent: consent?.preferences === true,
    acceptAll,
    rejectAll,
    updateConsent,
  };
}

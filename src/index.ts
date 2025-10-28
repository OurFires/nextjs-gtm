"use client";
/**
 * @ourfires/nextjs-gtm
 *
 * GDPR-compliant Google Tag Manager integration for Next.js 16+
 * with consent management and Google Consent Mode v2 support.
 */

// Core components
export { ConsentManager } from "./consent-manager";
export { GDPRGoogleTagManager } from "./gdpr-google-tag-manager";
export { ConsentBanner } from "./consent-banner";
export { GTMWithConsent } from "./gtm-with-consent";

// Hooks
export { useConsent } from "./use-consent";

// Utilities
export {
  checkGeoConsent,
  isRegulatedRegion,
  REGULATED_COUNTRIES,
  REGULATED_REGIONS,
  ALL_REGULATED_COUNTRIES,
} from "./geo-utils";

// Types
export type {
  ConsentState,
  ConsentConfig,
  Translations,
  GTMConsentParams,
  ConsentBannerProps,
  ConsentEventHandler,
  UseConsentReturn,
  ConsentManager as ConsentManagerType,
} from "./types";
export type { GTMWithConsentProps } from "./gtm-with-consent";

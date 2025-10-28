/**
 * Consent state for different cookie categories
 */
export interface ConsentState {
  /** Necessary cookies (always true, cannot be disabled) */
  necessary: boolean;
  /** Analytics and performance cookies */
  analytics: boolean;
  /** Marketing and advertising cookies */
  marketing: boolean;
  /** Preference and functionality cookies */
  preferences: boolean;
  /** Timestamp when consent was given */
  timestamp: number;
}

/**
 * Color customization for light and dark themes
 */
export interface ThemeColors {
  /** Background color for the banner */
  background?: string;
  /** Text color */
  text?: string;
  /** Border color */
  border?: string;
  /** Accent color for primary buttons and links */
  accent?: string;
  /** Secondary button background color */
  secondaryButton?: string;
  /** Secondary button text color */
  secondaryButtonText?: string;
  /** Preference toggle box background */
  toggleBoxBackground?: string;
  /** Toggle switch background (unchecked/disabled) */
  toggleSwitchBackground?: string;
}

/**
 * Configuration options for ConsentBanner and ConsentManager
 */
export interface ConsentConfig {
  /** Cookie name for storing consent (default: 'gdpr_consent') */
  cookieName?: string;
  /** Cookie expiry in days (default: 365) */
  cookieExpiry?: number;
  /** URL to privacy policy page */
  privacyPolicyUrl?: string;
  /** Show preferences view by default instead of simple banner (default: false) */
  showPreferencesDefault?: boolean;
  /** Banner position on screen (default: 'bottom') */
  position?: "top" | "bottom";
  /** UI theme (default: 'light') */
  theme?: "light" | "dark";
  /** Custom translations for UI text */
  translations?: Partial<Translations>;
  /** Custom colors for light and dark themes */
  colors?: {
    light?: ThemeColors;
    dark?: ThemeColors;
  };
}

/**
 * Translations for all UI text in ConsentBanner
 */
export interface Translations {
  // Simple banner view
  title: string;
  description: string;
  acceptAll: string;
  rejectAll: string;
  customize: string;
  privacyPolicy: string;

  // Preferences view
  preferencesTitle: string;
  savePreferences: string;
  back: string;

  // Category labels and descriptions
  necessaryLabel: string;
  necessaryDescription: string;
  analyticsLabel: string;
  analyticsDescription: string;
  marketingLabel: string;
  marketingDescription: string;
  preferencesLabel: string;
  preferencesDescription: string;
}

/**
 * Props for GDPRGoogleTagManager component
 */
export interface GTMConsentParams {
  /** Google Tag Manager container ID (e.g., 'GTM-XXXXXX') */
  gtmId: string;
  /** ConsentManager instance */
  consentManager: ConsentManager;
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
 * Props for ConsentBanner component
 */
export interface ConsentBannerProps {
  /** ConsentManager instance */
  consentManager: ConsentManager;
  /** Configuration options */
  config?: ConsentConfig;
  /** Enable geo-aware consent (only show banner in regulated regions) */
  geoAware?: boolean;
}

/**
 * Callback function type for consent change events
 */
export type ConsentEventHandler = (consent: ConsentState) => void;

/**
 * Return type for useConsent hook
 */
export interface UseConsentReturn {
  /** Current consent state (null if no consent given yet) */
  consent: ConsentState | null;
  /** Whether any consent has been given */
  hasConsent: boolean;
  /** Whether analytics consent is granted */
  hasAnalyticsConsent: boolean;
  /** Whether marketing consent is granted */
  hasMarketingConsent: boolean;
  /** Whether preferences consent is granted */
  hasPreferencesConsent: boolean;
  /** Accept all cookie categories */
  acceptAll: () => void;
  /** Reject all cookie categories except necessary */
  rejectAll: () => void;
  /** Update consent with specific values */
  updateConsent: (consent: Partial<ConsentState>) => void;
}

/**
 * ConsentManager class - forward declaration for type imports
 */
export interface ConsentManager {
  getConsent(): ConsentState | null;
  setConsent(consent: ConsentState): void;
  hasConsent(): boolean;
  hasAnalyticsConsent(): boolean;
  hasMarketingConsent(): boolean;
  hasPreferencesConsent(): boolean;
  acceptAll(): void;
  rejectAll(): void;
  subscribe(callback: ConsentEventHandler): () => void;
  updateGoogleConsentMode(consent: ConsentState): void;
  initializeGoogleConsentMode(): void;
}

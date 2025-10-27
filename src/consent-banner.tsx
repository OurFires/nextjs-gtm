"use client";

import { useEffect, useState } from "react";
import type { ConsentBannerProps, ConsentState, Translations } from "./types";

/**
 * Default English translations for the consent banner
 */
const defaultTranslations: Translations = {
  // Simple banner view
  title: "Cookie Settings",
  description:
    'We use cookies to enhance your browsing experience and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.',
  acceptAll: "Accept All",
  rejectAll: "Reject All",
  customize: "Customize",
  privacyPolicy: "Privacy Policy",

  // Preferences view
  preferencesTitle: "Cookie Preferences",
  savePreferences: "Save Preferences",
  back: "Back",

  // Category labels and descriptions
  necessaryLabel: "Necessary",
  necessaryDescription:
    "Essential cookies required for the website to function. These cannot be disabled.",
  analyticsLabel: "Analytics",
  analyticsDescription:
    "Help us understand how visitors interact with our website by collecting and reporting information anonymously.",
  marketingLabel: "Marketing",
  marketingDescription:
    "Used to track visitors across websites to display relevant advertisements.",
  preferencesLabel: "Preferences",
  preferencesDescription:
    "Enable the website to remember choices you make and provide enhanced features.",
};

/**
 * ConsentBanner - GDPR-compliant cookie consent banner with preferences panel
 *
 * Shows a banner when no consent exists. Provides simple accept/reject/customize
 * actions, or detailed preferences with toggles for each category.
 *
 * @example
 * ```tsx
 * import { ConsentBanner } from "@ourfires/nextjs-gtm";
 * import { consentManager } from "@/lib/consent";
 *
 * export default function Layout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         {children}
 *         <ConsentBanner
 *           consentManager={consentManager}
 *           config={{
 *             privacyPolicyUrl: "/privacy",
 *             theme: "dark",
 *             position: "bottom"
 *           }}
 *         />
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function ConsentBanner({
  consentManager,
  config = {},
}: ConsentBannerProps) {
  const [visible, setVisible] = useState<boolean>(false);
  const [showPreferences, setShowPreferences] = useState<boolean>(
    config.showPreferencesDefault || false
  );
  const [preferences, setPreferences] = useState<ConsentState>({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
    timestamp: Date.now(),
  });

  const position = config.position || "bottom";
  const theme = config.theme || "light";
  const translations = { ...defaultTranslations, ...config.translations };

  // Default colors
  const defaultColors = {
    light: {
      background: '#ffffff',
      text: '#1a1a1a',
      border: '#e5e7eb',
      accent: '#2563eb',
      secondaryButton: '#f3f4f6',
      secondaryButtonText: '#374151',
      toggleBoxBackground: '#f9fafb',
      toggleSwitchBackground: '#d1d5db',
    },
    dark: {
      background: '#1a1a1a',
      text: '#f3f4f6',
      border: '#404040',
      accent: '#2563eb',
      secondaryButton: '#2a2a2a',
      secondaryButtonText: '#d1d5db',
      toggleBoxBackground: '#262626',
      toggleSwitchBackground: '#525252',
    },
  };

  // Merge custom colors with defaults
  const colors = theme === 'dark'
    ? { ...defaultColors.dark, ...config.colors?.dark }
    : { ...defaultColors.light, ...config.colors?.light };

  // Check if consent exists on mount
  useEffect(() => {
    const hasConsent = consentManager.hasConsent();
    setVisible(!hasConsent);

    // If consent exists, load current preferences
    if (hasConsent) {
      const currentConsent = consentManager.getConsent();
      if (currentConsent) {
        setPreferences(currentConsent);
      }
    }
  }, [consentManager]);

  // Handle accept all
  const handleAcceptAll = () => {
    consentManager.acceptAll();
    setVisible(false);
  };

  // Handle reject all
  const handleRejectAll = () => {
    consentManager.rejectAll();
    setVisible(false);
  };

  // Handle save preferences
  const handleSavePreferences = () => {
    consentManager.setConsent(preferences);
    setVisible(false);
  };

  // Handle preference toggle
  const handleToggle = (category: keyof ConsentState) => {
    if (category === "necessary" || category === "timestamp") return;

    setPreferences((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // Don't render if not visible
  if (!visible) {
    return null;
  }

  // Button styles
  const buttonPrimaryStyle: React.CSSProperties = {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: 500,
    borderRadius: '6px',
    transition: 'all 0.2s',
    backgroundColor: colors.accent,
    color: '#ffffff',
    border: 'none',
    cursor: 'pointer',
  };

  const buttonSecondaryStyle: React.CSSProperties = {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: 500,
    borderRadius: '6px',
    transition: 'all 0.2s',
    backgroundColor: colors.secondaryButton,
    color: colors.secondaryButtonText,
    border: 'none',
    cursor: 'pointer',
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      style={{
        position: 'fixed',
        zIndex: 9999,
        [position === "top" ? "top" : "bottom"]: '16px',
        left: '16px',
        width: '360px',
        maxHeight: '90vh',
        overflowY: 'auto',
        backgroundColor: colors.background,
        color: colors.text,
        border: `1px solid ${colors.border}`,
        borderRadius: '8px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }}
    >
      <div style={{ padding: '16px' }}>
        {!showPreferences ? (
          // Simple banner view
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
                {translations.title}
              </h2>
              <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '4px' }}>{translations.description}</p>
              {config.privacyPolicyUrl && (
                <a
                  href={config.privacyPolicyUrl}
                  style={{
                    fontSize: '14px',
                    color: colors.accent,
                    textDecoration: 'underline',
                    display: 'inline-block',
                  }}
                >
                  {translations.privacyPolicy}
                </a>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <button
                onClick={handleRejectAll}
                style={buttonSecondaryStyle}
                aria-label="Reject all cookies"
              >
                {translations.rejectAll}
              </button>
              <button
                onClick={() => setShowPreferences(true)}
                style={buttonSecondaryStyle}
                aria-label="Customize cookie preferences"
              >
                {translations.customize}
              </button>
              <button
                onClick={handleAcceptAll}
                style={buttonPrimaryStyle}
                aria-label="Accept all cookies"
              >
                {translations.acceptAll}
              </button>
            </div>
          </div>
        ) : (
          // Preferences view
          <div>
            <div style={{ marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600 }}>
                {translations.preferencesTitle}
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
              {/* Necessary cookies */}
              <PreferenceToggle
                label={translations.necessaryLabel}
                description={translations.necessaryDescription}
                checked={true}
                disabled={true}
                onChange={() => {}}
                theme={theme}
                colors={colors}
              />

              {/* Analytics cookies */}
              <PreferenceToggle
                label={translations.analyticsLabel}
                description={translations.analyticsDescription}
                checked={preferences.analytics}
                disabled={false}
                onChange={() => handleToggle("analytics")}
                theme={theme}
                colors={colors}
              />

              {/* Marketing cookies */}
              <PreferenceToggle
                label={translations.marketingLabel}
                description={translations.marketingDescription}
                checked={preferences.marketing}
                disabled={false}
                onChange={() => handleToggle("marketing")}
                theme={theme}
                colors={colors}
              />

              {/* Preferences cookies */}
              <PreferenceToggle
                label={translations.preferencesLabel}
                description={translations.preferencesDescription}
                checked={preferences.preferences}
                disabled={false}
                onChange={() => handleToggle("preferences")}
                theme={theme}
                colors={colors}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                onClick={() => setShowPreferences(false)}
                style={buttonSecondaryStyle}
                aria-label="Go back to simple view"
              >
                {translations.back}
              </button>
              <button
                onClick={handleSavePreferences}
                style={buttonPrimaryStyle}
                aria-label="Save cookie preferences"
              >
                {translations.savePreferences}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * PreferenceToggle - Individual preference toggle with label and description
 */
interface PreferenceToggleProps {
  label: string;
  description: string;
  checked: boolean;
  disabled: boolean;
  onChange: () => void;
  theme: "light" | "dark";
  colors: {
    accent: string;
    toggleBoxBackground: string;
    toggleSwitchBackground: string;
  };
}

function PreferenceToggle({
  label,
  description,
  checked,
  disabled,
  onChange,
  theme,
  colors,
}: PreferenceToggleProps) {
  const toggleId = `toggle-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        padding: '8px 12px',
        borderRadius: '6px',
        backgroundColor: colors.toggleBoxBackground,
      }}
    >
      <div style={{ flex: 1, paddingRight: '12px' }}>
        <label
          htmlFor={toggleId}
          style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '1px' }}
        >
          {label}
        </label>
        <p style={{ fontSize: '11px', opacity: 0.75, lineHeight: '1.3', margin: 0 }}>{description}</p>
      </div>
      <div style={{ flexShrink: 0 }}>
        <label
          style={{
            position: 'relative',
            display: 'inline-flex',
            alignItems: 'center',
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
        >
          <input
            id={toggleId}
            type="checkbox"
            style={{
              position: 'absolute',
              width: '1px',
              height: '1px',
              padding: 0,
              margin: '-1px',
              overflow: 'hidden',
              clip: 'rect(0, 0, 0, 0)',
              whiteSpace: 'nowrap',
              borderWidth: 0,
            }}
            checked={checked}
            disabled={disabled}
            onChange={onChange}
            aria-label={`Toggle ${label} cookies`}
          />
          <div
            style={{
              width: '44px',
              height: '24px',
              borderRadius: '9999px',
              transition: 'background-color 0.2s',
              backgroundColor: disabled
                ? colors.toggleSwitchBackground
                : checked
                ? colors.accent
                : colors.toggleSwitchBackground,
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '2px',
                left: '2px',
                backgroundColor: '#ffffff',
                borderRadius: '9999px',
                height: '20px',
                width: '20px',
                transition: 'transform 0.2s',
                transform: checked ? 'translateX(20px)' : 'translateX(0)',
              }}
            />
          </div>
        </label>
      </div>
    </div>
  );
}

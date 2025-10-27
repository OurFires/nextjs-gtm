import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    "gdpr-google-tag-manager": "src/gdpr-google-tag-manager.tsx",
    "consent-banner": "src/consent-banner.tsx",
    "use-consent": "src/use-consent.ts",
    "consent-manager": "src/consent-manager.ts",
    types: "src/types.ts",
  },
  format: ["esm"],
  dts: true,
  // clean: true,
  external: [
    "react",
    "react-dom",
    "next",
    "@next/third-parties",
    "@next/third-parties/google",
  ],
  sourcemap: true,
  // treeshake: true,
});

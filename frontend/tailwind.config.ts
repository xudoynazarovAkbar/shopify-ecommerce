import type { Config } from 'tailwindcss';

export default <Partial<Config>>{
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        appBg: 'rgba(var(--bg-app), <alpha-value>)',
        cardBg: 'rgba(var(--bg-card), <alpha-value>)',
        textPrimary: 'rgba(var(--text-primary), <alpha-value>)',
        textSecondary: 'rgba(var(--text-secondary), <alpha-value>)',
        textMuted: 'rgba(var(--text-muted), <alpha-value>)',
        appBorder: 'rgba(var(--border-color), <alpha-value>)',
        brand: 'rgba(var(--brand), <alpha-value>)',
        brandHover: 'rgba(var(--brand-hover), <alpha-value>)',
        brandText: 'rgba(var(--brand-text), <alpha-value>)',
      },
    },
  },
};
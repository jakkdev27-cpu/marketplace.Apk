/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: 'var(--brand)',
        'brand-dark': 'var(--brand-dark)',
        'brand-soft': 'var(--brand-soft)',
        'brand-secondary': 'var(--brand-secondary)',
        bg: 'var(--bg)',
        'bg-elevated': 'var(--bg-elevated)',
        panel: 'var(--panel)',
        'panel-strong': 'var(--panel-strong)',
        'panel-soft': 'var(--panel-soft)',
        line: 'var(--line)',
        'line-strong': 'var(--line-strong)',
        text: 'var(--text)',
        'text-soft': 'var(--text-soft)',
        'text-muted': 'var(--text-muted)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger: 'var(--danger)',
      },
      borderRadius: {
        none: '0px',
        sm: 'var(--radius)',
        DEFAULT: 'var(--radius)',
        lg: 'calc(var(--radius) * 1.2)',
        full: '9999px',
      },
      boxShadow: {
        soft: 'var(--shadow-soft)',
        card: 'var(--shadow-card)',
      },
      // Increase spacing scale by 1.2
      spacing: ({ theme }) => {
        const base = theme('spacing');
        const scaled = {};
        Object.keys(base).forEach(key => {
          if (typeof base[key] === 'number') {
            scaled[key] = `${base[key] * 1.2}px`;
          } else {
            scaled[key] = base[key];
          }
        });
        return scaled;
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        light: {
          ...require('daisyui/src/theming/themes')['[data-theme=light]'],
          ...{
            // Override DaisyUI light theme with our colors
            'primary': 'var(--brand)',
            'primary-focus': 'var(--brand-dark)',
            'primary-content': '#ffffff',
            'secondary': 'var(--brand-secondary)',
            'secondary-focus': '#4b5563',
            'secondary-content': '#ffffff',
            'accent': '#10b981',
            'accent-focus': '#059669',
            'accent-content': '#ffffff',
            'neutral': '#111827',
            'neutral-focus': '#1f2937',
            'neutral-content': '#ffffff',
            'base-100': '#ffffff',
            'base-200': '#f9fafb',
            'base-300': '#f3f4f6',
            'base-content': '#111827',
            '--rounded-box': 'var(--radius)',
            '--rounded-btn': 'var(--radius)',
            '--rounded-badge': 'var(--radius)',
            '--animation-btn': '0.2s',
            '--animation-input': '0.2s',
            '--btn-text-case': 'uppercase',
            '--btn-focus-scale': '0.95',
            '--border-btn': '1px',
            '--tab-border': '1px',
            '--tab-radius': 'var(--radius)',
          }
        },
        dark: {
          ...require('daisyui/src/theming/themes')['[data-theme=dark]'],
          ...{
            'primary': 'var(--brand)',
            'primary-focus': 'var(--brand-dark)',
            'primary-content': '#ffffff',
            'secondary': 'var(--brand-secondary)',
            'secondary-focus': '#6b7280',
            'secondary-content': '#ffffff',
            'accent': '#34d399',
            'accent-focus': '#059669',
            'accent-content': '#ffffff',
            'neutral': '#f9fafb',
            'neutral-focus': '#e2e8f0',
            'neutral-content': '#111827',
            'base-100': '#0f172a',
            'base-200': '#111827',
            'base-300': '#1f2937',
            'base-content': '#f9fafb',
            '--rounded-box': 'var(--radius)',
            '--rounded-btn': 'var(--radius)',
            '--rounded-badge': 'var(--radius)',
            '--animation-btn': '0.2s',
            '--animation-input': '0.2s',
            '--btn-text-case': 'uppercase',
            '--btn-focus-scale': '0.95',
            '--border-btn': '1px',
            '--tab-border': '1px',
            '--tab-radius': 'var(--radius)',
          }
        },
      },
    ],
  },
};
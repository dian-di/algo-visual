// Core variant/color scheme used across visualization primitives
export type Variant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger'

// Color palette for each variant
export const variantColors: Record<Variant, { text: string; border: string; bg: string }> = {
  primary: { text: '#0D6E74', border: '#2C7D84', bg: '#D9EAEC' },
  secondary: { text: '#B35D35', border: '#B35D35', bg: '#F0DFD2' },
  success: { text: '#2E7D32', border: '#4CAF50', bg: '#E8F5E9' },
  warning: { text: '#C77700', border: '#FFB74D', bg: '#FFF3E0' },
  danger: { text: '#C62828', border: '#EF5350', bg: '#FFEBEE' },
}

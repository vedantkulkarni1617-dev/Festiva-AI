import { CurrencyCode, CurrencyConfig } from '../types';

export const SUPPORTED_CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', rateAgainstUSD: 1.0 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', rateAgainstUSD: 0.92 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', rateAgainstUSD: 0.79 },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', rateAgainstUSD: 84.5 },
  CAD: { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', rateAgainstUSD: 1.39 },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rateAgainstUSD: 1.54 },
};

export function formatCurrency(
  amount: number | null | undefined,
  currency: CurrencyCode = 'USD',
  compact: boolean = false
): string {
  if (amount == null || isNaN(amount)) {
    amount = 0;
  }

  const config = SUPPORTED_CURRENCIES[currency] || SUPPORTED_CURRENCIES.USD;

  if (compact && Math.abs(amount) >= 1000) {
    if (currency === 'INR') {
      if (Math.abs(amount) >= 10000000) {
        return `${config.symbol}${(amount / 10000000).toFixed(1)} Cr`;
      }
      if (Math.abs(amount) >= 100000) {
        return `${config.symbol}${(amount / 100000).toFixed(1)} L`;
      }
    }
    if (Math.abs(amount) >= 1000000) {
      return `${config.symbol}${(amount / 1000000).toFixed(1)}M`;
    }
    return `${config.symbol}${(amount / 1000).toFixed(1)}k`;
  }

  const formatted = new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(amount);

  return `${config.symbol}${formatted}`;
}

export function convertCurrency(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode
): number {
  if (from === to) return amount;
  const fromRate = SUPPORTED_CURRENCIES[from]?.rateAgainstUSD || 1.0;
  const toRate = SUPPORTED_CURRENCIES[to]?.rateAgainstUSD || 1.0;
  // Convert to USD first, then to target
  const inUSD = amount / fromRate;
  return Math.round(inUSD * toRate);
}

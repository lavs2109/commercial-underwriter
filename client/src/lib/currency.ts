// Exchange rate - in production this would come from an API like exchangerate-api.com
const USD_TO_INR_RATE = 84.50; // Approximate current rate

export interface CurrencyValue {
  usd: number;
  inr: number;
}

export function convertCurrency(amount: number): CurrencyValue {
  return {
    usd: amount,
    inr: amount * USD_TO_INR_RATE
  };
}

export function formatCurrency(amount: number, currency: 'USD' | 'INR' = 'USD'): string {
  if (currency === 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  } else {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  }
}

export function formatCurrencyCompact(amount: number, currency: 'USD' | 'INR' = 'USD'): string {
  const absAmount = Math.abs(amount);
  let value = absAmount;
  let suffix = '';

  if (currency === 'INR') {
    // Use Indian numbering system (Lakh, Crore)
    if (absAmount >= 10000000) { // 1 Crore
      value = absAmount / 10000000;
      suffix = 'Cr';
    } else if (absAmount >= 100000) { // 1 Lakh
      value = absAmount / 100000;
      suffix = 'L';
    } else if (absAmount >= 1000) {
      value = absAmount / 1000;
      suffix = 'K';
    }
    
    const formatted = `₹${value.toFixed(value < 10 ? 1 : 0)}${suffix}`;
    return amount < 0 ? `-${formatted}` : formatted;
  } else {
    // Use US numbering system
    if (absAmount >= 1000000) {
      value = absAmount / 1000000;
      suffix = 'M';
    } else if (absAmount >= 1000) {
      value = absAmount / 1000;
      suffix = 'K';
    }
    
    const formatted = `$${value.toFixed(value < 10 ? 1 : 0)}${suffix}`;
    return amount < 0 ? `-${formatted}` : formatted;
  }
}
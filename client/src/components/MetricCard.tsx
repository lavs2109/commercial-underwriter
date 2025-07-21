import { useState } from 'react';
import { convertCurrency, formatCurrencyCompact } from '@/lib/currency';

interface MetricCardProps {
  title: string;
  value: string | number;
  target?: string;
  difference?: string;
  status?: 'pass' | 'fail' | 'neutral';
  isCurrency?: boolean;
}

export default function MetricCard({ title, value, target, difference, status = 'neutral', isCurrency = false }: MetricCardProps) {
  const [showINR, setShowINR] = useState(false);
  const getStatusColor = () => {
    switch (status) {
      case 'pass': return 'bg-secondary';
      case 'fail': return 'bg-destructive';
      default: return 'bg-neutral-400';
    }
  };

  const getDifferenceColor = () => {
    switch (status) {
      case 'pass': return 'bg-secondary/10 text-secondary';
      case 'fail': return 'bg-destructive/10 text-destructive';
      default: return 'bg-neutral-100 text-neutral-600';
    }
  };

  const getDisplayValue = () => {
    if (!isCurrency || typeof value !== 'number') {
      return value;
    }
    
    const converted = convertCurrency(value);
    return showINR 
      ? formatCurrencyCompact(converted.inr, 'INR')
      : formatCurrencyCompact(converted.usd, 'USD');
  };

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium text-neutral-600">{title}</h4>
        <div className="flex items-center space-x-2">
          {isCurrency && (
            <button
              onClick={() => setShowINR(!showINR)}
              className="text-xs bg-neutral-100 hover:bg-neutral-200 px-2 py-1 rounded transition-colors"
            >
              {showINR ? 'USD' : 'INR'}
            </button>
          )}
          <div className={`w-2 h-2 ${getStatusColor()} rounded-full`}></div>
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-2xl font-bold text-neutral-900">{getDisplayValue()}</p>
        {target && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-neutral-600">Target: {target}</span>
            {difference && (
              <span className={`text-xs px-2 py-1 rounded ${getDifferenceColor()}`}>
                {difference}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

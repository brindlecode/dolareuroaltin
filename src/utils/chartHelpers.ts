import type { HistoricalDataPoint } from './rateHelpers';

export interface ChartConfig {
  currency: string;
  period: string;
  data: HistoricalDataPoint[];
  width?: number;
  height?: number;
}

export function getChartColor(currency: string): string {
  return {
    USD: '#2563EB',
    EUR: '#7C3AED',
    GBP: '#0891B2',
    GOLD: '#D4A017',
  }[currency] || '#6B7280';
}

export function getChartLabel(currency: string): string {
  return {
    USD: 'USD/TRY',
    EUR: 'EUR/TRY',
    GBP: 'GBP/TRY',
    GOLD: 'Gram Altın (TRY)',
  }[currency] || currency;
}

export function formatChartTooltip(
  dateStr: string,
  value: number,
  currency: string
): string {
  const months = ['Oca','Şub','Mar','Nis','May','Haz',
                  'Tem','Ağu','Eyl','Eki','Kas','Ara'];
  const d = new Date(dateStr);
  const dateFormatted = `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  const valueFormatted = new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
  return `${dateFormatted}\n${valueFormatted} TL`;
}

export function aggregateDataForPeriod(
  data: HistoricalDataPoint[],
  period: string
): HistoricalDataPoint[] {
  const filtered = filterByPeriod(data, period);

  if (period === '7d' || period === '30d') {
    return filtered;
  }

  if (period === '3m' || period === '6m') {
    return filterEveryNth(filtered, 3);
  }

  if (period === '1y') {
    return filterEveryNth(filtered, 7);
  }

  return filterEveryNth(filtered, 15);
}

function filterByPeriod(
  data: HistoricalDataPoint[],
  period: string
): HistoricalDataPoint[] {
  const now = new Date('2026-04-02');
  let cutoff: Date;

  switch (period) {
    case '7d':
      cutoff = new Date(now);
      cutoff.setDate(cutoff.getDate() - 7);
      break;
    case '30d':
      cutoff = new Date(now);
      cutoff.setDate(cutoff.getDate() - 30);
      break;
    case '3m':
      cutoff = new Date(now);
      cutoff.setMonth(cutoff.getMonth() - 3);
      break;
    case '6m':
      cutoff = new Date(now);
      cutoff.setMonth(cutoff.getMonth() - 6);
      break;
    case '1y':
      cutoff = new Date(now);
      cutoff.setFullYear(cutoff.getFullYear() - 1);
      break;
    case '5y':
    default:
      cutoff = new Date('2021-01-01');
      break;
  }

  return data.filter(d => new Date(d.date) >= cutoff);
}

function filterEveryNth(
  data: HistoricalDataPoint[],
  n: number
): HistoricalDataPoint[] {
  return data.filter((_, i) => i % n === 0 || i === data.length - 1);
}

export function getPeriodLabel(period: string): string {
  return {
    '7d': '7 Gün',
    '30d': '1 Ay',
    '3m': '3 Ay',
    '6m': '6 Ay',
    '1y': '1 Yıl',
    '5y': '5 Yıl',
  }[period] || period;
}

export function getHighLowFromData(
  data: HistoricalDataPoint[]
): { high: number; low: number } {
  if (data.length === 0) return { high: 0, low: 0 };
  return {
    high: Math.max(...data.map(d => d.high)),
    low: Math.min(...data.map(d => d.low)),
  };
}

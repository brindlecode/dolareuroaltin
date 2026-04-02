export interface RateData {
  code: string;
  name_tr: string;
  symbol: string;
  flag: string;
  buying: number;
  selling: number;
  mid: number;
  change_daily: number;
  change_pct: number;
  direction: 'up' | 'down' | 'neutral';
  open: number;
  high: number;
  low: number;
  prev_close: number;
  week_high?: number;
  week_low?: number;
  month_high?: number;
  month_low?: number;
  year_high?: number;
  year_low?: number;
}

export interface GoldData {
  name_tr: string;
  buying: number;
  selling: number;
  mid: number;
  change_daily: number;
  change_pct: number;
  direction: 'up' | 'down' | 'neutral';
  open: number;
  high: number;
  low: number;
  prev_close: number;
  unit?: string;
}

export interface HistoricalDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface InflationData {
  year: number;
  month: number;
  month_tr: string;
  tüfe_annual: number;
  tüfe_monthly: number;
  ppi_annual: number;
}

export function formatTRY(value: number, decimals = 2): string {
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatRate(value: number): string {
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }).format(value);
}

export function formatCompact(value: number): string {
  if (value >= 1000000) {
    return new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }
  return formatTRY(value);
}

export function getChangeClass(direction: 'up' | 'down' | 'neutral'): string {
  return {
    up: 'text-emerald-600 bg-emerald-50',
    down: 'text-red-600 bg-red-50',
    neutral: 'text-gray-500 bg-gray-50',
  }[direction];
}

export function getChangeIcon(direction: 'up' | 'down' | 'neutral'): string {
  return { up: '▲', down: '▼', neutral: '—' }[direction];
}

export function getChangeText(direction: 'up' | 'down' | 'neutral'): string {
  return { up: 'artış', down: 'düşüş', neutral: 'değişim yok' }[direction];
}

export function formatDateTR(dateStr: string): string {
  const months = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran',
                  'Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
  const d = new Date(dateStr);
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDateShort(dateStr: string): string {
  const months = ['Oca','Şub','Mar','Nis','May','Haz',
                  'Tem','Ağu','Eyl','Eki','Kas','Ara'];
  const d = new Date(dateStr);
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

export function formatDateFull(dateStr: string): string {
  const days = ['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'];
  const months = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran',
                  'Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
  const d = new Date(dateStr);
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${days[d.getDay()]}`;
}

export function adjustForInflation(
  amount: number,
  fromYear: number,
  fromMonth: number,
  inflationData: InflationData[]
): number {
  const filtered = inflationData.filter(
    d => d.year > fromYear || (d.year === fromYear && d.month >= fromMonth)
  );
  const cumulative = filtered.reduce((acc, d) => acc * (1 + d.tüfe_monthly / 100), 1);
  return amount * cumulative;
}

export function generateSparkline(
  values: number[],
  width = 96,
  height = 32
): string {
  if (values.length < 2) return '';
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = width / (values.length - 1);

  const points = values
    .map((v, i) => `${Math.round(i * step)},${Math.round(height - ((v - min) / range) * height)}`)
    .join(' ');

  const direction = values[values.length - 1] >= values[0] ? '#059669' : '#DC2626';

  return `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" style="overflow:visible">
    <polyline points="${points}" stroke="${direction}" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  </svg>`;
}

export function getCurrencyColor(code: string): string {
  return {
    USD: '#2563EB',
    EUR: '#7C3AED',
    GBP: '#0891B2',
    CHF: '#059669',
    SAR: '#D97706',
  }[code] || '#6B7280';
}

export function getCurrencyTailwindColor(code: string): string {
  return {
    USD: 'usd',
    EUR: 'eur',
    GBP: 'gbp',
    CHF: 'emerald',
    SAR: 'amber',
  }[code] || 'gray';
}

export function getPeriodData(data: HistoricalDataPoint[], period: string): HistoricalDataPoint[] {
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

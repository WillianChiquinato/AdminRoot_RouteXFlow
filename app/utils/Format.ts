import { usePreferencesStore } from "~/infra/store/preferencesStore";
import type { DistanceUnit, FuelUnit, IUserPreferences } from "~/infra/interfaces/services/user";

// Subconjunto das preferências usado para formatar datas (permite pré-visualizar sem salvar)
export type DateTimePreferences = Pick<IUserPreferences, 'dateFormat' | 'timeFormat' | 'timeZone'>;

export const KM_PER_MILE = 1.609344;
export const LITERS_PER_GALLON = 3.785411784;

//Remove tudo que não for número (Ideal para enviar para a API)
export const cleanNumber = (value: string | undefined): string => {
  if (!value) return '';
  return value.replace(/\D/g, '');
};

//Formata CPF: 000.000.000-00
export const formatCPF = (cpf: string): string => {
  let value = cleanNumber(cpf);
  if (value.length > 11) value = value.slice(0, 11);
  
  return value
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

//Formata Telefone Celular/Fixo: (00) 00000-0000 ou (00) 0000-0000
export const formatPhone = (phone: string): string => {
  let value = cleanNumber(phone);
  if (value.length > 11) value = value.slice(0, 11);

  if (value.length === 11) {
    return value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (value.length === 10) {
    return value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return value;
};

// Extrai dia/mês/ano/hora/minuto de uma data em um fuso específico.
const zonedParts = (date: Date, timeZone: string) => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: Number(get('hour')),
    minute: get('minute'),
  };
};

const composeDate = (p: { year: string; month: string; day: string }, dateFormat: IUserPreferences['dateFormat']) => {
  switch (dateFormat) {
    case 'MM/dd/yyyy':
      return `${p.month}/${p.day}/${p.year}`;
    case 'yyyy-MM-dd':
      return `${p.year}-${p.month}-${p.day}`;
    default:
      return `${p.day}/${p.month}/${p.year}`;
  }
};

const composeTime = (hour: number, minute: string, timeFormat: IUserPreferences['timeFormat']) => {
  if (timeFormat === '12h') {
    return `${hour % 12 || 12}:${minute} ${hour < 12 ? 'AM' : 'PM'}`;
  }
  return `${String(hour).padStart(2, '0')}:${minute}`;
};

//Formata Data conforme a preferência do usuário (datas sem hora, fixas em UTC)
export const formatDate = (dateString: string | Date): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';
  return composeDate(zonedParts(date, 'UTC'), usePreferencesStore().dateFormat);
};

//Formata Data e hora no fuso e formato escolhidos pelo usuário
export const formatDateTime = (
  value: string | Date | null | undefined,
  prefs: DateTimePreferences = usePreferencesStore(),
): string => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  const p = zonedParts(date, prefs.timeZone);
  return `${composeDate(p, prefs.dateFormat)} ${composeTime(p.hour, p.minute, prefs.timeFormat)}`;
};

//Formata Moeda
export const formatCurrency = (value: number): string => {
  if (isNaN(value)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// Quantos km valem 1 unidade de distância (1 para km, 1,609 para mi)
export const distanceFactor = (unit: DistanceUnit): number =>
  unit === 'mi' ? KM_PER_MILE : 1;

// Quantos litros valem 1 unidade de combustível (1 para L, 3,785 para gal)
export const fuelFactor = (unit: FuelUnit): number =>
  unit === 'gal' ? LITERS_PER_GALLON : 1;

export const fuelUnitLabel = (unit: FuelUnit): string => (unit === 'gal' ? 'gal' : 'L');

const formatNumber = (value: number, digits: number): string =>
  new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);

//Formata uma distância (recebida em km) na unidade escolhida pelo usuário
export const formatDistance = (km: number, digits = 1): string => {
  const unit = usePreferencesStore().distanceUnit;
  return `${formatNumber(km / distanceFactor(unit), digits)} ${unit}`;
};

//Formata um valor por km (ex.: ganho por km) na unidade de distância do usuário
export const formatValuePerDistance = (valuePerKm: number): string => {
  const unit = usePreferencesStore().distanceUnit;
  return `${formatCurrency(valuePerKm * distanceFactor(unit))}/${unit}`;
};

export const getActiveHours = () => {
  const currentHour = new Date().getHours();
  if (currentHour >= 5 && currentHour < 12) {
    return "Bom dia";
  } else if (currentHour >= 12 && currentHour < 18) {
    return "Boa tarde";
  } else {
    return "Boa noite";
  }
};

export const getDateNow = ref(
  new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }),
);

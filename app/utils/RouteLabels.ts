import type {
  RouteStopStatus,
  RouteStopType,
} from "~/infra/interfaces/services/route";

export const stopTypeLabel = (type: RouteStopType): string => {
  const labels: Record<RouteStopType, string> = {
    Pickup: "Coleta",
    Delivery: "Entrega",
    Package: "Pacote",
  };
  return labels[type] ?? type;
};

export const stopStatusLabel = (status: RouteStopStatus): string => {
  const labels: Record<RouteStopStatus, string> = {
    Pendente: "Pendente",
    EmAndamento: "Em andamento",
    Concluído: "Concluída",
    Cancelado: "Cancelada",
  };
  return labels[status] ?? status;
};

export const stopStatusClass = (status: RouteStopStatus): string =>
  status === "Concluído" ? "done" : "in-progress";

export const formatTime = (value: string | null): string => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

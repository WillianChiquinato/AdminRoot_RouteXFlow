import type { FetchOptions } from "ofetch";
import ClientService from "~/infra/ClientService";
import type { ApiResponse } from "~/infra/responses/APIResponse";

export type RouteType = "Delivery" | "Marketplace";

export type RouteStopType = "Pickup" | "Delivery" | "Package";

export type RouteStopStatus = "Pendente" | "EmAndamento" | "Concluído" | "Cancelado";

export type RouteStatus = "InProgress" | "Finished";

export type GpsPositionType = "StartPosition" | "RoutePosition" | "FinishedPosition";

export interface IRouteFilter {
  startDate?: string;
  endDate?: string;
  type?: RouteType;
  workSessionId?: number;
}

// Linha de gps_position (GpsPositionHistory).
export interface IRoutePoint {
  id: number;
  latitude: number;
  longitude: number;
  typePosition: GpsPositionType;
  recordedAt: string;
}

// Item da listagem (RoutePosition + agregados calculados no back).
export interface IRouteSummary {
  id: number;
  workSessionId: number;
  type: RouteType;
  status: RouteStatus;
  startTime: string;
  endTime: string | null;
  originAddress: string | null;
  destinationAddress: string | null;
  totalDistanceKm: number;
  totalMinutes: number;
  stopsCount: number;
  stopsCompletedCount: number;
}

// RoutePositionStops. Campos de Delivery e Marketplace ficam opcionais/nullable
export interface IRouteStop {
  id: number;
  sequence: number;
  type: RouteStopType;
  status: RouteStopStatus;
  name: string;
  address: string;
  addressNumber: string;
  latitude: string | null;
  longitude: string | null;
  estimatedArrivalAt: string | null;
  arrivedAt: string | null;
  completedAt: string | null;
  appName: string | null;
  notes: string | null;

  deliveryOfferId: number | null;
  value: number | null;

  trackingCode: string | null;
  recipientName: string | null;
  supplierConfirmed: boolean | null;
}

export interface IRouteDetail extends IRouteSummary {
  origin: IRoutePoint;
  destination: IRoutePoint | null;
  // Trajeto percorrido, ordenado por recordedAt (gravação em lote, doc seção 10).
  path: IRoutePoint[];
  stops: IRouteStop[];
  // Marketplace: rota foi otimizada / quantas vezes reotimizada.
  optimized: boolean | null;
  reoptimizationCount: number | null;
  plannedDistanceKm: number | null;
  plannedMinutes: number | null;
}

export default class RouteService extends ClientService<any> {
  constructor() {
    super("Route", "api/Route");
  }

  RouteList = async (filter: IRouteFilter, config: FetchOptions = {}): Promise<ApiResponse<IRouteSummary[]>> => {
    return await this.fetchInstance(`${this.address}/getRoutes`, {
      method: "GET",
      params: filter,
      ...config,
    });
  };

  GetRouteDetail = async (id: number, config: FetchOptions = {}): Promise<ApiResponse<IRouteDetail>> => {
    return await this.fetchInstance(`${this.address}/getRoute/${id}`, {
      method: "GET",
      ...config,
    });
  };
}

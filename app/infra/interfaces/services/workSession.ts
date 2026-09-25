import type { FetchOptions } from "ofetch";
import ClientService from "~/infra/ClientService";
import type { ApiResponse } from "~/infra/responses/APIResponse";

export type WorkSessionStatus = "open" | "closed";

export interface IWorkSessionRequest {
  latitude: number;
  longitude: number;
}

export interface IWorkSessionFilter {
  startDate?: string;
  endDate?: string;
}

export interface IWorkSession {
  id: number;
  startTime: string;
  endTime: string | null;
  containerId: number | null;
  containerName: string;
  deliveryOffersCount?: number;
}

export type DeliveryOfferStopType = "Pickup" | "Delivery";

export interface IDeliveryOfferStop {
  id: number;
  name: string;
  address: string;
  sequence: number;
  type: DeliveryOfferStopType;
  latitude: string;
  longitude: string;
}

export interface IDeliveryOfferRouteEvaluation {
  recommended: boolean;
  additionalDistanceKm: number;
  additionalTimeMinutes: number;
  routeDeviationKm: number;
  valuePerKm: number;
  evaluationScore: number;
  comments: string;
}

export interface IDeliveryOffer {
  id: number;
  name: string;
  description: string;
  value: number;
  bonusValue: number;
  totalDistanceKm: number;
  estimatedMinutes: number;
  status: string;
  detectedAt: string;
  stops: IDeliveryOfferStop[];
  routeEvaluation: IDeliveryOfferRouteEvaluation | null;
}

export interface IWorkSessionDetail extends IWorkSession {
  deliveryOffers: IDeliveryOffer[];
}

export default class WorkSessionService extends ClientService<any> {
  constructor() {
    super("WorkSession", "api/WorkSession");
  }

  StartWorkSession = async (data: IWorkSessionRequest, config: FetchOptions = {}): Promise<ApiResponse<IWorkSession>> => {
    return await this.fetchInstance(`${this.address}/start`, {
      method: "POST",
      body: data,
      ...config,
    });
  };

  FinishWorkSession = async (id: number, data: IWorkSessionRequest, config: FetchOptions = {}): Promise<ApiResponse<IWorkSession>> => {
    return await this.fetchInstance(`${this.address}/finish/${id}`, {
      method: "POST",
      body: data,
      ...config,
    });
  };

  WorkSessionList = async (filter: IWorkSessionFilter, config: FetchOptions = {}): Promise<ApiResponse<IWorkSession[]>> => {
    return await this.fetchInstance(`${this.address}/getSessions`, {
      method: "GET",
      params: filter,
      ...config,
    });
  };

  GetWorkSessionDetail = async (id: number, config: FetchOptions = {}): Promise<ApiResponse<IWorkSessionDetail>> => {
    return await this.fetchInstance(`${this.address}/getSession/${id}`, {
      method: "GET",
      ...config,
    });
  };
}

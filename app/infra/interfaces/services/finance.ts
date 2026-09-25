import type { FetchOptions } from "ofetch";
import ClientService from "~/infra/ClientService";
import type { ApiResponse } from "~/infra/responses/APIResponse";

export type FinanceEntryType = "earning" | "expense";
export type FinanceEntrySource = "manual" | "resgate";

export type FinanceCategory =
  | "resgate_delivery"
  | "resgate_entregas_marketplace"
  | "salario_clt"
  | "freela"
  | "outro_ganho"
  | "combustivel"
  | "manutencao"
  | "alimentacao"
  | "aluguel"
  | "imposto"
  | "outro_gasto";

export interface IFinanceEntry {
  id: number;
  type: FinanceEntryType;
  source: FinanceEntrySource;
  category: FinanceCategory;
  description: string;
  amount: number;
  date: string;
  createdAt: string;
}

export interface IFinanceEntryRegister {
  type: FinanceEntryType;
  category: FinanceCategory;
  description: string;
  amount: number;
  date: string;
}

export interface IFinanceEntryUpdate extends IFinanceEntryRegister {
  id: number;
}

export interface IFinanceFilter {
  startDate?: string;
  endDate?: string;
  search?: string;
  type?: FinanceEntryType;
}

export interface IFinanceSummary {
  totalEarnings: number;
  totalExpenses: number;
  balance: number;
  totalResgates: number;
  totalManual: number;
}

export interface IFinanceMonthPeriod {
  month: number;
  year: number;
}

export interface IFinanceMonthClosure {
  id: number;
  month: number;
  year: number;
  closedAt: string;
  totalEarnings: number;
  totalExpenses: number;
  balance: number;
}

export interface IFinanceAiReport {
  summary: string;
  recommendations: string[];
}

export default class FinanceService extends ClientService<any> {
  constructor() {
    super("Finance", "api/Finance");
  }

  FinanceList = async (filter: IFinanceFilter, config: FetchOptions = {}): Promise<ApiResponse<IFinanceEntry[]>> => {
    return await this.fetchInstance(`${this.address}/getEntries`, {
      method: "GET",
      params: filter,
      ...config,
    });
  };

  FinanceSummary = async (filter: IFinanceFilter, config: FetchOptions = {}): Promise<ApiResponse<IFinanceSummary>> => {
    return await this.fetchInstance(`${this.address}/getSummary`, {
      method: "GET",
      params: filter,
      ...config,
    });
  };

  RegisterEntry = async (data: IFinanceEntryRegister, config: FetchOptions = {}): Promise<ApiResponse<IFinanceEntry>> => {
    return await this.fetchInstance(`${this.address}/registerEntry`, {
      method: "POST",
      body: data,
      ...config,
    });
  };

  UpdateEntry = async (data: IFinanceEntryUpdate, config: FetchOptions = {}): Promise<ApiResponse<IFinanceEntry>> => {
    return await this.fetchInstance(`${this.address}/updateEntry`, {
      method: "PUT",
      body: data,
      ...config,
    });
  };

  DeleteEntry = async (id: number, config: FetchOptions = {}): Promise<ApiResponse<boolean>> => {
    return await this.fetchInstance(`${this.address}/deleteEntry/${id}`, {
      method: "DELETE",
      ...config,
    });
  };

  GetMonthClosure = async (period: IFinanceMonthPeriod, config: FetchOptions = {}): Promise<ApiResponse<IFinanceMonthClosure | null>> => {
    return await this.fetchInstance(`${this.address}/getMonthClosure`, {
      method: "GET",
      params: period,
      ...config,
    });
  };

  CloseMonth = async (period: IFinanceMonthPeriod, config: FetchOptions = {}): Promise<ApiResponse<IFinanceMonthClosure>> => {
    return await this.fetchInstance(`${this.address}/closeMonth`, {
      method: "POST",
      body: period,
      ...config,
    });
  };

  GenerateAiReport = async (period: IFinanceMonthPeriod, config: FetchOptions = {}): Promise<ApiResponse<IFinanceAiReport>> => {
    return await this.fetchInstance(`${this.address}/generateAiReport`, {
      method: "POST",
      body: period,
      ...config,
    });
  };
}

import type { FetchOptions } from "ofetch";
import ClientService from "~/infra/ClientService";
import type { ApiResponse } from "~/infra/responses/APIResponse";

export interface IAuditLogFilter {
  userId?: number;
  httpMethod?: string;
  path?: string;
  statusCode?: number;
  onlyErrors?: boolean;
  onlyWithChanges?: boolean;
  traceId?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

export interface IAuditLogListItem {
  id: number;
  createdAt: string;
  traceId: string;
  userId: number | null;
  userEmail: string | null;
  httpMethod: string;
  path: string;
  statusCode: number;
  durationMs: number;
  hasChanges: boolean;
  exceptionType: string | null;
}

export interface IAuditChange {
  entity: string;
  action: string;
  key?: unknown;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
}

export interface IAuditLogDetail extends IAuditLogListItem {
  ipAddress: string | null;
  userAgent: string | null;
  queryString: string | null;
  endpoint: string | null;
  requestBody: string | null;
  responseBody: string | null;
  changes: IAuditChange[] | null;
  exceptionMessage: string | null;
  exceptionStackTrace: string | null;
}

export default class AuditService extends ClientService<any> {
  constructor() {
    super("Audit", "api/Audit");
  }

  GetLogs = async (filter: IAuditLogFilter = {}, config: FetchOptions = {}): Promise<ApiResponse<IAuditLogListItem[]>> => {
    return await this.fetchInstance(`${this.address}/getLogs`, {
      method: "GET",
      query: filter,
      ...config,
    });
  };

  GetLog = async (id: number, config: FetchOptions = {}): Promise<ApiResponse<IAuditLogDetail>> => {
    return await this.fetchInstance(`${this.address}/getLog/${id}`, {
      method: "GET",
      ...config,
    });
  };
}

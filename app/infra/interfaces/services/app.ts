import type { FetchOptions } from "ofetch";
import ClientService from "~/infra/ClientService";
import type { ApiResponse } from "~/infra/responses/APIResponse";

export interface IApp {
  id: number;
  name: string;
}

export default class AppService extends ClientService<any> {
  constructor() {
    super("App", "api/App");
  }

  AppList = async (config: FetchOptions = {}): Promise<ApiResponse<IApp[]>> => {
    return await this.fetchInstance(`${this.address}/getApps`, {
      method: "GET",
      ...config,
    });
  };
}

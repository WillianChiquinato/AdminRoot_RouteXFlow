import type { FetchOptions } from "ofetch";
import ClientService from "~/infra/ClientService";
import type { ApiResponse } from "~/infra/responses/APIResponse";

export interface ISubAccount {
  id: number;
  username: string;
  createdAt: string;
}

export interface ISubAccountCreate {
  username: string;
  password: string;
}

export default class SubAccountService extends ClientService<any> {
  constructor() {
    super("SubAccount", "api/SubAccount");
  }

  List = async (config: FetchOptions = {}): Promise<ApiResponse<ISubAccount[]>> => {
    return await this.fetchInstance(`${this.address}/list`, {
      method: "GET",
      ...config,
    });
  };

  Create = async (data: ISubAccountCreate, config: FetchOptions = {}): Promise<ApiResponse<ISubAccount>> => {
    return await this.fetchInstance(`${this.address}/create`, {
      method: "POST",
      body: data,
      ...config,
    });
  };

  Delete = async (id: number, config: FetchOptions = {}): Promise<ApiResponse<boolean>> => {
    return await this.fetchInstance(`${this.address}/delete/${id}`, {
      method: "DELETE",
      ...config,
    });
  };
}

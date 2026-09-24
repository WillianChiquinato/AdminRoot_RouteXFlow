import type { FetchOptions } from "ofetch";
import ClientService from "~/infra/ClientService";
import type { ApiResponse } from "~/infra/responses/APIResponse";

export interface IRole {
  id: number;
  name: string;
}

export default class RoleService extends ClientService<any> {
  constructor() {
    super("Role", "api/Role");
  }

  RoleList = async (config: FetchOptions = {}): Promise<ApiResponse<IRole[]>> => {
    return await this.fetchInstance(`${this.address}/getRoles`, {
      method: "GET",
      ...config,
    });
  };
}

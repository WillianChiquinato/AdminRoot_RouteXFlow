import type { FetchOptions } from "ofetch";
import ClientService from "~/infra/ClientService";
import type { ApiResponse } from "~/infra/responses/APIResponse";

export interface IUserRegister
{
    name: string;
    email: string;
    cpf: string;
    phoneNumber: string;
    password: string;
    roleId: number;
    appActives: number[];
}

export default class UserService extends ClientService<any> {
  constructor() {
    super("User", "api/User");
  }

  Register = async (data: IUserRegister, config: FetchOptions = {}): Promise<ApiResponse<boolean>> => {
    return await this.fetchInstance(`${this.address}/register`, {
      method: "POST",
      body: data,
      ...config,
    });
  };
}
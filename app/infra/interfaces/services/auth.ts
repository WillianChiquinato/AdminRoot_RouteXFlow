import type { FetchOptions } from "ofetch";
import ClientService from "~/infra/ClientService";
import type { ApiResponse } from "~/infra/responses/APIResponse";

export interface ILogin {
  email: string;
  password: string;
}

export interface IAuth {
  id: number;
  userName: string;
  name: string;
  email: string;
  phoneDDD: string;
  primaryPhone: string;
  enterprises: {
    id: number;
    name: string;
  }[];
}

export interface IAuthMe {
  id: number,
  name: string;
  email: string;
  role: string[];
  user: IAuth
}

export default class AuthService extends ClientService<any> {
  constructor() {
    super("Auth", "api/Auth");
  }

  Login = async (
    data: ILogin,
    config: FetchOptions = {}
  ): Promise<ApiResponse<IAuth>> => {
    return await this.fetchInstance(`${this.address}/login`, {
      method: "POST",
      body: data,
      ...config,
    });
  };

  Me = async (config: FetchOptions = {}): Promise<ApiResponse<IAuthMe>> => {
    return await this.fetchInstance(`${this.address}/me`, {
      method: "GET",
      ...config,
    });
  }

  Refresh = async (config: FetchOptions = {}): Promise<ApiResponse<IAuth>> => {
    return await this.fetchInstance(`${this.address}/refresh`, {
      method: "POST",
      ...config,
    });
  }

  Logout = async (config: FetchOptions = {}): Promise<ApiResponse<null>> => {
    return await this.fetchInstance(`${this.address}/logout`, {
      method: "POST",
      ...config,
    });
  };
}
import type { FetchOptions } from "ofetch";
import ClientService from "~/infra/ClientService";
import type { ApiResponse } from "~/infra/responses/APIResponse";
import type { IUserPreferences, IUserProfile } from "~/infra/interfaces/services/user";

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
  user: IUserProfile,
  preferences: IUserPreferences,
}

export interface IForgotPassword {
  email: string;
}

export interface IVerifyEmail {
  email: string;
  code: string;
}

export interface IResendVerification {
  email: string;
}

export interface IResetPassword {
  token: string;
  newPassword: string;
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

  ForgotPassword = async (
    data: IForgotPassword,
    config: FetchOptions = {}
  ): Promise<ApiResponse<boolean>> => {
    return await this.fetchInstance(`${this.address}/forgot-password`, {
      method: "POST",
      body: data,
      ...config,
    });
  };

  ValidateResetToken = async (
    token: string,
    config: FetchOptions = {}
  ): Promise<ApiResponse<boolean>> => {
    return await this.fetchInstance(`${this.address}/validate-reset-token`, {
      method: "GET",
      query: { token },
      ...config,
    });
  };

  ResetPassword = async (
    data: IResetPassword,
    config: FetchOptions = {}
  ): Promise<ApiResponse<boolean>> => {
    return await this.fetchInstance(`${this.address}/reset-password`, {
      method: "POST",
      body: data,
      ...config,
    });
  };

  VerifyEmail = async (
    data: IVerifyEmail,
    config: FetchOptions = {}
  ): Promise<ApiResponse<string>> => {
    return await this.fetchInstance(`${this.address}/verify-email`, {
      method: "POST",
      body: data,
      ...config,
    });
  };

  ResendVerification = async (
    data: IResendVerification,
    config: FetchOptions = {}
  ): Promise<ApiResponse<boolean>> => {
    return await this.fetchInstance(`${this.address}/resend-verification`, {
      method: "POST",
      body: data,
      ...config,
    });
  };
}

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

export type DateFormatPreference = "dd/MM/yyyy" | "MM/dd/yyyy" | "yyyy-MM-dd";
export type TimeFormatPreference = "24h" | "12h";
export type DistanceUnit = "km" | "mi";
export type FuelUnit = "l" | "gal";

export interface IUserPreferences {
    vehicleName: string;
    // Sempre em km/L e R$/L; a conversão para a unidade escolhida é feita só na exibição.
    vehicleKmPerLiter: number | null;
    fuelPricePerLiter: number | null;
    dateFormat: DateFormatPreference;
    timeFormat: TimeFormatPreference;
    timeZone: string;
    distanceUnit: DistanceUnit;
    fuelUnit: FuelUnit;
}

export interface IUserProfile {
    id: number;
    name: string;
    email: string;
    cpf: string;
    phoneNumber: string;
}

export interface IUpdateProfile {
    name: string;
    phoneNumber: string;
}

export interface IChangePassword {
    currentPassword: string;
    newPassword: string;
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

  UpdateProfile = async (data: IUpdateProfile, config: FetchOptions = {}): Promise<ApiResponse<IUserProfile>> => {
    return await this.fetchInstance(`${this.address}/profile`, {
      method: "PUT",
      body: data,
      ...config,
    });
  };

  UpdatePreferences = async (data: IUserPreferences, config: FetchOptions = {}): Promise<ApiResponse<IUserPreferences>> => {
    return await this.fetchInstance(`${this.address}/preferences`, {
      method: "PUT",
      body: data,
      ...config,
    });
  };

  ChangePassword = async (data: IChangePassword, config: FetchOptions = {}): Promise<ApiResponse<boolean>> => {
    return await this.fetchInstance(`${this.address}/password`, {
      method: "PUT",
      body: data,
      ...config,
    });
  };
}

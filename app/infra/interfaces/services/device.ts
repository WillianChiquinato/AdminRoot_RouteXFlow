import type { FetchOptions } from "ofetch";
import ClientService from "~/infra/ClientService";
import type { ApiResponse } from "~/infra/responses/APIResponse";

export type DeviceRole = "owner" | "navigation";

export type DeviceType = 1 | 2;

export interface IDevice {
  id: number;
  name: string;
  deviceIdentifier: DeviceRole;
  containerId: number;
  connected: boolean;
  lastSeenAt?: string;
}

export interface IDeviceRegister {
  containerIdVinculated: number;
  name: string;
  role: DeviceRole;
  type: DeviceType;
}

export interface IDeviceUpdate {
  id: number;
  name: string;
  role: DeviceRole;
  type: DeviceType;
}

export default class DeviceService extends ClientService<any> {
  constructor() {
    super("Device", "api/Device");
  }

  DeviceList = async (config: FetchOptions = {}): Promise<ApiResponse<IDevice[]>> => {
    return await this.fetchInstance(`${this.address}/getDevices`, {
      method: "GET",
      ...config,
    });
  };

  RegisterDevice = async (data: IDeviceRegister, config: FetchOptions = {}): Promise<ApiResponse<IDevice>> => {
    return await this.fetchInstance(`${this.address}/registerDevice`, {
      method: "POST",
      body: data,
      ...config,
    });
  };

  UpdateDevice = async (data: IDeviceUpdate, config: FetchOptions = {}): Promise<ApiResponse<IDevice>> => {
    return await this.fetchInstance(`${this.address}/updateDevice`, {
      method: "PUT",
      body: data,
      ...config,
    });
  };

  DeleteDevice = async (id: number, config: FetchOptions = {}): Promise<ApiResponse<boolean>> => {
    return await this.fetchInstance(`${this.address}/deleteDevice/${id}`, {
      method: "DELETE",
      ...config,
    });
  };
}

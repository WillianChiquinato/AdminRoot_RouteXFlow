import type { FetchOptions } from "ofetch";
import ClientService from "~/infra/ClientService";
import type { ApiResponse } from "~/infra/responses/APIResponse";
import type { IDevice, DeviceRole, DeviceType } from "~/infra/interfaces/services/device";

export interface IContainer {
  id: number;
  name: string;
  isActive: boolean;
  devices: IDevice[];
}

export interface IContainerDeviceRegister {
  name: string;
  role: DeviceRole;
  type: DeviceType;
}

export interface IContainerRegister {
  name: string;
  devices: IContainerDeviceRegister[];
}

export interface IContainerUpdate {
  id: number;
  name: string;
  isActive: boolean;
}

export default class ContainerService extends ClientService<any> {
  constructor() {
    super("Container", "api/Container");
  }

  ContainerList = async (config: FetchOptions = {}): Promise<ApiResponse<IContainer[]>> => {
    return await this.fetchInstance(`${this.address}/getContainers`, {
      method: "GET",
      ...config,
    });
  };

  RegisterContainer = async (data: IContainerRegister, config: FetchOptions = {}): Promise<ApiResponse<IContainer>> => {
    return await this.fetchInstance(`${this.address}/registerContainer`, {
      method: "POST",
      body: data,
      ...config,
    });
  };

  UpdateContainer = async (data: IContainerUpdate, config: FetchOptions = {}): Promise<ApiResponse<IContainer>> => {
    return await this.fetchInstance(`${this.address}/updateContainer`, {
      method: "PUT",
      body: data,
      ...config,
    });
  };
}

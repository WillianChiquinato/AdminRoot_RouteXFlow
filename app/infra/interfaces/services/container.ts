import type { FetchOptions } from "ofetch";
import ClientService from "~/infra/ClientService";
import type { ApiResponse } from "~/infra/responses/APIResponse";
import type { IDevice, DeviceRole, DeviceType } from "~/infra/interfaces/services/device";

export type ContainerType = "delivery" | "marketplace";

export type ContainerIntegration =
  | "ifood"
  | "rappi"
  | "99food"
  | "mercadolivre"
  | "shopee";

export interface IIntegrationOption {
  value: ContainerIntegration;
  label: string;
  // Só o Mercado Livre tem integração OAuth pronta por enquanto.
  available: boolean;
}

export const containerTypeOptions: {
  value: ContainerType;
  label: string;
  description: string;
}[] = [
  {
    value: "delivery",
    label: "Delivery",
    description: "iFood, Rappi e apps de entrega",
  },
  {
    value: "marketplace",
    label: "Marketplace",
    description: "Mercado Livre, Shopee e similares",
  },
];

export const integrationsByType: Record<ContainerType, IIntegrationOption[]> = {
  delivery: [
    { value: "ifood", label: "iFood", available: false },
    { value: "rappi", label: "Rappi", available: false },
    { value: "99food", label: "99Food", available: false },
  ],
  marketplace: [
    { value: "mercadolivre", label: "Mercado Livre", available: true },
    { value: "shopee", label: "Shopee", available: false },
  ],
};

export function integrationLabel(integration?: ContainerIntegration) {
  for (const options of Object.values(integrationsByType)) {
    const found = options.find((option) => option.value === integration);
    if (found) return found.label;
  }
  return "";
}

export function integrationsLabel(integrations?: ContainerIntegration[]) {
  return (integrations ?? []).map(integrationLabel).filter(Boolean).join(", ");
}

export interface IContainer {
  id: number;
  name: string;
  isActive: boolean;
  type?: ContainerType;
  integrations?: ContainerIntegration[];
  devices: IDevice[];
}

export interface IContainerDeviceRegister {
  name: string;
  role: DeviceRole;
  type: DeviceType;
}

export interface IContainerRegister {
  name: string;
  type: ContainerType;
  integrations: ContainerIntegration[];
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

  ContainerListWithNoSession = async (config: FetchOptions = {}): Promise<ApiResponse<IContainer[]>> => {
    return await this.fetchInstance(`${this.address}/getContainersWithNoSession`, {
      method: "GET",
      ...config,
    });
  }

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

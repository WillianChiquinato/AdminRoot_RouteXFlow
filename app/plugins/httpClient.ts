import { defineNuxtPlugin } from "nuxt/app";
import type { IClientHttp } from "~/infra/interfaces/config";
import AuthService from "~/infra/interfaces/services/auth";
import UserService from "~/infra/interfaces/services/user";
import RoleService from "~/infra/interfaces/services/role";
import AppService from "~/infra/interfaces/services/app";
import ContainerService from "~/infra/interfaces/services/container";
import DeviceService from "~/infra/interfaces/services/device";

export default defineNuxtPlugin(()=>{

  const httpClientServices: IClientHttp = {
		auth: new AuthService(),
		user: new UserService(),
		role: new RoleService(),
		app: new AppService(),
		container: new ContainerService(),
		device: new DeviceService(),
	};

  return {
		provide: {
			httpClient: httpClientServices,
		},
	};
})

import { defineNuxtPlugin } from "nuxt/app";
import type { IClientHttp } from "~/infra/interfaces/config";
import AuthService from "~/infra/interfaces/services/auth";

export default defineNuxtPlugin(()=>{

  const httpClientServices: IClientHttp = {
		auth: new AuthService()
	};

  return {
		provide: {
			httpClient: httpClientServices,
		},
	};
})
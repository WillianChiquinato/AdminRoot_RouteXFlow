import type { FetchOptions } from "ofetch";
import ClientService from "~/infra/ClientService";
import type { ApiResponse } from "~/infra/responses/APIResponse";

export interface IMercadoLivreUser {
  id?: number | string;
  nickname?: string;
  email?: string;
  expiresAt?: string;
  [key: string]: unknown;
}

export type MercadoLivreAuthorizeResult = string | { url: string };

export default class MercadoLivreService extends ClientService<any> {
  constructor() {
    super("MercadoLivre", "api/MercadoLivre");
  }

  // Link para o usuário autorizar a conta no navegador.
  Authorize = async (config: FetchOptions = {}): Promise<ApiResponse<MercadoLivreAuthorizeResult>> => {
    return await this.fetchInstance(`${this.address}/oauth/authorize`, {
      method: "GET",
      ...config,
    });
  };

  // Troca o code devolvido pelo Mercado Livre por tokens (chamado pela tela de retorno do front).
  Callback = async (code: string, state: string, config: FetchOptions = {}): Promise<ApiResponse<IMercadoLivreUser | boolean | null>> => {
    return await this.fetchInstance(`${this.address}/oauth/callback`, {
      method: "GET",
      query: { code, state },
      ...config,
    });
  };

  // Usuário já validado em profiles (o back confere o ExpiresAt antes de responder).
  Me = async (config: FetchOptions = {}): Promise<ApiResponse<IMercadoLivreUser | null>> => {
    return await this.fetchInstance(`${this.address}/oauth/users/me`, {
      method: "GET",
      ...config,
    });
  };
}

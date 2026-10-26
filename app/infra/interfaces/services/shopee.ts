import type { FetchOptions } from "ofetch";
import ClientService from "~/infra/ClientService";
import type { ApiResponse } from "~/infra/responses/APIResponse";

export type ShopeeAuthorizeResult = string | { url: string };

export default class ShopeeService extends ClientService<any> {
  constructor() {
    super("Shopee", "api/shoppe");
  }

  // Link para o usuário autorizar a loja no navegador.
  Authorize = async (config: FetchOptions = {}): Promise<ApiResponse<ShopeeAuthorizeResult>> => {
    return await this.fetchInstance(`${this.address}/oauth/sign`, {
      method: "GET",
      ...config,
    });
  };

  // Troca o code devolvido pela Shopee por tokens (chamado pela tela de retorno do front).
  Callback = async (
    code: string,
    shopId: string,
    partnerId: string,
    state: string,
    config: FetchOptions = {},
  ): Promise<ApiResponse<string>> => {
    return await this.fetchInstance(`${this.address}/oauth/callback`, {
      method: "GET",
      query: { code, shop_id: shopId, partner_id: partnerId, state },
      ...config,
    });
  };
}

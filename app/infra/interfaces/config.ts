import type AuthService from "./services/auth";

export interface IClientHttp {
    auth: AuthService;
}

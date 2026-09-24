import type AuthService from "./services/auth";
import type UserService from "./services/user";
import type RoleService from "./services/role";
import type AppService from "./services/app";

export interface IClientHttp {
    auth: AuthService;
    user: UserService;
    role: RoleService;
    app: AppService;
}

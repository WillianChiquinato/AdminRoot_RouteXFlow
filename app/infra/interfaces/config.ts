import type AuthService from "./services/auth";
import type UserService from "./services/user";
import type RoleService from "./services/role";
import type AppService from "./services/app";
import type ContainerService from "./services/container";
import type DeviceService from "./services/device";

export interface IClientHttp {
    auth: AuthService;
    user: UserService;
    role: RoleService;
    app: AppService;
    container: ContainerService;
    device: DeviceService;
}

import {CanActivate, ExecutionContext, Injectable} from "@nestjs/common";
import {Observable} from "rxjs";
import {Reflector} from "@nestjs/core";
import {Role} from "./enums/role.enum";
import {ROLES_KEY} from "./roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {

    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles)
            return true
        const user = context.switchToHttp().getRequest().user

        return (user && user.role && requiredRoles.includes(user.role.toLowerCase()))
    }

}

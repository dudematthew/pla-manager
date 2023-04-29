import { CanActivate, Injectable } from "@nestjs/common";

@Injectable()
export class AdminGuard implements CanActivate {

    async canActivate(context): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        return request?.user.isAdmin;
    }
}
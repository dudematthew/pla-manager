import { Injectable } from "@nestjs/common";
import { UserService } from "src/user/user.service";
import { PassportSerializer } from "@nestjs/passport";


@Injectable()
export class UserSerializer extends PassportSerializer {
    constructor(private readonly userService: UserService) {
        super();
    }

    serializeUser(user: any, done: (err: Error, users: any) => void): any {
        done(null, user.id);
    }

    async deserializeUser(
        id: number,
        done: (err: Error, payload: string | object) => void,
    ): Promise<any> {
        const user = await this.userService.findById(id);
        done(null, user);
    }
}
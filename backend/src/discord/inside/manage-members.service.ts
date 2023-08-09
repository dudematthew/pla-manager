import { Injectable } from "@nestjs/common";
import { handleAdminInsideAddUserDto } from "../commands/dtos/handle-inside-add-user.dto";

@Injectable()
export class manageMembersService {

    constructor () {

    }

    public async handleAdminAddMember (options: handleAdminInsideAddUserDto) {

    }
}
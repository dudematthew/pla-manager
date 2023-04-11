import { Param, ParamType } from '@discord-nestjs/core';

export class AddUserCommandDto {
    @Param ({
        description: 'Użytkownik',
        required: true,
        type: ParamType.USER,
    })
    user: string;
}
import { IsEmail, isString } from "class-validator";

export class RegisterUserDto {
    @IsEmail()
    email: string;
    
    // Discord id
    discordId: string;
}
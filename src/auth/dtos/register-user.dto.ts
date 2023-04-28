import { IsEmail, isString } from "class-validator";

export class RegisterUserDto {
    @IsEmail()
    email: string;
    
    // Discord id
    discord_id: string;
}
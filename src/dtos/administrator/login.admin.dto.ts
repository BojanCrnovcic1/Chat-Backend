import { IsNotEmpty, IsEmail, IsString } from "class-validator";
export class LoginAdminDto {

    @IsNotEmpty()
    @IsEmail({
        allow_ip_domain: false,
        allow_utf8_local_part: true,
        require_tld: true
    })
    email: string;

    @IsNotEmpty()
    @IsString()
    password: string;

    isAdmin?: boolean;
}
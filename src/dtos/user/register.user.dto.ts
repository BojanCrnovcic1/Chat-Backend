import {IsString, Length, IsNotEmpty, IsEmail, IsOptional, IsDate} from "class-validator";

export class RegisterUserDto {

    userId?: number;
    
    @IsString()
    @Length(3, 50)
    username: string;

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

    @IsOptional()
    @IsString()
    profilePicture: string | null

}
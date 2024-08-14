import Validator from "class-validator";

export class RegisterUserDto {
    
    @Validator.IsNotEmpty()
    @Validator.IsString()
    @Validator.Length(3, 50)
    username: string;

    @Validator.IsNotEmpty()
    @Validator.IsEmail({
        allow_ip_domain: false,
        allow_utf8_local_part: true,
        require_tld: true
    })
    email: string;

    @Validator.IsNotEmpty()
    @Validator.IsString()
    password: string;

    @Validator.IsOptional()
    @Validator.IsString()
    profilePicture: string | null
}
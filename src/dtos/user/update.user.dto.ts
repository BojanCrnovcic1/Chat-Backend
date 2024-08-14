import Validator from "class-validator";
export class UpdateUserDto {

    @Validator.IsNotEmpty()
    @Validator.IsString()
    @Validator.Length(3, 50)
    username: string;

    @Validator.IsNotEmpty()
    @Validator.IsString()
    password: string;

    @Validator.IsOptional()
    @Validator.IsString()
    prifilePicture: string | null
}
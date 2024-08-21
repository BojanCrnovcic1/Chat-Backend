import { IsNotEmpty, IsString, IsOptional, Length } from 'class-validator';

export class UpdateUserDto {
  
    @IsNotEmpty()
    @IsString()
    @Length(3, 50)
    username: string;

    @IsNotEmpty()
    @IsString()
    password: string;

    @IsOptional()
    @IsString()
    prifilePicture: string | null;
}

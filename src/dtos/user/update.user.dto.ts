import { IsNotEmpty, IsString, IsOptional, Length } from 'class-validator';

export class UpdateUserDto {
  
    @IsNotEmpty()
    @IsString()
    @Length(3, 50)
    username: string;

    @IsNotEmpty()
    @IsString()
    @Length(8, 255)
    password: string;

    @IsOptional()
    @IsString()
    profilePicture: string | null;

    onlineStatus: boolean;
}

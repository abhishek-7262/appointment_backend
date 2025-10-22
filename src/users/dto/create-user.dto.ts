import { IsEmail, IsNotEmpty, MinLength, Matches } from 'class-validator';

export class CreateUserDto {
    @IsNotEmpty({ message: 'Name is required' })
    name: string;

    @IsEmail({}, { message: 'Email must be a valid email address' })
    email: string;

    @MinLength(6, { message: 'Password must be at least 6 characters' })
    @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, {
        message:
            'Password must contain at least one uppercase letter, one number, and one special character',
    })
    password: string;
}

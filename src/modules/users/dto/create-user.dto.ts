import { IsEmail, IsNotEmpty } from "class-validator";

export class CreateUserDto {
    @IsNotEmpty({ message: "name is not empty" })
    name: string;
    @IsEmail({}, { message: 'Invalid email message' })
    email: string;
    @IsNotEmpty()
    password: string;
    phone: string;
    address: string;
    image: string;
    role: string;
}

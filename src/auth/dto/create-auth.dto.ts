import { IsNotEmpty, IsOptional } from "class-validator";

export class CreateAuthDto {
    @IsNotEmpty({ message: "Email is not empty!" })
    email: string;
    @IsNotEmpty({ message: "password is not empty!" })
    password: string;

    @IsOptional()
    name: string;
}

export class CodeAuthDto {
    @IsNotEmpty({ message: "_id is not empty!" })
    _id: string;
    @IsNotEmpty({ message: "code is not empty!" })
    code: string;
}


export class ChangePasswordAuthDto {
    @IsNotEmpty({ message: "_id is not empty!" })
    code: string;
    @IsNotEmpty({ message: "Email is not empty!" })
    email: string;
    @IsNotEmpty({ message: "Password is not empty!" })
    password: string;
    @IsNotEmpty({ message: "Confirm Password is not empty!" })
    confirmPassword: string;
}





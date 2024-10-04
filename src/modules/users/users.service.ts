import { BadGatewayException, BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { hashPasswordHelper } from 'src/helpers/utils';
import aqp from 'api-query-params';
import mongoose from 'mongoose';
import { CreateAuthDto } from 'src/auth/dto/create-auth.dto';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>,
    private readonly mailerService: MailerService) { }


  isEmailExist = async (email: string) => {
    const user = await this.userModel.exists({ email: email });
    if (user) return true;
    return false;
  }
  async create(createUserDto: CreateUserDto) {
    const { name, email, password } = createUserDto;

    //check email exist 
    const isExist = await this.isEmailExist(email);
    if (isExist) {
      throw new BadRequestException(`Email ${email} already exists, please use another email`)
    }
    //hash password
    const hashPassword = await hashPasswordHelper(password);
    const user = await this.userModel.create({
      name, email, password: hashPassword
    })
    return {
      _id: user._id
    }
  }

  async findAll(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query);
    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;

    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (current - 1) * (pageSize);
    const results = await this.userModel
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .select("-password")
      .sort(sort as any)

    return { results, totalPages };
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  async findByEmail(email: string) {
    return await this.userModel.findOne({ email })
  }

  async update(updateUserDto: UpdateUserDto) {
    return await this.userModel.updateOne(
      { _id: updateUserDto._id },
      { ...updateUserDto }
    )
  }

  async remove(_id: string) {
    //check id 
    if (mongoose.isValidObjectId(_id)) {
      //delete
      return this.userModel.deleteOne({ _id })
    } else {
      throw new BadRequestException("Invalid id")
    }
  }

  async handleRegister(registerDto: CreateAuthDto) {
    const { name, email, password } = registerDto;

    //check email exist 
    const isExist = await this.isEmailExist(email);
    if (isExist) {
      throw new BadRequestException(`Email ${email} already exists, please use another email`)
    }
    //hash password
    const hashPassword = await hashPasswordHelper(password);
    const codeId = uuidv4();
    const user = await this.userModel.create({
      name, email, password: hashPassword,
      isActive: false,
      codeId: codeId,
      // codeExpired: dayjs().add(5, "minutes")
      codeExpired: dayjs().add(30, 'seconds')
    })

    //sendemail
    this.mailerService
      .sendMail({
        to: user.email,
        subject: 'Activate your account at Phat Ngo',
        template: "register.hbs",
        context: {
          name: user.name ?? user.email,
          activationCode: codeId
        }
      })
      .then(() => { })
      .catch(() => { });
    return "ok";

    //reponse
  }
}


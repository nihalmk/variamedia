
import { Resolver, Arg, Mutation, Query, Ctx, Authorized } from "type-graphql";
import { signJWT } from "../shared/sign-jwt.function";
import { hash, compare } from "bcrypt";
import { plainToClass } from "class-transformer";

import { User, UserModel } from "./user.model";
import { AuthPayload } from "./types/auth-output.type";

import { IContext } from "../shared/context/context.interface";
import { dot } from "dot-object";

import { LoginInput } from "./types/login-input.type";
import { SignupInput } from "./types/signup-input.type";
import { ProfileInput } from "./types/profile-input.type";

import { sendMail } from "../shared/mail.function";
import { stringToken } from "string-token";

@Resolver()
export class UserResolver {

  @Query()
  public currentDate(): Date {
    return new Date();
  }
  // User Signup Mutation
  @Mutation((_) => Boolean)
  public async signup(@Arg("params") params: SignupInput): Promise<boolean> {

    const passwordHash = await hash(params.password, 10);
    const token = await stringToken(64);
    const newParams: Partial<User> = {
      email: params.email,
      passwordHash,
      emailVerifyToken: token,
    };
    const exist_user = await UserModel.findOne({ email: params.email } as User);

    if (exist_user) {
      throw new Error("Same email address already exists");
    }
    const new_user = new UserModel(newParams);
    try {
      await new_user.save();
      const mailOptions = {
        from: process.env.MAIL_SENDER,
        to: new_user.email,
        subject: "Varia Signup Confirmation",
        html: `Please click here to verify your email
          <a href="https://varia.media/verify-email/${token}"> Click here </a>`,
      };
      await sendMail(mailOptions);
      return true;
    } catch (e) {
      throw Error(e);
    }
  }

  // User Email Verify Mutation
  @Mutation((_) => Boolean)
  public async verifyEmail(@Arg("emailVerifyToken") emailVerifyToken: string): Promise<boolean> {
    const user = await UserModel.findOne({ emailVerifyToken });
    if (!user) {
      throw new Error("Invalid Token");
    }
    user.emailVerifyToken = undefined;
    try {
      await user.save();
      return true;
    } catch (e) {
      console.log(e);
      throw Error(e);
    }
  }

  // User Login Mutation
  @Mutation((_) => AuthPayload)
  public async login(@Arg("params") params: LoginInput): Promise<AuthPayload> {

    const user = await UserModel.findOne({ email: params.email });
    if (!user) {
      throw new Error("Invalid email address or password");
    }
    const valid = await compare(params.password, user.passwordHash);
    if (!valid) {
      throw new Error("Invalid email address or password");
    }

    if (user.emailVerifyToken) {
      throw new Error("Email not verified yet");
    }

    const { _id, ...user_body } = user.toObject();

    user_body._id = user.id;
    const user_data = plainToClass(User, user_body);
    const userwithtoken = plainToClass(AuthPayload, {
      user: user_data,
      token: signJWT({ _id: user_body._id, role: user_body.role }),
    });
    return userwithtoken;
  }

  // User forgot password recover email sending Mutation
  @Mutation((_) => Boolean)
  public async sendPasswordRecoverEmail(@Arg("email") email: string): Promise<boolean> {

    const token = await stringToken(64);
    const exist_user = await UserModel.findOne({ email } as User);

    if (!exist_user) {
      throw new Error("No user with such email");
    }
    exist_user.passwordResetToken = token;
    const expires = new Date();
    expires.setHours(expires.getHours() + 1);
    exist_user.passwordResetExpires = expires;

    try {
      await exist_user.save();
      const mailOptions = {
        from: process.env.MAIL_SENDER,
        to: exist_user.email,
        subject: "Varia Password Forget Token",
        html: `Please click here to recover password
          <a href="https://varia.media/verify-email/${token}"> Click here </a>`,
      };
      await sendMail(mailOptions);
      return true;
    } catch (e) {
      console.log(e);
      throw Error(e);
    }
  }

  // User forgot password recover Mutation
  @Mutation((_) => Boolean)
  public async recoverPassword(
    @Arg("passwordResetToken") passwordResetToken: string,
    @Arg("newPassword") newPassword: string): Promise<boolean> {

    const exist_user = await UserModel.findOne({ passwordResetToken } as User);

    if (!exist_user) {
      throw new Error("Invalid token");
    }

    const expires = new Date();
    if (exist_user.passwordResetExpires < expires) {
      throw new Error("Expired token");
    }

    exist_user.passwordResetToken = undefined;
    exist_user.passwordResetExpires = undefined;

    exist_user.passwordHash = await hash(newPassword, 10);
    try {
      await exist_user.save();
      return true;
    } catch (e) {
      console.log(e);
      throw new Error("Cannot Update Password!");
    }
  }

  // User password change Mutation
  @Authorized()
  @Mutation((_) => Boolean)
  public async changePassword(
    @Arg("new_password") NewPassword: string,
    @Ctx() { user }: IContext): Promise<boolean> {
    const userId = user._id;
    const _user = await UserModel.findOne({ _id: userId });
    if (!_user) {
      throw new Error(`No such user found`);
    }
    _user.passwordHash = await hash(NewPassword, 10);
    try {
      await _user.save();
      return true;
    } catch (e) {
      console.log(e);
      throw new Error("Cannot Update Password!");
    }
  }

  // User Update profile Mutation
  @Authorized()
  @Mutation((_) => User)
  public async updateProfile(@Arg("params") params: ProfileInput, @Ctx() { user }: IContext): Promise<User> {
    const userId = user._id;
    const _user = await UserModel.findOne({ _id: userId });
    if (!_user) {
      throw new Error(`No such user found`);
    }
    _user.set(dot(params));
    try {

      await _user.save();
      const { _id, passwordHash, ...user_body } = _user.toObject();

      user_body._id = _user.id;
      const userdata = plainToClass(User, user_body as User);
      return userdata;
    } catch (e) {
      console.log(e);
      throw new Error("Cannot Update Profile!");
    }
  }

  // User profile Query
  @Authorized()
  @Query((_) => User)
  public async profile(@Ctx() { user }: IContext): Promise<User> {
    const userId = user._id;
    const _user = await UserModel.findOne({ _id: userId });
    if (!_user) {
      throw new Error(`No such user found`);
    }
    const { _id, passwordHash, ...user_body } = _user.toObject();
    user_body._id = _user.id;
    const userdata = plainToClass(User, user_body as User);
    return userdata;
  }
}

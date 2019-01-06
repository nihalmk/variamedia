
import { Field, ID, ObjectType, Int } from "type-graphql";
import { prop, Typegoose } from "typegoose";

import { Address } from "./address.model";
import { Min } from "class-validator";
import { Role } from "./role.enum";

@ObjectType({ description: "The user model" })
export class User extends Typegoose {

  @Field((_) => ID)
  public _id: string;

  @Field({ nullable: true })
  @prop()
  public address?: Address;

  @Field()
  public createdAt: Date;

  @Field()
  public updatedAt: Date;

  @Field({ nullable: true })
  @prop()
  public firstName?: string;

  @Field({ nullable: true })
  @prop()
  public lastName?: string;

  @Field()
  @prop({ required: true, unique: true })
  public email: string;

  @prop({ required: true })
  public passwordHash: string;

  @Field((_) => Role)
  @prop({ enum: Role, default: Role.User })
  public role: Role;

  @Field((_) => Int)
  @Min(0)
  @prop({ min: 0, default: 0 })
  public creditAccount: number;

  @Field({ nullable: true })
  @prop()
  public dateOfBirth?: Date;

  @prop()
  public emailVerifyToken?: string;

  @prop()
  public passwordResetToken?: string;

  @prop()
  public passwordResetExpires?: Date;
}

export const UserModel = new User().getModelForClass(User, { schemaOptions: { timestamps: true } });

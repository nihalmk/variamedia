import { Field, InputType } from "type-graphql";
import { User } from "../user.model";
import { Address } from "../address.model";

@InputType({ description: "Update profile Input" })
export class ProfileInput implements Partial<User> {
  @Field({ nullable: true })
  public address?: Address;

  @Field({ nullable: true })
  public firstName?: string;

  @Field({ nullable: true })
  public lastName?: string;

  @Field({ nullable: true })
  public dateOfBirth?: Date;

}

import { Field, InputType } from "type-graphql";
import { User } from "../user.model";

@InputType({ description: "Login Input" })
export class LoginInput implements Partial<User> {
  @Field()
  public email: string;

  @Field()
  public password: string;
}

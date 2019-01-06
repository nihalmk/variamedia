import { InputType } from "type-graphql";
import { LoginInput } from "./login-input.type";

@InputType({ description: "Sign up Input" })
export class SignupInput extends LoginInput {
}

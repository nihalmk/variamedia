
import { Field, ObjectType } from "type-graphql";
import { User } from "../user.model";

@ObjectType({ description: "The AuthPayLoad type" })
export class AuthPayload {
    @Field()
    public token: string;

    @Field()
    public user: User;
}

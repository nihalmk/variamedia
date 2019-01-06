import { Type } from "class-transformer";
import { Field, ObjectType } from "type-graphql";
import { PaginationEdge } from "../../shared/pagination/pagination-edge.type";
import { User } from "../user.model";

@ObjectType({ description: "pagination edge for user" })
export class UserPaginationEdge extends PaginationEdge {
    @Field()
    @Type((_) => User)
    public node: User;
}

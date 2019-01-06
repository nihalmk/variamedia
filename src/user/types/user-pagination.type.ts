
import { Field, ObjectType } from "type-graphql";
import { PaginationOutput } from "../../shared/pagination/pagination-output.type";
import { UserPaginationEdge } from "./user-pagination-edge.type";
import { Type } from "class-transformer";

@ObjectType({ description: "User Pagination Output" })
export class Users extends PaginationOutput {
  @Field((_) => [UserPaginationEdge])
  @Type((_) => UserPaginationEdge)
  public edges: UserPaginationEdge[];
}

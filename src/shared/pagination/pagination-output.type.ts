import { PaginationEdge } from "./pagination-edge.type";
import { PaginationPageInfo } from "./pagination-page-info.type";
import { Field, ObjectType, Int } from "type-graphql";

@ObjectType({ description: "Pagination output" })
export abstract class PaginationOutput {
  @Field(((_) => Int))
  public totalCount: number;

  public abstract edges: PaginationEdge[];

  @Field()
  public pageInfo: PaginationPageInfo;
}

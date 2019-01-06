
import { Field, ObjectType } from "type-graphql";

@ObjectType({ description: "Pagination edge" })
export abstract class PaginationEdge {
  public abstract node: any;

  @Field()
  public cursor: string;
}

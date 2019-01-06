import { Field, ObjectType } from "type-graphql";

@ObjectType({ description: "The Pagination Page info" })
export class PaginationPageInfo {
  @Field()
  public endCursor: string;

  @Field()
  public hasNextPage: boolean;
}

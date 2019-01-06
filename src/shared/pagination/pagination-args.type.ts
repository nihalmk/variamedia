import { Min } from "class-validator";
import { ArgsType, Field, Int } from "type-graphql";
import { SortOrder } from "./sort-order.enum";

@ArgsType()
export class PaginationArgs {
  @Field((_) => Int, { description: "First mustn't be less than 0" })
  @Min(0)
  public first: number;

  @Field({ nullable: true })
  public after?: string;

  @Field({ nullable: true, description: "If not set, sorted by order of creation" })
  public sortBy?: string = "_id";

  @Field((_) => SortOrder, { nullable: true, description: "Default is ascending" })
  public sortOrder?: SortOrder = SortOrder.ASC;
}

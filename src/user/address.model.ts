
import { Field, ObjectType, InputType } from "type-graphql";

@InputType("AddressInput", { description: "Address Input" })
@ObjectType({ description: "The address type" })
export class Address {

  @Field({ nullable: true })
  public city?: string;

  @Field({ nullable: true })
  public company?: string;

  @Field({ nullable: true })
  public country?: string;

  @Field({ nullable: true })
  public street?: string;

  @Field({ nullable: true })
  public zipCode?: string;
}

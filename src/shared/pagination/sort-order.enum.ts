import { registerEnumType } from "type-graphql";

export enum SortOrder {
    ASC = 1,
    DESC = -1,
}

registerEnumType(SortOrder, {
    name: "SortOrder",
    description: "SortOrder Enum",
});
